import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Gift, Sparkles, X, ExternalLink } from "lucide-react";
import { WishlistItem } from "@/hooks/useWishlist";
import { Model3DViewer } from "./Model3DViewer";

interface ItemDetailDialogProps {
  item: WishlistItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGift?: () => void;
}

export function ItemDetailDialog({ item, open, onOpenChange, onGift }: ItemDetailDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open && item) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, item]);

  if (!item) return null;

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/30 backdrop-blur-xl border border-primary/30 shadow-2xl animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1), hsl(var(--secondary) / 0.3))',
          }}
        >
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 animate-pulse">
                  <Sparkles className="w-6 h-6 text-primary animate-spin" />
                </div>
                {item.name}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-full hover:bg-destructive/20 hover:text-destructive transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Item Image/3D Model */}
            {item.image_url && (
              <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-4">
                <div className="relative">
                  {item.model_file_url && item.model_file_type ? (
                    <Model3DViewer 
                      modelUrl={item.model_file_url}
                      fileType={item.model_file_type}
                      className="w-full h-64"
                    />
                  ) : (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-64 object-cover rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-105 animate-pulse-glow"
                    />
                  )}
                  
                  {/* Sparkle Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 right-4 animate-bounce">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  </div>
                  
                  {item.is_favorite && (
                    <div className="absolute top-4 left-4 animate-pulse">
                      <div className="bg-yellow-400/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <Star className="w-5 h-5 fill-yellow-600 text-yellow-600 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Item Description */}
            {item.description && (
              <div className="bg-gradient-to-br from-card via-secondary/20 to-accent/10 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-xl">
                <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  Por que eu quero isso
                </h3>
                <p className="text-foreground leading-relaxed text-lg font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {item.description}
                </p>
              </div>
            )}

            {/* Credits Section */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/30 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-full animate-bounce">
                  <Gift className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse">
                    💰 {item.credits} créditos
                  </p>
                  <p className="text-sm text-muted-foreground">Valor necessário para realizar</p>
                </div>
              </div>
            </div>

            {/* External Link */}
            {item.external_link && (
              <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-4 border border-accent/30 shadow-lg">
                <Button
                  onClick={() => window.open(item.external_link, '_blank', 'noopener,noreferrer')}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-accent/20 to-primary/20 border-accent/40 hover:from-accent/30 hover:to-primary/30 text-accent hover:text-accent transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visitar Link Externo
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={() => {
                  if (item.external_link) {
                    window.open(item.external_link, '_blank', 'noopener,noreferrer');
                  } else {
                    onGift?.();
                  }
                }}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg py-6 animate-pulse"
              >
                <Gift className="w-5 h-5 mr-2 animate-bounce" />
                🎁 {item.external_link ? 'Visitar Link' : 'Presentear Agora'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}