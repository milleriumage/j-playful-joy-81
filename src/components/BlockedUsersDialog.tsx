import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserX, Shield, Unlock } from "lucide-react";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useCreatorPermissions } from "@/hooks/useCreatorPermissions";

interface BlockedUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId?: string;
}

export const BlockedUsersDialog: React.FC<BlockedUsersDialogProps> = ({
  open,
  onOpenChange,
  creatorId
}) => {
  const { blockedUsers, isLoading, unblockUser } = useBlockedUsers();
  const { canEdit } = useCreatorPermissions(creatorId);

  // Se não for o criador, não mostrar o diálogo
  if (!canEdit) {
    return null;
  }

  const handleUnblock = async (userId: string) => {
    const success = await unblockUser(userId);
    if (success) {
      // Recarregar a lista é feito automaticamente no hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Usuários Pausados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Usuários pausados temporariamente não conseguem acessar sua página.
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : blockedUsers.length === 0 ? (
            <Card className="p-8 text-center">
              <UserX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário pausado</h3>
              <p className="text-muted-foreground">
                Você ainda não pausou nenhum usuário da sua página.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blockedUser) => (
                <Card key={blockedUser.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <UserX className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          Usuário ID: {blockedUser.blocked_user_id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pausado em {new Date(blockedUser.created_at).toLocaleDateString('pt-BR')}
                          {blockedUser.expires_at && (
                            <div className="text-xs text-orange-600">
                              Expira em {new Date(blockedUser.expires_at).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUnblock(blockedUser.blocked_user_id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Unlock className="w-4 h-4" />
                      Despausar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            💡 <strong>Dica:</strong> Para pausar um usuário, clique no botão de pausa ao lado do nome dele na lista de usuários online quando você for o criador da página.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};