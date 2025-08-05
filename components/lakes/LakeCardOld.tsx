import Link from "next/link"
import { type Lake, calculateLossPercentage, getStatusColor } from "@/lib/data/lakes"
import { MapPin, Droplets, TrendingDown, Calendar, AlertTriangle, CheckCircle } from "lucide-react"

interface LakeCardProps {
  lake: Lake
}

export default function LakeCard({ lake }: LakeCardProps) {
  const lossPercentage = calculateLossPercentage(lake)

  const getStatusIcon = (status: Lake["status"]) => {
    switch (status) {
      case "active":
        return <Droplets className="h-4 w-4" />
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "restored":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Droplets className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: Lake["status"]) => {
    switch (status) {
      case "active":
        return "Active"
      case "critical":
        return "Critical"
      case "restored":
        return "Restored"
      default:
        return "Unknown"
    }
  }

  return (
    <Link href={`/lakes/${lake.id}`} className="block h-full no-underline group">
      <div className="h-full bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/80 backdrop-blur-sm border-2 border-[#3d4354] rounded-2xl overflow-hidden hover:border-[#e05d38]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#e05d38]/10 cursor-pointer relative">
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border
              ${
                lake.status === "active"
                  ? "bg-[#86a7c8]/20 text-[#86a7c8] border-[#86a7c8]/30"
                  : lake.status === "critical"
                    ? "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30"
                    : "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30"
              }
            `}
          >
            {getStatusIcon(lake.status)}
            {getStatusLabel(lake.status)}
          </div>
        </div>

        {/* Enhanced Lake visualization */}
        <div className="relative h-64 bg-gradient-to-br from-[#1c2433] via-[#2a3040] to-[#1c2433] overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 bg-[#86a7c8] rounded-full blur-xl animate-pulse" />
            <div
              className="absolute bottom-4 right-4 w-12 h-12 bg-[#e05d38] rounded-full blur-lg animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* Lake representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Outer glow */}
              <div
                className="w-40 h-40 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-110"
                style={{ backgroundColor: getStatusColor(lake.status) }}
              />
              {/* Main lake circle */}
              <div
                className="absolute inset-0 w-32 h-32 m-auto rounded-full opacity-60 transition-all duration-500 group-hover:scale-105 group-hover:opacity-80"
                style={{ backgroundColor: getStatusColor(lake.status) }}
              />
              {/* Inner highlight */}
              <div
                className="absolute inset-0 w-20 h-20 m-auto rounded-full opacity-40 blur-sm"
                style={{ backgroundColor: getStatusColor(lake.status) }}
              />
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#86a7c8]/30 rounded-full animate-pulse"
                style={{
                  left: `${20 + ((i * 15) % 60)}%`,
                  top: `${30 + ((i * 10) % 40)}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + (i % 2)}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Lake name and location */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-[#e05d38] mb-2 transition-colors group-hover:text-[#e05d38]/80 no-underline">
              {lake.name}
            </h3>

            <div className="flex items-center gap-2 text-sm text-[#a3a3a3] no-underline">
              <MapPin className="h-4 w-4 text-[#86a7c8]" />
              {lake.district || "Unknown"} District
              {lake.yearBuilt && (
                <>
                  <span className="text-[#3d4354]">•</span>
                  <Calendar className="h-4 w-4 text-[#86a7c8]" />
                  <span>Built {lake.yearBuilt}</span>
                </>
              )}
            </div>
          </div>

          {/* Enhanced stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/50 text-center group-hover:border-[#86a7c8]/30 transition-all duration-300">
              <div className="text-2xl font-bold text-[#86a7c8] no-underline mb-1">
                {lake.area || "N/A"}
                <span className="text-sm text-[#a3a3a3] ml-1">ha</span>
              </div>
              <div className="text-xs text-[#a3a3a3] no-underline uppercase tracking-wider">Current Area</div>
            </div>
            <div className="bg-[#1c2433]/60 rounded-xl p-4 border border-[#3d4354]/50 text-center group-hover:border-[#ef4444]/30 transition-all duration-300">
              <div className="text-2xl font-bold text-[#ef4444] no-underline mb-1 flex items-center justify-center gap-1">
                <TrendingDown className="h-4 w-4" />
                {lossPercentage}%
              </div>
              <div className="text-xs text-[#a3a3a3] no-underline uppercase tracking-wider">Area Lost</div>
            </div>
          </div>

          {/* Water quality indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a3a3a3] uppercase tracking-wider">Water Quality</span>
              <span className="text-sm font-medium text-[#e5e5e5] capitalize">{lake.waterQuality || "unknown"}</span>
            </div>
            <div className="w-full bg-[#1c2433] rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  lake.waterQuality === "excellent"
                    ? "bg-[#10b981] w-full"
                    : lake.waterQuality === "good"
                      ? "bg-[#86a7c8] w-3/4"
                      : lake.waterQuality === "moderate"
                        ? "bg-[#e05d38] w-1/2"
                        : "bg-[#ef4444] w-1/4"
                }`}
              />
            </div>
          </div>

          {/* Enhanced tags */}
          <div className="flex flex-wrap gap-2">
            {lake.tags && lake.tags.length > 0 && lake.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-[#1c2433]/80 border border-[#3d4354]/50 rounded-lg text-xs text-[#a3a3a3] no-underline uppercase tracking-wider font-medium hover:border-[#86a7c8]/30 hover:text-[#86a7c8] transition-all duration-300"
              >
                {tag.replace("-", " ")}
              </span>
            ))}
            {lake.tags && lake.tags.length > 3 && (
              <span className="px-3 py-1.5 bg-[#e05d38]/20 border border-[#e05d38]/30 rounded-lg text-xs text-[#e05d38] no-underline font-medium">
                +{lake.tags.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#e05d38]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
      </div>
    </Link>
  )
}