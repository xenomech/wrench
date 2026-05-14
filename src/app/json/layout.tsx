'use client';

import { useActiveTab } from '@/components/tab-bar';
import type { ReactNode } from 'react';

export default function JsonLayout({ children }: { children: ReactNode }) {
  const { theme } = useActiveTab();

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className="relative z-10 min-h-0 flex-1 overflow-auto p-3">
        <div
          className={`relative h-full overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradientFrom} to-white/[0.02] p-4 md:p-5 lg:p-6`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
