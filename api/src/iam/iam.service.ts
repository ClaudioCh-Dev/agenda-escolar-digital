import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermissionView } from './entities/user-permission.view';

@Injectable()
export class IamService {
  constructor(
    @InjectRepository(UserPermissionView)
    private readonly permissionsRepository: Repository<UserPermissionView>,
  ) {}

  async getUserPermissions(userId: string): Promise<Set<string>> {
    const rows = await this.permissionsRepository.find({
      where: { userId },
      select: { permissionCode: true },
    });

    return new Set(rows.map((row) => row.permissionCode));
  }

  async hasPermission(
    userId: string,
    permissionCode: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.has(permissionCode);
  }
}
