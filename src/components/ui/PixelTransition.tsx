import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface PixelTransitionProps {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  isTriggered: boolean;
  className?: string;
  onComplete?: () => void;
}

const PixelTransition: React.FC<PixelTransitionProps> = ({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = '#28c840', // acid green hacker color
  animationStepDuration = 0.4,
  isTriggered,
  className = '',
  onComplete
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pixelGridRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const delayedCallRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const pixelGridEl = pixelGridRef.current;
    if (!pixelGridEl) return;

    pixelGridEl.innerHTML = '';

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixelated-transition__pixel');
        pixel.classList.add('absolute', 'hidden');
        pixel.style.backgroundColor = pixelColor;
        // Optional border for grid effect
        // pixel.style.border = '1px solid rgba(0,0,0,0.1)';

        const size = 100 / gridSize;
        pixel.style.width = `${size}%`;
        pixel.style.height = `${size}%`;
        pixel.style.left = `${col * size}%`;
        pixel.style.top = `${row * size}%`;

        pixelGridEl.appendChild(pixel);
      }
    }
  }, [gridSize, pixelColor]);

  useEffect(() => {
    const pixelGridEl = pixelGridRef.current;
    const activeEl = activeRef.current;
    if (!pixelGridEl || !activeEl) return;

    const pixels = pixelGridEl.querySelectorAll<HTMLDivElement>('.pixelated-transition__pixel');
    if (!pixels.length) return;

    if (isTriggered) {
      gsap.killTweensOf(pixels);
      if (delayedCallRef.current) delayedCallRef.current.kill();

      gsap.set(pixels, { display: 'none' });

      const totalPixels = pixels.length;
      const staggerDuration = animationStepDuration / totalPixels;

      gsap.to(pixels, {
        display: 'block',
        duration: 0,
        stagger: {
          each: staggerDuration,
          from: 'random'
        }
      });

      delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
        activeEl.style.display = 'block';
        activeEl.style.pointerEvents = 'auto'; // Re-enable pointer events on the new content
      });

      gsap.to(pixels, {
        display: 'none',
        duration: 0,
        delay: animationStepDuration,
        stagger: {
          each: staggerDuration,
          from: 'random'
        },
        onComplete: () => {
            if (onComplete) onComplete();
        }
      });
    }
  }, [isTriggered, animationStepDuration, onComplete]);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Default (Landing) Content */}
      <div className="absolute inset-0 w-full h-full z-10" aria-hidden={isTriggered}>
        {firstContent}
      </div>

      {/* Second Content (Terminal) */}
      <div
        ref={activeRef}
        className="absolute inset-0 w-full h-full z-20"
        style={{ display: 'none', pointerEvents: 'none' }} 
        aria-hidden={!isTriggered}
      >
        {secondContent}
      </div>

      {/* Transition Grid Overlay */}
      <div ref={pixelGridRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />
    </div>
  );
};

export default PixelTransition;
