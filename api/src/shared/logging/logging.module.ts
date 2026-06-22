import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { SENSITIVE_LOG_PATHS } from './logging.constants';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const logLevel = configService.get<string>('LOG_LEVEL', 'info');
        const isDev = nodeEnv !== 'production';

        return {
          pinoHttp: {
            level: logLevel,
            redact: {
              paths: [...SENSITIVE_LOG_PATHS],
              censor: '[Redacted]',
            },
            genReqId: (req, res) => {
              const existing = req.headers['x-request-id'];
              const requestId =
                typeof existing === 'string' ? existing : randomUUID();
              res.setHeader('x-request-id', requestId);
              return requestId;
            },
            customProps: (req) => ({
              requestId: req.id,
            }),
            ...(isDev
              ? {
                  transport: {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      singleLine: false,
                      translateTime: 'SYS:standard',
                    },
                  },
                }
              : {}),
          },
        };
      },
    }),
  ],
})
export class LoggingModule {}
