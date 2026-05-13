'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { NodeData } from '@/components/tools/json-pipeline';

export function OutputNode({ data }: NodeProps) {
  const nodeData = data as NodeData;
  const value = nodeData.value ?? '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-[320px] rounded-2xl bg-[#181820] shadow-xl shadow-black/30">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#181820] !bg-amber-400/60"
      />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
          Output
        </span>
        {value && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-white/25 transition-colors duration-150 hover:text-white/50"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <div className="px-2 pb-2">
        <pre className="font-code max-h-[200px] overflow-auto rounded-xl bg-black/30 p-3 text-xs leading-relaxed text-white/85">
          {value || <span className="text-white/20">Run the pipeline to see output...</span>}
        </pre>
      </div>
    </div>
  );
}
