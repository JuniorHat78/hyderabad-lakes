'use client';

import { useState, useEffect, useRef } from 'react';

interface PerformantLakeAnimationProps {
  target: number;
  duration: number;
  sectionIndex: number;
  currentSection: number;
}

// Pseudo-random number generator with seed
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function PerformantLakeAnimation({ 
  target, 
  duration, 
  sectionIndex, 
  currentSection 
}: PerformantLakeAnimationProps) {
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [visibleLakes, setVisibleLakes] = useState<number>(0);
  const [lakesData, setLakesData] = useState<any[]>([]);
  const [lakePositions, setLakePositions] = useState<any[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [disappearingLakes, setDisappearingLakes] = useState<Set<number>>(new Set());
  const countRef = useRef<HTMLDivElement>(null);
  const disappearIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load actual lake data from 1990
  useEffect(() => {
    fetch('/data/lakes/lakes_1990.geojson')
      .then(res => res.json())
      .then(data => {
        if (data.features) {
          // Use only 200 lakes for optimal performance
          const allLakes = data.features.filter((f: any) => f.geometry && f.geometry.type === 'Polygon');
          const selectedLakes = allLakes.slice(0, 200);
          const finalLakes = selectedLakes.map((lake: any, idx: number) => ({
            ...lake,
            uniqueId: `${idx}-0`
          }));

          // Sort by area (bigger first)
          const sortedLakes = finalLakes.sort((a: any, b: any) => 
            (b.properties?.area_km2 || 0) - (a.properties?.area_km2 || 0)
          );
          
          setLakesData(sortedLakes);
          
          // Generate random positions for each lake
          const positions = sortedLakes.map((lake: any, index: number) => {
            const seed = index * 137.5;
            return {
              x: seededRandom(seed) * 100,
              y: seededRandom(seed + 1) * 100,
              rotation: seededRandom(seed + 2) * 360,
              scale: 0.8 + seededRandom(seed + 3) * 0.4,
              appearDelay: seededRandom(seed + 4) * 500 // Random delay up to 0.5 seconds
            };
          });
          setLakePositions(positions);
        }
      })
      .catch(err => console.error('Error loading lake data:', err));
  }, []);

  // Track section changes for lake appearance/disappearance
  useEffect(() => {
    // Show lakes only when we're at section 2 (1990 section)
    if (currentSection === sectionIndex) {
      setDisappearingLakes(new Set());
      // Trigger animation when entering the section for the first time
      if (!hasAnimated && countRef.current && lakesData.length > 0) {
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
    } else if (currentSection >= sectionIndex + 1) {
      // Start disappearing when we reach the "change" section (section 3)
      // Clear any existing interval
      if (disappearIntervalRef.current) {
        clearInterval(disappearIntervalRef.current);
      }
      
      // Disappear lakes one by one
      let lakeIndex = 0;
      disappearIntervalRef.current = setInterval(() => {
        setDisappearingLakes(prev => {
          const newSet = new Set(prev);
          // Add multiple lakes at once for faster disappearance
          for (let i = 0; i < 5 && lakeIndex < lakesData.length; i++) {
            newSet.add(lakeIndex++);
          }
          
          if (lakeIndex >= lakesData.length) {
            if (disappearIntervalRef.current) {
              clearInterval(disappearIntervalRef.current);
            }
          }
          return newSet;
        });
      }, 50); // Disappear 5 lakes every 50ms
      
      return () => {
        if (disappearIntervalRef.current) {
          clearInterval(disappearIntervalRef.current);
        }
      };
    } else {
      // Hide lakes if we're before section 2
      setVisibleLakes(0);
      setMinCount(0);
      setMaxCount(0);
      setDisappearingLakes(new Set());
    }
  }, [currentSection, sectionIndex, lakesData.length, hasAnimated]);

  const animateCount = () => {
    let start = 0;
    const minTarget = 3000;
    const maxTarget = 7000;
    const increment = maxTarget / (900 / 16); // Complete in 900ms
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= maxTarget) {
        setMinCount(minTarget);
        setMaxCount(maxTarget);
        setVisibleLakes(lakesData.length);
        clearInterval(timer);
      } else {
        // Animate both numbers proportionally
        const progress = start / maxTarget;
        setMinCount(Math.floor(minTarget * progress));
        setMaxCount(Math.floor(start));
        // Show lakes proportionally to count
        const lakesToShow = Math.floor(progress * lakesData.length);
        setVisibleLakes(lakesToShow);
      }
    }, 16);
  };

  // Convert lake coordinates to simplified path - highly optimized
  const getSimplifiedPath = (coordinates: number[][][]) => {
    if (!coordinates || !coordinates[0]) return '';
    
    const ring = coordinates[0];
    if (ring.length < 3) return '';
    
    // Get bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    ring.forEach(coord => {
      minX = Math.min(minX, coord[0]);
      maxX = Math.max(maxX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxY = Math.max(maxY, coord[1]);
    });
    
    // Normalize to 0-100 range
    const normalize = (coord: number[]) => {
      const x = ((coord[0] - minX) / (maxX - minX)) * 100;
      const y = ((coord[1] - minY) / (maxY - minY)) * 100;
      return `${x},${y}`;
    };
    
    // Create highly simplified path - take very few points for best performance
    const step = Math.max(1, Math.floor(ring.length / 6)); // Very few points
    let path = `M ${normalize(ring[0])}`;
    
    for (let i = step; i < ring.length; i += step) {
      path += ` L ${normalize(ring[i])}`;
    }
    
    return path + ' Z';
  };

  return (
    <>
      {/* Lake outlines in background - highly optimized for performance */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-2000 ${
        currentSection < sectionIndex ? 'opacity-0' : 
        currentSection === sectionIndex ? 'opacity-100' : 
        currentSection > sectionIndex ? 'opacity-100' : 'opacity-0'
      }`}>
        {lakesData.slice(0, visibleLakes).map((lake, index) => {
          if (!lake.geometry || lake.geometry.type !== 'Polygon') return null;
          if (!lakePositions[index]) return null;
          
          const position = lakePositions[index];
          const isDisappearing = disappearingLakes.has(index);
          
          // Vary sizes based on actual lake area
          const area = lake.properties?.area_km2 || 0.1;
          const baseSize = area > 10 ? 80 : area > 2 ? 50 : area > 0.5 ? 30 : 15;
          const size = (baseSize + (index % 10) * 3) * position.scale;
          
          return (
            <svg
              key={lake.uniqueId || index}
              className="absolute"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: isDisappearing ? 0 : (index < visibleLakes ? 0.4 : 0),
                transform: `
                  translate(-50%, -50%) 
                  scale(${isDisappearing ? 0.5 : (index < visibleLakes ? 1 : 0.7)}) 
                  rotate(${position.rotation}deg)
                `,
                transition: isDisappearing 
                  ? 'opacity 0.3s ease-in, transform 0.3s ease-in' 
                  : 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: isDisappearing 
                  ? '0ms' 
                  : `${position.appearDelay}ms`,
                willChange: 'opacity, transform'
              }}
              viewBox="0 0 100 100"
            >
              <path
                d={getSimplifiedPath(lake.geometry.coordinates)}
                fill="none"
                stroke="#2e3e58"
                strokeWidth="0.8"
                strokeOpacity="0.9"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={getSimplifiedPath(lake.geometry.coordinates)}
                fill="#2e3e58"
                fillOpacity="0.12"
              />
            </svg>
          );
        })}
      </div>
      
      {/* Count number - positioned in the section */}
      <div ref={countRef} className="relative z-20">
        <div className="text-7xl md:text-8xl font-thin text-[#86a7c8]">
          ~{minCount.toLocaleString()}-{maxCount.toLocaleString()}
        </div>
      </div>
    </>
  );
}