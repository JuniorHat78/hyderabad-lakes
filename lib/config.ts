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
  // Debug logging
  const isServer = typeof window === 'undefined';
  const hostname = !isServer ? window.location.hostname : 'server-side';
  
  console.log('[getDataUrl] Environment:', {
    path,
    isServer,
    hostname,
    NODE_ENV: process.env.NODE_ENV,
    useCdn: API_CONFIG.useCdn,
  });
  
  // For server-side rendering or production, ALWAYS use CDN for data files
  // Only use local files when explicitly on localhost in the browser
  const shouldUseLocal = !isServer && hostname === 'localhost';
  
  console.log('[getDataUrl] shouldUseLocal:', shouldUseLocal);
  
  // Use local files only when running on localhost in browser
  if (shouldUseLocal) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const localUrl = `/${cleanPath}`;
    console.log('[getDataUrl] Returning LOCAL path:', localUrl);
    return localUrl;
  }
  
  // Use CDN for all data files in production and SSR
  if (API_CONFIG.useCdn && path.includes('/data/')) {
    // Extract path after /data/ to maintain directory structure
    const dataPath = path.split('/data/')[1] || path.split('data/')[1];
    const cdnBase = `https://cdn.jsdelivr.net/gh/${API_CONFIG.cdnGithubUsername}/${API_CONFIG.cdnGithubRepo}@${API_CONFIG.cdnBranch}`;
    const cdnUrl = `${cdnBase}/data/${dataPath}`;
    console.log('[getDataUrl] Returning CDN path:', cdnUrl);
    return cdnUrl;
  }
  
  // Fallback for non-data files (images, etc.)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const fallbackUrl = `/${cleanPath}`;
  console.log('[getDataUrl] Returning FALLBACK path:', fallbackUrl);
  return fallbackUrl;
}
