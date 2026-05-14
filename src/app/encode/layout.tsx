'use client';

import { Binary, Link, Code, Key } from '@phosphor-icons/react';
import { ToolLayout } from '@/components/tool-layout';

const tools = [
  { id: 'base64', label: 'Base64', href: '/encode', icon: Binary },
  { id: 'url', label: 'URL', href: '/encode/url', icon: Link },
  { id: 'html', label: 'HTML Entities', href: '/encode/html', icon: Code },
  { id: 'jwt', label: 'JWT Decoder', href: '/encode/jwt', icon: Key },
];

export default function EncodeLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tools={tools}>{children}</ToolLayout>;
}
