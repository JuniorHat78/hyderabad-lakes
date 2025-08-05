'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Citation } from '@/components/Citation';

interface ParallaxLakeAnimationProps {
  target: number;
  duration: number;
  sectionIndex: number;
  currentSection: number;
  onAnimationComplete?: () => void;
  onDisappearComplete?: () => void;
}

export function ParallaxLakeAnimation({ 
  target, 
  duration, 
  sectionIndex, 
  currentSection,
  onAnimationComplete,
  onDisappearComplete
}: ParallaxLakeAnimationProps) {
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const countRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  // Track section changes for animation
  useEffect(() => {
    if (currentSection === sectionIndex) {
      // Trigger animation when entering the section for the first time
      if (!hasAnimated && countRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              animateCount();
              setHasAnimated(true);
              observer.disconnect();
            }
          },
          { threshold: 0.5 }
        );
        observer.observe(countRef.current);
        return () => observer.disconnect();
      }
    } else if (currentSection < sectionIndex) {
      // Reset when going back
      setMinCount(0);
      setMaxCount(0);
      setHasAnimated(false);
    }
  }, [currentSection, sectionIndex, hasAnimated]);

  const animateCount = useCallback(() => {
    // Prevent multiple animations
    if (isAnimatingRef.current || minCount > 0 || maxCount > 0) return;
    
    isAnimatingRef.current = true;
    let start = 0;
    const minTarget = 3000;
    const maxTarget = 7000;
    const increment = maxTarget / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= maxTarget) {
        setMinCount(minTarget);
        setMaxCount(maxTarget);
        clearInterval(timer);
        isAnimatingRef.current = false;
        // Call callback when animation completes
        if (onAnimationComplete) {
          setTimeout(onAnimationComplete, 1000);
        }
      } else {
        // Animate both numbers proportionally
        const progress = start / maxTarget;
        setMinCount(Math.floor(minTarget * progress));
        setMaxCount(Math.floor(start));
      }
    }, 16);
  }, [duration, onAnimationComplete, minCount, maxCount]);

  return (
    <div ref={countRef} className="relative z-20">
      <div className="text-7xl md:text-8xl font-thin text-[#86a7c8]">
        {maxCount >= 7000 ? (
          <span>
            ~{minCount.toLocaleString()}-{maxCount.toLocaleString()}
            <Citation 
              number={3}
              title="City of Lakes"
              description="Hyderabad was historically known as the 'City of Lakes' with 3,000-7,000 water bodies including natural lakes and man-made tanks. Locally known as cheruvu, kunta, or tanks, these water bodies were integral to the city's identity and water management system."
              imageUrl="https://infra.global/wp-content/uploads/2023/02/f-2-129-18167499_FILE-01.jpg"
              sourceUrl="https://en.wikipedia.org/wiki/Lakes_in_Hyderabad"
            />
          </span>
        ) : (
          `~${minCount.toLocaleString()}-${maxCount.toLocaleString()}`
        )}
      </div>
    </div>
  );
}