import { 
  LakeTemporalData, 
  DailySurfaceArea, 
  MonthlySurfaceArea, 
  YearlySurfaceArea,
  BhuvanWSAData,
  BhuvanMetadata 
} from '@/lib/types/temporal-data';
import path from 'path';
import fs from 'fs';

// Map Bhuvan IDs to our lake IDs
const bhuvanIdToLakeId: Record<string, string> = {
  // These need to be mapped based on actual data
  // For now, we'll use a placeholder mapping
};

// Map lake names to Bhuvan folder IDs
const lakeNameToBhuvanId: Record<string, string> = {
  'hussain-sagar': '1007878045612624311', // Example ID, needs verification
  'osman-sagar': '1000959528031155202',    // Example ID, needs verification
  'himayat-sagar': '1001150645686139370',  // Example ID, needs verification
  // Add more mappings as we identify them
};

export async function loadTemporalData(lakeId: string): Promise<LakeTemporalData | null> {
  const bhuvanId = lakeNameToBhuvanId[lakeId];
  
  if (!bhuvanId) {
    console.log(`No Bhuvan ID mapping found for lake: ${lakeId}`);
    return null;
  }

  const bhuvanBasePath = path.join(process.cwd(), '..', 'lake-data', '01_raw_data', 'bhuvan_wbis', bhuvanId);
  
  if (!fs.existsSync(bhuvanBasePath)) {
    console.error('Bhuvan data directory not found:', bhuvanBasePath);
    return null;
  }

  try {
    // Load metadata
    const metadataPath = path.join(bhuvanBasePath, 'metadata.json');
    const metadata: BhuvanMetadata[] = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const lakeMetadata = metadata[0];

    // Load daily water surface area data
    const wsaDailyPath = path.join(bhuvanBasePath, 'wsa_daily.json');
    const wsaDailyData: BhuvanWSAData[] = JSON.parse(fs.readFileSync(wsaDailyPath, 'utf-8'));

    // Convert Bhuvan data to our format
    const dailyData: DailySurfaceArea[] = wsaDailyData
      .filter(d => d.a > 0) // Filter out zero area entries
      .map(d => ({
        date: d.st,
        area: d.a, // hectares
        sensor: d.s,
        cloudCover: d.clf,
        confidence: d.c
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate monthly aggregates
    const monthlyData = calculateMonthlyAggregates(dailyData);
    
    // Calculate yearly aggregates
    const yearlyData = calculateYearlyAggregates(dailyData);

    // Calculate statistics
    const statistics = calculateStatistics(dailyData, monthlyData, yearlyData);

    return {
      lakeId,
      lakeName: lakeMetadata.name || lakeId,
      dailyData,
      monthlyData,
      yearlyData,
      statistics
    };
  } catch (error) {
    console.error('Error loading temporal data:', error);
    return null;
  }
}

function calculateMonthlyAggregates(dailyData: DailySurfaceArea[]): MonthlySurfaceArea[] {
  const monthlyMap = new Map<string, DailySurfaceArea[]>();

  dailyData.forEach(d => {
    const date = new Date(d.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, []);
    }
    monthlyMap.get(key)!.push(d);
  });

  const monthlyData: MonthlySurfaceArea[] = [];
  
  monthlyMap.forEach((days, key) => {
    const [year, month] = key.split('-').map(Number);
    const areas = days.map(d => d.area);
    
    monthlyData.push({
      year,
      month,
      averageArea: areas.reduce((sum, a) => sum + a, 0) / areas.length,
      minArea: Math.min(...areas),
      maxArea: Math.max(...areas),
      dataPoints: areas.length
    });
  });

  return monthlyData.sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
}

function calculateYearlyAggregates(dailyData: DailySurfaceArea[]): YearlySurfaceArea[] {
  const yearlyMap = new Map<number, DailySurfaceArea[]>();

  dailyData.forEach(d => {
    const year = new Date(d.date).getFullYear();
    
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, []);
    }
    yearlyMap.get(year)!.push(d);
  });

  const yearlyData: YearlySurfaceArea[] = [];
  
  yearlyMap.forEach((days, year) => {
    const areas = days.map(d => d.area);
    
    // Calculate seasonal areas
    const monsoonDays = days.filter(d => {
      const month = new Date(d.date).getMonth() + 1;
      return month >= 6 && month <= 10; // June to October
    });
    
    const summerDays = days.filter(d => {
      const month = new Date(d.date).getMonth() + 1;
      return month >= 3 && month <= 5; // March to May
    });
    
    yearlyData.push({
      year,
      averageArea: areas.reduce((sum, a) => sum + a, 0) / areas.length,
      minArea: Math.min(...areas),
      maxArea: Math.max(...areas),
      monsoonArea: monsoonDays.length > 0 
        ? monsoonDays.map(d => d.area).reduce((sum, a) => sum + a, 0) / monsoonDays.length
        : undefined,
      summerArea: summerDays.length > 0
        ? summerDays.map(d => d.area).reduce((sum, a) => sum + a, 0) / summerDays.length
        : undefined,
      dataPoints: areas.length
    });
  });

  return yearlyData.sort((a, b) => a.year - b.year);
}

function calculateStatistics(
  dailyData: DailySurfaceArea[],
  monthlyData: MonthlySurfaceArea[],
  yearlyData: YearlySurfaceArea[]
): LakeTemporalData['statistics'] {
  if (dailyData.length === 0) return undefined;

  const areas = dailyData.map(d => d.area);
  const firstYear = yearlyData[0];
  const lastYear = yearlyData[yearlyData.length - 1];
  
  // Calculate seasonal averages
  const seasonalData = {
    monsoon: dailyData.filter(d => {
      const month = new Date(d.date).getMonth() + 1;
      return month >= 6 && month <= 10;
    }),
    winter: dailyData.filter(d => {
      const month = new Date(d.date).getMonth() + 1;
      return month >= 11 || month <= 2;
    }),
    summer: dailyData.filter(d => {
      const month = new Date(d.date).getMonth() + 1;
      return month >= 3 && month <= 5;
    })
  };

  // Determine trend
  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (firstYear && lastYear) {
    const change = ((lastYear.averageArea - firstYear.averageArea) / firstYear.averageArea) * 100;
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';
  }

  return {
    totalDataPoints: dailyData.length,
    dateRange: {
      start: dailyData[0].date,
      end: dailyData[dailyData.length - 1].date
    },
    areaRange: {
      min: Math.min(...areas),
      max: Math.max(...areas),
      average: areas.reduce((sum, a) => sum + a, 0) / areas.length
    },
    trend,
    percentageChange: firstYear && lastYear 
      ? ((lastYear.averageArea - firstYear.averageArea) / firstYear.averageArea) * 100
      : undefined,
    seasonalPatterns: {
      monsoonAverage: seasonalData.monsoon.length > 0
        ? seasonalData.monsoon.map(d => d.area).reduce((sum, a) => sum + a, 0) / seasonalData.monsoon.length
        : 0,
      winterAverage: seasonalData.winter.length > 0
        ? seasonalData.winter.map(d => d.area).reduce((sum, a) => sum + a, 0) / seasonalData.winter.length
        : 0,
      summerAverage: seasonalData.summer.length > 0
        ? seasonalData.summer.map(d => d.area).reduce((sum, a) => sum + a, 0) / seasonalData.summer.length
        : 0
    }
  };
}

// Load historical yearly boundaries from GeoJSON files
export async function loadHistoricalBoundaries(lakeId: string): Promise<any[]> {
  const boundaries = [];
  const geoJsonPath = path.join(process.cwd(), '..', 'lake-data', '07_comprehensive_historical_data');
  
  // Check for years 1984-2024
  for (let year = 1984; year <= 2024; year++) {
    const filePath = path.join(geoJsonPath, `lakes_${year}.geojson`);
    
    if (fs.existsSync(filePath)) {
      try {
        const geojson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // Find the specific lake in the GeoJSON
        const lakeBoundary = geojson.features?.find((f: any) => 
          f.properties?.name?.toLowerCase().includes(lakeId.replace('-', ' ')) ||
          f.properties?.id === lakeId
        );
        
        if (lakeBoundary) {
          boundaries.push({
            year,
            ...lakeBoundary
          });
        }
      } catch (error) {
        console.error(`Error reading GeoJSON for year ${year}:`, error);
      }
    }
  }
  
  return boundaries;
}