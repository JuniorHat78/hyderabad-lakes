const fs = require('fs');
const path = require('path');

// Source directory with lake data
const sourceDir = path.join(__dirname, '..', 'hyderabad-lakes', 'data', 'processed', 'yearly_extracts');
const destDir = path.join(__dirname, 'public', 'data', 'lakes');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy lake data for all available years
for (let year = 1990; year <= 2024; year++) {
  const sourceFile = path.join(sourceDir, `hyderabad_lakes_${year}.geojson`);
  const destFile = path.join(destDir, `lakes_${year}.geojson`);
  
  if (fs.existsSync(sourceFile)) {
    try {
      const data = fs.readFileSync(sourceFile, 'utf8');
      fs.writeFileSync(destFile, data);
      console.log(`Copied data for year ${year}`);
    } catch (error) {
      console.error(`Error copying data for year ${year}:`, error);
    }
  } else {
    console.log(`No data found for year ${year}`);
  }
}

console.log('\nLake data setup complete!');
console.log(`Data copied to: ${destDir}`);