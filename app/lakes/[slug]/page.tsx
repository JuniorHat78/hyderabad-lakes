import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getLakeById, 
  calculateLossPercentage, 
  getStatusColor,
  getWaterQualityInfo,
  lakeDatabase 
} from '@/lib/data/lakes';
import { 
  ExternalLink,
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Droplets, 
  AlertTriangle,
  CheckCircle,
  Share2,
  Activity,
  TrendingDown,
  Users,
  Shield,
  Info,
  TreePine,
  BarChart3,
  Beaker
} from 'lucide-react';
import ShareButtons from '@/components/lakes/ShareButtons';
import LakeMap from '@/components/LakeMap';
import WaterQualityTab from '@/components/lakes/WaterQualityTab';
import TemporalDataTab from '@/components/lakes/TemporalDataTab';

export async function generateStaticParams() {
  return lakeDatabase.map((lake) => ({
    slug: lake.id,
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LakeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const lake = getLakeById(slug);

  if (!lake) {
    notFound();
  }

  const lossPercentage = calculateLossPercentage(lake);
  const qualityInfo = getWaterQualityInfo(lake.waterQuality);
  const shareUrl = `https://juniorhat78.github.io/hyderabad-lakes/lakes/${lake.id}`;
  const shareText = `Check out ${lake.name} in Hyderabad - ${lake.description?.substring(0, 100)}...`;

  return (
    <div className="min-h-screen bg-[#1c2433] text-[#e5e5e5]">
      {/* Enhanced Header with gradient and better spacing */}
      <header className="relative bg-gradient-to-br from-[#1c2433] via-[#2a3040] to-[#1c2433] border-b border-[#3d4354]/50 py-12 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-32 h-32 bg-[#86a7c8] rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-[#e05d38] rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-8">
          {/* Back Button */}
          <Link 
            href="/lakes" 
            className="inline-flex items-center gap-3 px-4 py-2.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#86a7c8] hover:border-[#86a7c8]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300 mb-8 no-underline group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Directory
          </Link>

          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-light mb-4 leading-tight">
              <span className="text-[#e05d38]">{lake.name}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[#a3a3a3] mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#86a7c8]" />
                <span>{lake.district} District</span>
              </div>
              {lake.area && (
                <>
                  <span className="text-[#3d4354]">•</span>
                  <span>{lake.area}</span>
                </>
              )}
              {lake.yearBuilt && (
                <>
                  <span className="text-[#3d4354]">•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-[#86a7c8]" />
                    <span>Built in {lake.yearBuilt}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Enhanced Status Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#2a3040]/60 backdrop-blur-sm rounded-xl border border-[#3d4354]/50 hover:border-[#86a7c8]/30 transition-all duration-300">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(lake.status) }}
              />
              <span className="text-sm font-medium capitalize text-[#e5e5e5]">{lake.status}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Share Section */}
      <section className="bg-[#2a3040]/30 backdrop-blur-sm border-b border-[#3d4354]/50">
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#86a7c8]" />
              <span className="text-[#a3a3a3] text-sm">Share this lake:</span>
            </div>
            <ShareButtons shareUrl={shareUrl} shareText={shareText} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-[#2a3040]/80 border border-[#3d4354] rounded-xl p-1 mb-8">
                <TabsTrigger 
                  value="about" 
                  className="flex items-center gap-2 data-[state=active]:bg-[#1c2433] data-[state=active]:text-[#e05d38] rounded-lg transition-all"
                >
                  <Info className="h-4 w-4" />
                  About
                </TabsTrigger>
                <TabsTrigger 
                  value="conservation" 
                  className="flex items-center gap-2 data-[state=active]:bg-[#1c2433] data-[state=active]:text-[#e05d38] rounded-lg transition-all"
                >
                  <TreePine className="h-4 w-4" />
                  Conservation
                </TabsTrigger>
                <TabsTrigger 
                  value="temporal" 
                  className="flex items-center gap-2 data-[state=active]:bg-[#1c2433] data-[state=active]:text-[#e05d38] rounded-lg transition-all"
                >
                  <BarChart3 className="h-4 w-4" />
                  Temporal Data
                </TabsTrigger>
                <TabsTrigger 
                  value="water" 
                  className="flex items-center gap-2 data-[state=active]:bg-[#1c2433] data-[state=active]:text-[#e05d38] rounded-lg transition-all"
                >
                  <Beaker className="h-4 w-4" />
                  Water Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-8">
                {/* Map Section */}
                <div className="bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/80 backdrop-blur-sm border border-[#3d4354] rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-[#3d4354]/50">
                    <h2 className="text-2xl font-light text-[#e05d38] mb-2">Location & Boundaries</h2>
                    <p className="text-[#a3a3a3]">Interactive map showing the lake location</p>
                  </div>
                  <div className="p-6">
                    {lake.coordinates ? (
                      <LakeMap
                        center={{
                          lat: lake.coordinates.lat,
                          lng: lake.coordinates.lng
                        }}
                        lakeName={lake.name}
                        lakeArea={lake.area}
                      />
                    ) : (
                      <div className="h-96 bg-gradient-to-br from-[#1c2433] to-[#2a3040] relative overflow-hidden rounded-xl border border-[#3d4354]/50">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <MapPin className="h-16 w-16 text-[#86a7c8] mx-auto mb-4 opacity-60" />
                            <p className="text-lg text-[#e5e5e5] mb-2">Location Data Unavailable</p>
                            <p className="text-sm text-[#a3a3a3]">Coordinates not available for this lake</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/80 backdrop-blur-sm border border-[#3d4354] rounded-2xl p-6">
                  <h2 className="text-2xl font-light text-[#e05d38] mb-4">About This Lake</h2>
                  
                  {lake.tags && lake.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {lake.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-3 py-1.5 bg-[#1c2433]/80 border border-[#3d4354]/50 rounded-lg text-xs text-[#a3a3a3] uppercase tracking-wider font-medium hover:border-[#86a7c8]/30 hover:text-[#86a7c8] transition-all duration-300"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-lg leading-relaxed text-[#e5e5e5]/90">
                    {lake.description}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="conservation" className="space-y-8">
                {/* Timeline */}
                {lake.timeline && lake.timeline.length > 0 && (
                  <div className="bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/80 backdrop-blur-sm border border-[#3d4354] rounded-2xl p-6">
                    <h2 className="text-2xl font-light text-[#e05d38] mb-6">Historical Timeline</h2>
                    
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#e05d38] via-[#e05d38]/50 to-transparent" />
                      
                      {lake.timeline.map((event, index) => (
                        <div key={index} className="relative flex items-start gap-6 mb-8 last:mb-0">
                          <div className="absolute left-4 top-2 w-4 h-4 bg-[#e05d38] rounded-full border-4 border-[#2a3040] shadow-lg" />
                          <div className="ml-12">
                            <div className="text-[#e05d38] font-semibold mb-1 text-lg">{event.year}</div>
                            <div className="text-[#e5e5e5]/90 mb-2">{event.event}</div>
                            {event.area && (
                              <div className="text-sm text-[#a3a3a3]">Area: {event.area}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conservation Status */}
                {(lake.threats || lake.restorationEfforts) && (
                  <div className="bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/80 backdrop-blur-sm border border-[#3d4354] rounded-2xl p-6">
                    <h2 className="text-2xl font-light text-[#e05d38] mb-6">Conservation Status</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Threats */}
                      {lake.threats && lake.threats.length > 0 && (
                        <div className="bg-[#1c2433]/60 rounded-xl p-6 border border-[#3d4354]/30">
                          <h3 className="text-lg font-medium mb-4 text-[#ef4444] flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Current Threats
                          </h3>
                          <ul className="space-y-3">
                            {lake.threats.map((threat, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-[#ef4444] mt-1 text-sm">•</span>
                                <span className="text-[#e5e5e5]/80">{threat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Restoration Efforts */}
                      {lake.restorationEfforts && lake.restorationEfforts.length > 0 && (
                        <div className="bg-[#1c2433]/60 rounded-xl p-6 border border-[#3d4354]/30">
                          <h3 className="text-lg font-medium mb-4 text-[#10b981] flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Restoration Efforts
                          </h3>
                          <ul className="space-y-3">
                            {lake.restorationEfforts.map((effort, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-[#10b981] mt-1">✓</span>
                                <span className="text-[#e5e5e5]/80">{effort}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!lake.timeline && !lake.threats && !lake.restorationEfforts && (
                  <div className="text-center py-12">
                    <TreePine className="h-12 w-12 text-[#86a7c8] mx-auto mb-4 opacity-60" />
                    <p className="text-lg text-[#e5e5e5] mb-2">No Conservation Data Available</p>
                    <p className="text-sm text-[#a3a3a3]">Conservation information for this lake is not yet available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="temporal">
                <TemporalDataTab lakeId={lake.id} />
              </TabsContent>

              <TabsContent value="water">
                <WaterQualityTab lakeId={lake.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Stats Sidebar */}
          <div className="space-y-6">
            {/* Key Statistics Card */}
            <div className="bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/80 backdrop-blur-sm border border-[#3d4354] rounded-2xl p-6 sticky top-6">
              <h2 className="text-2xl font-light text-[#e05d38] mb-6">Key Statistics</h2>
              
              <div className="space-y-6">
                {/* Area Statistics */}
                <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-4 w-4 text-[#86a7c8]" />
                    <span className="text-sm text-[#a3a3a3] uppercase tracking-wider">Area Statistics</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-light text-[#e5e5e5]">{lake.area || "N/A"}</div>
                      <div className="text-sm text-[#a3a3a3]">Current Area</div>
                    </div>
                    {lake.originalArea && (
                      <div className="pt-3 border-t border-[#3d4354]/50">
                        <div className="text-2xl font-light text-[#ef4444]">-{lossPercentage}%</div>
                        <div className="text-sm text-[#a3a3a3]">Lost from {lake.originalArea}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Physical Properties */}
                {(lake.depth || lake.volume) && (
                  <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Droplets className="h-4 w-4 text-[#86a7c8]" />
                      <span className="text-sm text-[#a3a3a3] uppercase tracking-wider">Physical Properties</span>
                    </div>
                    <div className="space-y-3">
                      {lake.depth && (
                        <div>
                          <div className="text-2xl font-light text-[#e5e5e5]">{lake.depth} m</div>
                          <div className="text-sm text-[#a3a3a3]">Maximum Depth</div>
                        </div>
                      )}
                      {lake.volume && (
                        <div className={lake.depth ? "pt-3 border-t border-[#3d4354]/50" : ""}>
                          <div className="text-2xl font-light text-[#e5e5e5]">{lake.volume} MCM</div>
                          <div className="text-sm text-[#a3a3a3]">Water Volume</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Water Quality */}
                {lake.waterQuality && (
                  <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-[#86a7c8]" />
                      <span className="text-sm text-[#a3a3a3] uppercase tracking-wider">Water Quality</span>
                    </div>
                    <div>
                      <div className="text-xl font-light text-[#e5e5e5] mb-3 capitalize">
                        {lake.waterQuality}
                      </div>
                      <div className="w-full h-2 bg-[#2a3040] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${qualityInfo.class}`}
                          style={{ width: qualityInfo.width }}
                        />
                      </div>
                      <div className="text-xs text-[#a3a3a3] mt-2">
                        {qualityInfo.width.replace('%', '')}% Quality Index
                      </div>
                    </div>
                  </div>
                )}
                {/* Enhanced Action Buttons */}
                <div className="space-y-3 pt-6 border-t border-[#3d4354]/50">
                  {lake.coordinates ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${lake.coordinates.lat}&mlon=${lake.coordinates.lng}#map=15/${lake.coordinates.lat}/${lake.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-[#e05d38] text-white hover:bg-[#c94f2f] border-0 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#e05d38]/20 flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Map
                      </Button>
                    </a>
                  ) : (
                    <Button 
                      disabled
                      className="w-full bg-[#3d4354]/50 text-[#a3a3a3] border-0 py-3 rounded-xl cursor-not-allowed"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Location Unavailable
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}