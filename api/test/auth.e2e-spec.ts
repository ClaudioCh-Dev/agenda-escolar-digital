import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { GlobalExceptionFilter } from '../src/shared';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; detail: string | null } | null;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const mockProfile = {
    id: 'user-1',
    name: 'María Auxiliar',
    code: 't10000001',
    userType: 'staff' as const,
    role: 'auxiliar',
    roles: ['auxiliar'],
    initials: 'MA',
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 900,
      user: mockProfile,
    }),
    refresh: jest.fn().mockResolvedValue({
      accessToken: 'mock-access-token-2',
      refreshToken: 'mock-refresh-token-2',
      expiresIn: 900,
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    changePassword: jest.fn().mockResolvedValue(undefined),
  };

  const mockUsersService = {
    findActiveById: jest.fn().mockResolvedValue({
      id: 'user-1',
      schoolId: 'school-1',
      isActive: true,
      userRoles: [{ role: { code: 'auxiliar' } }],
    }),
    findProfileById: jest.fn().mockResolvedValue(mockProfile),
    getRoleCodes: jest.fn().mockReturnValue(['auxiliar']),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15m' as const },
        }),
      ],
      controllers: [AppController, AuthController, UsersController],
      providers: [
        AppService,
        JwtStrategy,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    jwtService = moduleFixture.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('GET / is public', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        success: true,
        data: { message: 'Hello World!' },
        error: null,
      });
  });

  it('GET /users/me without token returns UNAUTHORIZED envelope', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        const body = res.body as ApiEnvelope;
        expect(body.success).toBe(false);
        expect(body.error?.code).toBe('UNAUTHORIZED');
      });
  });

  it('POST /auth/login returns tokens envelope', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        code: 't10000001',
        password: 'demo123',
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as ApiEnvelope<{
          accessToken: string;
          user: { code: string };
        }>;
        expect(body.success).toBe(true);
        expect(body.data?.accessToken).toBe('mock-access-token');
        expect(body.data?.user.code).toBe('t10000001');
      });
  });

  it('GET /users/me with valid JWT returns profile', async () => {
    const token = await jwtService.signAsync({
      sub: 'user-1',
      schoolId: 'school-1',
      roles: ['auxiliar'],
    });

    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as ApiEnvelope<{ code: string }>;
        expect(body.success).toBe(true);
        expect(body.data?.code).toBe('t10000001');
      });
  });

  it('POST /auth/refresh returns rotated tokens', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'mock-refresh-token' })
      .expect(201)
      .expect((res) => {
        const body = res.body as ApiEnvelope<{ accessToken: string }>;
        expect(body.data?.accessToken).toBe('mock-access-token-2');
      });
  });
});
