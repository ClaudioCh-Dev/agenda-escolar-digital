import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { UserPermissionView } from './entities/user-permission.view';
import { IamService } from './iam.service';

describe('IamService', () => {
  let service: IamService;
  let repository: jest.Mocked<Repository<UserPermissionView>>;

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserPermissionView>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IamService,
        {
          provide: getRepositoryToken(UserPermissionView),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(IamService);
  });

  it('returns unique permission codes for a user', async () => {
    repository.find.mockResolvedValue([
      { permissionCode: 'entries.read' } as UserPermissionView,
      { permissionCode: 'entries.create' } as UserPermissionView,
    ]);

    const permissions = await service.getUserPermissions('user-1');

    expect(permissions.has('entries.read')).toBe(true);
    expect(permissions.has('entries.create')).toBe(true);
    expect(permissions.size).toBe(2);
  });
});
