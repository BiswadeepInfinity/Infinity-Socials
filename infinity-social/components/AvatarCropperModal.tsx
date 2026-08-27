'use client';

import { useState, useRef, useEffect } from 'react';

interface AvatarCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
}

export default function AvatarCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: AvatarCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      setPosition({ x: 0, y: 0 });
      setZoom(1);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw canvas on position, zoom, or aspect ratio changes
  useEffect(() => {
    if (!canvasRef.current || !loadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + position.x, height / 2 + position.y);
    ctx.scale(zoom, zoom);

    // Draw centered image
    const imgWidth = loadedImage.width;
    const imgHeight = loadedImage.height;
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;

    ctx.drawImage(
      loadedImage,
      -renderWidth / 2,
      -renderHeight / 2,
      renderWidth,
      renderHeight
    );
    ctx.restore();

    // Draw circular or aspect mask guide overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);

    if (aspectRatio === '1:1') {
      const radius = Math.min(width, height) / 2 - 16;
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2, true);
    } else if (aspectRatio === '4:5') {
      const rectWidth = width - 48;
      const rectHeight = (rectWidth * 5) / 4;
      const x = (width - rectWidth) / 2;
      const y = (height - rectHeight) / 2;
      ctx.rect(x + rectWidth, y, -rectWidth, rectHeight);
    } else {
      const rectWidth = width - 24;
      const rectHeight = (rectWidth * 9) / 16;
      const x = (width - rectWidth) / 2;
      const y = (height - rectHeight) / 2;
      ctx.rect(x + rectWidth, y, -rectWidth, rectHeight);
    }

    ctx.closePath();
    ctx.fill('evenodd');

    // Draw outer boundary stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }, [loadedImage, position, zoom, aspectRatio]);

  if (!isOpen || !imageSrc) return null;

  // Handle Drag / Pan Events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Generate Cropped Output Blob
  const handleApplyCrop = () => {
    if (!loadedImage) return;

    // Create high-res target output canvas
    const outputCanvas = document.createElement('canvas');
    const size = 512;
    outputCanvas.width = size;
    outputCanvas.height = size;
    const outCtx = outputCanvas.getContext('2d');
    if (!outCtx) return;

    // If 1:1 circle aspect ratio, clip circular
    if (aspectRatio === '1:1') {
      outCtx.beginPath();
      outCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      outCtx.closePath();
      outCtx.clip();
    }

    const scale = Math.max(size / loadedImage.width, size / loadedImage.height);
    const renderWidth = loadedImage.width * scale;
    const renderHeight = loadedImage.height * scale;

    outCtx.translate(size / 2 + (position.x * (size / 320)), size / 2 + (position.y * (size / 320)));
    outCtx.scale(zoom, zoom);
    outCtx.drawImage(
      loadedImage,
      -renderWidth / 2,
      -renderHeight / 2,
      renderWidth,
      renderHeight
    );

    outputCanvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          onCropComplete(blob, previewUrl);
          onClose();
        }
      },
      'image/webp',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#111116] border border-white/15 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Adjust Aspect Ratio & Crop</h3>
            <p className="text-[10px] text-white/40">Drag to reposition, slider to zoom</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-base">
            ✕
          </button>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-medium text-white/40 mr-1">Aspect:</span>
          {(['1:1', '4:5', '16:9'] as const).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                aspectRatio === ratio
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-white/[0.05] text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {ratio === '1:1' ? '1:1 (Circle)' : ratio}
            </button>
          ))}
        </div>

        {/* Interactive Canvas Viewport */}
        <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-inner cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="block"
          />
        </div>

        {/* Zoom Slider Control */}
        <div className="w-full max-w-[320px] mt-4 space-y-1">
          <div className="flex justify-between text-[10px] text-white/40">
            <span>Zoom Out</span>
            <span className="font-mono">{Math.round(zoom * 100)}%</span>
            <span>Zoom In</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-end gap-3 mt-6 pt-3.5 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Apply & Crop
          </button>
        </div>
      </div>
    </div>
  );
}
