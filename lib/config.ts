// API Configuration for Vercel Deployment
export const API_CONFIG = {
  // API URL with environment variable support
  baseUrl: process.env.NEXT_PUBLIC_API_URL || (
    typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://hyderabad-lakes-api.vercel.app'  // Update this with your actual API URL
  ),
  
  // Site URL for sharing
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || (
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://hyderabad-lakes.vercel.app'  // Update this with your actual site URL
  ),
  
  // For Vercel deployment with API
  useStaticData: false,
};

// Helper function to get data URL
export function getDataUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If running locally in development, use the local public folder
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `/${cleanPath}`;
  }
  
  // If using static data (GitHub Pages), use relative path
  if (API_CONFIG.useStaticData) {
    return `/${cleanPath}`;
  }
  
  // Otherwise use API endpoint
  return `${API_CONFIG.baseUrl}/${cleanPath}`;
}