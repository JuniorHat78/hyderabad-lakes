'use client'

interface LakeMapVisualizationProps {
  yearlyLakeGeoJSON: any
  selectedYear: number
}

export function LakeMapVisualization({ yearlyLakeGeoJSON, selectedYear }: LakeMapVisualizationProps) {
  if (!yearlyLakeGeoJSON) return null

  return (
    <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-[#e5e5e5] mb-4">
        Lake Boundaries in {selectedYear}
      </h3>
      <div className="relative h-96 bg-[#1c2433] rounded-lg overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
          {(() => {
            // Calculate actual bounds from the data
            let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
            let validFeatures = []
            
            for (const feature of yearlyLakeGeoJSON.features.slice(0, 500)) {
              if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates?.[0]) {
                const coords = feature.geometry.coordinates[0]
                if (coords.length >= 3) {
                  validFeatures.push(feature)
                  for (const coord of coords) {
                    if (Array.isArray(coord) && coord.length >= 2) {
                      minLng = Math.min(minLng, coord[0])
                      maxLng = Math.max(maxLng, coord[0])
                      minLat = Math.min(minLat, coord[1])
                      maxLat = Math.max(maxLat, coord[1])
                    }
                  }
                }
              }
            }
            
            // If no valid features found, return empty
            if (validFeatures.length === 0 || !isFinite(minLng)) {
              return <text x="500" y="500" textAnchor="middle" fill="#a3a3a3" fontSize="14">No lake data available for {selectedYear}</text>
            }
            
            // Add padding to bounds
            const lngSpan = maxLng - minLng
            const latSpan = maxLat - minLat
            const padding = 0.05
            minLng -= lngSpan * padding
            maxLng += lngSpan * padding
            minLat -= latSpan * padding
            maxLat += latSpan * padding
            
            // Map features
            return validFeatures.slice(0, 200).map((feature, index) => {
              const coords = feature.geometry.coordinates[0]
              
              // Create path with dynamic bounds
              const pathPoints = []
              for (let i = 0; i < coords.length; i++) {
                const coord = coords[i]
                if (Array.isArray(coord) && coord.length >= 2) {
                  const x = ((coord[0] - minLng) / (maxLng - minLng)) * 1000
                  const y = (1 - (coord[1] - minLat) / (maxLat - minLat)) * 1000
                  pathPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
                }
              }
              
              if (pathPoints.length < 3) return null
              
              const path = pathPoints.join(' ') + ' Z'
              
              // Color based on area
              const area = feature.properties?.area_km2 || 0
              const strokeColor = area > 5 ? '#86a7c8' : area > 1 ? '#5a7a9a' : '#3d5a7c'
              const strokeWidth = area > 5 ? '2' : area > 1 ? '1.5' : '1'
              
              return (
                <path
                  key={index}
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity="0.7"
                  className="hover:stroke-[#e05d38] hover:opacity-100 transition-all duration-300"
                />
              )
            })
          })()}
        </svg>
        <div className="absolute bottom-4 left-4 bg-[#1c2433]/80 backdrop-blur-sm rounded px-3 py-2 text-sm text-[#a3a3a3]">
          Showing {Math.min(200, yearlyLakeGeoJSON.features.length)} lakes of {yearlyLakeGeoJSON.features.length} total
        </div>
      </div>
    </div>
  )
}