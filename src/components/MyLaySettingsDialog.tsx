import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lock } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { supabase } from "@/integrations/supabase/client";

interface MyLaySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId?: string;
  visitorMode?: boolean;
}

export const MyLaySettingsDialog = ({ 
  open, 
  onOpenChange, 
  creatorId, 
  visitorMode = false 
}: MyLaySettingsDialogProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setIsLoading(false);
    };
    getCurrentUser();
  }, []);

  const {
    settings,
    updateSettings,
    isLoading: settingsLoading,
    refreshSettings,
  } = useVisibilitySettings(creatorId, visitorMode);

  const isCreator = currentUser && creatorId ? currentUser.id === creatorId : true;
  const canEdit = isCreator && currentUser;

  // Configurações específicas para MyLay
  const myLayConfig = [
    {
      key: 'showVitrine' as keyof typeof settings,
      label: 'Vitrine Completa',
      description: 'Exibe a vitrine completa na página'
    },
    {
      key: 'showMainMediaDisplay' as keyof typeof settings,
      label: 'Tela Principal de Mídia',
      description: 'Mostra a área principal de exibição de mídia'
    },
    {
      key: 'showChat' as keyof typeof settings,
      label: 'Chat Completo',
      description: 'Exibe o sistema de chat completo'
    },
    {
      key: 'showChatEditing' as keyof typeof settings,
      label: 'Edição de Chat',
      description: 'Permite edição de mensagens do chat'
    },
    {
      key: 'showChatCloseIcon' as keyof typeof settings,
      label: 'Ícone de Fechar Chat',
      description: 'Mostra o botão para fechar o chat'
    }
  ];

  const handleToggle = (key: keyof typeof settings) => {
    if (!canEdit) return;
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Config View My lay
            {visitorMode && <span className="text-sm text-muted-foreground">(Modo Visitante)</span>}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure a visibilidade dos elementos específicos do MyLay Design
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {!canEdit && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span className="text-sm">
                  {!currentUser 
                    ? "Faça login para configurar a visibilidade" 
                    : "Somente o criador pode alterar estas configurações"
                  }
                </span>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Oculto
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-4 mr-2"></span>
              Visível
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSettings}
              disabled={settingsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${settingsLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {myLayConfig.map((config) => (
            <Card key={config.key} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{config.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </div>
                <Switch
                  checked={settings[config.key]}
                  onCheckedChange={() => handleToggle(config.key)}
                  disabled={!canEdit || settingsLoading}
                />
              </div>
            </Card>
          ))}

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Dica:</strong> Use essas configurações para personalizar quais elementos do MyLay Design ficam visíveis para os visitantes da sua página.
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};