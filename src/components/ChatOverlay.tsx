import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Upload, Mic, Send, Edit, Plus, X, DoorOpen, Heart, Crown, Move, RotateCcw, Minimize2, Maximize2 } from "lucide-react";
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
import { useDraggableWindow } from '@/hooks/useDraggableWindow';
import { ResizeHandles } from './ResizeHandles';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    windowRef,
    windowStyle,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
    resetWindow,
    centerWindow,
  } = useDraggableWindow({
    initialPosition: { x: window.innerWidth - 340, y: 16 },
    initialSize: { width: 320, height: 400 },
    minSize: { width: 280, height: 300 },
    maxSize: { width: 600, height: 800 },
    storageKey: 'chatOverlay'
  });

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

  return (
    <div ref={windowRef} style={windowStyle}>
      <div className={`flex flex-col overflow-hidden shadow-xl relative ${config.fleffyMode ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-2 border-pink-200 rounded-3xl shadow-pink-100/50 shadow-2xl' : config.glassMorphism ? 'bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg' : isMinimalTheme ? 'bg-white border border-gray-200 rounded-xl' : 'bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl'} ${isDragging ? 'shadow-2xl scale-105' : ''} transition-all duration-200`} 
        style={{ height: '100%', backgroundColor: config.chatBackgroundColor !== "transparent" ? config.chatBackgroundColor : undefined }}>
        
        {/* Resize Handles */}
        <ResizeHandles onResizeStart={handleResizeStart} />
        
        {/* Header */}
        <div 
          className={`flex items-center justify-between p-2 border-b cursor-move select-none ${config.fleffyMode ? 'border-pink-200/50 bg-gradient-to-r from-pink-50/80 to-purple-50/80' : isMinimalTheme ? 'border-gray-200 bg-gray-50' : 'border-border/30 bg-muted/30'}`}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Move className="w-3 h-3 text-muted-foreground" />
            <span className={`text-sm font-medium ${config.fleffyMode ? 'text-pink-700' : isMinimalTheme ? 'text-gray-900' : 'text-foreground'}`}>Chat Overlay</span>
            <button 
              onClick={() => setShowOnlineUsers(true)}
              className={`text-xs ${config.fleffyMode ? 'text-purple-600 hover:text-purple-700' : isMinimalTheme ? 'text-gray-500 hover:text-gray-600' : 'text-muted-foreground hover:text-foreground'} transition-colors cursor-pointer hover:underline`}
            >
              ({onlineUsers} online)
            </button>
          </div>
          <div className="flex items-center gap-1">
            {/* Exibir créditos atuais */}
            {isLoggedIn && (
              <div className={`text-xs px-2 py-1 rounded-full border ${config.fleffyMode ? 'bg-pink-100 border-pink-200 text-pink-700' : isMinimalTheme ? 'bg-green-50 border-green-200 text-green-700' : 'bg-green-100 border-green-300 text-green-700'}`}>
                {credits} créditos
              </div>
            )}
            <UserLinkDisplay className="" />
            
            {/* Window Controls */}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="h-6 w-6 p-0 rounded-full hover:bg-primary/10 transition-colors"
              title={isCollapsed ? "Expandir" : "Minimizar"}
            >
              {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={centerWindow} 
              className="h-6 w-6 p-0 rounded-full hover:bg-primary/10 transition-colors"
              title="Centralizar"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Messages Area - Hidden when collapsed */}
        {!isCollapsed && (
          <>
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
                            <div dangerouslySetInnerHTML={{ __html: msg.message }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-3 border-t ${config.fleffyMode ? 'border-pink-200/50 bg-gradient-to-r from-pink-50/80 to-purple-50/80' : isMinimalTheme ? 'border-gray-200 bg-gray-50' : 'border-border/30 bg-muted/20'}`}>
              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline" className="flex-shrink-0">
                  <Upload className="w-3 h-3" />
                </Button>
                <Button 
                  onClick={isRecording ? stopRecording : startRecording}
                  size="sm" 
                  variant={isRecording ? "destructive" : "outline"}
                  className="flex-shrink-0"
                >
                  <Mic className={`w-3 h-3 ${isRecording ? 'animate-pulse' : ''}`} />
                </Button>
                <Input 
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 text-sm"
                />
                <Button 
                  onClick={handleSendMessage}
                  size="sm" 
                  disabled={!currentMessage.trim()}
                  className="flex-shrink-0"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={profileImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
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

      {/* Online Users Dialog */}
      <OnlineUsersDialog 
        open={showOnlineUsers} 
        onOpenChange={setShowOnlineUsers} 
        onlineCount={onlineUsers}
        creatorId={creatorId}
      />

      {/* Guest Profile Dialog */}
      <GuestProfileDialog
        isOpen={showGuestProfile}
        onClose={() => setShowGuestProfile(false)}
      />

      {/* Profile Image Upload Dialog */}
      <Dialog open={showProfileImageDialog} onOpenChange={setShowProfileImageDialog}>
        <DialogContent>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Alterar Foto do Perfil</h3>
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProfileImageDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};