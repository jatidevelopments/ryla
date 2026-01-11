'use client';

import * as React from 'react';
import { cn, RylaButton } from '@ryla/ui';

type Props = {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
  onApply: (args: {
    maskedImageBase64Png: string;
    prompt: string;
  }) => Promise<void>;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function InpaintEditModal({
  open,
  imageUrl,
  onClose,
  onApply,
  className,
}: Props) {
  const [prompt, setPrompt] = React.useState('');
  const [isApplying, setIsApplying] = React.useState(false);
  const [brushSize, setBrushSize] = React.useState(32);
  const [isEraser, setIsEraser] = React.useState(false);

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const maskCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawingRef = React.useRef(false);

  // Initialize canvas size once image loads
  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = maskCanvasRef.current;
    if (!img || !canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const canvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const draw = (x: number, y: number) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const exportMaskedPng = (): string => {
    const img = imgRef.current;
    const mask = maskCanvasRef.current;
    if (!img || !mask) throw new Error('Image/mask not ready');

    const w = mask.width;
    const h = mask.height;
    if (!w || !h) throw new Error('Mask canvas has invalid size');

    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;

    const outCtx = out.getContext('2d');
    const maskCtx = mask.getContext('2d');
    if (!outCtx || !maskCtx) throw new Error('Missing canvas context');

    // Draw original image RGB
    outCtx.drawImage(img, 0, 0, w, h);
    const outData = outCtx.getImageData(0, 0, w, h);
    const maskData = maskCtx.getImageData(0, 0, w, h);

    // Use mask red channel as alpha (mask is white paint)
    for (let i = 0; i < outData.data.length; i += 4) {
      outData.data[i + 3] = maskData.data[i]; // alpha
    }
    outCtx.putImageData(outData, 0, 0);

    return out.toDataURL('image/png');
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const maskedImageBase64Png = exportMaskedPng();
      await onApply({ maskedImageBase64Png, prompt: prompt.trim() });
    } finally {
      setIsApplying(false);
    }
  };

  React.useEffect(() => {
    if (!open) return;
    // Reset prompt/mask each open (simple MVP)
    setPrompt('');
    setIsEraser(false);
    setBrushSize(32);
    clearMask();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className={cn(
          'w-full max-w-4xl rounded-2xl bg-[#0b0b0d] border border-white/10 overflow-hidden',
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm font-semibold text-white">Edit (Inpaint)</div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0">
          {/* Canvas */}
          <div className="relative bg-black">
            <div className="relative w-full aspect-square">
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Selected"
                className="absolute inset-0 h-full w-full object-contain"
                onLoad={handleImageLoad}
              />
              <canvas
                ref={maskCanvasRef}
                className="absolute inset-0 h-full w-full touch-none"
                onPointerDown={(e) => {
                  drawingRef.current = true;
                  (e.currentTarget as HTMLCanvasElement).setPointerCapture(
                    e.pointerId
                  );
                  const { x, y } = canvasPoint(e);
                  draw(x, y);
                }}
                onPointerMove={(e) => {
                  if (!drawingRef.current) return;
                  const { x, y } = canvasPoint(e);
                  draw(x, y);
                }}
                onPointerUp={() => {
                  drawingRef.current = false;
                }}
                onPointerCancel={() => {
                  drawingRef.current = false;
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 space-y-4 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="space-y-2">
              <label className="text-xs text-white/70">Edit prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "add a nano banana on the table"'
                className="w-full min-h-[88px] rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/70">
                Brush size: {brushSize}px
              </label>
              <input
                type="range"
                min={8}
                max={128}
                value={brushSize}
                onChange={(e) =>
                  setBrushSize(clamp(Number(e.target.value), 8, 128))
                }
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEraser(false)}
                className={cn(
                  'flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition',
                  !isEraser
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                )}
              >
                Paint
              </button>
              <button
                onClick={() => setIsEraser(true)}
                className={cn(
                  'flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition',
                  isEraser
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                )}
              >
                Erase
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearMask}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                Clear mask
              </button>
            </div>

            <RylaButton
              onClick={handleApply}
              disabled={isApplying || !prompt.trim()}
              className="w-full"
            >
              {isApplying ? 'Applying...' : 'Apply Edit'}
            </RylaButton>

            <p className="text-[11px] text-white/50 leading-relaxed">
              Mask rule: paint the area you want to change. The original image
              stays unchanged; a new edited image is created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
