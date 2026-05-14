'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Trash2,
  Sparkles,
  Workflow,
  FileCode2,
  MoveRight,
  Search,
} from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { FindReplaceBar } from '@/components/find-replace-bar';
import { useToast } from '@/components/toast';
import {
  format as formatCode,
  convert,
  validate,
  detectFormat,
  type Format,
} from '@/lib/converters';
import { samples } from '@/lib/samples';
import { JsonFlowPreview } from '@/components/tools/json-flow-preview';

type OutputTab = 'json' | 'yaml' | 'toml' | 'flow';

const formats: { value: Format; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
];

export function JsonWorkspace() {
  const [input, setInput] = useState('');
  const [sourceFormat, setSourceFormat] = useState<Format>('json');
  const [indent, setIndent] = useState(2);
  const [activeTab, setActiveTab] = useState<OutputTab>('yaml');
  const [copied, setCopied] = useState(false);
  const [srcSearchOpen, setSrcSearchOpen] = useState(false);
  const [srcSearchQuery, setSrcSearchQuery] = useState('');
  const [outSearchOpen, setOutSearchOpen] = useState(false);
  const [outSearchQuery, setOutSearchQuery] = useState('');
  const [srcActiveIndex, setSrcActiveIndex] = useState(0);
  const [outActiveIndex, setOutActiveIndex] = useState(0);
  const { toast } = useToast();
  const prevInputRef = useRef('');

  const handleChange = useCallback((value: string) => {
    const wasPaste = value.length - prevInputRef.current.length > 5;
    prevInputRef.current = value;
    setInput(value);
    if (wasPaste && value.trim()) {
      const detected = detectFormat(value);
      if (detected) setSourceFormat(detected);
    }
  }, []);

  const formatted = useMemo(() => {
    if (!input.trim()) return null;
    const result = formatCode(input, sourceFormat, indent);
    return result.success ? result.output : null;
  }, [input, sourceFormat, indent]);

  const convertedJson = useMemo(() => {
    if (!input.trim() || sourceFormat === 'json') return null;
    const result = convert(input, sourceFormat, 'json');
    return result.success ? result.output : null;
  }, [input, sourceFormat]);

  const convertedYaml = useMemo(() => {
    if (!input.trim() || sourceFormat === 'yaml') return null;
    const result = convert(input, sourceFormat, 'yaml');
    return result.success ? result.output : null;
  }, [input, sourceFormat]);

  const convertedToml = useMemo(() => {
    if (!input.trim() || sourceFormat === 'toml') return null;
    const result = convert(input, sourceFormat, 'toml');
    return result.success ? result.output : null;
  }, [input, sourceFormat]);

  const validation = useMemo(() => {
    if (!input.trim()) return null;
    return validate(input, sourceFormat);
  }, [input, sourceFormat]);

  const isValid = validation?.success ?? false;

  const handleApplyFormat = useCallback(() => {
    if (formatted) {
      setInput(formatted);
      prevInputRef.current = formatted;
      toast('success', 'Formatted');
    }
  }, [formatted, toast]);

  const getActiveOutput = (): { text: string | null; format: Format } => {
    switch (activeTab) {
      case 'json':
        return { text: convertedJson, format: 'json' };
      case 'yaml':
        return { text: convertedYaml, format: 'yaml' };
      case 'toml':
        return { text: convertedToml, format: 'toml' };
      default:
        return { text: null, format: sourceFormat };
    }
  };

  const handleCopy = useCallback(async () => {
    const { text } = getActiveOutput();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast('success', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  }, [activeTab, convertedJson, convertedYaml, convertedToml, toast]);

  const handleClear = useCallback(() => {
    setInput('');
    prevInputRef.current = '';
  }, []);

  const handleSample = useCallback(() => {
    const sample = samples[sourceFormat] ?? samples.json!;
    setInput(sample);
    prevInputRef.current = sample;
  }, [sourceFormat]);

  const srcMatchCount = useMemo(() => {
    if (!srcSearchQuery || !input) return 0;
    try {
      const regex = new RegExp(srcSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return (input.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [srcSearchQuery, input]);

  const handleSrcReplace = useCallback(
    (find: string, replaceWith: string, matchIndex: number) => {
      if (!find) return;
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let count = 0;
      setInput(prev => {
        const updated = prev.replace(new RegExp(escaped, 'gi'), match => {
          if (count++ === matchIndex) return replaceWith;
          return match;
        });
        prevInputRef.current = updated;
        return updated;
      });
      toast('success', 'Replaced');
    },
    [toast]
  );

  const handleSrcReplaceAll = useCallback(
    (find: string, replaceWith: string) => {
      if (!find) return;
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      setInput(prev => {
        const updated = prev.split(new RegExp(escaped, 'gi')).join(replaceWith);
        prevInputRef.current = updated;
        return updated;
      });
      toast('success', 'Replaced all');
    },
    [toast]
  );

  const { text: activeOutput, format: activeFormat } = getActiveOutput();

  const outMatchCount = useMemo(() => {
    if (!outSearchQuery || !activeOutput) return 0;
    try {
      const regex = new RegExp(outSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return (activeOutput.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [outSearchQuery, activeOutput]);

  const hasInput = input.trim().length > 0;

  const outputTabs: { id: OutputTab; label: string; available: boolean }[] = [
    { id: 'json', label: 'JSON', available: sourceFormat !== 'json' },
    { id: 'yaml', label: 'YAML', available: sourceFormat !== 'yaml' },
    { id: 'toml', label: 'TOML', available: sourceFormat !== 'toml' },
    { id: 'flow', label: 'Flow', available: true },
  ];

  return (
    <div className="flex h-full flex-col gap-0 lg:flex-row lg:items-stretch">
      {/* Source column */}
      <motion.div
        className="flex min-h-0 flex-col gap-2"
        layout
        animate={{ flex: hasInput ? '1 1 0%' : '1 1 100%' }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 rounded-lg bg-black/20 p-0.5">
              {formats.map(f => (
                <button
                  key={f.value}
                  onClick={() => {
                    setSourceFormat(f.value);
                    if (activeTab === f.value) {
                      const fallback = formats.find(x => x.value !== f.value);
                      if (fallback) setActiveTab(fallback.value);
                    }
                  }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 ${
                    sourceFormat === f.value
                      ? 'bg-white/[0.08] text-white/80'
                      : 'text-white/25 hover:text-white/45'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {hasInput && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${isValid ? 'bg-emerald-400' : 'bg-red-400'}`}
                />
                <span
                  className={`text-[11px] font-medium ${isValid ? 'text-emerald-400/60' : 'text-red-400/60'}`}
                >
                  {isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasInput && formatted && formatted !== input && (
              <button
                onClick={handleApplyFormat}
                className="flex items-center gap-1 text-[11px] text-white/30 transition-colors duration-150 hover:text-white/60 active:scale-95"
              >
                <Sparkles className="h-3 w-3" /> Format
              </button>
            )}
            <div className="flex items-center gap-0.5 rounded-lg bg-black/20 p-0.5">
              {[2, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setIndent(n)}
                  className={`font-code rounded-md px-1.5 py-0.5 text-[10px] transition-colors duration-150 ${indent === n ? 'bg-white/[0.08] text-white/60' : 'text-white/20 hover:text-white/40'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            {hasInput && (
              <button
                onClick={() => setSrcSearchOpen(o => !o)}
                className={`transition-colors duration-150 ${srcSearchOpen ? 'text-white/50' : 'text-white/20 hover:text-white/40'}`}
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={handleSample}
              className="text-white/20 transition-colors duration-150 hover:text-white/40"
            >
              <FileCode2 className="h-3.5 w-3.5" />
            </button>
            {hasInput && (
              <button
                onClick={handleClear}
                className="text-white/20 transition-colors duration-150 hover:text-white/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <FindReplaceBar
          open={srcSearchOpen && hasInput}
          onClose={() => {
            setSrcSearchOpen(false);
            setSrcSearchQuery('');
            setSrcActiveIndex(0);
          }}
          onFind={setSrcSearchQuery}
          onActiveIndexChange={setSrcActiveIndex}
          onReplace={handleSrcReplace}
          onReplaceAll={handleSrcReplaceAll}
          matchCount={srcMatchCount}
        />

        <div className="min-h-[120px] flex-1 lg:min-h-0">
          <CodeEditor
            value={input}
            onChange={handleChange}
            format={sourceFormat}
            placeholder="Paste JSON, YAML, or TOML..."
            searchQuery={srcSearchQuery}
            searchActiveIndex={srcActiveIndex}
          />
        </div>
      </motion.div>

      {/* Arrow — hidden on mobile */}
      <AnimatePresence>
        {hasInput && (
          <motion.div
            className="hidden items-center px-2 lg:flex"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <MoveRight className="h-6 w-6 text-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output column */}
      <AnimatePresence>
        {hasInput && (
          <motion.div
            className="flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden pt-3 lg:pt-0"
            initial={{ flex: '0 0 0%', opacity: 0 }}
            animate={{ flex: '1 1 0%', opacity: 1 }}
            exit={{ flex: '0 0 0%', opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 rounded-lg bg-black/20 p-0.5">
                {outputTabs
                  .filter(t => t.available)
                  .map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors duration-150 ${
                        activeTab === tab.id
                          ? 'bg-white/[0.08] text-white/70'
                          : 'text-white/25 hover:text-white/45'
                      }`}
                    >
                      {tab.id === 'flow' && <Workflow className="h-3 w-3" />}
                      {tab.label}
                    </button>
                  ))}
              </div>
              <div className="flex items-center gap-2">
                {activeTab !== 'flow' && activeOutput && (
                  <button
                    onClick={() => setOutSearchOpen(o => !o)}
                    className={`transition-colors duration-150 ${outSearchOpen ? 'text-white/50' : 'text-white/20 hover:text-white/40'}`}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                )}
                {activeTab !== 'flow' && activeOutput && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-white/25 transition-colors duration-150 hover:text-white/50"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            <FindReplaceBar
              open={outSearchOpen && activeTab !== 'flow' && !!activeOutput}
              onClose={() => {
                setOutSearchOpen(false);
                setOutSearchQuery('');
                setOutActiveIndex(0);
              }}
              onFind={setOutSearchQuery}
              onActiveIndexChange={setOutActiveIndex}
              onReplace={() => {}}
              onReplaceAll={() => {}}
              matchCount={outMatchCount}
              readOnly
            />

            <div className="min-h-[120px] flex-1 lg:min-h-0">
              {activeTab === 'flow' ? (
                <div className="h-full min-h-[150px] overflow-hidden rounded-xl bg-black/15 lg:min-h-[250px]">
                  <JsonFlowPreview json={input} />
                </div>
              ) : activeOutput ? (
                <CodeEditor
                  value={activeOutput}
                  format={activeFormat}
                  readOnly
                  searchQuery={outSearchQuery}
                  searchActiveIndex={outActiveIndex}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl bg-black/15">
                  <p className="text-[11px] text-white/15">Cannot convert — check input syntax</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
