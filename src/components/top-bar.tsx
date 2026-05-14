'use client';

import { Command } from '@phosphor-icons/react';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function TopBar() {
  const handleCommandK = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  return (
    <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-3">
      <button
        onClick={handleCommandK}
        className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/40"
      >
        <Command weight="duotone" className="h-3 w-3" />
        <span className="font-code">K</span>
      </button>
      <a
        href="https://github.com/xenomech/wrench"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/15 transition-colors hover:text-white/35"
      >
        <GitHubIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
