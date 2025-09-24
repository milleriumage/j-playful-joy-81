import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Upload, Mic, Send, Edit, Plus, X, DoorOpen, Heart, Crown } from "lucide-react";
import { toast } from "sonner";
import { useChatControls } from "@/hooks/useChatControls";
import { UserLinkDisplay } from "@/components/UserLinkDisplay";
import { useChatConfiguration } from "@/hooks/useChatConfiguration";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useCreatorPermissions } from "@/hooks/useCreatorPermissions";
import { OnlineUsersDialog } from "@/components/OnlineUsersDialog";
import { GuestProfileDialog } from './GuestProfileDialog';
import { useGuestData } from '@/hooks/useGuestData';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

interface ChatOverlayProps {
  onClose: () => void;
  creatorId?: string;
  passwordProtected?: boolean;
  onPasswordVerify?: (callback: () => void) => void;
  onTrialCheck?: () => boolean;
  onSubtractCredits?: (amount: number, action?: string) => void;
  credits?: number;
  isLoggedIn?: boolean;
  visibilitySettings?: {
    showChatEditing?: boolean;
    showChatCloseIcon?: boolean;
  };
}

export const ChatOverlay = ({
  onClose,
  creatorId,
  passwordProtected = false,
  onPasswordVerify,
  onTrialCheck,
  onSubtractCredits,
  credits = 0,
  isLoggedIn = false,
  visibilitySettings,
}: ChatOverlayProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string>("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [messageLikes, setMessageLikes] = useState<{[key: string]: number}>({});
  const [messageReactions, setMessageReactions] = useState<{[key: string]: {[emoji: string]: number}}>({});
  const [isMinimalTheme, setIsMinimalTheme] = useState(false);
  const [showProfileImageDialog, setShowProfileImageDialog] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showGuestProfile, setShowGuestProfile] = useState(false);

  const { controls } = useChatControls();
  const { config, saveConfig } = useChatConfiguration();
  const { user } = useGoogleAuth();
  const { onlineUsers } = useOnlinePresence(user?.id || 'global');
  const { blockUser, isUserBlocked } = useBlockedUsers();
  const { isCreator: userIsCreator, canEdit } = useCreatorPermissions(creatorId);
  const { guestData, updateGuestProfile } = useGuestData();
  
  // Use the same hook as EnhancedChat for real-time sync
  const { messages, sendMessage, updateMessageSpeech, clearMessages, isLoading, error } = useRealtimeMessages(creatorId);

  const [guestProfile, setGuestProfile] = useState({
    displayName: guestData.displayName,
    avatarUrl: guestData.avatarUrl,
  });

  useEffect(() => {
    setGuestProfile({
      displayName: guestData.displayName,
      avatarUrl: guestData.avatarUrl,
    });
  }, [guestData.displayName, guestData.avatarUrl]);

  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail || {};
      setGuestProfile(prev => ({
        displayName: detail.displayName ?? prev.displayName ?? guestData.displayName,
        avatarUrl: detail.avatarUrl ?? prev.avatarUrl ?? guestData.avatarUrl,
      }));
    };
    window.addEventListener('guest-profile-updated', handler);
    return () => window.removeEventListener('guest-profile-updated', handler);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if is visitor
  const isVisitor = !user || (creatorId && user.id !== creatorId);
  const isCreator = user && creatorId && user.id === creatorId;

  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      const userName = isCreator 
        ? (config.userName || "Criador") 
        : (guestProfile.displayName || `Guest ${guestData.sessionId.slice(-4)}`);
      
      await sendMessage(userName, currentMessage, config.chatColor, `💬 ${userName}: ${currentMessage}`);
      setCurrentMessage("");
      
      // Auto scroll after sending
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const imageUrl = e.target?.result as string;
        sendMessage(config.userName || "You", `<img src="${imageUrl}" alt="Shared image" class="max-w-32 h-20 object-cover rounded cursor-pointer" data-expandable="true" />`, config.chatColor, `📸 ${config.userName || "You"} shared an image`);
        toast.success("📸 Image sent to chat!");
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    if (onTrialCheck && !onTrialCheck()) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          sendMessage("You", "🎤 Voice message", "text-green-300", "🎤 You sent a voice message");
          toast.success("🎤 Voice message sent!");
        }
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      toast.error("❌ Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleEditMessage = (message: any) => {
    if (passwordProtected && onPasswordVerify) {
      onPasswordVerify(() => {});
    }
  };

  const handleEmojiReaction = (messageId: string, emoji: string) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [emoji]: (prev[messageId]?.[emoji] || 0) + 1
      }
    }));
    toast.success(`Reação ${emoji} adicionada!`);
  };

  const handleLikeMessage = (messageId: string) => {
    setMessageLikes(prev => ({
      ...prev,
      [messageId]: (prev[messageId] || 0) + 1
    }));
    toast.success("❤️ Message liked!");
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const newAvatar = e.target?.result as string;
          
          if (isCreator) {
            await saveConfig({ userAvatar: newAvatar });
            toast.success('✅ Avatar do criador salvo!');
          } else {
            updateGuestProfile({ avatarUrl: newAvatar });
            setGuestProfile(prev => ({ ...prev, avatarUrl: newAvatar }));
            window.dispatchEvent(new CustomEvent('guest-profile-updated', { detail: { avatarUrl: newAvatar } }));
            toast.success('✅ Avatar do visitante atualizado!');
          }
          
          setShowProfileImageDialog(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error('❌ Erro inesperado no upload');
      }
    }
  };

  const handleImageClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLImageElement;
    if (target.tagName === 'IMG' && target.dataset.expandable) {
      setExpandedImage(target.src);
      setShowImageDialog(true);
    }
  };

  const chatHeight = '400px'; // Fixed height for overlay

  return (
    <div className="fixed top-4 right-4 w-80 z-50">
      <div className={`flex flex-col overflow-hidden shadow-xl ${config.fleffyMode ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-2 border-pink-200 rounded-3xl shadow-pink-100/50 shadow-2xl' : config.glassMorphism ? 'bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg' : isMinimalTheme ? 'bg-white border border-gray-200 rounded-xl' : 'bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl'}`} 
        style={{ height: chatHeight, backgroundColor: config.chatBackgroundColor !== "transparent" ? config.chatBackgroundColor : undefined }}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-2 border-b ${config.fleffyMode ? 'border-pink-200/50 bg-gradient-to-r from-pink-50/80 to-purple-50/80' : isMinimalTheme ? 'border-gray-200 bg-gray-50' : 'border-border/30 bg-muted/30'}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${config.fleffyMode ? 'text-pink-700' : isMinimalTheme ? 'text-gray-900' : 'text-foreground'}`}>Chat Overlay</span>
            <button 
              onClick={() => setShowOnlineUsers(true)}
              className={`text-xs ${config.fleffyMode ? 'text-purple-600 hover:text-purple-700' : isMinimalTheme ? 'text-gray-500 hover:text-gray-600' : 'text-muted-foreground hover:text-foreground'} transition-colors cursor-pointer hover:underline`}
            >
              ({onlineUsers} online)
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Exibir créditos atuais */}
            {isLoggedIn && (
              <div className={`text-xs px-2 py-1 rounded-full border ${config.fleffyMode ? 'bg-pink-100 border-pink-200 text-pink-700' : isMinimalTheme ? 'bg-green-50 border-green-200 text-green-700' : 'bg-green-100 border-green-300 text-green-700'}`}>
                {credits} créditos
              </div>
            )}
            <UserLinkDisplay className="" />
            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 ${config.fleffyMode ? 'bg-gradient-to-b from-pink-25/30 to-purple-25/30' : isMinimalTheme ? 'bg-white' : config.glassMorphism ? 'bg-transparent' : 'bg-gray-50'}`}
        >
          {(() => {
            const shouldShowMessages = !isVisitor || !config.hideHistoryFromVisitors || messages.length > 0;
            
            if (!shouldShowMessages && isVisitor && messages.length === 0) {
              return (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <p>Chat vazio - histórico oculto para visitantes</p>
                  <p className="text-xs mt-1">Apenas mensagens novas aparecerão aqui</p>
                </div>
              );
            }
            
            return messages.map(msg => (
              <div key={msg.id} className="group animate-fade-in" data-message-id={msg.id}>
                <div className={`flex ${
                  (msg.username === (config.userName || "Criador")) 
                    ? 'justify-start' : 'justify-end'
                } mb-4`}>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${
                      (msg.username === (config.userName || "Criador"))
                        ? 'items-start' : 'items-end'
                  }`}>
                    {/* Creator Name (only for creator messages and when enabled) */}
                    {config.showCreatorName && msg.username === (config.userName || "Criador") && (
                      <div className="flex items-center gap-1 px-2">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {config.userName || "Criador"}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex items-start gap-3 ${
                      (isCreator && msg.username !== 'Visitante') || (!isCreator && msg.username === (config.userName || "Criador"))
                        ? 'flex-row' : 'flex-row-reverse'
                    }`}>
                      {/* Avatar */}
                      <div className="flex flex-col items-center gap-1">
                        {/* Visitor name above avatar */}
                        {msg.username !== (config.userName || "Criador") && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {guestProfile.displayName || msg.username || 'Visitante'}
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 relative group">
                          {/* Crown icon for creator */}
                          {msg.username === (config.userName || "Criador") && (
                            <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 z-10" />
                          )}
                          <img 
                            src={
                              msg.username !== (config.userName || "Criador")
                                ? (guestProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=visitor`)
                                : (config.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=creator`)
                            }
                            alt={msg.username !== (config.userName || "Criador") ? 'Visitante' : 'Criador'} 
                            className="w-full h-full object-cover" 
                            onError={e => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username !== (config.userName || "Criador") ? 'visitor' : 'creator'}`;
                            }} 
                          />
                          {/* Allow visitors and creators to edit their own avatars */}
                          {(msg.username === (config.userName || "Criador") ? isCreator : isVisitor) && (
                            <Button
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                if (msg.username === (config.userName || "Criador") && isCreator) {
                                  setShowProfileImageDialog(true);
                                } else if (msg.username !== (config.userName || "Criador") && isVisitor) {
                                  setShowGuestProfile(true);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-black/70 rounded-full transition-opacity flex items-center justify-center"
                            >
                              <Edit className="w-2 h-2 text-white" />
                            </Button>
                          )}
                        </div>
                      </div>
                     
                      {/* Message Bubble */}
                      <div className={`px-3 py-2 rounded-2xl text-sm ${
                        msg.username !== (config.userName || "Criador") 
                          ? 'bg-blue-500 text-white border'
                          : 'bg-gray-100 text-black'
                      }`} style={msg.username !== (config.userName || "Criador") ? {} : {
                        backgroundColor: config.chatColor
                      }}>
                        {msg.message.includes('<img') ? (
                          <div className="relative group" onClick={(e) => {
                            const imgElement = e.currentTarget.querySelector('img');
                            if (imgElement) {
                              setExpandedImage(imgElement.src);
                              setShowImageDialog(true);
                            }
                          }}>
                            <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                            <Button size="sm" variant="ghost" onClick={(e) => {
                              e.stopPropagation();
                              const imgElement = e.currentTarget.parentElement?.querySelector('img');
                              if (imgElement) {
                                setExpandedImage(imgElement.src);
                                setShowImageDialog(true);
                              }
                            }} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-2 h-2 text-white" />
                            </Button>
                          </div>
                        ) : (
                          msg.message
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ));
          })()}
          {/* Invisible div for auto scroll */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className={`p-3 border-t ${isMinimalTheme ? 'border-gray-200 bg-gray-50' : 'border-border/30 bg-muted/20'}`}>
          <div className="flex gap-2 items-end">
            {controls.allowImageUpload && (
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-8 w-8 rounded-full bg-primary/10 border-primary/20 hover:bg-primary/20 transition-colors">
                <Upload className="w-3 h-3 text-primary" />
              </Button>
            )}
            
            <div className="flex-1 relative">
              <Input 
                value={currentMessage} 
                onChange={e => setCurrentMessage(e.target.value)} 
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }} 
                placeholder="Digite uma mensagem..." 
                className="pr-10 text-sm rounded-full border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary/50 transition-colors" 
              />
              <Button 
                onClick={handleSendMessage} 
                size="sm" 
                disabled={!currentMessage.trim()} 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <img src={expandedImage} alt="Expanded" className="w-full h-auto max-h-[80vh] object-contain" />
            <Button className="absolute top-2 right-2 rounded-full p-2 bg-black/50 hover:bg-black/70" onClick={() => setShowImageDialog(false)}>
              <X className="w-4 h-4 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Image Dialog */}
      <Dialog open={showProfileImageDialog} onOpenChange={setShowProfileImageDialog}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex flex-col items-center space-y-4 p-6">
            <h3 className="text-lg font-semibold">Configurações de Perfil</h3>
            
            {/* User Name Configuration */}
            <div className="w-full space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium">Nome do Usuário</Label>
              <Input
                id="userName"
                value={isCreator ? (config.userName || '') : (guestData.displayName || '')}
                onChange={async (e) => {
                  const newName = e.target.value;
                  if (isCreator) {
                    await saveConfig({ userName: newName });
                  } else {
                    updateGuestProfile({ displayName: newName });
                    setGuestProfile(prev => ({ ...prev, displayName: newName }));
                    window.dispatchEvent(new CustomEvent('guest-profile-updated', { detail: { displayName: newName } }));
                  }
                }}
                placeholder={isCreator ? "Nome do criador" : "Seu nome"}
                className="w-full"
              />
            </div>
            
            {/* Current Avatar Preview */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
              <img src={
                isCreator 
                  ? config.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=creator`
                  : guestProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=visitor`
              } alt="Avatar atual" className="w-full h-full object-cover" />
            </div>

            {/* Default Avatar Options */}
            <div className="w-full">
              <h4 className="text-sm font-medium mb-3 text-center">Escolha um avatar padrão:</h4>
              <div className="grid grid-cols-4 gap-3">
                {['happy', 'smile', 'cool', 'cute', 'fun', 'sweet', 'star', 'magic', 'sunny', 'ocean', 'forest', 'galaxy'].map(seed => (
                  <button key={seed} onClick={async () => {
                    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    
                    if (isCreator) {
                      await saveConfig({ userAvatar: newAvatar });
                      toast.success('✅ Avatar do criador salvo!');
                    } else {
                      updateGuestProfile({ avatarUrl: newAvatar });
                      setGuestProfile(prev => ({ ...prev, avatarUrl: newAvatar }));
                      window.dispatchEvent(new CustomEvent('guest-profile-updated', { detail: { avatarUrl: newAvatar } }));
                      toast.success('✅ Avatar do visitante atualizado!');
                    }
                    
                    setShowProfileImageDialog(false);
                  }} className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-110">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={`Avatar ${seed}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom Photo */}
            <div className="w-full border-t pt-4">
              <input ref={profileImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest Profile Dialog */}
      <GuestProfileDialog 
        isOpen={showGuestProfile}
        onClose={() => setShowGuestProfile(false)}
      />

      {/* Online Users Dialog */}
      <OnlineUsersDialog 
        open={showOnlineUsers}
        onOpenChange={setShowOnlineUsers}
        onlineCount={onlineUsers}
        creatorId={creatorId}
      />
    </div>
  );
};