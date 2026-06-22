import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({ name: 'v_user_permissions' })
export class UserPermissionView {
  @ViewColumn({ name: 'user_id' })
  userId!: string;

  @ViewColumn({ name: 'role_code' })
  roleCode!: string;

  @ViewColumn({ name: 'permission_code' })
  permissionCode!: string;

  @ViewColumn()
  module!: string;
}
