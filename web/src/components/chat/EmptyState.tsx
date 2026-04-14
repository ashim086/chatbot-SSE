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
            className="text-left px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 hover:border-blue-500/50 hover:bg-zinc-800 text-zinc-300 text-sm transition-all hover:text-zinc-100 group"
          >
            <span className="text-blue-400 mr-2 group-hover:mr-3 transition-all">
              {'>'}
            </span>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
