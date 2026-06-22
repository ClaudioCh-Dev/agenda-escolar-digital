import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, IsNull, Repository } from 'typeorm';
import { RoleEntity } from '../iam/entities/role.entity';
import { UserRoleEntity } from '../iam/entities/user-role.entity';
import {
  buildInitials,
  resolvePrimaryRole,
} from '../shared/access/access.utils';
import { NotFoundException } from '../shared/exception/not-found.exception';
import { UserNotFoundException } from '../shared/exception/user-not-found.exception';
import type { UserType } from '../shared/database/enums';
import {
  CreateUserDto,
  UpdateUserDto,
  UserAdminResponseDto,
} from './dto/user-admin.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { ParentStudentEntity } from './entities/parent-student.entity';
import { StudentEntity } from './entities/student.entity';
import { UserSectionEntity } from './entities/user-section.entity';
import { UserEntity } from './entities/user.entity';

const ROLE_PRIORITY = ['direccion', 'auxiliar', 'profesor', 'padre', 'alumno'];
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRolesRepository: Repository<UserRoleEntity>,
    @InjectRepository(UserSectionEntity)
    private readonly userSectionsRepository: Repository<UserSectionEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentsRepository: Repository<StudentEntity>,
    @InjectRepository(ParentStudentEntity)
    private readonly parentStudentsRepository: Repository<ParentStudentEntity>,
  ) {}

  async findByCode(code: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { code: code.toLowerCase() },
      relations: {
        school: true,
        primarySede: true,
        userRoles: { role: true },
        userSections: { section: { sede: true } },
        userSedes: { sede: true },
        student: { section: { sede: true } },
        parentStudents: { student: { user: true, section: { sede: true } } },
      },
    });
  }

  async findActiveById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id, isActive: true },
      relations: {
        userRoles: { role: true },
      },
    });
  }

  async findProfileById(id: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        primarySede: true,
        userRoles: { role: true },
        userSections: { section: { sede: true } },
        userSedes: { sede: true },
        student: { section: { sede: true } },
        parentStudents: { student: { user: true, section: { sede: true } } },
      },
    });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return this.toProfileDto(user);
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, { passwordHash });
  }

  toProfileDto(user: UserEntity): UserProfileDto {
    const roles = user.userRoles?.map((ur) => ur.role.code) ?? [];
    const primaryRole = this.resolvePrimaryRole(roles);

    const sections =
      user.userSections?.map((us) => us.section.name) ??
      (user.student?.section ? [user.student.section.name] : undefined);

    const sedes =
      user.userSedes?.map((us) => us.sede.name) ??
      (user.primarySede ? [user.primarySede.name] : undefined) ??
      (user.student?.section?.sede
        ? [user.student.section.sede.name]
        : undefined);

    const section = user.student?.section?.name ?? sections?.[0];
    const sede =
      user.primarySede?.name ?? user.student?.section?.sede?.name ?? sedes?.[0];

    const children = user.parentStudents?.map((ps) => ({
      id: ps.student.id,
      name: ps.student.user.name,
      section: ps.student.section.name,
      grade: ps.student.section.grade ?? '',
      initials: this.buildInitials(ps.student.user.name),
      avatar: ps.student.user.avatarUrl ?? undefined,
    }));

    return {
      id: user.id,
      name: user.name,
      code: user.code,
      userType: user.userType,
      role: primaryRole,
      roles,
      avatar: user.avatarUrl ?? undefined,
      initials: this.buildInitials(user.name),
      section,
      sections,
      sede,
      sedes,
      children: children?.length ? children : undefined,
    };
  }

  getRoleCodes(user: UserEntity): string[] {
    return user.userRoles?.map((ur) => ur.role.code) ?? [];
  }

  async listBySchool(schoolId: string): Promise<UserAdminResponseDto[]> {
    const users = await this.usersRepository.find({
      where: { schoolId },
      relations: { userRoles: { role: true } },
      order: { name: 'ASC' },
    });

    return users.map((user) => this.toAdminDto(user));
  }

  async createUser(
    schoolId: string,
    dto: CreateUserDto,
  ): Promise<UserAdminResponseDto> {
    const code = (dto.code ?? this.generateCode(dto.userType)).toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        schoolId,
        code,
        userType: dto.userType,
        passwordHash,
        name: dto.name,
      }),
    );

    await this.syncRoles(user.id, dto.roleCodes);
    if (dto.sectionIds?.length) {
      await this.syncSections(user.id, dto.sectionIds);
    }

    if (dto.userType === 'student' && dto.sectionId) {
      await this.studentsRepository.save(
        this.studentsRepository.create({
          schoolId,
          sectionId: dto.sectionId,
          userId: user.id,
        }),
      );
    }

    if (dto.userType === 'parent' && dto.childStudentIds?.length) {
      await this.parentStudentsRepository.save(
        dto.childStudentIds.map((studentId) =>
          this.parentStudentsRepository.create({
            parentId: user.id,
            studentId,
          }),
        ),
      );
    }

    return this.toAdminDto(await this.findUserWithRoles(user.id));
  }

  async updateUser(
    schoolId: string,
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserAdminResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, schoolId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    await this.usersRepository.save(user);

    if (dto.roleCodes) {
      await this.syncRoles(userId, dto.roleCodes);
    }

    if (dto.sectionIds) {
      await this.syncSections(userId, dto.sectionIds);
    }

    return this.toAdminDto(await this.findUserWithRoles(userId));
  }

  async deactivateUser(schoolId: string, userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, schoolId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    await this.usersRepository.save(user);
  }

  private async findUserWithRoles(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { userRoles: { role: true } },
    });

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return user;
  }

  private async syncRoles(userId: string, roleCodes: string[]): Promise<void> {
    await this.userRolesRepository.delete({ userId });
    const roles = await this.rolesRepository.find({
      where: { code: In(roleCodes), schoolId: IsNull() },
    });

    if (roles.length) {
      await this.userRolesRepository.save(
        roles.map((role) =>
          this.userRolesRepository.create({ userId, roleId: role.id }),
        ),
      );
    }
  }

  private async syncSections(
    userId: string,
    sectionIds: string[],
  ): Promise<void> {
    await this.userSectionsRepository.delete({ userId });
    if (sectionIds.length) {
      await this.userSectionsRepository.save(
        sectionIds.map((sectionId) =>
          this.userSectionsRepository.create({ userId, sectionId }),
        ),
      );
    }
  }

  private toAdminDto(user: UserEntity): UserAdminResponseDto {
    const roles = user.userRoles?.map((ur) => ur.role.code) ?? [];
    return {
      id: user.id,
      name: user.name,
      code: user.code,
      userType: user.userType,
      role: resolvePrimaryRole(roles),
      roles,
      isActive: user.isActive,
      avatar: user.avatarUrl ?? undefined,
      initials: buildInitials(user.name),
    };
  }

  private generateCode(userType: UserType): string {
    const prefix =
      userType === 'student' ? 'e' : userType === 'parent' ? 'p' : 't';
    const suffix = Math.floor(Math.random() * 100_000_000)
      .toString()
      .padStart(8, '0');
    return `${prefix}${suffix}`;
  }

  private resolvePrimaryRole(roles: string[]): string {
    for (const code of ROLE_PRIORITY) {
      if (roles.includes(code)) {
        return code;
      }
    }

    return roles[0] ?? 'auxiliar';
  }

  private buildInitials(name: string): string {
    return buildInitials(name);
  }
}
