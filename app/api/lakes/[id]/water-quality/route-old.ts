import { NextRequest, NextResponse } from 'next/server';
import { loadWaterQualityData, calculateWaterQualityTrends, determineOverallQuality } from '@/lib/data/water-quality-processor';
import { LakeWaterQualityData } from '@/lib/types/water-quality';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lakeId = params.id;
    
    // Load all water quality data
    const allData = await loadWaterQualityData();
    
    // Get data for specific lake
    const lakeReadings = allData[lakeId];
    
    if (!lakeReadings || lakeReadings.length === 0) {
      return NextResponse.json({ 
        error: 'No water quality data found for this lake',
        lakeId 
      }, { status: 404 });
    }
    
    // Calculate trends
    const trends = calculateWaterQualityTrends(lakeReadings);
    
    // Get latest reading
    const latestReading = lakeReadings[lakeReadings.length - 1];
    const overallQuality = determineOverallQuality(latestReading);
    
    const response: LakeWaterQualityData = {
      lakeId,
      lakeName: latestReading.lakeName,
      readings: lakeReadings,
      latestReading,
      overallQuality,
      trends
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching water quality data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch water quality data' 
    }, { status: 500 });
  }
}