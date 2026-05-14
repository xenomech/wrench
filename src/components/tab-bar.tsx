'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BracketsCurly, Lock, Fingerprint, FileText, Clock, Image } from '@phosphor-icons/react';
import { Tooltip } from '@/components/tooltip';
import type { ComponentType } from 'react';

export type TabTheme = {
  bg: string;
  activeBg: string;
  accent: string;
  glow: string;
  gradientFrom: string;
};

export const TAB_THEMES: Record<string, TabTheme> = {
  json: {
    bg: 'bg-amber-500/8',
    activeBg: 'bg-amber-500/15',
    accent: 'text-amber-300',
    glow: 'bg-amber-500',
    gradientFrom: 'from-amber-600/8',
  },
  encode: {
    bg: 'bg-violet-500/8',
    activeBg: 'bg-violet-500/15',
    accent: 'text-violet-300',
    glow: 'bg-violet-500',
    gradientFrom: 'from-violet-600/8',
  },
  generators: {
    bg: 'bg-emerald-500/8',
    activeBg: 'bg-emerald-500/15',
    accent: 'text-emerald-300',
    glow: 'bg-emerald-500',
    gradientFrom: 'from-emerald-600/8',
  },
  text: {
    bg: 'bg-sky-500/8',
    activeBg: 'bg-sky-500/15',
    accent: 'text-sky-300',
    glow: 'bg-sky-500',
    gradientFrom: 'from-sky-600/8',
  },
  time: {
    bg: 'bg-pink-500/8',
    activeBg: 'bg-pink-500/15',
    accent: 'text-pink-300',
    glow: 'bg-pink-500',
    gradientFrom: 'from-pink-600/8',
  },
  assets: {
    bg: 'bg-orange-500/8',
    activeBg: 'bg-orange-500/15',
    accent: 'text-orange-300',
    glow: 'bg-orange-500',
    gradientFrom: 'from-orange-600/8',
  },
};

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  theme: TabTheme;
};

const tabs: Tab[] = [
  {
    id: 'generators',
    label: 'Generate',
    href: '/generators',
    icon: Fingerprint,
    theme: TAB_THEMES.generators!,
  },
  { id: 'time', label: 'Time', href: '/time', icon: Clock, theme: TAB_THEMES.time! },
  { id: 'json', label: 'JSON', href: '/json', icon: BracketsCurly, theme: TAB_THEMES.json! },
  { id: 'encode', label: 'Encode', href: '/encode', icon: Lock, theme: TAB_THEMES.encode! },
  { id: 'text', label: 'Text', href: '/text', icon: FileText, theme: TAB_THEMES.text! },
  { id: 'assets', label: 'Assets', href: '/assets', icon: Image, theme: TAB_THEMES.assets! },
];

export function useActiveTab(): { id: string; theme: TabTheme } {
  const pathname = usePathname();
  const tab = tabs.find(t => pathname.startsWith(t.href));
  return { id: tab?.id ?? 'generators', theme: tab?.theme ?? TAB_THEMES.generators! };
}

export function TabBar() {
  const pathname = usePathname();
  const activeTabId = tabs.find(t => pathname.startsWith(t.href))?.id ?? 'generators';

  return (
    <nav className="relative z-30 flex items-center justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
      <div className="flex items-center gap-0.5 rounded-2xl bg-white/[0.04] p-1 md:gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTabId === tab.id;

          return (
            <Tooltip key={tab.id} content={tab.label} side="top">
              <Link
                href={tab.href}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-white/30 hover:text-white/50'
                }`}
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className={`absolute inset-0 rounded-xl ${tab.theme.activeBg} shadow-lg shadow-black/20`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-[18px] w-[18px] ${isActive ? tab.theme.accent : ''}`}
                />
              </Link>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
