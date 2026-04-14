'use client';

const STARTERS = [
  'Explain how Server-Sent Events work',
  'What are the SOLID principles?',
  'How does async/await differ from Promises?',
  'Walk me through a system design for a chat app',
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function EmptyState({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
      {/* Animated logo */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-white fill-none stroke-current stroke-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 opacity-20 blur animate-pulse" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Streaming Chat
        </h1>
        <p className="text-sm text-zinc-400 max-w-xs">
          Real-time AI responses with Server-Sent Events streaming
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {STARTERS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-left px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 hover:border-violet-500/50 hover:bg-zinc-800 text-zinc-300 text-sm transition-all hover:text-zinc-100 group"
          >
            <span className="text-violet-400 mr-2 group-hover:mr-3 transition-all">
              {'>'}
            </span>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
