'use client';

import { GitCompareArrows, FileText } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

const tools = [
  { id: 'diff', label: 'Diff', href: '/text', icon: GitCompareArrows },
  { id: 'markdown', label: 'Markdown', href: '/text/markdown', icon: FileText },
];

export default function TextLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tools={tools}>{children}</ToolLayout>;
}
