'use client'

import { useEffect, useState } from 'react'
import { getDataUrl } from '@/lib/config'

export default function TestCDN() {
  const [cdnUrl, setCdnUrl] = useState('')
  const [dataStatus, setDataStatus] = useState('Checking...')
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Check if we're in production
    const isProd = window.location.hostname !== 'localhost'
    setIsProduction(isProd)
    
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
      
      <div style={{ marginTop: '1rem' }}>
        <h2>Environment:</h2>
        <p>{isProduction ? '🌐 PRODUCTION' : '💻 LOCAL DEVELOPMENT'}</p>
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
      </div>
    </div>
  )
}