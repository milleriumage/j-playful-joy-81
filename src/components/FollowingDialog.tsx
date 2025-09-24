import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

interface Following {
  id: string;
  creator_id: string;
  created_at: string;
  creator_profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface FollowingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  following: Following[];
  isLoading: boolean;
  followingCount: number;
}

export const FollowingDialog: React.FC<FollowingDialogProps> = ({
  open,
  onOpenChange,
  following,
  isLoading,
  followingCount
}) => {
  const navigate = useNavigate();
  const { user, isGuest } = useOptimizedAuth();

  const handleFollowingClick = (creatorId: string) => {
    // Fechar dialog e navegar para página do criador
    onOpenChange(false);
    navigate(`/user/${creatorId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seguindo ({followingCount})
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Não está seguindo ninguém ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {following.map((item) => {
                // Verificar se é um usuário logado (tem creator_id válido de usuário real)
                const isLoggedUser = item.creator_id && 
                  item.creator_id.length === 36 && // UUID válido
                  !item.creator_id.startsWith('guest_');
                
                // Verificar se o perfil é privado (por enquanto assumindo que não há essa configuração ainda)
                const isPrivateProfile = false; // TODO: Implementar verificação de perfil privado
                
                // Mostrar botão "Ver Perfil" apenas se:
                // 1. O visualizador está logado (!isGuest && user)
                // 2. O criador é um usuário logado (isLoggedUser)
                // 3. O perfil não é privado (!isPrivateProfile)
                const showViewProfileButton = !isGuest && user && isLoggedUser && !isPrivateProfile;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-muted/50"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage 
                        src={item.creator_profile?.avatar_url || undefined} 
                        alt={item.creator_profile?.display_name || 'Criador'} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                        {(item.creator_profile?.display_name || 'C').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base truncate">
                          {item.creator_profile?.display_name || 'Criador'}
                        </p>
                        {!isLoggedUser && (
                          <span className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
                            Visitante
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Seguindo desde {new Date(item.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        ID: {item.creator_id.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Só mostra botão Ver Perfil conforme as condições */}
                    {showViewProfileButton && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFollowingClick(item.creator_id)}
                        className="shrink-0"
                      >
                        Ver Perfil
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};