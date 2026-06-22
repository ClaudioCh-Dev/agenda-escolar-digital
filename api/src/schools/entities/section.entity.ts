import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StudentEntity } from '../../users/entities/student.entity';
import { UserSectionEntity } from '../../users/entities/user-section.entity';
import { SedeEntity } from './sede.entity';

@Entity('sections')
export class SectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sede_id', type: 'uuid' })
  sedeId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  grade: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => SedeEntity, (sede) => sede.sections)
  @JoinColumn({ name: 'sede_id' })
  sede: SedeEntity;

  @OneToMany(() => UserSectionEntity, (userSection) => userSection.section)
  userSections: UserSectionEntity[];

  @OneToMany(() => StudentEntity, (student) => student.section)
  students: StudentEntity[];
}
