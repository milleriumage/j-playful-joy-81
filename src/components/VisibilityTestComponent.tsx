import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, User, Crown, Settings, TestTube, Link2, Upload, Edit, DollarSign, Share2, ExternalLink, RotateCcw, Copy, Gift, Globe, Lock } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { VisibilitySettingsDialog } from "./VisibilitySettingsDialog";
import { GiftViewDialog } from "./GiftViewDialog";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
export const VisibilityTestComponent = () => {
  const {
    settings: visibilitySettings,
    isLoading
  } = useVisibilitySettings();
  const { isPagePublic, togglePageVisibility } = usePageVisibility();
  const { wishlistItems } = useWishlist();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showVisitorSettingsDialog, setShowVisitorSettingsDialog] = useState(false);
  const [showGiftGallery, setShowGiftGallery] = useState(false);
  const [currentView, setCurrentView] = useState<'creator' | 'visitor'>('creator');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);
  const testElements = [{
    key: 'showEditIcons',
    name: 'Botões de Edição',
    icon: Edit,
    description: 'Ícones de editar/excluir nas mídias',
    demo: () => <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
          
        </div>
  }, {
    key: 'showUploadButtons',
    name: 'Botões de Upload',
    icon: Upload,
    description: 'Botões para upload de imagens e vídeos',
    demo: () => <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Upload className="w-3 h-3 mr-1" />
            Imagem
          </Button>
          <Button size="sm" variant="outline">
            <Upload className="w-3 h-3 mr-1" />
            Vídeo
          </Button>
        </div>
  }, {
    key: 'showSettingsButton',
    name: 'Botão Configurações',
    icon: Settings,
    description: 'Botão de configurações no menu',
    demo: () => <Button size="sm" variant="outline">
          <Settings className="w-3 h-3 mr-1" />
          Configurações
        </Button>
  }, {
    key: 'showMediaActions',
    name: 'Ações de Mídia',
    icon: Crown,
    description: 'Botões para configurar preços, links',
    demo: () => <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Link2 className="w-3 h-3 mr-1" />
            Link
          </Button>
          <Button size="sm" variant="outline">
            <Crown className="w-3 h-3 mr-1" />
            Principal
          </Button>
        </div>
  }, {
    key: 'showPremiumDialog',
    name: 'Dialog Premium',
    icon: Crown,
    description: 'Permitir que visitantes vejam planos premium',
    demo: () => <Button size="sm" variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          BE PREMIUM
        </Button>
  }, {
    key: 'showChatEditing',
    name: 'Edição de Chat',
    icon: Edit,
    description: 'Permitir editar mensagens do chat',
    demo: () => <div className="bg-muted p-2 rounded text-sm flex justify-between items-center">
          <span>Mensagem do chat</span>
          <Button size="sm" variant="ghost">
            <Edit className="w-3 h-3" />
          </Button>
        </div>
  }];
  const toggleView = () => {
    setCurrentView(currentView === 'creator' ? 'visitor' : 'creator');
    toast.info(currentView === 'creator' ? "👀 Visualizando como VISITANTE" : "👑 Visualizando como CRIADOR");
  };
  const handleShareVisitorView = async () => {
    const visitorUrl = `${window.location.origin}/visitor-test`;
    try {
      await navigator.clipboard.writeText(visitorUrl);
      toast.success("🔗 Link de visitante copiado!");

      // Abrir em nova aba
      window.open(visitorUrl, '_blank');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error("❌ Erro ao copiar link");
    }
  };
  const handleShareUnrestrictedView = async () => {
    const unrestrictedUrl = `${window.location.origin}/visitante-livre`;
    try {
      await navigator.clipboard.writeText(unrestrictedUrl);
      toast.success("🌟 Link de visitante sem restrições copiado!");

      // Abrir em nova aba
      window.open(unrestrictedUrl, '_blank');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error("❌ Erro ao copiar link");
    }
  };
  if (isLoading) {
    return <Card className="p-6">
        <div className="text-center">Carregando configurações...</div>
      </Card>;
  }
  return <div className="space-y-6">
      {/* Header de Teste */}
      {headerVisible && (
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
        

        <div className="flex gap-4 flex-wrap justify-center">
          {currentView === 'creator' && <>
              {/* Botão copiado do UserLinkDisplay */}
              {/* Toggle Público/Privado */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl px-4 py-2 shadow-lg">
                <Lock className={`w-4 h-4 ${!isPagePublic ? 'text-red-500' : 'text-gray-400'}`} />
                <Switch
                  checked={isPagePublic}
                  onCheckedChange={togglePageVisibility}
                  className="data-[state=checked]:bg-green-500"
                />
                <Globe className={`w-4 h-4 ${isPagePublic ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isPagePublic ? 'text-green-600' : 'text-red-600'}`}>
                  {isPagePublic ? 'Público' : 'Privado'}
                </span>
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 border-primary/20 hover:border-primary/40 text-primary hover:text-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2" 
                onClick={async () => {
                  try {
                    if (!currentUserId) {
                      toast.error("❌ Usuário não logado");
                      return;
                    }
                    await navigator.clipboard.writeText(`${window.location.origin}/user/${currentUserId}`);
                    toast.success("🔗 Link copiado!");
                  } catch (error) {
                    console.error('Erro ao copiar link:', error);
                    toast.error("❌ Erro ao copiar link");
                  }
                }}
              >
                <Copy className="w-4 h-4" />
                <span className="font-medium">Copy Link</span>
              </Button>


              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 hover:from-emerald-500/10 hover:to-cyan-500/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 hover:text-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2" 
                onClick={() => setShowGiftGallery(true)}
              >
                <Eye className="w-4 h-4" />
                <span className="font-medium">Mywishlist</span>
              </Button>


              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2 bg-gradient-to-r from-accent/5 to-secondary/5 hover:from-accent/10 hover:to-secondary/10 border-accent/20 hover:border-accent/40 text-accent hover:text-accent shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2" 
                onClick={() => navigate('/mylistpage')}
              >
                <span className="text-lg">📋</span>
                <span className="font-medium">MyPageList</span>
              </Button>

              <div className="flex flex-col gap-1">
                
                <div className="flex flex-wrap gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-2 bg-gradient-to-r from-slate-500/5 to-gray-500/5 hover:from-slate-500/10 hover:to-gray-500/10 border-slate-500/20 hover:border-slate-500/40 text-slate-600 hover:text-slate-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2" 
                    onClick={() => setHeaderVisible(!headerVisible)}
                  >
                    {headerVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="font-medium">{headerVisible ? 'Hide' : 'Show'}</span>
                  </Button>
                </div>
              </div>
            </>}
        </div>
      </Card>
      )}

      {/* Grid de Testes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testElements.map(element => {
        const isVisible = currentView === 'creator' || visibilitySettings[element.key as keyof typeof visibilitySettings];
        const IconComponent = element.icon;
        return null;
      })}
      </div>

      {/* Dialog de Configurações */}
      <VisibilitySettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
      
      {/* Dialog de Configurações do Visitante */}
      <VisibilitySettingsDialog open={showVisitorSettingsDialog} onOpenChange={setShowVisitorSettingsDialog} visitorMode={true} />

      {/* Dialog da Wishlist removido - agora está no MenuDropdown */}
      
      {/* Dialog da Galeria de Presentes */}
      <GiftViewDialog 
        open={showGiftGallery} 
        onOpenChange={setShowGiftGallery}
        items={wishlistItems}
      />
    </div>;
};