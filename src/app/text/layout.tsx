'use client';

import { GitDiff, FileText } from '@phosphor-icons/react';
import { ToolLayout } from '@/components/tool-layout';

const tools = [
  { id: 'diff', label: 'Diff', href: '/text', icon: GitDiff },
  { id: 'markdown', label: 'Markdown', href: '/text/markdown', icon: FileText },
];

export default function TextLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tools={tools}>{children}</ToolLayout>;
}
