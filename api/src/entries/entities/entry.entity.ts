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
import { AttachmentEntity } from '../../attachments/entities/attachment.entity';
import type { CalendarEventEntity } from '../../calendar/entities/calendar-event.entity';
import { SchoolEntity } from '../../schools/entities/school.entity';
import { SectionEntity } from '../../schools/entities/section.entity';
import type { EntryType } from '../../shared/database/enums';
import { UserEntity } from '../../users/entities/user.entity';
import { EntryReadEntity } from './entry-read.entity';
import { EntryStudentEntity } from './entry-student.entity';

@Entity('entries')
export class EntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  type: EntryType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: string;

  @Column({ name: 'entry_time', type: 'time', default: '08:00' })
  entryTime: string;

  @Column({ name: 'is_important', type: 'boolean', default: false })
  isImportant: boolean;

  @Column({ name: 'parents_only', type: 'boolean', default: false })
  parentsOnly: boolean;

  @Column({ name: 'requires_ack', type: 'boolean', default: false })
  requiresAck: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => SchoolEntity)
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @ManyToOne(() => SectionEntity)
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @OneToMany(() => EntryStudentEntity, (entryStudent) => entryStudent.entry)
  entryStudents: EntryStudentEntity[];

  @OneToMany(() => EntryReadEntity, (entryRead) => entryRead.entry)
  entryReads: EntryReadEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.entry)
  attachments: AttachmentEntity[];

  @OneToOne('CalendarEventEntity', 'entry')
  calendarEvent: CalendarEventEntity | null;
}
