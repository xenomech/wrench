'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, DownloadSimple, Copy, Check, ArrowCounterClockwise } from '@phosphor-icons/react';
import { toPng } from 'html-to-image';
import { useToast } from '@/components/toast';

const GRADIENTS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #10b981, #059669)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #f43f5e, #e879f9)' },
  { name: 'Amber', value: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { name: 'Slate', value: 'linear-gradient(135deg, #334155, #1e293b)' },
  { name: 'Peach', value: 'linear-gradient(135deg, #fed7aa, #fecaca)' },
  { name: 'Sky', value: 'linear-gradient(135deg, #bae6fd, #c4b5fd)' },
  { name: 'Mesh', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Candy', value: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { name: 'White', value: '#ffffff' },
  { name: 'Dark', value: '#0a0a0a' },
  { name: 'None', value: 'transparent' },
];

const CANVAS_SIZES: { name: string; w: number | null; h: number | null }[] = [
  { name: 'Auto', w: null, h: null },
  { name: 'Twitter', w: 1200, h: 675 },
  { name: 'Instagram', w: 1080, h: 1080 },
  { name: 'LinkedIn', w: 1200, h: 627 },
  { name: 'Product Hunt', w: 1270, h: 760 },
  { name: 'OG Image', w: 1200, h: 630 },
  { name: '16:9', w: 1920, h: 1080 },
];

const SHADOWS: Record<string, string> = {
  none: 'none',
  sm: '0 4px 12px rgba(0,0,0,0.12)',
  md: '0 8px 30px rgba(0,0,0,0.2)',
  lg: '0 16px 50px rgba(0,0,0,0.3)',
  xl: '0 25px 80px rgba(0,0,0,0.4)',
};

function BrowserFrame({ radius }: { radius: number }) {
  return (
    <div
      className="flex items-center gap-2 bg-[#1c1c1e] px-3 py-2"
      style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius }}
    >
      <div className="flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="mx-auto flex-1">
        <div className="mx-auto w-48 rounded-md bg-white/[0.06] px-3 py-0.5 text-center text-[10px] text-white/25">
          localhost
        </div>
      </div>
      <div className="w-[52px]" />
    </div>
  );
}

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-colors ${
        dragging ? 'border-orange-400/30 bg-orange-400/[0.03]' : 'border-white/[0.08] hover:border-white/[0.15]'
      }`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <Image weight="duotone" className="h-10 w-10 text-white/15" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-white/40">Drop screenshot or click to upload</p>
        <p className="text-[10px] uppercase tracking-widest text-white/20">PNG, JPG, WebP &middot; or paste with ⌘V</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, suffix }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/30">{label}</span>
        <span className="font-code text-[10px] text-white/40">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step ?? 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-white/50 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/60"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20">{title}</span>
      {children}
    </div>
  );
}

export function ScreenshotTool() {
  const [image, setImage] = useState<string | null>(null);
  const [background, setBackground] = useState(GRADIENTS[0]!.value);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]!);
  const [padding, setPadding] = useState(48);
  const [radius, setRadius] = useState(12);
  const [shadow, setShadow] = useState('md');
  const [showFrame, setShowFrame] = useState(true);
  const [scale, setScale] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [inset, setInset] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      if (file && file.type.startsWith('image/')) { e.preventDefault(); handleFile(file); }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [handleFile]);

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      const url = await toPng(previewRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = url;
      link.click();
      toast('success', 'Downloaded screenshot.png');
    } catch { toast('error', 'Failed to export'); }
  }, [toast]);

  const handleCopy = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      const url = await toPng(previewRef.current, { pixelRatio: 2 });
      const res = await fetch(url);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      toast('success', 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch { toast('error', 'Failed to copy'); }
  }, [toast]);

  const handleReset = useCallback(() => {
    setImage(null);
    setPadding(48); setRadius(12); setShadow('md'); setShowFrame(true);
    setScale(100); setRotate(0); setTiltX(0); setTiltY(0); setInset(0); setPosX(0); setPosY(0);
    setCanvasSize(CANVAS_SIZES[0]!);
  }, []);

  const transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotate(${rotate}deg) scale(${scale / 100})`;

  if (!image) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <motion.p className="mb-6 text-center text-xs uppercase tracking-widest text-white/30"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          Beautify your screenshots
        </motion.p>
        <div className="w-full max-w-lg"><DropZone onFile={handleFile} /></div>
      </div>
    );
  }

  const canvasStyle: React.CSSProperties = canvasSize.w
    ? { width: canvasSize.w / 2, height: canvasSize.h! / 2, background, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : { background, padding: padding + inset, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div className="hide-scroll flex h-full flex-col gap-4 overflow-auto lg:flex-row lg:gap-0">
      {/* Workspace */}
      <div
        className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-auto lg:min-h-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Canvas size label */}
        {canvasSize.w && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-white/[0.04] px-2 py-0.5 font-code text-[10px] text-white/20">
            {canvasSize.w} &times; {canvasSize.h}
          </span>
        )}

        {/* Preview — this is what gets exported */}
        <div
          ref={previewRef}
          className="shrink-0 shadow-2xl shadow-black/20"
          style={canvasStyle}
        >
          {/* Handles + screenshot wrapper — transforms applied here so handles stay in sync */}
          <div
            className="group/handles relative shrink-0"
            style={{
              padding: canvasSize.w ? padding + inset : 0,
              transform,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Rotation handle */}
            <div
              className="absolute -top-8 left-1/2 z-30 flex -translate-x-1/2 cursor-grab flex-col items-center opacity-0 transition-opacity group-hover/handles:opacity-100"
              onPointerDown={e => {
                e.stopPropagation();
                e.preventDefault();
                const target = e.currentTarget.closest('.group\\/handles');
                if (!target) return;
                const rect = target.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const onMove = (ev: PointerEvent) => {
                  const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90;
                  setRotate(Math.round(Math.max(-15, Math.min(15, angle))));
                };
                const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
                window.addEventListener('pointermove', onMove);
                window.addEventListener('pointerup', onUp);
              }}
            >
              <div className="h-2.5 w-2.5 rounded-full border-2 border-white/30 bg-white/10" />
              <div className="h-5 w-px bg-white/15" />
            </div>

            {/* Corner resize handles — L-shaped lines matching border radius */}
            {(() => {
              const s = Math.max(16, radius + 4);
              const b = '2px solid rgba(255,255,255,0.35)';
              return [
                { pos: 'top-0 left-0', cursor: 'nwse-resize', dx: -1, css: { borderTop: b, borderLeft: b, borderTopLeftRadius: radius } },
                { pos: 'top-0 right-0', cursor: 'nesw-resize', dx: 1, css: { borderTop: b, borderRight: b, borderTopRightRadius: radius } },
                { pos: 'bottom-0 right-0', cursor: 'nwse-resize', dx: 1, css: { borderBottom: b, borderRight: b, borderBottomRightRadius: radius } },
                { pos: 'bottom-0 left-0', cursor: 'nesw-resize', dx: -1, css: { borderBottom: b, borderLeft: b, borderBottomLeftRadius: radius } },
              ].map((h, i) => (
                <div
                  key={i}
                  className={`absolute ${h.pos} z-30 opacity-0 transition-opacity group-hover/handles:opacity-100`}
                  style={{ cursor: h.cursor, width: s, height: s, ...h.css }}
                  onPointerDown={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    const startX = e.clientX;
                    const startScale = scale;
                    const onMove = (ev: PointerEvent) => {
                      const delta = (ev.clientX - startX) * h.dx;
                      setScale(Math.round(Math.max(50, Math.min(150, startScale + delta / 3))));
                    };
                    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                />
              ));
            })()}

            {/* Screenshot — draggable for position */}
            <motion.div
              className="touch-none cursor-grab active:cursor-grabbing"
              drag
              dragConstraints={previewRef}
              dragMomentum={false}
              dragElastic={0.1}
              onDragEnd={(_, info) => { setPosX(p => p + info.offset.x); setPosY(p => p + info.offset.y); }}
              style={{ x: posX, y: posY }}
            >
              <div className="pointer-events-none overflow-hidden" style={{ borderRadius: radius, boxShadow: SHADOWS[shadow] }}>
                {showFrame && <BrowserFrame radius={radius} />}
                <img
                  src={image} alt="Screenshot" className="block select-none" draggable={false}
                  style={{
                    maxWidth: canvasSize.w ? '100%' : 'min(600px, 65vw)',
                    height: 'auto',
                    borderBottomLeftRadius: radius,
                    borderBottomRightRadius: radius,
                    borderTopLeftRadius: showFrame ? 0 : radius,
                    borderTopRightRadius: showFrame ? 0 : radius,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="hide-scroll shrink-0 space-y-5 border-white/[0.04] px-3 pb-6 lg:w-[270px] lg:overflow-auto lg:border-l lg:py-4 lg:pl-5 lg:pr-1">
        {/* Canvas */}
        <Section title="Canvas">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Size</span>
            <div className="flex flex-wrap gap-1">
              {CANVAS_SIZES.map(s => (
                <button key={s.name} onClick={() => setCanvasSize(s)}
                  className={`rounded-md px-2 py-1 text-[9px] font-semibold transition-colors ${
                    canvasSize.name === s.name ? 'bg-white/[0.08] text-white/70' : 'text-white/25 hover:text-white/40'
                  }`}
                >{s.name}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Background</span>
            <div className="flex flex-wrap gap-1.5">
              {GRADIENTS.map(g => (
                <button key={g.name} onClick={() => setBackground(g.value)} title={g.name}
                  className={`h-6 w-6 rounded-md border-2 transition-all ${
                    background === g.value ? 'border-white/40 scale-110' : 'border-white/[0.06] hover:border-white/20'
                  }`}
                  style={{
                    background: g.value === 'transparent'
                      ? 'repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, transparent 0% 50%) 0 0 / 8px 8px'
                      : g.value,
                  }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Screenshot */}
        <Section title="Screenshot">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Frame</span>
            <div className="flex gap-0.5 rounded-lg bg-black/20 p-0.5">
              {(['On', 'Off'] as const).map(v => (
                <button key={v} onClick={() => setShowFrame(v === 'On')}
                  className={`rounded-md px-2 py-0.5 text-[9px] font-semibold transition-colors ${
                    (v === 'On') === showFrame ? 'bg-white/[0.08] text-white/70' : 'text-white/25 hover:text-white/40'
                  }`}
                >{v}</button>
              ))}
            </div>
          </div>
          <Slider label="Roundness" value={radius} min={0} max={32} step={2} onChange={setRadius} suffix="px" />
          <Slider label="Shadow" value={Object.keys(SHADOWS).indexOf(shadow)} min={0} max={4} step={1}
            onChange={i => setShadow(Object.keys(SHADOWS)[i]!)}
            suffix={` (${shadow})`}
          />
          <Slider label="Padding" value={padding} min={0} max={128} step={4} onChange={setPadding} suffix="px" />
          <Slider label="Inset" value={inset} min={0} max={64} step={2} onChange={setInset} suffix="px" />
        </Section>

        {/* Transform */}
        <Section title="Transform">
          <Slider label="Size" value={scale} min={50} max={150} step={5} onChange={setScale} suffix="%" />
          <Slider label="Rotate" value={rotate} min={-15} max={15} step={1} onChange={setRotate} suffix="°" />
          <Slider label="Tilt X" value={tiltX} min={-20} max={20} step={1} onChange={setTiltX} suffix="°" />
          <Slider label="Tilt Y" value={tiltY} min={-20} max={20} step={1} onChange={setTiltY} suffix="°" />
        </Section>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.1] hover:text-white/80">
            <DownloadSimple weight="duotone" className="h-4 w-4" /> Download
          </button>
          <button onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.1] hover:text-white/80">
            {copied ? <Check weight="duotone" className="h-4 w-4 text-emerald-400" /> : <Copy weight="duotone" className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <button onClick={handleReset}
          className="flex w-full items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-white/20 transition-colors hover:text-white/40">
          <ArrowCounterClockwise weight="duotone" className="h-3 w-3" /> New screenshot
        </button>
      </div>
    </div>
  );
}
