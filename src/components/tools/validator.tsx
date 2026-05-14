'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Trash } from '@phosphor-icons/react';
import { CodeEditor } from '@/components/code-editor';
import { FormatSelector } from '@/components/format-selector';
import { validate, detectFormat, type Format } from '@/lib/converters';

export function Validator() {
  const [input, setInput] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<Format>('json');
  const prevInputRef = useRef('');

  const handleChange = useCallback((value: string) => {
    const wasPaste = value.length - prevInputRef.current.length > 5;
    prevInputRef.current = value;
    setInput(value);

    if (wasPaste && value.trim()) {
      const detected = detectFormat(value);
      if (detected) setSelectedFormat(detected);
    }
  }, []);

  const validation = useMemo(() => {
    if (!input.trim()) return null;
    return validate(input, selectedFormat);
  }, [input, selectedFormat]);

  const statusDot =
    validation === null ? 'bg-white/10' : validation.success ? 'bg-emerald-400' : 'bg-red-400';

  const statusText =
    validation === null
      ? ''
      : validation.success
        ? 'Valid'
        : !validation.success && validation.line
          ? `Error at line ${validation.line}`
          : validation.error;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <FormatSelector
          value={selectedFormat}
          onChange={setSelectedFormat}
          layoutId="validator-format"
        />
        <div className="flex items-center gap-3">
          {validation && (
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${statusDot} transition-colors duration-200`}
              />
              <span
                className={`text-[11px] font-medium ${
                  validation.success ? 'text-emerald-400/70' : 'text-red-400/70'
                }`}
              >
                {statusText}
              </span>
            </div>
          )}
          {input.trim() && (
            <button
              onClick={() => setInput('')}
              className="text-white/20 transition-colors duration-150 hover:text-white/45"
            >
              <Trash weight="duotone" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-widest text-white/40">Input</span>
        <div className="relative flex-1">
          <CodeEditor
            value={input}
            onChange={handleChange}
            format={selectedFormat}
            placeholder={`Paste ${selectedFormat.toUpperCase()} — validates live as you type`}
          />
          {!input.trim() && (
            <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-[10px] text-white/20">
              live validation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
