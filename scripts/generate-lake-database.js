const fs = require('fs');
const path = require('path');

// Function to generate a slug from lake name
function generateSlug(name, index) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // Add index to avoid duplicates
  return `${base}-${index}`;
}

// Function to determine lake status based on area changes
function determineLakeStatus(currentArea, historicalAreas, hasDisappeared, areas) {
  if (!historicalAreas || historicalAreas.length === 0) return 'critical';
  
  const maxArea = Math.max(...historicalAreas);
  const percentLoss = ((maxArea - currentArea) / maxArea) * 100;
  
  // Check if lake has been restored (gained area in recent years)
  const recentAreas = areas.filter(a => a[0] >= 2015).map(a => a[1]);
  if (recentAreas.length >= 2) {
    const recentGain = recentAreas[recentAreas.length - 1] > recentAreas[0] * 1.1;
    if (recentGain && percentLoss < 30) return 'restored';
  }
  
  if (hasDisappeared || currentArea === 0) return 'lost';
  if (percentLoss < 15) return 'active';
  if (percentLoss < 40) return 'critical';
  if (percentLoss < 70) return 'critical';
  return 'lost';
}

// Read all GeoJSON files
const lakesDir = path.join(__dirname, '../public/data/lakes');
const files = fs.readdirSync(lakesDir).filter(f => f.endsWith('.geojson'));

// Collect all unique lakes with their temporal data
const lakesMap = new Map();

files.forEach(file => {
  const year = parseInt(file.match(/(\d{4})/)?.[1] || '0');
  if (year === 0) return;
  
  const data = JSON.parse(fs.readFileSync(path.join(lakesDir, file), 'utf8'));
  
  data.features.forEach(feature => {
    const props = feature.properties;
    const name = props.name || `Lake_${props.id || 'Unknown'}`;
    const area = props.area_km2 || 0;
    
    if (!lakesMap.has(name)) {
      lakesMap.set(name, {
        name,
        areas: new Map(),
        coordinates: feature.geometry.coordinates,
        geometry: feature.geometry
      });
    }
    
    lakesMap.get(name).areas.set(year, area);
  });
});

// Generate lake database entries
const newLakes = [];
const processedNames = new Set();

// Sort lakes by their 2023 area (most recent)
const sortedLakes = Array.from(lakesMap.entries())
  .sort((a, b) => {
    const aArea2023 = a[1].areas.get(2023) || 0;
    const bArea2023 = b[1].areas.get(2023) || 0;
    return bArea2023 - aArea2023;
  });

// Process top 1500 largest lakes by current area to get more variety
sortedLakes.slice(0, 1500).forEach(([name, lakeData], index) => {
  // Skip if we already have this lake name
  if (processedNames.has(name)) return;
  processedNames.add(name);
  
  const areas = Array.from(lakeData.areas.entries()).sort((a, b) => a[0] - b[0]);
  const area2023 = lakeData.areas.get(2023) || 0;
  const area2020 = lakeData.areas.get(2020) || 0;
  const currentArea = area2023 || area2020 || areas[areas.length - 1]?.[1] || 0;
  const historicalAreas = areas.map(a => a[1]);
  const maxArea = Math.max(...historicalAreas);
  const firstYear = areas[0]?.[0];
  const lastYear = areas[areas.length - 1]?.[0];
  const hasDisappeared = currentArea === 0 && maxArea > 0;
  
  // Skip very small lakes (less than 0.01 km² or 1 hectare)
  if (maxArea < 0.01) return;
  
  // Calculate center point for coordinates
  let centerLat = 0, centerLng = 0, pointCount = 0;
  if (lakeData.geometry && lakeData.geometry.type === 'Polygon') {
    const coords = lakeData.geometry.coordinates[0];
    coords.forEach(coord => {
      centerLng += coord[0];
      centerLat += coord[1];
      pointCount++;
    });
    centerLat /= pointCount;
    centerLng /= pointCount;
  }
  
  const waterLossPercent = maxArea > 0 ? Math.round(((maxArea - currentArea) / maxArea) * 100) : 0;
  const status = determineLakeStatus(currentArea, historicalAreas, hasDisappeared, areas);
  
  // Debug first few lakes
  if (index < 5) {
    console.log(`Lake ${name}: years=${areas.map(a => a[0]).join(',')}, areas=${areas.map(a => a[1].toFixed(2)).join(',')}, loss=${waterLossPercent}%, status=${status}`);
  }
  
  // Create timeline from area data
  const timeline = [];
  const significantYears = [1980, 1990, 2000, 2010, 2020, 2023];
  significantYears.forEach(year => {
    const area = lakeData.areas.get(year);
    if (area) {
      timeline.push({
        year,
        event: year === firstYear ? 'First satellite observation' : 
               year === 2023 ? 'Current state' : 
               'Satellite measurement',
        area: `${area.toFixed(2)} km²`
      });
    }
  });
  
  const lake = {
    id: generateSlug(name, index),
    name: name.replace(/_/g, ' '),
    status,
    district: 'Hyderabad Region', // Default, could be enhanced with actual district data
    area: `${currentArea.toFixed(2)} km²`,
    coordinates: centerLat && centerLng ? { lat: centerLat, lng: centerLng } : undefined,
    waterLossPercent: waterLossPercent > 0 ? waterLossPercent : undefined,
    lastSurvey: lastYear.toString(),
    description: `Monitored through satellite imagery from ${firstYear} to ${lastYear}. ${
      waterLossPercent > 50 
        ? 'This lake has experienced severe water loss over the decades.' 
        : waterLossPercent > 20 
        ? 'This lake has shown significant changes in water area.'
        : 'This lake has remained relatively stable.'
    }`,
    tags: [
      currentArea > 1 ? 'major' : 'minor',
      status === 'lost' ? 'disappeared' : null,
      waterLossPercent > 50 ? 'severe-loss' : null,
      'satellite-tracked'
    ].filter(Boolean),
    timeline: timeline.length > 0 ? timeline : undefined,
    originalArea: maxArea !== currentArea ? `${maxArea.toFixed(2)} km²` : undefined
  };
  
  newLakes.push(lake);
});

// Generate the TypeScript code
const output = `// Auto-generated lake data from satellite imagery analysis
// Generated on: ${new Date().toISOString()}
// Total lakes tracked: ${newLakes.length}

import type { Lake } from './lakes'

export const satelliteTrackedLakes: Lake[] = ${JSON.stringify(newLakes, null, 2)}
`;

// Write to file
fs.writeFileSync(
  path.join(__dirname, '../lib/data/satellite-lakes.ts'),
  output
);

console.log(`Generated database with ${newLakes.length} lakes from satellite data`);
console.log(`Lakes by status:`);
console.log(`- Active: ${newLakes.filter(l => l.status === 'active').length}`);
console.log(`- Critical: ${newLakes.filter(l => l.status === 'critical').length}`);
console.log(`- Lost: ${newLakes.filter(l => l.status === 'lost').length}`);