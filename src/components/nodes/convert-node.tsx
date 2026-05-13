'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react';
import type { NodeData } from '@/components/tools/json-pipeline';
import type { Format } from '@/lib/converters';

export function ConvertNode({ data }: NodeProps) {
  const nodeData = data as NodeData;
  const status = nodeData.status;
  const target = nodeData.targetFormat ?? 'yaml';

  return (
    <div className="w-[180px] rounded-2xl bg-[#181820] shadow-xl shadow-black/30">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#181820] !bg-violet-400/60"
      />
      <div className="flex flex-col items-center gap-2 px-4 py-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            status === 'success'
              ? 'bg-emerald-500/15'
              : status === 'error'
                ? 'bg-red-500/15'
                : 'bg-white/[0.06]'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : status === 'error' ? (
            <XCircle className="h-5 w-5 text-red-400" />
          ) : (
            <ArrowRightLeft className="h-5 w-5 text-white/40" />
          )}
        </div>
        <span className="text-[12px] font-semibold text-white/70">Convert</span>
        <div className="flex gap-1">
          {(['json', 'yaml', 'toml'] as Format[]).map(f => (
            <button
              key={f}
              onClick={() => {
                (nodeData as any).targetFormat = f;
              }}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors duration-100 ${
                target === f ? 'bg-white/[0.1] text-white/70' : 'text-white/25 hover:text-white/45'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {status === 'error' && nodeData.error && (
          <p className="mt-1 text-center text-[10px] leading-tight text-red-400/70">
            {nodeData.error}
          </p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#181820] !bg-violet-400/60"
      />
    </div>
  );
}
