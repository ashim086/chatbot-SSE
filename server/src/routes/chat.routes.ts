import { Router, type Request, type Response } from 'express';
import type { Logger } from 'pino';
import type { ChatRequest, AppConfig } from '../types';
import { validateChatRequest } from '../middleware/validate';
import { handleStreamingChat } from '../controllers/chat.controller';

export function createChatRouter(
  config: AppConfig,
  logger: Logger
): Router {
  const router = Router();

  router.post(
    '/chat',
    validateChatRequest(config),
    async (req: Request<unknown, unknown, ChatRequest>, res: Response) => {
      await handleStreamingChat(req, res, config, logger);
    }
  );

  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
