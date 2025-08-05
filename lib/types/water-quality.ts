// Water Quality Data Types

export interface WaterQualityReading {
  date: string;
  lakeName: string;
  stationName?: string;
  stationCode?: string;
  parameters: {
    // Physical parameters
    temperature?: number; // °C
    turbidity?: number; // NTU
    conductivity?: number; // mS/cm or μs/cm
    tds?: number; // Total Dissolved Solids mg/L
    tss?: number; // Total Suspended Solids mg/L
    
    // Chemical parameters
    pH?: number;
    do?: number; // Dissolved Oxygen mg/L
    bod?: number; // Biochemical Oxygen Demand mg/L
    cod?: number; // Chemical Oxygen Demand mg/L
    
    // Nutrients
    nitrateN?: number; // mg/L
    nitriteN?: number; // mg/L
    ammoniaN?: number; // mg/L
    phosphate?: number; // mg/L
    tkn?: number; // Total Kjeldahl Nitrogen mg/L
    
    // Major ions
    chloride?: number; // mg/L
    sulphate?: number; // mg/L
    sodium?: number; // mg/L
    calcium?: number; // mg/L
    magnesium?: number; // mg/L
    potassium?: number; // mg/L
    fluoride?: number; // mg/L
    boron?: number; // mg/L
    
    // Hardness
    totalHardness?: number; // mg/L as CaCO3
    calciumHardness?: number; // mg/L as CaCO3
    magnesiumHardness?: number; // mg/L as CaCO3
    
    // Alkalinity
    phenAlkalinity?: number; // mg/L
    totalAlkalinity?: number; // mg/L
    
    // Heavy metals
    arsenic?: number; // mg/L
    cadmium?: number; // mg/L
    copper?: number; // mg/L
    lead?: number; // mg/L
    chromium?: number; // mg/L
    nickel?: number; // mg/L
    zinc?: number; // mg/L
    iron?: number; // mg/L
    
    // Biological parameters
    fecalColiform?: number; // MPN/100ml
    totalColiform?: number; // MPN/100ml
    fecalStreptococci?: number; // MPN/100ml
    
    // Indices
    saprobityIndex?: number;
    diversityIndex?: number;
    sodiumPercent?: number;
    sar?: number; // Sodium Adsorption Ratio
  };
  
  // Metadata
  weather?: string;
  depth?: number; // meters
  flow?: number; // m³/sec
  color?: string;
  odor?: string;
  floatingMatter?: string;
  useDownstream?: string;
  humanActivities?: string;
  majorPolluting?: string;
  visibleEffluent?: string;
  waterBodiesType?: string;
  remarks?: string;
}

export interface WaterQualityTrend {
  parameter: string;
  unit: string;
  values: Array<{
    date: string;
    value: number;
  }>;
  trend?: 'improving' | 'stable' | 'degrading';
  latestValue?: number;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
}

export interface LakeWaterQualityData {
  lakeId: string;
  lakeName: string;
  readings: WaterQualityReading[];
  latestReading?: WaterQualityReading;
  overallQuality?: 'excellent' | 'good' | 'moderate' | 'poor';
  trends?: WaterQualityTrend[];
}

// Water Quality Index calculations
export interface WQIParameters {
  do: number;
  bod: number;
  cod: number;
  pH: number;
  totalColiform: number;
  nitrateN: number;
  phosphate: number;
  temperature: number;
  turbidity: number;
}

export interface NDCIReading {
  date: string;
  lakeId: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  count: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
  };
}

export interface NDTIReading {
  date: string;
  lakeId: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  count: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
  };
}