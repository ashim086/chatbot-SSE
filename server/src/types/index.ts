export type SSEEventType = 'message' | 'done' | 'error' | 'ping' | 'metadata';

export interface SSEEvent<T = unknown> {
  readonly event: SSEEventType;
  readonly data: T;
  readonly id?: string;
  readonly retry?: number;
}

/** Request body for the chat endpoint */
export interface ChatRequest {
  readonly message: string;
  readonly conversationId?: string;
  readonly stream?: boolean;
}

/** A single chat message */
export interface ChatMessage {
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: number;
}

/** Response metadata for streaming */
export interface StreamMetadata {
  readonly conversationId: string;
  readonly messageId: string;
  readonly totalTokens: number;
  readonly durationMs: number;
}

/** Non-streaming chat response */
export interface ChatResponse {
  readonly success: boolean;
  readonly message: string;
  readonly metadata: StreamMetadata;
}

/** Error response shape */
export interface ErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: ReadonlyArray<Record<string, unknown>>;
  };
  readonly requestId?: string;
}

/** Configuration for the stream tokenizer */
export interface TokenizerConfig {
  /** How to split text into chunks. Default: 'word' */
  readonly mode: 'word' | 'char' | 'sentence';
  /** Delay between chunks in ms. Default: 50 */
  readonly delayMs: number;
  /** Min chunk size. Default: 1 */
  readonly minChunkSize: number;
}

/** Application configuration */
export interface AppConfig {
  readonly port: number;
  readonly nodeEnv: 'development' | 'production' | 'test';
  readonly corsOrigin: string | RegExp | ReadonlyArray<string | RegExp> | true;
  readonly stream: {
    readonly tokenDelayMs: number;
    readonly heartbeatIntervalMs: number;
    readonly maxMessageLength: number;
  };
}

/** Result type for operations (Rust-inspired pattern) */
export type Result<T, E = Error> = 
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
