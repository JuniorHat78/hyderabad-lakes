import Link from "next/link"
import { type Lake, calculateLossPercentage, getStatusColor } from "@/lib/data/lakes"
import { MapPin, Activity, Calendar, AlertTriangle, CheckCircle, Droplets } from "lucide-react"

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
  
  // Generate a simple lake shape SVG based on status
  const getLakeShapePath = (status: Lake["status"]) => {
    // Simple organic shapes for different lake statuses
    switch (status) {
      case "active":
        return "M20,10 Q40,5 60,10 T80,20 Q85,40 80,60 T60,80 Q40,85 20,80 T10,60 Q5,40 10,20 T20,10"
      case "critical":
        return "M30,15 Q50,10 70,20 L75,40 Q70,60 50,70 L30,65 Q15,50 20,30 Z"
      case "restored":
        return "M25,20 Q45,10 65,20 Q75,35 70,55 Q60,70 40,75 Q20,70 15,50 Q10,30 25,20"
      default:
        return "M40,30 Q50,25 60,30 Q65,40 60,50 Q50,55 40,50 Q35,40 40,30"
    }
  }

  return (
    <Link href={`/lakes/${lake.id}`} className="block h-full no-underline group">
      <div className="h-full bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/80 backdrop-blur-sm border-2 border-[#3d4354] rounded-2xl overflow-hidden hover:border-[#e05d38]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#e05d38]/10 cursor-pointer relative">
        
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border
            ${
              lake.status === "active"
                ? "bg-[#86a7c8]/20 text-[#86a7c8] border-[#86a7c8]/30"
                : lake.status === "critical"
                  ? "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30"
                  : "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30"
            }
          `}>
            {getStatusIcon(lake.status)}
            {getStatusLabel(lake.status)}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 h-full flex flex-col">
          {/* Lake Name */}
          <h3 className="text-2xl font-semibold text-[#e05d38] mb-2 transition-colors group-hover:text-[#e05d38]/80 pr-32">
            {lake.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-[#a3a3a3] mb-auto">
            <MapPin className="h-4 w-4 text-[#86a7c8]" />
            <span>{lake.district || "Unknown"} District</span>
          </div>

          {/* Bottom Section - Area and Lake Shape */}
          <div className="flex justify-between items-end mt-6">
            {/* Current Area - Bottom Left */}
            <div>
              <div className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Current Area</div>
              <div className="text-2xl font-bold text-[#86a7c8]">
                {lake.area || "N/A"}
                {lake.area && <span className="text-sm font-normal ml-1 text-[#a3a3a3]">ha</span>}
              </div>
            </div>

            {/* Lake Shape Visualization - Bottom Right */}
            <div className="relative w-20 h-16 opacity-60 group-hover:opacity-100 transition-opacity">
              <svg 
                viewBox="0 0 90 90" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path 
                  d={getLakeShapePath(lake.status)}
                  fill={getStatusColor(lake.status)}
                  opacity="0.3"
                />
                <path 
                  d={getLakeShapePath(lake.status)}
                  stroke={getStatusColor(lake.status)}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#e05d38]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
      </div>
    </Link>
  )
}