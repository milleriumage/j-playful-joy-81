import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Star, CreditCard, User, AlertCircle } from "lucide-react";
import { WishlistItem } from "@/hooks/useWishlist";

interface GiftConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WishlistItem | null;
  userCredits: number;
  onConfirm: () => void;
  isLoggedIn: boolean;
}

export function GiftConfirmationDialog({ 
  open, 
  onOpenChange, 
  item, 
  userCredits, 
  onConfirm, 
  isLoggedIn 
}: GiftConfirmationDialogProps) {
  if (!item) return null;

  const currentCredits = Number(userCredits);
  const itemCredits = Number(item.credits);
  
  console.log(`[GIFT CONFIRMATION DEBUG] Créditos - Atual: ${currentCredits} (${typeof currentCredits}), Necessário: ${itemCredits} (${typeof itemCredits})`);
  
  const hasEnoughCredits = currentCredits >= itemCredits;
  const needsLogin = !isLoggedIn;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="w-6 h-6 text-primary" />
            🎁 Confirmar Presente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-full px-2 py-1">
                      <span className="text-sm font-semibold text-primary">
                        �� {item.credits} créditos
                      </span>
                    </div>
                    {item.is_favorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Status */}
          <div className="space-y-2">
            {needsLogin ? (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <User className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Login necessário</p>
                  <p className="text-sm text-yellow-700">Faça login para presentear</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Seus créditos: {userCredits}</p>
                  <p className="text-sm text-blue-700">
                    {hasEnoughCredits ? 'Créditos suficientes!' : 'Créditos insuficientes'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Insufficient Credits Warning */}
          {isLoggedIn && !hasEnoughCredits && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Créditos insuficientes</p>
                <p className="text-sm text-red-700">
                  Você precisa de {itemCredits - currentCredits} créditos a mais
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          
          {needsLogin ? (
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-primary to-accent">
              Fazer Login Primeiro
            </Button>
          ) : !hasEnoughCredits ? (
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-primary to-accent">
              Créditos Insuficientes
            </Button>
          ) : (
            <Button onClick={onConfirm} className="bg-gradient-to-r from-primary to-accent">
              🎁 Presentear
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
