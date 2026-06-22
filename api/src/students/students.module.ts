import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessModule } from '../shared/access/access.module';
import { ParentStudentEntity } from '../users/entities/parent-student.entity';
import { StudentEntity } from '../users/entities/student.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ParentsController } from './parents.controller';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [
    AccessModule,
    TypeOrmModule.forFeature([StudentEntity, UserEntity, ParentStudentEntity]),
  ],
  controllers: [StudentsController, ParentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
