'use client'

import { useEffect, useState } from 'react'
import { getLakeGeometry, loadLakeGeometries } from '@/lib/data/lake-geometries'

interface LakeOutlineProps {
  lakeId: string
  lakeName: string
  strokeColor?: string
  strokeWidth?: string
  opacity?: string
  className?: string
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

export function LakeOutline({ 
  lakeId, 
  lakeName, 
  strokeColor = "#86a7c8",
  strokeWidth = "2",
  opacity = "0.7",
  className = ""
}: LakeOutlineProps) {
  const [geometry, setGeometry] = useState<number[][][] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    // Load geometry for this specific lake
    const loadGeometry = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        console.log(`🔍 Loading geometry for "${lakeName}" (ID: "${lakeId}")`)
        
        const geo = await getLakeGeometry(lakeId, lakeName)
        
        if (geo) {
          console.log(`✅ Geometry found for "${lakeName}":`, geo.length, 'coordinate rings')
          setGeometry(geo)
        } else {
          console.log(`❌ No geometry found for "${lakeName}"`)
          setLoadError(`No geometry data available for ${lakeName}`)
          setGeometry(null)
        }
      } catch (error) {
        console.error(`💥 Error loading geometry for "${lakeName}":`, error)
        setLoadError(error instanceof Error ? error.message : 'Unknown error')
        setGeometry(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadGeometry()
  }, [lakeId, lakeName])

  // Show loading state briefly, then render result
  if (isLoading) {
    return (
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity="0.2"
        className={`${className} animate-pulse`}
      />
    )
  }

  // If we have geometry, render the actual lake outline
  if (geometry) {
    const pathData = getSimplifiedPath(geometry)
    if (pathData) {
      console.log(`🎨 Rendering path for "${lakeName}":`, pathData.substring(0, 50) + '...')
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
    } else {
      console.warn(`⚠️ Invalid path data for "${lakeName}"`)
    }
  }

  // Fallback: render a circle with reduced opacity to indicate missing data
  console.log(`🔴 Fallback circle for "${lakeName}" - ${loadError || 'No geometry available'}`)
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
      title={loadError || 'Geometry not available'}
    />
  )
}