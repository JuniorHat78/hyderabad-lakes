'use client'

import { useEffect, useRef, useState } from 'react'

interface LakeMapCanvasProps {
  yearlyLakeGeoJSON: any
  selectedYear: number
}

interface Lake {
  type: string
  properties: {
    name?: string
    area_km2?: number
  }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
}

export function LakeMapCanvas({ yearlyLakeGeoJSON, selectedYear }: LakeMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lakeCount, setLakeCount] = useState(0)

  useEffect(() => {
    if (!yearlyLakeGeoJSON) {
      setIsLoading(false)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const container = canvas.parentElement
    if (!container) return
    
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    // Clear canvas with dark background
    ctx.fillStyle = '#1c2433'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const lakes = yearlyLakeGeoJSON.features || []
    setLakeCount(lakes.length)

    if (lakes.length === 0) {
      setIsLoading(false)
      return
    }

    // Calculate bounds from data
    let minLng = Infinity, maxLng = -Infinity
    let minLat = Infinity, maxLat = -Infinity

    lakes.forEach((feature: Lake) => {
      const processCoords = (coordList: any) => {
        if (!coordList || coordList.length === 0) return
        if (Array.isArray(coordList[0]) && typeof coordList[0][0] === 'number') {
          coordList.forEach((coord: number[]) => {
            if (coord && coord.length >= 2) {
              minLng = Math.min(minLng, coord[0])
              maxLng = Math.max(maxLng, coord[0])
              minLat = Math.min(minLat, coord[1])
              maxLat = Math.max(maxLat, coord[1])
            }
          })
        } else {
          coordList.forEach((subCoords: any) => processCoords(subCoords))
        }
      }
      processCoords(feature.geometry.coordinates)
    })

    // Add padding
    const lngPadding = (maxLng - minLng) * 0.05
    const latPadding = (maxLat - minLat) * 0.05
    minLng -= lngPadding
    maxLng += lngPadding
    minLat -= latPadding
    maxLat += latPadding

    // Convert coordinates to canvas
    const lngToX = (lng: number) => {
      return ((lng - minLng) / (maxLng - minLng)) * canvas.width
    }

    const latToY = (lat: number) => {
      return canvas.height - ((lat - minLat) / (maxLat - minLat)) * canvas.height
    }

    // Draw lakes
    lakes.forEach((lake: Lake) => {
      const area = lake.properties?.area_km2 || 0

      // Set styles based on lake size
      if (area > 5) {
        ctx.strokeStyle = 'rgba(134, 167, 200, 0.9)' // Bright blue for large lakes
        ctx.fillStyle = 'rgba(134, 167, 200, 0.2)'
        ctx.lineWidth = 2
      } else if (area > 1) {
        ctx.strokeStyle = 'rgba(90, 122, 154, 0.8)' // Medium blue
        ctx.fillStyle = 'rgba(90, 122, 154, 0.15)'
        ctx.lineWidth = 1.5
      } else {
        ctx.strokeStyle = 'rgba(61, 90, 124, 0.7)' // Darker blue for small lakes
        ctx.fillStyle = 'rgba(61, 90, 124, 0.1)'
        ctx.lineWidth = 1
      }

      const drawPolygon = (coordinates: number[][]) => {
        if (!coordinates || coordinates.length === 0) return

        ctx.beginPath()
        coordinates.forEach((coord, index) => {
          if (coord && coord.length >= 2) {
            const x = lngToX(coord[0])
            const y = latToY(coord[1])
            if (index === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
        })
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }

      try {
        if (lake.geometry.type === 'Polygon') {
          lake.geometry.coordinates.forEach((ring) => {
            drawPolygon(ring as number[][])
          })
        } else if (lake.geometry.type === 'MultiPolygon') {
          lake.geometry.coordinates.forEach((polygon) => {
            polygon.forEach((ring) => {
              drawPolygon(ring as number[][])
            })
          })
        }
      } catch (e) {
        console.warn('Error drawing lake:', e)
      }
    })

    setIsLoading(false)
  }, [yearlyLakeGeoJSON])

  return (
    <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-[#e5e5e5] mb-4">
        Lake Boundaries in {selectedYear}
      </h3>
      <div className="relative h-96 bg-[#1c2433] rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[#a3a3a3]">Loading lake data...</div>
          </div>
        )}
        {!isLoading && lakeCount > 0 && (
          <div className="absolute bottom-4 left-4 bg-[#1c2433]/80 backdrop-blur-sm rounded px-3 py-2 text-sm text-[#a3a3a3]">
            Showing {lakeCount.toLocaleString()} lakes
          </div>
        )}
        {!isLoading && lakeCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[#a3a3a3]">No lake data available for {selectedYear}</div>
          </div>
        )}
      </div>
    </div>
  )
}