// API Configuration for Vercel Deployment with CDN support
export const API_CONFIG = {
  // API URL with environment variable support
  baseUrl: process.env.NEXT_PUBLIC_API_URL || (
    typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://hyderabad-lakes-api.vercel.app'
  ),
  
  // Site URL for sharing
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || (
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://hyderabad-lakes.vercel.app'
  ),
  
  // CDN Configuration - CRITICAL: Update username!
  useStaticData: true,
  useCdn: true,
  cdnGithubUsername: 'JuniorHat78', // Your GitHub username
  cdnGithubRepo: 'hyderabad-lakes-data',
  cdnBranch: 'main',
};

// Helper function to get data URL with CDN support
export function getDataUrl(path: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  // Use local files in development mode
  if (isDevelopment && isLocalhost) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/${cleanPath}`;
  }
  
  // Use CDN for all data files in production
  if (API_CONFIG.useCdn && path.includes('/data/')) {
    // Extract path after /data/ to maintain directory structure
    const dataPath = path.split('/data/')[1] || path.split('data/')[1];
    const cdnBase = `https://cdn.jsdelivr.net/gh/${API_CONFIG.cdnGithubUsername}/${API_CONFIG.cdnGithubRepo}@${API_CONFIG.cdnBranch}`;
    return `${cdnBase}/data/${dataPath}`;
  }
  
  // Fallback for non-data files (images, etc.)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${cleanPath}`;
}
