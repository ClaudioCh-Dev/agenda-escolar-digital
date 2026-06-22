import { createHash, randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, Repository } from 'typeorm';
import { domainLog } from '../shared/logging';
import { InvalidCredentialsException } from '../shared/exception/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../shared/exception/invalid-refresh-token.exception';
import { UserInactiveException } from '../shared/exception/user-inactive.exception';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UsersService } from '../users/users.service';
import type {
  AuthTokensDto,
  LoginResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokensRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByCode(dto.code);

    if (!user) {
      this.logger.warn(
        domainLog({
          action: 'auth.login.failed',
          code: dto.code,
          reason: 'user_not_found',
          module: 'auth',
        }),
      );
      throw new InvalidCredentialsException();
    }

    if (!user.isActive) {
      this.logger.warn(
        domainLog({
          action: 'auth.login.inactive',
          userId: user.id,
          code: dto.code,
          module: 'auth',
        }),
      );
      throw new UserInactiveException(user.id);
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      this.logger.warn(
        domainLog({
          action: 'auth.login.failed',
          userId: user.id,
          code: dto.code,
          reason: 'invalid_password',
          module: 'auth',
        }),
      );
      throw new InvalidCredentialsException();
    }

    const roles = this.usersService.getRoleCodes(user);
    const tokens = await this.issueTokens(user.id, user.schoolId, roles);

    this.logger.log(
      domainLog({
        action: 'auth.login.success',
        userId: user.id,
        code: user.code,
        module: 'auth',
      }),
    );

    return {
      ...tokens,
      user: this.usersService.toProfileDto(user),
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
      relations: { user: { userRoles: { role: true } } },
    });

    if (!stored) {
      throw new InvalidRefreshTokenException();
    }

    if (stored.revokedAt) {
      this.logger.warn(
        domainLog({
          action: 'auth.refresh.reuse',
          userId: stored.userId,
          module: 'auth',
        }),
      );
      await this.revokeTokenFamily(stored);
      throw new InvalidRefreshTokenException('Refresh token reuse detected');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new InvalidRefreshTokenException('Refresh token expired');
    }

    if (!stored.user.isActive) {
      throw new UserInactiveException(stored.userId);
    }

    const roles = this.usersService.getRoleCodes(stored.user);
    const tokens = await this.issueTokens(
      stored.user.id,
      stored.user.schoolId,
      roles,
    );

    stored.revokedAt = new Date();
    stored.replacedById = await this.findLatestTokenId(stored.userId);
    await this.refreshTokensRepository.save(stored);

    this.logger.log(
      domainLog({
        action: 'auth.refresh.success',
        userId: stored.userId,
        module: 'auth',
      }),
    );

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });

    if (!stored) {
      return;
    }

    stored.revokedAt = new Date();
    await this.refreshTokensRepository.save(stored);

    this.logger.log(
      domainLog({
        action: 'auth.logout',
        userId: stored.userId,
        module: 'auth',
      }),
    );
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const currentValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!currentValid) {
      this.logger.warn(
        domainLog({
          action: 'auth.login.failed',
          userId,
          reason: 'invalid_current_password',
          module: 'auth',
        }),
      );
      throw new InvalidCredentialsException();
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
    await this.usersRepository.save(user);
    await this.revokeAllUserTokens(userId);

    this.logger.log(
      domainLog({
        action: 'auth.password.changed',
        userId,
        module: 'auth',
      }),
    );
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  private async issueTokens(
    userId: string,
    schoolId: string,
    roles: string[],
  ): Promise<AuthTokensDto> {
    const payload: JwtPayload = { sub: userId, schoolId, roles };
    const accessExpires =
      this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES');
    const refreshExpires = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES',
    );

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpires as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const expiresAt = this.addDuration(new Date(), refreshExpires);

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        userId,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt,
      }),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.durationToSeconds(accessExpires),
    };
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async revokeTokenFamily(token: RefreshTokenEntity): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId: token.userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private async findLatestTokenId(userId: string): Promise<string | null> {
    const latest = await this.refreshTokensRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return latest?.id ?? null;
  }

  private addDuration(from: Date, duration: string): Date {
    return new Date(from.getTime() + this.durationToSeconds(duration) * 1000);
  }

  private durationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 900;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}
