'use client';

import { ToastProvider } from '@/components/toast';
import { CommandPalette } from '@/components/command-palette';
import { BackgroundGlow } from '@/components/background-glow';
import { TooltipProvider } from '@/components/tooltip';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>
        <BackgroundGlow />
        {children}
        <CommandPalette />
      </ToastProvider>
    </TooltipProvider>
  );
}
