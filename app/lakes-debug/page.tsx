"use client"

import { useState, useEffect } from "react"
import { fetchLakeData } from "@/lib/api"
import { getDataUrl } from "@/lib/config"

export default function LakesDebugPage() {
  const [status, setStatus] = useState<string>("Starting...")
  const [errors, setErrors] = useState<string[]>([])
  const [successes, setSuccesses] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const testYears = [1988, 1989, 1990, 2020, 2021]
    
    const runTest = async () => {
      setStatus("Testing CDN URLs and data loading...")
      
      // Test URL generation
      const testUrls: string[] = []
      testUrls.push(`Direct URL test: ${getDataUrl('data/lakes/lakes_1990.geojson')}`)
      testUrls.push(`Environment: ${window.location.hostname}`)
      setUrls(testUrls)
      
      // Test each year
      for (const year of testYears) {
        try {
          setStatus(`Loading year ${year}...`)
          const data = await fetchLakeData(year)
          
          if (data && data.features) {
            const msg = `✅ Year ${year}: Loaded ${data.features.length} features`
            setSuccesses(prev => [...prev, msg])
          } else {
            const msg = `⚠️ Year ${year}: No features in data`
            setErrors(prev => [...prev, msg])
          }
        } catch (error: any) {
          const msg = `❌ Year ${year}: ${error.message}`
          setErrors(prev => [...prev, msg])
        }
      }
      
      setStatus("Test complete!")
    }
    
    // Add delay to ensure client-side execution
    setTimeout(runTest, 100)
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Lakes Page Debug</h1>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0' }}>
        <h2>Status: {status}</h2>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9' }}>
        <h2>URLs Being Used:</h2>
        {urls.map((url, i) => (
          <div key={i}>{url}</div>
        ))}
      </div>
      
      {successes.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#c8e6c9' }}>
          <h2>Successes:</h2>
          {successes.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      )}
      
      {errors.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffcdd2' }}>
          <h2>Errors:</h2>
          {errors.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <p>Now check the actual <a href="/lakes">/lakes page</a></p>
        <p>Open browser console there to see [fetchLakeData] logs</p>
      </div>
    </div>
  )
}