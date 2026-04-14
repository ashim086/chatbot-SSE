export type MessageRole = 'user' | 'assistant';

export interface TokenUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;
  readonly usage?: TokenUsage;
  readonly isStreaming?: boolean;  // true while assistant is still typing
  readonly error?: string;         // set if streaming failed
}

export interface ChatState {
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly conversationId: string | null;
}
