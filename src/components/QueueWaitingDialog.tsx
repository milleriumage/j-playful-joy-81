import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Users, UserX } from "lucide-react";

interface QueueWaitingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: number;
  timeRemaining: number;
  onLeaveQueue: () => void;
}

export const QueueWaitingDialog: React.FC<QueueWaitingDialogProps> = ({
  open,
  onOpenChange,
  position,
  timeRemaining,
  onLeaveQueue
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Clock className="w-5 h-5" />
            Sala em Uso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">Aguarde sua vez</h3>
                <p className="text-sm text-muted-foreground">
                  A sala está ocupada no momento
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo estimado de espera
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  #{position}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sua posição na fila
                </p>
              </div>
            </div>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            Você será notificado quando a sala estiver disponível
          </div>
          
          <Button
            onClick={onLeaveQueue}
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <UserX className="w-4 h-4 mr-2" />
            Sair da Fila
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};