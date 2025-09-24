import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Link2, Check, Share } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
interface UserLinkDisplayProps {
  creatorId?: string;
  className?: string;
}
export const UserLinkDisplay: React.FC<UserLinkDisplayProps> = ({
  creatorId,
  className = ""
}) => {
  const [copied, setCopied] = useState(false);
  const {
    user
  } = useGoogleAuth();

  // Se não foi passado um creatorId específico, usa o ID do usuário logado
  const actualCreatorId = creatorId || user?.id || "default";

  // Gera o link para usuários baseado no ID do criador
  const userLink = `${window.location.origin}/user/${actualCreatorId}`;
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userLink);
      setCopied(true);
      toast.success(`🔗 Link da sua página copiado! Compartilhe: ${userLink}`);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      toast.error("❌ Erro ao copiar link");
    }
  };
  return <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            
          </TooltipTrigger>
          
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            
          </TooltipTrigger>
          <TooltipContent>
            <p>Abrir sua página em nova aba</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>;
};