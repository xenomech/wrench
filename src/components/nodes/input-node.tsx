'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import type { Format } from '@/lib/converters';

export function InputNode({ data, id }: NodeProps) {
  const nodeData = data as { value?: string; format?: Format; label?: string };
  const [value, setValue] = useState(nodeData.value ?? '');
  const [format, setFormat] = useState<Format>(nodeData.format ?? 'json');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    nodeData.value = v;
  };

  const handleFormatChange = (f: Format) => {
    setFormat(f);
    nodeData.format = f;
  };

  return (
    <div className="w-[320px] rounded-2xl bg-[#181820] shadow-xl shadow-black/30">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
          Input
        </span>
        <div className="flex gap-1">
          {(['json', 'yaml', 'toml'] as Format[]).map(f => (
            <button
              key={f}
              onClick={() => handleFormatChange(f)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors duration-100 ${
                format === f ? 'bg-white/[0.1] text-white/80' : 'text-white/25 hover:text-white/45'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="px-2 pb-2">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Paste your data..."
          rows={6}
          className="font-code w-full resize-none rounded-xl bg-black/30 p-3 text-xs leading-relaxed text-white/85 outline-none placeholder:text-white/20"
          spellCheck={false}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-[#181820] !bg-amber-400/60"
      />
    </div>
  );
}
