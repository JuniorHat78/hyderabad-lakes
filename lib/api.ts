// API helper functions
import { getDataUrl } from './config';

export async function fetchLakeData(yearOrFilename: string | number) {
  // Handle both year numbers and full filenames
  let filename: string;
  if (typeof yearOrFilename === 'string' && yearOrFilename.includes('hyderabad_lakes')) {
    filename = `${yearOrFilename}.geojson`;
  } else {
    filename = `lakes_${yearOrFilename}.geojson`;
  }
  
  const url = getDataUrl(`data/lakes/${filename}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // If it's a year, try the alternative hyderabad_lakes prefix
      if (typeof yearOrFilename === 'number' || !yearOrFilename.includes('hyderabad_lakes')) {
        console.warn(`Primary path failed for ${yearOrFilename}, trying alternative...`);
        const altFilename = `hyderabad_lakes_${yearOrFilename}.geojson`;
        const altUrl = getDataUrl(`data/lakes/${altFilename}`);
        const altResponse = await fetch(altUrl);
        if (altResponse.ok) {
          return await altResponse.json();
        }
      }
      throw new Error(`Failed to fetch lake data for ${yearOrFilename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching lake data for ${yearOrFilename}:`, error);
    throw error;
  }
}

export async function fetchDataAvailability() {
  const url = getDataUrl('data/lakes/data_availability.json');
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data availability');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data availability:', error);
    throw error;
  }
}

export async function fetchProcessingReport() {
  const url = getDataUrl('data/lakes/processing_report.json');
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch processing report');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching processing report:', error);
    throw error;
  }
}

// For API routes that need temporal data
export async function fetchTemporalData(lakeId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? `http://localhost:${process.env.NEXT_PUBLIC_API_PORT || '3001'}` 
      : 'https://juniorhat78.github.io/hyderabad-lakes-api');
      
  const url = `${baseUrl}/api/lakes/${lakeId}/temporal-data`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch temporal data for ${lakeId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching temporal data for ${lakeId}:`, error);
    throw error;
  }
}

// For water quality data
export async function fetchWaterQualityData(lakeId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? `http://localhost:${process.env.NEXT_PUBLIC_API_PORT || '3001'}` 
      : 'https://juniorhat78.github.io/hyderabad-lakes-api');
      
  const url = `${baseUrl}/api/lakes/${lakeId}/water-quality`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch water quality data for ${lakeId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching water quality data for ${lakeId}:`, error);
    throw error;
  }
}