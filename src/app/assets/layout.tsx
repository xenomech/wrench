'use client';

import { Browser } from '@phosphor-icons/react';
import { ToolLayout } from '@/components/tool-layout';

const tools = [
  { id: 'favicon', label: 'Favicon', href: '/assets', icon: Browser },
];

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tools={tools}>{children}</ToolLayout>;
}
