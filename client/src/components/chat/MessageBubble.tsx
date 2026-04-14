'use client';

import type { ChatMessage } from '../../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
          ${isUser
            ? 'bg-blue-500 text-white'
            : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
          }
        `}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 rounded-tl-sm'
            }
            ${message.error ? 'border border-red-500/50 bg-red-900/20 text-red-300' : ''}
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || ''}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-zinc-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.usage && (
            <span className="text-xs text-zinc-600">
              {message.usage.outputTokens} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
