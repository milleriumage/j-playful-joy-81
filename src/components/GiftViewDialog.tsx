import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Gift, Eye, X, Sparkles } from "lucide-react";
import { GiftConfirmationDialog } from "./GiftConfirmationDialog";
import { WishlistItem } from "@/hooks/useWishlist";

interface GiftViewDialogProps {
  items: WishlistItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemClick?: (item: WishlistItem) => void;
  disableAnimations?: boolean;
  userCredits?: number;
  isLoggedIn?: boolean;
  onGiftItem?: (item: WishlistItem) => void;
}

export function GiftViewDialog({ 
  items, 
  open, 
  onOpenChange, 
  onItemClick, 
  disableAnimations = false, 
  userCredits = 0, 
  isLoggedIn = false, 
  onGiftItem 
}: GiftViewDialogProps) {
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [showGiftConfirmation, setShowGiftConfirmation] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/30 backdrop-blur-xl border border-primary/30 shadow-2xl animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1), hsl(var(--secondary) / 0.3))',
          }}
        >
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 animate-pulse">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                🎁 Galeria de Presentes
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
            {items.length > 0 ? (
              <>
                <div className="text-center space-y-2">
                  <p className="text-lg text-muted-foreground">
                    ✨ Uma coleção especial de {items.length} desejos
                  </p>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Sparkles key={i} className="w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                   <Card 
                     key={item.id} 
                     className={`group overflow-hidden bg-gradient-to-br from-card via-card/90 to-secondary/20 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-primary/30 cursor-pointer ${
                       !disableAnimations ? 'hover:scale-105 animate-float' : ''
                     }`}
                     onClick={() => {
                       // Handle gift logic
                       if (onGiftItem) {
                         setSelectedItem(item);
                         setShowGiftConfirmation(true);
                       } else {
                         // Open external link in new tab if it exists
                         if (item.external_link) {
                           window.open(item.external_link, '_blank', 'noopener,noreferrer');
                         }
                         onItemClick?.(item);
                       }
                     }}
                     style={!disableAnimations ? { animationDelay: `${Math.random() * 2}s` } : {}}
                   >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {item.image_url && (
                            <div className="relative overflow-hidden rounded-xl">
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110 animate-pulse-glow"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              {item.is_favorite && (
                                <div className="absolute top-2 right-2 animate-bounce">
                                  <div className="bg-yellow-400/90 backdrop-blur-sm rounded-full p-2">
                                    <Star className="w-3 h-3 fill-yellow-600 text-yellow-600 animate-spin" />
                                  </div>
                                </div>
                              )}
                              
                              <div className="absolute top-2 left-2 animate-pulse">
                                <Sparkles className="w-4 h-4 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors duration-300">
                              {item.name}
                            </h4>
                            
                            <div className="flex items-center justify-center">
                              <div className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full px-3 py-1 border border-primary/30">
                                <p className="text-xs font-semibold text-primary animate-pulse">
                                  💰 {item.credits} créditos
                                </p>
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors duration-300">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30 animate-pulse">
                    <Gift className="w-16 h-16 text-primary animate-float" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ✨ Nenhum presente ainda
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Quando alguém adicionar itens à wishlist, eles aparecerão aqui como uma galeria especial! 🎁
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Gift Confirmation Dialog */}
      <GiftConfirmationDialog
        open={showGiftConfirmation}
        onOpenChange={setShowGiftConfirmation}
        item={selectedItem}
        userCredits={userCredits}
        isLoggedIn={isLoggedIn}
        onConfirm={() => {
          if (selectedItem && onGiftItem) {
            onGiftItem(selectedItem);
          }
          setShowGiftConfirmation(false);
          setSelectedItem(null);
        }}
      />
    </>
  );
}