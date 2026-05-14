'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Trash, FlowArrow, Code } from '@phosphor-icons/react';
import { CodeEditor } from '@/components/code-editor';
import { FormatSelector } from '@/components/format-selector';
import { useToast } from '@/components/toast';
import { format as formatCode, detectFormat, type Format } from '@/lib/converters';
import { JsonFlowPreview } from '@/components/tools/json-flow-preview';

type OutputView = 'code' | 'flow';

export function Formatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<Format>('json');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [outputView, setOutputView] = useState<OutputView>('code');
  const { toast } = useToast();
  const prevInputRef = useRef('');

  const runFormat = useCallback(
    (text: string, fmt: Format) => {
      if (!text.trim()) {
        setOutput('');
        return;
      }
      const result = formatCode(text, fmt, indent);
      if (result.success) {
        setOutput(result.output);
        toast('success', 'Formatted');
      } else {
        setOutput('');
        toast('error', result.error);
      }
    },
    [indent, toast]
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
          setSelectedFormat(detected);
          setTimeout(() => {
            const result = formatCode(value, detected, indent);
            if (result.success) {
              setOutput(result.output);
              toast('success', `Auto-formatted ${detected.toUpperCase()}`);
            }
          }, 50);
        }
      }
    },
    [indent, toast]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runFormat(input, selectedFormat);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [input, selectedFormat, runFormat]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const hasOutput = output.length > 0;
  const hasInput = input.trim().length > 0;
  const showFlow = selectedFormat === 'json' && hasOutput;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <FormatSelector
          value={selectedFormat}
          onChange={setSelectedFormat}
          layoutId="formatter-format"
        />
        <div className="flex items-center gap-2">
          {showFlow && (
            <div className="flex items-center gap-0.5 rounded-lg bg-black/20 p-0.5">
              <button
                onClick={() => setOutputView('code')}
                className={`rounded-md p-1.5 transition-colors duration-150 ${
                  outputView === 'code'
                    ? 'bg-white/[0.08] text-white/70'
                    : 'text-white/25 hover:text-white/45'
                }`}
              >
                <Code weight="duotone" className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOutputView('flow')}
                className={`rounded-md p-1.5 transition-colors duration-150 ${
                  outputView === 'flow'
                    ? 'bg-white/[0.08] text-white/70'
                    : 'text-white/25 hover:text-white/45'
                }`}
              >
                <FlowArrow weight="duotone" className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {hasInput && (
            <button
              onClick={() => {
                setInput('');
                setOutput('');
              }}
              className="text-white/20 transition-colors duration-150 hover:text-white/45"
            >
              <Trash weight="duotone" className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center gap-1 rounded-lg bg-black/20 px-2 py-1">
            <span className="text-[11px] text-white/25">indent</span>
            {[2, 4].map(n => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`font-code rounded px-1.5 py-0.5 text-[11px] transition-colors duration-150 ${
                  indent === n
                    ? 'bg-white/[0.08] text-white/70'
                    : 'text-white/25 hover:text-white/45'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <motion.div
          className="flex min-h-0 flex-col gap-1.5"
          layout
          animate={{ flex: hasOutput ? '1 1 0%' : '1 1 100%' }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="text-[11px] uppercase tracking-widest text-white/40">Input</span>
          <div className="relative flex-1">
            <CodeEditor
              value={input}
              onChange={handleChange}
              format={selectedFormat}
              placeholder={`Paste ${selectedFormat.toUpperCase()} — auto-formats on paste`}
            />
            {hasInput && !hasOutput && (
              <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-[10px] text-white/20">
                <kbd className="font-mono">&#8984;&#9166;</kbd> format
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
                <span className="text-[11px] uppercase tracking-widest text-white/40">
                  {outputView === 'flow' ? 'Flow' : 'Output'}
                </span>
                {outputView === 'code' && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-white/25 transition-colors duration-150 hover:text-white/50"
                  >
                    {copied ? <Check weight="duotone" className="h-3 w-3 text-emerald-400" /> : <Copy weight="duotone" className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div className="flex-1">
                {outputView === 'code' ? (
                  <CodeEditor value={output} format={selectedFormat} readOnly />
                ) : (
                  <div className="h-full overflow-hidden rounded-xl bg-black/15">
                    <JsonFlowPreview json={output} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
