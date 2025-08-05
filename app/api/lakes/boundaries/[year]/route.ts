import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const { year } = await params
    
    // Validate year
    const yearNum = parseInt(year)
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > 2024) {
      return NextResponse.json(
        { error: 'Invalid year. Must be between 1990 and 2024.' },
        { status: 400 }
      )
    }

    // Path to the lake boundary data
    const dataPath = path.join(
      process.cwd(),
      '..',
      'lake-data',
      '06_processed_temporal_boundaries',
      'yearly_boundaries',
      `lakes_${year}.geojson`
    )

    // Check if file exists
    try {
      await fs.access(dataPath)
    } catch {
      // Try alternative path (from existing processed data)
      const altPath = path.join(
        process.cwd(),
        '..',
        'hyderabad-lakes',
        'data',
        'processed',
        'yearly_extracts',
        `hyderabad_lakes_${year}.geojson`
      )
      
      try {
        const data = await fs.readFile(altPath, 'utf-8')
        return NextResponse.json(JSON.parse(data))
      } catch {
        return NextResponse.json(
          { error: `No data available for year ${year}` },
          { status: 404 }
        )
      }
    }

    // Read and return the GeoJSON data
    const data = await fs.readFile(dataPath, 'utf-8')
    return NextResponse.json(JSON.parse(data))

  } catch (error) {
    console.error('Error loading lake boundaries:', error)
    return NextResponse.json(
      { error: 'Failed to load lake boundaries' },
      { status: 500 }
    )
  }
}