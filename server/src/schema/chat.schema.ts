import { z } from 'zod';
import type { AppConfig } from '../types';

export function createChatRequestSchema(config: Pick<AppConfig, 'stream'>) {
  return z.object({
    message: z
      .string()
      .min(1, { message: 'Message cannot be empty' })
      .max(config.stream.maxMessageLength, {
        message: `Message must be less than ${config.stream.maxMessageLength} characters`,
      }),
    conversationId: z.string().uuid({ message: 'Conversation ID must be a valid UUID' }).optional(),
  });
}

export type ChatRequestSchema = ReturnType<typeof createChatRequestSchema>;
