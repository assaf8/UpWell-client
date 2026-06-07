const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

/**
 * Returns a fully-qualified URL for a media asset.
 * - Cloudinary / any absolute URL → returned as-is
 * - Local dev relative path (e.g. "/uploads/images/foo.jpg") → prepended with BASE
 * - null / undefined → null
 */
export const getMediaUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${BASE}${url}`
}
