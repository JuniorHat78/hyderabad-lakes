'use client'

import { useEffect, useState } from 'react'
import { getLakeGeometry } from '@/lib/data/lake-geometries'

interface DelayedLakeOutlineProps {
  lakeId: string
  lakeName: string
  strokeColor?: string
  strokeWidth?: string
  opacity?: string
  className?: string
  fallbackToCircle?: boolean
}

// Helper function to get simplified path from coordinates
const getSimplifiedPath = (coordinates: number[][][]) => {
  if (!coordinates || !coordinates[0]) return ''
  
  const ring = coordinates[0]
  if (ring.length < 3) return ''
  
  // Get bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  ring.forEach(coord => {
    minX = Math.min(minX, coord[0])
    maxX = Math.max(maxX, coord[0])
    minY = Math.min(minY, coord[1])
    maxY = Math.max(maxY, coord[1])
  })
  
  // Create path with proper scaling
  const padding = 10
  const width = 100 - 2 * padding
  const height = 100 - 2 * padding
  const scaleX = width / (maxX - minX)
  const scaleY = height / (maxY - minY)
  const scale = Math.min(scaleX, scaleY)
  
  const path = ring.map((coord, i) => {
    const x = padding + ((coord[0] - minX) * scale) + ((width - (maxX - minX) * scale) / 2)
    const y = padding + ((coord[1] - minY) * scale) + ((height - (maxY - minY) * scale) / 2)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  
  return path + ' Z'
}

export function DelayedLakeOutline({ 
  lakeId, 
  lakeName, 
  strokeColor = "#86a7c8",
  strokeWidth = "2",
  opacity = "0.7",
  className = "",
  fallbackToCircle = true
}: DelayedLakeOutlineProps) {
  const [geometry, setGeometry] = useState<number[][][] | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const loadGeometry = async () => {
      try {
        console.log(`🔄 DelayedLakeOutline: Loading geometry for "${lakeName}"`)
        
        const geo = await getLakeGeometry(lakeId, lakeName)
        
        if (isMounted) {
          setGeometry(geo)
          setIsLoaded(true)
          setHasError(!geo)
          
          if (geo) {
            console.log(`✅ DelayedLakeOutline: Found geometry for "${lakeName}"`)
          } else {
            console.log(`❌ DelayedLakeOutline: No geometry for "${lakeName}"`)
          }
        }
      } catch (error) {
        console.error(`💥 DelayedLakeOutline: Error loading "${lakeName}":`, error)
        if (isMounted) {
          setHasError(true)
          setIsLoaded(true)
          setGeometry(null)
        }
      }
    }
    
    loadGeometry()
    
    return () => {
      isMounted = false
    }
  }, [lakeId, lakeName])

  // Don't render anything until loading is complete
  if (!isLoaded) {
    return null
  }

  // If we have geometry, render the actual lake outline
  if (geometry) {
    const pathData = getSimplifiedPath(geometry)
    if (pathData) {
      return (
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity}
          className={className}
        />
      )
    }
  }

  // Only show fallback if explicitly enabled
  if (fallbackToCircle) {
    return (
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity="0.3"
        className={className}
        title="Geometry not available"
      />
    )
  }

  // Don't render anything if no geometry and no fallback
  return null
}