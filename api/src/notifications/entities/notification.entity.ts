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
import type { NotificationCategory } from '../../shared/database/enums';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', default: 'info' })
  category: NotificationCategory;

  @Column({ name: 'entry_id', type: 'uuid', nullable: true })
  entryId: string | null;

  @Column({ name: 'calendar_event_id', type: 'uuid', nullable: true })
  calendarEventId: string | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => EntryEntity, { nullable: true })
  @JoinColumn({ name: 'entry_id' })
  entry: EntryEntity | null;

  @ManyToOne(() => CalendarEventEntity, { nullable: true })
  @JoinColumn({ name: 'calendar_event_id' })
  calendarEvent: CalendarEventEntity | null;
}
