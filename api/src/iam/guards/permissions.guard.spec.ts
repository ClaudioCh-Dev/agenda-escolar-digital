import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IamService } from '../iam.service';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let iamService: jest.Mocked<IamService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    iamService = {
      getUserPermissions: jest.fn(),
      hasPermission: jest.fn(),
    };

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new PermissionsGuard(reflector, iamService);
  });

  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { userId: 'user-1', schoolId: 'school-1', roles: ['auxiliar'] },
      }),
    }),
  } as unknown as ExecutionContext;

  it('allows public routes without checking permissions', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'isPublic') return true;
      return undefined;
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(iamService.getUserPermissions.mock.calls).toHaveLength(0);
  });

  it('allows routes without required permission metadata', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'isPublic') return false;
      if (key === 'permissions') return undefined;
      return undefined;
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('checks permission when metadata is present', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'isPublic') return false;
      if (key === 'permissions') return ['entries.read'];
      return undefined;
    });
    iamService.getUserPermissions.mockResolvedValue(
      new Set(['entries.read', 'entries.create']),
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
