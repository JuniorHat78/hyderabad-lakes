// Lake geometry mapping with improved name matching
export interface LakeGeometry {
  id: string
  coordinates: number[][][]
}

// Cache for lake geometries
let geometryCache: Map<string, number[][][]> | null = null
let nameToKeyMap: Map<string, string> | null = null

// Function to load and cache lake geometries
export async function loadLakeGeometries(): Promise<Map<string, number[][][]>> {
  // If already loaded, return cache
  if (geometryCache && geometryCache.size > 0) {
    console.log(`📦 Using cached geometries: ${geometryCache.size} entries`)
    return geometryCache
  }
  
  geometryCache = new Map()
  nameToKeyMap = new Map()
  
  try {
    console.log('🌐 Fetching lake geometries from /data/lakes/hyderabad_lakes_1999.geojson')
    
    // Load Hyderabad lakes data with real names and accurate geometries (1999 has 432 lakes vs 11 in 2020)
    const { fetchLakeData } = await import('@/lib/api')
    const data = await fetchLakeData('hyderabad_lakes_1999')
    console.log(`📊 GeoJSON loaded: ${data.features?.length || 0} features`)
    
    if (!data.features || !Array.isArray(data.features)) {
      throw new Error('Invalid GeoJSON format: missing features array')
    }
    
    // Process features and create mapping
    data.features.forEach((feature: any, index: number) => {
      if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates) {
        const name = feature.properties?.name || `Lake_${feature.properties?.id || index}`
        const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        
        console.log(`🗺️ Processing feature ${index}: "${name}" -> key: "${key}"`)
        
        // Store coordinates for this lake
        geometryCache!.set(key, feature.geometry.coordinates)
        
        // Store original name mapping
        nameToKeyMap!.set(name.toLowerCase(), key)
        
        // Also store with simplified variations
        const simplifiedName = name.replace(/\b(lake|cheruvu|kunta|tank|pond|sagar|talab)\b/gi, '').trim()
        if (simplifiedName) {
          const simplifiedKey = simplifiedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          if (!geometryCache!.has(simplifiedKey)) {
            geometryCache!.set(simplifiedKey, feature.geometry.coordinates)
            nameToKeyMap!.set(simplifiedName.toLowerCase(), key)
            console.log(`  📝 Added simplified mapping: "${simplifiedName}" -> "${simplifiedKey}"`)
          }
        }
        
        // Store first word mapping
        const firstWord = name.split(/\s+/)[0].toLowerCase()
        if (firstWord.length > 3 && !nameToKeyMap!.has(firstWord)) {
          nameToKeyMap!.set(firstWord, key)
          console.log(`  🔤 Added first word mapping: "${firstWord}" -> "${key}"`)
        }
      } else {
        console.warn(`⚠️ Skipping feature ${index}: invalid geometry`, feature.geometry?.type)
      }
    })
    
    console.log(`✅ Successfully loaded ${geometryCache.size} lake geometries with ${nameToKeyMap.size} name mappings`)
    console.log(`🔑 Available keys:`, Array.from(geometryCache.keys()).slice(0, 10).join(', '))
    
  } catch (error) {
    console.error('💥 Error loading lake geometries:', error)
    // Don't clear the cache on error, in case we have partial data
    throw error
  }
  
  return geometryCache
}

// Function to get geometry for a specific lake
export async function getLakeGeometry(lakeId: string, lakeName: string): Promise<number[][][] | null> {
  // Ensure geometries are loaded first
  await loadLakeGeometries()
  
  if (!geometryCache || !nameToKeyMap) return null
  
  // Try exact ID match first
  let geometry = geometryCache.get(lakeId)
  if (geometry) return geometry
  
  // Remove parenthetical content for better matching (e.g., "Osman Sagar (Gandipet)" -> "Osman Sagar")
  const cleanName = lakeName.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  
  // Try clean name lookup
  const cleanNameLower = cleanName.toLowerCase()
  const mappedKey = nameToKeyMap.get(cleanNameLower)
  if (mappedKey) {
    geometry = geometryCache.get(mappedKey)
    if (geometry) {
      console.log(`Found geometry for "${lakeName}" using name mapping`)
      return geometry
    }
  }
  
  // Try clean name-based matching
  const cleanNameKey = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  geometry = geometryCache.get(cleanNameKey)
  if (geometry) return geometry
  
  // Try simplified name (remove common lake terms)
  const simplifiedName = cleanName.replace(/\b(lake|cheruvu|kunta|tank|pond|sagar|talab)\b/gi, '').trim()
  const simplifiedLower = simplifiedName.toLowerCase()
  const simplifiedMappedKey = nameToKeyMap.get(simplifiedLower)
  if (simplifiedMappedKey) {
    geometry = geometryCache.get(simplifiedMappedKey)
    if (geometry) {
      console.log(`Found geometry for "${lakeName}" using simplified name mapping`)
      return geometry
    }
  }
  
  // Try first word lookup
  const firstWord = cleanName.split(/\s+/)[0].toLowerCase()
  const firstWordKey = nameToKeyMap.get(firstWord)
  if (firstWordKey) {
    geometry = geometryCache.get(firstWordKey)
    if (geometry) {
      console.log(`Found geometry for "${lakeName}" using first word "${firstWord}"`)
      return geometry
    }
  }
  
  console.log(`No geometry found for lake: "${lakeName}" (cleaned: "${cleanName}", id: "${lakeId}")`)
  console.log(`Available keys: ${Array.from(nameToKeyMap.keys()).slice(0, 10).join(', ')}...`)
  return null
}