"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Calendar, TrendingDown } from "lucide-react"

export default function MainPage() {
  const router = useRouter()

  const beginJourney = () => {
    router.push("/story")
  }

  return (
    <div className="min-h-screen bg-[#1c2433] text-[#e5e5e5] overflow-x-hidden">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative px-4 py-8">
        {/* Clean background with subtle gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a3040]/10 via-[#1c2433] to-[#1c2433]" />
        </div>

        <div className="relative z-10 text-center w-full max-w-6xl mx-auto pb-24">
          {/* Cleaner top section */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xs sm:text-sm font-medium text-[#86a7c8] uppercase tracking-[0.15em] mb-2">
                Environmental Documentation
              </h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#86a7c8] to-transparent mx-auto"></div>
            </div>

            {/* Main title with better hierarchy */}
            <h1 className="font-light leading-tight mb-4 sm:mb-6">
              <span className="block text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#e05d38] mb-2 sm:mb-3">
                The Vanishing Lakes
              </span>
              <span className="block text-xl md:text-3xl lg:text-4xl font-light text-[#e5e5e5] tracking-wide">
                of Hyderabad
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#a3a3a3] max-w-2xl mx-auto leading-relaxed px-4">
              An interactive journey through time, documenting the transformation of a city's relationship with water
            </p>
          </div>

          {/* Statistics preview with better spacing */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="bg-[#2a3040]/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[#3d4354]/40 hover:border-[#86a7c8]/30 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#86a7c8] mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-[#86a7c8]">50+</span>
                </div>
                <p className="text-xs sm:text-sm text-[#a3a3a3] uppercase tracking-wider">Years of Data</p>
              </div>

              <div className="bg-[#2a3040]/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[#3d4354]/40 hover:border-[#e05d38]/30 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#e05d38] mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-[#e05d38]">61%</span>
                </div>
                <p className="text-xs sm:text-sm text-[#a3a3a3] uppercase tracking-wider">Area Lost</p>
              </div>

              <div className="bg-[#2a3040]/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[#3d4354]/40 hover:border-[#ef4444]/30 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#ef4444] mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-[#ef4444]">2,750+</span>
                </div>
                <p className="text-xs sm:text-sm text-[#a3a3a3] uppercase tracking-wider">Lakes Lost</p>
              </div>
            </div>
          </div>

          {/* CTA section */}
          <div className="mb-8 sm:mb-12">
            <Button
              onClick={beginJourney}
              size="lg"
              className="group relative bg-[#e05d38] hover:bg-[#c94f2f] text-white border-0 transition-all duration-300 text-sm sm:text-base md:text-lg px-6 sm:px-10 md:px-14 py-4 sm:py-6 md:py-8 tracking-[0.1em] uppercase font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-[#e05d38]/20 mb-6 sm:mb-8"
            >
              <span className="mr-2 sm:mr-3">Begin the Journey</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Navigation options */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Button
                onClick={() => router.push("/timeline")}
                variant="outline"
                className="bg-transparent border-[#3d4354] text-[#a3a3a3] hover:bg-[#2a3040] hover:border-[#86a7c8] hover:text-[#86a7c8] transition-all px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm tracking-wider"
              >
                Timeline
              </Button>
              <Button
                onClick={() => router.push("/lakes")}
                variant="outline"
                className="bg-transparent border-[#3d4354] text-[#a3a3a3] hover:bg-[#2a3040] hover:border-[#86a7c8] hover:text-[#86a7c8] transition-all px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm tracking-wider"
              >
                Explore Lakes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer section - at bottom as static content */}
      <div className="bg-[#2a3040]/60 backdrop-blur-sm border-t border-[#3d4354]/40 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto text-center px-4">
          <p className="text-xs sm:text-sm text-[#a3a3a3] mb-1 sm:mb-2">
            An interactive exploration of environmental change in urban India
          </p>
          <p className="text-xs sm:text-sm text-[#a3a3a3] mb-2 sm:mb-3">
            Created by <span className="text-[#e05d38] font-semibold">Farhat</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-6 text-xs text-[#a3a3a3]">
            <span>Interactive Timeline</span>
            <span className="hidden sm:inline">•</span>
            <span>Data Visualization</span>
            <span className="hidden sm:inline">•</span>
            <span>Environmental Documentation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
