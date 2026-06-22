import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { StudentEntity } from '../../users/entities/student.entity';
import { EntryEntity } from './entry.entity';

@Entity('entry_students')
export class EntryStudentEntity {
  @PrimaryColumn({ name: 'entry_id', type: 'uuid' })
  entryId: string;

  @PrimaryColumn({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => EntryEntity, (entry) => entry.entryStudents)
  @JoinColumn({ name: 'entry_id' })
  entry: EntryEntity;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;
}
