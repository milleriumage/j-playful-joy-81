import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutoLockCountdown } from "./AutoLockCountdown";
import { usePasswordProtection } from "@/hooks/usePasswordProtection";
import { toast } from "sonner";
import { Timer, Shield } from "lucide-react";

interface AutoLockConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoLockConfigDialog = ({ 
  isOpen, 
  onClose 
}: AutoLockConfigDialogProps) => {
  const { timeRemaining, isTimerActive, setAutoLockTime } = usePasswordProtection();
  const [autoLockTime, setAutoLockTimeLocal] = useState('30');
  const [autoLockUnit, setAutoLockUnit] = useState('minutes');

  const handleSaveTimeOnly = async () => {
    try {
      let timeInMinutes;
      
      if (autoLockUnit === 'hours') {
        timeInMinutes = parseInt(autoLockTime) * 60;
      } else if (autoLockUnit === 'seconds') {
        timeInMinutes = Math.max(1, Math.round(parseInt(autoLockTime) / 60));
      } else {
        timeInMinutes = parseInt(autoLockTime);
      }
      
      await setAutoLockTime(timeInMinutes);
      onClose();
    } catch (error) {
      toast.error(`❌ ${(error as Error).message}`);
    }
  };

  const handleClose = () => {
    setAutoLockTimeLocal('30');
    setAutoLockUnit('minutes');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Timer className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              Configurar Bloqueio Automático
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Defina o tempo para bloqueio automático da sua conta
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Configuração de tempo */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium">⏱️ Bloqueio automático</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max={autoLockUnit === 'hours' ? 24 : autoLockUnit === 'seconds' ? 3600 : 1440}
                value={autoLockTime}
                onChange={(e) => setAutoLockTimeLocal(e.target.value)}
                placeholder="Tempo"
                className="flex-1"
              />
              <Select value={autoLockUnit} onValueChange={setAutoLockUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Segundos</SelectItem>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground">
              Sua conta será bloqueada automaticamente após {autoLockTime} {autoLockUnit === 'hours' ? 'horas' : autoLockUnit === 'minutes' ? 'minutos' : 'segundos'} de inatividade
            </div>
            <AutoLockCountdown timeRemaining={timeRemaining} isActive={isTimerActive} />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTimeOnly}>
              <Shield className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};