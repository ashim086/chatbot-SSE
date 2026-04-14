'use client';

import { useEffect, useRef } from 'react';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { MessageBubble } from './chat/MessageBubble';
import { ChatInput } from './chat/ChatInput';
import { EmptyState } from './chat/EmptyState';

export function ChatWindow() {
  const { messages, sendMessage, cancelStreaming, clearChat, isStreaming } =
    useStreamingChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4 text-white fill-current"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">StreamChat</h1>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isStreaming
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="text-xs text-zinc-500">
                {isStreaming ? 'Streaming...' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Clear
            </button>
          )}
          <div className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md font-mono">
            SSE
          </div>
        </div>
      </header>

      {/* Message list */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <EmptyState onSelect={sendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={cancelStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
