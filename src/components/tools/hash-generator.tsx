'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Trash2 } from 'lucide-react';
import { useToast } from '@/components/toast';
import { SwipeRail } from '@/components/swipe-rail';
import { md5 } from '@/lib/md5';

async function computeHash(algorithm: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

type Hashes = { md5: string; sha1: string; sha256: string };

const HASH_COLORS = [
  { label: 'MD5', key: 'md5' as const, color: 'text-violet-400/60' },
  { label: 'SHA-1', key: 'sha1' as const, color: 'text-amber-400/60' },
  { label: 'SHA-256', key: 'sha256' as const, color: 'text-emerald-400/60' },
];

export function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Hashes | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;
    const [sha1, sha256] = await Promise.all([
      computeHash('SHA-1', input),
      computeHash('SHA-256', input),
    ]);
    setHashes({ md5: md5(input), sha1, sha256 });
    toast('success', 'Hashes generated');
  }, [input, toast]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  const handleClear = useCallback(() => {
    setInput('');
    setHashes(null);
    inputRef.current?.focus();
  }, []);

  const copyHash = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasInput = input.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex flex-col items-center justify-center transition-all duration-300 ${hashes ? 'py-4' : 'flex-1'}`}
      >
        {!hasInput && !hashes && (
          <motion.p
            className="mb-6 text-xs uppercase tracking-widest text-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Type text to hash
          </motion.p>
        )}

        <div className="w-full max-w-2xl px-4 md:px-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setHashes(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter text to hash..."
            rows={hashes ? 2 : 3}
            className="font-code w-full resize-none bg-transparent text-center text-base text-white/85 outline-none placeholder:text-white/15 md:text-lg"
            spellCheck={false}
          />
        </div>

        {hasInput && !hashes && (
          <motion.p
            className="mt-4 hidden text-[11px] uppercase tracking-widest text-white/15 lg:block"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Press Enter to generate
          </motion.p>
        )}

        {hashes && (
          <button
            onClick={handleClear}
            className="mt-2 flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {hashes && (
          <motion.div
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto pt-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {HASH_COLORS.map((row, i) => (
              <motion.div
                key={row.key}
                className="relative rounded-xl bg-black/25 p-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-widest ${row.color}`}
                  >
                    {row.label}
                  </span>
                  <button
                    onClick={() => copyHash(hashes[row.key], row.key)}
                    className="text-white/20 transition-colors duration-150 hover:text-white/50"
                  >
                    {copiedField === row.key ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <p className="font-code break-all text-sm leading-relaxed text-white/80">
                  {hashes[row.key]}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hasInput && !hashes && (
        <motion.div
          className="shrink-0 px-4 pb-4 lg:hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SwipeRail
            rightLabel="Generate"
            onSwipeRight={handleGenerate}
          />
        </motion.div>
      )}
    </div>
  );
}
