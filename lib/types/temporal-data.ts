// Temporal Data Types for Lake Surface Area

export interface DailySurfaceArea {
  date: string; // ISO date format
  area: number; // hectares or sq km
  sensor?: string; // e.g., "l3" for Landsat
  cloudCover?: number; // percentage
  confidence?: number; // 0-1
}

export interface MonthlySurfaceArea {
  year: number;
  month: number;
  averageArea: number;
  minArea: number;
  maxArea: number;
  dataPoints: number;
}

export interface YearlySurfaceArea {
  year: number;
  averageArea: number;
  minArea: number;
  maxArea: number;
  monsoonArea?: number; // Peak area during monsoon
  summerArea?: number; // Minimum area during summer
  dataPoints: number;
}

export interface LakeTemporalData {
  lakeId: string;
  lakeName: string;
  dailyData?: DailySurfaceArea[];
  monthlyData?: MonthlySurfaceArea[];
  yearlyData?: YearlySurfaceArea[];
  
  // Summary statistics
  statistics?: {
    totalDataPoints: number;
    dateRange: {
      start: string;
      end: string;
    };
    areaRange: {
      min: number;
      max: number;
      average: number;
    };
    trend: 'increasing' | 'stable' | 'decreasing';
    percentageChange?: number; // Overall change from start to end
    seasonalPatterns?: {
      monsoonAverage: number;
      winterAverage: number;
      summerAverage: number;
    };
  };
}

// Bhuvan WBIS data format
export interface BhuvanWSAData {
  st: string; // start date
  e: string; // end date
  a: number; // area
  s: string; // sensor
  clf: number; // cloud cover factor
  c: number; // confidence
}

export interface BhuvanMetadata {
  baname: string; // basin name
  sbname: string; // sub-basin name
  statename: string;
  distname: string;
  ordr: number;
  area: number; // total area
  name: string | null;
  rcode: string;
  wbcode: string;
  dsa: number;
  id: string;
}

// Historical GeoJSON lake boundary
export interface HistoricalLakeBoundary {
  year: number;
  geometry: GeoJSON.Geometry;
  properties: {
    area: number;
    perimeter?: number;
    centroid?: [number, number]; // [lng, lat]
  };
}

export interface LakeHistoricalBoundaries {
  lakeId: string;
  lakeName: string;
  boundaries: HistoricalLakeBoundary[];
}