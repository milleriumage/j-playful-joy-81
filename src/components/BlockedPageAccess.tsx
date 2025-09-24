import React, { useEffect, useState } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowLeft } from 'lucide-react';

interface BlockedPageAccessProps {
  creatorId: string;
  children: React.ReactNode;
}

export const BlockedPageAccess: React.FC<BlockedPageAccessProps> = ({
  creatorId,
  children
}) => {
  const { user } = useGoogleAuth();
  const { isUserBlocked } = useBlockedUsers();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!user || !creatorId) {
        setIsLoading(false);
        return;
      }

      // Se é o próprio criador, não está bloqueado
      if (user.id === creatorId) {
        setIsBlocked(false);
        setIsLoading(false);
        return;
      }

      try {
        const blocked = await isUserBlocked(creatorId, user.id);
        setIsBlocked(blocked);
      } catch (error) {
        console.error('Erro ao verificar bloqueio:', error);
        setIsBlocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkBlockStatus();
  }, [user, creatorId, isUserBlocked]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-50">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Página Pausada
            </h1>
            <p className="text-gray-600">
              Aguarde algumas horas. O acesso foi temporariamente suspenso pelo criador desta página.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <Button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate-home'));
              }}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Início
            </Button>
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t">
            O acesso será restaurado automaticamente após o período determinado pelo criador.
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};