import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessModule } from '../shared/access/access.module';
import { SchoolEntity } from './entities/school.entity';
import { SectionEntity } from './entities/section.entity';
import { SedeEntity } from './entities/sede.entity';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

@Module({
  imports: [
    AccessModule,
    TypeOrmModule.forFeature([SchoolEntity, SedeEntity, SectionEntity]),
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [TypeOrmModule, SectionsService],
})
export class SchoolsModule {}
