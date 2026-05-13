'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Copy, Check, ChevronUp } from 'lucide-react';
import { generateWords, generateSentences, generateParagraphs } from '@/lib/lorem';

type Unit = 'words' | 'sentences' | 'paragraphs';

const SWIPE_THRESHOLD = -50;

export function LoremGenerator() {
  const [unit, setUnit] = useState<Unit>('sentences');
  const [output, setOutput] = useState('');
  const [generation, setGeneration] = useState(0);
  const [copied, setCopied] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const y = useMotionValue(0);
  const scale = useTransform(y, [-80, 0], [0.97, 1]);
  const hintOpacity = useTransform(y, [-60, -20, 0], [1, 0.6, 0.3]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const generate = useCallback(() => {
    let text = '';
    switch (unit) {
      case 'words':
        text = generateWords(12);
        break;
      case 'sentences':
        text = generateSentences(3);
        break;
      case 'paragraphs':
        text = generateParagraphs(2);
        break;
    }
    setOutput(text);
    setGeneration(g => g + 1);
  }, [unit]);

  useEffect(() => {
    generate();
  }, [unit]);

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

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const words = output.split(/(\s+)/);

  return (
    <div className="flex h-full flex-col items-center">
      <div className="flex items-center gap-4 pb-6 pt-2">
        {(['words', 'sentences', 'paragraphs'] as Unit[]).map(u => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`text-xs uppercase tracking-widest transition-colors duration-150 ${
              unit === u ? 'text-white/70' : 'text-white/20 hover:text-white/40'
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      <motion.div
        className="flex flex-1 items-center justify-center px-4 md:px-8"
        style={{ y, scale }}
        drag={isMobile ? 'y' : false}
        dragConstraints={{ top: -120, bottom: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-2xl text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={generation}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-sans text-base leading-relaxed md:text-lg"
            >
              {words.map((word, i) => {
                if (/^\s+$/.test(word)) return <span key={i}>{word}</span>;
                return (
                  <motion.span
                    key={`${generation}-${i}`}
                    className="inline-block text-white/80"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.008,
                      duration: 0.12,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-3 pb-4">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>

        <motion.div
          className="text-[11px] uppercase tracking-widest text-white/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="hidden md:inline">Space to regenerate</span>
          <motion.span className="flex items-center gap-1 md:hidden" style={{ opacity: hintOpacity }}>
            <ChevronUp className="h-3 w-3" />
            Swipe up to regenerate
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
