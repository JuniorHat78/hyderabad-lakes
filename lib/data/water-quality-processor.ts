import { WaterQualityReading, LakeWaterQualityData, WaterQualityTrend } from '@/lib/types/water-quality';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Map of lake names to their IDs
const lakeNameToId: Record<string, string> = {
  'Hussain Sagar': 'hussain-sagar',
  'Osman Sagar (Gandipet)': 'osman-sagar',
  'Himayat Sagar': 'himayat-sagar',
  'Shamirpet': 'shamirpet',
  'Shamirpet Lake': 'shamirpet',
};

export async function loadWaterQualityData(): Promise<Record<string, WaterQualityReading[]>> {
  const csvPath = path.join(process.cwd(), '..', 'lake-data', '02_telangana_data', 'hyderabad_lakes_water_quality.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('Water quality CSV not found:', csvPath);
    return {};
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const lakeData: Record<string, WaterQualityReading[]> = {};

  for (const record of records) {
    const lakeName = record['Lake_Name_Standardized'];
    if (!lakeName) continue;

    const lakeId = lakeNameToId[lakeName];
    if (!lakeId) continue;

    const reading: WaterQualityReading = {
      date: record['Date'] || '',
      lakeName,
      stationName: record['Station name'],
      stationCode: record['Station code'],
      parameters: {
        // Physical parameters
        temperature: parseFloat(record['Water Temp. (OC)']) || undefined,
        turbidity: parseFloat(record['Turbidity (NTU)']) || undefined,
        conductivity: parseFloat(record['Conductivity (mS/cm)']) || parseFloat(record['Conductivity (μs/cm)']) || undefined,
        tds: parseFloat(record['TDS (mg/L)']) || undefined,
        tss: parseFloat(record['TSS (mg/L)']) || undefined,
        
        // Chemical parameters
        pH: parseFloat(record['pH']) || undefined,
        do: parseFloat(record['DO (mg/L)']) || undefined,
        bod: parseFloat(record['BOD (mg/L)']) || undefined,
        cod: parseFloat(record['COD (mg/L)']) || parseFloat(record['COD (mg/L).1']) || undefined,
        
        // Nutrients
        nitrateN: parseFloat(record['Nitrate-N (mg/L)']) || parseFloat(record['Nitrate']) || undefined,
        nitriteN: parseFloat(record['Nitrite-N (mg/L)']) || undefined,
        ammoniaN: parseFloat(record['Ammonia-N (mg/L)']) || parseFloat(record['Ammonia-N  (mg/L)']) || undefined,
        phosphate: parseFloat(record['Phosphate (mg/L)']) || parseFloat(record['Total Phosphate (mg/L)']) || undefined,
        tkn: parseFloat(record['TKN (mg/L)']) || undefined,
        
        // Major ions
        chloride: parseFloat(record['Chloride (mg/L)']) || undefined,
        sulphate: parseFloat(record['Sulphate (mg/L)']) || undefined,
        sodium: parseFloat(record['Sodium (mg/L)']) || undefined,
        calcium: parseFloat(record['Calcium (mg/L)']) || parseFloat(record['Calcium as Ca+2(mg/L)']) || undefined,
        magnesium: parseFloat(record['Magnesium (mg/L)']) || parseFloat(record['Magnesium as Mg+2(mg/L)']) || undefined,
        potassium: parseFloat(record['Potassium (mg/L)']) || undefined,
        fluoride: parseFloat(record['Fluoride (mg/L)']) || undefined,
        boron: parseFloat(record['Boron (mg/L)']) || undefined,
        
        // Hardness
        totalHardness: parseFloat(record['Hardness (mg/L)']) || parseFloat(record['Total Hardness as CaCO3(mg/L)']) || undefined,
        
        // Alkalinity
        phenAlkalinity: parseFloat(record['Phen-Alk. (mg/L)']) || undefined,
        totalAlkalinity: parseFloat(record['Total Alk. (mg/L)']) || undefined,
        
        // Heavy metals
        arsenic: parseFloat(record['Arsenic']) || undefined,
        cadmium: parseFloat(record['Cadmium (Cd)']) || parseFloat(record['Cadmium']) || undefined,
        copper: parseFloat(record['Copper (Cu)']) || parseFloat(record['Copper']) || undefined,
        lead: parseFloat(record['Lead (Pb)']) || parseFloat(record['Lead']) || undefined,
        chromium: parseFloat(record['Total Chromium (T. Cr)']) || parseFloat(record['Total Chromium']) || undefined,
        nickel: parseFloat(record['Nickel (Ni)']) || parseFloat(record['Nickel']) || undefined,
        zinc: parseFloat(record['Zinc (Zn)']) || parseFloat(record['Zinc']) || undefined,
        iron: parseFloat(record['Iron (Fe)']) || parseFloat(record['Iron']) || undefined,
        
        // Biological parameters
        fecalColiform: parseFloat(record['Fecal Coliform (MPN/100ml)']) || undefined,
        totalColiform: parseFloat(record['Total Coliform (MPN/100ml)']) || parseFloat(record['Total coliform (MPN/100ml)']) || undefined,
        
        // Indices
        saprobityIndex: parseFloat(record['Saprobity index']) || undefined,
        diversityIndex: parseFloat(record['Diversity index']) || undefined,
        sodiumPercent: parseFloat(record['sodium %']) || parseFloat(record['Sodium %']) || parseFloat(record['% Sodium']) || undefined,
        sar: parseFloat(record['SAR']) || undefined,
      },
      
      // Metadata
      weather: record['Weather'],
      depth: parseFloat(record['Depth (mtrs.)']) || undefined,
      flow: parseFloat(record['Flow (m3/Sec)']) || undefined,
      color: record['Colour'],
      odor: record['Odour'],
      floatingMatter: record['Floating matter'],
      waterBodiesType: record['water_bodies'],
    };

    if (!lakeData[lakeId]) {
      lakeData[lakeId] = [];
    }
    lakeData[lakeId].push(reading);
  }

  // Sort readings by date
  for (const lakeId in lakeData) {
    lakeData[lakeId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return lakeData;
}

export function calculateWaterQualityTrends(readings: WaterQualityReading[]): WaterQualityTrend[] {
  const parameters = [
    { key: 'pH', unit: '', name: 'pH' },
    { key: 'do', unit: 'mg/L', name: 'Dissolved Oxygen' },
    { key: 'bod', unit: 'mg/L', name: 'BOD' },
    { key: 'cod', unit: 'mg/L', name: 'COD' },
    { key: 'turbidity', unit: 'NTU', name: 'Turbidity' },
    { key: 'temperature', unit: '°C', name: 'Temperature' },
    { key: 'totalColiform', unit: 'MPN/100ml', name: 'Total Coliform' },
  ];

  const trends: WaterQualityTrend[] = [];

  for (const param of parameters) {
    const values = readings
      .filter(r => r.parameters[param.key as keyof typeof r.parameters] !== undefined)
      .map(r => ({
        date: r.date,
        value: r.parameters[param.key as keyof typeof r.parameters] as number,
      }));

    if (values.length === 0) continue;

    const trend: WaterQualityTrend = {
      parameter: param.name,
      unit: param.unit,
      values,
      latestValue: values[values.length - 1]?.value,
      averageValue: values.reduce((sum, v) => sum + v.value, 0) / values.length,
      minValue: Math.min(...values.map(v => v.value)),
      maxValue: Math.max(...values.map(v => v.value)),
    };

    // Simple trend calculation based on first and last values
    if (values.length >= 2) {
      const firstValue = values[0].value;
      const lastValue = values[values.length - 1].value;
      const change = ((lastValue - firstValue) / firstValue) * 100;
      
      // Different parameters have different "good" directions
      if (param.key === 'do') {
        trend.trend = change > 10 ? 'improving' : change < -10 ? 'degrading' : 'stable';
      } else if (['bod', 'cod', 'turbidity', 'totalColiform'].includes(param.key)) {
        trend.trend = change < -10 ? 'improving' : change > 10 ? 'degrading' : 'stable';
      } else {
        trend.trend = 'stable';
      }
    }

    trends.push(trend);
  }

  return trends;
}

export function determineOverallQuality(reading: WaterQualityReading): 'excellent' | 'good' | 'moderate' | 'poor' {
  const params = reading.parameters;
  let score = 0;
  let count = 0;

  // pH (ideal: 6.5-8.5)
  if (params.pH !== undefined) {
    if (params.pH >= 6.5 && params.pH <= 8.5) score += 1;
    else if (params.pH >= 6 && params.pH <= 9) score += 0.5;
    count++;
  }

  // DO (ideal: >6 mg/L)
  if (params.do !== undefined) {
    if (params.do > 6) score += 1;
    else if (params.do > 4) score += 0.5;
    count++;
  }

  // BOD (ideal: <3 mg/L)
  if (params.bod !== undefined) {
    if (params.bod < 3) score += 1;
    else if (params.bod < 6) score += 0.5;
    count++;
  }

  // Total Coliform (ideal: <500 MPN/100ml)
  if (params.totalColiform !== undefined) {
    if (params.totalColiform < 500) score += 1;
    else if (params.totalColiform < 5000) score += 0.5;
    count++;
  }

  if (count === 0) return 'moderate';
  
  const avgScore = score / count;
  if (avgScore > 0.75) return 'excellent';
  if (avgScore > 0.5) return 'good';
  if (avgScore > 0.25) return 'moderate';
  return 'poor';
}