import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Split, Eye, RotateCcw, Maximize2, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  styleName?: string;
  colorName?: string;
  colorHex?: string;
  currentMode?: 'slider' | 'side-by-side' | 'only-after';
  onModeChange?: (m: 'slider' | 'side-by-side' | 'only-after') => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Ảnh Gốc',
  afterLabel = 'Sau Khi Thử Tóc',
  styleName,
  colorName,
  colorHex,
  currentMode,
  onModeChange,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [internalViewMode, setInternalViewMode] = useState<'slider' | 'side-by-side' | 'only-after'>('slider');

  const viewMode = currentMode !== undefined ? currentMode : internalViewMode;
  const setViewMode = (m: 'slider' | 'side-by-side' | 'only-after') => {
    setInternalViewMode(m);
    if (onModeChange) onModeChange(m);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percent);
    },
    []
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const onStopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onStopDragging);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onStopDragging);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onStopDragging);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onStopDragging);
    };
  }, [isDragging, onMouseMove, onTouchMove, onStopDragging]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls Bar */}
      <div className="flex items-center justify-between text-xs text-stone-400 bg-stone-900/60 p-2 rounded-xl border border-stone-800">
        <div className="flex items-center gap-2">
          {styleName && (
            <div className="flex items-center gap-1.5 font-medium text-stone-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{styleName}</span>
              {colorName && (
                <span className="flex items-center gap-1 text-stone-400">
                  •
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                    style={{ backgroundColor: colorHex || '#777' }}
                  />
                  {colorName}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Thanh trượt so sánh"
          >
            <span className="flex items-center gap-1">
              <Split className="w-3 h-3" /> Trượt
            </span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Cạnh nhau"
          >
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Song song
            </span>
          </button>
          <button
            onClick={() => setViewMode('only-after')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'only-after'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Chỉ xem kết quả"
          >
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> Kết quả
            </span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'slider' && (
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="relative w-full aspect-[3/4] max-h-[640px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-stone-800 shadow-2xl bg-stone-900 group"
        >
          {/* Base After Image (New hairstyle/color) */}
          <img
            src={afterImage}
            alt="New Hairstyle"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Clipped Before Image (Original) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt="Original Hair"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: containerRef.current ? `${containerRef.current.clientHeight}px` : '100%',
              }}
            />
          </div>

          {/* Divider Line & Handle (only display if afterImage differs from beforeImage) */}
          {beforeImage !== afterImage && (
            <>
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none transition-transform"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-xl border-2 border-rose-500 pointer-events-auto cursor-ew-resize">
                  <Split className="w-3.5 h-3.5 text-rose-600 rotate-90" />
                </div>
              </div>

              {/* Tags */}
              <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-stone-200 border border-white/10 pointer-events-none">
                {beforeLabel}
              </div>
              <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-white border border-rose-400/30 shadow-lg pointer-events-none">
                {afterLabel}
              </div>
            </>
          )}

          {/* Reset button indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-stone-300 pointer-events-none flex items-center gap-1 border border-stone-700">
            <RotateCcw className="w-2.5 h-2.5" /> Kéo thanh trượt để so sánh
          </div>
        </div>
      )}

      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-2 gap-3 w-full aspect-[3/2] sm:aspect-[3/1.8] max-h-[600px]">
          <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-stone-900">
            <img src={beforeImage} alt="Original" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-stone-200 border border-white/10">
              {beforeLabel}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-rose-900/40 shadow-xl bg-stone-900 ring-2 ring-rose-500/30">
            <img src={afterImage} alt="Transformed" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-white border border-rose-400/30">
              {afterLabel}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'only-after' && (
        <div className="relative w-full aspect-[3/4] max-h-[640px] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-900">
          <img src={afterImage} alt="Transformed" className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-white border border-rose-400/30">
            {afterLabel}
          </div>
        </div>
      )}
    </div>
  );
};
