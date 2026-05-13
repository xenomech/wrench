'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Entry = { key: string; value: string; type: string };
type JsonCardData = { label: string; entries: Entry[]; isArray: boolean; isRoot: boolean };

const TYPE_COLORS: Record<string, string> = {
  string: 'text-[#a8d4a2]',
  number: 'text-[#d4a87a]',
  boolean: 'text-[#d4a87a]',
  null: 'text-white/30',
  object: 'text-[#8cc8e8]',
  array: 'text-[#c9a0dc]',
};

export function JsonCardNode({ data }: NodeProps) {
  const { label, entries, isArray, isRoot } = data as JsonCardData;
  const [collapsed, setCollapsed] = useState(false);

  const visibleEntries = collapsed ? [] : entries;
  const headerColor = isRoot ? 'text-amber-300' : isArray ? 'text-[#c9a0dc]' : 'text-[#8cc8e8]';
  const headerBg = isRoot ? 'bg-amber-500/8' : isArray ? 'bg-violet-500/8' : 'bg-sky-500/8';

  return (
    <div className="min-w-[160px] max-w-[220px] overflow-hidden rounded-lg bg-[#16161e]/90 shadow-lg shadow-black/30 backdrop-blur-sm">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !rounded-full !border-[1.5px] !border-[#16161e] !bg-white/30"
      />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`flex w-full items-center gap-1.5 px-2.5 py-1.5 ${headerBg} transition-colors duration-100`}
      >
        {collapsed ? (
          <ChevronRight className="h-2.5 w-2.5 text-white/30" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5 text-white/30" />
        )}
        <span className={`text-[10px] font-bold ${headerColor}`}>{label}</span>
        <span className="font-code ml-auto text-[9px] text-white/20">
          {isArray ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </button>

      {visibleEntries.length > 0 && (
        <div className="flex flex-col">
          {visibleEntries.map((entry, i) => {
            const isLink = entry.type === 'object' || entry.type === 'array';
            return (
              <div
                key={i}
                className={`flex items-center justify-between gap-2 px-2.5 py-1 ${
                  i % 2 === 0 ? 'bg-white/[0.01]' : ''
                } ${isLink ? 'opacity-60' : ''}`}
              >
                <span className="font-code shrink-0 text-[9px] text-white/50">{entry.key}</span>
                <span
                  className={`font-code truncate text-[9px] ${TYPE_COLORS[entry.type] ?? 'text-white/60'}`}
                >
                  {entry.value}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !rounded-full !border-[1.5px] !border-[#16161e] !bg-white/30"
      />
    </div>
  );
}
