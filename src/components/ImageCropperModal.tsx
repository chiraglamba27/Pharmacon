import React, { useState, useRef, useEffect } from 'react';
import {
  Crop, ZoomIn, ZoomOut, RotateCw, RotateCcw,
  Check, X, Move, Sparkles, RefreshCw
} from 'lucide-react';
import MedicinePillMascot from './MedicinePillMascot';

interface ImageCropperModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
  title?: string;
}

export default function ImageCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  title = 'Crop & Resize Profile Picture',
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset controls when new image loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleRotate = (angleDelta: number) => {
    setRotation((prev) => (prev + angleDelta) % 360);
  };

  const handleGenerateCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const CROP_SIZE = 400; // Output square dimension
    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);

    // Center translation
    ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate relative dimensions
    const viewportSize = 260; // Preview viewport size
    const scaleRatio = CROP_SIZE / viewportSize;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Base fitting scale in the 260px preview box
    const baseScale = Math.max(viewportSize / imgWidth, viewportSize / imgHeight);
    const drawWidth = imgWidth * baseScale * scaleRatio;
    const drawHeight = imgHeight * baseScale * scaleRatio;

    ctx.drawImage(
      img,
      -drawWidth / 2 + position.x * scaleRatio,
      -drawHeight / 2 + position.y * scaleRatio,
      drawWidth,
      drawHeight
    );

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedBase64);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#351027]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFF8E8] border-[3.5px] border-[#351027] rounded-4xl p-6 sm:p-8 max-w-lg w-full shadow-tactile-xl relative space-y-6 select-none animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#351027]">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#F52F4F]" />
            <h2 className="heading-chunky text-xl text-[#351027]">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#351027] flex items-center justify-center text-[#351027] hover:bg-[#FFE8ED]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Interactive Crop Viewport ─────────────────────────────────── */}
        <div className="flex flex-col items-center space-y-3">
          <p className="text-xs text-[#351027]/70 font-medium text-center">
            Drag to pan position · Use slider or buttons below to zoom & rotate
          </p>

          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-[260px] h-[260px] rounded-full border-4 border-[#351027] overflow-hidden bg-[#351027] cursor-grab active:cursor-grabbing shadow-tactile flex items-center justify-center touch-none"
          >
            {/* Circular Mask Vignette */}
            <div className="absolute inset-0 pointer-events-none z-10 border-2 border-white/40 rounded-full" />

            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Source"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: 'none',
                maxHeight: 'none',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />

            {/* Drag helper watermark */}
            <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-full bg-[#351027]/80 text-[9px] font-extrabold text-white flex items-center gap-1 pointer-events-none">
              <Move className="w-2.5 h-2.5" />
              Pan
            </div>
          </div>
        </div>

        {/* ─── Interactive Zoom & Rotate Controls ───────────────────────── */}
        <div className="space-y-4 bg-white p-4 rounded-2xl border-2 border-[#351027] shadow-tactile-sm">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#351027]">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#F52F4F]" />
                Zoom Level ({Math.round(zoom * 100)}%)
              </span>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="text-[10px] text-[#F52F4F] hover:underline font-extrabold"
              >
                Reset Center
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                className="p-1.5 rounded-lg border border-[#351027] bg-[#FFF8E8] hover:bg-[#FFE8ED]"
              >
                <ZoomOut className="w-3.5 h-3.5 text-[#351027]" />
              </button>

              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#F52F4F] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.15))}
                className="p-1.5 rounded-lg border border-[#351027] bg-[#FFF8E8] hover:bg-[#FFE8ED]"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#351027]" />
              </button>
            </div>
          </div>

          {/* Rotation Buttons */}
          <div className="pt-2 border-t border-[#351027]/10 flex items-center justify-between">
            <span className="text-xs font-bold text-[#351027]">Rotate Orientation</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotate(-90)}
                className="px-3 py-1.5 rounded-xl border border-[#351027] bg-[#FFF8E8] text-xs font-extrabold flex items-center gap-1 hover:bg-[#FFE8ED]"
              >
                <RotateCcw className="w-3 h-3" />
                -90°
              </button>
              <button
                type="button"
                onClick={() => handleRotate(90)}
                className="px-3 py-1.5 rounded-xl border border-[#351027] bg-[#FFF8E8] text-xs font-extrabold flex items-center gap-1 hover:bg-[#FFE8ED]"
              >
                <RotateCw className="w-3 h-3" />
                +90°
              </button>
            </div>
          </div>
        </div>

        {/* ─── Bottom Actions ────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile btn-tactile-white"
          >
            <span className="btn-tactile-inner py-2 px-5 text-xs font-extrabold">
              Cancel
            </span>
          </button>

          <button
            type="button"
            onClick={handleGenerateCrop}
            className="btn-tactile btn-tactile-dark"
          >
            <span className="btn-tactile-inner py-2 px-6 text-xs font-extrabold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Apply Cropped Photo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
