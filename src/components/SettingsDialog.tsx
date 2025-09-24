import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Upload, Video, Globe, Save, FolderOpen, Eye, Palette, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useChatControls } from "@/hooks/useChatControls";
import { VisibilitySettingsDialog } from "@/components/VisibilitySettingsDialog";
import { ReferralDialog } from "@/components/ReferralDialog";
import { CreatorSubscriptionsManager } from "@/components/CreatorSubscriptionsManager";
import { useChatConfiguration } from "@/hooks/useChatConfiguration";
import { useLanguage } from "@/hooks/useLanguage";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
interface SettingsDialogProps {
  onImageUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
  onSaveState: () => void;
  onLoadState: () => void;
  disabled?: boolean;
}
export const SettingsDialog = ({
  onImageUpload,
  onVideoUpload,
  onSaveState,
  onLoadState,
  disabled = false
}: SettingsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [externalStorage, setExternalStorage] = useState("");
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const {
    language,
    setLanguage,
    t
  } = useLanguage();
  const {
    config,
    saveConfig
  } = useChatConfiguration();
  const {
    controls,
    updateControls
  } = useChatControls();
  const {
    clearMessages
  } = useRealtimeMessages();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };
  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
      toast.success("📤 Image uploaded!");
    }
  };
  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onVideoUpload(file);
      toast.success("🎥 Video uploaded!");
    }
  };
  const handleStorageConfig = () => {
    if (externalStorage.trim()) {
      toast.success("🌐 External storage configured!");
      setExternalStorage("");
    }
  };
  const handleSaveAndApply = async () => {
    try {
      await saveConfig({
        userName: config.userName,
        userAvatar: config.userAvatar,
        chatColor: config.chatColor,
        glassMorphism: config.glassMorphism,
        fleffyMode: config.fleffyMode,
        showCreatorName: config.showCreatorName,
        hideHistoryFromVisitors: config.hideHistoryFromVisitors,
        chatSize: config.chatSize,
        chatBackgroundColor: config.chatBackgroundColor
      });
      toast.success("💾 Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("❌ Erro ao salvar configurações");
    }
  };
  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const newAvatar = e.target?.result as string;
        saveConfig({
          userAvatar: newAvatar
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleGoogleDriveAccess = () => {
    if (googleDriveLink.trim()) {
      window.open(googleDriveLink, '_blank');
      toast.success("🌐 Opening Google Drive!");
    } else {
      window.open("https://drive.google.com", '_blank');
      toast.info("🌐 Opening default Google Drive!");
    }
  };
  const handleSaveState = () => {
    onSaveState();
    toast.success("💾 State saved!");
  };
  const handleLoadState = () => {
    onLoadState();
    toast.success("📂 State loaded!");
  };
  return <div className="space-y-0">
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button size="sm" variant="ghost" className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none" disabled={disabled}>
          <Settings className="w-4 h-4 mr-2" />
          <span>Configurações</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle>⚙️ Settings</DialogTitle>
        </DialogHeader>
      
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Settings */}
          <div className="space-y-4">
            {/* Chat Appearance Configuration */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">🎨 {t('settings.appearance')}</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="userName">{t('settings.userName')}</Label>
                  <Input 
                    id="userName" 
                    value={config.userName} 
                    onChange={e => saveConfig({ userName: e.target.value })} 
                    placeholder="João" 
                    className="text-sm" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nome aparecerá no chat e pode ser editado clicando no avatar também
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userAvatar">{t('settings.userAvatar')}</Label>
                  <div className="flex items-center gap-2">
                    <Input id="userAvatar" type="file" accept="image/*" onChange={handleAvatarSelect} className="text-sm" />
                    <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center overflow-hidden">
                      {config.userAvatar ? <img src={config.userAvatar} alt="User" className="w-full h-full object-cover" /> : "🙂"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chatColor">{t('settings.chatColor')}</Label>
                  <div className="flex items-center gap-2">
                    <Input id="chatColor" type="color" value={config.chatColor} onChange={e => saveConfig({
                    chatColor: e.target.value
                  })} className="w-16 h-8 p-1 rounded" />
                    <span className="text-sm text-muted-foreground">{config.chatColor}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="glassMorphism">{t('settings.glassEffect')}</Label>
                  <Switch id="glassMorphism" checked={config.glassMorphism} onCheckedChange={checked => saveConfig({
                  glassMorphism: checked
                })} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="fleffyMode">{t('settings.fleffyMode')}</Label>
                  <Switch id="fleffyMode" checked={config.fleffyMode} onCheckedChange={checked => saveConfig({
                  fleffyMode: checked
                })} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCreatorName">{t('settings.showCreatorName')}</Label>
                  <Switch id="showCreatorName" checked={config.showCreatorName} onCheckedChange={checked => saveConfig({
                  showCreatorName: checked
                })} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="hideHistoryFromVisitors">{t('settings.hideHistoryFromVisitors')}</Label>
                  <Switch id="hideHistoryFromVisitors" checked={config.hideHistoryFromVisitors} onCheckedChange={checked => saveConfig({
                  hideHistoryFromVisitors: checked
                })} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chatSize">{t('settings.chatSize')}</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t('settings.chatSizeSmall')}</span>
                    <input id="chatSize" type="range" min="30" max="80" value={config.chatSize} onChange={e => saveConfig({
                    chatSize: parseInt(e.target.value)
                  })} className="flex-1" />
                    <span className="text-xs text-muted-foreground">{t('settings.chatSizeLarge')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('settings.chatSizeDescription')}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chatBackgroundColor">{t('settings.chatBackgroundColor')}</Label>
                  <div className="flex items-center gap-2">
                    <Input id="chatBackgroundColor" type="color" value={config.chatBackgroundColor === "transparent" ? "#ffffff" : config.chatBackgroundColor} onChange={e => saveConfig({
                    chatBackgroundColor: e.target.value
                  })} className="w-16 h-8 p-1 rounded" />
                    <Button size="sm" variant="outline" onClick={() => saveConfig({
                    chatBackgroundColor: "transparent"
                  })}>
                      <Palette className="w-4 h-4 mr-1" />
                      {t('settings.transparent')}
                    </Button>
                  </div>
                </div>
                
                <Button onClick={handleSaveAndApply} className="w-full bg-primary hover:bg-primary/90" size="sm">
                  💾 {t('settings.saveAndApply')}
                </Button>
              </div>
            </div>

            {/* Chat Controls */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">💬 {t('settings.controls')}</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('settings.selectLanguage')}</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">🇧🇷 Português</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                      <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                      <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
                      <SelectItem value="sv">🇸🇪 Svenska</SelectItem>
                      <SelectItem value="no">🇳🇴 Norsk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowImages">{t('settings.allowImages')}</Label>
                  <Switch id="allowImages" checked={controls.allowImageUpload} onCheckedChange={checked => updateControls({
                  allowImageUpload: checked
                })} />
                </div>
              </div>
            </div>


            {/* Visibility Configuration Section */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs text-muted-foreground">{t('settings.visibilityDescription')}</p>
              <Button onClick={() => setShowVisibilityDialog(true)} className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                {t('settings.visibilityConfig')}
              </Button>
            </div>

            {/* External Storage Section */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                🌐 {t('settings.externalStorage')}
              </h3>
              <div className="space-y-2">
                <Input placeholder="Other cloud service URL" value={externalStorage} onChange={e => setExternalStorage(e.target.value)} />
                <Button onClick={handleStorageConfig} className="w-full bg-green-600 hover:bg-green-700">
                  {t('settings.configureStorage')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('settings.preview')}</h3>
            <div className={`border rounded-lg p-4 h-96 ${config.fleffyMode ? 'bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 border-pink-200 shadow-lg' : config.glassMorphism ? 'bg-background/50 backdrop-blur-lg border-white/20' : 'bg-background'}`}>
               {/* Chat Preview Area */}
               <div className="flex flex-col h-full">
                 {/* Messages Area */}
                 <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                   {config.hideHistoryFromVisitors ?
                // Empty chat for visitors preview
                <div className="text-center text-muted-foreground text-sm py-8">
                       <p>Chat vazio para visitantes</p>
                       <p className="text-xs mt-1">Apenas você vê o histórico</p>
                     </div> : <>
                       {/* Creator Message */}
                       <div className="flex items-start gap-2">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm">
                           👩
                         </div>
                         <div className="bg-muted rounded-2xl px-3 py-2 max-w-[80%]">
                           <p className="text-sm">Olá {config.userName}, bem-vindo!</p>
                         </div>
                       </div>
                       
                       {/* User Message */}
                       <div className="flex items-start gap-2 justify-end">
                         <div className="rounded-2xl px-3 py-2 max-w-[80%] text-white" style={{
                      backgroundColor: config.chatColor
                    }}>
                           <p className="text-sm">Tudo bem?</p>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center overflow-hidden">
                           {config.userAvatar ? <img src={config.userAvatar} alt="User" className="w-full h-full object-cover" /> : "🙂"}
                         </div>
                       </div>
                       
                       {/* Creator Response */}
                       <div className="flex items-start gap-2">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm">
                           👩
                         </div>
                         <div className="bg-muted rounded-2xl px-3 py-2 max-w-[80%]">
                           <p className="text-sm">Gostei da sua cor personalizada!</p>
                         </div>
                       </div>
                     </>}
                 </div>
                
                {/* Input Area */}
                <div className="flex gap-2">
                  <Input placeholder="Digite sua mensagem..." className="flex-1 rounded-2xl" />
                  <Button size="sm" className="rounded-2xl">
                    Enviar
                  </Button>
              </div>
            </div>
          </div>
          
          {/* Language Selector */}
          
        </div>
          
          {/* Privacy Controls */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">🔒 {t('settings.privacy')}</h3>
            
            {/* Temporary Messages Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">📱 Mensagens Temporárias</div>
                <div className="text-xs text-muted-foreground">
                  Mensagens ficam apenas na memória (não são salvas no banco)
                </div>
              </div>
              <Switch checked={controls.temporaryMessages} onCheckedChange={checked => {
              updateControls({
                temporaryMessages: checked
              });
              toast.info(checked ? "🔄 Modo temporário ativado" : "💾 Mensagens serão salvas normalmente");
            }} />
            </div>
            
            <Button onClick={() => {
            if (confirm(`🧽 ${t('settings.clearChatConfirm')}`)) {
              clearMessages().then(success => {
                if (!success) {
                  toast.error("❌ Erro ao limpar mensagens");
                }
              });
            }
          }} className="w-full bg-red-500 hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              🧽 {t('settings.clearChat')}
            </Button>
            <p className="text-xs text-gray-500">
              {t('settings.clearChatDescription')}
            </p>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
        
        {/* Visibility Settings Dialog */}
        <VisibilitySettingsDialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog} />
      </DialogContent>
    </Dialog>
    
    {/* Botão Referral */}
    <ReferralDialog disabled={disabled} />
    
    {/* Botão Assinaturas do Criador */}
    <CreatorSubscriptionsManager />
    
    {/* Botão Painel do Usuário */}
    <Button size="sm" variant="ghost" className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none" disabled={disabled}>
      <User className="w-4 h-4 mr-2" />
      <span>Painel do Usuário</span>
    </Button>
  </div>;
};