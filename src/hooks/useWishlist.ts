import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useGoogleAuth } from './useGoogleAuth';
import { useGuestData } from './useGuestData';
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  name: string;
  credits: number;
  image_url?: string;
  model_file_url?: string;
  model_file_type?: 'obj' | 'gltf' | 'usdz';
  is_favorite: boolean;
  is_completed: boolean;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  external_link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WishlistPreferences {
  background_color: string;
  glassmorphism_intensity: 'low' | 'medium' | 'high';
  view_mode: 'grid' | 'list';
  item_size: 'small' | 'medium' | 'large';
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [preferences, setPreferences] = useState<WishlistPreferences>({
    background_color: 'default',
    glassmorphism_intensity: 'medium',
    view_mode: 'grid',
    item_size: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useGoogleAuth();
  const { guestData } = useGuestData();

  useEffect(() => {
    if (user) {
      loadWishlistFromDB();
      loadPreferences();
    } else {
      loadWishlistFromLocal();
    }
    
    // Add default fruits if no items exist
    if (wishlistItems.length === 0) {
      addDefaultFruits();
    }
  }, [user]);

  const loadWishlistFromDB = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems((data || []).map(item => ({
        ...item,
        model_file_type: (item.model_file_type as 'obj' | 'gltf' | 'usdz') || undefined,
        priority: (item.priority as 'low' | 'medium' | 'high') || 'medium',
        is_favorite: item.is_favorite || false,
        is_completed: item.is_completed || false
      })));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error("Erro ao carregar wishlist");
      loadWishlistFromLocal();
    } finally {
      setIsLoading(false);
    }
  };

  const loadWishlistFromLocal = () => {
    const storageKey = user ? `wishlist_${user.id}` : `wishlist_guest_${guestData.sessionId}`;
    const saved = localStorage.getItem(storageKey);
    console.log('📂 Carregando wishlist com chave:', storageKey);
    
    if (saved) {
      try {
        const localItems = JSON.parse(saved);
        const convertedItems = localItems.map((item: any) => ({
          ...item,
          image_url: item.image || item.image_url,
          model_file_url: item.objFile || item.model_file_url,
          model_file_type: (item.objFile ? 'obj' : item.model_file_type) as 'obj' | 'gltf' | 'usdz' | undefined,
          is_favorite: item.isFavorite ?? item.is_favorite ?? false,
          is_completed: item.is_completed ?? false,
          priority: (item.priority || 'medium') as 'low' | 'medium' | 'high'
        }));
        setWishlistItems(convertedItems);
      } catch {
        setWishlistItems([]);
      }
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_wishlist_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          background_color: data.background_color,
          glassmorphism_intensity: data.glassmorphism_intensity as 'low' | 'medium' | 'high',
          view_mode: data.view_mode as 'grid' | 'list',
          item_size: data.item_size as 'small' | 'medium' | 'large'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveWishlistToLocal = (items: WishlistItem[]) => {
    const storageKey = user ? `wishlist_${user.id}` : `wishlist_guest_${guestData.sessionId}`;
    localStorage.setItem(storageKey, JSON.stringify(items));
    console.log('💾 Wishlist salva com chave:', storageKey);
  };

  const addDefaultFruits = () => {
    const defaultFruits: Omit<WishlistItem, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: "🍎 Maçã Premium",
        credits: 150,
        image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop",
        description: "Desbloqueie 3 slots de upload de imagem para sua vitrine premium",
        priority: 'high',
        is_favorite: true,
        is_completed: false
      },
      {
        name: "🍌 Banana Gold",
        credits: 200,
        image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop",
        description: "Ative o plano Premium por 30 dias com recursos exclusivos",
        priority: 'high',
        is_favorite: false,
        is_completed: false
      },
      {
        name: "🍊 Laranja Blur",
        credits: 100,
        image_url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&h=300&fit=crop",
        description: "Desbloqueie a funcionalidade de desfocar mídia na vitrine",
        priority: 'medium',
        is_favorite: false,
        is_completed: false
      },
      {
        name: "🍇 Uva Luxo",
        credits: 300,
        image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=300&fit=crop",
        description: "Acesso completo aos painéis secretos exclusivos",
        priority: 'high',
        is_favorite: true,
        is_completed: false
      },
      {
        name: "🍓 Morango Timer",
        credits: 120,
        image_url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&h=300&fit=crop",
        description: "Configure timers personalizados para suas mídias",
        priority: 'medium',
        is_favorite: false,
        is_completed: false
      },
      {
        name: "🥭 Manga Chat",
        credits: 180,
        image_url: "https://images.unsplash.com/photo-1605027990121-cbae9ff08040?w=400&h=300&fit=crop",
        description: "Desbloqueie o chat premium com recursos avançados",
        priority: 'medium',
        is_favorite: false,
        is_completed: false
      },
      {
        name: "🍑 Cereja VIP",
        credits: 250,
        image_url: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400&h=300&fit=crop",
        description: "Acesse a área VIP com conteúdo exclusivo e sem anúncios",
        priority: 'high',
        is_favorite: true,
        is_completed: false
      },
      {
        name: "🥝 Kiwi Analytics",
        credits: 90,
        image_url: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&h=300&fit=crop",
        description: "Visualize estatísticas detalhadas de engajamento",
        priority: 'low',
        is_favorite: false,
        is_completed: false
      },
      {
        name: "🍍 Abacaxi Social",
        credits: 140,
        image_url: "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=400&h=300&fit=crop",
        description: "Integração avançada com redes sociais e auto-posting",
        priority: 'medium',
        is_favorite: false,
        is_completed: false
      },
      {
        name: "🥥 Coco Backup",
        credits: 80,
        image_url: "https://images.unsplash.com/photo-1623045005806-916e69062583?w=400&h=300&fit=crop",
        description: "Backup automático de todas suas mídias na nuvem",
        priority: 'low',
        is_favorite: false,
        is_completed: false
      }
    ];

    // Check if we already have default fruits (avoid duplicates)
    const hasDefaultFruits = wishlistItems.some(item => 
      defaultFruits.some(fruit => fruit.name === item.name)
    );
    
    if (!hasDefaultFruits) {
      defaultFruits.forEach(fruit => {
        const newItem = {
          ...fruit,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setWishlistItems(prev => [...prev, newItem]);
      });
      
      if (!user) {
        const storageKey = `wishlist_guest_${guestData.sessionId}`;
        const currentItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const allItems = [...currentItems, ...defaultFruits.map(fruit => ({
          ...fruit,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))];
        localStorage.setItem(storageKey, JSON.stringify(allItems));
      }
    }
  };

  const addWishlistItem = async (item: Omit<WishlistItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('wishlist_items')
          .insert([{ ...newItem, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        
        setWishlistItems(prev => [{ 
          ...data, 
          model_file_type: (data.model_file_type as 'obj' | 'gltf' | 'usdz') || undefined,
          priority: (data.priority as 'low' | 'medium' | 'high') || 'medium',
          is_favorite: data.is_favorite || false,
          is_completed: data.is_completed || false
        }, ...prev]);
        toast.success("Item adicionado à wishlist!");
      } catch (error) {
        console.error('Error adding item:', error);
        toast.error("Erro ao adicionar item");
        // Fallback to local storage
        const newItems = [newItem, ...wishlistItems];
        setWishlistItems(newItems);
        saveWishlistToLocal(newItems);
      }
    } else {
      const newItems = [newItem, ...wishlistItems];
      setWishlistItems(newItems);
      saveWishlistToLocal(newItems);
      toast.success("Item adicionado à wishlist!");
    }
  };

  const removeWishlistItem = async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setWishlistItems(prev => prev.filter(item => item.id !== id));
        toast.success("Item removido da wishlist!");
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error("Erro ao remover item");
      }
    } else {
      const newItems = wishlistItems.filter(item => item.id !== id);
      setWishlistItems(newItems);
      saveWishlistToLocal(newItems);
      toast.success("Item removido da wishlist!");
    }
  };

  const toggleFavorite = async (id: string) => {
    const item = wishlistItems.find(item => item.id === id);
    if (!item) return;

    const updatedItem = { ...item, is_favorite: !item.is_favorite };

    if (user) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .update({ is_favorite: updatedItem.is_favorite })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setWishlistItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
      } catch (error) {
        console.error('Error updating favorite:', error);
        toast.error("Erro ao atualizar favorito");
      }
    } else {
      const newItems = wishlistItems.map(item =>
        item.id === id ? updatedItem : item
      );
      setWishlistItems(newItems);
      saveWishlistToLocal(newItems);
    }
  };

  const toggleCompleted = async (id: string) => {
    const item = wishlistItems.find(item => item.id === id);
    if (!item) return;

    const updatedItem = { ...item, is_completed: !item.is_completed };

    if (user) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .update({ is_completed: updatedItem.is_completed })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setWishlistItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
        
        toast.success(updatedItem.is_completed ? "✅ Desejo realizado!" : "↩️ Desejo restaurado!");
      } catch (error) {
        console.error('Error updating completed status:', error);
        toast.error("Erro ao atualizar status");
      }
    } else {
      const newItems = wishlistItems.map(item =>
        item.id === id ? updatedItem : item
      );
      setWishlistItems(newItems);
      saveWishlistToLocal(newItems);
      toast.success(updatedItem.is_completed ? "✅ Desejo realizado!" : "↩️ Desejo restaurado!");
    }
  };

  const updateWishlistItem = async (id: string, updates: Partial<WishlistItem>) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setWishlistItems(prev => prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
        ));
      } catch (error) {
        console.error('Error updating item:', error);
        toast.error("Erro ao atualizar item");
      }
    } else {
      const newItems = wishlistItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      setWishlistItems(newItems);
      saveWishlistToLocal(newItems);
    }
  };

  const updatePreferences = async (newPreferences: Partial<WishlistPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_wishlist_preferences')
          .upsert({
            user_id: user.id,
            ...updatedPreferences
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error updating preferences:', error);
        toast.error("Erro ao salvar preferências");
      }
    }
  };

  return {
    wishlistItems,
    preferences,
    isLoading,
    addWishlistItem,
    removeWishlistItem,
    toggleFavorite,
    toggleCompleted,
    updateWishlistItem,
    updatePreferences
  };
};