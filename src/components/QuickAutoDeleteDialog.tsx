import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface QuickAutoDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTimer: (minutes: number) => void;
  mediaName?: string;
}

export const QuickAutoDeleteDialog = ({
  isOpen,
  onClose,
  onStartTimer,
  mediaName
}: QuickAutoDeleteDialogProps) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const quickTimes = [
    { minutes: 1, label: "1 min", color: "bg-red-500" },
    { minutes: 5, label: "5 min", color: "bg-orange-500" },
    { minutes: 10, label: "10 min", color: "bg-yellow-500" },
    { minutes: 15, label: "15 min", color: "bg-blue-500" },
    { minutes: 30, label: "30 min", color: "bg-green-500" },
    { minutes: 60, label: "1 hora", color: "bg-purple-500" }
  ];

  const handleStartTimer = () => {
    if (selectedTime === null) {
      toast.error("❌ Selecione um tempo primeiro!");
      return;
    }

    onStartTimer(selectedTime);
    toast.success(`⏰ Auto-delete ativado para ${selectedTime} minuto(s)!`);
    onClose();
    setSelectedTime(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            ⏱️ Auto Delete Timer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {mediaName ? `Configurar auto-delete para: ${mediaName}` : "A mídia será automaticamente deletada após o tempo selecionado"}
          </div>

          {/* Quick Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            {quickTimes.map((time) => (
              <Button
                key={time.minutes}
                variant={selectedTime === time.minutes ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col items-center gap-2 transition-all duration-200 ${
                  selectedTime === time.minutes 
                    ? `${time.color} text-white shadow-lg scale-105` 
                    : "hover:scale-105"
                }`}
                onClick={() => setSelectedTime(time.minutes)}
              >
                <Timer className="w-5 h-5" />
                <span className="font-semibold">{time.label}</span>
              </Button>
            ))}
          </div>

          {selectedTime && (
            <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">
                  Mídia será deletada em {selectedTime} minuto{selectedTime !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleStartTimer} 
              disabled={selectedTime === null}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <Timer className="w-4 h-4 mr-2" />
              Iniciar Auto-Delete
            </Button>
            
            <Button 
              onClick={() => {
                onClose();
                setSelectedTime(null);
              }}
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};