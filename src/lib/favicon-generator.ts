type FaviconSize = { name: string; width: number; height: number };

const SIZES: FaviconSize[] = [
  { name: 'favicon-16x16.png', width: 16, height: 16 },
  { name: 'favicon-32x32.png', width: 32, height: 32 },
  { name: 'mstile-150x150.png', width: 150, height: 150 },
  { name: 'apple-touch-icon.png', width: 180, height: 180 },
  { name: 'android-chrome-192x192.png', width: 192, height: 192 },
  { name: 'android-chrome-512x512.png', width: 512, height: 512 },
];

const ICO_SIZES = [16, 32, 48];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function resizeToCanvas(img: HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, type);
  });
}

async function canvasToArrayBuffer(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  const blob = await canvasToBlob(canvas);
  return blob.arrayBuffer();
}

function buildICO(pngBuffers: ArrayBuffer[]): ArrayBuffer {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + count * entrySize;

  let totalSize = dirSize;
  for (const buf of pngBuffers) totalSize += buf.byteLength;

  const ico = new ArrayBuffer(totalSize);
  const view = new DataView(ico);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);

  let offset = dirSize;
  for (let i = 0; i < count; i++) {
    const size = ICO_SIZES[i]!;
    const pngSize = pngBuffers[i]!.byteLength;
    const entryOffset = headerSize + i * entrySize;

    view.setUint8(entryOffset, size < 256 ? size : 0);
    view.setUint8(entryOffset + 1, size < 256 ? size : 0);
    view.setUint8(entryOffset + 2, 0);
    view.setUint8(entryOffset + 3, 0);
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, pngSize, true);
    view.setUint32(entryOffset + 12, offset, true);

    new Uint8Array(ico, offset, pngSize).set(new Uint8Array(pngBuffers[i]!));
    offset += pngSize;
  }

  return ico;
}

export function generateHTMLMarkup(): string {
  return `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="msapplication-TileColor" content="#100f18">
<meta name="theme-color" content="#100f18">`;
}

export function generateWebManifest(): string {
  return JSON.stringify({
    name: '',
    short_name: '',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#100f18',
    background_color: '#100f18',
    display: 'standalone',
  }, null, 2);
}

export function generateBrowserConfig(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#100f18</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
}

export type FaviconResult = {
  files: Map<string, Blob>;
  previews: Map<string, string>;
  originalSize: { width: number; height: number };
};

export async function generateAllFavicons(file: File): Promise<FaviconResult> {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  const { naturalWidth: width, naturalHeight: height } = img;

  const files = new Map<string, Blob>();
  const previews = new Map<string, string>();

  for (const size of SIZES) {
    const canvas = resizeToCanvas(img, size.width, size.height);
    const blob = await canvasToBlob(canvas);
    files.set(size.name, blob);
    previews.set(size.name, canvas.toDataURL('image/png'));
  }

  const icoBuffers: ArrayBuffer[] = [];
  for (const size of ICO_SIZES) {
    const canvas = resizeToCanvas(img, size, size);
    icoBuffers.push(await canvasToArrayBuffer(canvas));
  }
  const icoBuffer = buildICO(icoBuffers);
  files.set('favicon.ico', new Blob([icoBuffer], { type: 'image/x-icon' }));

  files.set('site.webmanifest', new Blob([generateWebManifest()], { type: 'application/json' }));
  files.set('browserconfig.xml', new Blob([generateBrowserConfig()], { type: 'application/xml' }));

  URL.revokeObjectURL(url);

  return { files, previews, originalSize: { width, height } };
}
