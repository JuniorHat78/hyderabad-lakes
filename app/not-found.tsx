'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Droplets } from 'lucide-react'

export default function NotFound() {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#1c2433] text-[#e5e5e5] flex items-center justify-center">
      <div className="max-w-md mx-auto px-8 py-12 text-center">
        {/* Animated water icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2a3040] to-[#1c2433] flex items-center justify-center border border-[#3d4354]">
            <Droplets className="h-12 w-12 text-[#86a7c8] animate-pulse" />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-[#86a7c8]/20 animate-ping" />
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-6xl font-light mb-4 text-[#e05d38]">404</h1>
        <h2 className="text-2xl font-light mb-4 text-[#e5e5e5]">Page Not Found</h2>
        <p className="text-lg text-[#a3a3a3] mb-8 leading-relaxed">
          This page seems to have dried up like some of Hyderabad's lost lakes.
        </p>

        {/* Countdown */}
        <div className="bg-[#2a3040]/60 backdrop-blur-sm border border-[#3d4354]/50 rounded-xl p-4 mb-8">
          <p className="text-sm text-[#a3a3a3] mb-2">
            Redirecting to home page in
          </p>
          <div className="text-3xl font-bold text-[#86a7c8]">
            {countdown}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-[#e05d38] text-white hover:bg-[#c94f2f] border-0 py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#e05d38]/20">
              <Home className="h-4 w-4 mr-2" />
              Go Home Now
            </Button>
          </Link>
          
          <Link href="/lakes">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto bg-transparent border-[#3d4354] text-[#e5e5e5] hover:bg-[#2a3040] hover:border-[#86a7c8]/50 hover:text-[#86a7c8] py-3 px-6 rounded-xl transition-all duration-300"
            >
              <Droplets className="h-4 w-4 mr-2" />
              Explore Lakes
            </Button>
          </Link>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#86a7c8] rounded-full blur-3xl opacity-5" />
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-[#e05d38] rounded-full blur-2xl opacity-5" />
        </div>
      </div>
    </div>
  )
}