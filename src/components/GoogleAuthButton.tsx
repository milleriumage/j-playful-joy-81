import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { AuthDialog } from './AuthDialog';
import { UserFloatingDialog } from './UserFloatingDialog';

interface GoogleAuthButtonProps {
  onLoginSuccess: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onLoginSuccess }) => {
  const { user, signInWithGoogle, signOut, isLoading } = useGoogleAuth();
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);

  // Monitor user state changes to trigger login success callback only on fresh login
  useEffect(() => {
    if (user && !isLoading && justLoggedIn) {
      // Garantir que a interface permaneça consistente
      setTimeout(() => {
        onLoginSuccess();
        setJustLoggedIn(false);
        // Remover force re-render que pode causar inconsistência visual
      }, 300); // Delay reduzido para melhor responsividade
    }
  }, [user, isLoading, onLoginSuccess, justLoggedIn]);

  const handleClick = async () => {
    if (user) {
      // Se usuário está logado, mostrar dialog do usuário
      setShowUserDialog(true);
    } else {
      // Se não está logado, mostrar dialog de autenticação
      setShowAuthDialog(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
    setJustLoggedIn(true);
  };

  return (
    <>
      <Button
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-full p-2 transition-colors"
        title={user ? "Perfil do usuário" : "Login com Google"}
      >
        {user ? (
          // Mostrar avatar do usuário quando logado - mantém ícone consistente
          <div className="w-4 h-4 rounded-full flex items-center justify-center">
            <span className="text-xs">👤</span>
          </div>
        ) : (
          // Mostrar ícone universal quando não logado
          <div className="w-4 h-4 rounded-full flex items-center justify-center">
            <span className="text-xs">🔑</span>
          </div>
        )}
      </Button>

      {/* Dialog de autenticação para login/signup */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Dialog do usuário logado */}
      <UserFloatingDialog
        isOpen={showUserDialog}
        onClose={() => setShowUserDialog(false)}
      />
    </>
  );
};