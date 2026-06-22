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
import type { AttachmentEntity } from '../../attachments/entities/attachment.entity';
import { EntryEntity } from '../../entries/entities/entry.entity';
import { SchoolEntity } from '../../schools/entities/school.entity';
import { SectionEntity } from '../../schools/entities/section.entity';
import type { CalendarEventType } from '../../shared/database/enums';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('calendar_events')
export class CalendarEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId: string | null;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId: string | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: string;

  @Column({ name: 'event_time', type: 'time', nullable: true })
  eventTime: string | null;

  @Column({ type: 'text' })
  type: CalendarEventType;

  @Column({ name: 'entry_id', type: 'uuid', nullable: true, unique: true })
  entryId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => SchoolEntity)
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @ManyToOne(() => SectionEntity, { nullable: true })
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity | null;

  @OneToOne(() => EntryEntity, (entry) => entry.calendarEvent, {
    nullable: true,
  })
  @JoinColumn({ name: 'entry_id' })
  entry: EntryEntity | null;

  @OneToMany('AttachmentEntity', 'calendarEvent')
  attachments: AttachmentEntity[];
}
