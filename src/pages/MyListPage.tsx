import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Settings, Copy, DollarSign, Eye, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUserCredits } from "@/hooks/useUserCredits";
import { supabase } from "@/integrations/supabase/client";
import { getMediaUrl } from "@/lib/mediaUtils";
import { VisibilitySettingsDialog } from "@/components/VisibilitySettingsDialog";
import { MyLaySettingsDialog } from "@/components/MyLaySettingsDialog";
import { useLanguage } from "@/hooks/useLanguage";

interface CreatorPage {
  id: string;
  name: string;
  route: string;
  thumbnail: string;
  description: string;
}

const MyListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { credits, subtractCredits } = useUserCredits();
  const [selectedPage, setSelectedPage] = useState<CreatorPage | null>(null);
  const [creatorPages, setCreatorPages] = useState<CreatorPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVisibilitySettings, setShowVisibilitySettings] = useState(false);
  const [showMyLaySettings, setShowMyLaySettings] = useState(false);
  const [purchasedPages, setPurchasedPages] = useState<Set<string>>(new Set());
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedPageForPurchase, setSelectedPageForPurchase] = useState<CreatorPage | null>(null);

  // Páginas disponíveis do criador
  useEffect(() => {
    const loadCreatorPages = async () => {
      setIsLoading(true);
      
      // Carregar páginas compradas do usuário
      await loadPurchasedPages();
      
      // Obter o usuário atual para usar nas rotas
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || 'a5db20ef-664e-419f-82b6-f1b7f4c9c67b'; // fallback
      
      // Simular carregamento de páginas do criador
      const pages: CreatorPage[] = [
        {
          id: '1',
          name: 'User View',
          route: `/user/${currentUserId}`,
          thumbnail: '/lovable-uploads/e5ccf460-b86e-42a4-b236-ede5ad8b2ce7.png',
          description: '👤 Página principal do criador - User View'
        },
        {
          id: '3',
          name: 'CleanPanel Style',
          route: '/cleanpanel',
          thumbnail: '/lovable-uploads/e5ccf460-b86e-42a4-b236-ede5ad8b2ce7.png',
          description: 'Interface limpa e minimalista para seu conteúdo digital'
        },
        {
          id: '6',
          name: 'StreamPanel Style',
          route: '/streampanel',
          thumbnail: '/lovable-uploads/e5ccf460-b86e-42a4-b236-ede5ad8b2ce7.png',
          description: 'Painel moderno para conteúdos digitais'
        }
      ];

      setCreatorPages(pages);
      setSelectedPage(pages[0]); // Selecionar primeira página por padrão
      setIsLoading(false);
    };

    loadCreatorPages();
  }, []);

  // Carregar páginas compradas do usuário
  const loadPurchasedPages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Tentar carregar do Supabase primeiro
      const { data: supabasePurchases, error } = await supabase
        .from('panel_purchases')
        .select('panel_id, credits_spent, purchase_date')
        .eq('user_id', user.id);

      if (!error && supabasePurchases) {
        const purchasedIds = new Set(supabasePurchases.map(purchase => purchase.panel_id));
        setPurchasedPages(purchasedIds);
        
        // Sincronizar com localStorage para compatibilidade
        const purchasesForStorage = supabasePurchases.map(purchase => ({
          panel_id: purchase.panel_id,
          credits_spent: purchase.credits_spent,
          purchased_at: purchase.purchase_date
        }));
        localStorage.setItem(`panel_purchases_${user.id}`, JSON.stringify(purchasesForStorage));
        
        return;
      }

      // Fallback para localStorage se Supabase falhar
      const storedPurchases = localStorage.getItem(`panel_purchases_${user.id}`);
      if (storedPurchases) {
        const purchases: Array<{panel_id: string, credits_spent: number, purchased_at: string}> = JSON.parse(storedPurchases);
        const purchasedIds = new Set(purchases.map(purchase => purchase.panel_id));
        setPurchasedPages(purchasedIds);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas compradas:', error);
      
      // Fallback final para localStorage
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const storedPurchases = localStorage.getItem(`panel_purchases_${user.id}`);
          if (storedPurchases) {
            const purchases: Array<{panel_id: string, credits_spent: number, purchased_at: string}> = JSON.parse(storedPurchases);
            const purchasedIds = new Set(purchases.map(purchase => purchase.panel_id));
            setPurchasedPages(purchasedIds);
          }
        }
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
    }
  };

  // Salvar compra no banco de dados Supabase
  const savePurchaseToDatabase = async (pageId: string, credits: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Buscar dados da página para obter o nome
      const selectedPage = creatorPages.find(page => page.id === pageId);
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('panel_purchases')
        .insert({
          user_id: user.id,
          panel_id: pageId,
          panel_name: selectedPage?.name || `Painel ${pageId}`,
          credits_spent: credits,
          purchase_date: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar compra no Supabase:', error);
        
        // Fallback para localStorage se Supabase falhar
        const storedPurchases = localStorage.getItem(`panel_purchases_${user.id}`);
        const purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
        
        const newPurchase = {
          panel_id: pageId,
          credits_spent: credits,
          purchased_at: new Date().toISOString()
        };
        
        purchases.push(newPurchase);
        localStorage.setItem(`panel_purchases_${user.id}`, JSON.stringify(purchases));
        
        return true; // Ainda retorna true pois salvou no localStorage
      }

      // Também salvar no localStorage para compatibilidade
      const storedPurchases = localStorage.getItem(`panel_purchases_${user.id}`);
      const purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
      
      const newPurchase = {
        panel_id: pageId,
        credits_spent: credits,
        purchased_at: new Date().toISOString()
      };
      
      purchases.push(newPurchase);
      localStorage.setItem(`panel_purchases_${user.id}`, JSON.stringify(purchases));
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      return false;
    }
  };

  // Obter preço do painel
  const getPanelPrice = (pageId: string) => {
    return pageId === '1' ? 0 : 1000; // User View é grátis
  };

  // Obter texto do botão
  const getPanelButtonText = (pageId: string) => {
    return pageId === '1' ? 'Ativar Painel: Free 0 Cr' : 'Ativar Painel: 1000 Cr';
  };

  const handleCopyLink = async (page: CreatorPage) => {
    const fullUrl = `${window.location.origin}${page.route}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success(`🔗 Link da ${page.name} copiado!`);
    } catch (error) {
      toast.error("❌ Erro ao copiar link");
    }
  };

  const handleBuyPage = (page: CreatorPage) => {
    setSelectedPageForPurchase(page);
    setShowPurchaseDialog(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPageForPurchase) return;
    
    const price = getPanelPrice(selectedPageForPurchase.id);
    let success = true;
    
    // Se não é grátis, deduzir créditos
    if (price > 0) {
      success = await subtractCredits(price, `Compra de acesso premium - ${selectedPageForPurchase.name}`);
    }
    
    if (success) {
      // Salvar compra no banco de dados
      await savePurchaseToDatabase(selectedPageForPurchase.id, price);
      
      setPurchasedPages(prev => new Set([...prev, selectedPageForPurchase.id]));
      
      if (price === 0) {
        toast.success(`✅ ${selectedPageForPurchase.name} ativado gratuitamente!`);
      } else {
        toast.success(`✅ Acesso premium à ${selectedPageForPurchase.name} adquirido!`);
      }
    }
    
    setShowPurchaseDialog(false);
    setSelectedPageForPurchase(null);
  };

  const handleCancelPurchase = () => {
    setShowPurchaseDialog(false);
    setSelectedPageForPurchase(null);
  };

  const handleConfigView = (page: CreatorPage) => {
    setShowVisibilitySettings(true);
  };

  const handleConfigViewMyPageTest = (page: CreatorPage) => {
    if (page.name === 'StreamPanel Style') {
      setShowVisibilitySettings(true);
    } else {
      toast.info("Config View disponível apenas para StreamPanel Style");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Carregando páginas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Coluna lateral esquerda - Lista de páginas */}
        <div className="w-96 bg-card border-r border-border flex flex-col">
          {/* Header da sidebar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('myListPage.title')}</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('myListPage.back')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {creatorPages.length} {t('myListPage.pagesAvailable')}
            </p>
          </div>

          {/* Lista de páginas - área rolável */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {creatorPages.map((page) => (
                <Card 
                key={page.id}
                className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPage?.id === page.id 
                    ? 'ring-2 ring-primary bg-accent/50' 
                    : 'hover:bg-accent/20'
                } ${
                  purchasedPages.has(page.id) 
                    ? 'bg-green-100 border-green-300' 
                    : ''
                }`}
                onClick={() => setSelectedPage(page)}
              >
                {/* Thumbnail e nome */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={page.thumbnail} 
                      alt={page.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{page.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {page.description}
                    </p>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-1">
                  {/* Botão 50/Ativado - primeiro da esquerda */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!purchasedPages.has(page.id)) {
                        handleBuyPage(page);
                      }
                    }}
                    disabled={purchasedPages.has(page.id)}
                    className={`flex-1 text-xs ${
                      purchasedPages.has(page.id)
                        ? 'bg-green-600 text-white border-green-600 hover:bg-green-600'
                        : 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-700 hover:text-green-800'
                    }`}
                  >
                    {purchasedPages.has(page.id) ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                         {t('myListPage.activated')}
                      </>
                     ) : (
                       getPanelButtonText(page.id)
                     )}
                  </Button>

                  {/* Botão Entrar - segundo da esquerda */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!purchasedPages.has(page.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (purchasedPages.has(page.id)) {
                        navigate(page.route);
                      }
                    }}
                    className={`flex-1 text-xs ${
                      purchasedPages.has(page.id)
                        ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 hover:text-blue-800'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                     {t('myListPage.enter')}
                  </Button>

                  {page.name === 'User View' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!purchasedPages.has(page.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (purchasedPages.has(page.id)) {
                          handleConfigView(page);
                        }
                      }}
                      className={`flex-1 text-xs ${
                        !purchasedPages.has(page.id) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                       {t('myListPage.configView')}
                    </Button>
                  )}
                  
                  {page.name === 'StreamPanel Style' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!purchasedPages.has(page.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (purchasedPages.has(page.id)) {
                          handleConfigViewMyPageTest(page);
                        }
                      }}
                      className={`flex-1 text-xs ${
                        purchasedPages.has(page.id)
                          ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 hover:text-blue-800'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Config View
                    </Button>
                  )}
                  
                  {page.name === 'CleanPanel Style' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!purchasedPages.has(page.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (purchasedPages.has(page.id)) {
                          setShowMyLaySettings(true);
                        }
                      }}
                      className={`flex-1 text-xs ${
                        purchasedPages.has(page.id)
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-700 hover:text-amber-800'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Config View
                    </Button>
                  )}
                  
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={(e) => {
                       e.stopPropagation();
                       handleCopyLink(page);
                     }}
                     disabled={!purchasedPages.has(page.id)}
                     className={`flex-1 text-xs ${
                       purchasedPages.has(page.id) 
                         ? '' 
                         : 'opacity-50 cursor-not-allowed'
                     }`}
                   >
                     <Copy className="w-3 h-3 mr-1" />
                       {t('myListPage.copy')}
                   </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer da sidebar com créditos */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Créditos:</span>
              <span className="font-medium text-green-600">{credits}</span>
            </div>
          </div>
        </div>

        {/* Área direita - Preview */}
        <div className="flex-1 flex flex-col">
          {/* Header do preview */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedPage ? selectedPage.name : 'Selecione uma página'}
                </h3>
                {selectedPage && (
                  <p className="text-sm text-muted-foreground">
                    Preview ativo
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Área do preview */}
          <div className="flex-1 p-4">
            {selectedPage ? (
              <Card className="h-full p-4">
                <div className="h-full rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
                  <iframe
                    src={selectedPage.route}
                    className="w-full h-full rounded-lg border border-border"
                    title={`Preview de ${selectedPage.name}`}
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma página da lista para visualizar o preview</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de Configurações de Visibilidade */}
      <VisibilitySettingsDialog 
        open={showVisibilitySettings}
        onOpenChange={setShowVisibilitySettings}
      />

      {/* Dialog de Configurações MyLay */}
      <MyLaySettingsDialog 
        open={showMyLaySettings}
        onOpenChange={setShowMyLaySettings}
        creatorId="171c4bb2-9fdd-4c5e-a340-c3f2c8c89e07"
      />

      {/* Dialog de Confirmação de Compra */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              🎉 Confirmar Compra
            </DialogTitle>
          </DialogHeader>
           <div className="text-center py-4">
             {selectedPageForPurchase && (
               <>
                 <p className="text-sm text-muted-foreground mb-4">
                   Você está adquirindo o <strong>{selectedPageForPurchase.name}</strong> por{' '}
                   <strong>
                     {getPanelPrice(selectedPageForPurchase.id) === 0 
                       ? 'GRÁTIS' 
                       : `${getPanelPrice(selectedPageForPurchase.id)} créditos`
                     }
                   </strong>.
                 </p>
                 <p className="text-sm text-muted-foreground">
                   Saldo atual: <span className="font-medium text-green-600">{credits} créditos</span>
                 </p>
                 {getPanelPrice(selectedPageForPurchase.id) > 0 && (
                   <p className="text-sm text-muted-foreground">
                     Após a compra: <span className="font-medium">{credits - getPanelPrice(selectedPageForPurchase.id)} créditos</span>
                   </p>
                 )}
               </>
             )}
           </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleCancelPurchase}
              className="flex-1 gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
             <Button
               onClick={handleConfirmPurchase}
               disabled={selectedPageForPurchase ? credits < getPanelPrice(selectedPageForPurchase.id) : false}
               className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
             >
              <Check className="w-4 h-4" />
              Confirmar compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyListPage;