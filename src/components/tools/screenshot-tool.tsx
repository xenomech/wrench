"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  DownloadSimple,
  ArrowCounterClockwise,
  Browser,
  DeviceMobile,
  DeviceTablet,
  Sun,
  Moon,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ArrowsOutCardinal,
} from "@phosphor-icons/react";
import { useToast } from "@/components/toast";
import { saveAs } from "file-saver";

type DeviceFrame = "browser" | "phone" | "tablet";
type FrameTheme = "dark" | "light";
type ImageTransform = { scale: number; x: number; y: number };

type Background = {
  id: string;
  label: string;
  value: string;
  className: string;
  style?: React.CSSProperties;
};

const BACKGROUNDS: Background[] = [
  {
    id: "transparent",
    label: "None",
    value: "transparent",
    className:
      "bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23333%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23333%22/%3E%3Crect%20x%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23444%22/%3E%3Crect%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23444%22/%3E%3C/svg%3E')]",
  },
  {
    id: "midnight",
    label: "Midnight",
    value: "#0f172a",
    style: {
      background:
        "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%), radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.08) 0%, transparent 60%)",
    },
    className: "",
  },
  {
    id: "ocean",
    label: "Ocean",
    value: "#0c4a6e",
    style: {
      background:
        "linear-gradient(135deg, #0c4a6e 0%, #155e75 40%, #164e63 100%), radial-gradient(ellipse at 30% 80%, rgba(34,211,238,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 20%, rgba(14,165,233,0.1) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "nebula",
    label: "Nebula",
    value: "#1e1b4b",
    style: {
      background:
        "linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #4c1d95 100%), radial-gradient(ellipse at 20% 30%, rgba(167,139,250,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(192,132,252,0.1) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "purple",
    label: "Purple",
    value: "#2e1065",
    style: {
      background:
        "linear-gradient(135deg, #581c87 0%, #2e1065 60%, #701a75 100%), radial-gradient(ellipse at 25% 60%, rgba(217,70,239,0.1) 0%, transparent 50%), radial-gradient(ellipse at 75% 30%, rgba(168,85,247,0.1) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "aurora",
    label: "Aurora",
    value: "#6d28d9",
    style: {
      background:
        "linear-gradient(135deg, #6d28d9 0%, #0e7490 50%, #059669 100%), radial-gradient(ellipse at 40% 20%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(20,184,166,0.12) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "candy",
    label: "Candy",
    value: "#db2777",
    style: {
      background:
        "linear-gradient(135deg, #be185d 0%, #7c3aed 50%, #4f46e5 100%), radial-gradient(ellipse at 30% 70%, rgba(236,72,153,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.12) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "rose",
    label: "Rose",
    value: "#9f1239",
    style: {
      background:
        "linear-gradient(135deg, #9f1239 0%, #881337 50%, #4c0519 100%), radial-gradient(ellipse at 25% 40%, rgba(244,63,94,0.1) 0%, transparent 50%), radial-gradient(ellipse at 75% 60%, rgba(225,29,72,0.08) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "sunset",
    label: "Sunset",
    value: "#9a3412",
    style: {
      background:
        "linear-gradient(135deg, #c2410c 0%, #9a3412 40%, #7c2d12 100%), radial-gradient(ellipse at 20% 30%, rgba(251,146,60,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(234,88,12,0.1) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "dusk",
    label: "Dusk",
    value: "#1a1a2e",
    style: {
      background:
        "linear-gradient(135deg, #16213e 0%, #1a1a2e 40%, #0f3460 100%), radial-gradient(ellipse at 70% 20%, rgba(233,69,96,0.1) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(83,52,131,0.12) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "forest",
    label: "Forest",
    value: "#064e3b",
    style: {
      background:
        "linear-gradient(135deg, #065f46 0%, #064e3b 50%, #022c22 100%), radial-gradient(ellipse at 25% 50%, rgba(52,211,153,0.1) 0%, transparent 50%), radial-gradient(ellipse at 75% 50%, rgba(16,185,129,0.08) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "lagoon",
    label: "Lagoon",
    value: "#0d9488",
    style: {
      background:
        "linear-gradient(135deg, #0f766e 0%, #155e75 50%, #1e40af 100%), radial-gradient(ellipse at 30% 30%, rgba(45,212,191,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(56,189,248,0.1) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "peach",
    label: "Peach",
    value: "#f97316",
    style: {
      background:
        "linear-gradient(135deg, #ea580c 0%, #db2777 50%, #9333ea 100%), radial-gradient(ellipse at 20% 40%, rgba(251,146,60,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(236,72,153,0.12) 0%, transparent 50%)",
    },
    className: "",
  },
  {
    id: "noir",
    label: "Noir",
    value: "#0a0a0a",
    style: {
      background:
        "linear-gradient(135deg, #171717 0%, #0a0a0a 50%, #1c1917 100%), radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.02) 0%, transparent 50%)",
    },
    className: "",
  },
];

const PADDING_OPTIONS = [
  { id: "none", label: "0", value: 0 },
  { id: "sm", label: "32", value: 32 },
  { id: "md", label: "64", value: 64 },
  { id: "lg", label: "96", value: 96 },
  { id: "xl", label: "128", value: 128 },
];

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (file) onFile(file);
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) onFile(file);
    },
    [onFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-colors ${
        dragging
          ? "border-orange-400/30 bg-orange-400/[0.03]"
          : "border-white/[0.08] hover:border-white/[0.15]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <Image weight="duotone" className="h-10 w-10 text-white/15" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-white/40">Drop, paste, or click to upload</p>
        <p className="text-[10px] uppercase tracking-widest text-white/30">
          PNG, JPG, WebP
        </p>
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

function DraggableImage({
  src,
  transform,
  onTransformChange,
}: {
  src: string;
  transform: ImageTransform;
  onTransformChange: (t: ImageTransform) => void;
}) {
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      start.current = {
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [transform.x, transform.y],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      onTransformChange({
        ...transform,
        x: e.clientX - start.current.x,
        y: e.clientY - start.current.y,
      });
    },
    [transform, onTransformChange],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <img
      src={src}
      alt="Screenshot"
      className="absolute left-0 top-0 h-full w-full cursor-grab object-contain active:cursor-grabbing"
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: "center center",
      }}
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

function BrowserFrame({
  src,
  theme,
  transform,
  onTransformChange,
}: {
  src: string;
  theme: FrameTheme;
  transform: ImageTransform;
  onTransformChange: (t: ImageTransform) => void;
}) {
  const isDark = theme === "dark";
  return (
    <div
      className={`flex h-[405px] w-[720px] flex-col overflow-hidden rounded-xl shadow-2xl ${isDark ? "shadow-black/60" : "shadow-black/20"}`}
    >
      <div
        className={`flex shrink-0 items-center gap-2 px-4 py-3 ${isDark ? "bg-[#202025]" : "bg-[#e8e8ec]"}`}
      >
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div
          className={`mx-auto w-2/5 rounded-md py-1.5 ${isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`}
        />
      </div>
      <div
        className={`relative min-h-0 flex-1 overflow-hidden ${isDark ? "bg-[#1a1a1e]" : "bg-[#ffffff]"}`}
      >
        <DraggableImage
          src={src}
          transform={transform}
          onTransformChange={onTransformChange}
        />
      </div>
    </div>
  );
}

function PhoneFrame({
  src,
  theme,
  transform,
  onTransformChange,
}: {
  src: string;
  theme: FrameTheme;
  transform: ImageTransform;
  onTransformChange: (t: ImageTransform) => void;
}) {
  const isDark = theme === "dark";
  return (
    <div
      className={`h-[600px] w-[290px] overflow-hidden rounded-[2.5rem] border-[6px] shadow-2xl ${
        isDark
          ? "border-[#2a2a2e] shadow-black/60"
          : "border-[#e0e0e4] shadow-black/20"
      }`}
    >
      <div
        className={`relative h-full overflow-hidden ${isDark ? "bg-[#1a1a1e]" : "bg-[#ffffff]"}`}
      >
        <div
          className={`absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl ${isDark ? "bg-[#1a1a1e]" : "bg-[#d4d4d8]"}`}
        />
        <DraggableImage
          src={src}
          transform={transform}
          onTransformChange={onTransformChange}
        />
      </div>
    </div>
  );
}

function TabletFrame({
  src,
  theme,
  transform,
  onTransformChange,
}: {
  src: string;
  theme: FrameTheme;
  transform: ImageTransform;
  onTransformChange: (t: ImageTransform) => void;
}) {
  const isDark = theme === "dark";
  return (
    <div
      className={`h-[440px] w-[600px] overflow-hidden rounded-[2rem] border-[8px] shadow-2xl ${
        isDark
          ? "border-[#2a2a2e] shadow-black/60"
          : "border-[#e0e0e4] shadow-black/20"
      }`}
    >
      <div
        className={`relative h-full overflow-hidden ${isDark ? "bg-[#1a1a1e]" : "bg-[#ffffff]"}`}
      >
        <DraggableImage
          src={src}
          transform={transform}
          onTransformChange={onTransformChange}
        />
      </div>
    </div>
  );
}

function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  renderOption,
}: {
  label: string;
  options: { id: string; label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  renderOption?: (
    opt: { id: string; label: string; value: T },
    active: boolean,
  ) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-white/30">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          if (renderOption)
            return (
              <button
                key={opt.id}
                onClick={() => onChange(opt.value)}
                className="focus:outline-none"
              >
                {renderOption(opt, active)}
              </button>
            );
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.value)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                active
                  ? "bg-white/[0.1] text-white/80"
                  : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ScreenshotTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [frame, setFrame] = useState<DeviceFrame>("browser");
  const [frameTheme, setFrameTheme] = useState<FrameTheme>("dark");
  const [background, setBackground] = useState<Background>(BACKGROUNDS[1]!);
  const [padding, setPadding] = useState(64);
  const [exporting, setExporting] = useState(false);
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  const handleReset = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
  }, [imageSrc]);

  const handleExport = useCallback(async () => {
    const el = previewRef.current;
    if (!el || !imageSrc) return;

    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, "screenshot-mockup.png");
          toast("success", "Exported screenshot");
        }
      }, "image/png");
    } catch {
      toast("error", "Export failed");
    } finally {
      setExporting(false);
    }
  }, [imageSrc, toast]);

  const frameOptions = [
    {
      id: "browser",
      label: "Browser",
      value: "browser" as DeviceFrame,
      icon: Browser,
    },
    {
      id: "phone",
      label: "Phone",
      value: "phone" as DeviceFrame,
      icon: DeviceMobile,
    },
    {
      id: "tablet",
      label: "Tablet",
      value: "tablet" as DeviceFrame,
      icon: DeviceTablet,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!imageSrc && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <motion.p
            className="mb-6 text-center text-xs uppercase tracking-widest text-white/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Upload a screenshot to wrap in a device frame
          </motion.p>
          <div className="w-full max-w-lg">
            <DropZone onFile={handleFile} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {imageSrc && (
          <motion.div
            className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Canvas */}
            <div
              className="hide-scroll flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto rounded-2xl border border-white/[0.06] p-4"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                backgroundColor: "rgba(255,255,255,0.01)",
              }}
            >
              <div
                ref={previewRef}
                className={`inline-flex shrink-0 items-center justify-center ${background.className}`}
                style={{ padding, ...background.style }}
              >
                {frame === "browser" && (
                  <BrowserFrame
                    src={imageSrc}
                    theme={frameTheme}
                    transform={transform}
                    onTransformChange={setTransform}
                  />
                )}
                {frame === "phone" && (
                  <PhoneFrame
                    src={imageSrc}
                    theme={frameTheme}
                    transform={transform}
                    onTransformChange={setTransform}
                  />
                )}
                {frame === "tablet" && (
                  <TabletFrame
                    src={imageSrc}
                    theme={frameTheme}
                    transform={transform}
                    onTransformChange={setTransform}
                  />
                )}
              </div>
            </div>

            {/* Toolbar */}
            <div className="hide-scroll flex w-full shrink-0 flex-col gap-5 overflow-auto pb-4 md:w-56 md:pb-0 lg:w-64">
              {/* Frame type */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Frame
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {frameOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = frame === opt.value;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setFrame(opt.value)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                          active
                            ? "bg-white/[0.1] text-white/80"
                            : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme toggle */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Theme
                </span>
                <div className="flex gap-1.5">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFrameTheme(t)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
                        frameTheme === t
                          ? "bg-white/[0.1] text-white/80"
                          : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
                      }`}
                    >
                      {t === "dark" ? (
                        <Moon className="h-3.5 w-3.5" />
                      ) : (
                        <Sun className="h-3.5 w-3.5" />
                      )}
                      {t === "dark" ? "Dark" : "Light"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <OptionGroup
                label="Background"
                options={BACKGROUNDS.map((b) => ({
                  id: b.id,
                  label: b.label,
                  value: b.id,
                }))}
                value={background.id}
                onChange={(id) =>
                  setBackground(BACKGROUNDS.find((b) => b.id === id)!)
                }
                renderOption={(opt, active) => {
                  const bg = BACKGROUNDS.find((b) => b.id === opt.id)!;
                  return (
                    <div
                      className={`h-6 w-6 rounded-lg border-2 transition-all duration-150 ${bg.className} ${
                        active
                          ? "border-white/40 scale-110"
                          : "border-white/[0.08] hover:border-white/20"
                      }`}
                      style={bg.style}
                      title={opt.label}
                    />
                  );
                }}
              />

              {/* Padding */}
              <OptionGroup
                label="Padding"
                options={PADDING_OPTIONS}
                value={padding}
                onChange={setPadding}
              />

              {/* Scale & Position */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Scale & Position
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setTransform((t) => ({
                        ...t,
                        scale: Math.max(0.1, t.scale - 0.1),
                      }))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/50"
                  >
                    <MagnifyingGlassMinus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.05"
                    value={transform.scale}
                    onChange={(e) =>
                      setTransform((t) => ({
                        ...t,
                        scale: parseFloat(e.target.value),
                      }))
                    }
                    className="slider h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-white/60"
                  />
                  <button
                    onClick={() =>
                      setTransform((t) => ({
                        ...t,
                        scale: Math.min(3, t.scale + 0.1),
                      }))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/50"
                  >
                    <MagnifyingGlassPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-code text-[10px] text-white/20">
                    {Math.round(transform.scale * 100)}%
                  </span>
                  <button
                    onClick={() => setTransform({ scale: 1, x: 0, y: 0 })}
                    className="flex items-center gap-1 text-[10px] text-white/20 transition-colors hover:text-white/40"
                  >
                    <ArrowsOutCardinal className="h-3 w-3" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.1] hover:text-white/80 disabled:opacity-40"
                >
                  <DownloadSimple weight="duotone" className="h-4 w-4" />
                  {exporting ? "Exporting..." : "Export PNG"}
                </button>
                <button
                  onClick={handleReset}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-medium text-white/20 transition-colors hover:bg-white/[0.04] hover:text-white/40"
                >
                  <ArrowCounterClockwise
                    weight="duotone"
                    className="h-3.5 w-3.5"
                  />
                  Upload New
                </button>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
