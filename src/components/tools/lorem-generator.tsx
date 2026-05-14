'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWords, generateSentences, generateParagraphs } from '@/lib/lorem';
import { CopyButton } from '@/components/copy-button';

type Unit = 'words' | 'sentences' | 'paragraphs';

export function LoremGenerator() {
  const [unit, setUnit] = useState<Unit>('sentences');
  const [output, setOutput] = useState('');
  const [generation, setGeneration] = useState(0);
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

      <div
        className="flex flex-1 items-center justify-center px-4 active:scale-[0.99] md:px-8 md:active:scale-100"
        onClick={generate}
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
                      delay: i * 0.005,
                      duration: 0.1,
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
      </div>

      <div className="flex flex-col items-center gap-3 pb-4">
        <CopyButton text={output} label="Copy" copiedLabel="Copied" size="sm" className="flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50" />

        <motion.p
          className="text-[11px] uppercase tracking-widest text-white/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="hidden lg:inline">Space to regenerate</span>
          <span className="lg:hidden">Tap to regenerate</span>
        </motion.p>
      </div>
    </div>
  );
}
