import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionEntity } from '../../schools/entities/section.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { EntryVisibilityService } from './entry-visibility.service';
import { SectionScopeService } from './section-scope.service';
import { UserScopeService } from './user-scope.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SectionEntity])],
  providers: [UserScopeService, SectionScopeService, EntryVisibilityService],
  exports: [UserScopeService, SectionScopeService, EntryVisibilityService],
})
export class AccessModule {}
