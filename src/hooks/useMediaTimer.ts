
import { useEffect } from 'react';
import { toast } from "sonner";

interface MediaItem {
  id: string;
  timer?: number;
  created_at: string;
  name?: string;
}

export const useMediaTimer = (
  mediaItems: MediaItem[], 
  deleteMedia: (id: string) => void
) => {
  useEffect(() => {
    const checkExpiredMedia = () => {
      const now = new Date().getTime();
      
      mediaItems.forEach(item => {
        if (item.timer && item.timer > 0) {
          const createdTime = new Date(item.created_at).getTime();
          const expirationTime = createdTime + (item.timer * 60 * 1000); // timer in minutes
          
          if (now >= expirationTime) {
            deleteMedia(item.id);
            toast.info(`⏰ "${item.name || 'Media'}" has expired and been removed!`);
          }
        }
      });
    };

    // Check every minute for expired media
    const interval = setInterval(checkExpiredMedia, 60000);
    
    // Also check immediately
    checkExpiredMedia();
    
    return () => clearInterval(interval);
  }, [mediaItems, deleteMedia]);
};
