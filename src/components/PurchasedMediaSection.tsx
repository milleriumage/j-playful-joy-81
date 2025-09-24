import React from 'react';
import { Card } from "@/components/ui/card";
import { useUserUnlocks } from '@/hooks/useUserUnlocks';
import { getMediaUrl } from '@/lib/mediaUtils';
import { ShoppingBag, Clock, CreditCard, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface PurchasedMediaSectionProps {
  onSetAsMain?: (mediaId: string) => void;
}

export const PurchasedMediaSection = ({ onSetAsMain }: PurchasedMediaSectionProps = {}) => {
  const { unlockedMedia, isLoading } = useUserUnlocks();

  const handleActivateMainscreen = (unlock: any) => {
    if (unlock.media_items && onSetAsMain) {
      onSetAsMain(unlock.media_items.id);
      toast.success("✨ Mídia ativada na tela principal!");
    } else {
      toast.info("🔄 Ativando mídia na tela principal...");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-700">Meu Conteúdo Comprado</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </Card>
    );
  }

  if (unlockedMedia.length === 0) {
    return (
      <Card className="p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-700">Meu Conteúdo Comprado</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Você ainda não comprou nenhum conteúdo</p>
          <p className="text-sm">Quando fizer uma compra, o conteúdo aparecerá aqui</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-700">Meu Conteúdo Comprado</h3>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          {unlockedMedia.length} {unlockedMedia.length === 1 ? 'item' : 'itens'}
        </span>
      </div>
      
      <div className="space-y-3">
        {unlockedMedia.map((unlock) => {
          const media = unlock.media_items;
          if (!media) return null;

          const expiresAt = new Date(unlock.expires_at);
          const timeUntilExpiry = formatDistanceToNow(expiresAt, { 
            addSuffix: true, 
            locale: ptBR 
          });

          return (
            <div 
              key={unlock.id} 
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Preview da mídia */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                {media.type === 'video' ? (
                  <div className="relative w-full h-full bg-gray-900">
                    <video
                      src={getMediaUrl(media.storage_path)}
                      poster={getMediaUrl(media.storage_path) + '#t=0.5'}
                      preload="metadata"
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onLoadedData={(e) => {
                        const video = e.currentTarget;
                        video.currentTime = 0.5;
                      }}
                      onError={(e) => {
                        console.warn('Video failed to load:', getMediaUrl(media.storage_path));
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[3px] border-l-gray-900 border-y-[2px] border-y-transparent ml-[1px]"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={getMediaUrl(media.storage_path)} 
                    alt={media.name || 'Conteúdo comprado'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                )}
              </div>

              {/* Informações da mídia */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {media.name || 'Conteúdo Premium'}
                </h4>
                {media.description && (
                  <p className="text-sm text-gray-600 truncate">
                    {media.description}
                  </p>
                )}
                
                {/* Informações da compra */}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {unlock.credits_spent} créditos
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Expira {timeUntilExpiry}
                  </div>
                </div>
              </div>

              {/* Tipo de mídia */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {/* Crown icon clickable para ativar mainscreen */}
                <div 
                  className="cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleActivateMainscreen(unlock)}
                  title="Ativar na tela principal"
                >
                  <Crown className="w-4 h-4 text-yellow-600 hover:text-yellow-500 transition-colors" />
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  media.type === 'video' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {media.type === 'video' ? '🎥 Vídeo' : '🖼️ Imagem'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};