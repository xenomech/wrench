'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useActiveTab } from '@/components/tab-bar';
import type { ComponentType, ReactNode } from 'react';

type SubTool = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type ToolLayoutProps = {
  tools: SubTool[];
  children: ReactNode;
};

export function ToolLayout({ tools, children }: ToolLayoutProps) {
  const pathname = usePathname();
  const { theme } = useActiveTab();
  const activeId = tools.find(t => pathname === t.href)?.id ?? tools[0]!.id;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
      {/* Desktop sidebar */}
      <div className="relative z-20 hidden items-center px-2.5 md:flex">
        <nav className="flex flex-col items-center gap-2">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isActive = pathname === tool.href;

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 active:scale-90"
                aria-label={tool.label}
              >
                {isActive && (
                  <motion.div
                    layoutId={`pill-${tools[0]!.id}`}
                    className={`absolute inset-0 rounded-xl ${theme.bg}`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-[18px] w-[18px] transition-colors duration-150 ${
                    isActive ? theme.accent : 'text-white/25 group-hover:text-white/45'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId={`dot-${tools[0]!.id}`}
                    className={`absolute -bottom-0.5 h-1 w-1 rounded-full ${theme.glow}`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/80 opacity-0 shadow-xl shadow-black/30 backdrop-blur-lg transition-opacity duration-100 group-hover:opacity-100">
                  {tool.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content area */}
      <div className="relative z-10 min-h-0 flex-1 overflow-auto p-3 pb-0 md:pb-3">
        <div
          className={`relative h-full overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradientFrom} to-white/[0.02] p-4 md:p-5 lg:p-6`}
        >
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative h-full"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Invisible right spacer to center content */}
      <div className="hidden w-[40px] shrink-0 md:block lg:w-[60px]" />

      {/* Mobile bottom bar */}
      <div className="relative z-20 flex items-center justify-center gap-1 px-4 py-2 md:hidden">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = pathname === tool.href;

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all duration-150 active:scale-95"
              aria-label={tool.label}
            >
              {isActive && (
                <motion.div
                  layoutId={`mobile-pill-${tools[0]!.id}`}
                  className={`absolute inset-0 rounded-xl ${theme.bg}`}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 transition-colors duration-150 ${
                  isActive ? theme.accent : 'text-white/25'
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium ${
                  isActive ? 'text-white/70' : 'text-white/20'
                }`}
              >
                {tool.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
