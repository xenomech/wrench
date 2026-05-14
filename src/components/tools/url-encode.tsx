'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Trash2, ArrowDown } from 'lucide-react';
import { useToast } from '@/components/toast';
import { SwipeRail } from '@/components/swipe-rail';

export function UrlEncodeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [lastAction, setLastAction] = useState<'encode' | 'decode' | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleEncode = useCallback(() => {
    if (!input.trim()) return;
    setOutput(encodeURIComponent(input));
    setLastAction('encode');
    toast('success', 'URL encoded');
  }, [input, toast]);

  const handleDecode = useCallback(() => {
    if (!input.trim()) return;
    try {
      setOutput(decodeURIComponent(input));
      setLastAction('decode');
      toast('success', 'URL decoded');
    } catch {
      toast('error', 'Invalid URL-encoded string');
    }
  }, [input, toast]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleEncode();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        handleDecode();
      }
    },
    [handleEncode, handleDecode]
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setLastAction(null);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches)
    inputRef.current?.focus();
  }, []);

  const hasInput = input.trim().length > 0;
  const hasOutput = output.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex flex-col items-center justify-center transition-all duration-300 ${hasOutput ? 'py-4' : 'flex-1'}`}
      >
        {!hasInput && !hasOutput && (
          <motion.p
            className="mb-6 text-xs uppercase tracking-widest text-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Paste or type text
          </motion.p>
        )}

        <div className="w-full max-w-2xl px-4 md:px-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setOutput('');
              setLastAction(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter text or URL-encoded string..."
            rows={hasOutput ? 2 : 3}
            className="font-code w-full resize-none bg-transparent text-center text-base text-white/85 outline-none placeholder:text-white/15 md:text-lg"
            spellCheck={false}
          />
        </div>

        {hasInput && !hasOutput && (
          <motion.div
            className="mt-4 hidden items-center gap-3 text-[11px] uppercase tracking-widest text-white/15 lg:flex"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>Enter to encode</span>
            <span className="text-white/10">·</span>
            <span>Shift+Enter to decode</span>
          </motion.div>
        )}

        {hasOutput && (
          <button
            onClick={handleClear}
            className="mt-2 flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {hasOutput && (
          <motion.div
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto pt-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="mx-auto mb-2 flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-widest text-white/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
            >
              <ArrowDown className="h-3 w-3" />
              {lastAction === 'encode' ? 'Encoded' : 'Decoded'}
            </motion.div>

            <div className="relative flex-1 rounded-xl bg-black/25 p-4">
              <button
                onClick={handleCopy}
                className="absolute right-3 top-3 text-white/20 transition-colors duration-150 hover:text-white/50"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="font-code whitespace-pre-wrap break-all pr-8 text-sm leading-relaxed text-white/85">
                {output}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasInput && !hasOutput && (
        <motion.div
          className="shrink-0 px-4 pb-4 lg:hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SwipeRail
            leftLabel="Decode"
            rightLabel="Encode"
            onSwipeLeft={handleDecode}
            onSwipeRight={handleEncode}
          />
        </motion.div>
      )}
    </div>
  );
}
