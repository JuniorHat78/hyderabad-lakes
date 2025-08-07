'use client'

import { useEffect, useState } from 'react'
import { getDataUrl, API_CONFIG } from '@/lib/config'

export default function TestCDN() {
  const [cdnUrl, setCdnUrl] = useState('')
  const [dataStatus, setDataStatus] = useState('Checking...')
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Collect debug info
    const debug = {
      hostname: window.location.hostname,
      isLocalhost: window.location.hostname === 'localhost',
      windowDefined: typeof window !== 'undefined',
      useCdn: API_CONFIG.useCdn,
      cdnUsername: API_CONFIG.cdnGithubUsername,
      cdnRepo: API_CONFIG.cdnGithubRepo,
      cdnBranch: API_CONFIG.cdnBranch,
    }
    setDebugInfo(debug)
    
    console.log('Test page debug info:', debug)
    
    // Get the CDN URL
    const url = getDataUrl('data/lakes/hyderabad_lakes_1999.geojson')
    setCdnUrl(url)
    
    // Test fetching the data
    fetch(url)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        throw new Error(`HTTP ${res.status}`)
      })
      .then(data => {
        setDataStatus(`✅ Success! Loaded ${data.features?.length || 0} features`)
      })
      .catch(err => {
        setDataStatus(`❌ Error: ${err.message}`)
      })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>CDN Configuration Test</h1>
      
      <div style={{ marginTop: '1rem', background: '#f9f9f9', padding: '1rem', border: '1px solid #ddd' }}>
        <h2>Debug Information:</h2>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h2>Data URL being used:</h2>
        <p style={{ wordBreak: 'break-all', background: '#f0f0f0', padding: '1rem' }}>
          {cdnUrl}
        </p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h2>Data Fetch Status:</h2>
        <p>{dataStatus}</p>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#ffffcc' }}>
        <h3>Expected Behavior:</h3>
        <ul>
          <li>LOCAL: Should use <code>/data/lakes/...</code></li>
          <li>PRODUCTION: Should use <code>https://cdn.jsdelivr.net/gh/JuniorHat78/...</code></li>
        </ul>
        <h3>Check Browser Console for detailed logs!</h3>
      </div>
    </div>
  )
}