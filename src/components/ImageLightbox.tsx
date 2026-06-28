import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  src,
  alt
}) => {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Refs for touch gesture state tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const isDraggingRef = useRef<boolean>(false);
  const isPinchingRef = useRef<boolean>(false);

  // Mount effect to prevent SSR issues and ensure document.body is ready
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Callback ref to instantly check if the image has finished loading (important for cached images)
  const handleImageRef = React.useCallback((node: HTMLImageElement | null) => {
    if (node) {
      if (node.complete) {
        if (node.naturalWidth > 0) {
          setIsLoading(false);
          setHasError(false);
        } else {
          setIsLoading(false);
          setHasError(true);
        }
      }
    }
  }, []);

  // Reset states when opened/closed or image source changes
  useEffect(() => {
    if (isOpen && mounted) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      setHasError(false);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, src, mounted]);

  // Keyboard navigation hook declared before conditional return to satisfy Rules of Hooks
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Early return after ALL hooks are initialized
  if (!isOpen || !mounted) return null;

  // Helper to compute distance between two touches
  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  };

  // Touch handlers for mobile pinch-to-zoom & pan
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // Single finger: preparation for drag/pan
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      };
      isDraggingRef.current = true;
      isPinchingRef.current = false;
    } else if (e.touches.length === 2) {
      // Double finger: preparation for pinch-to-zoom
      isPinchingRef.current = true;
      isDraggingRef.current = false;
      const dist = getDistance(e.touches[0], e.touches[1]);
      initialDistanceRef.current = dist;
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPinchingRef.current && e.touches.length === 2 && initialDistanceRef.current !== null) {
      e.preventDefault();
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / initialDistanceRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * factor, 1), 6);
      setScale(newScale);
    } else if (isDraggingRef.current && e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      if (touchStartRef.current) {
        setPosition({
          x: touch.clientX - touchStartRef.current.x,
          y: touch.clientY - touchStartRef.current.y
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // If we were pinching and went down to 1 touch, smoothly continue panning
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      };
      isDraggingRef.current = true;
      isPinchingRef.current = false;
    } else {
      isDraggingRef.current = false;
      isPinchingRef.current = false;
      touchStartRef.current = null;
      initialDistanceRef.current = null;

      // Reset positioning bounds if scale returned to 1
      if (scale <= 1.05) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  // Double click / Double tap handler to quickly toggle zoom
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (scale > 1.1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
      setPosition({ x: 0, y: 0 });
    }
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 6));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md select-none touch-none"
      onClick={onClose}
    >
      {/* Top bar with image info and Close action */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-4 z-[10000]">
        <div className="text-white text-sm font-medium truncate max-w-[70%]">
          {alt || 'Просмотр изображения'}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Interactive Image Container */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden p-4 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={onClose}
      >
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {hasError ? (
          <div className="text-center text-white/80 p-6 z-20 bg-white/5 rounded-2xl border border-white/10 max-w-sm">
            <p className="text-sm font-semibold mb-2">Не удалось загрузить изображение</p>
            <p className="text-xs text-white/40">Пожалуйста, попробуйте позже</p>
          </div>
        ) : (
          <img
            ref={handleImageRef}
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDraggingRef.current || isPinchingRef.current 
                ? 'none' 
                : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '12px',
              opacity: isLoading ? 0 : 1,
            }}
            className={`select-none cursor-zoom-in transition-shadow duration-350 ${isLoading ? 'shadow-none' : 'shadow-2xl border border-white/5 bg-neutral-900/40'}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onDoubleClick={handleDoubleTap}
          />
        )}
      </div>

      {/* Zoom Controls Overlay */}
      {!hasError && !isLoading && (
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 border border-white/15 px-5 py-2.5 rounded-full shadow-2xl z-[10000] backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={zoomOut}
            disabled={scale <= 1}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Уменьшить"
          >
            <ZoomOut size={20} />
          </button>
          
          <span className="text-white text-xs font-mono font-bold min-w-[2.5rem] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= 6}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Увеличить"
          >
            <ZoomIn size={20} />
          </button>

          {(scale > 1 || position.x !== 0 || position.y !== 0) && (
            <button
              onClick={resetZoom}
              className="p-1.5 rounded-full text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-all cursor-pointer border border-sky-500/20"
              title="Сбросить"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      )}

      {/* Touch Help Tip */}
      {!hasError && !isLoading && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-[10px] text-white/30 pointer-events-none text-center select-none font-medium hidden sm:block">
          Дважды нажмите для быстрого увеличения • Жестами или колесиком можно масштабировать
        </div>
      )}
    </div>,
    document.body
  );
};
