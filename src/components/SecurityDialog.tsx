import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Unlock, Clock, Timer } from "lucide-react";
import { usePasswordProtection } from "@/hooks/usePasswordProtection";
import { AutoLockConfigDialog } from "@/components/AutoLockConfigDialog";

interface SecurityDialogProps {
  children: React.ReactNode;
}

export const SecurityDialog = ({ children }: SecurityDialogProps) => {
  const [showAutoLockDialog, setShowAutoLockDialog] = useState(false);
  const {
    hasPassword,
    autoLockMinutes,
    setPassword,
    removePassword,
    setAutoLockTime
  } = usePasswordProtection();
  
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSetPassword = async () => {
    try {
      await setPassword(newPassword, confirmPassword, autoLockMinutes);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error setting password:', error);
    }
  };

  const handleRemovePassword = async () => {
    try {
      await removePassword();
      setCurrentPassword('');
    } catch (error) {
      console.error('Error removing password:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            🔐 Segurança e Bloqueio Automático
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!hasPassword ? (
            <div className="space-y-2">
              <Label>Set Master Password</Label>
              <Input
                type="password"
                placeholder="Enter new password (min 4 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button onClick={handleSetPassword} className="w-full bg-green-600 hover:bg-green-700">
                <Lock className="w-4 h-4 mr-2" />
                Set Password
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Password is active</span>
              </div>
              
              {/* Auto-lock time configuration */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Auto-lock Timer
                </Label>
                <Select value={autoLockMinutes.toString()} onValueChange={(value) => {
                  console.log('🔧 Selecionando tempo:', value);
                  setAutoLockTime(parseFloat(value));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select auto-lock time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.0833">5 segundos</SelectItem>
                    <SelectItem value="0.1667">10 segundos</SelectItem>
                    <SelectItem value="0.25">15 segundos</SelectItem>
                    <SelectItem value="0.5">30 segundos</SelectItem>
                    <SelectItem value="1">1 minuto</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="360">6 horas</SelectItem>
                    <SelectItem value="720">12 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                    <SelectItem value="0">Nunca (apenas manual)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Conteúdo será bloqueado automaticamente após este tempo de inatividade
                </p>
              </div>
              
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button onClick={handleRemovePassword} className="w-full bg-red-600 hover:bg-red-700 mb-2">
                <Unlock className="w-4 h-4 mr-2" />
                Remove Password
              </Button>
              <Button 
                onClick={() => {
                  // For now, just show a toast - you can implement password change dialog later
                  console.log('Change password clicked');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🔄 Alterar Senha
              </Button>
              
              {/* Auto-lock Configuration */}
              <div className="border-t pt-3 mt-3">
                <Button 
                  onClick={() => setShowAutoLockDialog(true)}
                  className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Configurar Bloqueio Automático
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <AutoLockConfigDialog 
          isOpen={showAutoLockDialog}
          onClose={() => setShowAutoLockDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );
};