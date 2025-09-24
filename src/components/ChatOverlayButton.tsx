import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { ChatOverlay } from './ChatOverlay';
interface ChatOverlayButtonProps {
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  creatorId?: string;
  passwordProtected?: boolean;
  onPasswordVerify?: (callback: () => void) => void;
  onTrialCheck?: () => boolean;
  onSubtractCredits?: (amount: number, action?: string) => void;
  credits?: number;
  isLoggedIn?: boolean;
  visibilitySettings?: {
    showChatEditing?: boolean;
    showChatCloseIcon?: boolean;
  };
}
export const ChatOverlayButton: React.FC<ChatOverlayButtonProps> = ({
  onToggle,
  className = "",
  creatorId,
  passwordProtected = false,
  onPasswordVerify,
  onTrialCheck,
  onSubtractCredits,
  credits = 0,
  isLoggedIn = false,
  visibilitySettings
}) => {
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  const handleToggle = () => {
    const newState = !showChatOverlay;
    console.log(`[CHAT OVERLAY DEBUG] Alterando estado: ${showChatOverlay} -> ${newState}`);
    setShowChatOverlay(newState);
    onToggle?.(newState);

    // Show notification when button is clicked
    toast({
      title: newState ? "Chat overlay ativado" : "Chat overlay desativado",
      description: newState ? "Chat overlay ativado com sucesso" : "Chat overlay foi fechado",
      duration: 3000
    });
  };
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggle}
              size="sm"
              variant="ghost"
              className={`h-10 w-10 p-0 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl ${className}`}
            >
              <MessageCircle className={`w-5 h-5 ${showChatOverlay ? 'text-blue-400' : 'text-white'}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            <p>{showChatOverlay ? 'Fechar chat' : 'Abrir chat'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Chat Overlay - Synchronized with EnhancedChat */}
      {showChatOverlay && (
        <ChatOverlay
          onClose={() => {
            setShowChatOverlay(false);
            onToggle?.(false);
          }}
          creatorId={creatorId}
          passwordProtected={passwordProtected}
          onPasswordVerify={onPasswordVerify}
          onTrialCheck={onTrialCheck}
          onSubtractCredits={onSubtractCredits}
          credits={credits}
          isLoggedIn={isLoggedIn}
          visibilitySettings={visibilitySettings}
        />
      )}
    </>
  );
};