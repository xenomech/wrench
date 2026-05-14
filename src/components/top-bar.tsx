'use client';

import { Command, GithubLogo } from '@phosphor-icons/react';
import { openCommandPalette } from '@/components/command-palette';

export function TopBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-3">
      <button
        onClick={openCommandPalette}
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
        <GithubLogo weight="duotone" className="h-4 w-4" />
      </a>
    </div>
  );
}
