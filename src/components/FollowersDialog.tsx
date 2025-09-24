import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Follower } from '@/hooks/useFollowers';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followers: Follower[];
  isLoading: boolean;
  followersCount: number;
}

export const FollowersDialog: React.FC<FollowersDialogProps> = ({
  open,
  onOpenChange,
  followers,
  isLoading,
  followersCount
}) => {
  const navigate = useNavigate();
  const { user, isGuest } = useOptimizedAuth();

  const handleFollowerClick = (followerId: string) => {
    // Fechar dialog e navegar para página do seguidor
    onOpenChange(false);
    navigate(`/user/${followerId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seguidores ({followersCount})
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando seguidores...</p>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum seguidor ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((follower) => {
                // Verificar se é um usuário logado (tem user_id válido de usuário real)
                const isLoggedUser = follower.follower_profile?.user_id && 
                  follower.follower_profile.user_id.length === 36 && // UUID válido
                  !follower.follower_profile.user_id.startsWith('guest_');
                
                // Verificar se o perfil é privado (por enquanto assumindo que não há essa configuração ainda)
                const isPrivateProfile = false; // TODO: Implementar verificação de perfil privado
                
                // Mostrar botão "Ver Perfil" apenas se:
                // 1. O visualizador está logado (!isGuest && user)
                // 2. O seguidor é um usuário logado (isLoggedUser)
                // 3. O perfil não é privado (!isPrivateProfile)
                const showViewProfileButton = !isGuest && user && isLoggedUser && !isPrivateProfile;

                return (
                  <div
                    key={follower.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-muted/50"
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage 
                        src={follower.follower_profile?.avatar_url || undefined} 
                        alt={follower.follower_profile?.display_name || 'Usuário'} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                        {(follower.follower_profile?.display_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base truncate">
                          {follower.follower_profile?.display_name || 'Usuário'}
                        </p>
                        {!isLoggedUser && (
                          <span className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
                            Visitante
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Seguindo desde {new Date(follower.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        ID: {follower.follower_id.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Só mostra botão Ver Perfil conforme as condições */}
                    {showViewProfileButton && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFollowerClick(follower.follower_id)}
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