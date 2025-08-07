'use client'

import { useEffect, useState } from 'react'
import { getDataUrl, API_CONFIG } from '@/lib/config'
import { fetchLakeData } from '@/lib/api'

export default function TestCDNLakes() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [consoleLog, setConsoleLog] = useState<string[]>([])

  useEffect(() => {
    const runTests = async () => {
      const logs: string[] = []
      
      // Capture console logs
      const originalLog = console.log
      const originalError = console.error
      const originalWarn = console.warn
      
      console.log = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        logs.push(`[LOG] ${message}`)
        setConsoleLog(prev => [...prev, `[LOG] ${message}`])
        originalLog(...args)
      }
      
      console.error = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        logs.push(`[ERROR] ${message}`)
        setConsoleLog(prev => [...prev, `[ERROR] ${message}`])
        originalError(...args)
      }
      
      console.warn = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        logs.push(`[WARN] ${message}`)
        setConsoleLog(prev => [...prev, `[WARN] ${message}`])
        originalWarn(...args)
      }

      const results: any = {
        environment: {
          hostname: window.location.hostname,
          isLocalhost: window.location.hostname === 'localhost',
          useCdn: API_CONFIG.useCdn,
          cdnConfig: {
            username: API_CONFIG.cdnGithubUsername,
            repo: API_CONFIG.cdnGithubRepo,
            branch: API_CONFIG.cdnBranch,
          }
        },
        tests: []
      }

      // Test 1: Direct getDataUrl
      const test1 = {
        name: 'Direct getDataUrl() call',
        input: 'data/lakes/hyderabad_lakes_1999.geojson',
        url: '',
        success: false,
        error: '',
        responsePreview: ''
      }
      
      try {
        test1.url = getDataUrl(test1.input)
        const response = await fetch(test1.url)
        const text = await response.text()
        test1.responsePreview = text.substring(0, 200)
        test1.success = text.startsWith('{') && !text.includes('version https://git-lfs')
      } catch (err: any) {
        test1.error = err.message
      }
      results.tests.push(test1)

      // Test 2: fetchLakeData with year
      const test2 = {
        name: 'fetchLakeData(1999) - year number',
        input: 1999,
        url: 'N/A - internal',
        success: false,
        error: '',
        dataInfo: ''
      }
      
      try {
        const data = await fetchLakeData(1999)
        test2.success = true
        test2.dataInfo = `Features: ${data.features?.length || 0}, Type: ${data.type}`
      } catch (err: any) {
        test2.error = err.message
      }
      results.tests.push(test2)

      // Test 3: fetchLakeData with filename
      const test3 = {
        name: 'fetchLakeData("hyderabad_lakes_2021")',
        input: 'hyderabad_lakes_2021',
        url: 'N/A - internal',
        success: false,
        error: '',
        dataInfo: ''
      }
      
      try {
        const data = await fetchLakeData('hyderabad_lakes_2021')
        test3.success = true
        test3.dataInfo = `Features: ${data.features?.length || 0}, Type: ${data.type}`
      } catch (err: any) {
        test3.error = err.message
      }
      results.tests.push(test3)

      // Test 4: Check multiple years like /lakes page does
      const test4 = {
        name: 'Multiple year fetch (1988-1991) like /lakes',
        years: [1988, 1989, 1990, 1991],
        results: [] as any[]
      }
      
      for (const year of test4.years) {
        try {
          const data = await fetchLakeData(year)
          test4.results.push({
            year,
            success: true,
            features: data.features?.length || 0
          })
        } catch (err: any) {
          test4.results.push({
            year,
            success: false,
            error: err.message
          })
        }
      }
      results.tests.push(test4)

      setTestResults(results)
      setLoading(false)

      // Restore console methods
      console.log = originalLog
      console.error = originalError  
      console.warn = originalWarn
    }

    runTests()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>Testing CDN with Lakes Page Logic...</h1>
        <p>Running tests...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>CDN Test - Lakes Page Debug</h1>
      
      <div style={{ marginTop: '1rem', background: '#d4edda', padding: '1rem', border: '1px solid #c3e6cb' }}>
        <h2>Environment</h2>
        <pre>{JSON.stringify(testResults.environment, null, 2)}</pre>
      </div>

      {testResults.tests?.map((test: any, index: number) => (
        <div 
          key={index}
          style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            border: '1px solid',
            borderColor: test.success ? '#28a745' : '#dc3545',
            background: test.success ? '#d4edda' : '#f8d7da'
          }}
        >
          <h3>{test.name}</h3>
          <pre style={{ fontSize: '12px' }}>{JSON.stringify(test, null, 2)}</pre>
        </div>
      ))}

      <div style={{ marginTop: '1rem', background: '#fff3cd', padding: '1rem', border: '1px solid #ffc107' }}>
        <h2>Console Output</h2>
        <pre style={{ fontSize: '11px', maxHeight: '300px', overflow: 'auto' }}>
          {consoleLog.join('\n') || 'No console output captured'}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e9ecef' }}>
        <h3>Quick Links:</h3>
        <p>
          <a href="/lakes" style={{ marginRight: '1rem' }}>Go to /lakes</a>
          <a href="/test-cdn" style={{ marginRight: '1rem' }}>Original CDN test</a>
          <a href="/">Home</a>
        </p>
      </div>
    </div>
  )
}