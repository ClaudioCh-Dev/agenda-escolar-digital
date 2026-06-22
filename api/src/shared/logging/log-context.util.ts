import { LOG_CONTEXT } from './logging.constants';

export type DomainLogContext = {
  action: string;
  userId?: string;
  code?: string;
  reason?: string;
  module?: string;
  [key: string]: string | number | boolean | undefined;
};

export function domainLog(context: DomainLogContext): DomainLogContext {
  return {
    [LOG_CONTEXT.ACTION]: context.action,
    ...(context.userId ? { [LOG_CONTEXT.USER_ID]: context.userId } : {}),
    ...(context.code ? { [LOG_CONTEXT.CODE]: context.code } : {}),
    ...(context.reason ? { [LOG_CONTEXT.REASON]: context.reason } : {}),
    ...(context.module ? { [LOG_CONTEXT.MODULE]: context.module } : {}),
    ...Object.fromEntries(
      Object.entries(context).filter(
        ([key]) =>
          !['action', 'userId', 'code', 'reason', 'module'].includes(key),
      ),
    ),
  };
}
