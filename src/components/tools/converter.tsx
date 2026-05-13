'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Copy, Check, Trash2 } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { FormatSelector } from '@/components/format-selector';
import { useToast } from '@/components/toast';
import { convert, detectFormat, type Format } from '@/lib/converters';

export function Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState<Format>('json');
  const [toFormat, setToFormat] = useState<Format>('yaml');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const prevInputRef = useRef('');

  const runConvert = useCallback(
    (text: string, from: Format, to: Format) => {
      if (!text.trim()) {
        setOutput('');
        return;
      }
      const result = convert(text, from, to);
      if (result.success) {
        setOutput(result.output);
        toast('success', `${from.toUpperCase()} → ${to.toUpperCase()}`);
      } else {
        setOutput('');
        toast('error', result.error);
      }
    },
    [toast]
  );

  const handleChange = useCallback(
    (value: string) => {
      const wasPaste = value.length - prevInputRef.current.length > 5;
      prevInputRef.current = value;
      setInput(value);
      setOutput('');

      if (wasPaste && value.trim()) {
        const detected = detectFormat(value);
        if (detected) {
          setFromFormat(detected);
          const target = detected === 'json' ? 'yaml' : 'json';
          setToFormat(target);
          setTimeout(() => {
            const result = convert(value, detected, target);
            if (result.success) {
              setOutput(result.output);
              toast(
                'success',
                `Auto-converted ${detected.toUpperCase()} → ${target.toUpperCase()}`
              );
            }
          }, 50);
        }
      }
    },
    [toast]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runConvert(input, fromFormat, toFormat);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [input, fromFormat, toFormat, runConvert]);

  const handleSwap = useCallback(() => {
    setFromFormat(toFormat);
    setToFormat(fromFormat);
    if (output) {
      setInput(output);
      setOutput('');
    }
  }, [fromFormat, toFormat, output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const hasOutput = output.length > 0;
  const hasInput = input.trim().length > 0;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FormatSelector value={fromFormat} onChange={setFromFormat} layoutId="converter-from" />
          <button
            onClick={handleSwap}
            className="rounded-lg p-1.5 text-white/25 transition-all duration-150 hover:bg-white/[0.05] hover:text-white/50 active:scale-90"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <FormatSelector value={toFormat} onChange={setToFormat} layoutId="converter-to" />
        </div>
        {hasInput && (
          <button
            onClick={() => {
              setInput('');
              setOutput('');
            }}
            className="text-white/20 transition-colors duration-150 hover:text-white/45"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <motion.div
          className="flex min-h-0 flex-col gap-1.5"
          layout
          animate={{ flex: hasOutput ? '1 1 0%' : '1 1 100%' }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="text-[11px] uppercase tracking-widest text-white/25">
            {fromFormat.toUpperCase()}
          </span>
          <div className="relative flex-1">
            <CodeEditor
              value={input}
              onChange={handleChange}
              format={fromFormat}
              placeholder={`Paste ${fromFormat.toUpperCase()} — auto-converts on paste`}
            />
            {hasInput && !hasOutput && (
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-[10px] text-white/20">
                <kbd className="font-mono">&#8984;&#9166;</kbd> convert
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {hasOutput && (
            <motion.div
              className="flex min-h-0 min-w-0 flex-col gap-1.5 overflow-hidden"
              initial={{ flex: '0 0 0%', opacity: 0 }}
              animate={{ flex: '1 1 0%', opacity: 1 }}
              exit={{ flex: '0 0 0%', opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-white/25">
                  {toFormat.toUpperCase()}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-white/25 transition-colors duration-150 hover:text-white/50"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex-1">
                <CodeEditor value={output} format={toFormat} readOnly />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
