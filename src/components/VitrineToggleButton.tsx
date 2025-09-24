import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface VitrineToggleButtonProps {
  onToggle?: (isVisible: boolean) => void;
  className?: string;
}

export const VitrineToggleButton: React.FC<VitrineToggleButtonProps> = ({
  onToggle,
  className = ""
}) => {
  const [showVitrine, setShowVitrine] = useState(true);

  const handleToggle = () => {
    const newState = !showVitrine;
    console.log(`[VITRINE TOGGLE DEBUG] Alterando estado: ${showVitrine} -> ${newState}`);
    setShowVitrine(newState);
    onToggle?.(newState);

    // Show notification when button is clicked
    toast({
      title: newState ? "Vitrine ativada" : "Vitrine desativada",
      description: newState ? "Vitrine ativada com sucesso" : "Vitrine foi ocultada",
      duration: 3000
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleToggle}
            size="sm"
            variant="ghost"
            className={`h-10 w-10 p-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl ${className}`}
          >
            <Store className={`w-5 h-5 ${showVitrine ? 'text-purple-400' : 'text-white'}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          <p>{showVitrine ? 'Ocultar vitrine' : 'Mostrar vitrine'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};