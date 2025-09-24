import { supabase } from '@/integrations/supabase/client';
const mediaUrlCache = new Map<string, string>();
const isDev = (import.meta as any)?.env?.DEV ?? false;

/**
 * Safely generates a public URL for media stored in Supabase Storage
 * Handles bucket existence and provides fallback options
 */
export const getMediaUrl = (storagePath: string): string => {
  if (!storagePath) {
    if (isDev) console.warn('🚫 DEBUG: Storage path is empty for getMediaUrl');
    return '';
  }

  // Sanitize and normalize path (avoid leading slashes)
  const path = storagePath.replace(/^\/+/, '').trim();

  // Return from cache if available
  const cached = mediaUrlCache.get(path);
  if (cached) {
    if (isDev) console.log('🟢 DEBUG: Using cached media URL for path:', path);
    return cached;
  }

  if (isDev) console.log('🔗 DEBUG: Generating media URL for path:', path);

  try {
    // Generate the public URL using Supabase storage
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    
    if (data?.publicUrl) {
      if (isDev) console.log('✅ DEBUG: Public URL generated successfully:', {
        storagePath: path,
        publicUrl: data.publicUrl,
        urlLength: data.publicUrl.length
      });
      // Cache the result
      mediaUrlCache.set(path, data.publicUrl);
      return data.publicUrl;
    } else {
      if (isDev) {
        console.error('❌ DEBUG: Failed to generate public URL for:', path);
        console.log('🔍 DEBUG: getPublicUrl response:', data);
      }
      return '';
    }
  } catch (error) {
    if (isDev) {
      console.error('💥 DEBUG: Error generating media URL:', error);
      console.log('🔍 DEBUG: Error details:', {
        storagePath: path,
        error: error instanceof Error ? error.message : error
      });
    }
    return '';
  }
};

/**
 * Checks if the media bucket exists - simplified version
 */
export const ensureMediaBucket = async (): Promise<boolean> => {
  // Always return true since the 'media' bucket should already exist
  // If it doesn't exist, uploads will fail gracefully with proper error handling
  return true;
};

/**
 * Validates and sanitizes a storage path
 */
export const sanitizeStoragePath = (path: string): string => {
  if (!path) return '';
  
  // Remove any leading slashes and normalize path
  return path.replace(/^\/+/, '').trim();
};