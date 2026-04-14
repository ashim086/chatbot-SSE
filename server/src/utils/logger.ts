import pino, { type Logger } from 'pino';
import type { AppConfig } from '../types';

export function createLogger(config: Pick<AppConfig, 'nodeEnv'>, logLevel?: string): Logger {
  const level = logLevel ?? process.env.LOG_LEVEL ?? (config.nodeEnv === 'production' ? 'warn' : 'info');

  // Build options object incrementally to satisfy strict types
  const loggerOptions: Record<string, unknown> = {
    level,
    base: {
      service: 'streaming-chatbot-api',
      version: '1.0.0',
      environment: config.nodeEnv,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password'],
      remove: true,
    },
    formatters: {
      level: (label: string) => ({ level: label.toUpperCase() }),
    },
  };

  // Only add transport in development (pino-pretty)
  if (config.nodeEnv === 'development') {
    loggerOptions.transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss' },
    };
  }

  const baseLogger = pino(loggerOptions);

  return baseLogger;
}

export function createRequestLogger(
  parent: Logger,
  context: { readonly requestId: string; readonly method: string; readonly path: string }
): Logger {
  return parent.child({
    requestId: context.requestId,
    http: { method: context.method, path: context.path },
  });
}
