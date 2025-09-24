import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGuestData } from '@/hooks/useGuestData';
import { User, Edit3, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface GuestProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Predefined avatars for guests
const guestAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=guest1&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=guest2&backgroundColor=ffd5dc,ffdfba,c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=guest3&backgroundColor=b6e3f4,d1d4f9,ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=guest4&backgroundColor=c0aede,ffdfba,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=guest5&backgroundColor=ffd5dc,b6e3f4,ffdfba',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=guest6&backgroundColor=d1d4f9,c0aede,b6e3f4',
];

export const GuestProfileDialog: React.FC<GuestProfileDialogProps> = ({ isOpen, onClose }) => {
  const { guestData, updateGuestProfile } = useGuestData();
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Sync with guestData when dialog opens or data changes
  React.useEffect(() => {
    setDisplayName(guestData.displayName || '');
    setSelectedAvatar(guestData.avatarUrl || '');
  }, [guestData.displayName, guestData.avatarUrl, isOpen]);

  const handleSave = () => {
    const trimmedName = displayName.trim();
    
    if (trimmedName.length > 20) {
      toast.error('Nome deve ter no máximo 20 caracteres');
      return;
    }

    updateGuestProfile({
      displayName: trimmedName || undefined,
      avatarUrl: selectedAvatar || undefined
    });

    // Notificar app para atualização instantânea
    window.dispatchEvent(new CustomEvent('guest-profile-updated', {
      detail: { displayName: trimmedName || undefined, avatarUrl: selectedAvatar || undefined }
    }));

    setIsEditing(false);
    onClose(); // Fechar o diálogo após salvar
    toast.success('✅ Perfil atualizado!');
  };

  const currentDisplayName = guestData.displayName || `Guest ${guestData.sessionId.slice(-4)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-primary">
            👤 Perfil Guest
          </DialogTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-primary hover:text-primary/80"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={isEditing ? selectedAvatar : guestData.avatarUrl} 
                alt={currentDisplayName}
              />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <Badge variant="outline" className="text-xs">
              👤 Usuário Guest
            </Badge>
          </div>

          {isEditing ? (
            <>
              {/* Edit Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de exibição</Label>
                <Input
                  id="displayName"
                  placeholder="Digite seu nome..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={20}
                  className="text-center"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {displayName.length}/20 caracteres
                </p>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-3">
                <Label>Escolha um avatar</Label>
                <div className="grid grid-cols-3 gap-3">
                  {guestAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        selectedAvatar === avatar 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Avatar className="w-12 h-12 mx-auto">
                        <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(guestData.displayName || '');
                    setSelectedAvatar(guestData.avatarUrl || '');
                  }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Display Mode */}
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold">{currentDisplayName}</h3>
                <p className="text-sm text-muted-foreground">
                  ID da sessão: {guestData.sessionId.slice(-8)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">🎭 Modo Guest</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Personalize seu perfil para ser reconhecido pelos criadores!
                </p>
                <div className="space-y-2">
                  <div className="text-xs bg-background/50 p-2 rounded">
                    ✏️ Nome personalizado
                  </div>
                  <div className="text-xs bg-background/50 p-2 rounded">
                    🎨 Avatar único
                  </div>
                  <div className="text-xs bg-background/50 p-2 rounded">
                    👥 Visível para outros usuários
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};