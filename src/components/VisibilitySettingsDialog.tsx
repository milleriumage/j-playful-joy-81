import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Lock, RotateCcw } from "lucide-react";
import { useVisibilitySettings, type VisibilitySettings } from "@/hooks/useVisibilitySettings";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

interface VisibilitySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId?: string; // ID do criador da página (para páginas compartilhadas)
  visitorMode?: boolean; // Modo específico para configurações do visitante
}

export const VisibilitySettingsDialog: React.FC<VisibilitySettingsDialogProps> = ({
  open,
  onOpenChange,
  creatorId,
  visitorMode = false,
}) => {
  const { settings, updateSettings, isLoading } = useVisibilitySettings(creatorId, visitorMode);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);
  const { t } = useLanguage();

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setIsUserLoading(false);
    };
    getCurrentUser();
  }, []);

  // Verificar se o usuário atual é o criador
  const isCreator = currentUser && (!creatorId || currentUser.id === creatorId);
  const canEdit = isCreator && !isUserLoading;

  const settingsConfig = [
    {
      key: 'showVitrine' as keyof VisibilitySettings,
      label: 'Vitrine completa',
      description: 'Mostrar ou ocultar toda a vitrine de mídia para visitantes',
    },
    {
      key: 'showSocialEditIcons' as keyof VisibilitySettings,
      label: 'Edição de ícones sociais',
      description: 'Mostrar botões de editar/adicionar ícones das redes sociais',
    },
    {
      key: 'showEditIcons' as keyof VisibilitySettings,
      label: 'Botões de edição',
      description: 'Mostrar ícones de editar/excluir nas mídias e mensagens',
    },
    {
      key: 'showUploadButtons' as keyof VisibilitySettings,
      label: 'Botões de upload',
      description: 'Mostrar botões para upload de imagens e vídeos',
    },
    {
      key: 'showChatCloseIcon' as keyof VisibilitySettings,
      label: 'Ícone de fechar chat',
      description: 'Mostrar ícone para fechar o chat',
    },
    {
      key: 'showChatEditing' as keyof VisibilitySettings,
      label: 'Edição de chat',
      description: 'Permitir editar e gerenciar mensagens do chat',
    },
    {
      key: 'showMediaInteractionStats' as keyof VisibilitySettings,
      label: 'Estatísticas de interação',
      description: 'Mostrar painel de likes, compartilhamentos e visualizações em cada mídia',
    },
    {
      key: 'showChat' as keyof VisibilitySettings,
      label: 'Chat completo',
      description: 'Mostrar ou ocultar todo o sistema de chat para visitantes',
    },
    {
      key: 'showActiveSlotsIndicator' as keyof VisibilitySettings,
      label: 'Indicador de slots ativos',
      description: 'Mostrar indicador visual de slots ativos na interface',
    },
    {
      key: 'showMainMediaDisplay' as keyof VisibilitySettings,
      label: 'Tela principal de mídia',
      description: 'Mostrar ou ocultar toda a tela principal de exibição das mídias',
    },
    {
      key: 'showVitrineTextEdit' as keyof VisibilitySettings,
      label: 'Edição de texto da vitrine',
      description: 'Mostrar botões para editar textos e descrições na vitrine',
    },
    {
      key: 'showVitrineBackgroundEdit' as keyof VisibilitySettings,
      label: 'Edição de plano de fundo da vitrine',
      description: 'Mostrar botão para editar o plano de fundo da vitrine',
    },
  ];

  const handleToggle = (key: keyof VisibilitySettings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {visitorMode ? t('visibility.titleVisitor') : t('visibility.title')}
          </DialogTitle>
          <DialogDescription>
            {visitorMode 
              ? t('visibility.descriptionVisitor')
              : t('visibility.description')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!canEdit && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {!currentUser ? t('visibility.loginRequired') : t('visibility.creatorOnly')}
              </span>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground flex items-center justify-between">
            <span className="font-medium text-accent">
              🔴 {t('visibility.status')}
            </span>
            <Button
              onClick={() => {
                // Ao invés de reload, forçar re-render do componente
                onOpenChange(false);
                setTimeout(() => onOpenChange(true), 100);
                toast.success('🔄 Configurações atualizadas');
              }}
              size="sm"
              variant="outline"
              className="ml-2"
              title={t('visibility.updatePage')}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            {settingsConfig.map((config) => (
              <Card key={config.key} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {settings[config.key] ? (
                        <Eye className="w-4 h-4 text-success" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-destructive" />
                      )}
                      <Label htmlFor={config.key} className="font-medium">
                        {config.label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                  {canEdit && (
                    <Switch
                      id={config.key}
                      checked={settings[config.key]}
                      onCheckedChange={(checked) => handleToggle(config.key, checked)}
                      disabled={isLoading || !canEdit}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            💡 <strong>Dica:</strong> {t('visibility.tip')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};