'use client';

import { useState, useEffect, useRef } from 'react';

interface SectionAwareLakeAnimationProps {
  target: number;
  duration: number;
  sectionIndex: number;
  currentSection: number;
}

export function SectionAwareLakeAnimation({ 
  target, 
  duration, 
  sectionIndex, 
  currentSection 
}: SectionAwareLakeAnimationProps) {
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [visibleLakes, setVisibleLakes] = useState<number>(0);
  const [lakesData, setLakesData] = useState<any[]>([]);
  const [shouldDisappear, setShouldDisappear] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const countRef = useRef<HTMLDivElement>(null);

  // Load actual lake data from 1990
  useEffect(() => {
    fetch('/data/lakes/lakes_1990.geojson')
      .then(res => res.json())
      .then(data => {
        if (data.features) {
          // Use ALL lakes, sorted by area (bigger first)
          const sortedLakes = data.features
            .filter((f: any) => f.geometry && f.geometry.type === 'Polygon')
            .sort((a: any, b: any) => (b.properties?.area_km2 || 0) - (a.properties?.area_km2 || 0));
          setLakesData(sortedLakes);
        }
      })
      .catch(err => console.error('Error loading lake data:', err));
  }, []);

  // Track section changes for lake appearance/disappearance
  useEffect(() => {
    // Show lakes only when we're at section 2 (1990 section)
    if (currentSection === sectionIndex) {
      setShouldDisappear(false);
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
      setShouldDisappear(true);
      // Gradually reduce visible lakes
      const disappearInterval = setInterval(() => {
        setVisibleLakes(prev => {
          if (prev <= 0) {
            clearInterval(disappearInterval);
            return 0;
          }
          return Math.max(0, prev - Math.floor(lakesData.length / 20));
        });
      }, 100);
      return () => clearInterval(disappearInterval);
    } else {
      // Hide lakes if we're before section 2
      setVisibleLakes(0);
      setMinCount(0);
      setMaxCount(0);
    }
  }, [currentSection, sectionIndex, lakesData.length, hasAnimated]);

  const animateCount = () => {
    let start = 0;
    const minTarget = 3000;
    const maxTarget = 7000;
    const increment = maxTarget / (duration / 16);
    
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
    
    // Create simplified path (take every nth point)
    const step = Math.max(1, Math.floor(ring.length / 20));
    let path = `M ${normalize(ring[0])}`;
    
    for (let i = step; i < ring.length; i += step) {
      path += ` L ${normalize(ring[i])}`;
    }
    
    return path + ' Z';
  };

  return (
    <>
      {/* Lake outlines in background - section-aware */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-2000 ${
        currentSection < sectionIndex ? 'opacity-0' : 
        currentSection === sectionIndex ? 'opacity-100' : 'opacity-0'
      }`}>
        {lakesData.slice(0, visibleLakes).map((lake, index) => {
          if (!lake.geometry || lake.geometry.type !== 'Polygon') return null;
          
          // Vary sizes based on actual lake area
          const area = lake.properties?.area_km2 || 0.1;
          const baseSize = area > 10 ? 100 : area > 2 ? 70 : area > 0.5 ? 40 : 20;
          const size = baseSize + (index % 5) * 5;
          
          // Dense packing algorithm - fill viewport more completely
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
          const cols = Math.floor(viewportWidth / 60); // Approximate spacing
          const rows = Math.floor(viewportHeight / 60);
          
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          // Add organic positioning offsets
          const xOffset = ((index * 13) % 7) - 3;
          const yOffset = ((index * 17) % 7) - 3;
          const x = (col / cols) * 100 + xOffset;
          const y = (row / rows) * 100 + yOffset;
          
          return (
            <svg
              key={lake.properties?.id || index}
              className="absolute transition-all duration-700 ease-out"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: visibleLakes > index && !shouldDisappear ? 0.4 : 0,
                transform: visibleLakes > index && !shouldDisappear ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-10deg)',
                transition: 'all 0.5s ease-out',
                transitionDelay: `${(index % 20) * 50}ms`
              }}
              viewBox="0 0 100 100"
            >
              <path
                d={getSimplifiedPath(lake.geometry.coordinates)}
                fill="none"
                stroke="#a3c5d8"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
              <path
                d={getSimplifiedPath(lake.geometry.coordinates)}
                fill="#a3c5d8"
                fillOpacity="0.08"
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