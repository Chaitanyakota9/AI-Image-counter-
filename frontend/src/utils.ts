export const resolveStaticUrl = (path: string, baseURL: string): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  
  // Clean up the path by removing problematic segments and normalizing
  let cleanPath = path
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\.\.\//g, '') // Remove all '../' segments
    .replace(/\/+/g, '/'); // Normalize multiple slashes to single
  
  if (!baseURL) {
    // dev proxy - construct a proper path
    return `/${cleanPath}`;
  }
  
  // With baseURL, construct full URL
  const normalizedBase = baseURL.replace(/\/$/, '');
  return `${normalizedBase}/${cleanPath}`;
};

export const formatPercent = (v: number) => `${(v * 100).toFixed(1)}%`;
export const round3 = (v: number) => (Math.round(v * 1000) / 1000).toFixed(3);