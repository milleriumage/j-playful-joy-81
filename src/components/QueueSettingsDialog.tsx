import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Settings, Users, UserCheck, UserX, User } from "lucide-react";

interface QueueUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'guest';
  joined_at: string;
  bypass_queue: boolean;
}

interface QueueSettings {
  enabled: boolean;
  wait_time_minutes: number;
  current_user_id?: string;
  queue_expires_at?: string;
}

interface QueueSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: QueueSettings;
  queueUsers: QueueUser[];
  onUpdateSettings: (settings: Partial<QueueSettings>) => void;
  onSetUserBypass: (userId: string, bypass: boolean) => void;
}

export const QueueSettingsDialog: React.FC<QueueSettingsDialogProps> = ({
  open,
  onOpenChange,
  settings,
  queueUsers,
  onUpdateSettings,
  onSetUserBypass
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
  };

  const waitTimeOptions = [
    { value: '5', label: '5 minutos' },
    { value: '10', label: '10 minutos' },
    { value: '20', label: '20 minutos' },
    { value: '40', label: '40 minutos' }
  ];

  const sortedQueue = queueUsers
    .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações da Fila
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle da Fila */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Sistema de Fila</Label>
                <p className="text-sm text-muted-foreground">
                  Permite apenas 1 usuário por vez na sala
                </p>
              </div>
              <Switch
                checked={localSettings.enabled}
                onCheckedChange={(enabled) => 
                  setLocalSettings(prev => ({ ...prev, enabled }))
                }
              />
            </div>
          </Card>

          {/* Tempo de Espera */}
          {localSettings.enabled && (
            <Card className="p-4">
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tempo de Espera
                </Label>
                <Select
                  value={localSettings.wait_time_minutes.toString()}
                  onValueChange={(value) =>
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      wait_time_minutes: parseInt(value) 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {waitTimeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          )}

          {/* Lista de Usuários na Fila */}
          {localSettings.enabled && sortedQueue.length > 0 && (
            <Card className="p-4">
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários na Fila ({sortedQueue.length})
                </Label>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sortedQueue.map((queueUser, index) => (
                    <div key={queueUser.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs min-w-[24px] text-center">
                          #{index + 1}
                        </Badge>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={queueUser.avatar} alt={queueUser.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {queueUser.type === 'guest' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              queueUser.name[0]?.toUpperCase() || '?'
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{queueUser.name}</div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={queueUser.type === 'guest' ? 'secondary' : 'default'} 
                              className="text-xs"
                            >
                              {queueUser.type === 'guest' ? '👤 Guest' : '🔒 User'}
                            </Badge>
                            {queueUser.bypass_queue && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                Liberado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {queueUser.bypass_queue ? (
                          <Button
                            onClick={() => onSetUserBypass(queueUser.id, false)}
                            size="sm"
                            variant="outline"
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => onSetUserBypass(queueUser.id, true)}
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Clique em ✓ para liberar um usuário da fila ou ✗ para bloquear
                </div>
              </div>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} className="flex-1">
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};