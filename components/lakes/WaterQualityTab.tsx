'use client';

import { useEffect, useState } from 'react';
import { LakeWaterQualityData, WaterQualityTrend } from '@/lib/types/water-quality';
import { API_CONFIG } from '@/lib/config';
import { 
  Droplets, 
  Thermometer, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface WaterQualityTabProps {
  lakeId: string;
}

export default function WaterQualityTab({ lakeId }: WaterQualityTabProps) {
  const [data, setData] = useState<LakeWaterQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        
        const response = await fetch(`${API_CONFIG.baseUrl}/api/lakes/${lakeId}/water-quality`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch water quality data');
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
        <div className="animate-pulse text-[#86a7c8]">Loading water quality data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-[#e05d38] mx-auto mb-4" />
        <p className="text-[#a3a3a3]">No water quality data available for this lake</p>
      </div>
    );
  }

  const getTrendIcon = (trend?: 'improving' | 'stable' | 'degrading' | 'increasing' | 'decreasing') => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-[#10b981]" />;
      case 'degrading':
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-[#ef4444]" />;
      default:
        return <Minus className="h-4 w-4 text-[#86a7c8]" />;
    }
  };

  const getQualityBadge = (quality?: string) => {
    const colors = {
      excellent: 'bg-[#10b981] text-white',
      good: 'bg-[#86a7c8] text-white',
      moderate: 'bg-[#e05d38] text-white',
      poor: 'bg-[#ef4444] text-white'
    };
    
    const qualityLower = quality?.toLowerCase();
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[qualityLower as keyof typeof colors] || 'bg-[#3d4354] text-[#a3a3a3]'}`}>
        {quality || 'Unknown'}
      </span>
    );
  };

  const formatValue = (value?: number, unit?: string) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(2)}${unit ? ` ${unit}` : ''}`;
  };

  const latestReading = data.latestReading;
  
  // Handle both data structures: new (parameters object) and old (flat properties)
  const getParameterValue = (paramName: string) => {
    // Try new structure first
    if (latestReading?.parameters && latestReading.parameters[paramName] !== undefined) {
      return latestReading.parameters[paramName];
    }
    // Try old structure mappings
    const oldMappings: Record<string, string> = {
      'pH': 'ph',
      'do': 'dissolvedOxygen',
      'bod': 'biochemicalOxygenDemand',
      'cod': 'cod',
      'temperature': 'temperature',
      'turbidity': 'turbidity',
      'totalColiform': 'totalColiform',
      'nitrateN': 'nitrates',
      'phosphate': 'phosphates',
      'ammoniaN': 'ammoniaN'
    };
    
    const oldKey = oldMappings[paramName];
    if (oldKey && latestReading && latestReading[oldKey] !== undefined) {
      return latestReading[oldKey];
    }
    
    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Latest Reading Header */}
      <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-[#e05d38]">Latest Water Quality Report</h3>
          {getQualityBadge(data.overallQuality)}
        </div>
        <p className="text-sm text-[#a3a3a3]">
          Measured on {latestReading?.date ? new Date(latestReading.date).toLocaleDateString() : 'Unknown'}
          {latestReading?.stationName && ` at ${latestReading.stationName}`}
        </p>
      </div>

      {/* Key Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature */}
        <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-5 w-5 text-[#86a7c8]" />
            <span className="text-sm text-[#a3a3a3]">Temperature</span>
          </div>
          <div className="text-2xl font-light text-[#e5e5e5]">
            {formatValue(getParameterValue('temperature'), '°C')}
          </div>
        </div>

        {/* pH */}
        <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-[#86a7c8]" />
            <span className="text-sm text-[#a3a3a3]">pH Level</span>
          </div>
          <div className="text-2xl font-light text-[#e5e5e5]">
            {formatValue(getParameterValue('pH'))}
          </div>
          <div className="text-xs text-[#a3a3a3] mt-1">
            {(() => {
              const pH = getParameterValue('pH');
              return pH && (pH < 6.5 || pH > 8.5) && '⚠️ Outside ideal range';
            })()}
          </div>
        </div>

        {/* Dissolved Oxygen */}
        <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-5 w-5 text-[#86a7c8]" />
            <span className="text-sm text-[#a3a3a3]">Dissolved Oxygen</span>
          </div>
          <div className="text-2xl font-light text-[#e5e5e5]">
            {formatValue(getParameterValue('do'), 'mg/L')}
          </div>
          <div className="text-xs text-[#a3a3a3] mt-1">
            {(() => {
              const doValue = getParameterValue('do');
              return doValue && doValue < 4 && '⚠️ Low oxygen levels';
            })()}
          </div>
        </div>

        {/* BOD */}
        <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-[#86a7c8]" />
            <span className="text-sm text-[#a3a3a3]">BOD</span>
          </div>
          <div className="text-2xl font-light text-[#e5e5e5]">
            {formatValue(getParameterValue('bod'), 'mg/L')}
          </div>
        </div>

        {/* COD */}
        <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-[#86a7c8]" />
            <span className="text-sm text-[#a3a3a3]">COD</span>
          </div>
          <div className="text-2xl font-light text-[#e5e5e5]">
            {formatValue(getParameterValue('cod'), 'mg/L')}
          </div>
        </div>

        {/* Turbidity */}
        <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-[#86a7c8]" />
            <span className="text-sm text-[#a3a3a3]">Turbidity</span>
          </div>
          <div className="text-2xl font-light text-[#e5e5e5]">
            {formatValue(getParameterValue('turbidity'), 'NTU')}
          </div>
        </div>
      </div>

      {/* Trends Section - Handle both Array and Object structures */}
      {data.trends && (
        <div className="bg-[#1c2433]/60 rounded-xl p-6 border border-[#3d4354]/30">
          <h3 className="text-lg font-medium text-[#e05d38] mb-4">Parameter Trends</h3>
          <div className="space-y-3">
            {Array.isArray(data.trends) ? (
              // New structure: Array of trend objects
              data.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-[#3d4354]/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[#e5e5e5]">{trend.parameter}</span>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <div className="text-right">
                    <div className="text-[#e5e5e5]">
                      {formatValue(trend.latestValue, trend.unit)}
                    </div>
                    <div className="text-xs text-[#a3a3a3]">
                      avg: {formatValue(trend.averageValue, trend.unit)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Old structure: Object with parameter keys
              Object.entries(data.trends).map(([param, trend]: [string, any], index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-[#3d4354]/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[#e5e5e5]">{param}</span>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <div className="text-right">
                    <div className="text-[#e5e5e5]">
                      {formatValue(trend.latestValue)}
                    </div>
                    {trend.changePercentage !== undefined && (
                      <div className="text-xs text-[#a3a3a3]">
                        {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Additional Parameters */}
      {(getParameterValue('totalColiform') !== undefined || 
        getParameterValue('nitrateN') !== undefined || 
        getParameterValue('phosphate') !== undefined) && (
        <div className="bg-[#1c2433]/60 rounded-xl p-6 border border-[#3d4354]/30">
          <h3 className="text-lg font-medium text-[#e05d38] mb-4">Biological & Chemical Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getParameterValue('totalColiform') !== undefined && (
              <div>
                <span className="text-sm text-[#a3a3a3]">Total Coliform</span>
                <div className="text-lg text-[#e5e5e5]">{formatValue(getParameterValue('totalColiform'), 'MPN/100ml')}</div>
              </div>
            )}
            {getParameterValue('nitrateN') !== undefined && (
              <div>
                <span className="text-sm text-[#a3a3a3]">Nitrate-N</span>
                <div className="text-lg text-[#e5e5e5]">{formatValue(getParameterValue('nitrateN'), 'mg/L')}</div>
              </div>
            )}
            {getParameterValue('phosphate') !== undefined && (
              <div>
                <span className="text-sm text-[#a3a3a3]">Phosphate</span>
                <div className="text-lg text-[#e5e5e5]">{formatValue(getParameterValue('phosphate'), 'mg/L')}</div>
              </div>
            )}
            {getParameterValue('ammoniaN') !== undefined && (
              <div>
                <span className="text-sm text-[#a3a3a3]">Ammonia-N</span>
                <div className="text-lg text-[#e5e5e5]">{formatValue(getParameterValue('ammoniaN'), 'mg/L')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-[#86a7c8] mt-0.5" />
          <div className="text-sm text-[#a3a3a3]">
            <p>Data sourced from Telangana State Pollution Control Board (TSPCB)</p>
            <p>Measurements taken at {data.readings.length} different times between 2018-2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}