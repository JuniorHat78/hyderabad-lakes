'use client'

import { LakeOutline } from '@/components/LakeOutline'
import { DelayedLakeOutline } from '@/components/DelayedLakeOutline'

export default function DebugOutlines() {
  const testLakes = [
    { id: 'osman-sagar', name: 'Osman Sagar' },
    { id: 'durgam-cheruvu', name: 'Durgam Cheruvu' },
    { id: 'saroor-nagar-lake', name: 'Saroor Nagar Lake' },
    { id: 'shah-hatim-talab', name: 'Shah Hatim Talab' },
    { id: 'pedda-cheruvu', name: 'Pedda Cheruvu' },
    { id: 'drdo-tamhankar-lake', name: 'DRDO Tamhankar Lake' },
    { id: 'banjara-lake', name: 'Banjara Lake' },
    { id: 'shamirpet-lake', name: 'Shamirpet Lake' }, // May not exist in 1999
  ]

  return (
    <div className="p-8 bg-[#1c2433] text-[#e5e5e5] min-h-screen">
      <h1 className="text-3xl mb-8">Lake Outline Debug Page (Using 1999 Data - 432 Lakes)</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-4">Regular LakeOutline Component</h2>
        <div className="grid grid-cols-3 gap-6">
          {testLakes.map(lake => (
            <div key={`regular-${lake.id}`} className="bg-[#2a3441] p-4 rounded">
              <h3 className="text-sm mb-2">{lake.name}</h3>
              <div className="w-32 h-32 border border-gray-600">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <LakeOutline
                    lakeId={lake.id}
                    lakeName={lake.name}
                    strokeColor="#86a7c8"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-4">Delayed LakeOutline Component (No Fallback)</h2>
        <div className="grid grid-cols-3 gap-6">
          {testLakes.map(lake => (
            <div key={`delayed-${lake.id}`} className="bg-[#2a3441] p-4 rounded">
              <h3 className="text-sm mb-2">{lake.name}</h3>
              <div className="w-32 h-32 border border-gray-600">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <DelayedLakeOutline
                    lakeId={lake.id}
                    lakeName={lake.name}
                    strokeColor="#4ade80"
                    strokeWidth="1.5"
                    opacity="0.8"
                    fallbackToCircle={false}
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-4">Delayed LakeOutline Component (With Fallback)</h2>
        <div className="grid grid-cols-3 gap-6">
          {testLakes.map(lake => (
            <div key={`delayed-fallback-${lake.id}`} className="bg-[#2a3441] p-4 rounded">
              <h3 className="text-sm mb-2">{lake.name}</h3>
              <div className="w-32 h-32 border border-gray-600">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <DelayedLakeOutline
                    lakeId={lake.id}
                    lakeName={lake.name}
                    strokeColor="#f97316"
                    strokeWidth="1.5"
                    opacity="0.8"
                    fallbackToCircle={true}
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        <p>🟦 Blue: Regular LakeOutline (shows loading circle, then outline or fallback circle)</p>
        <p>🟢 Green: Delayed LakeOutline without fallback (shows nothing until loaded, then outline or nothing)</p>
        <p>🟠 Orange: Delayed LakeOutline with fallback (shows nothing until loaded, then outline or fallback circle)</p>
        <p className="mt-2">Check the browser console for detailed loading logs.</p>
      </div>
    </div>
  )
}