import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, DollarSign, Lock, Unlock, Eye, EyeOff, Share2, ArrowLeft, Settings, Upload, Edit, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useGuestData } from "@/hooks/useGuestData";
// Logo removida - usando nova logo inline
import { EnhancedChat } from "@/components/EnhancedChat";
import { MediaShowcase } from "@/components/MediaShowcase";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { UserFloatingDialog } from "@/components/UserFloatingDialog";
import { AddCreditsDialog } from "@/components/AddCreditsDialog";
import { PremiumPlansManager } from "@/components/PremiumPlansManager";
import { getMediaUrl } from "@/lib/mediaUtils";
import { useRealtimeMedia } from "@/hooks/useRealtimeMedia";
import { supabase } from "@/integrations/supabase/client";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";

const GeneratedPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [creatorMediaItems, setCreatorMediaItems] = useState<any[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [creatorSocialIcons, setCreatorSocialIcons] = useState<any[]>([]);
  const [isLoadingCreatorData, setIsLoadingCreatorData] = useState(true);
  
  // Extrair creator ID do pageId e carregar dados completos
  useEffect(() => {
    const loadCreatorData = async () => {
      if (!pageId) {
        setIsLoadingCreatorData(false);
        return;
      }

      console.log('🔍 DEBUG: Loading creator data for pageId:', pageId);
      
      try {
        const extractedCreatorId = pageId.split('_')[0];
        console.log('🆔 DEBUG: Extracted creator ID:', extractedCreatorId);
        
        if (extractedCreatorId && extractedCreatorId.length >= 8) {
          // Buscar criador completo EXATO (sem usar like)
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, display_name, bio, avatar_url')
            .eq('user_id', extractedCreatorId); // Usar eq ao invés de like para busca exata
          
          console.log('👤 DEBUG: Exact profile search result:', { extractedCreatorId, profiles, profileError });
          
          // Se não encontrar pelo ID parcial, buscar por todos os perfis
          let foundCreator = null;
          if (!profiles || profiles.length === 0) {
            console.log('🔍 DEBUG: No exact match, searching for partial match...');
            const { data: allProfiles } = await supabase
              .from('profiles')
              .select('user_id, display_name, bio, avatar_url');
            
            foundCreator = allProfiles?.find(p => p.user_id.startsWith(extractedCreatorId));
            console.log('🎯 DEBUG: Partial match result:', { foundCreator, searchedFor: extractedCreatorId });
          } else {
            foundCreator = profiles[0];
          }
          
          if (foundCreator) {
            const fullCreatorId = foundCreator.user_id;
            setCreatorId(fullCreatorId);
            setCreatorProfile(foundCreator);
            
            console.log('✅ DEBUG: Creator found:', { fullCreatorId, profile: foundCreator });
            
            // Carregar mídias do criador específico (NÃO do usuário logado)
            const { data: mediaData, error: mediaError } = await supabase
              .from('media_items')
              .select('*')
              .eq('user_id', fullCreatorId) // USAR O ID DO CRIADOR DA URL
              .order('created_at', { ascending: false });
            
            console.log('🎬 DEBUG: Creator media data result:', { 
              creatorId: fullCreatorId, 
              mediaData, 
              mediaError, 
              count: mediaData?.length 
            });
            
            if (mediaData) {
              setCreatorMediaItems(mediaData);
            }
            
            // Carregar ícones sociais do criador específico (NÃO do usuário logado)
            const { data: socialData, error: socialError } = await supabase
              .from('social_icons')
              .select('*')
              .eq('user_id', fullCreatorId) // USAR O ID DO CRIADOR DA URL
              .order('order_index');
            
            console.log('🌐 DEBUG: Creator social icons result:', { 
              creatorId: fullCreatorId, 
              socialData, 
              socialError, 
              count: socialData?.length 
            });
            
            if (socialData) {
              setCreatorSocialIcons(socialData);
            }
          } else {
            console.warn('⚠️ DEBUG: No creator found for prefix:', extractedCreatorId);
          }
        }
      } catch (error) {
        console.error('💥 DEBUG: Error loading creator data:', error);
      } finally {
        setIsLoadingCreatorData(false);
      }
    };
    
    loadCreatorData();
  }, [pageId]);
  
  // Fallback para mídia padrão se não conseguir carregar do criador
  const {
    mediaItems: fallbackMediaItems,
    isLoading: mediaLoading,
    error: mediaError
  } = useRealtimeMedia();
  const navigate = useNavigate();
  const {
    messages,
    sendMessage
  } = useRealtimeMessages();
  const {
    guestData,
    addGuestNotification,
    updateGuestCredits
  } = useGuestData();
  
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAddCreditsDialog, setShowAddCreditsDialog] = useState(false);

  // Configurações de visibilidade usando o hook
  const { settings: visibilitySettings } = useVisibilitySettings(creatorId, true);

  // Estados para planos premium
  const [premiumPlans] = useState([{
    id: 'basic',
    title: 'Basic',
    price: '$9.99/month',
    description: ['• Unlimited chat', '• Basic content access'],
    link: '',
    stripeProductId: 'prod_SkHR3k5moylM8t'
  }, {
    id: 'pro',
    title: 'Pro',
    price: '$19.99/month',
    description: ['• Everything in Basic', '• Exclusive content', '• VIP interaction'],
    link: '',
    stripeProductId: 'prod_SkHY1XdCaL1NZY'
  }, {
    id: 'vip',
    title: 'VIP',
    price: '$39.99/month',
    description: ['• Everything in Pro', '• Full access', '• Private chat'],
    link: '',
    stripeProductId: 'prod_SkHcmX6aKWG7yi'
  }]);

  const streamerImage = "/lovable-uploads/7503b55d-e8fe-47c3-9366-ca734fd0c867.png";
  
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/generated/${pageId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("🔗 Link da página gerada copiado!");
    } catch {
      toast.error("❌ Não foi possível copiar o link");
    }
  };
  
  // Usar mídias do criador se disponíveis, senão fallback
  const mediaItemsToUse = creatorMediaItems.length > 0 ? creatorMediaItems : fallbackMediaItems;
  
  console.log('📊 DEBUG: Media items to use:', {
    creatorMediaCount: creatorMediaItems.length,
    fallbackMediaCount: fallbackMediaItems.length,
    totalToUse: mediaItemsToUse.length,
    creatorId,
    hasProfile: !!creatorProfile
  });
  
  const mainMedia = mediaItemsToUse.find(item => item.is_main) || {
    storage_path: streamerImage,
    is_blurred: false,
    price: "",
    type: 'image' as const
  };
  
  const mainMediaUrl = React.useMemo(() => getMediaUrl(mainMedia.storage_path), [mainMedia.storage_path]);
  
  const handleMediaClick = (item: any) => {
    if (item.link) {
      window.open(item.link, '_blank');
      toast.success("🔗 Link aberto! Todas as funcionalidades estão liberadas nesta página gerada.");
    } else {
      toast.success("🔓 Conteúdo totalmente desbloqueado! Página gerada sem restrições.");
    }
  };
  
  const handleUpload = (type: string) => {
    toast.success(`📁 Upload de ${type} totalmente habilitado! Sem restrições nesta página.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Header com indicador especial de página gerada */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-4 sm:gap-2">
          
          {/* Controles da esquerda - TODOS desbloqueados */}
          <div className="flex flex-col items-start gap-2 sm:flex-shrink-0">
            <div className="flex items-center gap-2">
              <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-2">
                    <Crown className="w-4 h-4 mr-2" />
                    BE PREMIUM
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>🌟 Planos Premium - Página Gerada</DialogTitle>
                  </DialogHeader>
                  <PremiumPlansManager plans={premiumPlans} onPlansUpdate={() => {}} disabled={false} isUserView={true} />
                </DialogContent>
              </Dialog>

              <Button onClick={handleShare} className="rounded-full px-6 py-2" variant="secondary">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>

              <Button onClick={() => setShowAddCreditsDialog(true)} className="bg-muted hover:bg-muted/90 rounded-full text-xs px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full animate-blink-circle"></div>
                <span className="text-green-500 font-medium">
                  {guestData.credits}
                </span>
                <span className="text-red-500 animate-blink-red font-medium">get credit</span>
              </Button>

              <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </div>
            
            {/* Indicador especial da página gerada */}
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-purple-600 font-medium">✨ Página:</span>
              <span className="ml-1 text-foreground font-bold">GERADA SEM RESTRIÇÕES</span>
            </div>
            
            {/* Informações da página gerada */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-blue-600 font-medium">👤 Criador:</span>
              <span className="ml-1 text-foreground font-medium">
                {isLoadingCreatorData 
                  ? 'Carregando...' 
                  : creatorProfile?.display_name || (creatorId ? `${creatorId.slice(0, 8)}...` : 'Dados padrão')
                }
              </span>
            </div>
            
            {/* Status dos dados carregados */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-green-600 font-medium">📊 Dados:</span>
              <span className="ml-1 text-foreground font-medium">
                {creatorMediaItems.length} mídias | {creatorSocialIcons.length} ícones sociais
              </span>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-purple-600 font-medium">🆔 ID:</span>
              <span className="ml-1 text-foreground font-mono">{pageId}</span>
            </div>
          </div>

          {/* Logo centralizado */}
          <div className="flex items-center justify-center sm:flex-1 sm:mx-4">
            <div className="flex flex-col items-center gap-1">
              <img 
                src="/lovable-uploads/77dc0ba2-10ba-494b-b95e-2eeef10dcaea.png" 
                alt="AuraLink Logo" 
                className="h-8 sm:h-10 w-auto mb-1"
              />
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
                  <span className="text-dream-white">Dream</span>
                  <span className="text-gold drop-shadow-sm">LINK</span>
                  <span className="text-dream-gray text-lg ml-1">TV</span>
                </h1>
                <p className="text-xs text-gray-600 font-medium tracking-wider lowercase">página gerada - sem restrições</p>
              </div>
            </div>
          </div>

          {/* Google Auth sempre visível */}
          <div className="flex items-center justify-end gap-2 sm:flex-shrink-0">
            <GoogleAuthButton onLoginSuccess={() => setShowUserDialog(true)} />
          </div>
        </div>

        {/* Mídia principal - SEMPRE visível e desbloqueada */}
        <div className="relative">
          {mainMedia.type === 'video' ? (
            <video 
              src={mainMediaUrl} 
              controls 
              className="w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer" 
              onClick={() => handleMediaClick(mainMedia)} 
              title="Mídia principal - Sempre desbloqueada na página gerada" 
            />
          ) : (
            <img 
              src={mainMediaUrl} 
              alt="Streamer" 
              className="w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer" 
              onClick={() => handleMediaClick(mainMedia)} 
              title="Mídia principal - Sempre desbloqueada na página gerada" 
            />
          )}
          {/* Overlay indicando que está totalmente desbloqueado */}
          <div className="absolute top-2 right-2">
            <div className="bg-green-500/90 text-white px-2 py-1 rounded-md text-xs font-medium">
              🔓 LIVRE
            </div>
          </div>
        </div>

        {/* Ícones de redes sociais do criador - Only show if configuration allows */}
        {(visibilitySettings?.showSocialEditIcons ?? true) && creatorSocialIcons.length > 0 && (
          <div className="flex justify-center gap-4 mb-4">
            {creatorSocialIcons.map((icon) => (
              <div key={icon.id} className="relative group">
                <div
                  className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                    icon.link ? 'hover:shadow-lg' : 'opacity-50'
                  }`}
                  onClick={() => {
                    if (icon.link) {
                      window.open(icon.link, '_blank');
                    }
                  }}
                >
                  <img
                    src={icon.icon_url}
                    alt="Social Icon"
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Erro ao carregar ícone social:', icon.icon_url);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Showcase de mídia - TODAS as funcionalidades habilitadas */}
        {(visibilitySettings?.showVitrine ?? true) && (
          <MediaShowcase 
            mediaItems={mediaItemsToUse}
            onUploadImage={() => handleUpload('imagem')} 
            onUploadVideo={() => handleUpload('vídeo')} 
            onReplaceMedia={() => toast.success("🔄 Substituição de mídia totalmente habilitada!")} 
            onUpdateMedia={() => {}} 
            onDeleteMedia={() => toast.success("🗑️ Exclusão de mídia totalmente habilitada!")} 
            onSetAsMain={() => toast.success("⭐ Definir como principal totalmente habilitado!")} 
            onEditMedia={() => toast.success("✏️ Edição de mídia totalmente habilitada!")} 
            onSetPrice={() => toast.success("💰 Configuração de preço totalmente habilitada!")} 
            onSetLink={() => toast.success("🔗 Configuração de link totalmente habilitada!")} 
            passwordProtected={false} 
            onPasswordVerify={() => {}} 
            credits={9999} 
            onAddCredits={() => toast.success("💳 Sistema de créditos totalmente habilitado!")} 
            onSubtractCredits={async () => {
              toast.success("💸 Dedução de créditos totalmente habilitada!");
              return true;
            }} 
            visibilitySettings={visibilitySettings}
            creatorId={creatorId} // Usar o ID real do criador
          />
        )}

        {/* Chat com TODAS as funcionalidades habilitadas */}
        {(visibilitySettings?.showChat ?? true) && (
          <Card className="p-4 bg-card border">
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    💬 Chat totalmente liberado - Todas as funcionalidades disponíveis sem restrições
                  </p>
                </div>
              </div>
            </div>
            
            <EnhancedChat 
              messages={messages} 
              onSendMessage={sendMessage} 
              onEditMessage={() => toast.success("✏️ Edição de mensagem totalmente habilitada!")} 
              passwordProtected={false} 
              onPasswordVerify={() => {}} 
              isLoggedIn={true} // Permitir que visitantes não autenticados enviem mensagens
              credits={9999} // Créditos infinitos para visitantes
              visibilitySettings={{
                showChatEditing: visibilitySettings?.showChatEditing ?? true,
                showChatCloseIcon: visibilitySettings?.showChatCloseIcon ?? true
              }} 
            />
          </Card>
        )}

        {/* Banner especial da página gerada */}
        <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300/30">
          <div className="text-center">
            <h3 className="text-lg font-bold text-purple-700 mb-2">✨ Página Gerada com Sucesso!</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Esta é uma cópia completa da página original, mas sem nenhuma restrição de privacidade. 
              Todos os botões e funcionalidades estão 100% desbloqueados para visitantes.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-purple-600">
              <span>🔗 Link permanente:</span>
              <code className="bg-purple-100 px-2 py-1 rounded">/generated/{pageId}</code>
            </div>
          </div>
        </Card>

        <UserFloatingDialog isOpen={showUserDialog} onClose={() => setShowUserDialog(false)} />
        <AddCreditsDialog open={showAddCreditsDialog} onOpenChange={setShowAddCreditsDialog} />

      </div>
    </div>
  );
};

export default GeneratedPage;