'use client';

import { Fingerprint, TextAa, Hash } from '@phosphor-icons/react';
import { ToolLayout } from '@/components/tool-layout';

const tools = [
  { id: 'uuid', label: 'UUID', href: '/generators', icon: Fingerprint },
  { id: 'lorem', label: 'Lorem Ipsum', href: '/generators/lorem', icon: TextAa },
  { id: 'hash', label: 'Hash', href: '/generators/hash', icon: Hash },
];

export default function GeneratorsLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tools={tools}>{children}</ToolLayout>;
}
