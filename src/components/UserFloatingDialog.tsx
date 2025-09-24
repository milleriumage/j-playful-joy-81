import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { toast } from "sonner";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useChatConfiguration } from '@/hooks/useChatConfiguration';

interface UserFloatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserFloatingDialog: React.FC<UserFloatingDialogProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useGoogleAuth();
  const { profileData, updateProfile, saveProfile } = useUserProfile();
  const { config, saveConfig } = useChatConfiguration();
  const [isEditing, setIsEditing] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  
  const predefinedAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=smile", 
    "https://api.dicebear.com/7.x/avataaars/svg?seed=cool",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=fun",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=awesome",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=nice"
  ];

  useEffect(() => {
    if (isOpen && profileData) {
      setEditingDisplayName(profileData.fullName || config.userName || '');
      setSelectedAvatar(profileData.profileImage || config.userAvatar || predefinedAvatars[0]);
    }
  }, [isOpen, profileData, config.userName, config.userAvatar]);

  const handleSaveProfile = async () => {
    try {
      // Salvar no perfil do usuário
      if (editingDisplayName) updateProfile('fullName', editingDisplayName);
      if (selectedAvatar) updateProfile('profileImage', selectedAvatar);
      await saveProfile();
      
      // Sincronizar com as configurações do chat
      await saveConfig({
        userName: editingDisplayName,
        userAvatar: selectedAvatar
      });
      
      setIsEditing(false);
      toast.success('✅ Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao salvar perfil');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={isEditing ? selectedAvatar : (profileData?.profileImage || config.userAvatar || user?.user_metadata?.avatar_url)} 
                alt="User avatar" 
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              {isEditing ? (
                <Input
                  value={editingDisplayName}
                  onChange={(e) => setEditingDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  className="text-center mb-2"
                />
              ) : (
                <h3 className="font-semibold text-gray-800">
                  {profileData?.fullName || config.userName || user?.user_metadata?.full_name || 'Usuário'}
                </h3>
              )}
              <p className="text-sm text-gray-600">{user?.email}</p>
              {user?.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* Edit Avatar Section - Only in edit mode */}
            {isEditing && (
              <div className="w-full space-y-3">
                <Label className="text-sm font-medium">Escolher Avatar:</Label>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-16 h-16 rounded-full border-2 overflow-hidden transition-all ${
                        selectedAvatar === avatar 
                          ? 'border-blue-500 scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Welcome Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🎉 Bem-vindo ao DreamLink!</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>✨ Chat em tempo real desbloqueado</p>
              <p>🔓 Acesso a conteúdo premium</p>
              <p>📸 Upload de mídia sem limitações</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingDisplayName(profileData?.fullName || config.userName || '');
                    setSelectedAvatar(profileData?.profileImage || config.userAvatar || predefinedAvatars[0]);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Editar Perfil
              </Button>
            )}
            
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};