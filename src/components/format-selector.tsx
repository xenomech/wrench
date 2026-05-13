'use client';

import { motion } from 'framer-motion';
import type { Format } from '@/lib/converters';

const formats: { value: Format; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
];

type FormatSelectorProps = {
  value: Format;
  onChange: (format: Format) => void;
  layoutId: string;
};

export function FormatSelector({ value, onChange, layoutId }: FormatSelectorProps) {
  return (
    <div className="flex gap-0.5 rounded-xl bg-black/20 p-1">
      {formats.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className="relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150"
          style={{ color: value === f.value ? '#fff' : 'rgba(255,255,255,0.35)' }}
        >
          {value === f.value && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-lg bg-white/[0.1] shadow-sm shadow-black/10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10">{f.label}</span>
        </button>
      ))}
    </div>
  );
}
