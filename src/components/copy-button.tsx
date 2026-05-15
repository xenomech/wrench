"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import { useSound } from "@/hooks/use-sound";
import { clickSoftSound } from "@/sounds/click-soft";
import { useSoundStore } from "@/lib/sound-store";

type CopyButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onCopied?: () => void;
};

const iconSize = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function CopyButton({
  text,
  label,
  copiedLabel = "Copied",
  size = "sm",
  className = "",
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const soundEnabled = useSoundStore((s) => s.enabled);
  const [playClick] = useSound(clickSoftSound, { soundEnabled });

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    playClick();
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  }, [text, onCopied, playClick]);

  const icon = copied ? (
    <Check weight="duotone" className={`${iconSize[size]} text-emerald-400`} />
  ) : (
    <Copy weight="duotone" className={iconSize[size]} />
  );

  return (
    <button
      onClick={handleCopy}
      className={
        className ||
        "text-white/20 transition-colors duration-150 hover:text-white/50"
      }
    >
      {label ? (
        <span className="flex items-center gap-1.5">
          {icon}
          {copied ? copiedLabel : label}
        </span>
      ) : (
        icon
      )}
    </button>
  );
}
