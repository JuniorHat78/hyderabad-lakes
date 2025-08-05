'use client'

import { ExternalLink } from 'lucide-react'

interface LakeMapProps {
  center: {
    lat: number
    lng: number
  }
  lakeName: string
  lakeArea?: string // e.g., "29 sq km", "4.4 sq km"
  className?: string
}

export default function LakeMap({ 
  center, 
  lakeName,
  lakeArea,
  className = "" 
}: LakeMapProps) {
  // Dynamic bounding box based on lake area for proper zoom
  const getBboxSize = (area?: string): number => {
    if (!area) return 0.01 // Default for unknown size
    
    // Extract numeric value from area string (e.g., "29 sq km" -> 29)
    const areaNum = parseFloat(area.replace(/[^0-9.]/g, ''))
    
    if (isNaN(areaNum)) return 0.01
    
    // Adjust bounding box based on area (larger bbox = more zoomed out)
    if (areaNum > 20) return 0.04    // Very large lakes (e.g., Osman Sagar - 29 sq km)
    if (areaNum > 10) return 0.025   // Large lakes 
    if (areaNum > 5) return 0.015    // Medium lakes
    if (areaNum > 2) return 0.01     // Small lakes
    return 0.005                     // Very small lakes
  }
  
  const bbox = getBboxSize(lakeArea)
  const zoom = 11 // This is used for the direct link
  
  // OpenStreetMap embed URL with marker
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng-bbox}%2C${center.lat-bbox}%2C${center.lng+bbox}%2C${center.lat+bbox}&layer=mapnik&marker=${center.lat}%2C${center.lng}`
  
  const directUrl = `https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}#map=${zoom}/${center.lat}/${center.lng}`

  return (
    <div className={`h-96 relative rounded-xl border border-[#3d4354]/50 bg-[#1c2433] ${className}`}>
      {/* Container with overflow hidden to keep map within bounds */}
      <div className="absolute inset-0 rounded-xl overflow-hidden bg-[#1c2433]">
        {/* OpenStreetMap iframe */}
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ 
            border: 0,
            filter: 'invert(90%) hue-rotate(180deg) brightness(110%) contrast(90%) saturate(0.8)'
          }}
          allowFullScreen={false}
          loading="lazy"
          title={`Map of ${lakeName}`}
        />
      </div>
      
      {/* Lake info overlay - top right */}
      <div className="absolute top-4 right-4 bg-[#1c2433]/90 backdrop-blur-sm border border-[#3d4354] rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#86a7c8] rounded-full" />
          <span className="text-xs text-[#e5e5e5]">{lakeName}</span>
          {lakeArea && (
            <>
              <span className="text-[#3d4354]">•</span>
              <span className="text-xs text-[#a3a3a3]">{lakeArea}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Open in Maps button - bottom left */}
      <div className="absolute bottom-4 left-4">
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1c2433]/90 backdrop-blur-sm border border-[#3d4354] rounded-lg px-3 py-2 text-xs text-[#e5e5e5] hover:text-[#86a7c8] hover:border-[#86a7c8]/50 transition-all duration-300"
        >
          <ExternalLink className="h-3 w-3" />
          Open in Maps
        </a>
      </div>
    </div>
  )
}