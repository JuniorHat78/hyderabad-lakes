// API Configuration
export const API_CONFIG = {
  // Hardcoded API URL for GitHub Pages deployment
  baseUrl: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://juniorhat78.github.io/hyderabad-lakes-api',
  
  // For static hosting on GitHub Pages, we can serve data directly
  useStaticData: typeof window !== 'undefined' && window.location.hostname.includes('github.io'),
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