"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import LakeCard from "@/components/lakes/LakeCard"
import { lakeDatabase, filterLakes, getLakeStats, type Lake } from "@/lib/data/lakes"
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Droplets, Filter, MapPin, TrendingDown } from "lucide-react"

const LAKES_PER_PAGE = 9

export default function LakeDirectory() {
  const [search, setSearch] = useState("")
  const [currentFilter, setCurrentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredLakes, setFilteredLakes] = useState<Lake[]>(lakeDatabase)
  const [stats, setStats] = useState(getLakeStats())
  const [isFilterOpen, setIsFilterOpen] = useState(false)

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
            href="/story"
            className="inline-flex items-center gap-3 px-4 py-2.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#86a7c8] hover:border-[#86a7c8]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300 mb-8 no-underline group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Story
          </Link>

          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-light mb-4 leading-tight">
              <span className="text-[#e05d38]">Hyderabad</span> <span className="text-[#e5e5e5]">Lake</span>{" "}
              <span className="text-[#86a7c8]">Directory</span>
            </h1>
            <p className="text-xl text-[#a3a3a3] max-w-[700px] leading-relaxed">
              Comprehensive database of water bodies in Greater Hyderabad. Search, explore, and learn about each lake's
              history, current status, and conservation efforts.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
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
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Enhanced Search and Filter Section */}
        <div className="mb-12">
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

          {/* Enhanced Filter Pills */}
          <div className={`${isFilterOpen ? "block" : "hidden md:block"}`}>
            <div className="flex flex-wrap gap-3">
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
                      relative inline-flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium
                      transition-all duration-300 outline-none group overflow-hidden
                      ${
                        currentFilter === filter.value
                          ? "bg-[#e05d38] text-white border-2 border-[#e05d38] shadow-lg shadow-[#e05d38]/25 scale-105"
                          : "bg-[#2a3040]/60 backdrop-blur-sm text-[#a3a3a3] border-2 border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8] hover:bg-[#2a3040] hover:scale-105"
                      }
                    `}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {/* Status indicator or icon */}
                    {filter.color ? (
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: filter.color }} />
                    ) : Icon ? (
                      <Icon className="w-4 h-4" />
                    ) : null}

                    <span className="relative z-10">{filter.label}</span>

                    {filter.count > 0 && (
                      <span
                        className={`
                        relative z-10 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${
                          currentFilter === filter.value
                            ? "bg-white/20 text-white"
                            : "bg-[#1c2433]/80 text-[#a3a3a3] group-hover:bg-[#86a7c8]/20 group-hover:text-[#86a7c8]"
                        }
                      `}
                      >
                        {filter.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Lakes Section */}
        {filteredLakes.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#2a3040] to-[#1c2433] flex items-center justify-center border border-[#3d4354]">
              <Droplets className="h-16 w-16 text-[#86a7c8]/50" />
            </div>
            <h3 className="text-4xl font-light mb-6 text-[#e5e5e5]">No lakes found</h3>
            <p className="text-lg text-[#a3a3a3] mb-8 max-w-md mx-auto">
              Try adjusting your search terms or filters to find the lakes you're looking for.
            </p>
            <Button
              onClick={() => {
                setSearch("")
                setCurrentFilter("all")
              }}
              className="bg-[#e05d38] hover:bg-[#e05d38]/90 !text-white border-0 px-6 py-3"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Enhanced results count */}
            <div className="mb-8 flex items-center justify-between">
              <div className="text-[#a3a3a3] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#86a7c8]" />
                Showing <span className="text-[#e5e5e5] font-semibold">{displayedLakes.length}</span> of{" "}
                <span className="text-[#e5e5e5] font-semibold">{filteredLakes.length}</span> lakes
                {currentFilter !== "all" && (
                  <span className="ml-2 px-3 py-1 bg-[#e05d38]/20 text-[#e05d38] rounded-full text-sm">
                    {currentFilter}
                  </span>
                )}
              </div>
            </div>

            {/* Enhanced Lake Cards Grid */}
            <div className="grid gap-8 mb-16" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))" }}>
              {displayedLakes.map((lake, index) => (
                <div
                  key={lake.id}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <LakeCard lake={lake} />
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`
                    inline-flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium
                    transition-all duration-300 outline-none
                    ${
                      currentPage === 1
                        ? "bg-[#1c2433]/50 text-[#a3a3a3]/50 border-2 border-[#3d4354]/50 cursor-not-allowed"
                        : "bg-[#2a3040]/60 backdrop-blur-sm text-[#a3a3a3] border-2 border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8] hover:bg-[#2a3040] hover:scale-105"
                    }
                  `}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, and pages around current
                    if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`
                            relative min-w-[48px] h-12 px-4 rounded-xl text-sm font-semibold
                            transition-all duration-300 outline-none
                            ${
                              page === currentPage
                                ? "bg-[#e05d38] text-white border-2 border-[#e05d38] shadow-lg shadow-[#e05d38]/25 scale-110"
                                : "bg-[#2a3040]/60 backdrop-blur-sm text-[#a3a3a3] border-2 border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8] hover:bg-[#2a3040] hover:scale-105"
                            }
                          `}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                      return (
                        <span key={page} className="px-3 text-[#a3a3a3]/50 text-lg">
                          •••
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`
                    inline-flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium
                    transition-all duration-300 outline-none
                    ${
                      currentPage === totalPages
                        ? "bg-[#1c2433]/50 text-[#a3a3a3]/50 border-2 border-[#3d4354]/50 cursor-not-allowed"
                        : "bg-[#2a3040]/60 backdrop-blur-sm text-[#a3a3a3] border-2 border-[#3d4354] hover:border-[#86a7c8]/50 hover:text-[#86a7c8] hover:bg-[#2a3040] hover:scale-105"
                    }
                  `}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease forwards;
        }
      `}</style>
    </div>
  )
}