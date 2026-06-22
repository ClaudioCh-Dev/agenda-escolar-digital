import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserPermissionView } from './entities/user-permission.view';
import { UserRoleEntity } from './entities/user-role.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { IamService } from './iam.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
      RoleEntity,
      RolePermissionEntity,
      UserRoleEntity,
      UserPermissionView,
    ]),
  ],
  providers: [IamService, PermissionsGuard],
  exports: [TypeOrmModule, IamService, PermissionsGuard],
})
export class IamModule {}
