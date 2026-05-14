'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, DownloadSimple, ArrowCounterClockwise, Copy, Check, Warning } from '@phosphor-icons/react';
import { generateAllFavicons, generateHTMLMarkup, type FaviconResult } from '@/lib/favicon-generator';
import { CopyButton } from '@/components/copy-button';
import { useToast } from '@/components/toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
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
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-white/40">Drop image or click to upload</p>
        <p className="text-[10px] uppercase tracking-widest text-white/15">PNG, JPG, SVG, WebP &middot; 512x512 recommended</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

function PreviewCard({ label, src, size }: { label: string; src: string; size: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center rounded-lg bg-white/[0.03] p-3">
        <img src={src} alt={label} style={{ width: Math.min(64, parseInt(size)), height: Math.min(64, parseInt(size)) }} className="rounded-sm" />
      </div>
      <div className="text-center">
        <p className="font-code text-[10px] text-white/40">{size}</p>
        <p className="text-[9px] uppercase tracking-widest text-white/20">{label}</p>
      </div>
    </div>
  );
}

function BrowserTabPreview({ src }: { src: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06]">
      <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
        </div>
        <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-2.5 py-1">
          <img src={src} alt="favicon" className="h-3.5 w-3.5" />
          <span className="text-[10px] text-white/30">My Website</span>
        </div>
      </div>
      <div className="h-16 bg-white/[0.01]" />
    </div>
  );
}

export function FaviconTool() {
  const [result, setResult] = useState<FaviconResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setOriginalPreview(URL.createObjectURL(file));
    try {
      const res = await generateAllFavicons(file);
      setResult(res);
      toast('success', `Generated ${res.files.size} files`);
    } catch (e: any) {
      toast('error', e.message || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleDownload = useCallback(async () => {
    if (!result) return;
    const zip = new JSZip();
    for (const [name, blob] of result.files) {
      zip.file(name, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'favicons.zip');
    toast('success', 'Downloaded favicons.zip');
  }, [result, toast]);

  const handleReset = useCallback(() => {
    setResult(null);
    setOriginalPreview(null);
  }, []);

  const htmlMarkup = generateHTMLMarkup();
  const isSmall = result && (result.originalSize.width < 512 || result.originalSize.height < 512);

  return (
    <div className="flex h-full flex-col items-center overflow-auto">
      {!result && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="w-full max-w-lg">
            <DropZone onFile={handleFile} />
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <motion.div
            className="h-8 w-8 rounded-full border-2 border-orange-400/30 border-t-orange-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-[11px] uppercase tracking-widest text-white/20">Generating favicons...</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            className="w-full max-w-3xl space-y-6 px-4 py-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Original + warning */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {originalPreview && (
                  <img src={originalPreview} alt="Original" className="h-10 w-10 rounded-lg" />
                )}
                <div>
                  <p className="text-xs text-white/40">
                    {result.originalSize.width} &times; {result.originalSize.height}
                  </p>
                  {isSmall && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400/60">
                      <Warning weight="duotone" className="h-3 w-3" />
                      512x512 recommended for best quality
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/20 transition-colors hover:text-white/40"
              >
                <ArrowCounterClockwise weight="duotone" className="h-3.5 w-3.5" />
                New
              </button>
            </div>

            {/* Browser tab preview */}
            <div className="flex flex-col gap-2">
              <span className="px-1 text-[10px] uppercase tracking-widest text-white/15">Preview</span>
              <div className="grid gap-3 md:grid-cols-2">
                <BrowserTabPreview src={result.previews.get('favicon-32x32.png')!} />
                <div className="flex items-center justify-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-2xl bg-white/[0.06] p-3">
                      <img src={result.previews.get('apple-touch-icon.png')!} alt="iOS" className="h-14 w-14 rounded-xl" />
                    </div>
                    <span className="text-[9px] text-white/20">iOS</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-full bg-white/[0.06] p-3">
                      <img src={result.previews.get('android-chrome-192x192.png')!} alt="Android" className="h-12 w-12 rounded-full" />
                    </div>
                    <span className="text-[9px] text-white/20">Android</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated sizes grid */}
            <div className="flex flex-col gap-2">
              <span className="px-1 text-[10px] uppercase tracking-widest text-white/15">Generated Files</span>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {[
                  { name: 'favicon-16x16.png', label: 'Favicon', size: '16' },
                  { name: 'favicon-32x32.png', label: 'Favicon 2x', size: '32' },
                  { name: 'mstile-150x150.png', label: 'MS Tile', size: '150' },
                  { name: 'apple-touch-icon.png', label: 'Apple Touch', size: '180' },
                  { name: 'android-chrome-192x192.png', label: 'Android', size: '192' },
                  { name: 'android-chrome-512x512.png', label: 'Android HD', size: '512' },
                ].map(item => (
                  <PreviewCard
                    key={item.name}
                    label={item.label}
                    src={result.previews.get(item.name)!}
                    size={`${item.size}px`}
                  />
                ))}
              </div>
            </div>

            {/* HTML Markup */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase tracking-widest text-white/15">HTML Markup</span>
                <CopyButton text={htmlMarkup} label="Copy" copiedLabel="Copied" size="sm" className="flex items-center gap-1 text-[10px] text-white/20 transition-colors hover:text-white/40" />
              </div>
              <pre className="font-code overflow-auto rounded-lg bg-white/[0.02] p-3 text-[11px] leading-relaxed text-white/40">
                {htmlMarkup}
              </pre>
            </div>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.1] hover:text-white/80"
            >
              <DownloadSimple weight="duotone" className="h-4 w-4" />
              Download All (ZIP)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
