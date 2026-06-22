import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InvalidCredentialsException } from '../shared/exception/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../shared/exception/invalid-refresh-token.exception';
import { UserInactiveException } from '../shared/exception/user-inactive.exception';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let refreshTokensRepository: jest.Mocked<Repository<RefreshTokenEntity>>;
  let usersRepository: jest.Mocked<Repository<UserEntity>>;
  let saveRefreshToken: jest.MockedFunction<
    (entity: Partial<RefreshTokenEntity>) => Promise<RefreshTokenEntity>
  >;
  let updateRefreshTokens: jest.Mock;

  const activeUser = {
    id: 'user-1',
    schoolId: 'school-1',
    code: 't10000001',
    userType: 'staff',
    passwordHash: '',
    name: 'María Auxiliar',
    avatarUrl: null,
    isActive: true,
    userRoles: [{ role: { code: 'auxiliar' } }],
    userSections: [],
    userSedes: [],
    student: null,
    parentStudents: [],
  } as unknown as UserEntity;

  beforeEach(async () => {
    activeUser.passwordHash = await bcrypt.hash('demo123', 4);

    usersService = {
      findByCode: jest.fn(),
      findActiveById: jest.fn(),
      findProfileById: jest.fn(),
      updatePasswordHash: jest.fn(),
      toProfileDto: jest.fn().mockReturnValue({
        id: 'user-1',
        name: 'María Auxiliar',
        code: 't10000001',
        userType: 'staff',
        role: 'auxiliar',
        roles: ['auxiliar'],
        initials: 'MA',
      }),
      getRoleCodes: jest.fn().mockReturnValue(['auxiliar']),
    } as unknown as jest.Mocked<UsersService>;

    saveRefreshToken = jest.fn((entity: Partial<RefreshTokenEntity>) =>
      Promise.resolve({
        ...entity,
        id: 'refresh-1',
        createdAt: new Date(),
      } as RefreshTokenEntity),
    );
    updateRefreshTokens = jest.fn();

    refreshTokensRepository = {
      create: jest.fn(
        (entity: Partial<RefreshTokenEntity>) => entity as RefreshTokenEntity,
      ),
      save: saveRefreshToken,
      findOne: jest.fn(),
      update: updateRefreshTokens,
    } as unknown as jest.Mocked<Repository<RefreshTokenEntity>>;

    usersRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('access-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                JWT_ACCESS_EXPIRES: '15m',
                JWT_REFRESH_EXPIRES: '30d',
              };
              return values[key];
            }),
          },
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useValue: refreshTokensRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: usersRepository,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  it('login returns tokens and user profile on valid credentials', async () => {
    usersService.findByCode.mockResolvedValue(activeUser);

    const result = await authService.login({
      code: 't10000001',
      password: 'demo123',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBeDefined();
    expect(result.expiresIn).toBe(900);
    expect(result.user.code).toBe('t10000001');
    expect(saveRefreshToken).toHaveBeenCalled();
  });

  it('login throws InvalidCredentialsException when user not found', async () => {
    usersService.findByCode.mockResolvedValue(null);

    await expect(
      authService.login({
        code: 't99999999',
        password: 'demo123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });

  it('login throws UserInactiveException when user is inactive', async () => {
    usersService.findByCode.mockResolvedValue({
      ...activeUser,
      isActive: false,
    });

    await expect(
      authService.login({
        code: 't10000001',
        password: 'demo123',
      }),
    ).rejects.toBeInstanceOf(UserInactiveException);
  });

  it('refresh rotates token when refresh token is valid', async () => {
    const refreshToken = 'valid-refresh-token';
    const stored = {
      id: 'stored-1',
      userId: 'user-1',
      tokenHash: authService['hashRefreshToken'](refreshToken),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: activeUser,
    } as RefreshTokenEntity;

    refreshTokensRepository.findOne.mockResolvedValue(stored);

    const result = await authService.refresh(refreshToken);

    expect(result.accessToken).toBe('access-token');
    expect(saveRefreshToken).toHaveBeenCalled();
    const rotatedToken = saveRefreshToken.mock.calls.at(-1)?.[0];
    expect(rotatedToken?.revokedAt).toBeInstanceOf(Date);
  });

  it('refresh throws when token is revoked (reuse detection)', async () => {
    refreshTokensRepository.findOne.mockResolvedValue({
      id: 'stored-1',
      userId: 'user-1',
      tokenHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
      user: activeUser,
    } as RefreshTokenEntity);

    await expect(authService.refresh('token')).rejects.toBeInstanceOf(
      InvalidRefreshTokenException,
    );
    expect(updateRefreshTokens).toHaveBeenCalled();
  });

  it('logout revokes active refresh token', async () => {
    const refreshToken = 'logout-token';
    refreshTokensRepository.findOne.mockResolvedValue({
      id: 'stored-1',
      tokenHash: authService['hashRefreshToken'](refreshToken),
      revokedAt: null,
    } as RefreshTokenEntity);

    await authService.logout(refreshToken);

    expect(saveRefreshToken).toHaveBeenCalled();
    const revokedToken = saveRefreshToken.mock.calls.at(-1)?.[0];
    expect(revokedToken?.revokedAt).toBeInstanceOf(Date);
  });
});
