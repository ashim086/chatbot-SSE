import type { Logger } from 'pino';

/** Keyword-to-response mapping for simulated intelligence */
const RESPONSE_MAP: ReadonlyMap<string, string> = new Map([
  ['hello', "Hello! I'm doing great. How can I help you today? I'm a streaming chatbot"],
  ['hi', "Hey there! Great to see you. What can I help you with today?"],
  ['how are you', "I'm functioning optimally, thank you for asking! I'm built with Node.js and Server-Sent Events for real-time streaming. Pretty cool, right?"],
  ['help', "I'd be happy to help! I can answer questions, have conversations, or demonstrate streaming responses. Try asking me about my architecture, tech stack, or capabilities!"],
  ['architecture', "Great question! This chatbot is built with a production-grade architecture featuring TypeScript strict mode, Server-Sent Events (SSE) for streaming, async generators for memory efficiency, and a clean separation of concerns. The backend uses Express with proper middleware for validation, rate limiting, error handling, and structured logging."],
  ['tech stack', "We're using Node.js with TypeScript in strict mode, Express.js for the HTTP layer, Server-Sent Events for real-time streaming, async generators for memory-efficient token streaming, and Pino for structured logging. The frontend is Next.js with React hooks for SSE consumption."],
  ['streaming', "Streaming works by breaking responses into small tokens (words by default) and sending each one as a Server-Sent Event. The client receives tokens and displays them one by one, creating the typing effect. This is more efficient than sending the full response at once and provides better UX."],
  ['bye', "Goodbye! It was great chatting with you. Feel free to come back anytime you need help or want to see some cool streaming technology in action!"],
  ['thank', "You're welcome! I'm glad I could help. Is there anything else you'd like to know?"],
  ['node', "Node.js is perfect for streaming applications because of its event-driven, non-blocking architecture. Combined with async generators and SSE, it can handle thousands of concurrent streaming connections efficiently."],
  ['typescript', "TypeScript strict mode catches bugs at compile time! Features like strictNullChecks, noUncheckedIndexedAccess, and exactOptionalPropertyTypes prevent common runtime errors. It's essential for production codebases."],
]);

/** Default response when no keyword matches */
const DEFAULT_RESPONSES: ReadonlyArray<string> = [
  "That's an interesting point! I'm a demo chatbot with keyword-based responses. Try asking about my architecture, tech stack, streaming capabilities, or just say hello!",
  "Thanks for your message! I have pre-programmed responses for certain keywords. Try: hello, help, architecture, tech stack, streaming, node, typescript .",
  "I appreciate the conversation! While I'm currently keyword-based, my architecture is designed to easily integrate with real LLM APIs like OpenAI or Anthropic. Try asking about my tech stack!",
];

function generateResponse(message: string): string {
  const normalizedMessage = message.toLowerCase().trim();

  for (const [keyword, response] of RESPONSE_MAP) {
    if (normalizedMessage.includes(keyword)) {
      return response;
    }
  }

  const randomIndex = Math.floor(Math.random() * DEFAULT_RESPONSES.length);
  return DEFAULT_RESPONSES[randomIndex] ?? DEFAULT_RESPONSES[0]!;
}

export async function* generateStreamTokens(
  message: string,
  conversationId: string | undefined,
  tokenDelayMs: number,
  logger: Logger
): AsyncGenerator<{ readonly token: string; readonly isDone: boolean }, void, unknown> {
  const startTime = Date.now();

  try {
    if (message.trim().length === 0) {
      yield { token: 'Error: Message cannot be empty', isDone: true };
      return;
    }

    const fullResponse = generateResponse(message);

    const words = fullResponse.split(/(\s+)/).filter(Boolean);

    for (const word of words) {
      yield { token: word, isDone: false };
      await new Promise<void>((resolve) => setTimeout(resolve, tokenDelayMs));
    }

    const duration = Date.now() - startTime;
    logger.info(
      { conversationId, tokenCount: words.length, durationMs: duration },
      'Stream completed'
    );
  } catch (error) {
    logger.error({ error }, 'Error during streaming');
    yield { token: 'Error: Failed to generate response', isDone: true };
  }
}
