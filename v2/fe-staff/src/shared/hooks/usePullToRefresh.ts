import { useRef, useCallback, useEffect, useState } from 'react';

const THRESHOLD = 72;

export function usePullToRefresh(onRefresh: () => void) {
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    startYRef.current = null;
    setDragOffset(0);
    if (delta >= THRESHOLD) {
      onRefresh();
      if (typeof navigator.vibrate === 'function') navigator.vibrate(30);
    }
  }, [onRefresh]);

  // Prevent native pull-to-refresh interfering + track drag offset for indicator
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      if (startYRef.current === null) return;
      // If user has scrolled down, drop the gesture entirely
      if (el.scrollTop > 0) {
        startYRef.current = null;
        setDragOffset(0);
        return;
      }
      const deltaY = e.touches[0].clientY - startYRef.current;
      if (deltaY > 0) {
        e.preventDefault();
        setDragOffset(Math.min(deltaY, THRESHOLD));
      }
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, []);

  return { containerRef, onTouchStart, onTouchEnd, dragOffset };
}
