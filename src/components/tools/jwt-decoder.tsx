'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2, Copy, Check, Trash2 } from 'lucide-react';
import { SwipeRail } from '@/components/swipe-rail';
import { useToast } from '@/components/toast';
import { CodeEditor } from '@/components/code-editor';

function decodeBase64Url(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

type JwtData = {
  header: string;
  payload: string;
  signature: string;
  expiry: { expired: boolean; date: Date } | null;
};

function parseJwt(token: string): JwtData {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 parts');

  const header = JSON.stringify(JSON.parse(decodeBase64Url(parts[0]!)), null, 2);
  const payloadObj = JSON.parse(decodeBase64Url(parts[1]!));
  const payload = JSON.stringify(payloadObj, null, 2);
  const signature = parts[2]!;

  let expiry: JwtData['expiry'] = null;
  if (payloadObj.exp) {
    const date = new Date(payloadObj.exp * 1000);
    expiry = { expired: date < new Date(), date };
  }

  return { header, payload, signature, expiry };
}

function JsonBlock({ label, value, color }: { label: string; value: string; color: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col gap-1.5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${color}`}>
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="text-white/20 transition-colors duration-150 hover:text-white/50"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <div className="min-h-[80px] flex-1">
        <CodeEditor value={value} format="json" readOnly />
      </div>
    </motion.div>
  );
}

function TokenDisplay({ value }: { value: string }) {
  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const colors = ['text-violet-400', 'text-amber-400', 'text-red-400'];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-1">
      <div className="font-code flex text-lg font-medium" style={{ wordBreak: 'break-all' }}>
        {parts.map((part, pi) => (
          <span key={pi} className="flex">
            {pi > 0 && <span className="text-white/20">.</span>}
            <AnimatePresence initial={false} mode="popLayout">
              {part.split('').map((char, ci) => (
                <motion.span
                  key={`${pi}-${ci}-${char}`}
                  className={colors[pi]}
                  initial={{ y: '60%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '60%', opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {char}
                </motion.span>
              ))}
            </AnimatePresence>
          </span>
        ))}
      </div>
    </div>
  );
}

export function JwtDecoderTool() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<JwtData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDecode = useCallback(() => {
    if (!input.trim()) return;
    try {
      const data = parseJwt(input);
      setDecoded(data);
      toast('success', 'JWT decoded');
    } catch (e: any) {
      setDecoded(null);
      toast('error', e.message);
    }
  }, [input, toast]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleDecode();
      }
    },
    [handleDecode]
  );

  const handleClear = useCallback(() => {
    setInput('');
    setDecoded(null);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches)
    inputRef.current?.focus();
  }, []);

  const hasToken = input.trim().length > 0;
  const showHint = !hasToken && !decoded;

  return (
    <div className="flex h-full flex-col">
      {/* Token input area */}
      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-300 ${decoded ? 'py-4' : 'flex-1'}`}
      >
        {showHint && (
          <motion.p
            className="mb-6 text-xs uppercase tracking-widest text-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Paste a JWT token
          </motion.p>
        )}

        <div className="relative w-full max-w-2xl px-4 md:px-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setDecoded(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="eyJhbGciOiJIUzI1NiIs..."
            className={`font-code w-full bg-transparent text-center outline-none placeholder:text-white/15 ${
              hasToken && input.split('.').length === 3 ? 'text-transparent caret-white' : 'text-white/80'
            } ${decoded ? 'text-sm md:text-base' : 'text-base md:text-lg'}`}
            spellCheck={false}
            autoComplete="off"
          />

          {hasToken && <TokenDisplay value={input} />}
        </div>

        {hasToken && !decoded && (
          <motion.p
            className="mt-4 hidden text-[11px] uppercase tracking-widest text-white/15 lg:block"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Press Enter to decode
          </motion.p>
        )}

        {decoded && (
          <button
            onClick={handleClear}
            className="mt-2 flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Decoded output */}
      <AnimatePresence>
        {decoded && (
          <motion.div
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto pt-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {decoded.expiry && (
              <motion.div
                className={`mx-auto flex items-center gap-2.5 rounded-full px-5 py-2 text-[13px] font-medium ${
                  decoded.expiry.expired
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {decoded.expiry.expired ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <Clock className="h-3 w-3" />
                {decoded.expiry.expired ? 'Expired' : 'Valid'} —{' '}
                {decoded.expiry.date.toLocaleString()}
              </motion.div>
            )}

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
              <JsonBlock label="Header" value={decoded.header} color="text-violet-400/60" />
              <JsonBlock label="Payload" value={decoded.payload} color="text-amber-400/60" />
            </div>

            <motion.div
              className="flex flex-col gap-1.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest text-red-400/40">
                Signature
              </span>
              <p
                className="font-code rounded-lg bg-black/25 p-3 text-[12px] leading-relaxed text-white/25"
                style={{ wordBreak: 'break-all' }}
              >
                {decoded.signature}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasToken && !decoded && (
        <motion.div
          className="shrink-0 px-4 pb-4 lg:hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SwipeRail
            rightLabel="Decode"
            onSwipeRight={handleDecode}
          />
        </motion.div>
      )}
    </div>
  );
}
