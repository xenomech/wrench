'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass, BracketsCurly, Lock, Fingerprint, FileText,
  Sparkle, ArrowsLeftRight, ShieldCheck, Binary, Link, Code,
  Key, Hash, TextAa, GitDiff, Clock, Image,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import type { ComponentType } from 'react';

type Tool = {
  id: string;
  label: string;
  section: string;
  href: string;
  icon: ComponentType<any>;
  keywords: string[];
};

const tools: Tool[] = [
  { id: 'json-formatter', label: 'Formatter', section: 'JSON', href: '/json', icon: Sparkle, keywords: ['format', 'beautify', 'json', 'yaml', 'toml'] },
  { id: 'json-converter', label: 'Converter', section: 'JSON', href: '/json', icon: ArrowsLeftRight, keywords: ['convert', 'json', 'yaml', 'toml'] },
  { id: 'json-validator', label: 'Validator', section: 'JSON', href: '/json', icon: ShieldCheck, keywords: ['validate', 'check', 'json', 'yaml', 'toml'] },
  { id: 'encode-base64', label: 'Base64', section: 'Encode', href: '/encode', icon: Binary, keywords: ['base64', 'encode', 'decode'] },
  { id: 'encode-url', label: 'URL Encode', section: 'Encode', href: '/encode/url', icon: Link, keywords: ['url', 'encode', 'decode'] },
  { id: 'encode-html', label: 'HTML Entities', section: 'Encode', href: '/encode/html', icon: Code, keywords: ['html', 'entities', 'escape'] },
  { id: 'encode-jwt', label: 'JWT Decoder', section: 'Encode', href: '/encode/jwt', icon: Key, keywords: ['jwt', 'token', 'decode'] },
  { id: 'gen-uuid', label: 'UUID', section: 'Generate', href: '/generators', icon: Fingerprint, keywords: ['uuid', 'guid', 'random'] },
  { id: 'gen-lorem', label: 'Lorem Ipsum', section: 'Generate', href: '/generators/lorem', icon: TextAa, keywords: ['lorem', 'placeholder'] },
  { id: 'gen-hash', label: 'Hash', section: 'Generate', href: '/generators/hash', icon: Hash, keywords: ['hash', 'md5', 'sha'] },
  { id: 'text-diff', label: 'Diff', section: 'Text', href: '/text', icon: GitDiff, keywords: ['diff', 'compare'] },
  { id: 'text-markdown', label: 'Markdown', section: 'Text', href: '/text/markdown', icon: FileText, keywords: ['markdown', 'preview'] },
  { id: 'time-clock', label: 'World Clock', section: 'Time', href: '/time', icon: Clock, keywords: ['time', 'clock', 'timezone', 'world', 'convert', 'unix', 'timestamp'] },
  { id: 'assets-favicon', label: 'Favicon Generator', section: 'Assets', href: '/assets', icon: Image, keywords: ['favicon', 'icon', 'image', 'png', 'ico', 'apple', 'android'] },
  { id: 'assets-screenshot', label: 'Screenshot Editor', section: 'Assets', href: '/assets/screenshots', icon: Image, keywords: ['screenshot', 'beautify', 'mockup', 'gradient', 'frame', 'export'] },
];

const sections = [...new Set(tools.map(t => t.section))];

let triggerOpen: (() => void) | null = null;

export function openCommandPalette() {
  triggerOpen?.();
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  triggerOpen = () => setOpen(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#1a1a22]/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Command
              className="flex flex-col"
              filter={(value, search) => {
                const tool = tools.find(t => t.id === value);
                if (!tool) return 0;
                const q = search.toLowerCase();
                if (tool.label.toLowerCase().includes(q)) return 1;
                if (tool.section.toLowerCase().includes(q)) return 0.8;
                if (tool.keywords.some(k => k.includes(q))) return 0.6;
                return 0;
              }}
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
                <MagnifyingGlass weight="duotone" className="h-4 w-4 text-white/25" />
                <Command.Input
                  placeholder="Search tools..."
                  className="h-11 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                  autoFocus
                />
              </div>
              <Command.List className="hide-scroll max-h-[280px] overflow-auto p-1.5">
                <Command.Empty className="py-8 text-center text-sm text-white/25">
                  No results
                </Command.Empty>
                {sections.map(section => (
                  <Command.Group
                    key={section}
                    heading={section}
                    className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-white/20"
                  >
                    {tools
                      .filter(t => t.section === section)
                      .map(tool => {
                        const Icon = tool.icon;
                        return (
                          <Command.Item
                            key={tool.id}
                            value={tool.id}
                            onSelect={() => navigate(tool.href)}
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/40 transition-colors duration-75 data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white"
                          >
                            <Icon weight="duotone" className="h-4 w-4" />
                            <span className="font-medium">{tool.label}</span>
                          </Command.Item>
                        );
                      })}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
