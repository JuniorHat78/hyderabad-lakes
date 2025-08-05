'use client'

interface SimpleLakeIconProps {
  status: 'active' | 'critical' | 'restored' | 'lost'
  className?: string
}

export function SimpleLakeIcon({ status, className = "" }: SimpleLakeIconProps) {
  // Different patterns for different statuses
  const getPattern = () => {
    switch (status) {
      case 'active':
        return (
          <>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#86a7c8" strokeWidth="2" opacity="0.5" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="#86a7c8" strokeWidth="1.5" opacity="0.4" />
            <circle cx="50" cy="50" r="20" fill="#86a7c8" opacity="0.1" />
          </>
        )
      case 'critical':
        return (
          <>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.5" strokeDasharray="5,5" />
            <circle cx="50" cy="50" r="25" fill="#ef4444" opacity="0.1" />
          </>
        )
      case 'restored':
        return (
          <>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.5" />
            <path d="M 30 50 Q 50 40, 70 50 Q 50 60, 30 50" fill="#10b981" opacity="0.2" />
          </>
        )
      case 'lost':
        return (
          <>
            <circle cx="50" cy="50" r="35" fill="none" stroke="#6b7280" strokeWidth="1" opacity="0.3" strokeDasharray="2,3" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="#6b7280" strokeWidth="1" opacity="0.2" strokeDasharray="2,3" />
          </>
        )
    }
  }

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
      {getPattern()}
    </svg>
  )
}