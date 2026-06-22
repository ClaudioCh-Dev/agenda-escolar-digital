import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { EntryEntity } from './entry.entity';

@Entity('entry_reads')
export class EntryReadEntity {
  @PrimaryColumn({ name: 'entry_id', type: 'uuid' })
  entryId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ name: 'read_at', type: 'timestamptz' })
  readAt: Date;

  @ManyToOne(() => EntryEntity, (entry) => entry.entryReads)
  @JoinColumn({ name: 'entry_id' })
  entry: EntryEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
