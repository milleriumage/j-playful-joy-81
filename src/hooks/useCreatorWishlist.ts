import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useGoogleAuth } from './useGoogleAuth';
import { WishlistItem } from './useWishlist';

export const useCreatorWishlist = (creatorId?: string) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useGoogleAuth();

  useEffect(() => {
    if (!creatorId) {
      setWishlistItems([]);
      return;
    }

    // Don't load creator's wishlist if viewing your own page
    if (user && user.id === creatorId) {
      setWishlistItems([]);
      return;
    }

    loadCreatorWishlist();
  }, [creatorId, user]);

  const loadCreatorWishlist = async () => {
    if (!creatorId) return;
    
    setIsLoading(true);
    try {
      console.log(' DEBUG: Loading creator wishlist for:', creatorId);
      
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', creatorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(' DEBUG: Error loading creator wishlist:', error);
        throw error;
      }

      const formattedItems = (data || []).map(item => ({
        ...item,
        model_file_type: (item.model_file_type as 'obj' | 'gltf' | 'usdz') || undefined,
        priority: (item.priority as 'low' | 'medium' | 'high') || 'medium',
        is_favorite: item.is_favorite || false,
        is_completed: item.is_completed || false
      }));

      console.log(' DEBUG: Creator wishlist loaded:', formattedItems.length, 'items');
      setWishlistItems(formattedItems);
    } catch (error) {
      console.error('Error loading creator wishlist:', error);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    wishlistItems,
    isLoading,
    refreshWishlist: loadCreatorWishlist
  };
};
