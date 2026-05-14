'use client';

import { Browser, Camera } from '@phosphor-icons/react';
import { ToolLayout } from '@/components/tool-layout';

const tools = [
  { id: 'favicon', label: 'Favicon', href: '/assets', icon: Browser },
  { id: 'screenshots', label: 'Screenshots', href: '/assets/screenshots', icon: Camera },
];

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tools={tools}>{children}</ToolLayout>;
}
