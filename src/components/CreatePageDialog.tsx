import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Copy, ArrowRight, List, Hash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreatePageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePageDialog = ({ open, onOpenChange }: CreatePageDialogProps) => {
  const [pageName, setPageName] = useState('');
  const [creationType, setCreationType] = useState('novo');
  const [duplicateId, setDuplicateId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPageId, setNewPageId] = useState('');

  const handleCreatePage = async () => {
    if (!pageName.trim()) {
      toast.error("Por favor, insira um nome para a página");
      return;
    }

    setIsCreating(true);

    try {
      // Verificar se o usuário está logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Você precisa estar logado para criar uma página");
        setIsCreating(false);
        return;
      }

      // Gerar ID único para a nova página
      const pageId = user.id.substring(0, 8) + '_' + Date.now().toString(36);
      setNewPageId(pageId);

      if (creationType === 'novo') {
        // Criar página nova com dados do template guest
        const guestUserId = '509bdca7-b48f-47ab-8150-261585a125c2';
        
        // Copiar dados do template para o usuário
        const { error: cloneError } = await supabase.rpc('clone_template_user_data', {
          new_user_id: user.id,
          template_user_id: guestUserId
        });

        if (cloneError) {
          console.error('Erro ao clonar dados template:', cloneError);
          toast.error("Erro ao criar página nova");
          setIsCreating(false);
          return;
        }

        // Criar entrada na tabela de páginas (se existir)
        // Por enquanto vamos apenas mostrar sucesso
        
      } else if (creationType === 'duplicar') {
        // Duplicar página existente do visitante livre
        const visitorUserId = '509bdca7-b48f-47ab-8150-261585a125c2';
        
        // Copiar todos os dados da página do visitante livre
        const { error: duplicateError } = await supabase.rpc('clone_template_user_data', {
          new_user_id: user.id,
          template_user_id: visitorUserId
        });

        if (duplicateError) {
          console.error('Erro ao duplicar página:', duplicateError);
          toast.error("Erro ao duplicar página");
          setIsCreating(false);
          return;
        }
      } else if (creationType === 'duplicar-id') {
        // Validar se o ID foi fornecido
        if (!duplicateId.trim()) {
          toast.error("Por favor, insira o ID da página para duplicar");
          setIsCreating(false);
          return;
        }

        // Duplicar página específica pelo ID fornecido
        const { error: duplicateError } = await supabase.rpc('clone_template_user_data', {
          new_user_id: user.id,
          template_user_id: duplicateId.trim()
        });

        if (duplicateError) {
          console.error('Erro ao duplicar página por ID:', duplicateError);
          toast.error("Erro ao duplicar página. Verifique se o ID é válido.");
          setIsCreating(false);
          return;
        }
      }

      toast.success(`Página "${pageName}" criada com sucesso!`);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Erro ao criar página:', error);
      toast.error("Erro inesperado ao criar página");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoToNewPage = () => {
    const newPageUrl = `/generated/${newPageId}`;
    window.open(newPageUrl, '_blank');
    onOpenChange(false);
    setShowSuccess(false);
    setPageName('');
    setCreationType('novo');
  };

  const handleBackToList = () => {
    onOpenChange(false);
    setShowSuccess(false);
    setPageName('');
    setCreationType('novo');
    toast.info("Você pode encontrar suas páginas criadas no painel principal");
  };

  const resetDialog = () => {
    setShowSuccess(false);
    setPageName('');
    setCreationType('novo');
    setDuplicateId('');
    setNewPageId('');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showSuccess ? "🎉 Página Criada!" : "✨ Criar Nova Página"}
          </DialogTitle>
        </DialogHeader>

        {!showSuccess ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pageName">Nome da Página</Label>
              <Input
                id="pageName"
                placeholder="Ex: Portfólio de Verão, Loja de Cursos Online"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-3">
              <Label>Escolha de Modelo</Label>
              <RadioGroup 
                value={creationType} 
                onValueChange={setCreationType}
                disabled={isCreating}
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="novo" id="novo" />
                  <Label htmlFor="novo" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Novo</div>
                        <div className="text-xs text-muted-foreground">Iniciar uma página do zero</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="duplicar" id="duplicar" />
                  <Label htmlFor="duplicar" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Duplicar Página</div>
                        <div className="text-xs text-muted-foreground">Copiar página existente</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="duplicar-id" id="duplicar-id" />
                  <Label htmlFor="duplicar-id" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Duplicar por ID</div>
                        <div className="text-xs text-muted-foreground">Copiar página específica pelo ID</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {creationType === 'duplicar-id' && (
              <div className="space-y-2">
                <Label htmlFor="duplicateId">ID da Página para Duplicar</Label>
                <Input
                  id="duplicateId"
                  placeholder="Ex: abc12345_kk123456"
                  value={duplicateId}
                  onChange={(e) => setDuplicateId(e.target.value)}
                  disabled={isCreating}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreatePage}
                disabled={isCreating || !pageName.trim()}
                className="flex-1"
              >
                {isCreating ? "Criando..." : "Salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Sua página <strong>"{pageName}"</strong> foi criada com sucesso!
              </p>
              <div className="bg-muted/50 rounded-lg p-3 text-xs">
                <span className="text-muted-foreground">ID da página: </span>
                <span className="font-mono">{newPageId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleBackToList}
                className="flex-1"
              >
                <List className="w-4 h-4 mr-2" />
                Lista de Páginas
              </Button>
              <Button 
                onClick={handleGoToNewPage}
                className="flex-1"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Entrar na Página
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};