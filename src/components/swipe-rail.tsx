"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { CaretRight, DotsSixVertical } from "@phosphor-icons/react";
import { ShinyText } from "@/components/shiny-text";
import { useSound } from "@/hooks/use-sound";
import { tick001Sound } from "@/sounds/tick-001";
import { useSoundStore } from "@/lib/sound-store";

type SwipeRailProps = {
  leftLabel?: string;
  rightLabel?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
};

const THUMB = 44;
const PAD = 5;
const THRESHOLD = 0.6;

export function SwipeRail({
  leftLabel,
  rightLabel,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: SwipeRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackW, setTrackW] = useState(0);
  const x = useMotionValue(0);
  const biDir = !!onSwipeLeft && !!onSwipeRight;
  const soundEnabled = useSoundStore((s) => s.enabled);
  const [playTick] = useSound(tick001Sound, { volume: 0.4, soundEnabled });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setTrackW(el.offsetWidth);
    const ro = new ResizeObserver(([e]) => {
      if (e) setTrackW(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const travel = Math.max(0, trackW - THUMB - PAD * 2);
  const maxR = biDir ? travel / 2 : travel;
  const maxL = biDir ? travel / 2 : 0;
  const thumbRest = biDir ? (trackW - THUMB) / 2 : PAD;

  const thumbRightEdge = useTransform(x, (v) => thumbRest + v + THUMB);
  const thumbLeftEdge = useTransform(x, (v) => thumbRest + v);

  const rightClip = useTransform(
    thumbRightEdge,
    (px) => `inset(0 0 0 ${px}px)`,
  );
  const leftClip = useTransform(
    thumbLeftEdge,
    (px) => `inset(0 ${trackW - px}px 0 0)`,
  );

  const sR = Math.max(1, maxR);
  const sL = Math.max(1, maxL);
  const rightFillW = useTransform(x, [0, sR], ["0%", "100%"]);
  const leftFillRaw = useTransform(x, [-sL, 0], ["100%", "0%"]);
  const leftFillZero = useMotionValue("0%");
  const leftFillW = biDir ? leftFillRaw : leftFillZero;

  const thumbGlow = useTransform(x, (v) => {
    const ratio = biDir ? Math.abs(v) / sR : v / sR;
    return Math.min(ratio * 0.4, 0.4);
  });
  const thumbShadow = useTransform(
    thumbGlow,
    (g) => `0 0 ${g * 40}px rgba(255,255,255,${g}), 0 2px 8px rgba(0,0,0,0.4)`,
  );

  const handleDragEnd = useCallback(() => {
    const cur = x.get();
    if (
      (maxR > 0 && cur / maxR >= THRESHOLD) ||
      (biDir && maxL > 0 && cur / -maxL >= THRESHOLD)
    ) {
      (document.activeElement as HTMLElement)?.blur();
      playTick();
    }
    if (maxR > 0 && cur / maxR >= THRESHOLD && onSwipeRight) {
      animate(x, maxR, {
        type: "spring",
        stiffness: 500,
        damping: 30,
        onComplete: () => {
          animate(x, 0, { type: "spring", stiffness: 400, damping: 28 });
          onSwipeRight();
        },
      });
    } else if (biDir && maxL > 0 && cur / -maxL >= THRESHOLD && onSwipeLeft) {
      animate(x, -maxL, {
        type: "spring",
        stiffness: 500,
        damping: 30,
        onComplete: () => {
          animate(x, 0, { type: "spring", stiffness: 400, damping: 28 });
          onSwipeLeft();
        },
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
    }
  }, [x, maxR, maxL, biDir, onSwipeLeft, onSwipeRight, playTick]);

  return (
    <div
      ref={trackRef}
      className="relative flex w-full items-center overflow-hidden rounded-full"
      style={{
        height: THUMB + PAD * 2,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 100%)",
        boxShadow:
          "inset 0 1px 3px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      {/* Fill bars */}
      {biDir && (
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{
            width: leftFillW,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
          }}
        />
      )}
      <motion.div
        className="absolute right-0 top-0 h-full"
        style={{
          width: rightFillW,
          background: biDir
            ? "linear-gradient(270deg, rgba(255,255,255,0.06) 0%, transparent 100%)"
            : "linear-gradient(270deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
        }}
      />

      {/* Right label */}
      {rightLabel && (
        <motion.div
          className={`pointer-events-none absolute inset-0 z-10 flex items-center ${biDir ? "justify-end pr-5" : "justify-center"}`}
          style={{ clipPath: rightClip }}
        >
          <ShinyText
            text={biDir ? rightLabel : `Swipe to ${rightLabel}`}
            speed={3}
            color="rgba(255,255,255,0.2)"
            shineColor="rgba(255,255,255,0.5)"
            spread={120}
            direction="left"
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
          />
        </motion.div>
      )}

      {/* Left label */}
      {biDir && leftLabel && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-start pl-5"
          style={{ clipPath: leftClip }}
        >
          <ShinyText
            text={leftLabel}
            speed={3}
            color="rgba(255,255,255,0.2)"
            shineColor="rgba(255,255,255,0.5)"
            spread={120}
            direction="right"
            className="text-[10px] font-semibold uppercase tracking-[0.15em]"
          />
        </motion.div>
      )}

      {/* Thumb */}
      <motion.div
        className="absolute z-20 flex touch-none items-center justify-center rounded-full"
        style={{
          width: THUMB,
          height: THUMB,
          left: biDir ? `calc(50% - ${THUMB / 2}px)` : `${PAD}px`,
          x,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)",
          boxShadow: thumbShadow,
          border: "1px solid rgba(255,255,255,0.1)",
          cursor: disabled ? "not-allowed" : "grab",
        }}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: biDir ? -maxL : 0, right: maxR }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing", scale: 0.96 }}
      >
        {biDir ? (
          <DotsSixVertical weight="duotone" className="h-4 w-4 text-white/40" />
        ) : (
          <CaretRight weight="duotone" className="h-4 w-4 text-white/40" />
        )}
      </motion.div>
    </div>
  );
}
