'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Replace, X, ChevronDown, ChevronUp } from 'lucide-react';

type FindReplaceBarProps = {
  open: boolean;
  onClose: () => void;
  onFind: (query: string) => void;
  onActiveIndexChange: (index: number) => void;
  onReplace: (find: string, replace: string, matchIndex: number) => void;
  onReplaceAll: (find: string, replace: string) => void;
  matchCount: number;
  readOnly?: boolean;
};

export function FindReplaceBar({
  open,
  onClose,
  onFind,
  onActiveIndexChange,
  onReplace,
  onReplaceAll,
  matchCount,
  readOnly = false,
}: FindReplaceBarProps) {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const findRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => findRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    onFind(find);
    setCurrentMatch(0);
  }, [find, onFind]);

  useEffect(() => {
    if (matchCount > 0 && currentMatch >= matchCount) setCurrentMatch(0);
  }, [matchCount, currentMatch]);

  const handleClose = () => {
    setFind('');
    setReplace('');
    setShowReplace(false);
    setCurrentMatch(0);
    onFind('');
    onClose();
  };

  useEffect(() => {
    onActiveIndexChange(currentMatch);
  }, [currentMatch, onActiveIndexChange]);

  const goNext = () => {
    if (matchCount === 0) return;
    setCurrentMatch(i => (i + 1) % matchCount);
  };

  const goPrev = () => {
    if (matchCount === 0) return;
    setCurrentMatch(i => (i - 1 + matchCount) % matchCount);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      goNext();
    }
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      goPrev();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="flex flex-col gap-1.5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div className="flex items-center gap-1.5">
            {!readOnly && (
              <button
                onClick={() => setShowReplace(r => !r)}
                className="shrink-0 text-white/20 transition-colors duration-100 hover:text-white/40"
              >
                {showReplace ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
            <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-black/25 px-2.5 py-1.5">
              <Search className="h-3 w-3 shrink-0 text-white/20" />
              <input
                ref={findRef}
                value={find}
                onChange={e => setFind(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Find..."
                className="min-w-0 flex-1 bg-transparent text-[12px] text-white/80 outline-none placeholder:text-white/20"
              />
              {find && (
                <span className="shrink-0 text-[10px] text-white/25">
                  {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : 'No results'}
                </span>
              )}
              <button
                onClick={goPrev}
                disabled={matchCount === 0}
                className="shrink-0 text-white/20 transition-colors duration-100 hover:text-white/40 disabled:opacity-20"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                onClick={goNext}
                disabled={matchCount === 0}
                className="shrink-0 text-white/20 transition-colors duration-100 hover:text-white/40 disabled:opacity-20"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 text-white/20 transition-colors duration-100 hover:text-white/40"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {showReplace && !readOnly && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 shrink-0" />
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-black/25 px-2.5 py-1.5">
                <Replace className="h-3 w-3 shrink-0 text-white/20" />
                <input
                  value={replace}
                  onChange={e => setReplace(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onReplace(find, replace, currentMatch);
                    }
                    if (e.key === 'Escape') handleClose();
                  }}
                  placeholder="Replace..."
                  className="min-w-0 flex-1 bg-transparent text-[12px] text-white/80 outline-none placeholder:text-white/20"
                />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onReplace(find, replace, currentMatch)}
                  disabled={!find || matchCount === 0}
                  className="rounded-md px-2 py-0.5 text-[10px] font-medium text-white/30 transition-colors duration-100 hover:bg-white/[0.06] hover:text-white/60 disabled:opacity-25"
                >
                  One
                </button>
                <button
                  onClick={() => onReplaceAll(find, replace)}
                  disabled={!find || matchCount === 0}
                  className="rounded-md px-2 py-0.5 text-[10px] font-medium text-white/30 transition-colors duration-100 hover:bg-white/[0.06] hover:text-white/60 disabled:opacity-25"
                >
                  All
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
