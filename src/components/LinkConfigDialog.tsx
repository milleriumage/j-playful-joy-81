
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

interface LinkConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    url: string;
  }) => void;
  currentLink?: string;
}

export const LinkConfigDialog = ({
  isOpen,
  onClose,
  onSave,
  currentLink = ""
}: LinkConfigDialogProps) => {
  const [url, setUrl] = useState(currentLink);

  const handleSave = () => {
    if (!url.trim()) {
      toast.error("❌ Insira uma URL válida!");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      toast.error("❌ URL inválida! Use formato: https://exemplo.com");
      return;
    }

    const finalUrl = url.startsWith('http') ? url : `https://${url}`;

    onSave({
      url: finalUrl
    });

    toast.success("🔗 Link configurado com sucesso!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            🔗 Configurar Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <Label htmlFor="url">URL do Link</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://meusite.com"
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Link2 className="w-4 h-4 mr-2" />
              Salvar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
