// Utility functions for extracting app information from App Store URLs

export interface AppInfo {
  appName: string;
  appId: string;
  storeRegion: string;
}

/**
 * Extract app information from App Store URL
 * @param appStoreLink - The App Store URL
 * @returns AppInfo object with app name, ID, and store region
 */
export function extractAppInfo(appStoreLink: string): AppInfo {
  try {
    const url = new URL(appStoreLink);
    
    // Extract app ID from URL path (e.g., /id6749379870)
    const appIdMatch = url.pathname.match(/\/id(\d+)/);
    const appId = appIdMatch ? appIdMatch[1] : '';
    
    // Extract store region from URL path (e.g., /us/app/)
    const regionMatch = url.pathname.match(/\/([a-z]{2})\/app\//);
    const storeRegion = regionMatch ? regionMatch[1] : 'us';
    
    // Extract app name from URL path (e.g., /guardix-ai-virus-protection/)
    const nameMatch = url.pathname.match(/\/([^\/]+)\/id\d+/);
    let appName = nameMatch ? nameMatch[1] : 'Unknown App';
    
    // Convert kebab-case to title case
    appName = appName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      appName,
      appId,
      storeRegion
    };
  } catch (error) {
    return {
      appName: 'Unknown App',
      appId: '',
      storeRegion: 'us'
    };
  }
}
