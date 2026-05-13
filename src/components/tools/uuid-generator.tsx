'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Copy, Check, ChevronUp } from 'lucide-react';

const HEX = '0123456789abcdef';
const SCRAMBLE_DURATION = 600;
const SWIPE_THRESHOLD = -50;

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
  const frameRef = useRef<number>(0);

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

function UuidBlock({ char, revealed, index }: { char: string; revealed: string; index: number }) {
  const isDash = char === '-';

  if (isDash) {
    return <span className="font-code mx-0.5 text-base text-white/15 md:mx-1 md:text-2xl">-</span>;
  }

  return (
    <span className="font-code inline-flex h-8 w-5 items-center justify-center rounded bg-white/[0.05] text-sm tabular-nums text-white/90 md:h-11 md:w-8 md:rounded-lg md:text-lg">
      {revealed}
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

  const [isMobile, setIsMobile] = useState(false);
  const y = useMotionValue(0);
  const scale = useTransform(y, [-80, 0], [0.95, 1]);
  const hintOpacity = useTransform(y, [-60, -20, 0], [1, 0.6, 0.3]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  const handleDragEnd = useCallback(() => {
    const current = y.get();
    if (current <= SWIPE_THRESHOLD) {
      animate(y, -100, {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        onComplete: () => {
          generate();
          animate(y, 0, { type: 'spring', stiffness: 400, damping: 28 });
        },
      });
    } else {
      animate(y, 0, { type: 'spring', stiffness: 500, damping: 35 });
    }
  }, [y, generate]);

  const copyOne = useCallback(async (uuid: string, i: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const scrambled = useScrambleReveal(current, generation);

  return (
    <div className="flex h-full flex-col items-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6 md:cursor-default"
          style={{ y, scale }}
          drag={isMobile ? 'y' : false}
          dragConstraints={{ top: -120, bottom: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {/* UUID blocks */}
          <div className="flex flex-wrap items-center justify-center gap-[2px] md:gap-[3px]">
            {current &&
              current
                .split('')
                .map((char, i) => (
                  <UuidBlock key={i} char={char} revealed={scrambled[i] ?? char} index={i} />
                ))}
          </div>

          {/* Segment labels */}
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-white/15">
            <span>time-low</span>
            <span>mid</span>
            <span>hi</span>
            <span>seq</span>
            <span>node</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => copyOne(current, 0)}
              className="flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50"
            >
              {copiedIndex === 0 ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedIndex === 0 ? 'Copied' : 'Copy'}
            </button>
          </div>

          <motion.div
            className="flex flex-col items-center gap-1 text-[11px] uppercase tracking-widest text-white/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="hidden md:inline">Space to regenerate</span>
            <motion.span className="flex items-center gap-1 md:hidden" style={{ opacity: hintOpacity }}>
              <ChevronUp className="h-3 w-3" />
              Swipe up to regenerate
            </motion.span>
          </motion.div>
        </motion.div>
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
                  <span className="font-code text-xs text-white/30">{uuid}</span>
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
