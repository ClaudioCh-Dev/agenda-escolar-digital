import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../iam/entities/role.entity';
import { UserRoleEntity } from '../iam/entities/user-role.entity';
import { IamModule } from '../iam/iam.module';
import { SchoolsModule } from '../schools/schools.module';
import { ParentStudentEntity } from './entities/parent-student.entity';
import { StudentEntity } from './entities/student.entity';
import { UserSectionEntity } from './entities/user-section.entity';
import { UserSedeEntity } from './entities/user-sede.entity';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    SchoolsModule,
    IamModule,
    TypeOrmModule.forFeature([
      UserEntity,
      StudentEntity,
      ParentStudentEntity,
      UserSedeEntity,
      UserSectionEntity,
      RoleEntity,
      UserRoleEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
