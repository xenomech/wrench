'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import type { NodeData } from '@/components/tools/json-pipeline';

export function ValidateNode({ data }: NodeProps) {
  const nodeData = data as NodeData;
  const status = nodeData.status;

  return (
    <div className="w-[180px] rounded-2xl bg-[#181820] shadow-xl shadow-black/30">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#181820] !bg-emerald-400/60"
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
            <ShieldCheck className="h-5 w-5 text-white/40" />
          )}
        </div>
        <span className="text-[12px] font-semibold text-white/70">Validate</span>
        {status === 'error' && nodeData.error && (
          <p className="mt-1 text-center text-[10px] leading-tight text-red-400/70">
            {nodeData.error}
          </p>
        )}
        {status === 'success' && <p className="text-[10px] text-emerald-400/70">Valid</p>}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#181820] !bg-emerald-400/60"
      />
    </div>
  );
}
