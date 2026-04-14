export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onDone?: (data: { tokenCount: number; durationMs: number }) => void;
  onError?: (data: { message: string; code: string }) => void;
}

function parseEventBlock(block: string): { type: string; data: Record<string, unknown> } | null {
  let eventName = 'message';
  let dataStr = '';

  for (const line of block.split('\n')) {
    const trimmed = line.trimEnd();
    if (trimmed.startsWith('event:')) {
      eventName = trimmed.slice(6).trim();
    } else if (trimmed.startsWith('data:')) {
      dataStr = trimmed.slice(5).trim();
    }
  }

  if (!dataStr) return null;

  // Handle [DONE] sentinel (used by some SSE implementations)
  if (dataStr === '[DONE]') {
    return { type: 'done', data: { tokenCount: 0, durationMs: 0 } };
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(dataStr);
  } catch {
    return null;  // bad JSON, skip
  }

  return { type: eventName, data };
}

export async function streamChat(
  request: ChatRequest,
  callbacks: StreamCallbacks,
  signal: AbortSignal
): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: request.message,
      conversationId: request.conversationId,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error?.message ?? `HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is not readable');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      // Process any remaining text in the buffer
      if (buffer.trim()) {
        const event = parseEventBlock(buffer);
        if (event) dispatchEvent(event, callbacks);
      }
      break;
    }

    // Add new text to buffer
    buffer += decoder.decode(value, { stream: true });

    // Split on \n\n - each piece is one complete SSE event
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';  // keep the incomplete piece for next iteration

    for (const block of blocks) {
      const event = parseEventBlock(block);
      if (event) dispatchEvent(event, callbacks);
    }
  }
}

/**
 * Call the right callback based on the event type.
 */
function dispatchEvent(
  event: { type: string; data: Record<string, unknown> },
  callbacks: StreamCallbacks
): void {
  switch (event.type) {
    case 'message':
      if ('token' in event.data) {
        callbacks.onToken?.(event.data.token as string);
      }
      break;
    case 'done':
      callbacks.onDone?.(event.data as { tokenCount: number; durationMs: number });
      break;
    case 'error':
      callbacks.onError?.(event.data as { message: string; code: string });
      break;
    // 'metadata' and 'ping' events are ignored by the frontend
  }
}
