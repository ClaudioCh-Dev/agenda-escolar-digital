import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SectionEntity } from '../../schools/entities/section.entity';
import { ParentStudentEntity } from './parent-student.entity';
import { UserEntity } from './user.entity';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => SectionEntity, (section) => section.students)
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity;

  @OneToOne(() => UserEntity, (user) => user.student)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(
    () => ParentStudentEntity,
    (parentStudent) => parentStudent.student,
  )
  parentStudents: ParentStudentEntity[];
}
