'use client';

import { useEffect, useState } from 'react';
import { LakeTemporalData } from '@/lib/types/temporal-data';
import { 
  Calendar,
  TrendingUp, 
  TrendingDown, 
  Minus,
  MapPin,
  BarChart3,
  LineChart,
  Info,
  Waves
} from 'lucide-react';

interface TemporalDataTabProps {
  lakeId: string;
}

export default function TemporalDataTab({ lakeId }: TemporalDataTabProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
            ? `http://localhost:${process.env.NEXT_PUBLIC_API_PORT || '3001'}` 
            : '');
        
        const response = await fetch(`${apiUrl}/api/lakes/${lakeId}/temporal-data`);
        if (!response.ok) {
          throw new Error('Failed to fetch temporal data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lakeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-[#86a7c8]">Loading temporal data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-[#e05d38] mx-auto mb-4" />
        <p className="text-[#a3a3a3]">No temporal data available for this lake</p>
      </div>
    );
  }

  const temporalData = data.temporalData;
  const statistics = temporalData?.statistics;

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-[#10b981]" />;
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-[#ef4444]" />;
      default:
        return <Minus className="h-5 w-5 text-[#86a7c8]" />;
    }
  };

  const formatArea = (area?: number) => {
    if (!area) return 'N/A';
    if (area > 100) {
      return `${(area / 100).toFixed(1)} km²`;
    }
    return `${area.toFixed(1)} ha`;
  };

  const formatPercentage = (value?: number) => {
    if (!value) return 'N/A';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Data Availability Summary */}
      <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-[#86a7c8]" />
          <h3 className="text-lg font-medium text-[#e05d38]">Data Coverage</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#a3a3a3]">Time Range:</span>
            <div className="text-[#e5e5e5]">
              {data.dataAvailable?.yearRange?.start || 'N/A'} - {data.dataAvailable?.yearRange?.end || 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-[#a3a3a3]">Data Sources:</span>
            <div className="text-[#e5e5e5]">
              {data.dataAvailable?.hasDailyData && 'Daily satellite data'}
              {data.dataAvailable?.hasDailyData && data.dataAvailable?.hasHistoricalBoundaries && ', '}
              {data.dataAvailable?.hasHistoricalBoundaries && 'Historical boundaries'}
            </div>
          </div>
        </div>
      </div>

      {/* Surface Area Statistics */}
      {statistics && (
        <div className="bg-[#1c2433]/60 rounded-xl p-6 border border-[#3d4354]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#e05d38] flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Surface Area Analysis
            </h3>
            {getTrendIcon(statistics.trend)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <span className="text-sm text-[#a3a3a3]">Average Area</span>
              <div className="text-xl font-light text-[#e5e5e5]">
                {formatArea(statistics.areaRange?.average)}
              </div>
            </div>
            <div>
              <span className="text-sm text-[#a3a3a3]">Maximum Area</span>
              <div className="text-xl font-light text-[#10b981]">
                {formatArea(statistics.areaRange?.max)}
              </div>
            </div>
            <div>
              <span className="text-sm text-[#a3a3a3]">Minimum Area</span>
              <div className="text-xl font-light text-[#ef4444]">
                {formatArea(statistics.areaRange?.min)}
              </div>
            </div>
          </div>

          {statistics.percentageChange !== undefined && (
            <div className="pt-4 border-t border-[#3d4354]/50">
              <span className="text-sm text-[#a3a3a3]">Overall Change:</span>
              <div className={`text-2xl font-light ${statistics.percentageChange > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {formatPercentage(statistics.percentageChange)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seasonal Patterns */}
      {statistics?.seasonalPatterns && (
        <div className="bg-[#1c2433]/60 rounded-xl p-6 border border-[#3d4354]/30">
          <h3 className="text-lg font-medium text-[#e05d38] mb-4 flex items-center gap-2">
            <Waves className="h-5 w-5" />
            Seasonal Variations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-[#a3a3a3] mb-2">Monsoon (Jun-Oct)</div>
              <div className="text-xl font-light text-[#86a7c8]">
                {formatArea(statistics.seasonalPatterns.monsoonAverage)}
              </div>
              <div className="text-xs text-[#a3a3a3] mt-1">Peak water levels</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[#a3a3a3] mb-2">Winter (Nov-Feb)</div>
              <div className="text-xl font-light text-[#e5e5e5]">
                {formatArea(statistics.seasonalPatterns.winterAverage)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[#a3a3a3] mb-2">Summer (Mar-May)</div>
              <div className="text-xl font-light text-[#e05d38]">
                {formatArea(statistics.seasonalPatterns.summerAverage)}
              </div>
              <div className="text-xs text-[#a3a3a3] mt-1">Lowest water levels</div>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Summary */}
      {temporalData?.yearlyData && temporalData.yearlyData.length > 0 && (
        <div className="bg-[#1c2433]/60 rounded-xl p-6 border border-[#3d4354]/30">
          <h3 className="text-lg font-medium text-[#e05d38] mb-4 flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Yearly Surface Area Summary
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {temporalData.yearlyData.slice(-10).reverse().map((year: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-[#2a3040]/30 rounded">
                <span className="text-[#e5e5e5]">{year.year}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#a3a3a3]">
                    {formatArea(year.minArea)} - {formatArea(year.maxArea)}
                  </span>
                  <span className="text-[#86a7c8] font-medium">
                    {formatArea(year.averageArea)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Boundaries Info */}
      {data.historicalBoundaries && data.historicalBoundaries.length > 0 && (
        <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-[#86a7c8] mt-0.5" />
            <div className="text-sm text-[#a3a3a3]">
              <p>Historical lake boundaries available for {data.historicalBoundaries.length} years</p>
              <p>Showing changes in lake shape and extent from satellite imagery</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-[#86a7c8] mt-0.5" />
          <div className="text-sm text-[#a3a3a3]">
            <p>Surface area data from Bhuvan Water Bodies Information System (2012-2024)</p>
            <p>Historical boundaries from Landsat satellite imagery analysis (1984-2024)</p>
            {statistics?.totalDataPoints && (
              <p className="mt-1">Based on {statistics.totalDataPoints.toLocaleString()} satellite observations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}