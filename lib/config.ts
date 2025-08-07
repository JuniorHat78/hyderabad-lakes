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
  
  console.log('[getDataUrl] Called with:', {
    path,
    isServer,
    hostname,
    pathIncludes_data: path.includes('/data/') || path.includes('data/'),
    useCdn: API_CONFIG.useCdn,
  });
  
  // ONLY use local files when explicitly on localhost
  if (!isServer && hostname === 'localhost') {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const localUrl = `/${cleanPath}`;
    console.log('[getDataUrl] LOCAL (localhost):', localUrl);
    return localUrl;
  }
  
  // For ANY data file path, use CDN in production
  if (path.includes('data/lakes/')) {
    // Extract the filename part after lakes/
    let filename = '';
    if (path.includes('data/lakes/')) {
      filename = path.split('data/lakes/')[1];
    }
    
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${API_CONFIG.cdnGithubUsername}/${API_CONFIG.cdnGithubRepo}@${API_CONFIG.cdnBranch}/data/lakes/${filename}`;
    console.log('[getDataUrl] CDN URL:', cdnUrl);
    return cdnUrl;
  }
  
  // Fallback for non-data files (images, etc.)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const fallbackUrl = `/${cleanPath}`;
  console.log('[getDataUrl] FALLBACK (non-data file):', fallbackUrl);
  return fallbackUrl;
}
