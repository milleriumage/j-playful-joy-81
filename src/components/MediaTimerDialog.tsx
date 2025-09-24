
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface MediaTimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTimer: (config: {
    minutes: number;
    seconds: number;
    audioFile?: File;
    alertSeconds?: number;
    alertMessage?: string;
  }) => void;
  onResetTimer: () => void;
  mediaId: string;
  currentTimer?: {
    minutes: number;
    seconds: number;
    remainingSeconds: number;
    isActive: boolean;
  };
}

export const MediaTimerDialog = ({
  isOpen,
  onClose,
  onSetTimer,
  onResetTimer,
  mediaId,
  currentTimer
}: MediaTimerDialogProps) => {
  const [minutes, setMinutes] = useState(currentTimer?.minutes || 5);
  const [seconds, setSeconds] = useState(currentTimer?.seconds || 0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [alertSeconds, setAlertSeconds] = useState<number>(30);
  const [alertMessage, setAlertMessage] = useState("⚠️ Atenção! A mídia será removida em breve!");

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        toast.success("🔊 Áudio de alerta carregado!");
      } else {
        toast.error("❌ Por favor, selecione um arquivo de áudio válido!");
      }
    }
  };

  const handleSetTimer = () => {
    if (minutes === 0 && seconds === 0) {
      toast.error("❌ Defina um tempo válido!");
      return;
    }

    onSetTimer({
      minutes,
      seconds,
      audioFile: audioFile || undefined,
      alertSeconds: alertSeconds > 0 ? alertSeconds : undefined,
      alertMessage: alertMessage.trim() || undefined
    });

    toast.success(`⏰ Cronômetro definido para ${minutes}:${seconds.toString().padStart(2, '0')}!`);
    onClose();
  };

  const handleResetTimer = () => {
    onResetTimer();
    toast.success("🔄 Cronômetro resetado!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            ⏰ Configurar Cronômetro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Timer Status */}
          {currentTimer && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Status: {currentTimer.isActive ? "🟢 Ativo" : "⏸️ Pausado"}
              </p>
              <p className="text-sm text-blue-600">
                Tempo restante: {Math.floor(currentTimer.remainingSeconds / 60)}:{(currentTimer.remainingSeconds % 60).toString().padStart(2, '0')}
              </p>
            </div>
          )}

          {/* Time Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minutes">Minutos</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="60"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="seconds">Segundos</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Audio Alert */}
          <div>
            <Label htmlFor="audio">🔊 Áudio de Alerta (opcional)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="flex-1"
              />
              {audioFile && (
                <span className="text-sm text-green-600">✅ {audioFile.name}</span>
              )}
            </div>
          </div>

          {/* Alert Timing */}
          <div>
            <Label htmlFor="alertSeconds">🔔 Tocar alerta quantos segundos antes?</Label>
            <Input
              id="alertSeconds"
              type="number"
              min="1"
              max="300"
              value={alertSeconds}
              onChange={(e) => setAlertSeconds(parseInt(e.target.value) || 30)}
            />
          </div>

          {/* Alert Message */}
          <div>
            <Label htmlFor="alertMessage">💬 Mensagem de Alerta</Label>
            <Input
              id="alertMessage"
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              placeholder="Ex: Atenção! A mídia vai sumir!"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSetTimer} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Timer className="w-4 h-4 mr-2" />
              Definir Cronômetro
            </Button>
            
            {currentTimer && (
              <Button 
                onClick={handleResetTimer} 
                variant="outline"
                className="px-3"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
