import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { UserSedeEntity } from '../../users/entities/user-sede.entity';
import { SchoolEntity } from './school.entity';
import { SectionEntity } from './section.entity';

@Entity('sedes')
export class SedeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => SchoolEntity)
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @OneToMany(() => SectionEntity, (section) => section.sede)
  sections: SectionEntity[];

  @OneToMany(() => UserSedeEntity, (userSede) => userSede.sede)
  userSedes: UserSedeEntity[];

  @OneToMany(() => UserEntity, (user) => user.primarySede)
  primaryUsers: UserEntity[];
}
