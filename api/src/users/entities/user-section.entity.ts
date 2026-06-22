import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SectionEntity } from '../../schools/entities/section.entity';
import { UserEntity } from './user.entity';

@Entity('user_sections')
export class UserSectionEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  @ManyToOne(() => UserEntity, (user) => user.userSections)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => SectionEntity, (section) => section.userSections)
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity;
}
