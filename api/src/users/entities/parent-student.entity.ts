import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { StudentEntity } from './student.entity';
import { UserEntity } from './user.entity';

@Entity('parent_students')
export class ParentStudentEntity {
  @PrimaryColumn({ name: 'parent_id', type: 'uuid' })
  parentId!: string;

  @PrimaryColumn({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, (user) => user.parentStudents)
  @JoinColumn({ name: 'parent_id' })
  parent!: UserEntity;

  @ManyToOne(() => StudentEntity, (student) => student.parentStudents)
  @JoinColumn({ name: 'student_id' })
  student!: StudentEntity;
}
