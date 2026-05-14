'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ChevronRight, ChevronsLeftRight } from 'lucide-react';
import { ShinyText } from '@/components/shiny-text';

type SwipeRailProps = {
  leftLabel?: string;
  rightLabel?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
};

const THUMB_SIZE = 44;
const THUMB_PAD = 4;
const COMPLETE_THRESHOLD = 0.6;

export function SwipeRail({
  leftLabel,
  rightLabel,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: SwipeRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const biDirectional = !!onSwipeLeft && !!onSwipeRight;

  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setTrackWidth(el.offsetWidth);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setTrackWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fullTravel = Math.max(0, trackWidth - THUMB_SIZE - THUMB_PAD * 2);
  const maxRight = biDirectional ? fullTravel / 2 : fullTravel;
  const maxLeft = biDirectional ? fullTravel / 2 : 0;

  const safeMax = Math.max(1, maxRight);
  const safeMin = Math.max(1, maxLeft);

  const rightOpacity = biDirectional
    ? useTransform(x, [0, safeMax * 0.3, safeMax], [0.35, 0.8, 1])
    : useMotionValue(1);
  const leftOpacity = biDirectional
    ? useTransform(x, [-safeMin, -safeMin * 0.3, 0], [1, 0.8, 0.35])
    : useMotionValue(0);

  const rightFill = useTransform(x, [0, safeMax], [0, 1]);
  const rightFillWidth = useTransform(rightFill, v => `${v * 100}%`);
  const leftFill = biDirectional
    ? useTransform(x, [-safeMin, 0], [1, 0])
    : useMotionValue(0);
  const leftFillWidth = useTransform(leftFill, v => `${v * 100}%`);

  const thumbRestPx = biDirectional
    ? (trackWidth - THUMB_SIZE) / 2
    : THUMB_PAD;
  const textClipLeft = useTransform(x, v => {
    const thumbRight = thumbRestPx + v + THUMB_SIZE + 4;
    return `inset(0 0 0 ${thumbRight}px)`;
  });
  const textClipRight = biDirectional
    ? useTransform(x, v => {
        const thumbLeft = thumbRestPx + v - 4;
        return `inset(0 ${trackWidth - thumbLeft}px 0 0)`;
      })
    : undefined;

  const handleDragEnd = useCallback(() => {
    const current = x.get();

    if (maxRight > 0 && current / maxRight >= COMPLETE_THRESHOLD && onSwipeRight) {
      animate(x, maxRight, {
        type: 'spring', stiffness: 500, damping: 30,
        onComplete: () => {
          animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 });
          onSwipeRight();
        },
      });
    } else if (biDirectional && maxLeft > 0 && current / -maxLeft >= COMPLETE_THRESHOLD && onSwipeLeft) {
      animate(x, -maxLeft, {
        type: 'spring', stiffness: 500, damping: 30,
        onComplete: () => {
          animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 });
          onSwipeLeft();
        },
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 35 });
    }
  }, [x, maxRight, maxLeft, biDirectional, onSwipeLeft, onSwipeRight]);

  const thumbLeft = biDirectional
    ? `calc(50% - ${THUMB_SIZE / 2}px)`
    : `${THUMB_PAD}px`;

  return (
    <div
      ref={trackRef}
      className="relative flex h-12 w-full items-center overflow-hidden rounded-2xl bg-white/[0.04]"
    >
      {/* Fill indicators */}
      {biDirectional && (
        <motion.div
          className="absolute left-0 top-0 h-full rounded-2xl bg-white/[0.04]"
          style={{ width: leftFillWidth }}
        />
      )}
      <motion.div
        className="absolute right-0 top-0 h-full rounded-2xl bg-white/[0.04]"
        style={{ width: rightFillWidth }}
      />

      {/* Bidirectional: left label — clips as thumb moves left over it */}
      {biDirectional && leftLabel && (
        <motion.span
          className="pointer-events-none absolute left-4 z-10"
          style={{ opacity: leftOpacity, clipPath: textClipRight }}
        >
          <ShinyText
            text={leftLabel}
            speed={3}
            color="rgba(255,255,255,0.25)"
            shineColor="rgba(255,255,255,0.6)"
            spread={120}
            direction="right"
            className="text-[11px] font-medium uppercase tracking-widest"
          />
        </motion.span>
      )}

      {/* Bidirectional: right label — clips as thumb moves right over it */}
      {rightLabel && biDirectional && (
        <motion.span
          className="pointer-events-none absolute right-4 z-10"
          style={{ opacity: rightOpacity, clipPath: textClipLeft }}
        >
          <ShinyText
            text={rightLabel}
            speed={3}
            color="rgba(255,255,255,0.25)"
            shineColor="rgba(255,255,255,0.6)"
            spread={120}
            direction="left"
            className="text-[11px] font-medium uppercase tracking-widest"
          />
        </motion.span>
      )}

      {/* Single direction: centered label — clips as thumb slides right */}
      {rightLabel && !biDirectional && (
        <motion.span
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          style={{ clipPath: textClipLeft }}
        >
          <ShinyText
            text={`Swipe to ${rightLabel}`}
            speed={3}
            color="rgba(255,255,255,0.25)"
            shineColor="rgba(255,255,255,0.6)"
            spread={120}
            direction="left"
            className="text-[11px] font-medium uppercase tracking-widest"
          />
        </motion.span>
      )}

      {/* Thumb */}
      <motion.div
        className="absolute z-20 flex touch-none items-center justify-center rounded-xl bg-white/15 border border-white/10"
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE - 8,
          left: thumbLeft,
          x,
          cursor: disabled ? 'not-allowed' : 'grab',
        }}
        drag={disabled ? false : 'x'}
        dragConstraints={trackRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
      >
        {biDirectional ? (
          <ChevronsLeftRight className="h-4 w-4 text-white/50" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/50" />
        )}
      </motion.div>
    </div>
  );
}
