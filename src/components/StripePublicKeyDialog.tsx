import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Check, X } from "lucide-react";

interface StripePublicKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StripePublicKeyDialog({ open, onOpenChange }: StripePublicKeyDialogProps) {
  const [publicKey, setPublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentKey, setCurrentKey] = useState('');

  useEffect(() => {
    // Load current key from localStorage if exists
    const storedKey = localStorage.getItem('stripe_public_key');
    if (storedKey) {
      setCurrentKey(storedKey);
    }
  }, [open]);

  const handleSave = async () => {
    if (!publicKey.startsWith('pk_')) {
      toast.error('Chave pública inválida. Deve começar com "pk_"');
      return;
    }

    setIsLoading(true);
    try {
      // Save to localStorage for frontend use
      localStorage.setItem('stripe_public_key', publicKey);
      setCurrentKey(publicKey);
      toast.success('Chave pública do Stripe salva com sucesso!');
      setPublicKey('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving Stripe public key:', error);
      toast.error('Erro ao salvar chave pública');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurar Chave Pública do Stripe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentKey && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm font-medium mb-1">Chave atual configurada:</p>
              <code className="text-xs text-muted-foreground break-all">
                {currentKey.substring(0, 20)}...{currentKey.substring(currentKey.length - 10)}
              </code>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="public-key">
              Nova Chave Pública do Stripe
            </Label>
            <Input
              id="public-key"
              type="text"
              placeholder="pk_live_... ou pk_test_..."
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Encontre sua chave pública no{' '}
              <a 
                href="https://dashboard.stripe.com/apikeys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Dashboard do Stripe
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!publicKey || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : 'Salvar Chave'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}