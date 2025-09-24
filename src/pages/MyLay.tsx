import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Crown, DollarSign, Lock, Unlock, Eye, EyeOff, Share2, ArrowLeft, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useParams } from "react-router-dom";
import { useCreatorMessages } from "@/hooks/useCreatorMessages";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
// Logo removida - usando nova logo inline
import { EnhancedChat } from "@/components/EnhancedChat";
import { MediaShowcase } from "@/components/MediaShowcase";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { UserFloatingDialog } from "@/components/UserFloatingDialog";
import { AddCreditsDialog } from "@/components/AddCreditsDialog";
import { PremiumPlansManager } from "@/components/PremiumPlansManager";
import { CreatorSubscriptionsManager } from "@/components/CreatorSubscriptionsManager";
import { CreditSuccessNotification } from "@/components/CreditSuccessNotification";
import { SubscriptionSuccessNotification } from "@/components/SubscriptionSuccessNotification";
import { ActivePlanIndicator } from "@/components/ActivePlanIndicator";
import { AuthDialog } from "@/components/AuthDialog";
import { VisibilitySettingsDialog } from "@/components/VisibilitySettingsDialog";
import { getMediaUrl } from "@/lib/mediaUtils";
import { fixMediaPolicies } from "@/utils/fixMediaPolicies";
import { useCreatorPermissions } from "@/hooks/useCreatorPermissions";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { SocialMediaIcons } from "@/components/SocialMediaIcons";
import { useCreatorSocialIcons } from "@/hooks/useCreatorSocialIcons";

const MyLay = () => {
  // Usar o usuário logado como criador
  const { user, isGuest } = useGoogleAuth();
  const creatorId = user?.id;
  const isViewingCreatorPage = !!creatorId;
  const { messages, sendMessage } = useCreatorMessages(creatorId);
  
  // Social media icons - usar o usuário logado para cleanpanel
  const { socialNetworks, updateSocialNetwork, addSocialNetwork, deleteSocialNetwork, isLoading } = useCreatorSocialIcons();
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const { credits, isLoading: creditsLoading, addCredits, isLoggedIn } = useUserCredits();
  const { subscribed, subscription_tier, checkSubscription } = useSubscription();
  const { settings: visibilitySettings } = useVisibilitySettings(creatorId);
  const { isCreator, canEdit } = useCreatorPermissions(creatorId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAddCreditsDialog, setShowAddCreditsDialog] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [addedCredits, setAddedCredits] = useState(0);
  const [showSubscriptionSuccess, setShowSubscriptionSuccess] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState('');
  const [showVisibilitySettings, setShowVisibilitySettings] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCreatorSubscriptions, setShowCreatorSubscriptions] = useState(false);

  useEffect(() => {
    const loadCreatorData = async () => {
      if (!creatorId || !isViewingCreatorPage) {
        console.log('🚫 DEBUG: No valid creatorId provided for myLay', { creatorId, isViewingCreatorPage });
        return;
      }
      console.log('📊 DEBUG: Loading creator data for:', creatorId);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 DEBUG: Current user auth status:', { isLoggedIn: !!user, userId: user?.id });
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('user_id', creatorId).single();
        if (profileError) {
          console.error('❌ DEBUG: Error loading creator profile:', profileError);
          console.log('🔍 DEBUG: Profile error details:', { code: profileError.code, message: profileError.message, details: profileError.details });
          toast.error('❌ Criador não encontrado');
          return;
        }
        console.log('✅ DEBUG: Creator profile loaded:', profileData);
        setCreatorProfile(profileData);
        const { data: mediaData, error: mediaError } = await supabase.from('media_items').select('*').eq('user_id', creatorId).order('created_at', { ascending: false });
        if (mediaError) {
          console.error('❌ DEBUG: Error loading creator media:', mediaError);
          console.log('🔍 DEBUG: Media error details:', { code: mediaError.code, message: mediaError.message, details: mediaError.details, hint: mediaError.hint });
          if (mediaError.code === '42501' || mediaError.message?.includes('policy')) {
            console.log('🚫 DEBUG: RLS policy blocking media access for anonymous users');
            toast.error('❌ Acesso às mídias bloqueado por política de segurança');
          } else {
            toast.error('❌ Erro ao carregar mídias do criador');
          }
          setMediaItems([]);
        } else {
          console.log('✅ DEBUG: Media items loaded:', { count: mediaData?.length || 0, items: mediaData?.map(item => ({ id: item.id, type: item.type, is_main: item.is_main, storage_path: item.storage_path?.substring(0, 50) + '...' })) });
          setMediaItems(mediaData || []);
        }
      } catch (error) {
        console.error('💥 DEBUG: Unexpected error loading creator data:', error);
        toast.error('❌ Erro ao carregar dados do criador');
      }
    };
    loadCreatorData();
  }, [creatorId, isViewingCreatorPage]);

  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const creditsParam = searchParams.get('credits');
    const subscriptionSuccess = searchParams.get('subscription_success');
    const planParam = searchParams.get('plan');
    if (paymentSuccess === 'true' && creditsParam) {
      const creditsAmount = parseInt(creditsParam);
      setAddedCredits(creditsAmount);
      setShowSuccessNotification(true);
      addCredits(creditsAmount);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('payment_success');
      newSearchParams.delete('credits');
      setSearchParams(newSearchParams, { replace: true });
    }
    if (subscriptionSuccess === 'true' && planParam) {
      setSubscribedPlan(planParam);
      setShowSubscriptionSuccess(true);
      checkSubscription();
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('subscription_success');
      newSearchParams.delete('plan');
      setSearchParams(newSearchParams, { replace: true });
      setTimeout(() => { setShowSubscriptionSuccess(false); }, 30000);
    }
  }, [searchParams, setSearchParams, addCredits, checkSubscription]);

  const [premiumPlans] = useState([{ id: 'basic', title: 'Basic', price: '$9.99/month', description: ['• Unlimited chat', '• Basic content access'], link: '', stripeProductId: 'prod_SkHR3k5moylM8t' }, { id: 'pro', title: 'Pro', price: '$19.99/month', description: ['• Everything in Basic', '• Exclusive content', '• VIP interaction'], link: '', stripeProductId: 'prod_SkHY1XdCaL1NZY' }, { id: 'vip', title: 'VIP', price: '$39.99/month', description: ['• Everything in Pro', '• Full access', '• Private chat'], link: '', stripeProductId: 'prod_SkHcmX6aKWG7yi' }]);
  const streamerImage = "/lovable-uploads/7503b55d-e8fe-47c3-9366-ca734fd0c867.png";
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/user/${creatorId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("🔗 Link copiado para a área de transferência!");
    } catch {
      if ((navigator as any).share) {
        try {
          await (navigator as any).share({ url: shareUrl, title: "AuraLink" });
          return;
        } catch {}
      }
      toast.error("❌ Não foi possível copiar o link");
    }
  };
  const mainMedia = mediaItems.find(item => item.is_main) || { storage_path: streamerImage, is_blurred: false, price: "", type: 'image' as const };
  const mainMediaUrl = React.useMemo(() => getMediaUrl(mainMedia.storage_path), [mainMedia.storage_path]);
  const handleMediaClick = (item: any) => {
    if (item.link) {
      window.open(item.link, '_blank');
    } else if (item.is_blurred || item.price) {
      toast.info("🔒 Conteúdo premium! Assine para ter acesso.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Button>
            <div className="font-semibold text-gray-900">CONTENT CREATOR</div>
          </div>
          
          {/* Logo centralizado */}
          <div className="flex items-center justify-center flex-1 mx-4">
            <div className="flex flex-col items-center gap-1">
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
                  <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">Social</span>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">Link</span>
                </h1>
                <p className="text-sm text-muted-foreground">For Influencers, Creators & Sellers</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAuthDialog(true)}
            className="relative p-2 hover:bg-gray-100"
          >
            <User className="w-6 h-6 text-gray-500" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white"></div>
          </Button>
        </div>

        {/* Mídia Principal */}
        {visibilitySettings.showMainMediaDisplay && (
          <div className="bg-gray-100 p-4">
            <div className="relative rounded-lg overflow-hidden shadow-md aspect-video">
              {mainMedia.type === 'video' ? (
                <video
                  src={getMediaUrl(mainMedia.storage_path)}
                  controls
                  className={`w-full h-full object-cover ${mainMedia.is_blurred ? 'blur-md hover:blur-none' : ''}`}
                  title={mainMedia.name || "Tela principal"}
                  onError={(e) => { console.error('Erro ao carregar vídeo principal:', mainMedia.storage_path); }}
                />
              ) : (
                <img
                  src={getMediaUrl(mainMedia.storage_path)}
                  alt="Tela Principal"
                  className={`w-full h-full object-cover ${mainMedia.is_blurred ? 'blur-md hover:blur-none' : ''}`}
                  title={mainMedia.name || "Tela principal"}
                  onError={(e) => { console.error('Erro ao carregar imagem principal:', mainMedia.storage_path); (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        )}

        {/* Showcase de Mídia */}
        {visibilitySettings.showVitrine && (
          <div className="bg-white p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Media Showcase</h3>
            <div className="overflow-x-auto whitespace-nowrap -mx-4 px-4">
              {mediaItems.length > 0 ? (
                mediaItems.map((item, index) => (
                  <div key={item.id || index} className="inline-block w-32 h-32 rounded-md overflow-hidden shadow-md mr-2 relative cursor-pointer" onClick={() => handleMediaClick(item)}>
                    {item.type === 'video' ? (
                      <video
                        src={getMediaUrl(item.storage_path)}
                        className={`w-full h-full object-cover ${item.is_blurred ? 'blur-md hover:blur-none' : ''}`}
                        muted
                        onError={(e) => { console.error('Erro ao carregar vídeo:', item.storage_path); }}
                      />
                    ) : (
                      <img 
                        src={getMediaUrl(item.storage_path)} 
                        alt={item.name || `Media ${index}`} 
                        className={`w-full h-full object-cover ${item.is_blurred ? 'blur-md hover:blur-none' : ''}`}
                        onError={(e) => { console.error('Erro ao carregar imagem:', item.storage_path); (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        loading="lazy"
                      />
                    )}
                    {item.price && !(typeof item.price === 'string' && item.price.startsWith('{')) && (
                      <div className="absolute top-1 right-1">
                        <div className="bg-yellow-500 text-black text-xs px-1 rounded">
                          ${item.price}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma mídia encontrada
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ícones de redes sociais - removido seção duplicada, já incluído no MediaShowcase */}

        {/* Chat */}
        {visibilitySettings.showChat && (
          <div className="bg-white p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Community Chat</h3>
            </div>
            <EnhancedChat
              messages={messages}
              onSendMessage={sendMessage}
              onEditMessage={() => toast.info("🔒 Apenas criadores podem editar mensagens!")}
              passwordProtected={false}
              onPasswordVerify={() => {}}
              visibilitySettings={{ showChatEditing: visibilitySettings.showChatEditing, showChatCloseIcon: visibilitySettings.showChatCloseIcon }}
            />
          </div>
        )}

      </div>
      {/* Floating Creator Management Button */}
      {isCreator && canEdit && (
        <Button
          onClick={() => setShowCreatorSubscriptions(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
          size="sm"
        >
          📋
        </Button>
      )}
      
      {/* Dialog de Autenticação */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={() => {
          setShowAuthDialog(false);
          toast.success("🎉 Login realizado com sucesso!");
        }}
      />

      {/* Creator Subscriptions Dialog */}
      <Dialog open={showCreatorSubscriptions} onOpenChange={setShowCreatorSubscriptions}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📋 Gerenciar Planos de Assinatura</DialogTitle>
          </DialogHeader>
          <CreatorSubscriptionsManager />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLay;