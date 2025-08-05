"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { lakeDatabase, filterLakes, getLakeStats, type Lake } from "@/lib/data/lakes"
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Droplets, Filter, MapPin, TrendingDown, Calendar, Activity } from "lucide-react"
import { LakeMapCanvas } from "@/components/LakeMapCanvas"
import { LakeOutline } from "@/components/LakeOutline"

const LAKES_PER_PAGE = 18 // 6 rows of 3 cards
const START_YEAR = 1988
const END_YEAR = 2021

interface LakeData {
  year: number
  count: number
  totalArea: number
}

export default function LakeDataDirectory() {
  const [search, setSearch] = useState("")
  const [currentFilter, setCurrentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredLakes, setFilteredLakes] = useState<Lake[]>(lakeDatabase)
  const [stats, setStats] = useState(getLakeStats())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(2021)
  const [lakeDataByYear, setLakeDataByYear] = useState<LakeData[]>([])
  const [yearlyLakeGeoJSON, setYearlyLakeGeoJSON] = useState<any>(null)
  const [showTemporalView, setShowTemporalView] = useState(false)

  // Load temporal lake data
  useEffect(() => {
    const loadTemporalData = async () => {
      const yearData: LakeData[] = []
      
      for (let year = START_YEAR; year <= END_YEAR; year++) {
        try {
          const response = await fetch(`/data/lakes/lakes_${year}.geojson`)
          if (response.ok) {
            const data = await response.json()
            const totalArea = data.features.reduce((sum: number, feature: any) => 
              sum + (feature.properties?.area_km2 || 0), 0
            )
            yearData.push({
              year,
              count: data.features.length,
              totalArea: Math.round(totalArea * 10) / 10
            })
          } else {
            console.log(`No data for year ${year}`)
          }
        } catch (error) {
          console.error(`Error loading ${year} data:`, error)
        }
      }
      
      setLakeDataByYear(yearData)
    }
    
    loadTemporalData()
  }, [])

  // Load GeoJSON for selected year
  useEffect(() => {
    if (showTemporalView) {
      fetch(`/data/lakes/lakes_${selectedYear}.geojson`)
        .then(res => res.json())
        .then(data => setYearlyLakeGeoJSON(data))
        .catch(err => console.error('Error loading year data:', err))
    }
  }, [selectedYear, showTemporalView])

  useEffect(() => {
    const filtered = filterLakes(search, currentFilter)
    setFilteredLakes(filtered)
    setCurrentPage(1)

    // Update stats based on filtered results
    const filteredStats = {
      total: filtered.length,
      active: filtered.filter((l) => l.status === "active").length,
      critical: filtered.filter((l) => l.status === "critical").length,
      restored: filtered.filter((l) => l.status === "restored").length,
      lost: filtered.filter((l) => l.status === "lost").length,
    }
    setStats(filteredStats)
  }, [search, currentFilter])

  const totalPages = Math.ceil(filteredLakes.length / LAKES_PER_PAGE)
  const startIndex = (currentPage - 1) * LAKES_PER_PAGE
  const displayedLakes = filteredLakes.slice(startIndex, startIndex + LAKES_PER_PAGE)

  const filters = [
    { value: "all", label: "All Lakes", count: lakeDatabase.length, icon: Droplets },
    {
      value: "active",
      label: "Active",
      count: lakeDatabase.filter((l) => l.status === "active").length,
      color: "#86a7c8",
    },
    {
      value: "critical",
      label: "Critical",
      count: lakeDatabase.filter((l) => l.status === "critical").length,
      color: "#ef4444",
    },
    {
      value: "restored",
      label: "Restored",
      count: lakeDatabase.filter((l) => l.status === "restored").length,
      color: "#10b981",
    },
    {
      value: "lost",
      label: "Lost/Extinct",
      count: lakeDatabase.filter((l) => l.status === "lost").length,
      color: "#6b7280",
    },
    {
      value: "major",
      label: "Major Lakes",
      count: lakeDatabase.filter((l) => l.tags?.includes("major")).length,
      icon: MapPin,
    },
    {
      value: "urban",
      label: "Urban",
      count: lakeDatabase.filter((l) => l.tags?.includes("urban")).length,
      icon: MapPin,
    },
    {
      value: "reservoir",
      label: "Reservoirs",
      count: lakeDatabase.filter((l) => l.tags?.includes("reservoir")).length,
      icon: TrendingDown,
    },
  ]

  // Get current year data
  const currentYearData = lakeDataByYear.find(d => d.year === selectedYear)
  const peakYearData = lakeDataByYear.reduce((max, d) => d.count > (max?.count || 0) ? d : max, lakeDataByYear[0])

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
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-4 py-2.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#86a7c8] hover:border-[#86a7c8]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300 mb-8 no-underline group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-light mb-4 leading-tight">
              <span className="text-[#e05d38]">Lake</span> <span className="text-[#e5e5e5]">Data</span>{" "}
              <span className="text-[#86a7c8]">Directory</span>
            </h1>
            <p className="text-xl text-[#a3a3a3] max-w-[700px] leading-relaxed">
              Explore Hyderabad's water bodies with temporal data from 1980-2024, key metrics and lake boundaries
            </p>
          </div>

          {/* Toggle between views */}
          <div className="mb-6">
            <div className="inline-flex bg-[#2a3040]/60 p-1 rounded-lg border border-[#3d4354]/50">
              <button
                onClick={() => setShowTemporalView(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !showTemporalView 
                    ? 'bg-[#e05d38] text-white' 
                    : 'text-[#a3a3a3] hover:text-[#e5e5e5]'
                }`}
              >
                Lake Database
              </button>
              <button
                onClick={() => setShowTemporalView(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  showTemporalView 
                    ? 'bg-[#e05d38] text-white' 
                    : 'text-[#a3a3a3] hover:text-[#e5e5e5]'
                }`}
              >
                Temporal Analysis
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {!showTemporalView ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#86a7c8]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#86a7c8] mb-1">{stats.total}</div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Total Lakes</div>
              </div>
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#86a7c8]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#86a7c8] mb-1">{stats.active}</div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Active</div>
              </div>
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#ef4444]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#ef4444] mb-1">{stats.critical}</div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Critical</div>
              </div>
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#10b981]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#10b981] mb-1">{stats.restored}</div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Restored</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#86a7c8]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#86a7c8] mb-1">{currentYearData?.count || 0}</div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Lakes in {selectedYear}</div>
              </div>
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#e05d38]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#e05d38] mb-1">{currentYearData?.totalArea || 0} km²</div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Total Water Area</div>
              </div>
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#ef4444]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#ef4444] mb-1">
                  {peakYearData ? Math.round(((peakYearData.count - (currentYearData?.count || 0)) / peakYearData.count) * 100) : 0}%
                </div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Loss from Peak</div>
              </div>
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 hover:border-[#10b981]/30 transition-all duration-300">
                <div className="text-2xl font-bold text-[#10b981] mb-1">{peakYearData?.year || '-'}</div>
                <div className="text-sm text-[#a3a3a3] uppercase tracking-wider">Peak Year</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {!showTemporalView ? (
          <>
            {/* Search and Filter Section */}
            <div className="mb-8">
              {/* Search Bar with better styling */}
              <div className="mb-8">
                <div className="relative max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#a3a3a3]" />
                  <Input
                    type="text"
                    placeholder="Search lakes by name, district, or tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 border-[#3d4354] bg-[#2a3040]/50 backdrop-blur-sm pl-12 pr-4 text-base text-[#e5e5e5] shadow-lg transition-all duration-300 placeholder:text-[#a3a3a3] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#e05d38] hover:border-[#86a7c8]/50"
                  />
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <div className="md:hidden mb-4">
                <Button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  variant="outline"
                  className="w-full bg-[#2a3040]/50 border-[#3d4354] !text-[#e5e5e5] hover:bg-[#2a3040] hover:border-[#86a7c8] justify-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters {currentFilter !== "all" && `(${currentFilter})`}
                </Button>
              </div>

              {/* Filter Pills */}
              <div className={`${isFilterOpen ? "block" : "hidden md:block"}`}>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => {
                    const Icon = filter.icon
                    return (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setCurrentFilter(filter.value)
                          setIsFilterOpen(false)
                        }}
                        className={`
                          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-300 outline-none
                          ${
                            currentFilter === filter.value
                              ? "bg-[#e05d38] text-white border border-[#e05d38]"
                              : "bg-[#2a3040]/40 text-[#a3a3a3] border border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8]"
                          }
                        `}
                      >
                        {filter.color ? (
                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: filter.color }} />
                        ) : Icon ? (
                          <Icon className="w-3 h-3" />
                        ) : null}
                        <span>{filter.label}</span>
                        <span
                          className={`
                          px-2 py-0.5 rounded-full text-xs font-semibold
                          ${
                            currentFilter === filter.value
                              ? "bg-white/20 text-white"
                              : "bg-[#1c2433]/60 text-[#a3a3a3]"
                          }
                        `}
                        >
                          {filter.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Lakes Grid */}
            {filteredLakes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2a3040] to-[#1c2433] flex items-center justify-center border border-[#3d4354]">
                  <Droplets className="h-12 w-12 text-[#86a7c8]/50" />
                </div>
                <h3 className="text-3xl font-light mb-4 text-[#e5e5e5]">No lakes found</h3>
                <p className="text-lg text-[#a3a3a3] mb-6 max-w-md mx-auto">
                  Try adjusting your search or filters
                </p>
                <Button
                  onClick={() => {
                    setSearch("")
                    setCurrentFilter("all")
                  }}
                  className="bg-[#e05d38] hover:bg-[#e05d38]/90 !text-white border-0"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-6 text-[#a3a3a3]">
                  Showing <span className="text-[#e5e5e5] font-semibold">{displayedLakes.length}</span> of{" "}
                  <span className="text-[#e5e5e5] font-semibold">{filteredLakes.length}</span> lakes
                </div>

                {/* Lake Cards Grid - 3 per row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {displayedLakes.map((lake, index) => {
                    return (
                      <Link
                        key={lake.id}
                        href={`/lakes/${lake.id}`}
                        className="opacity-0 animate-fade-in block no-underline group"
                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
                      >
                        <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-6 hover:border-[#86a7c8]/50 transition-all duration-300 cursor-pointer hover:bg-[#2a3040]/80 h-full">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold mb-2 text-[#e5e5e5] truncate">{lake.name}</h3>
                              {lake.district && (
                                <p className="text-sm text-[#a3a3a3] mb-3">{lake.district}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-2">
                                <div 
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    lake.status === 'active' ? 'bg-[#86a7c8]/20 text-[#86a7c8]' :
                                    lake.status === 'critical' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                                    lake.status === 'restored' ? 'bg-[#10b981]/20 text-[#10b981]' :
                                    'bg-[#6b7280]/20 text-[#6b7280]'
                                  }`}
                                >
                                  {lake.status.charAt(0).toUpperCase() + lake.status.slice(1)}
                                </div>
                                {lake.waterLossPercent !== undefined && lake.waterLossPercent > 0 && (
                                  <div className="text-sm text-[#ef4444]">
                                    -{lake.waterLossPercent}%
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Lake Outline SVG */}
                            <div className="w-20 h-20 flex-shrink-0">
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                  <LakeOutline
                                    lakeId={lake.id}
                                    lakeName={lake.name}
                                    strokeColor={
                                      lake.status === "active" ? "#86a7c8" :
                                      lake.status === "critical" ? "#ef4444" :
                                      lake.status === "restored" ? "#10b981" :
                                      "#6b7280"
                                    }
                                    strokeWidth="1.5"
                                    opacity="0.7"
                                  />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300 outline-none
                        ${
                          currentPage === 1
                            ? "bg-[#1c2433]/50 text-[#a3a3a3]/50 border border-[#3d4354]/50 cursor-not-allowed"
                            : "bg-[#2a3040]/50 text-[#a3a3a3] border border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8]"
                        }
                      `}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`
                                min-w-[40px] h-10 px-3 rounded-lg text-sm font-semibold
                                transition-all duration-300 outline-none
                                ${
                                  page === currentPage
                                    ? "bg-[#e05d38] text-white"
                                    : "bg-[#2a3040]/50 text-[#a3a3a3] border border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8]"
                                }
                              `}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === currentPage - 3 || page === currentPage + 3) {
                          return (
                            <span key={page} className="px-2 text-[#a3a3a3]/50">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300 outline-none
                        ${
                          currentPage === totalPages
                            ? "bg-[#1c2433]/50 text-[#a3a3a3]/50 border border-[#3d4354]/50 cursor-not-allowed"
                            : "bg-[#2a3040]/50 text-[#a3a3a3] border border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8]"
                        }
                      `}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Temporal Analysis View */}
            <div className="space-y-8">
              {/* Year Slider */}
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#e5e5e5]">Select Year</h3>
                  <div className="text-3xl font-bold text-[#e05d38]">{selectedYear}</div>
                </div>
                <div className="slider-container">
                  <Slider
                    value={[selectedYear]}
                    onValueChange={(value) => setSelectedYear(value[0])}
                    min={START_YEAR}
                    max={END_YEAR}
                    step={1}
                    className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#e05d38] [&_[role=slider]]:bg-[#2a3040] [&_[role=slider]]:hover:bg-[#3d4354] [&_[role=slider]]:focus-visible:outline-none [&_[role=slider]]:focus-visible:ring-2 [&_[role=slider]]:focus-visible:ring-[#86a7c8] [&_[role=slider]]:focus-visible:ring-offset-2 [&_[role=slider]]:focus-visible:ring-offset-[#1c2433] [&_[role=slider]]:transition-colors [&_>_span:first-child]:h-2 [&_>_span:first-child]:bg-[#2a3040] [&_>_span:first-child]:rounded-full [&_span.bg-primary]:!bg-[#5a7a9a]"
                  />
                </div>
                <div className="flex justify-between text-sm text-[#a3a3a3] mt-2">
                  <span>{START_YEAR}</span>
                  <span>{END_YEAR}</span>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#e5e5e5] mb-4">Lake Count Over Time</h3>
                <div className="h-32 relative">
                  {lakeDataByYear.length > 0 && (
                    <svg className="w-full h-full" viewBox={`0 0 ${lakeDataByYear.length * 20} 100`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lakeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#86a7c8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#86a7c8" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      
                      {/* Create smooth curve path */}
                      {(() => {
                        const maxCount = Math.max(...lakeDataByYear.map(d => d.count))
                        const points = lakeDataByYear.map((data, index) => {
                          const x = (index / (lakeDataByYear.length - 1)) * (lakeDataByYear.length * 20)
                          const y = 100 - (data.count / maxCount) * 90
                          return { x, y, data }
                        })
                        
                        // Create smooth curve using cubic bezier
                        let pathData = `M ${points[0].x} ${points[0].y}`
                        
                        for (let i = 1; i < points.length; i++) {
                          const prev = points[i - 1]
                          const curr = points[i]
                          const next = points[i + 1] || curr
                          
                          // Calculate control points for smooth curve
                          const cp1x = prev.x + (curr.x - prev.x) / 3
                          const cp1y = prev.y + (curr.y - prev.y) / 3
                          const cp2x = curr.x - (next.x - prev.x) / 6
                          const cp2y = curr.y - (next.y - prev.y) / 6
                          
                          pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
                        }
                        
                        const areaPath = pathData + ` L ${points[points.length - 1].x} 100 L 0 100 Z`
                        
                        return (
                          <>
                            {/* Area fill */}
                            <path
                              d={areaPath}
                              fill="url(#lakeGradient)"
                              opacity="0.8"
                            />
                            
                            {/* Line */}
                            <path
                              d={pathData}
                              fill="none"
                              stroke="#86a7c8"
                              strokeWidth="2"
                              className="transition-all duration-300"
                            />
                            
                            {/* Interactive dots */}
                            {points.map((point, index) => (
                              <g key={index}>
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="3"
                                  fill="#86a7c8"
                                  className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                />
                                <circle
                                  cx={point.x}
                                  cy="0"
                                  r="20"
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={(e) => {
                                    const tooltip = e.currentTarget.nextElementSibling
                                    if (tooltip) tooltip.classList.remove('opacity-0')
                                  }}
                                  onMouseLeave={(e) => {
                                    const tooltip = e.currentTarget.nextElementSibling
                                    if (tooltip) tooltip.classList.add('opacity-0')
                                  }}
                                />
                                <foreignObject 
                                  x={point.x - 40} 
                                  y={point.y - 35} 
                                  width="80" 
                                  height="30"
                                  className="opacity-0 pointer-events-none transition-opacity"
                                >
                                  <div className="bg-[#1c2433] border border-[#3d4354] rounded px-2 py-1 text-xs text-center">
                                    {point.data.year}: {point.data.count}
                                  </div>
                                </foreignObject>
                              </g>
                            ))}
                          </>
                        )
                      })()}
                    </svg>
                  )}
                </div>
                
                {/* Year labels */}
                <div className="flex justify-between text-xs text-[#a3a3a3] mt-2">
                  <span>{lakeDataByYear[0]?.year}</span>
                  <span>{lakeDataByYear[Math.floor(lakeDataByYear.length / 2)]?.year}</span>
                  <span>{lakeDataByYear[lakeDataByYear.length - 1]?.year}</span>
                </div>
              </div>

              {/* Lake Map Visualization */}
              <LakeMapCanvas yearlyLakeGeoJSON={yearlyLakeGeoJSON} selectedYear={selectedYear} />

              {/* Data Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#e5e5e5] mb-4">Data Sources</h3>
                  <ul className="space-y-2 text-[#a3a3a3]">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#86a7c8] mt-1.5" />
                      <span>Landsat satellite imagery (1980-2024)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#86a7c8] mt-1.5" />
                      <span>Water classification using NDWI algorithm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#86a7c8] mt-1.5" />
                      <span>Minimum area threshold: 0.5 hectares</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#86a7c8] mt-1.5" />
                      <span>Annual composite imagery analysis</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#e5e5e5] mb-4">Key Findings</h3>
                  <ul className="space-y-2 text-[#a3a3a3]">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ef4444] mt-1.5" />
                      <span>Peak lake count: {peakYearData?.count || 0} lakes in {peakYearData?.year || '-'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ef4444] mt-1.5" />
                      <span>Current lake count: {lakeDataByYear[lakeDataByYear.length - 1]?.count || 0} lakes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ef4444] mt-1.5" />
                      <span>Steepest decline: 2000-2010 period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ef4444] mt-1.5" />
                      <span>Major cause: Urban expansion</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease forwards;
        }
      `}</style>
    </div>
  )
}