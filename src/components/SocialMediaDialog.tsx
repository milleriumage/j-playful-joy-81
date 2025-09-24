
import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SocialNetwork {
  id: string;
  name: string;
  defaultIcon: string;
  customIcon?: string;
  url?: string;
}

interface SocialMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  network: SocialNetwork | null;
  onSave: (updates: Partial<SocialNetwork>) => void;
  onDelete?: (id: string) => void;
}

export const SocialMediaDialog = ({ isOpen, onClose, network, onSave, onDelete }: SocialMediaDialogProps) => {
  const [url, setUrl] = useState(network?.url || '');
  const [customIcon, setCustomIcon] = useState(network?.customIcon || '');
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (network) {
      setUrl(network.url || '');
      setCustomIcon(network.customIcon || '');
      setImageLoading(false);
    } else {
      setImageLoading(false);
    }
  }, [network]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomIcon(result);
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleSave = () => {
    const updates = {
      url: url.trim(),
      customIcon: customIcon || undefined
    };
    
    // If adding new network, include name
    if (!network) {
      (updates as any).name = 'Custom Network';
    }
    
    onSave(updates);
  };

  const handleDelete = () => {
    if (network && onDelete) {
      onDelete(network.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{network ? `Editar ${network.name}` : 'Adicionar Nova Rede Social'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden relative">
              {imageLoading ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : (
                <img
                  src={customIcon || network?.defaultIcon || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2Njk5ZmYiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPis8L3RleHQ+Cjwvc3ZnPg=='}
                  alt={network?.name || 'Nova rede social'}
                  className="w-full h-full object-cover transition-opacity duration-200"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ícone personalizado</Label>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload novo ícone
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL da rede social</Label>
            <Input
              id="url"
              type="url"
              placeholder={network ? `https://${network.name.toLowerCase()}.com/seu-perfil` : 'https://exemplo.com/seu-perfil'}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-between">
            <div>
              {network && onDelete && (
                <Button variant="outline" onClick={handleDelete} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
