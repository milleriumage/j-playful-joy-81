import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Video, Edit, Eye, EyeOff, DollarSign, Link2, Timer, Trash2, Crown, RotateCcw, ImageIcon, ChevronDown, ChevronUp, ChevronRight, Heart, Share2, MousePointer, Pin, PlayCircle, Shuffle, Gift, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { MediaTimerDialog } from "./MediaTimerDialog";
import { QuickAutoDeleteDialog } from "./QuickAutoDeleteDialog";
import { LinkConfigDialog } from "./LinkConfigDialog";
import { SocialMediaIcons } from "./SocialMediaIcons";
import { useTemplateData } from "@/hooks/useTemplateData";
import { useUserSlots } from "@/hooks/useUserSlots";
import { VitrineConfigDialog } from "./VitrineConfigDialog";
import { PriceConfigDialog } from "./PriceConfigDialog";
import { CreditPurchaseButton } from "./CreditPurchaseButton";
import { useMediaTimers } from "@/hooks/useMediaTimers";
import { useAutoDeleteTimer } from "@/hooks/useAutoDeleteTimer";
import { useCreatorSocialIcons } from "@/hooks/useCreatorSocialIcons";
import { useNotifications } from "@/hooks/useNotifications";
import { MinimizedMessageDialog } from "./MinimizedMessageDialog";
import { useMediaInteractions } from "@/hooks/useMediaInteractions";
import { useToast } from "@/hooks/use-toast";
import { getMediaUrl } from "@/lib/mediaUtils";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useCreatorPermissions } from "@/hooks/useCreatorPermissions";
import { supabase } from "@/integrations/supabase/client";
import { GetCreditsNotification } from "./GetCreditsNotification";
import { GiftViewDialog } from "./GiftViewDialog";
import { useWishlist } from "@/hooks/useWishlist";
import { useCreatorWishlist } from "@/hooks/useCreatorWishlist";
import { useUserCredits } from "@/hooks/useUserCredits";
import { WishlistItem } from "@/hooks/useWishlist";
import { ChatOverlayButton } from "./ChatOverlayButton";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useFollowers } from "@/hooks/useFollowers";
import { useGuestData } from "@/hooks/useGuestData";
import { FollowersCounter } from "./FollowersCounter";
import { FollowButton } from "./FollowButton";
import { FollowersDialog } from "./FollowersDialog";
import { FollowingDialog } from "./FollowingDialog";
import { PremiumPlansManager } from "./PremiumPlansManager";
import { useMediaLikes } from "@/hooks/useMediaLikes";
import { MediaLikesLoader } from "./MediaLikesLoader";
import { MediaLikesCount } from "./MediaLikesCount";
import { useTotalLikes } from "@/hooks/useTotalLikes";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { EnhancedChat } from "./EnhancedChat";
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  storage_path: string;
  name?: string;
  description?: string;
  price?: string;
  link?: string;
  linkButtonConfig?: {
    showButton: boolean;
    buttonText?: string;
  };
  priceConfig?: {
    text: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    isTransparent: boolean;
    hasBlinkAnimation: boolean;
    movementType: 'none' | 'horizontal' | 'vertical';
  };
  timer?: number;
  is_locked: boolean;
  is_blurred: boolean;
  is_main: boolean;
  pinned?: boolean;
  hover_unblur?: boolean;
}
interface MediaShowcaseProps {
  mediaItems: MediaItem[];
  onUploadImage?: (file: File) => void;
  onUploadVideo?: (file: File) => void;
  onReplaceMedia?: (id: string, file: File) => void;
  onUpdateMedia: (id: string, updates: any) => void;
  onDeleteMedia?: (id: string) => void;
  onSetAsMain?: (id: string) => void;
  onEditMedia?: (item: MediaItem) => void;
  onSetPrice?: (id: string) => void;
  onSetLink?: (id: string) => void;
  passwordProtected: boolean;
  onPasswordVerify: (action: string, callback: () => void) => void;
  credits: number;
  onAddCredits: (amount: number) => void;
  creatorId?: string;
  onSubtractCredits: (amount: number, action?: string) => Promise<boolean>;
  onSlideshowConfigChange?: (config: {
    slideshowMode: boolean;
    slideshowInterval: number;
    currentSlideIndex: number;
    mediaItems: MediaItem[];
  }) => void;
  visibilitySettings?: {
    showUploadButtons?: boolean;
    showEditIcons?: boolean;
    showMediaActions?: boolean;
    showVitrine?: boolean;
    showMediaInteractionStats?: boolean;
    showVitrineBackgroundEdit?: boolean;
  };
  messages?: any[];
  onSendMessage?: (username: string, message: string, color: string, speech?: string) => void;
  onTogglePurchasedContent?: (isMinimized: boolean) => void;
}
export const MediaShowcase = React.memo(({
  mediaItems,
  onUploadImage,
  onUploadVideo,
  onReplaceMedia,
  onUpdateMedia,
  onDeleteMedia,
  onSetAsMain,
  onEditMedia,
  onSetPrice,
  onSetLink,
  passwordProtected,
  onPasswordVerify,
  credits,
  onAddCredits,
  onSubtractCredits,
  onSlideshowConfigChange,
  visibilitySettings,
  creatorId,
  messages,
  onSendMessage,
  onTogglePurchasedContent
}: MediaShowcaseProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [showAutoDeleteDialog, setShowAutoDeleteDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [replacingMediaId, setReplacingMediaId] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showShareDropdown, setShowShareDropdown] = useState<string | null>(null);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalShares, setTotalShares] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMinimizedMessageDialog, setShowMinimizedMessageDialog] = useState(false);
  const [isLoadingNextCreator, setIsLoadingNextCreator] = useState(false);
  const [showVitrineConfigDialog, setShowVitrineConfigDialog] = useState(false);
  const [showSlotConfirmDialog, setShowSlotConfirmDialog] = useState(false);
  const [showGiftGallery, setShowGiftGallery] = useState(false);
  const [purchasedContentMinimized, setPurchasedContentMinimized] = useState(false);
  const [slotConfirmData, setSlotConfirmData] = useState<{
    type: 'image' | 'video';
    cost: number;
  } | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [hoveredItems, setHoveredItems] = useState<Set<string>>(new Set());
  const [minimizedMessageConfig, setMinimizedMessageConfig] = useState({
    text: "Vitrine minimizada - clique no botÃ£o Ë„ para expandir",
    textColor: "#6b7280",
    backgroundColor: "transparent",
    fontSize: 14,
    fontFamily: "Inter"
  });
  const [showGetCreditsNotification, setShowGetCreditsNotification] = useState(false);
  const [vitrineConfig, setVitrineConfig] = useState({
    backgroundColor: "transparent",
    hasGlassEffect: false,
    slideshowMode: false,
    slideshowInterval: 3
  });
  const [vitrineSlideMode, setVitrineSlideMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const {
    slots: activeSlots,
    canUpload,
    purchaseSlot,
    getTotalSlots
  } = useUserSlots();
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());
  const {
    settings: visibilitySettingsFromHook,
    updateSettings: updateVisibilitySettings
  } = useVisibilitySettings(creatorId);
  const {
    isCreator,
    canEdit
  } = useCreatorPermissions(creatorId);
  // Use creator's wishlist if viewing another creator's page, otherwise use own wishlist
  const {
    wishlistItems: ownWishlistItems
  } = useWishlist();
  const {
    wishlistItems: creatorWishlistItems
  } = useCreatorWishlist(creatorId);
  const wishlistItems = creatorId ? creatorWishlistItems : ownWishlistItems;
  const navigate = useNavigate();
  const {
    t
  } = useLanguage();
  const {
    guestData
  } = useGuestData();
  const {
    isFollowing,
    followersCount,
    followingCount,
    followers,
    following,
    isLoading,
    toggleFollow,
    loadFollowers,
    loadFollowing
  } = useFollowers(creatorId);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  const mediaLikesTotal = useTotalLikes(mediaItems);
  const {
    user
  } = useOptimizedAuth();
  const isLoggedIn = !!user;
  const {
    timers,
    addTimer,
    removeTimer,
    resetTimer,
    getTimer,
    formatTime
  } = useMediaTimers(mediaId => {
    onDeleteMedia(mediaId);
    removeTimer(mediaId);
  });
  const {
    startAutoDeleteTimer,
    cancelAutoDeleteTimer,
    isTimerActive: isAutoDeleteActive,
    getTimeRemaining
  } = useAutoDeleteTimer(mediaId => {
    onDeleteMedia(mediaId);
  });
  const {
    socialNetworks,
    updateSocialNetwork,
    addSocialNetwork,
    deleteSocialNetwork
  } = useCreatorSocialIcons(creatorId);
  const {
    createNotification
  } = useNotifications();
  const {
    recordInteraction,
    loadMediaStats,
    getMediaStats
  } = useMediaInteractions();
  const {
    toast
  } = useToast();

  // Load pinned items from database
  useEffect(() => {
    const pinnedIds = mediaItems.filter(item => item.pinned).map(item => item.id);
    setPinnedItems(new Set(pinnedIds));
  }, [mediaItems]);

  // Load stats for all media items on mount
  useEffect(() => {
    mediaItems.forEach(item => {
      loadMediaStats(item.id);
    });
  }, [mediaItems]);

  // Register view interaction when media is displayed
  useEffect(() => {
    mediaItems.forEach(item => {
      recordInteraction(item.id, 'view');
    });
  }, [mediaItems]);

  // Sort media items with pinned items first
  const sortedMediaItems = React.useMemo(() => {
    return [...mediaItems].sort((a, b) => {
      const aIsPinned = pinnedItems.has(a.id);
      const bIsPinned = pinnedItems.has(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });
  }, [mediaItems, pinnedItems]);

  // Slideshow logic for main screen
  useEffect(() => {
    if (!vitrineConfig.slideshowMode || sortedMediaItems.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentSlideIndex(prevIndex => (prevIndex + 1) % sortedMediaItems.length);
    }, vitrineConfig.slideshowInterval * 1000);
    return () => clearInterval(interval);
  }, [vitrineConfig.slideshowMode, vitrineConfig.slideshowInterval, sortedMediaItems.length]);

  // Vitrine slide logic - when activated, images cycle through main screen
  useEffect(() => {
    if (!vitrineSlideMode || sortedMediaItems.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentSlideIndex(prevIndex => (prevIndex + 1) % sortedMediaItems.length);
    }, 3000); // 3 seconds interval for vitrine slide
    return () => clearInterval(interval);
  }, [vitrineSlideMode, sortedMediaItems.length]);

  // Ensure vitrine media appears on main screen when activated
  useEffect(() => {
    if (vitrineSlideMode && onSlideshowConfigChange) {
      onSlideshowConfigChange({
        slideshowMode: true,
        slideshowInterval: 3,
        currentSlideIndex: currentSlideIndex,
        mediaItems: sortedMediaItems
      });
    } else if (!vitrineSlideMode && onSlideshowConfigChange) {
      onSlideshowConfigChange({
        slideshowMode: false,
        slideshowInterval: 3,
        currentSlideIndex: 0,
        mediaItems: []
      });
    }
  }, [vitrineSlideMode, currentSlideIndex, sortedMediaItems, onSlideshowConfigChange]);

  // Notify parent component when slideshow config changes
  useEffect(() => {
    if (onSlideshowConfigChange) {
      onSlideshowConfigChange({
        slideshowMode: vitrineConfig.slideshowMode,
        slideshowInterval: vitrineConfig.slideshowInterval,
        currentSlideIndex: currentSlideIndex,
        mediaItems: sortedMediaItems
      });
    }
  }, [vitrineConfig.slideshowMode, vitrineConfig.slideshowInterval, currentSlideIndex, sortedMediaItems, onSlideshowConfigChange]);
  const handleImageUpload = () => {
    // Verificar slots disponÃ­veis usando o hook
    const currentImageCount = mediaItems.filter(item => item.type === 'image').length;
    if (!canUpload('image', currentImageCount)) {
      createNotification('slot_needed', 'ðŸš« Slot insuficiente!', 'Compre +1 slot premium para fazer upload de imagem', null);
      toast({
        title: "Slot insuficiente!",
        description: "VocÃª pode comprar um slot premium por 50 crÃ©ditos!",
        variant: "destructive"
      });

      // Abrir dialog de confirmaÃ§Ã£o de compra
      setSlotConfirmData({
        type: 'image',
        cost: 50
      });
      setShowSlotConfirmDialog(true);
      return;
    }
    if (passwordProtected) {
      onPasswordVerify("upload-image", () => imageInputRef.current?.click());
    } else {
      imageInputRef.current?.click();
    }
  };
  const handleVideoUpload = () => {
    // Verificar slots disponÃ­veis usando o hook
    const currentVideoCount = mediaItems.filter(item => item.type === 'video').length;
    if (!canUpload('video', currentVideoCount)) {
      createNotification('slot_needed', 'ðŸ’° VocÃª tem crÃ©ditos!', 'Compre 1 slot de vÃ­deo por 80 crÃ©ditos', null);
      toast({
        title: "VocÃª tem crÃ©ditos!",
        description: "Compre 1 slot de vÃ­deo por 80 crÃ©ditos!",
        variant: "destructive"
      });

      // Abrir dialog de confirmaÃ§Ã£o de compra
      setSlotConfirmData({
        type: 'video',
        cost: 80
      });
      setShowSlotConfirmDialog(true);
      return;
    }
    if (passwordProtected) {
      onPasswordVerify("upload-video", () => videoInputRef.current?.click());
    } else {
      videoInputRef.current?.click();
    }
  };
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadImage(file);
      toast({
        title: "Imagem enviada!",
        description: "ðŸ“¤ Sua imagem foi enviada com sucesso."
      });
    }
  };
  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadVideo(file);
      toast({
        title: "VÃ­deo enviado!",
        description: "ðŸŽ¥ Seu vÃ­deo foi enviado com sucesso."
      });
    }
  };
  const handleReplaceMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && replacingMediaId) {
      onReplaceMedia(replacingMediaId, file);
      toast({
        title: "MÃ­dia substituÃ­da!",
        description: `${file.type.startsWith('image/') ? 'ðŸ“¸' : 'ðŸŽ¥'} MÃ­dia substituÃ­da com sucesso!`
      });
      setReplacingMediaId(null);
    }
  };
  const executeWithPassword = (action: string, callback: () => void) => {
    if (passwordProtected && !isUnlocked) {
      onPasswordVerify(action, () => {
        setIsUnlocked(true);
        callback();
      });
    } else {
      callback();
    }
  };
  const toggleBlur = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`toggle-blur-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de aplicar o efeito
      const success = await onSubtractCredits(10, "Aplicar/remover desfoque na mídia"); // Reduzindo de 20 para 10
      if (success) {
        onUpdateMedia(item.id, {
          is_blurred: !item.is_blurred
        });
        toast({
          title: item.is_blurred ? "Desfoque removido!" : "Desfoque aplicado!",
          description: item.is_blurred ? "ðŸ‘ï¸ Sua mÃ­dia agora estÃ¡ visÃ­vel. (-20 crÃ©ditos)" : "ðŸ«¥ Sua mÃ­dia foi borrada. (-20 crÃ©ditos)"
        });
        setActiveDropdown(null);
      }
    });
  };
  const toggleHoverUnblur = async (item: MediaItem) => {
    if (!item.is_blurred) {
      toast({
        title: "AÃ§Ã£o indisponÃ­vel",
        description: "Esta opÃ§Ã£o sÃ³ funciona quando a mÃ­dia estÃ¡ desfocada.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`toggle-hover-unblur-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de aplicar o efeito
      const success = await onSubtractCredits(5, "Configurar hover desfoque na mídia"); // Reduzindo de 20 para 5
      if (success) {
        onUpdateMedia(item.id, {
          hover_unblur: !item.hover_unblur
        });
        toast({
          title: item.hover_unblur ? "Clique desfoque desativado!" : "Clique desfoque ativado!",
          description: item.hover_unblur ? "ðŸ‘† Hover nÃ£o remove mais o desfoque. (-20 crÃ©ditos)" : "ðŸ‘† Hover agora remove o desfoque temporariamente. (-20 crÃ©ditos)"
        });
        setActiveDropdown(null);
      }
    });
  };
  const handleSetPrice = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`set-price-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de abrir o diÃ¡logo
      const success = await onSubtractCredits(20, "Definir preÃ§o da mÃ­dia");
      if (success) {
        setSelectedMediaId(item.id);
        setShowPriceDialog(true);
        setActiveDropdown(null);
        toast({
          title: "Ferramenta desbloqueada!",
          description: "ðŸ’Ž VocÃª pode agora definir o preÃ§o desta mÃ­dia. (-20 crÃ©ditos)"
        });
      }
    });
  };
  const handleSetLink = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`set-link-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de abrir o diÃ¡logo
      const success = await onSubtractCredits(20, "Definir link da mÃ­dia");
      if (success) {
        setSelectedMediaId(item.id);
        setShowLinkDialog(true);
        setActiveDropdown(null);
        toast({
          title: "Ferramenta desbloqueada!",
          description: "ðŸ’Ž VocÃª pode agora definir o link desta mÃ­dia. (-20 crÃ©ditos)"
        });
      }
    });
  };
  const handleEditMedia = (item: MediaItem) => {
    executeWithPassword(`edit-media-${item.id}`, () => {
      onEditMedia(item);
      setActiveDropdown(null);
    });
  };
  const handleSetTimer = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`set-timer-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de abrir o diÃ¡logo
      const success = await onSubtractCredits(20, "Configurar timer da mÃ­dia");
      if (success) {
        setSelectedMediaId(item.id);
        setShowTimerDialog(true);
        setActiveDropdown(null);
        toast({
          title: "Ferramenta desbloqueada!",
          description: "ðŸ’Ž VocÃª pode agora configurar timer desta mÃ­dia. (-20 crÃ©ditos)"
        });
      }
    });
  };
  const handleSetAutoDelete = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`auto-delete-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de abrir o diÃ¡logo
      const success = await onSubtractCredits(20, "Configurar auto-delete da mÃ­dia");
      if (success) {
        setSelectedMediaId(item.id);
        setShowAutoDeleteDialog(true);
        setActiveDropdown(null);
        toast({
          title: "Ferramenta desbloqueada!",
          description: "ðŸ’Ž VocÃª pode agora configurar auto-delete. (-20 crÃ©ditos)"
        });
      }
    });
  };
  const handleVitrineSlideToggle = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`vitrine-slide-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de ativar
      const success = await onSubtractCredits(0, "Ativar/desativar slide vitrine");
      if (success) {
        setVitrineSlideMode(prev => {
          const newMode = !prev;
          if (newMode && sortedMediaItems.length > 0) {
            setCurrentSlideIndex(0); // Start from first item
          }
          return newMode;
        });
        setActiveDropdown(null);
        toast({
          title: !vitrineSlideMode ? "Slide Vitrine Ativado!" : "Slide Vitrine Desativado!",
          description: !vitrineSlideMode ? "As imagens da vitrine passarÃ£o automaticamente na tela principal a cada 3 segundos. (-20 crÃ©ditos)" : "Slide da vitrine foi pausado. (-20 crÃ©ditos)"
        });
      }
    });
  };
  const handleReplaceMediaClick = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`replace-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de permitir troca
      const success = await onSubtractCredits(20, "Trocar mÃ­dia");
      if (success) {
        setReplacingMediaId(item.id);
        replaceInputRef.current?.click();
        setActiveDropdown(null);
        toast({
          title: "Ferramenta desbloqueada!",
          description: "ðŸ’Ž VocÃª pode agora trocar esta mÃ­dia. (-20 crÃ©ditos)"
        });
      }
    });
  };
  const handleDelete = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`delete-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de deletar
      const success = await onSubtractCredits(20, "Deletar mÃ­dia");
      if (success) {
        onDeleteMedia(item.id);
        removeTimer(item.id);
        toast({
          title: "MÃ­dia deletada!",
          description: "ðŸ—‘ï¸ Sua mÃ­dia foi removida com sucesso. (-20 crÃ©ditos)"
        });
        setActiveDropdown(null);
      }
    });
  };
  const handleSetAsMain = async (item: MediaItem) => {
    // Verificar se tem crÃ©ditos suficientes
    if (credits < 0) {
      setShowGetCreditsNotification(true);
      return;
    }
    executeWithPassword(`set-main-${item.id}`, async () => {
      // Descontar crÃ©ditos antes de aplicar
      const success = await onSubtractCredits(20, "Definir mÃ­dia como principal");
      if (success) {
        onSetAsMain(item.id);
        toast({
          title: "Definida como principal!",
          description: "â­ Esta mÃ­dia Ã© agora a principal. (-20 crÃ©ditos)"
        });
        setActiveDropdown(null);
      }
    });
  };
  const handleTogglePinInVitrine = (item: MediaItem) => {
    executeWithPassword(`toggle-pin-${item.id}`, () => {
      const isPinned = pinnedItems.has(item.id);
      const newPinnedState = !isPinned;

      // Update in database
      onUpdateMedia(item.id, {
        pinned: newPinnedState
      });

      // Update local state
      const newPinnedItems = new Set(pinnedItems);
      if (newPinnedState) {
        newPinnedItems.add(item.id);
      } else {
        newPinnedItems.delete(item.id);
      }
      setPinnedItems(newPinnedItems);
      toast({
        title: isPinned ? "Desafixada da vitrine!" : "Fixada na vitrine!",
        description: isPinned ? "ðŸ“Œ MÃ­dia desafixada da vitrine." : "ðŸ“Œ MÃ­dia fixada da vitrine."
      });
      setActiveDropdown(null);
    });
  };
  const handleMediaClick = async (item: MediaItem) => {
    // If vitrine slide mode is active, set this item as the current slide instead of opening fullscreen
    if (vitrineSlideMode) {
      const itemIndex = sortedMediaItems.findIndex(media => media.id === item.id);
      if (itemIndex !== -1) {
        setCurrentSlideIndex(itemIndex);
        // Record click interaction
        await recordInteraction(item.id, 'click');
        toast({
          title: "Imagem Selecionada",
          description: "Esta imagem agora estÃ¡ sendo exibida na tela principal"
        });
      }
      return;
    }
    if (item.link && !item.is_locked) {
      // Record click interaction
      await recordInteraction(item.id, 'click');
      window.open(item.link, '_blank');
    }
  };
  const handleTimerSave = (config: any) => {
    if (selectedMediaId) {
      addTimer({
        id: selectedMediaId,
        ...config
      });
    }
  };
  const handleLinkSave = (config: any) => {
    if (selectedMediaId) {
      onUpdateMedia(selectedMediaId, {
        link: config.url
      });
    }
  };
  const handlePriceSave = (config: any) => {
    if (selectedMediaId) {
      onUpdateMedia(selectedMediaId, {
        priceConfig: config
      });
    }
  };
  const toggleLike = async (itemId: string) => {
    const newLikedItems = new Set(likedItems);
    const isLiking = !newLikedItems.has(itemId);
    if (isLiking) {
      // Record like interaction in database
      await recordInteraction(itemId, 'like');
      newLikedItems.add(itemId);
      const newTotalLikes = totalLikes + 1;
      setTotalLikes(newTotalLikes);

      // Create notification for the like
      const mediaItem = mediaItems.find(item => item.id === itemId);
      const mediaType = mediaItem?.type === 'image' ? 'imagem' : 'vÃ­deo';
      await createNotification('like', 'â¤ï¸ Nova curtida!', `AlguÃ©m curtiu sua ${mediaType}`, null);

      // Check if user earned credits from likes (every 10 likes = 1 credit)
      if (newTotalLikes % 10 === 0) {
        onAddCredits(1);
        await createNotification('credit_earned', 'ðŸŽ‰ CrÃ©dito ganho!', 'VocÃª ganhou 1 crÃ©dito por receber 10 curtidas!', 1);
        toast({
          title: "CrÃ©dito ganho!",
          description: "ðŸŽ‰ VocÃª ganhou 1 crÃ©dito por 10 curtidas!"
        });
      } else {
        const likesNeeded = 10 - newTotalLikes % 10;
        await createNotification('progress', 'ðŸ“ˆ Progresso de curtidas', `Receba mais ${likesNeeded} curtida${likesNeeded > 1 ? 's' : ''} para ter 1 crÃ©dito creditado na sua conta`, null);
      }
      toast({
        title: "Curtida adicionada!",
        description: "â¤ï¸ Obrigado pelo seu apoio!"
      });
    } else {
      newLikedItems.delete(itemId);
      setTotalLikes(Math.max(0, totalLikes - 1));
      toast({
        title: "Curtida removida!",
        description: "ðŸ’” A curtida foi desfeita."
      });
    }
    setLikedItems(newLikedItems);
  };

  // Handle gift item functionality
  const handleGiftItem = async (item: WishlistItem) => {
    try {
      const currentCredits = Number(credits);
      const itemCredits = Number(item.credits);
      console.log(`[GIFT DEBUG] Verificando créditos - Atual: ${currentCredits} (${typeof currentCredits}), Necessário: ${itemCredits} (${typeof itemCredits})`);

      // Check if user has enough credits with explicit number conversion
      if (currentCredits < itemCredits) {
        const missingCredits = itemCredits - currentCredits;
        console.log(`[GIFT DEBUG] Créditos insuficientes - Faltam: ${missingCredits}`);
        toast({
          title: 'Créditos insuficientes',
          description: `Você precisa de ${missingCredits} créditos a mais`,
          variant: 'destructive'
        });
        return;
      }
      console.log(`[GIFT DEBUG] Créditos suficientes, processando presente...`);

      // Deduct credits
      const success = await onSubtractCredits(itemCredits, `Presente: ${item.name}`);
      if (!success) {
        console.log(`[GIFT DEBUG] Falha ao deduzir créditos`);
        toast({
          title: 'Erro ao processar presente',
          description: 'Não foi possível deduzir os créditos',
          variant: 'destructive'
        });
        return;
      }

      // Create gift notification for the creator
      await createNotification('gift', '🎁 Novo presente!', `${item.name} foi presenteado para você!`, itemCredits);
      toast({
        title: 'Presente enviado!',
        description: `${item.name} foi presenteado com sucesso!`
      });
    } catch (error) {
      console.error('Error sending gift:', error);
      toast({
        title: 'Erro ao enviar presente',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    }
  };
  const handleShare = async (platform: string, item: MediaItem) => {
    // Record share interaction in database
    await recordInteraction(item.id, 'share');
    const shareUrl = window.location.origin;
    const shareText = `Confira esta ${item.type === 'image' ? 'imagem' : 'vÃ­deo'}!`;

    // Increment shares counter
    const newTotalShares = totalShares + 1;
    setTotalShares(newTotalShares);

    // Share notification without credit rewards
    await createNotification('share', 'ðŸ“¤ Compartilhamento realizado!', `${item.type === 'image' ? 'Imagem' : 'VÃ­deo'} compartilhado com sucesso!`, null);

    // Enhanced sharing URLs with better platform support
    const shareUrls: Record<string, (url: string) => string> = {
      facebook: url => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: url => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      twitter: url => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      bluesky: url => `https://bsky.app/intent/post?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      threads: url => `https://threads.net/intent/post?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      tiktok: url => url,
      // copy to clipboard
      instagram: url => url,
      // copy to clipboard  
      onlyfans: url => url // copy to clipboard
    };

    // Platforms that only support copying to clipboard
    const copyPlatforms = ['tiktok', 'instagram', 'onlyfans'];
    if (copyPlatforms.includes(platform)) {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Link copiado!",
          description: `Cole o link para compartilhar no ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`
        });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        toast({
          title: "Erro ao copiar",
          description: "NÃ£o foi possÃ­vel copiar o link.",
          variant: "destructive"
        });
      }
    } else if (shareUrls[platform]) {
      // Direct sharing platforms
      const url = shareUrls[platform](shareUrl);
      window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
    setShowShareDropdown(null);
  };
  const handleNextCreator = async () => {
    setIsLoadingNextCreator(true);
    try {
      // Buscar todos os criadores com perfis pÃºblicos (que tÃªm mÃ­dias ou dados configurados)
      const {
        data: creators,
        error
      } = await supabase.from('profiles').select('user_id, display_name').neq('user_id', creatorId || 'none') // Excluir o criador atual
      .limit(50); // Limitar para performance

      if (error) {
        console.error('Erro ao buscar criadores:', error);
        toast({
          title: "âŒ Erro ao buscar prÃ³ximo criador",
          variant: "destructive"
        });
        return;
      }
      if (!creators || creators.length === 0) {
        toast({
          title: "ðŸ” Nenhum outro criador encontrado"
        });
        return;
      }

      // Selecionar um criador aleatÃ³rio
      const randomCreator = creators[Math.floor(Math.random() * creators.length)];

      // Navegar para a pÃ¡gina do criador
      navigate(`/user/${randomCreator.user_id}`);
      toast({
        title: `ðŸ”€ Navegando para ${randomCreator.display_name || 'criador'}!`
      });
    } catch (error) {
      console.error('Erro ao buscar prÃ³ximo criador:', error);
      toast({
        title: "âŒ Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoadingNextCreator(false);
    }
  };
  return <div className="space-y-4">
      {/* Social Media Icons */}
      <div className="flex items-center justify-between">
        <SocialMediaIcons socialNetworks={socialNetworks} onUpdateSocial={updateSocialNetwork} onAddSocial={addSocialNetwork} onDeleteSocial={deleteSocialNetwork} passwordProtected={passwordProtected} onPasswordVerify={onPasswordVerify} creatorId={creatorId} />
        
        {/* Center - Statistics */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-8">
            {/* Seguindo - apenas para o prÃ³prio criador */}
            {isCreator && <div className="flex flex-col items-center cursor-pointer" onClick={async () => {
            setFollowingDialogOpen(true);
            setTimeout(async () => {
              await loadFollowing();
            }, 100);
          }}>
                <span className="text-lg font-bold text-foreground">{followingCount}</span>
                <span className="text-sm text-muted-foreground">Seguindo</span>
              </div>}
            
            {/* Seguidores - sempre visÃ­vel */}
            <div className="flex flex-col items-center cursor-pointer" onClick={async () => {
            setDialogOpen(true);
            await loadFollowers();
          }}>
              <span className="text-lg font-bold text-foreground">{followersCount}</span>
              <span className="text-sm text-muted-foreground">Seguidores</span>
            </div>
            
            {/* Curtidas - sempre visÃ­vel */}
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-foreground">{mediaLikesTotal}</span>
              <span className="text-sm text-muted-foreground">Curtidas</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Next Creator Button - Left side of gift icon */}
          <Button onClick={handleNextCreator} disabled={isLoadingNextCreator} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl" title="PrÃ³ximo Criador">
            <Shuffle className="w-4 h-4 text-blue-600" />
          </Button>
          
          {/* Chat Overlay Button */}
          
          
          {/* Vitrine Toggle Button */}
          
          
          {/* Gallery Button - Right side of social media icons */}
          {visibilitySettingsFromHook?.showGalleryButton && <Button onClick={() => setShowGiftGallery(true)} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl" title="Galeria">
            <Gift className="w-4 h-4 text-emerald-600" />
          </Button>}
          
          {/* Minimize Purchased Content Button */}
          <Button onClick={() => {
          const newMinimizedState = !purchasedContentMinimized;
          setPurchasedContentMinimized(newMinimizedState);
          onTogglePurchasedContent?.(newMinimizedState);
        }} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl" title={purchasedContentMinimized ? "Mostrar Conteúdo Comprado" : "Ocultar Conteúdo Comprado"}>
            {purchasedContentMinimized ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
          </Button>
        </div>
      </div>

      {/* Media Showcase - Only show if showVitrine is enabled and chat overlay is closed */}
      {(visibilitySettings?.showVitrine ?? visibilitySettingsFromHook.showVitrine) && !showChatOverlay && <Card className={`p-4 relative bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl ${vitrineConfig.hasGlassEffect ? 'backdrop-blur-md border-white/20' : ''}`} style={{
      backgroundColor: vitrineConfig.backgroundColor === "transparent" ? "transparent" : vitrineConfig.backgroundColor
    }}>
        <div className="flex justify-between items-center mb-4">
          {/* Center - Follow & Subscribe Buttons - para todos */}
          <div className="flex-1 flex items-center justify-center gap-3">
            <FollowButton isFollowing={isFollowing} onToggleFollow={toggleFollow} isLoading={false} />
            <Button onClick={() => setShowPremiumDialog(true)} size="sm" variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium">
              Assinar ConteÃºdo
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1 text-xs animate-pulse">
                    {t('mediaShowcase.getVipSlots')}
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-sm border border-white/20 pointer-events-auto" style={{
              zIndex: 9999
            }}>
                 <DropdownMenuItem onClick={() => {
                setSlotConfirmData({
                  type: 'image',
                  cost: 50
                });
                setConfirmInput('');
                setShowSlotConfirmDialog(true);
              }} className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-green-100">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                   <div className="flex flex-col">
                     <span className="font-medium text-green-700">{t('mediaShowcase.getImageSlot')}</span>
                     <span className="text-xs text-green-600">50 crÃ©ditos - Desbloqueio imediato</span>
                   </div>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => {
                setSlotConfirmData({
                  type: 'video',
                  cost: 80
                });
                setConfirmInput('');
                setShowSlotConfirmDialog(true);
              }} className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-purple-100">
                  <Video className="w-4 h-4 text-purple-600" />
                   <div className="flex flex-col">
                     <span className="font-medium text-purple-700">{t('mediaShowcase.getVideoSlot')}</span>
                     <span className="text-xs text-purple-600">80 crÃ©ditos - Desbloqueio imediato</span>
                   </div>
                </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>}
             
           </div>
          
           {/* Fixed Upload Buttons - Right side */}
          <div className="flex items-center gap-2">
            {/* Upload buttons - only show if upload props are provided AND showUploadButtons is true AND user is creator */}
             {visibilitySettings?.showUploadButtons && onUploadImage && canEdit && <Button onClick={handleImageUpload} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl" title={t('mediaShowcase.uploadPhoto')}>
                 <Upload className="w-4 h-4 text-primary" />
               </Button>}
              
            {visibilitySettings?.showUploadButtons && onUploadVideo && canEdit && <Button onClick={handleVideoUpload} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl" title="Upload VÃ­deo">
                <Video className="w-4 h-4 text-accent" />
              </Button>}
            
            {/* Configure Vitrine Button - only show if onEditMedia is provided AND showMediaActions is true AND showVitrineBackgroundEdit is true AND user is creator */}
            {visibilitySettings?.showMediaActions && visibilitySettings?.showVitrineBackgroundEdit && onEditMedia && canEdit && <Button onClick={() => {
            if (passwordProtected) {
              onPasswordVerify("configure-vitrine", () => {
                setShowVitrineConfigDialog(true);
              });
            } else {
              setShowVitrineConfigDialog(true);
            }
          }} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-secondary/30 to-muted/30 hover:from-secondary/40 hover:to-muted/40 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl" title="Configurar vitrine">
                <Edit className="w-4 h-4 text-foreground" />
              </Button>}
            
            {/* Next Creator Button */}
            
            
            {/* Chat Overlay Button */}
            
            
            {/* Main Chat Toggle Button */}
            
            
            {/* Minimize/Expand Button */}
            <Button onClick={() => setIsMinimized(!isMinimized)} size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-accent/20 to-destructive/20 hover:from-accent/30 hover:to-destructive/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl" title={isMinimized ? "Expandir vitrine" : "Minimizar vitrine"}>
              {isMinimized ? <ChevronUp className="w-5 h-5 text-accent" /> : <ChevronDown className="w-5 h-5 text-accent" />}
            </Button>
          </div>
        </div>

        {/* Media Content - Only show when not minimized and has items */}
        {!isMinimized && sortedMediaItems.length > 0 && <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {sortedMediaItems.map(item => {
            const timer = getTimer(item.id);
            return <div key={item.id} className={`relative flex-shrink-0 w-48 group ${item.id === sortedMediaItems[0]?.id ? 'sticky left-0 z-10 bg-background/80 backdrop-blur-sm' : ''}`}>
                    <div className={`relative ${isUnlocked && passwordProtected ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
                      {item.type === 'image' ? <img src={getMediaUrl(item.storage_path)} alt={item.name || "Media"} className={`w-full h-32 object-cover rounded-lg cursor-pointer transition-all duration-300 ${item.is_blurred && (!item.hover_unblur || !hoveredItems.has(item.id)) ? 'blur-md' : ''}`} title={item.description || ""} onClick={() => handleMediaClick(item)} onMouseEnter={() => {
                  if (item.hover_unblur && item.is_blurred) {
                    setHoveredItems(prev => new Set(prev).add(item.id));
                  }
                }} onMouseLeave={() => {
                  if (item.hover_unblur && item.is_blurred) {
                    setHoveredItems(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(item.id);
                      return newSet;
                    });
                  }
                }} /> : <video src={getMediaUrl(item.storage_path)} className={`w-full h-32 object-cover rounded-lg cursor-pointer transition-all duration-300 ${item.is_blurred && (!item.hover_unblur || !hoveredItems.has(item.id)) ? 'blur-md' : ''}`} title={item.description || ""} onClick={() => handleMediaClick(item)} onMouseEnter={() => {
                  if (item.hover_unblur && item.is_blurred) {
                    setHoveredItems(prev => new Set(prev).add(item.id));
                  }
                }} onMouseLeave={() => {
                  if (item.hover_unblur && item.is_blurred) {
                    setHoveredItems(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(item.id);
                      return newSet;
                    });
                  }
                }} muted />}
                       
                        {/* Like button - Top left */}
                        <div className="absolute top-2 left-2 z-10">
                          <Button onClick={() => toggleLike(item.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 rounded-full" title="Curtir">
                            <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                          </Button>
                         </div>

                        {/* Share button - Top right */}
                        <div className="absolute top-2 right-2 z-10">
                          <DropdownMenu open={showShareDropdown === item.id} onOpenChange={open => setShowShareDropdown(open ? item.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 rounded-full" title="Compartilhar">
                                <Share2 className="w-4 h-4 text-white" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-card/95 backdrop-blur-md border border-border/50 pointer-events-auto rounded-xl shadow-xl" style={{
                      zIndex: 9999
                    }}>
                              <DropdownMenuItem onClick={() => handleShare('whatsapp', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.388" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">WhatsApp</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleShare('facebook', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">Facebook</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleShare('twitter', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">X (Twitter)</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleShare('instagram', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 via-red-500 to-yellow-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">Instagram</span>
                                <span className="text-xs text-muted-foreground ml-auto">Copiar</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleShare('tiktok', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">TikTok</span>
                                <span className="text-xs text-muted-foreground ml-auto">Copiar</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleShare('bluesky', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 2.105.139 3.107.139 5.883.902 6.885c.659.862 1.664 1.184 4.301-.677C7.921 4.936 9.75 2.827 12 10.8c2.25-7.973 4.079-5.864 6.797-4.592 2.637 1.861 3.642 1.539 4.301.677.763-1.002.763-3.778 0-4.78C22.439 1.266 21.434.944 18.798 2.805 16.046 4.747 13.087 8.686 12 10.8Z" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">Bluesky</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleShare('threads', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.181 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 11.978c.027 3.064.718 5.474 2.057 7.142 1.43 1.781 3.631 2.695 6.54 2.717 4.406-.031 7.201-2.055 8.305-6.015l2.04.569c-.652 2.337-1.833 4.177-3.51 5.467C17.24 23.275 14.943 23.98 12.197 24h-.011z" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">Threads</span>
                                <span className="text-xs text-muted-foreground ml-auto">Copiar</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => handleShare('onlyfans', item)} className="flex items-center gap-3 p-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169-.244-.414-.463-.73-.657-.316-.193-.7-.362-1.15-.506-.45-.144-.964-.27-1.543-.378-.579-.108-1.223-.162-1.933-.162-.71 0-1.354.054-1.933.162-.579.108-1.093.234-1.543.378-.45.144-.834.313-1.15.506-.316.194-.561.413-.73.657-.169.244-.253.52-.253.827 0 .307.084.583.253.827.169.244.414.463.73.657.316.193.7.362 1.15.506.45.144.964.27 1.543.378.579.108 1.223.162 1.933.162.71 0 1.354-.054 1.933-.162.579-.108 1.093-.234 1.543-.378.45-.144.834-.313 1.15-.506.316-.194.561-.413.73-.657.169-.244.253-.52.253-.827 0-.307-.084-.583-.253-.827z" />
                                  </svg>
                                </div>
                                <span className="text-foreground font-medium">OnlyFans</span>
                                <span className="text-xs text-muted-foreground ml-auto">Copiar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      
                      {/* Timer Background Effect */}
                      {timer && timer.isActive && <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded-lg pointer-events-none" />}
                      
                      {/* Timer Display - Top center */}
                      {timer && timer.isActive && <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 z-10 ${timer.remainingSeconds <= 10 ? 'animate-pulse' : ''}`}>
                          <div className={`font-bold px-3 py-2 rounded-lg text-lg ${timer.remainingSeconds <= 10 ? 'bg-red-500/90 text-white shadow-lg' : 'bg-black/70 text-white'}`}>
                            â° {formatTime(timer.remainingSeconds)}
                          </div>
                        </div>}

                      {/* Auto-Delete Timer Display - Top right */}
                      {isAutoDeleteActive(item.id) && <div className="absolute top-2 right-2 z-10">
                          <div className="bg-red-600/90 text-white font-bold px-2 py-1 rounded-lg text-sm animate-pulse border border-red-400">
                            ðŸ”¥ Auto-Delete: {getTimeRemaining(item.id) ? Math.ceil(getTimeRemaining(item.id)! / 60) : 0}min
                          </div>
                        </div>}

                      {/* Price overlay - Show only in vitrine, not when media is main */}
                      {item.price && !item.is_main && <div className={`absolute left-1/2 transform -translate-x-1/2 overflow-hidden ${timer && timer.isActive ? 'top-16' : 'top-1/2 translate-y-2'}`}>
                          {(() => {
                    try {
                      // Try to parse price as JSON for priceConfig, fallback to simple text
                      const priceConfig = typeof item.price === 'string' && item.price.startsWith('{') ? JSON.parse(item.price) : null;
                      if (priceConfig) {
                        return <div className={`
                                      font-bold px-2 py-1 rounded
                                      ${priceConfig.hasBlinkAnimation ? 'animate-pulse' : ''}
                                      ${priceConfig.movementType === 'horizontal' ? 'animate-slide-right-to-left' : ''}
                                      ${priceConfig.movementType === 'vertical' ? 'animate-slide-bottom-to-top' : ''}
                                    `} style={{
                          fontFamily: priceConfig.fontFamily,
                          fontSize: `${priceConfig.fontSize}px`,
                          color: priceConfig.textColor,
                          backgroundColor: priceConfig.isTransparent ? 'transparent' : priceConfig.backgroundColor
                        }}>
                                      {item.is_blurred ? 'ðŸ”’ ' : ''}{priceConfig.text || ''}
                                  </div>;
                      } else {
                        // Fallback for simple text price
                        return <div className="bg-black/70 text-white font-bold px-2 py-1 rounded text-sm">
                                    {item.is_blurred ? 'ðŸ”’ ' : ''}{item.price}
                                  </div>;
                      }
                    } catch (e) {
                      // Fallback for invalid JSON
                      return <div className="bg-black/70 text-white font-bold px-2 py-1 rounded text-sm">
                                  {item.is_blurred ? 'ðŸ”’ ' : ''}{item.price}
                                </div>;
                    }
                  })()}
                         </div>}

                       {/* Credit Purchase Button - Center bottom */}
                       {item.price && (() => {
                  try {
                    const priceConfig = typeof item.price === 'string' && item.price.startsWith('{') ? JSON.parse(item.price) : null;
                    if (priceConfig?.enableCreditPurchase) {
                      return <CreditPurchaseButton 
                        mediaId={item.id} 
                        creatorId={creatorId} 
                        mediaTitle={item.name || "este conteúdo"} 
                        priceConfig={priceConfig}
                        isUnlocked={!item.is_locked && !item.is_blurred}
                        onPurchaseSuccess={() => {
                          // Desbloquear mídia e remover blur
                          onUpdateMedia(item.id, {
                            is_locked: false,
                            is_blurred: false
                          });

                          // Cancelar timer de auto-delete temporariamente
                          cancelAutoDeleteTimer(item.id);

                          // Usar evento customizado ao invés de reload
                          window.dispatchEvent(new CustomEvent('media-purchase-success', {
                            detail: {
                              mediaId: item.id
                            }
                          }));
                        }} />;
                    }
                  } catch (e) {
                    console.error('Error parsing price config for credit purchase:', e);
                  }
                  return null;
                })()}

                       {/* Stats indicators - Bottom left */}
                      <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                        {/* Main indicator */}
                        {item.is_main && <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                            â­ Principal
                          </div>}
                        
                        {/* Pinned in vitrine indicator */}
                        {pinnedItems.has(item.id) && <div className="text-purple-500">
                             ðŸ“Œ
                           </div>}
                        
                         
                         {/* Stats row */}
                         {(visibilitySettings?.showMediaInteractionStats ?? visibilitySettingsFromHook.showMediaInteractionStats) && <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                             <div className="flex items-center gap-0.5">
                               <Eye className="w-3 h-3" />
                               <span>{getMediaStats(item.id).views_count}</span>
                             </div>
               <div className="flex items-center gap-0.5">
                 <Heart className="w-3 h-3" />
                 <MediaLikesCount mediaId={item.id} />
               </div>
                             <div className="flex items-center gap-0.5">
                               <Share2 className="w-3 h-3" />
                               <span>{getMediaStats(item.id).shares_count}</span>
                             </div>
                             <div className="flex items-center gap-0.5">
                               <MousePointer className="w-3 h-3" />
                               <span>{getMediaStats(item.id).clicks_count}</span>
                             </div>
                           </div>}
                      </div>

                      {/* Pin button - Top right, only show if showEditIcons is true AND user is creator */}
                      {visibilitySettings?.showEditIcons && onEditMedia && canEdit && <div className="absolute top-2 right-2 z-10">
                          <Button onClick={() => handleTogglePinInVitrine(item)} size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 rounded-full border border-white/20 transition-all duration-300 hover:scale-110" title={pinnedItems.has(item.id) ? "Desfixar da Vitrine" : "Fixar na Vitrine"}>
                            <Pin className={`w-4 h-4 ${pinnedItems.has(item.id) ? 'text-purple-400' : 'text-white'}`} />
                          </Button>
                        </div>}

                      {/* Edit button - Bottom right - only show if any edit functions are provided AND showEditIcons is true AND user is creator */}
                      {visibilitySettings?.showEditIcons && (onDeleteMedia || onEditMedia || onSetPrice || onSetLink || onSetAsMain || onReplaceMedia) && canEdit && <div className="absolute bottom-2 right-2">
                          <DropdownMenu open={activeDropdown === item.id} onOpenChange={open => setActiveDropdown(open ? item.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 border border-white/20 transition-all duration-300 hover:scale-110" title="Editar">
                                <Edit className="w-3 h-3 text-white" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-52 bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-2 pointer-events-auto" style={{
                      zIndex: 9999
                    }}>
                                
                                {/* Vitrine Slide Toggle Option */}

                                {onEditMedia && <DropdownMenuItem onClick={() => handleSetAutoDelete(item)}>
                                    <Timer className="w-4 h-4 mr-2" />
                                    {t('mediaShowcase.autoDeleteTimer')}
                                  </DropdownMenuItem>}

                              {onEditMedia && isAutoDeleteActive(item.id) && <DropdownMenuItem onClick={() => {
                        cancelAutoDeleteTimer(item.id);
                        setActiveDropdown(null);
                      }}>
                                  <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                                  {t('mediaShowcase.cancelAutoDelete')}
                                </DropdownMenuItem>}

                                {onReplaceMedia && <DropdownMenuItem onClick={() => handleReplaceMediaClick(item)}>
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {t('mediaShowcase.replaceImage')}
                                  </DropdownMenuItem>}
                               
                                {onEditMedia && <DropdownMenuItem onClick={() => toggleBlur(item)}>
                                    {item.is_blurred ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                                    {item.is_blurred ? t('mediaShowcase.removeBlur') : t('mediaShowcase.applyBlur')}
                                  </DropdownMenuItem>}
                               
                                {onEditMedia && <DropdownMenuItem onClick={() => toggleHoverUnblur(item)} className={!item.is_blurred ? "opacity-50 cursor-not-allowed" : ""}>
                                    <MousePointer className="w-4 h-4 mr-2" />
                                    {item.hover_unblur ? t('mediaShowcase.disableClickUnblur') : t('mediaShowcase.enableClickUnblur')}
                                  </DropdownMenuItem>}
                              
                               {onSetPrice && <DropdownMenuItem onClick={() => handleSetPrice(item)}>
                                   <DollarSign className="w-4 h-4 mr-2" />
                                   {t('mediaShowcase.setPrice')}
                                 </DropdownMenuItem>}
                              
                               {onSetLink && <DropdownMenuItem onClick={() => handleSetLink(item)}>
                                   <Link2 className="w-4 h-4 mr-2" />
                                   {t('mediaShowcase.setLink')}
                                 </DropdownMenuItem>}
                              
                                {onSetAsMain && <DropdownMenuItem onClick={() => handleSetAsMain(item)}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    {t('mediaShowcase.mainScreen')}
                                  </DropdownMenuItem>}
                               
                                {onEditMedia && <DropdownMenuItem onClick={async () => {
                        // Verificar se tem crÃ©ditos suficientes
                        if (credits < 0) {
                          setShowGetCreditsNotification(true);
                          return;
                        }

                        // Descontar crÃ©ditos antes de abrir configuraÃ§Ã£o
                        const success = await onSubtractCredits(0, "Configurar slideshow da vitrine");
                        if (success) {
                          if (passwordProtected) {
                            onPasswordVerify("configure-vitrine", () => {
                              setShowVitrineConfigDialog(true);
                            });
                          } else {
                            setShowVitrineConfigDialog(true);
                          }
                          toast({
                            title: "Ferramenta desbloqueada!",
                            description: "ðŸ’Ž VocÃª pode agora configurar slideshow. (-20 crÃ©ditos)"
                          });
                        }
                      }}>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    {t('mediaShowcase.configureSlideshow')}
                                  </DropdownMenuItem>}
                               
                                {timer && onEditMedia && <DropdownMenuItem onClick={async () => {
                        // Verificar se tem crÃ©ditos suficientes
                        if (credits < 0) {
                          setShowGetCreditsNotification(true);
                          return;
                        }

                        // Descontar crÃ©ditos antes de resetar
                        const success = await onSubtractCredits(20, "Resetar timer da mÃ­dia");
                        if (success) {
                          resetTimer(item.id);
                          setActiveDropdown(null);
                          toast({
                            title: "Timer resetado!",
                            description: "ðŸ”„ Timer da mÃ­dia foi resetado. (-20 crÃ©ditos)"
                          });
                        }
                      }}>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    {t('mediaShowcase.resetTimer')}
                                  </DropdownMenuItem>}
                               
                                {onDeleteMedia && <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                     {t('mediaShowcase.delete')}
                                  </DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>}
                    </div>
                    
                  </div>;
          })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>}

        {/* Empty state or minimized message */}
        {sortedMediaItems.length === 0 && !isMinimized && <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Nenhuma mÃ­dia adicionada ainda</p>
            <p className="text-sm">Use os botÃµes acima para adicionar fotos e vÃ­deos</p>
          </div>}
        
        {isMinimized && <div className="flex items-center justify-center gap-2 py-2">
            <div className="text-center" style={{
          color: minimizedMessageConfig.textColor,
          backgroundColor: minimizedMessageConfig.backgroundColor,
          fontSize: `${minimizedMessageConfig.fontSize}px`,
          fontFamily: minimizedMessageConfig.fontFamily,
          padding: minimizedMessageConfig.backgroundColor !== "transparent" ? "8px 12px" : "8px 0",
          borderRadius: minimizedMessageConfig.backgroundColor !== "transparent" ? "6px" : "0"
        }}>
              {minimizedMessageConfig.text}
            </div>
            {visibilitySettingsFromHook.showVitrineTextEdit && canEdit && <Button onClick={() => {
          if (passwordProtected) {
            onPasswordVerify("edit-minimized-message", () => {
              setShowMinimizedMessageDialog(true);
            });
          } else {
            setShowMinimizedMessageDialog(true);
          }
        }} size="sm" variant="outline" className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-md flex-shrink-0" title="Personalizar mensagem">
                <Edit className="w-3 h-3" />
              </Button>}
          </div>}
        
        {/* Slot indicator - Bottom right corner */}
        {visibilitySettingsFromHook.showActiveSlotsIndicator && <div className="absolute bottom-1 right-1 z-20">
            <div className="bg-green-500/90 text-white px-1.5 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm">
              {getTotalSlots()} slots
            </div>
          </div>}
      </Card>}

    {/* Chat Overlay - Show when showChatOverlay is true */}
      {showChatOverlay && <Card className="p-4 bg-card border">
          <EnhancedChat messages={messages || []} onSendMessage={onSendMessage || (() => {})} onEditMessage={(message: any) => {
        // Mesma funcionalidade do chat principal - apenas criadores podem editar
        toast({
          title: "🔒 Apenas criadores podem editar mensagens!",
          variant: "destructive"
        });
      }} passwordProtected={false} onPasswordVerify={() => {}} creatorId={creatorId} visibilitySettings={{
        showChatEditing: true,
        showChatCloseIcon: true
      }} />
        </Card>}

      {/* Dialogs */}
      <MediaTimerDialog isOpen={showTimerDialog} onClose={() => {
      setShowTimerDialog(false);
      setSelectedMediaId(null);
    }} onSetTimer={handleTimerSave} onResetTimer={() => {
      if (selectedMediaId) {
        resetTimer(selectedMediaId);
      }
    }} mediaId={selectedMediaId || ""} currentTimer={selectedMediaId ? getTimer(selectedMediaId) : undefined} />

      <QuickAutoDeleteDialog isOpen={showAutoDeleteDialog} onClose={() => {
      setShowAutoDeleteDialog(false);
      setSelectedMediaId(null);
    }} onStartTimer={minutes => {
      if (selectedMediaId) {
        startAutoDeleteTimer(selectedMediaId, minutes);
      }
    }} mediaName={selectedMediaId ? mediaItems.find(m => m.id === selectedMediaId)?.name : undefined} />

      <LinkConfigDialog isOpen={showLinkDialog} onClose={() => {
      setShowLinkDialog(false);
      setSelectedMediaId(null);
    }} onSave={handleLinkSave} currentLink={selectedMediaId ? mediaItems.find(m => m.id === selectedMediaId)?.link : undefined} />

      <PriceConfigDialog isOpen={showPriceDialog} onClose={() => {
      setShowPriceDialog(false);
      setSelectedMediaId(null);
    }} onSave={handlePriceSave} currentConfig={(() => {
      if (!selectedMediaId) return undefined;
      const item = mediaItems.find(m => m.id === selectedMediaId);
      if (!item?.price) return undefined;
      try {
        return typeof item.price === 'string' && item.price.startsWith('{') ? JSON.parse(item.price) : undefined;
      } catch {
        return undefined;
      }
    })()} />

      <MinimizedMessageDialog isOpen={showMinimizedMessageDialog} onClose={() => setShowMinimizedMessageDialog(false)} onSave={setMinimizedMessageConfig} currentConfig={minimizedMessageConfig} />

      <VitrineConfigDialog isOpen={showVitrineConfigDialog} onClose={() => setShowVitrineConfigDialog(false)} onSave={setVitrineConfig} currentConfig={vitrineConfig} />

      

      {/* Slot Confirmation Dialog */}
      <Dialog open={showSlotConfirmDialog} onOpenChange={setShowSlotConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Compra de Slot VIP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deseja descontar {slotConfirmData?.cost} crÃ©ditos para desbloquear +1 slot VIP para upload de {slotConfirmData?.type === 'image' ? 'imagem' : 'vÃ­deo'}? 
              Esta aÃ§Ã£o nÃ£o pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => {
              setShowSlotConfirmDialog(false);
              setSlotConfirmData(null);
            }} className="flex-1">
                NÃ£o
              </Button>
              <Button onClick={async () => {
              if (slotConfirmData) {
                console.log(`[SLOT PURCHASE] Iniciando compra de slot ${slotConfirmData.type} por ${slotConfirmData.cost} crÃ©ditos`);
                console.log(`[SLOT PURCHASE] CrÃ©ditos atuais: ${credits}`);
                const success = await purchaseSlot(slotConfirmData.type, onSubtractCredits);
                if (success) {
                  console.log(`[SLOT PURCHASE] Compra finalizada com sucesso.`);
                  setShowSlotConfirmDialog(false);
                  setSlotConfirmData(null);
                } else {
                  console.log(`[SLOT PURCHASE] Falha na compra - crÃ©ditos insuficientes`);
                }
              }
            }} className="flex-1">
                Sim
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
      <input ref={replaceInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleReplaceMedia} />

      {/* Get Credits Notification */}
      {showGetCreditsNotification && <GetCreditsNotification onClose={() => setShowGetCreditsNotification(false)} onGetCredits={() => {
      setShowGetCreditsNotification(false);
      // Aqui vocÃª pode abrir um diÃ¡logo de compra de crÃ©ditos ou redirecionar
      toast({
        title: "ðŸ’Ž Comprar CrÃ©ditos",
        description: "Redirecionando para a pÃ¡gina de compra de crÃ©ditos..."
      });
    }} />}

      {/* Gallery Dialog */}
      <GiftViewDialog open={showGiftGallery} onOpenChange={setShowGiftGallery} items={wishlistItems} userCredits={credits} isLoggedIn={isLoggedIn} onGiftItem={handleGiftItem} />

      {/* Premium Plans Dialog */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>âœ¨ Assinar ConteÃºdo Premium</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-muted-foreground mb-4">
              Funcionalidade de assinatura serÃ¡ implementada em breve!
            </p>
            <Button onClick={() => setShowPremiumDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <FollowersDialog open={dialogOpen} onOpenChange={setDialogOpen} followers={followers} isLoading={isLoading} followersCount={followersCount} />

      <FollowingDialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen} following={following} isLoading={isLoading} followingCount={followingCount} />

      {/* Carregador de curtidas em tempo real */}
      <MediaLikesLoader mediaItems={mediaItems} />
      
      {/* Chat Overlay Button */}
      <ChatOverlayButton onToggle={isOpen => setShowChatOverlay(isOpen)} />
    </div>;
});