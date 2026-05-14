'use client';

import { Command, GithubLogo, XLogo, Globe } from '@phosphor-icons/react';
import { openCommandPalette } from '@/components/command-palette';

export function TopBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 py-4">
      <button
        onClick={openCommandPalette}
        className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/60"
      >
        <Command weight="duotone" className="h-3 w-3" />
        <span className="font-code">K</span>
      </button>
      <div className="flex items-center gap-1">
        <a
          href="https://justgokul.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/50"
        >
          <Globe weight="duotone" className="h-4 w-4" />
        </a>
        <a
          href="https://x.com/justgokuldotdev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/50"
        >
          <XLogo weight="duotone" className="h-4 w-4" />
        </a>
        <a
          href="https://github.com/xenomech/wrench"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/50"
        >
          <GithubLogo weight="duotone" className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
