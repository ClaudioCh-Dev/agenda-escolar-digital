import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshTokenEntity } from '../../auth/entities/refresh-token.entity';
import { UserRoleEntity } from '../../iam/entities/user-role.entity';
import { SedeEntity } from '../../schools/entities/sede.entity';
import { SchoolEntity } from '../../schools/entities/school.entity';
import type { UserType } from '../../shared/database/enums';
import { ParentStudentEntity } from './parent-student.entity';
import { StudentEntity } from './student.entity';
import { UserSectionEntity } from './user-section.entity';
import { UserSedeEntity } from './user-sede.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ name: 'user_type', type: 'text' })
  userType: UserType;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'primary_sede_id', type: 'uuid', nullable: true })
  primarySedeId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => SchoolEntity, (school) => school.users)
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @ManyToOne(() => SedeEntity, (sede) => sede.primaryUsers, { nullable: true })
  @JoinColumn({ name: 'primary_sede_id' })
  primarySede: SedeEntity | null;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles: UserRoleEntity[];

  @OneToMany(() => UserSectionEntity, (userSection) => userSection.user)
  userSections: UserSectionEntity[];

  @OneToMany(() => UserSedeEntity, (userSede) => userSede.user)
  userSedes: UserSedeEntity[];

  @OneToOne(() => StudentEntity, (student) => student.user)
  student: StudentEntity | null;

  @OneToMany(() => ParentStudentEntity, (parentStudent) => parentStudent.parent)
  parentStudents: ParentStudentEntity[];

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  refreshTokens: RefreshTokenEntity[];
}
