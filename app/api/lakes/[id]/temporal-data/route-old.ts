import { NextRequest, NextResponse } from 'next/server';
import { loadTemporalData, loadHistoricalBoundaries } from '@/lib/data/temporal-data-processor';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lakeId = params.id;
    
    // Load temporal data from Bhuvan
    const temporalData = await loadTemporalData(lakeId);
    
    // Load historical boundaries from GeoJSON files
    const historicalBoundaries = await loadHistoricalBoundaries(lakeId);
    
    if (!temporalData && historicalBoundaries.length === 0) {
      return NextResponse.json({ 
        error: 'No temporal data found for this lake',
        lakeId 
      }, { status: 404 });
    }
    
    const response = {
      lakeId,
      temporalData,
      historicalBoundaries,
      dataAvailable: {
        hasDailyData: temporalData?.dailyData && temporalData.dailyData.length > 0,
        hasHistoricalBoundaries: historicalBoundaries.length > 0,
        yearRange: {
          start: temporalData?.statistics?.dateRange.start 
            ? new Date(temporalData.statistics.dateRange.start).getFullYear()
            : historicalBoundaries.length > 0 ? historicalBoundaries[0].year : null,
          end: temporalData?.statistics?.dateRange.end
            ? new Date(temporalData.statistics.dateRange.end).getFullYear()
            : historicalBoundaries.length > 0 ? historicalBoundaries[historicalBoundaries.length - 1].year : null
        }
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching temporal data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch temporal data' 
    }, { status: 500 });
  }
}