'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, MapPin } from 'lucide-react';

interface CitationProps {
  number: number;
  title: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
  mapUrl?: string;
}

export function Citation({ number, title, description, imageUrl, sourceUrl, mapUrl }: CitationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const citationRef = useRef<HTMLSpanElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && citationRef.current && modalRef.current) {
      const rect = citationRef.current.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();
      
      // Calculate position to center modal above citation
      let left = rect.left + rect.width / 2 - modalRect.width / 2;
      let top = rect.top - modalRect.height - 10;
      
      // Ensure modal stays within viewport
      if (left < 10) left = 10;
      if (left + modalRect.width > window.innerWidth - 10) {
        left = window.innerWidth - modalRect.width - 10;
      }
      
      // If not enough space above, show below
      if (top < 10) {
        top = rect.bottom + 10;
      }
      
      setPosition({ top, left });
    }
  }, [isOpen]);

  const modal = isOpen && mounted ? (
    <div
      ref={modalRef}
      className="fixed z-50 w-80 bg-[#1c2433] border border-[#3d4354] rounded-lg shadow-2xl overflow-hidden transition-opacity duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseEnter={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          setIsOpen(false);
        }, 300); // 300ms delay before closing
      }}
    >
      {imageUrl && (
        <div className="relative h-40 bg-gradient-to-br from-[#2a3656] to-[#1c2433]">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c2433] to-transparent" />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-[#e5e5e5] mb-2">{title}</h3>
        <p className="text-sm text-[#a3a3a3] leading-relaxed mb-3">{description}</p>
        
        <div className="flex gap-2">
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#86a7c8] hover:text-[#e5e5e5] transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Learn more</span>
            </a>
          )}
          
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#86a7c8] hover:text-[#e5e5e5] transition-colors"
            >
              <MapPin className="h-3 w-3" />
              <span>View on map</span>
            </a>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <span
        ref={citationRef}
        className="relative inline-flex ml-0.5 cursor-pointer"
        onMouseEnter={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setIsOpen(true);
        }}
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
          }, 300); // 300ms delay before closing
        }}
      >
        <span className="relative select-none whitespace-nowrap align-baseline -top-2">
          <span className="min-w-[1rem] rounded-[0.3125rem] text-center align-middle font-mono text-[0.6rem] py-[0.1875rem] px-[0.3rem] hover:bg-[#86a7c8] hover:text-white border border-[#86a7c8]/30 bg-[#1c2433]/50 text-[#86a7c8] transition-colors">
            <span className="relative inline-block align-middle leading-tight">{number}</span>
          </span>
        </span>
      </span>

      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}