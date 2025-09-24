import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Chrome, Clock, Lock } from 'lucide-react';

interface ForcedLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForcedLoginDialog: React.FC<ForcedLoginDialogProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, isLoading } = useGoogleAuth();

  const handleGoogleAuth = async () => {
    await signInWithGoogle();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-red-500" />
            Tempo Esgotado!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground">
              Seu período de teste expirou
            </h3>
            
            <p className="text-sm text-muted-foreground">
              Para continuar usando todas as funcionalidades da plataforma, você precisa fazer login
            </p>
          </div>

          {/* Benefícios do login */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg border">
            <h4 className="font-semibold text-primary mb-3 text-center">
              🎯 Ao fazer login você terá:
            </h4>
            <div className="space-y-2">
              <div className="text-xs bg-background/50 p-2 rounded flex items-center gap-2">
                ✅ Acesso completo sem limitação de tempo
              </div>
              <div className="text-xs bg-background/50 p-2 rounded flex items-center gap-2">
                💬 Chat em tempo real desbloqueado
              </div>
              <div className="text-xs bg-background/50 p-2 rounded flex items-center gap-2">
                🔓 Acesso a conteúdo premium
              </div>
              <div className="text-xs bg-background/50 p-2 rounded flex items-center gap-2">
                📸 Upload de mídia sem limitações
              </div>
            </div>
          </div>

          {/* Botão Google */}
          <Button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-[#db4437] hover:bg-[#c23321] text-white py-3"
          >
            <Chrome className="w-5 h-5 mr-2" />
            {isLoading ? 'Conectando...' : 'Fazer Login com Google'}
          </Button>

          {/* Aviso */}
          <p className="text-xs text-muted-foreground text-center">
            Faça login agora para continuar de onde parou
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};