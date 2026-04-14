'use client';

import { useEffect, useRef } from 'react';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { MessageBubble } from './chat/MessageBubble';
import { ChatInput } from './chat/ChatInput';
import { EmptyState } from './chat/EmptyState';
import { MessageCircleMore } from 'lucide-react';

export function ChatWindow() {
  const { messages, sendMessage, cancelStreaming, clearChat, isStreaming } =
    useStreamingChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen  text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <MessageCircleMore />
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
