import express, { type Application } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import type { AppConfig } from './types';
import { createLogger } from './utils/logger';
import { globalError, notFound } from './middleware/errorHandler';
import { createChatRouter } from './routes/chat.routes';

const config: AppConfig = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : true,
  stream: {
    tokenDelayMs: parseInt(process.env.STREAM_TOKEN_DELAY_MS ?? '50', 10),
    heartbeatIntervalMs: parseInt(process.env.STREAM_HEARTBEAT_MS ?? '15000', 10),
    maxMessageLength: parseInt(process.env.STREAM_MAX_MESSAGE_LENGTH ?? '4000', 10),
  },
};

const logger = createLogger(config);

export function createApp(): Application {
  const app = express();

  app.use(helmet());

  const corsOptions: CorsOptions = {
    origin: config.corsOrigin as CorsOptions['origin'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
    maxAge: 86400,
  };
  app.use(cors(corsOptions));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] as string ?? randomUUID();
    res.setHeader('X-Request-Id', requestId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).requestId = requestId;
    next();
  });

  app.use((req, res, next) => {
    logger.info(
      {
        method: req.method,
        path: req.path,
        requestId: res.getHeader('X-Request-Id'),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
      'Incoming request'
    );
    next();
  });

  const chatRouter = createChatRouter(config, logger);
  app.use('/api', chatRouter);

  app.use(notFound);

  app.use(globalError);

  return app;
}

const app = createApp();

app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      nodeEnv: config.nodeEnv,
      nodeVersion: process.version,
      platform: process.platform,
    },
    'Streaming Chatbot API started'
  );
});
