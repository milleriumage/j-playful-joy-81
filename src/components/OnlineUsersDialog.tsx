import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserX, Crown, User, Clock, Pause, Settings } from "lucide-react";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useCreatorPermissions } from "@/hooks/useCreatorPermissions";
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { useQueueSystem } from '@/hooks/useQueueSystem';
import { QueueSettingsDialog } from './QueueSettingsDialog';
import { toast } from "sonner";

interface OnlineUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onlineCount: number;
  creatorId?: string;
}

export const OnlineUsersDialog: React.FC<OnlineUsersDialogProps> = ({
  open,
  onOpenChange,
  onlineCount,
  creatorId
}) => {
  const { blockUser } = useBlockedUsers();
  const { isCreator: userIsCreator } = useCreatorPermissions(creatorId);
  const { usersList } = useOnlinePresence();
  const { 
    queueSettings, 
    queueUsers, 
    updateQueueSettings, 
    setUserBypass 
  } = useQueueSystem(creatorId);
  
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [blockDuration, setBlockDuration] = useState<string>('24');
  const [showQueueSettings, setShowQueueSettings] = useState(false);

  const handleBlockUser = async (userId: string, userName: string, duration?: number) => {
    if (duration) {
      const success = await blockUser(userId, duration);
      if (success) {
        toast.success(`✅ ${userName} foi pausado por ${duration}h`);
        setSelectedUser(null);
        setBlockDuration('24');
      }
    } else {
      setSelectedUser({ id: userId, name: userName });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários Online ({onlineCount})
            </div>
            {userIsCreator && (
              <Button
                onClick={() => setShowQueueSettings(true)}
                variant="outline"
                size="sm"
                className="text-primary hover:text-primary-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {usersList.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {usersList.map((onlineUser) => (
                <Card key={onlineUser.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={onlineUser.avatar} alt={onlineUser.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {onlineUser.type === 'guest' ? (
                            <User className="w-5 h-5" />
                          ) : (
                            onlineUser.name[0]?.toUpperCase() || '?'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{onlineUser.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={onlineUser.type === 'guest' ? 'secondary' : 'default'} 
                            className="text-xs"
                          >
                            {onlineUser.type === 'guest' ? '👤 Guest' : '🔒 User'}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(onlineUser.online_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Block button only for creator, not blocking themselves, and only for authenticated users */}
                    {userIsCreator && onlineUser.id !== creatorId && onlineUser.type === 'user' && (
                      <Button
                        onClick={() => handleBlockUser(onlineUser.id, onlineUser.name)}
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Nenhum usuário online no momento
            </div>
          )}
          
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Total: {onlineCount} usuário{onlineCount !== 1 ? 's' : ''} online
            </p>
          </div>
        </div>

        {/* Duration Selection Dialog */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-sm w-full mx-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold">Pausar usuário</h3>
                  <p className="text-sm text-muted-foreground">
                    Por quanto tempo deseja pausar {selectedUser.name}?
                  </p>
                </div>
                
                <Select value={blockDuration} onValueChange={setBlockDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="48">48 horas</SelectItem>
                    <SelectItem value="72">72 horas</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleBlockUser(selectedUser.id, selectedUser.name, parseInt(blockDuration))}
                    className="flex-1"
                  >
                    Pausar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Queue Settings Dialog */}
        <QueueSettingsDialog
          open={showQueueSettings}
          onOpenChange={setShowQueueSettings}
          settings={queueSettings}
          queueUsers={queueUsers}
          onUpdateSettings={updateQueueSettings}
          onSetUserBypass={setUserBypass}
        />
      </DialogContent>
    </Dialog>
  );
};