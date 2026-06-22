import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CalendarEventEntity } from '../../calendar/entities/calendar-event.entity';
import { EntryEntity } from '../../entries/entities/entry.entity';
import type { AttachmentFileType } from '../../shared/database/enums';

// PostgreSQL CHECK: entry_id IS NOT NULL OR calendar_event_id IS NOT NULL
@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entry_id', type: 'uuid', nullable: true })
  entryId: string | null;

  @Column({ name: 'calendar_event_id', type: 'uuid', nullable: true })
  calendarEventId: string | null;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'size_label', type: 'text' })
  sizeLabel: string;

  @Column({ name: 'file_type', type: 'text' })
  fileType: AttachmentFileType;

  @Column({ name: 'storage_url', type: 'text' })
  storageUrl: string;

  @Column({ name: 'cloudinary_public_id', type: 'text', nullable: true })
  cloudinaryPublicId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => EntryEntity, { nullable: true })
  @JoinColumn({ name: 'entry_id' })
  entry: EntryEntity | null;

  @ManyToOne(
    () => CalendarEventEntity,
    (calendarEvent) => calendarEvent.attachments,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'calendar_event_id' })
  calendarEvent: CalendarEventEntity | null;
}
