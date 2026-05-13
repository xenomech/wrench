'use client';

import type { ReactNode } from 'react';

type ToolbarButtonProps = {
  onClick: () => void;
  children: ReactNode;
  variant?: 'default' | 'primary';
  disabled?: boolean;
};

export function ToolbarButton({
  onClick,
  children,
  variant = 'default',
  disabled = false,
}: ToolbarButtonProps) {
  const base =
    'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-all duration-150 active:scale-[0.96] disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100';
  const variants = {
    default: 'text-white/45 hover:text-white/75 hover:bg-white/[0.06]',
    primary:
      'bg-white/[0.08] text-white/85 hover:bg-white/[0.12] hover:text-white shadow-sm shadow-black/10',
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}
