'use client'

import { useState, useEffect } from 'react'
import { loadLakeGeometries, getLakeGeometry } from '@/lib/data/lake-geometries'

export default function TestGeometry() {
  const [status, setStatus] = useState('Loading...')
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    const testGeometries = async () => {
      try {
        setStatus('Loading geometries...')
        const geometries = await loadLakeGeometries()
        setStatus(`Loaded ${geometries.size} geometries`)
        
        const testCases = [
          { id: 'hussain-sagar', name: 'Hussain Sagar' },
          { id: 'osman-sagar-gandipet', name: 'Osman Sagar (Gandipet)' },
          { id: 'durgam-cheruvu', name: 'Durgam Cheruvu (Secret Lake)' },
          { id: 'shamirpet-lake', name: 'Shamirpet Lake' },
          { id: 'fox-sagar-lake', name: 'Fox Sagar Lake' }
        ]
        
        const newResults: string[] = []
        
        for (const test of testCases) {
          const geo = await getLakeGeometry(test.id, test.name)
          newResults.push(`${test.name}: ${geo ? 'FOUND' : 'NOT FOUND'}`)
        }
        
        // Also show what keys are available
        const keys = Array.from(geometries.keys()).slice(0, 20)
        newResults.push('')
        newResults.push('Available keys:')
        keys.forEach(key => newResults.push(`- ${key}`))
        
        setResults(newResults)
      } catch (error) {
        setStatus(`Error: ${error}`)
      }
    }
    
    testGeometries()
  }, [])

  return (
    <div className="p-8 bg-[#1c2433] text-[#e5e5e5] min-h-screen">
      <h1 className="text-2xl mb-4">Geometry Test</h1>
      <p className="mb-4">Status: {status}</p>
      <div className="font-mono text-sm">
        {results.map((result, i) => (
          <div key={i} className={result.includes('NOT FOUND') ? 'text-red-500' : result.includes('FOUND') ? 'text-green-500' : ''}>
            {result}
          </div>
        ))}
      </div>
    </div>
  )
}