import { randomUUID } from 'node:crypto';
import { type Request, type Response } from 'express';
import type { Logger } from 'pino';
import type { ChatRequest, AppConfig } from '../types';
import { generateStreamTokens } from '../services/chat.service';
import { setSSEHeaders, formatSSE } from '../services/sse.service';

export async function handleStreamingChat(
  req: Request<unknown, unknown, ChatRequest>,
  res: Response,
  config: AppConfig,
  logger: Logger
): Promise<void> {
  const { message, conversationId } = req.body;
  const startTime = Date.now();
  const messageId = randomUUID();
  const abortController = new AbortController();

  setSSEHeaders(res);

  req.socket.on('close', () => {
    abortController.abort();
  });
  const { signal } = abortController;

  res.write(formatSSE({ event: 'metadata', data: { messageId }, id: '0' }));

  const heartbeatInterval = setInterval(() => {
    res.write(formatSSE({ event: 'ping', data: null }));
  }, config.stream.heartbeatIntervalMs);

  try {
    let tokenCount = 0;
    for await (const { token, isDone } of generateStreamTokens(
      message,
      conversationId,
      config.stream.tokenDelayMs,
      logger
    )) {
      if (signal.aborted) break;

      if (isDone) {
        res.write(formatSSE({
          event: 'done',
          data: { tokenCount, durationMs: Date.now() - startTime },
        }));
        break;
      }

      res.write(formatSSE({
        event: 'message',
        data: { token, index: tokenCount + 1 },
        id: String(tokenCount + 1),
      }));
      tokenCount++;
    }

    const duration = Date.now() - startTime;
    logger.info(
      { messageId, tokenCount, durationMs: duration, conversationId },
      'Streaming response completed'
    );
  } catch (error) {
    logger.error({ error, messageId }, 'Error during streaming');

    if (!signal.aborted) {
      res.write(formatSSE({
        event: 'error',
        data: { message: error instanceof Error ? error.message : 'Unknown error occurred', code: 'STREAM_ERROR' },
      }));
    }
  } finally {
    clearInterval(heartbeatInterval);
    res.end();
  }
}
