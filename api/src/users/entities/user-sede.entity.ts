import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SedeEntity } from '../../schools/entities/sede.entity';
import { UserEntity } from './user.entity';

@Entity('user_sedes')
export class UserSedeEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'sede_id', type: 'uuid' })
  sedeId: string;

  @ManyToOne(() => UserEntity, (user) => user.userSedes)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => SedeEntity, (sede) => sede.userSedes)
  @JoinColumn({ name: 'sede_id' })
  sede: SedeEntity;
}
