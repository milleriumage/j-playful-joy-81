import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star, StarOff, Gift, Upload, Trash2, LayoutGrid, List, Maximize2, Minimize2, Square, Eye, Sparkles, Palette, CheckCircle, Circle, ArrowUp, ArrowDown, Link, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { AddCreditsDialog } from "./AddCreditsDialog";
import { ItemDetailDialog } from "./ItemDetailDialog";
import { GiftViewDialog } from "./GiftViewDialog";
interface WishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function WishlistDialog({
  open,
  onOpenChange
}: WishlistDialogProps) {
  const {
    wishlistItems,
    preferences,
    toggleFavorite,
    toggleCompleted,
    removeWishlistItem,
    addWishlistItem,
    updatePreferences
  } = useWishlist();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showGiftView, setShowGiftView] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [disableGiftButtonPulse, setDisableGiftButtonPulse] = useState(false);
  const [disableItemAnimations, setDisableItemAnimations] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof wishlistItems[0] | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    credits: 0,
    image: '',
    objFile: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isFavorite: false,
    externalLink: '',
    livePixLink: '',
    value: 0,
    currency: 'USD' as 'USD' | 'BRL'
  });
  
  const [linkType, setLinkType] = useState<'external' | 'livepix'>('external');
  const [showLivePixPreview, setShowLivePixPreview] = useState(false);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.obj') || fileName.endsWith('.gltf') || fileName.endsWith('.usdz')) {
          setNewItem(prev => ({
            ...prev,
            objFile: e.target?.result as string
          }));
        } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          setNewItem(prev => ({
            ...prev,
            image: e.target?.result as string
          }));
        } else {
          toast.error("Formato não suportado. Use JPG, PNG, GIF, WEBP, OBJ, GLTF ou USDZ");
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleItemClick = (item: typeof wishlistItems[0]) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };
  const getSizeClasses = () => {
    switch (preferences.item_size) {
      case 'small':
        return 'grid-cols-2 md:grid-cols-4 gap-3';
      case 'medium':
        return 'grid-cols-1 md:grid-cols-2 gap-6';
      case 'large':
        return 'grid-cols-1 gap-8';
      default:
        return 'grid-cols-1 md:grid-cols-2 gap-6';
    }
  };
  const getImageSizeClasses = () => {
    switch (preferences.item_size) {
      case 'small':
        return 'h-24';
      case 'medium':
        return 'h-48';
      case 'large':
        return 'h-64';
      default:
        return 'h-48';
    }
  };
  const getGlassmorphismClasses = () => {
    const baseClasses = "backdrop-blur-xl border";
    switch (preferences.glassmorphism_intensity) {
      case 'low':
        return `${baseClasses} bg-background/80 border-border/30`;
      case 'medium':
        return `${baseClasses} bg-background/60 border-border/40`;
      case 'high':
        return `${baseClasses} bg-background/40 border-border/50`;
      default:
        return `${baseClasses} bg-background/60 border-border/40`;
    }
  };
  const getBackgroundStyle = () => {
    if (preferences.background_color === 'default') {
      return 'bg-gradient-to-br from-background via-card to-secondary/30';
    }
    return `bg-gradient-to-br ${preferences.background_color}`;
  };
  const handleSaveItem = () => {
    if (!newItem.name || newItem.credits <= 0) {
      toast.error("Preencha nome e créditos válidos");
      return;
    }
    const fileType = newItem.objFile ? newItem.objFile.includes('gltf') ? 'gltf' : newItem.objFile.includes('usdz') ? 'usdz' : 'obj' : undefined;
    addWishlistItem({
      name: newItem.name,
      credits: newItem.credits,
      image_url: newItem.image,
      model_file_url: newItem.objFile,
      model_file_type: fileType,
      description: newItem.description,
      is_favorite: newItem.isFavorite,
      is_completed: false,
      priority: newItem.priority,
      external_link: newItem.externalLink || undefined
    });
    setNewItem({
      name: '',
      credits: 0,
      image: '',
      objFile: '',
      description: '',
      priority: 'medium',
      isFavorite: false,
      externalLink: '',
      livePixLink: '',
      value: 0,
      currency: 'USD'
    });
    setLinkType('external');
    setShowLivePixPreview(false);
    setShowAddForm(false);
  };
  return <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`max-w-4xl max-h-[85vh] overflow-y-auto ${getBackgroundStyle()} ${getGlassmorphismClasses()} shadow-2xl`}>
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              Minha Wishlist Especial
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!showAddForm && <div className="flex flex-wrap gap-3">
                <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 border-primary/30 transition-all duration-300 hover:scale-105">
                  <Plus className="w-4 h-4" />
                </Button>
                
                <Button onClick={() => updatePreferences({
              view_mode: preferences.view_mode === 'grid' ? 'list' : 'grid'
            })} variant="outline" size="sm" className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                  {preferences.view_mode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>

                <Button onClick={() => updatePreferences({
              item_size: preferences.item_size === 'small' ? 'medium' : preferences.item_size === 'medium' ? 'large' : 'small'
            })} variant="outline" size="sm" className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                  {preferences.item_size === 'small' && <Minimize2 className="w-4 h-4" />}
                  {preferences.item_size === 'medium' && <Square className="w-4 h-4" />}
                  {preferences.item_size === 'large' && <Maximize2 className="w-4 h-4" />}
                </Button>

                <Button onClick={() => setShowCustomization(true)} variant="outline" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-secondary/20 to-accent/20 hover:from-secondary/30 hover:to-accent/30 border-secondary/30 transition-all duration-300 hover:scale-105">
                  <Palette className="w-4 h-4" />
                </Button>

                <Button onClick={() => setShowGiftView(true)} variant="outline" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-accent/20 to-primary/20 hover:from-accent/30 hover:to-primary/30 border-accent/30 transition-all duration-300 hover:scale-105">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>}

            {showAddForm && <Card className="border-2 border-dashed border-primary/40 bg-gradient-to-br from-card via-secondary/20 to-accent/10 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    
                    <div className="flex items-center gap-6">
                      <input id="item-image" type="file" accept="image/*,.obj,.gltf,.usdz" onChange={handleImageUpload} className="hidden" />
                      <Button variant="outline" onClick={() => document.getElementById('item-image')?.click()} className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
                        <Upload className="w-5 h-5" />
                        Escolher Arquivo
                      </Button>
                      {(newItem.image || newItem.objFile) && <div className="relative group">
                          {newItem.objFile ? <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border-2 border-primary/30 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-primary animate-spin" />
                            </div> : <img src={newItem.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl shadow-lg border-2 border-border/30 transition-transform duration-300 group-hover:scale-105" />}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="item-name" className="text-base font-semibold text-foreground">
                      Nome do Produto
                    </Label>
                    <Input id="item-name" value={newItem.name} onChange={e => setNewItem(prev => ({
                  ...prev,
                  name: e.target.value
                }))} placeholder="Ex: Curso de Marketing Digital" className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300 text-lg" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="item-credits" className="text-base font-semibold text-foreground">
                      Créditos Necessários
                    </Label>
                    <Input id="item-credits" type="number" min="1" value={newItem.credits || ''} onChange={e => setNewItem(prev => ({
                  ...prev,
                  credits: parseInt(e.target.value) || 0
                }))} placeholder="Ex: 50" className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300 text-lg" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground">
                        Prioridade
                      </Label>
                      <Select value={newItem.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewItem(prev => ({
                    ...prev,
                    priority: value
                  }))}>
                        <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🔵 Baixa</SelectItem>
                          <SelectItem value="medium">🟡 Média</SelectItem>
                          <SelectItem value="high">🔴 Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground">
                        Valor Desejado
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          value={newItem.value || ''} 
                          onChange={e => setNewItem(prev => ({
                            ...prev,
                            value: parseFloat(e.target.value) || 0
                          }))} 
                          placeholder="0.00" 
                          className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300" 
                        />
                        <Select value={newItem.currency} onValueChange={(value: 'USD' | 'BRL') => setNewItem(prev => ({
                          ...prev,
                          currency: value
                        }))}>
                          <SelectTrigger className="w-20 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="BRL">BRL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Link Type Toggle */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">
                      Tipo de Link
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant={linkType === 'external' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => setLinkType('external')}
                        className="flex items-center gap-2"
                      >
                        <Link className="w-4 h-4" />
                        Link Externo
                      </Button>
                      <Button 
                        variant={linkType === 'livepix' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          setLinkType('livepix');
                          setShowLivePixPreview(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        LivePix
                      </Button>
                    </div>
                  </div>

                  {/* LivePix Field */}
                  {linkType === 'livepix' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="livepix-link" className="text-base font-semibold text-foreground">
                          Link do LivePix
                        </Label>
                        {newItem.livePixLink && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowLivePixPreview(!showLivePixPreview)}
                            className="text-xs"
                          >
                            {showLivePixPreview ? 'Ocultar' : 'Preview'}
                          </Button>
                        )}
                      </div>
                      <Input 
                        id="livepix-link" 
                        value={newItem.livePixLink} 
                        onChange={e => setNewItem(prev => ({
                          ...prev,
                          livePixLink: e.target.value
                        }))} 
                        placeholder="https://livepix.gg/..." 
                        className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300" 
                      />
                      
                      {/* LivePix Preview */}
                      {showLivePixPreview && newItem.livePixLink && (
                        <Card className="border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">Preview do LivePix</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {newItem.livePixLink}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* External Link Field */}
                  {linkType === 'external' && (
                    <div className="space-y-3">
                      <Label htmlFor="item-link" className="text-base font-semibold text-foreground">
                        Link Externo (opcional)
                      </Label>
                      <Input id="item-link" value={newItem.externalLink} onChange={e => setNewItem(prev => ({
                    ...prev,
                    externalLink: e.target.value
                  }))} placeholder="https://..." className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="item-description" className="text-base font-semibold text-foreground">
                      Por que você quer este item?
                    </Label>
                    <Textarea id="item-description" value={newItem.description} onChange={e => setNewItem(prev => ({
                  ...prev,
                  description: e.target.value
                }))} placeholder="Ex: Sempre sonhei em ter isso porque..." className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300 text-lg min-h-[100px]" />
                  </div>

                  <div className="flex items-center justify-center">
                    <Button variant="ghost" onClick={() => setNewItem(prev => ({
                  ...prev,
                  isFavorite: !prev.isFavorite
                }))} className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl px-6 py-3 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                      {newItem.isFavorite ? <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 animate-pulse" /> : <StarOff className="w-5 h-5 text-muted-foreground" />}
                      <span className="font-medium">
                        {newItem.isFavorite ? 'Produto Favorito ⭐' : 'Marcar como Favorito'}
                      </span>
                    </Button>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSaveItem} className="flex-1 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-success-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-lg py-6">
                      💫 Salvar na Wishlist
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 hover:scale-[1.02] text-lg py-6">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>}

            {wishlistItems.length > 0 && <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    💎 Meus Desejos ({wishlistItems.length})
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Favoritos: {wishlistItems.filter(item => item.is_favorite).length}</span>
                  </div>
                </div>
                
                <div className={preferences.view_mode === 'grid' ? `grid ${getSizeClasses()}` : "grid gap-4"}>
                  {wishlistItems.map(item => <Card key={item.id} className={`group overflow-hidden ${getGlassmorphismClasses()} shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-primary/30 cursor-pointer ${item.is_completed ? 'opacity-60' : ''} ${!disableItemAnimations ? 'hover:scale-[1.02] animate-float' : ''}`} onClick={() => handleItemClick(item)} style={!disableItemAnimations ? {
                animationDelay: `${Math.random() * 2}s`
              } : {}}>
                      <CardContent className={preferences.item_size === 'small' ? "p-3" : "p-6"}>
                        <div className={preferences.view_mode === 'grid' ? "space-y-4" : "flex items-center gap-6"}>
                          {/* Priority indicator */}
                          <div className="absolute top-2 left-2 z-10">
                            {item.priority === 'high' && <ArrowUp className="w-4 h-4 text-red-500" />}
                            {item.priority === 'low' && <ArrowDown className="w-4 h-4 text-blue-500" />}
                          </div>
                          
                          {/* Completed indicator */}
                          {item.is_completed && <div className="absolute top-2 right-2 z-10">
                              <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                            </div>}
                          
                          {(item.image_url || item.model_file_url) && <div className="relative overflow-hidden rounded-xl">
                              {item.model_file_url ? <div className={`${preferences.view_mode === 'grid' ? `w-full ${getImageSizeClasses()}` : "w-20 h-20"} bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border border-primary/30 animate-pulse`}>
                                  <Sparkles className="w-8 h-8 text-primary animate-spin" />
                                  <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1 rounded">
                                    {item.model_file_type?.toUpperCase()}
                                  </span>
                                </div> : <img src={item.image_url} alt={item.name} className={`${preferences.view_mode === 'grid' ? `w-full ${getImageSizeClasses()}` : "w-20 h-20"} object-cover transition-transform duration-500 group-hover:scale-110 animate-pulse-glow`} />}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              {item.is_favorite && <div className="absolute top-3 right-3 animate-bounce">
                                  <div className="bg-yellow-400/90 backdrop-blur-sm rounded-full p-2">
                                    <Star className="w-4 h-4 fill-yellow-600 text-yellow-600 animate-spin" />
                                  </div>
                                </div>}
                            </div>}
                          
                          <div className={preferences.view_mode === 'grid' ? "space-y-3" : "flex-1 space-y-2"}>
                            <h4 className={`font-bold text-foreground ${preferences.view_mode === 'grid' ? preferences.item_size === 'small' ? "text-sm" : preferences.item_size === 'medium' ? "text-lg" : "text-xl" : "text-base"} ${item.is_completed ? 'line-through' : ''}`}>
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className="bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full px-3 py-1 border border-primary/30 animate-pulse">
                                <p className={`font-semibold text-primary ${preferences.item_size === 'small' ? "text-xs" : "text-sm"}`}>
                                  💰 {item.credits} créditos
                                </p>
                              </div>
                              {item.external_link && <Link className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            {item.description && preferences.item_size !== 'small' && <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>}
                          </div>

                          <div className={preferences.view_mode === 'grid' ? "flex items-center justify-between pt-2" : "flex flex-col items-center gap-2"}>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }} className="hover:bg-yellow-400/20 transition-all duration-300 hover:scale-110">
                                {item.is_favorite ? <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 animate-pulse" /> : <StarOff className="w-5 h-5 text-muted-foreground hover:text-yellow-400" />}
                              </Button>
                              
                              <Button variant="ghost" size="sm" onClick={e => {
                          e.stopPropagation();
                          toggleCompleted(item.id);
                        }} className="hover:bg-green-400/20 transition-all duration-300 hover:scale-110">
                                {item.is_completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground hover:text-green-400" />}
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                               <Button variant="outline" size="sm" onClick={e => {
                          e.stopPropagation();
                          if (item.external_link) {
                            window.open(item.external_link, '_blank');
                          } else {
                            setShowCreditsDialog(true);
                          }
                        }} className={`flex items-center gap-2 bg-gradient-to-r from-success/20 to-success/10 border-success/30 hover:from-success/30 hover:to-success/20 text-success hover:text-success transition-all duration-300 hover:scale-105 ${!disableGiftButtonPulse ? 'animate-pulse' : ''}`}>
                                 <Gift className="w-4 h-4" />
                                 {preferences.view_mode === 'grid' ? '🎁' : item.external_link ? 'Visitar' : 'Presentear'}
                               </Button>

                              <Button variant="ghost" size="sm" onClick={e => {
                          e.stopPropagation();
                          removeWishlistItem(item.id);
                        }} className="text-destructive hover:text-destructive hover:bg-destructive/20 transition-all duration-300 hover:scale-105">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
              </div>}

            {wishlistItems.length === 0 && !showAddForm && <div className="text-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30 animate-pulse">
                    <Gift className="w-16 h-16 text-primary animate-float" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ✨ Seus desejos aguardam!
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Crie sua lista de sonhos e compartilhe com quem você ama. 
                    Cada item adicionado é um passo mais perto da realização! 💫
                  </p>
                </div>

                <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg px-8 py-3">
                  🌟 Começar a Sonhar
                </Button>
              </div>}
          </div>
        </DialogContent>
      </Dialog>

      <AddCreditsDialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog} />

      <ItemDetailDialog item={selectedItem} open={showItemDetail} onOpenChange={setShowItemDetail} onGift={() => setShowCreditsDialog(true)} />

       <GiftViewDialog items={wishlistItems} open={showGiftView} onOpenChange={setShowGiftView} onItemClick={handleItemClick} disableAnimations={disableItemAnimations} />

      {/* Customization Dialog */}
      <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Personalização
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Paletas Globais de Tema
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {[{
                id: 'purple-low',
                gradient: 'from-purple-500/20 via-pink-500/20 to-red-500/20',
                intensity: 'low',
                name: '🟣 Roxo Suave'
              }, {
                id: 'purple-med',
                gradient: 'from-purple-500/20 via-pink-500/20 to-red-500/20',
                intensity: 'medium',
                name: '🟣 Roxo Médio'
              }, {
                id: 'purple-high',
                gradient: 'from-purple-500/20 via-pink-500/20 to-red-500/20',
                intensity: 'high',
                name: '🟣 Roxo Intenso'
              }, {
                id: 'blue-low',
                gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
                intensity: 'low',
                name: '🔵 Azul Suave'
              }, {
                id: 'blue-med',
                gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
                intensity: 'medium',
                name: '🔵 Azul Médio'
              }, {
                id: 'blue-high',
                gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
                intensity: 'high',
                name: '🔵 Azul Intenso'
              }, {
                id: 'green-low',
                gradient: 'from-green-500/20 via-emerald-500/20 to-lime-500/20',
                intensity: 'low',
                name: '🟢 Verde Suave'
              }, {
                id: 'green-med',
                gradient: 'from-green-500/20 via-emerald-500/20 to-lime-500/20',
                intensity: 'medium',
                name: '🟢 Verde Médio'
              }, {
                id: 'green-high',
                gradient: 'from-green-500/20 via-emerald-500/20 to-lime-500/20',
                intensity: 'high',
                name: '🟢 Verde Intenso'
              }, {
                id: 'warm-low',
                gradient: 'from-orange-500/20 via-red-500/20 to-pink-500/20',
                intensity: 'low',
                name: '🔥 Quente Suave'
              }, {
                id: 'warm-med',
                gradient: 'from-orange-500/20 via-red-500/20 to-pink-500/20',
                intensity: 'medium',
                name: '🔥 Quente Médio'
              }, {
                id: 'warm-high',
                gradient: 'from-orange-500/20 via-red-500/20 to-pink-500/20',
                intensity: 'high',
                name: '🔥 Quente Intenso'
              }, {
                id: 'sunset-low',
                gradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
                intensity: 'low',
                name: '🌅 Pôr do Sol Suave'
              }, {
                id: 'sunset-med',
                gradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
                intensity: 'medium',
                name: '🌅 Pôr do Sol Médio'
              }, {
                id: 'sunset-high',
                gradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
                intensity: 'high',
                name: '🌅 Pôr do Sol Intenso'
              }].map(theme => <Button key={theme.id} variant={preferences.background_color === theme.gradient && preferences.glassmorphism_intensity === theme.intensity ? "default" : "outline"} size="sm" onClick={() => updatePreferences({
                background_color: theme.gradient,
                glassmorphism_intensity: theme.intensity as 'low' | 'medium' | 'high'
              })} className={`flex flex-col items-center justify-center h-20 p-2 bg-gradient-to-br ${theme.gradient} backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-xs font-medium ${preferences.background_color === theme.gradient && preferences.glassmorphism_intensity === theme.intensity ? 'border-primary/50 shadow-lg' : 'border-border/30 hover:border-primary/30'}`}>
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.gradient} border-2 border-white/30 mb-1`} />
                    <span className="text-center leading-tight">{theme.name}</span>
                  </Button>)}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Toggles de Animação</Label>
              <div className="space-y-3">
                
                
                
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Configuração Manual</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Cor de Fundo</Label>
                  <Select value={preferences.background_color} onValueChange={value => updatePreferences({
                  background_color: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="from-purple-500/20 via-pink-500/20 to-red-500/20">Gradient Roxo</SelectItem>
                      <SelectItem value="from-blue-500/20 via-cyan-500/20 to-teal-500/20">Gradient Azul</SelectItem>
                      <SelectItem value="from-green-500/20 via-emerald-500/20 to-lime-500/20">Gradient Verde</SelectItem>
                      <SelectItem value="from-orange-500/20 via-red-500/20 to-pink-500/20">Gradient Quente</SelectItem>
                      <SelectItem value="from-yellow-500/20 via-orange-500/20 to-red-500/20">Gradient Pôr do Sol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Intensidade do Glassmorphism</Label>
                  <Select value={preferences.glassmorphism_intensity} onValueChange={(value: 'low' | 'medium' | 'high') => updatePreferences({
                  glassmorphism_intensity: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixo</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowCustomization(false)} className="flex-1">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>;
}