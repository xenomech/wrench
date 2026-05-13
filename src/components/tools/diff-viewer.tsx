'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, FileCode2, Copy, Check } from 'lucide-react';
import { diffLines, diffWords, type Change } from 'diff';
import { ToolbarButton } from '@/components/toolbar-button';
import { useToast } from '@/components/toast';
import type { ReactNode } from 'react';

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob"];
users.forEach(greet);`;

const SAMPLE_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

const users = ["Alice", "Bob", "Charlie"];
users.forEach(user => greet(user));
console.log("Done");`;

function buildHighlights(changes: Change[], side: 'removed' | 'added'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < changes.length) {
    const change = changes[i]!;

    if (!change.added && !change.removed) {
      nodes.push(<span key={`u-${i}`}>{change.value}</span>);
      i++;
      continue;
    }

    if (change.removed && i + 1 < changes.length && changes[i + 1]!.added) {
      const removed = change;
      const added = changes[i + 1]!;
      const wordChanges = diffWords(removed.value, added.value);

      if (side === 'removed') {
        wordChanges.forEach((wc, wi) => {
          if (wc.removed)
            nodes.push(
              <span key={`wr-${i}-${wi}`} className="rounded-sm bg-red-500/30">
                {wc.value}
              </span>
            );
          else if (!wc.added)
            nodes.push(
              <span key={`wc-${i}-${wi}`} className="bg-red-500/10">
                {wc.value}
              </span>
            );
        });
      } else {
        wordChanges.forEach((wc, wi) => {
          if (wc.added)
            nodes.push(
              <span key={`wa-${i}-${wi}`} className="rounded-sm bg-emerald-500/30">
                {wc.value}
              </span>
            );
          else if (!wc.removed)
            nodes.push(
              <span key={`wc-${i}-${wi}`} className="bg-emerald-500/10">
                {wc.value}
              </span>
            );
        });
      }
      i += 2;
      continue;
    }

    if (change.removed && side === 'removed') {
      nodes.push(
        <span key={`r-${i}`} className="rounded-sm bg-red-500/30">
          {change.value}
        </span>
      );
    } else if (change.added && side === 'added') {
      nodes.push(
        <span key={`a-${i}`} className="rounded-sm bg-emerald-500/30">
          {change.value}
        </span>
      );
    }
    i++;
  }
  return nodes;
}

function HighlightedPane({
  value,
  onChange,
  highlights,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  highlights: ReactNode[] | null;
  placeholder: string;
  label: string;
}) {
  const hasHighlights = highlights && highlights.length > 0 && value.trim();

  return (
    <div className="flex min-h-[120px] flex-1 flex-col gap-2 md:min-h-[250px]">
      <span className="text-xs font-medium uppercase tracking-wider text-white/35">{label}</span>
      <div className="relative flex-1">
        {hasHighlights && (
          <div
            aria-hidden
            className="font-code pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-xl p-4 text-sm leading-relaxed text-white"
          >
            {highlights}
          </div>
        )}
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`font-code placeholder:text-white/22 relative h-full w-full resize-none rounded-xl bg-black/20 p-4 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-white/10 ${
            hasHighlights ? 'text-transparent caret-white selection:bg-white/10' : 'text-white/90'
          }`}
        />
      </div>
    </div>
  );
}

export function DiffViewer() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const changes = useMemo(() => {
    if (!original.trim() || !modified.trim()) return [];
    return diffLines(original, modified);
  }, [original, modified]);

  const hasChanges = changes.some(c => c.added || c.removed);

  const originalHighlights = useMemo(
    () => (hasChanges ? buildHighlights(changes, 'removed') : null),
    [changes, hasChanges]
  );
  const modifiedHighlights = useMemo(
    () => (hasChanges ? buildHighlights(changes, 'added') : null),
    [changes, hasChanges]
  );

  const stats = useMemo(() => {
    let added = 0,
      removed = 0;
    changes.forEach(c => {
      const lines = (c.value.match(/\n/g) || []).length + (c.value.endsWith('\n') ? 0 : 1);
      if (c.added) added += c.count ?? lines;
      if (c.removed) removed += c.count ?? lines;
    });
    return { added, removed };
  }, [changes]);

  const handleCopy = useCallback(async () => {
    const diffText = changes
      .map(c => {
        const prefix = c.added ? '+ ' : c.removed ? '- ' : '  ';
        return c.value
          .split('\n')
          .filter(Boolean)
          .map(l => prefix + l)
          .join('\n');
      })
      .join('\n');
    await navigator.clipboard.writeText(diffText);
    setCopied(true);
    toast('success', 'Diff copied');
    setTimeout(() => setCopied(false), 2000);
  }, [changes, toast]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                +{stats.added}
              </span>
              <span className="rounded-lg bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                -{stats.removed}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ToolbarButton
            onClick={() => {
              setOriginal(SAMPLE_ORIGINAL);
              setModified(SAMPLE_MODIFIED);
            }}
          >
            <FileCode2 className="h-4 w-4" /> Sample
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              setOriginal('');
              setModified('');
            }}
          >
            <Trash2 className="h-4 w-4" /> Clear
          </ToolbarButton>
          {hasChanges && (
            <ToolbarButton onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy Diff'}
            </ToolbarButton>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
        <HighlightedPane
          value={original}
          onChange={setOriginal}
          highlights={originalHighlights}
          placeholder="Paste original text..."
          label="Original"
        />
        <HighlightedPane
          value={modified}
          onChange={setModified}
          highlights={modifiedHighlights}
          placeholder="Paste modified text..."
          label="Modified"
        />
      </div>
    </div>
  );
}
