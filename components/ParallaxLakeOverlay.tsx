'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ParallaxLakeOverlayProps {
  isActive: boolean;
  currentSection: number;
  onAnimationComplete?: () => void;
  onDisappearComplete?: () => void;
}

// Pseudo-random number generator with seed
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function ParallaxLakeOverlay({ 
  isActive,
  currentSection,
  onAnimationComplete,
  onDisappearComplete
}: ParallaxLakeOverlayProps) {
  const [visibleLakes, setVisibleLakes] = useState<number>(0);
  const [lakesData, setLakesData] = useState<any[]>([]);
  const [lakePositions, setLakePositions] = useState<any[]>([]);
  const [disappearingLakes, setDisappearingLakes] = useState<Set<number>>(new Set());
  const [redLakes, setRedLakes] = useState<Set<number>>(new Set());
  const [viewportLakes, setViewportLakes] = useState<Set<number>>(new Set());
  const hasAnimatedRef = useRef(false);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store refs for values we need in callbacks
  const lakePositionsRef = useRef(lakePositions);
  const visibleLakesRef = useRef(visibleLakes);
  
  // Update refs when values change
  useEffect(() => {
    lakePositionsRef.current = lakePositions;
  }, [lakePositions]);
  
  useEffect(() => {
    visibleLakesRef.current = visibleLakes;
  }, [visibleLakes]);

  // Check which lakes are in viewport
  const updateViewportLakes = useCallback(() => {
    if (!lakePositionsRef.current.length) return;
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const newViewportLakes = new Set<number>();
    
    // Use ref values to avoid dependency issues
    const currentPositions = lakePositionsRef.current;
    const currentVisibleCount = visibleLakesRef.current;
    
    currentPositions.forEach((pos, index) => {
      if (index >= currentVisibleCount) return;
      
      // Calculate actual position of lake
      const lakeX = (pos.x / 100) * viewportWidth;
      const lakeY = (pos.y / 100) * viewportHeight;
      
      // Check if lake is in viewport (with some margin)
      const margin = 100;
      if (
        lakeX >= -margin && 
        lakeX <= viewportWidth + margin &&
        lakeY >= -margin && 
        lakeY <= viewportHeight + margin
      ) {
        newViewportLakes.add(index);
      }
    });
    
    setViewportLakes(newViewportLakes);
  }, []);

  // Load actual lake data from 1990
  useEffect(() => {
    import('@/lib/api').then(({ fetchLakeData }) => {
      fetchLakeData(1990)
      .then(data => {
        if (data.features) {
          // Take 500 lakes for better performance
          const allLakes = data.features.filter((f: any) => f.geometry && f.geometry.type === 'Polygon');
          const selectedLakes = allLakes.slice(0, 500);
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
    });
  }, []);

  // Update viewport lakes on scroll or resize
  useEffect(() => {
    if (!lakePositions.length) return;
    
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const handleUpdate = () => {
      if (!isMounted) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isMounted) {
          updateViewportLakes();
        }
      }, 100);
    };
    
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);
    
    // Initial check
    timeoutId = setTimeout(() => {
      if (isMounted) {
        updateViewportLakes();
      }
    }, 200);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [lakePositions.length]);

  // Handle animation when section becomes active
  useEffect(() => {
    if (isActive && !hasAnimatedRef.current && lakesData.length > 0) {
      hasAnimatedRef.current = true;
      // Animate lakes appearing
      let lakesShown = 0;
      const animationInterval = setInterval(() => {
        lakesShown += 10;
        setVisibleLakes(Math.min(lakesShown, lakesData.length));
        
        if (lakesShown >= lakesData.length) {
          clearInterval(animationInterval);
          if (onAnimationComplete) {
            setTimeout(onAnimationComplete, 1000);
          }
        }
      }, 50);
      
      return () => clearInterval(animationInterval);
    }
  }, [isActive, lakesData.length, onAnimationComplete]);

  // Handle disappearing when moving to next section
  useEffect(() => {
    if (currentSection >= 3 && hasAnimatedRef.current) {
      // Clear any existing timeouts
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
      
      // Only disappear lakes in viewport
      const viewportLakeArray = Array.from(viewportLakes).sort((a, b) => a - b);
      let lakeIndex = 0;
      
      // Start the cycle of red flash and disappear
      const cycleLakes = () => {
        if (lakeIndex >= viewportLakeArray.length) {
          if (onDisappearComplete) {
            setTimeout(onDisappearComplete, 300);
          }
          return;
        }
        
        // Get next batch of 20 lakes
        const nextBatch = new Set<number>();
        for (let i = 0; i < 20 && lakeIndex < viewportLakeArray.length; i++) {
          nextBatch.add(viewportLakeArray[lakeIndex++]);
        }
        
        // Turn them red
        setRedLakes(prev => {
          const newSet = new Set(prev);
          nextBatch.forEach(lake => newSet.add(lake));
          return newSet;
        });
        
        // After 500ms, make them disappear
        cycleTimeoutRef.current = setTimeout(() => {
          setDisappearingLakes(prev => {
            const newSet = new Set(prev);
            nextBatch.forEach(lake => newSet.add(lake));
            return newSet;
          });
          
          // After disappear animation, continue with next batch
          cycleTimeoutRef.current = setTimeout(cycleLakes, 300);
        }, 500);
      };
      
      // Start the cycle immediately
      cycleLakes();
      
      return () => {
        if (cycleTimeoutRef.current) {
          clearTimeout(cycleTimeoutRef.current);
        }
      };
    } else if (currentSection < 3) {
      // Reset when going back
      setDisappearingLakes(new Set());
      setRedLakes(new Set());
      if (cycleTimeoutRef.current) {
        clearTimeout(cycleTimeoutRef.current);
      }
    }
  }, [currentSection, viewportLakes, onDisappearComplete]);

  // Convert lake coordinates to simplified path
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
    
    // Create simplified path
    const step = Math.max(1, Math.floor(ring.length / 8));
    let path = `M ${normalize(ring[0])}`;
    
    for (let i = step; i < ring.length; i += step) {
      path += ` L ${normalize(ring[i])}`;
    }
    
    return path + ' Z';
  };

  // Only render if we have data and should be visible
  if (!isActive && currentSection < 2) return null;

  return (
    <div 
      className={`fixed inset-0 overflow-hidden pointer-events-none z-30 ${
        isActive || currentSection === 3 ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transition: 'opacity 1s ease-in-out',
      }}
    >
      {lakesData.slice(0, visibleLakes).map((lake, index) => {
        if (!lake.geometry || lake.geometry.type !== 'Polygon') return null;
        if (!lakePositions[index]) return null;
        
        const position = lakePositions[index];
        const isDisappearing = disappearingLakes.has(index);
        const isRed = redLakes.has(index);
        
        // Vary sizes based on actual lake area
        const area = lake.properties?.area_km2 || 0.1;
        const baseSize = area > 10 ? 80 : area > 2 ? 50 : area > 0.5 ? 30 : 15;
        const size = (baseSize + (index % 10) * 3) * position.scale;
        
        // Determine colors based on state - once red, stay red
        const strokeColor = (isRed || isDisappearing) ? '#ef4444' : '#86a7c8';
        const fillColor = (isRed || isDisappearing) ? '#ef4444' : '#86a7c8';
        
        return (
          <svg
            key={lake.uniqueId || index}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: isDisappearing ? 0 : (index < visibleLakes ? 0.8 : 0),
              transform: `
                translate(-50%, -50%) 
                scale(${index < visibleLakes ? 1 : 0.7}) 
                rotate(${position.rotation}deg)
              `,
              transitionProperty: isDisappearing 
                ? 'opacity, transform' 
                : isRed
                ? 'opacity, transform, stroke, fill'
                : 'opacity, transform',
              transitionDuration: isDisappearing 
                ? '0.3s' 
                : isRed
                ? '0.3s'
                : '0.6s',
              transitionTimingFunction: isDisappearing 
                ? 'ease-in' 
                : 'ease-out',
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
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeOpacity="1"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={getSimplifiedPath(lake.geometry.coordinates)}
              fill={fillColor}
              fillOpacity="0.25"
            />
          </svg>
        );
      })}
    </div>
  );
}