import { useState, useEffect } from 'react';
import { Slider } from '@base-ui/react/slider';
import { motion, useSpring, useMotionValueEvent } from "motion/react"

// Thumb visibility: hidden at 5 (show by 21), hidden at 87 (show by 99)
function thumbOpacity(value: number): number {
  if (value <= 1) return 1;
  if (value < 6) return Math.min(1, Math.max(0, (6 - value) / 3)); // 1→4: opacity 1→0
  if (value < 26) return Math.min(1, Math.max(0, (value - 10) / 30));
  if (value < 87) return 1;
  if (value < 98) return Math.min(1, Math.max(0, (95 - value) / 12));
  return 1;
}

export default function App() {
  const [volume, setVolume] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const smoothValue = useSpring(volume, { stiffness: 400, damping: 35 });
  const [, setTick] = useState(0);

  useEffect(() => {
    smoothValue.set(volume);
  }, [volume, smoothValue]);

  useEffect(() => {
    if (!isDragging) return;
    const clearCursor = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
    };
    document.body.style.cursor = 'grabbing';
    window.addEventListener('pointerup', clearCursor);
    window.addEventListener('pointercancel', clearCursor);
    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('pointerup', clearCursor);
      window.removeEventListener('pointercancel', clearCursor);
    };
  }, [isDragging]);

  useMotionValueEvent(smoothValue, 'change', () => setTick((t) => t + 1));

  const displayValue = smoothValue.get();

  return (
    <div className="flex justify-center items-center h-screen" style={isDragging ? { cursor: 'grabbing' } : undefined}>
      <Slider.Root value={displayValue} onValueChange={(v) => setVolume(v)}>
        <Slider.Control
          className="flex p-1 rounded-[12px] bg-gray-100/90 w-[300px] touch-none items-center select-none"
          onPointerDown={() => setIsDragging(true)}
        >
          <Slider.Track className="w-full rounded-[8px] bg-transparent select-none h-8 relative">
          <div className="flex justify-between items-center gap-2 absolute w-full z-10 inset-0 px-4 select-none pointer-events-none">
              <p className="text-xs text-gray-400 font-light">Volume</p>
              <p className="text-xs text-gray-400 font-light">{Math.round(displayValue)}%</p>
            </div>
            <Slider.Indicator className="rounded-[8px] bg-white select-none cursor-grab active:cursor-grabbing" />
            <motion.div
              className="absolute inset-0 flex items-center cursor-grab active:cursor-grabbing"
              animate={{
                opacity: thumbOpacity(displayValue),
                filter: `blur(${(1 - thumbOpacity(displayValue)) * 3}px)`,
              }}
              transition={{ type: 'keyframes', duration: 0.2 }}
            >
              <Slider.Thumb
                aria-label="Volume"
                className="w-1 h-5 rounded-full bg-gray-300 cursor-grab active:cursor-grabbing has-focus-visible:ring-1 has-focus-visible:ring-offset-1 has-focus-visible:ring-offset-gray-100 sm:has-focus-visible:ring-blue-400/60 pointer-events-auto"
                style={{
                  transform: `translateX(${displayValue < 9 ? '100%' : '-200%'}) scale(${0.7 + thumbOpacity(displayValue) * 0.3})`,
                }}
              />
            </motion.div>
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
