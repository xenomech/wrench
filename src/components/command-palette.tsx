'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Braces,
  Lock,
  Fingerprint,
  FileText,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  Binary,
  Link2,
  Code2,
  KeyRound,
  Hash,
  Type,
  GitCompareArrows,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Command = {
  id: string;
  label: string;
  section: string;
  href: string;
  icon: typeof Braces;
  keywords: string[];
};

const commands: Command[] = [
  {
    id: 'json-formatter',
    label: 'Formatter',
    section: 'JSON',
    href: '/json',
    icon: Sparkles,
    keywords: ['format', 'beautify', 'json', 'yaml', 'toml'],
  },
  {
    id: 'json-converter',
    label: 'Converter',
    section: 'JSON',
    href: '/json',
    icon: ArrowRightLeft,
    keywords: ['convert', 'json', 'yaml', 'toml'],
  },
  {
    id: 'json-validator',
    label: 'Validator',
    section: 'JSON',
    href: '/json',
    icon: ShieldCheck,
    keywords: ['validate', 'check', 'json', 'yaml', 'toml'],
  },
  {
    id: 'encode-base64',
    label: 'Base64',
    section: 'Encode',
    href: '/encode',
    icon: Binary,
    keywords: ['base64', 'encode', 'decode'],
  },
  {
    id: 'encode-url',
    label: 'URL Encode',
    section: 'Encode',
    href: '/encode/url',
    icon: Link2,
    keywords: ['url', 'encode', 'decode'],
  },
  {
    id: 'encode-html',
    label: 'HTML Entities',
    section: 'Encode',
    href: '/encode/html',
    icon: Code2,
    keywords: ['html', 'entities', 'escape'],
  },
  {
    id: 'encode-jwt',
    label: 'JWT Decoder',
    section: 'Encode',
    href: '/encode/jwt',
    icon: KeyRound,
    keywords: ['jwt', 'token', 'decode'],
  },
  {
    id: 'gen-uuid',
    label: 'UUID',
    section: 'Generate',
    href: '/generators',
    icon: Fingerprint,
    keywords: ['uuid', 'guid', 'random'],
  },
  {
    id: 'gen-lorem',
    label: 'Lorem Ipsum',
    section: 'Generate',
    href: '/generators/lorem',
    icon: Type,
    keywords: ['lorem', 'placeholder'],
  },
  {
    id: 'gen-hash',
    label: 'Hash',
    section: 'Generate',
    href: '/generators/hash',
    icon: Hash,
    keywords: ['hash', 'md5', 'sha'],
  },
  {
    id: 'text-diff',
    label: 'Diff',
    section: 'Text',
    href: '/text',
    icon: GitCompareArrows,
    keywords: ['diff', 'compare'],
  },
  {
    id: 'text-markdown',
    label: 'Markdown',
    section: 'Text',
    href: '/text/markdown',
    icon: FileText,
    keywords: ['markdown', 'preview'],
  },
  {
    id: 'time-clock',
    label: 'World Clock',
    section: 'Time',
    href: '/time',
    icon: Clock,
    keywords: ['time', 'clock', 'timezone', 'world', 'convert', 'unix', 'timestamp'],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(p => !p);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      c =>
        c.label.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        c.keywords.some(k => k.includes(q))
    );
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter' && filtered[selectedIndex])
        navigate(filtered[selectedIndex].href);
    },
    [filtered, selectedIndex, navigate]
  );

  const sections = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach(c => {
      const arr = map.get(c.section) ?? [];
      arr.push(c);
      map.set(c.section, arr);
    });
    return map;
  }, [filtered]);

  let flatIndex = 0;

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
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
              <Search className="h-4 w-4 text-white/25" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tools..."
                className="h-11 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>
            <div className="hide-scroll max-h-[280px] overflow-auto p-1.5">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/25">No results</p>
              ) : (
                Array.from(sections.entries()).map(([section, cmds]) => (
                  <div key={section}>
                    <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                      {section}
                    </p>
                    {cmds.map(cmd => {
                      const idx = flatIndex++;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => navigate(cmd.href)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors duration-75 ${
                            selectedIndex === idx ? 'bg-white/[0.08] text-white' : 'text-white/40'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{cmd.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
