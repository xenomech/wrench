"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Popover from "@radix-ui/react-popover";
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
  LinkSimple,
  Trash,
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
  imageUrl?: string;
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
          ? "border-[#1a1a1e] shadow-black/60"
          : "border-[#e0e0e4] shadow-black/20"
      }`}
    >
      <div
        className={`relative h-full overflow-hidden ${isDark ? "bg-[#000000]" : "bg-[#ffffff]"}`}
      >
        <div
          className={`absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl ${isDark ? "bg-[#000000]" : "bg-[#d4d4d8]"}`}
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
  const [customBgUrl, setCustomBgUrl] = useState("");
  const [customBgInput, setCustomBgInput] = useState("");
  const [customBgError, setCustomBgError] = useState(false);
  const [bgPopoverOpen, setBgPopoverOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !imageSrc) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const framePad = padding * 2;
      const frameW =
        (frame === "phone" ? 290 : frame === "tablet" ? 600 : 720) + framePad;
      const frameH =
        (frame === "phone" ? 600 : frame === "tablet" ? 440 : 405) + framePad;
      const scale = Math.min(1, width / frameW, height / frameH);
      setCanvasScale(scale);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [imageSrc, frame, padding]);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  const handleReset = useCallback(() => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
  }, [imageSrc]);

  const applyCustomBg = useCallback((url: string) => {
    if (!url.trim()) return;
    setCustomBgError(false);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setCustomBgUrl(url.trim());
      setBackground({
        id: "custom-image",
        label: "Custom",
        value: "custom-image",
        className: "",
        imageUrl: url.trim(),
        style: {
          backgroundImage: `url(${url.trim()})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
      });
      setBgPopoverOpen(false);
    };
    img.onerror = () => {
      setCustomBgError(true);
    };
    img.src = url.trim();
  }, []);

  const clearCustomBg = useCallback(() => {
    setCustomBgUrl("");
    setCustomBgInput("");
    setCustomBgError(false);
    setBackground(BACKGROUNDS[1]!);
  }, []);

  const handleExport = useCallback(async () => {
    if (!imageSrc) return;
    setExporting(true);
    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageSrc;
      });

      const frameSizes = {
        browser: { w: 720, h: 405, chrome: 42 },
        phone: { w: 290, h: 600, chrome: 0 },
        tablet: { w: 600, h: 440, chrome: 0 },
      };
      const fs = frameSizes[frame];
      const totalW = fs.w + padding * 2;
      const totalH = fs.h + padding * 2;
      const dpr = 4;

      const canvas = document.createElement("canvas");
      canvas.width = totalW * dpr;
      canvas.height = totalH * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);

      // Background
      const bg = background;
      if (bg.imageUrl) {
        const bgImg = new window.Image();
        bgImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          bgImg.onload = () => resolve();
          bgImg.onerror = reject;
          bgImg.src = bg.imageUrl!;
        });
        const bgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
        const canvasAspect = totalW / totalH;
        let sw: number, sh: number, sx: number, sy: number;
        if (bgAspect > canvasAspect) {
          sh = bgImg.naturalHeight;
          sw = sh * canvasAspect;
          sx = (bgImg.naturalWidth - sw) / 2;
          sy = 0;
        } else {
          sw = bgImg.naturalWidth;
          sh = sw / canvasAspect;
          sx = 0;
          sy = (bgImg.naturalHeight - sh) / 2;
        }
        ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, totalW, totalH);
      } else if (bg.style?.background) {
        const temp = document.createElement("div");
        temp.style.cssText = `width:${totalW}px;height:${totalH}px;position:fixed;left:-9999px;top:-9999px;background:${bg.style.background}`;
        document.body.appendChild(temp);
        const { default: html2canvas } = await import("html2canvas-pro");
        const bgCanvas = await html2canvas(temp, {
          backgroundColor: null,
          scale: dpr,
          width: totalW,
          height: totalH,
          logging: false,
        });
        ctx.drawImage(bgCanvas, 0, 0, totalW, totalH);
        document.body.removeChild(temp);
      } else if (bg.id === "transparent") {
        // leave transparent
      }

      // Frame area
      const fx = padding;
      const fy = padding;
      const isDark = frameTheme === "dark";
      const screenBg = isDark ? "#1a1a1e" : "#ffffff";
      const radius = frame === "browser" ? 12 : frame === "phone" ? 28 : 24;

      ctx.save();
      // Outer frame clip
      const outerPath = new Path2D();
      outerPath.roundRect(fx, fy, fs.w, fs.h, radius);
      ctx.clip(outerPath);

      if (frame === "browser") {
        // Title bar
        const chromeBg = isDark ? "#202025" : "#e8e8ec";
        ctx.fillStyle = chromeBg;
        ctx.fillRect(fx, fy, fs.w, fs.chrome);

        // Traffic lights
        const dots = [{ c: "#ff5f57" }, { c: "#febc2e" }, { c: "#28c840" }];
        dots.forEach((d, i) => {
          ctx.fillStyle = d.c;
          ctx.beginPath();
          ctx.arc(fx + 16 + i * 15, fy + fs.chrome / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Address bar pill
        const barBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
        ctx.fillStyle = barBg;
        const barW = fs.w * 0.4;
        const barH = 16;
        const barX = fx + (fs.w - barW) / 2;
        const barY = fy + (fs.chrome - barH) / 2;
        const barPath = new Path2D();
        barPath.roundRect(barX, barY, barW, barH, 6);
        ctx.fill(barPath);

        // Screen area
        const screenY = fy + fs.chrome;
        const screenH = fs.h - fs.chrome;
        ctx.fillStyle = screenBg;
        ctx.fillRect(fx, screenY, fs.w, screenH);

        // Draw image in screen area
        ctx.save();
        ctx.beginPath();
        ctx.rect(fx, screenY, fs.w, screenH);
        ctx.clip();
        const cx = fx + fs.w / 2 + transform.x;
        const cy = screenY + screenH / 2 + transform.y;
        ctx.translate(cx, cy);
        ctx.scale(transform.scale, transform.scale);
        // object-contain within screen area
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const areaAspect = fs.w / screenH;
        let drawW: number, drawH: number;
        if (imgAspect > areaAspect) {
          drawW = fs.w;
          drawH = fs.w / imgAspect;
        } else {
          drawH = screenH;
          drawW = screenH * imgAspect;
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else {
        const border = frame === "phone" ? 6 : 8;

        // Device border
        ctx.fillStyle = isDark
          ? frame === "phone"
            ? "#1a1a1e"
            : "#2a2a2e"
          : "#e0e0e4";
        ctx.fillRect(fx, fy, fs.w, fs.h);

        // Inner screen
        const innerX = fx + border;
        const innerY = fy + border;
        const innerW = fs.w - border * 2;
        const innerH = fs.h - border * 2;
        const innerRadius = Math.max(0, radius - border);

        ctx.save();
        const innerPath = new Path2D();
        innerPath.roundRect(innerX, innerY, innerW, innerH, innerRadius);
        ctx.clip(innerPath);

        ctx.fillStyle = isDark && frame === "phone" ? "#000000" : screenBg;
        ctx.fillRect(innerX, innerY, innerW, innerH);

        // Draw image
        const cx = innerX + innerW / 2 + transform.x;
        const cy = innerY + innerH / 2 + transform.y;
        ctx.translate(cx, cy);
        ctx.scale(transform.scale, transform.scale);
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const areaAspect = innerW / innerH;
        let drawW: number, drawH: number;
        if (imgAspect > areaAspect) {
          drawW = innerW;
          drawH = innerW / imgAspect;
        } else {
          drawH = innerH;
          drawW = innerH * imgAspect;
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Phone notch
        if (frame === "phone") {
          ctx.fillStyle = isDark ? "#000000" : "#d4d4d8";
          const notchW = 112;
          const notchH = 24;
          const notchPath = new Path2D();
          const notchX = fx + (fs.w - notchW) / 2;
          notchPath.roundRect(
            notchX,
            fy + border,
            notchW,
            notchH,
            [0, 0, 16, 16],
          );
          ctx.fill(notchPath);
        }
      }
      ctx.restore();

      // Shadow (draw frame outline for definition)
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      const outlinePath = new Path2D();
      outlinePath.roundRect(fx, fy, fs.w, fs.h, radius);
      ctx.stroke(outlinePath);
      ctx.restore();

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
  }, [imageSrc, frame, frameTheme, background, padding, transform, toast]);

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
            className="flex min-h-0 flex-1 flex-col overflow-auto hide-scroll gap-4 md:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Canvas */}
            <div
              ref={containerRef}
              className="relative min-h-[240px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                backgroundColor: "rgba(255,255,255,0.01)",
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `scale(${canvasScale})`,
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
            </div>

            {/* Toolbar */}
            <div className="hide-scroll flex w-full shrink-0 flex-col gap-4 overflow-auto pb-4 md:w-56 md:gap-5 md:pb-0 lg:w-64">
              {/* Frame + Theme row on mobile, stacked on desktop */}
              <div className="flex gap-4 md:flex-col md:gap-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    Frame
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {frameOptions.map((opt) => {
                      const Icon = opt.icon;
                      const active = frame === opt.value;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setFrame(opt.value)}
                          className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all duration-150 md:gap-1.5 md:px-2.5 ${
                            active
                              ? "bg-white/[0.1] text-white/80"
                              : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="hidden md:inline">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    Theme
                  </span>
                  <div className="flex gap-1 md:gap-1.5">
                    {(["dark", "light"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFrameTheme(t)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all duration-150 md:gap-1.5 md:px-2.5 ${
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
                        <span className="hidden md:inline">
                          {t === "dark" ? "Dark" : "Light"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Background */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Background
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BACKGROUNDS.map((bg) => {
                    const active = background.id === bg.id;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setBackground(bg);
                        }}
                        className="focus:outline-none"
                      >
                        <div
                          className={`h-6 w-6 rounded-lg border-2 transition-all duration-150 ${bg.className} ${
                            active
                              ? "border-white/40 scale-110"
                              : "border-white/[0.08] hover:border-white/20"
                          }`}
                          style={bg.style}
                          title={bg.label}
                        />
                      </button>
                    );
                  })}
                  <Popover.Root
                    open={bgPopoverOpen}
                    onOpenChange={setBgPopoverOpen}
                  >
                    <Popover.Trigger asChild>
                      <button className="focus:outline-none">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all duration-150 ${
                            background.id === "custom-image"
                              ? "border-white/40 scale-110"
                              : "border-white/[0.08] hover:border-white/20"
                          }`}
                          style={
                            customBgUrl
                              ? {
                                  backgroundImage: `url(${customBgUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                          title="Custom image"
                        >
                          {!customBgUrl && (
                            <LinkSimple className="h-3 w-3 text-white/25" />
                          )}
                        </div>
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        side="bottom"
                        align="end"
                        sideOffset={8}
                        className="z-50 w-52 rounded-xl border border-white/[0.08] bg-[#161618] p-3 shadow-xl shadow-black/40"
                      >
                        <div className="flex flex-col gap-2.5">
                          <span className="text-[10px] uppercase tracking-widest text-white/30">
                            Image URL
                          </span>
                          <input
                            type="text"
                            value={customBgInput}
                            onChange={(e) => {
                              setCustomBgInput(e.target.value);
                              setCustomBgError(false);
                            }}
                            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === "Enter")
                                applyCustomBg(customBgInput);
                            }}
                            autoFocus
                            placeholder="https://..."
                            className="w-full rounded-lg bg-white/[0.04] px-2.5 py-2 text-[11px] text-white/60 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-white/[0.1]"
                          />
                          {customBgError && (
                            <span className="text-[10px] text-red-400/60">
                              Failed to load image
                            </span>
                          )}
                          {customBgUrl ? (
                            <button
                              onClick={() => {
                                clearCustomBg();
                                setBgPopoverOpen(false);
                              }}
                              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-500/[0.08] py-1.5 text-[11px] font-medium text-red-400/60 transition-colors hover:bg-red-500/[0.14] hover:text-red-400/80"
                            >
                              <Trash className="h-3 w-3" />
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => applyCustomBg(customBgInput)}
                              className="w-full rounded-lg bg-white/[0.06] py-1.5 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/[0.1] hover:text-white/70"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              </div>

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
              <div className="flex gap-2 md:mt-auto flex-col">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.1] hover:text-white/80 disabled:opacity-40"
                >
                  <DownloadSimple weight="duotone" className="h-4 w-4" />
                  {exporting ? "Exporting..." : "Export PNG"}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-medium text-white/20 transition-colors hover:bg-white/[0.04] hover:text-white/40 md:w-full md:px-0"
                >
                  <ArrowCounterClockwise
                    weight="duotone"
                    className="h-3.5 w-3.5"
                  />
                  <span className="hidden md:inline">Upload New</span>
                  <span className="md:hidden">New</span>
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
