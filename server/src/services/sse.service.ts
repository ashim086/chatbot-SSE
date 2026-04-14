import type { SSEEvent } from '../types';

export function formatSSE<T>(event: SSEEvent<T>): string {
  const lines: string[] = [];

  if (event.id !== undefined) {
    lines.push(`id: ${event.id}`);
  }
  if (event.retry !== undefined) {
    lines.push(`retry: ${event.retry}`);
  }

  lines.push(`event: ${event.event}`);
  lines.push(`data: ${JSON.stringify(event.data)}`);
  lines.push('');
  lines.push('');

  return lines.join('\n');
}

export function setSSEHeaders(res: {
  setHeader: (name: string, value: string) => unknown;
  flushHeaders?: () => void;
}): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}
