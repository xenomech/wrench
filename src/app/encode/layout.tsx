'use client';

import { Binary, Link2, Code2, KeyRound } from 'lucide-react';
import { ToolLayout } from '@/components/tool-layout';

const tools = [
  { id: 'base64', label: 'Base64', href: '/encode', icon: Binary },
  { id: 'url', label: 'URL', href: '/encode/url', icon: Link2 },
  { id: 'html', label: 'HTML Entities', href: '/encode/html', icon: Code2 },
  { id: 'jwt', label: 'JWT Decoder', href: '/encode/jwt', icon: KeyRound },
];

export default function EncodeLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tools={tools}>{children}</ToolLayout>;
}
