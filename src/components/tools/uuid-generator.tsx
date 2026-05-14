'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

const HEX = '0123456789abcdef';
const SCRAMBLE_DURATION = 600;

function generateUUID(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

function useScrambleReveal(target: string, trigger: number) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!target) return;

    const startTime = Date.now();
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);

      const chars = target.split('').map((char, i) => {
        if (char === '-') return '-';
        const charProgress = Math.max(0, (progress - i / target.length) * target.length);
        if (charProgress >= 1) return char;
        return HEX[Math.floor(Math.random() * HEX.length)]!;
      });

      setDisplay(chars.join(''));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger]);

  return display;
}

const SEGMENT_LABELS = ['time-low', 'mid', 'hi', 'seq', 'node'] as const;

function UuidBlock({ char }: { char: string }) {
  return (
    <span className="font-code inline-flex h-7 w-[18px] items-center justify-center rounded bg-white/[0.05] text-xs tabular-nums text-white/90 md:h-9 md:w-6 md:text-sm lg:h-11 lg:w-8 lg:rounded-lg lg:text-lg">
      {char}
    </span>
  );
}

export function UuidGenerator() {
  const [current, setCurrent] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const currentRef = useRef(current);
  currentRef.current = current;

  useEffect(() => {
    setCurrent(generateUUID());
    setGeneration(1);
  }, []);

  const generate = useCallback(() => {
    setHistory(h => [currentRef.current, ...h].slice(0, 4));
    setCurrent(generateUUID());
    setGeneration(g => g + 1);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generate]);

  const copyOne = useCallback(async (uuid: string, i: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const scrambled = useScrambleReveal(current, generation);

  return (
    <div className="flex h-full flex-col items-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Mobile + Tablet: stacked segments with labels */}
          <div
            className="flex flex-col gap-2.5 active:scale-[0.97] lg:hidden"
            onClick={generate}
          >
            {current &&
              current.split('-').map((segment, si) => (
                <div key={si} className="flex items-center gap-3">
                  <span className="w-16 text-right text-[10px] uppercase tracking-widest text-white/20">
                    {SEGMENT_LABELS[si]}
                  </span>
                  <div className="flex gap-[2px]">
                    {segment.split('').map((char, ci) => (
                      <UuidBlock
                        key={ci}
                        char={scrambled ? scrambled.split('-')[si]?.[ci] ?? char : char}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop: inline blocks with labels below */}
          <div
            className="hidden flex-col items-center gap-6 lg:flex"
          >
            <div className="flex items-center gap-[3px]">
              {current &&
                current.split('').map((char, i) => {
                  if (char === '-') {
                    return <span key={i} className="font-code mx-1 text-2xl text-white/15">-</span>;
                  }
                  return <UuidBlock key={i} char={scrambled[i] ?? char} />;
                })}
            </div>
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-white/15">
              {SEGMENT_LABELS.map(label => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); copyOne(current, 0); }}
              className="flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50"
            >
              {copiedIndex === 0 ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedIndex === 0 ? 'Copied' : 'Copy'}
            </button>
          </div>

          <motion.p
            className="text-[11px] uppercase tracking-widest text-white/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="hidden lg:inline">Space to regenerate</span>
            <span className="lg:hidden">Tap to regenerate</span>
          </motion.p>
        </div>
      </div>

      <div className="h-[120px] w-full max-w-lg shrink-0 pb-4 md:h-[160px]">
        {history.length > 0 && (
          <>
            <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-white/15">
              Previous
            </p>
            <div className="flex flex-col items-center gap-1">
              {history.map((uuid, i) => (
                <div
                  key={uuid}
                  className="group flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-white/[0.03]"
                >
                  <span className="font-code text-[10px] text-white/30 md:text-xs">{uuid}</span>
                  <button
                    onClick={() => copyOne(uuid, i + 1)}
                    className="text-white/0 transition-colors duration-150 hover:!text-white/50 group-hover:text-white/25"
                  >
                    {copiedIndex === i + 1 ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
