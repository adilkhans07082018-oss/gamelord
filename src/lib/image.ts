/**
 * Global Edge CDN Image Optimization
 * Converts remote images to ultra-fast, lightweight WebP format (90%+ smaller size)
 * and caches them across Cloudflare's 300+ global edge locations.
 */
export function getOptimizedImageUrl(url: string | null | undefined, width = 320): string {
  if (!url) return '/placeholder.jpg';
  
  // Return local assets or data URLs directly
  if (url.startsWith('/') || url.startsWith('data:')) {
    return url;
  }
  
  // If already proxied, return as-is
  if (url.includes('wsrv.nl')) {
    return url;
  }
  
  // Clean WordPress resize suffix (e.g. -150x150.jpg) to get the original high-resolution master
  const cleanUrl = url.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');

  // Route through Cloudflare-backed Global Image CDN
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&output=webp&q=85`;
}
