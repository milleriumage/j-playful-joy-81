import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SupabaseTestComponent } from "@/components/SupabaseTestComponent";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Upload, Video, Lock, Unlock, Eye, EyeOff, Tv, Trash2, DollarSign, Link2, Edit, Crown, Timer, ZoomIn, X, Mic, ChevronRight, Play, Pause, Music, Plus, Settings, Moon, Sun, Bell, Sparkles, CreditCard, QrCode, Coins } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, Link } from "react-router-dom";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useRealtimeMedia } from "@/hooks/useRealtimeMedia";
import { useMediaTimer } from "@/hooks/useMediaTimer";
import { useMediaTimers } from "@/hooks/useMediaTimers";
import { usePasswordProtection } from "@/hooks/usePasswordProtection";
import { NotificationsList } from "@/components/NotificationsList";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserReset } from "@/hooks/useUserReset";
import { useUserCredits } from "@/hooks/useUserCredits";
// Logo removida - usando nova logo inline
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useTrialTimer } from "@/hooks/useTrialTimer";
import { useUserInitialization } from "@/hooks/useUserInitialization";
// Logo removida - usando nova logo inline
import { getMediaUrl, ensureMediaBucket } from "@/lib/mediaUtils";
import { ProfileDialog } from "@/components/ProfileDialog";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { useDataLoadingState } from "@/hooks/useDataLoadingState";
import { SettingsDialog } from "@/components/SettingsDialog";
import { MenuDropdown } from "@/components/MenuDropdown";
import { PixCheckoutDialog } from "@/components/PixCheckoutDialog";
import { EnhancedChat } from "@/components/EnhancedChat";
import { MediaForm } from "@/components/MediaForm";
import { MediaShowcase } from "@/components/MediaShowcase";
import { PasswordDialog } from "@/components/PasswordDialog";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { UserFloatingDialog } from "@/components/UserFloatingDialog";
import { AddCreditsDialog } from "@/components/AddCreditsDialog";
import { PremiumPlansManager, type PremiumPlan } from "@/components/PremiumPlansManager";
import { UserLinkDisplay } from "@/components/UserLinkDisplay";
import { SocialMediaDialog } from "@/components/SocialMediaDialog";
import { VisibilitySettingsDialog } from "@/components/VisibilitySettingsDialog";
import { CreditSuccessNotification } from "@/components/CreditSuccessNotification";
import { CreditDeductionNotification } from "@/components/CreditDeductionNotification";
import { ForcedLoginDialog } from "@/components/ForcedLoginDialog";
import { TemplateUserTest } from "@/components/TemplateUserTest";
import { SlideshowDisplay } from "@/components/SlideshowDisplay";
import { ViewportToggle } from "@/components/ViewportToggle";
import { useDataIsolation } from "@/hooks/useDataIsolation";
import LivePixPaymentDialog from "@/components/LivePixPaymentDialog";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { VisibilityTestComponent } from "@/components/VisibilityTestComponent";
import { CheckoutTransparenteDialog } from "@/components/CheckoutTransparenteDialog";
import { TrialTimer } from "@/components/TrialTimer";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Monitor } from "lucide-react";
import PixPaymentDialog from "@/components/PixPaymentDialog";
import { PaymentMethodsDialog } from "@/components/PaymentMethodsDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { useGiftNotifications } from "@/hooks/useGiftNotifications";
import { WelcomeGiftMessage } from "@/components/WelcomeGiftMessage";
import { SalesHistoryButton } from "@/components/SalesHistoryButton";
interface ViewportSize {
  name: string;
  icon: React.ReactNode;
  width: string;
  height: string;
  description: string;
}
const Index = () => {
  // Seletor de idioma local para landing page
  const [landingLanguage, setLandingLanguage] = useState<'pt' | 'en'>(() => {
    const saved = localStorage.getItem('landing-language');
    return (saved as 'pt' | 'en') || 'en';
  });

  // Função para alternar idioma
  const handleLanguageChange = (language: 'pt' | 'en') => {
    setLandingLanguage(language);
    localStorage.setItem('landing-language', language);
  };

  // Função para traduções da landing page
  const tLanding = (key: string): string => {
    const landingTranslations: any = {
      'title': {
        pt: 'Social Link',
        en: 'Social Link'
      },
      'subtitle': {
        pt: 'A nova vitrine digital com chat integrado',
        en: 'The new digital showcase with integrated chat'
      },
      'description': {
        pt: 'Transforme o tradicional "link na bio" em uma vitrine interativa. Exiba conteúdos, receba pagamentos e converse com seus fãs em tempo real.',
        en: 'Transform the traditional "link in bio" into an interactive showcase. Display content, receive payments and chat with your fans in real time.'
      },
      'demo': {
        pt: 'Ver Demonstração',
        en: 'View Demo'
      },
      'createAccount': {
        pt: 'Criar Conta Grátis',
        en: 'Create Free Account'
      },
      'features.title': {
        pt: '🔑 Principais diferenciais',
        en: '🔑 Key differentials'
      },
      'features.subtitle': {
        pt: 'Muito mais que um simples "link na bio"',
        en: 'Much more than a simple "link in bio"'
      },
      'feature.chat.title': {
        pt: 'Chat integrado',
        en: 'Integrated chat'
      },
      'feature.chat.description': {
        pt: 'Seus fãs não só clicam — eles conversam com você. Essa interação direta gera confiança e engajamento imediato.',
        en: 'Your fans don\'t just click — they talk to you. This direct interaction generates trust and immediate engagement.'
      },
      'feature.payment.title': {
        pt: 'Links de pagamento',
        en: 'Payment links'
      },
      'feature.payment.description': {
        pt: 'Adicione botões de compra e receba pagamentos de forma simples e rápida.',
        en: 'Add purchase buttons and receive payments simply and quickly.'
      },
      'feature.showcase.title': {
        pt: 'Vitrine personalizada',
        en: 'Personalized showcase'
      },
      'feature.showcase.description': {
        pt: 'Crie uma página exclusiva, com cores, textos, preços, animações e até música de fundo.',
        en: 'Create an exclusive page with colors, texts, prices, animations and even background music.'
      },
      'feature.stats.title': {
        pt: 'Estatísticas em tempo real',
        en: 'Real-time statistics'
      },
      'feature.stats.description': {
        pt: 'Veja curtidas, compartilhamentos e visualizações para entender o que mais atrai sua audiência.',
        en: 'See likes, shares and views to understand what attracts your audience the most.'
      },
      'feature.control.title': {
        pt: 'Controle total',
        en: 'Total control'
      },
      'feature.control.description': {
        pt: 'Use cronômetros, senhas, bloqueios automáticos e personalização avançada para proteger seu conteúdo.',
        en: 'Use timers, passwords, automatic locks and advanced customization to protect your content.'
      },
      'feature.interface.title': {
        pt: 'Interface rápida',
        en: 'Fast interface'
      },
      'feature.interface.description': {
        pt: 'Experiência fluida e responsiva que funciona perfeitamente em todos os dispositivos.',
        en: 'Fluid and responsive experience that works perfectly on all devices.'
      },
      'testimonial.title': {
        pt: '👩‍💻 Exemplo real',
        en: '👩‍💻 Real example'
      },
      'testimonial.text': {
        pt: 'Ketlen, uma jovem criadora, montou sua vitrine no Social Link. Em poucos dias, ela já fazia 50 vendas por dia, faturando perto de $1.000 por mês.',
        en: 'Ketlen, a young creator, set up her showcase on Social Link. In just a few days, she was already making 50 sales per day, earning close to $1,000 per month.'
      },
      'testimonial.quote': {
        pt: 'No Linktree as pessoas só clicavam e iam embora. No Social Link, elas conversam comigo — e é isso que fez minhas vendas explodirem.',
        en: 'On Linktree people just clicked and left. On Social Link, they talk to me — and that\'s what made my sales explode.'
      },
      'testimonial.author': {
        pt: '— Ketlen, Criadora de Conteúdo',
        en: '— Ketlen, Content Creator'
      },
      'why.title': {
        pt: '🌟 Por que escolher o Social Link?',
        en: '🌟 Why choose Social Link?'
      },
      'why.showcase': {
        pt: 'Sua Vitrine',
        en: 'Your Showcase'
      },
      'why.showcaseDesc': {
        pt: 'Uma página única e personalizada',
        en: 'A unique and personalized page'
      },
      'why.chat': {
        pt: 'Seu Chat',
        en: 'Your Chat'
      },
      'why.chatDesc': {
        pt: 'Conexão real com sua audiência',
        en: 'Real connection with your audience'
      },
      'why.store': {
        pt: 'Sua Loja',
        en: 'Your Store'
      },
      'why.storeDesc': {
        pt: 'Venda diretamente para seus fãs',
        en: 'Sell directly to your fans'
      },
      'why.description': {
        pt: 'Porque ele vai além de ser só um "link na bio". Ele é sua vitrine, seu chat e sua loja virtual — tudo em um só lugar.',
        en: 'Because it goes beyond being just a "link in bio". It\'s your showcase, your chat and your online store — all in one place.'
      },
      'cta.title': {
        pt: '👉 Comece agora',
        en: '👉 Start now'
      },
      'cta.description': {
        pt: 'Crie sua conta grátis e descubra como transformar sua audiência em clientes fiéis',
        en: 'Create your free account and discover how to turn your audience into loyal customers'
      },
      'cta.learnMore': {
        pt: 'Saiba Mais',
        en: 'Learn More'
      },
      'footer.title': {
        pt: 'Social Link',
        en: 'Social Link'
      },
      'footer.subtitle': {
        pt: 'A evolução do link na bio',
        en: 'The evolution of link in bio'
      },
      'footer.terms': {
        pt: 'Termos de Uso',
        en: 'Terms of Use'
      },
      'footer.privacy': {
        pt: 'Privacidade',
        en: 'Privacy'
      },
      'footer.support': {
        pt: 'Suporte',
        en: 'Support'
      },
      'signingIn': {
        pt: 'Entrando...',
        en: 'Signing in...'
      }
    };

    const translation = landingTranslations[key];
    return translation ? translation[landingLanguage] : key;
  };

  // Se não há usuário, mostrar landing page
  const { user, isLoading: authLoading } = useGoogleAuth();
  
  // Importar componente de mídias compradas
  const PurchasedMediaSection = React.lazy(() => import('@/components/PurchasedMediaSection').then(module => ({ default: module.PurchasedMediaSection })));
  
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Language Selector */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
          <Button
            variant={landingLanguage === 'en' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange('en')}
            className={`text-xs px-3 py-1 rounded-full ${landingLanguage === 'en' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
          >
            EN
          </Button>
          <Button
            variant={landingLanguage === 'pt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange('pt')}
            className={`text-xs px-3 py-1 rounded-full ${landingLanguage === 'pt' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
          >
            PT
          </Button>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {tLanding('title')}
                <span className="block text-2xl md:text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                  {tLanding('subtitle')}
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                {tLanding('description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GoogleAuthButton onLoginSuccess={() => {
                  toast.success('🎉 Login realizado! Redirecionando...');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('auth-success'));
                  }, 1000);
                }} />
                <Button variant="outline" className="px-8 py-3 text-lg border-white/20 text-white hover:bg-white/10">
                  {tLanding('demo')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                🔑 Principais diferenciais
              </h2>
              <p className="text-xl text-gray-300">
                Muito mais que um simples "link na bio"
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="bg-slate-800/80 border-slate-700 p-6">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-white mb-3">Chat integrado</h3>
                <p className="text-gray-300">
                  Seus fãs não só clicam — eles conversam com você. Essa interação direta gera confiança e engajamento imediato.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-slate-800/80 border-slate-700 p-6">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-xl font-bold text-white mb-3">Links de pagamento</h3>
                <p className="text-gray-300">
                  Adicione botões de compra e receba pagamentos de forma simples e rápida.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-slate-800/80 border-slate-700 p-6">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-3">Vitrine personalizada</h3>
                <p className="text-gray-300">
                  Crie uma página exclusiva, com cores, textos, preços, animações e até música de fundo.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="bg-slate-800/80 border-slate-700 p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-3">Estatísticas em tempo real</h3>
                <p className="text-gray-300">
                  Veja curtidas, compartilhamentos e visualizações para entender o que mais atrai sua audiência.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="bg-slate-800/80 border-slate-700 p-6">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-white mb-3">Controle total</h3>
                <p className="text-gray-300">
                  Use cronômetros, senhas, bloqueios automáticos e personalização avançada para proteger seu conteúdo.
                </p>
              </Card>

              {/* Feature 6 */}
              <Card className="bg-slate-800/80 border-slate-700 p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-white mb-3">Interface rápida</h3>
                <p className="text-gray-300">
                  Experiência fluida e responsiva que funciona perfeitamente em todos os dispositivos.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              👩‍💻 Exemplo real
            </h2>
            <Card className="bg-slate-800/80 border-slate-700 p-8">
              <p className="text-lg text-gray-300 mb-6">
                Ketlen, uma jovem criadora, montou sua vitrine no Social Link. Em poucos dias, ela já fazia 50 vendas por dia, faturando perto de $1.000 por mês.
              </p>
              <blockquote className="text-xl font-semibold text-white border-l-4 border-blue-500 pl-6 italic">
                "No Linktree as pessoas só clicavam e iam embora. No Social Link, elas conversam comigo — e é isso que fez minhas vendas explodirem."
              </blockquote>
              <p className="text-blue-400 mt-4 font-medium">— Ketlen, Criadora de Conteúdo</p>
            </Card>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              🌟 Por que escolher o Social Link?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sua Vitrine</h3>
                <p className="text-gray-300">Uma página única e personalizada</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Seu Chat</h3>
                <p className="text-gray-300">Conexão real com sua audiência</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sua Loja</h3>
                <p className="text-gray-300">Venda diretamente para seus fãs</p>
              </div>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Porque ele vai além de ser só um "link na bio". <br />
              Ele é sua vitrine, seu chat e sua loja virtual — tudo em um só lugar.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              👉 Comece agora
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Crie sua conta grátis e descubra como transformar sua audiência em clientes fiéis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GoogleAuthButton onLoginSuccess={() => {
                toast.success('🎉 Login realizado! Redirecionando...');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('auth-success'));
                }, 1000);
              }} />
              <Button variant="outline" className="px-8 py-3 text-lg border-white/20 text-white hover:bg-white/10">
                Saiba Mais
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Social Link</h3>
            <p className="text-gray-400 mb-6">
              A evolução do link na bio
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Termos de Uso
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Privacidade
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Suporte
              </Button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Hook de isolamento de dados DEVE ser chamado primeiro
  const {
    currentUserId,
    isGuest
  } = useDataIsolation();

  // Hook de linguagem
  const { t } = useLanguage();
  
  // Hook de notificações de presentes
  const { pendingGifts, markGiftAsShown } = useGiftNotifications();
  const {
    mediaItems,
    uploadMedia,
    updateMedia,
    deleteMedia,
    setAsMain
  } = useRealtimeMedia();
  const {
    credits,
    isLoading: creditsLoading,
    addCredits,
    subtractCredits,
    isLoggedIn
  } = useUserCredits();
  
  // Deve vir após a declaração do user
  const {
    messages,
    sendMessage,
    updateMessageSpeech,
    clearMessages
  } = useRealtimeMessages(user?.id); // Passar o ID do usuário como creatorId

  // Estado de carregamento de dados
  const {
    isLoading: dataLoading,
    loadingMessage,
    showVitrine: showVitrineLoading
  } = useDataLoadingState();

  // Trial status hook
  const {
    isTrialExpired: trialExpired,
    isTrialActive
  } = useTrialStatus();

  // Importar hook de configurações de visibilidade
  const {
    settings: visibilitySettings
  } = useVisibilitySettings();

  // Inicialização automática do usuário com dados template
  useUserInitialization();
  const {
    trialTimeRemaining,
    isTrialExpired,
    showLoginModal,
    setShowLoginModal,
    formatTrialTime,
    checkTrialAction,
    resetTrial
  } = useTrialTimer(subtractCredits);

  // Reset trial when user logs in
  useEffect(() => {
    if (user) {
      resetTrial();
    }
  }, [user, resetTrial]);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    masterPassword,
    isLocked,
    hasPassword,
    setPassword,
    verifyPassword,
    toggleLock,
    removePassword,
    playAudio,
    setAutoLockTime,
    changePassword
  } = usePasswordProtection();
  const {
    clearNotifications
  } = useNotifications();
  const {
    resetUserData,
    isResetting
  } = useUserReset();

  // Auto-delete expired media
  useMediaTimer(mediaItems, deleteMedia);

  // Media timers hook
  const {
    getTimer,
    formatTime: formatMediaTime
  } = useMediaTimers(mediaId => {
    deleteMedia(mediaId);
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordDialogMode, setPasswordDialogMode] = useState<'set' | 'verify' | 'change'>('set');
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showZoomDialog, setShowZoomDialog] = useState(false);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string>("");
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [timer, setTimer] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newSeconds, setNewSeconds] = useState("");
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [isTimerBlinking, setIsTimerBlinking] = useState(false);
  const [timerTransparentBg, setTimerTransparentBg] = useState(false);
  const [timerEndMessage, setTimerEndMessage] = useState("Tempo Esgotado!");
  const [pendingAction, setPendingAction] = useState<string>("");
  const [tempPassword, setTempPassword] = useState("");
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editLink, setEditLink] = useState("");
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAddCreditsDialog, setShowAddCreditsDialog] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showDeductionNotification, setShowDeductionNotification] = useState(false);
  const [deductedCredits, setDeductedCredits] = useState(0);
  const [addedCredits, setAddedCredits] = useState(0);
  const [iconsExpanded, setIconsExpanded] = useState(true); // Estado para controlar expansão dos ícones
  const [headerVisible, setHeaderVisible] = useState(true); // Estado para controlar visibilidade do header
  const [creditsVisible, setCreditsVisible] = useState(true); // Estado para controlar visibilidade da div de créditos
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verifica se há preferência salva no localStorage
    const saved = localStorage.getItem('auralink-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [slideshowConfig, setSlideshowConfig] = useState({
    slideshowMode: false,
    slideshowInterval: 3,
    currentSlideIndex: 0,
    mediaItems: [] as any[]
  });
  const [slideshowMinimized, setSlideshowMinimized] = useState(false);
  const [hoveredMainMedia, setHoveredMainMedia] = useState(false);
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [showLivePixDialog, setShowLivePixDialog] = useState(false);
  const [showPaymentMethodsDialog, setShowPaymentMethodsDialog] = useState(false);

  // Viewport toggle state
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>({
    name: 'Desktop',
    icon: <Monitor className="w-4 h-4" />,
    width: '100%',
    height: '100vh',
    description: 'Tela cheia do computador'
  });

  // Verificar se veio de pagamento bem-sucedido
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const creditsParam = searchParams.get('credits');
    if (paymentSuccess === 'true' && creditsParam) {
      const creditsAmount = parseInt(creditsParam);
      setAddedCredits(creditsAmount);
      setShowSuccessNotification(true);
      addCredits(creditsAmount);

      // Limpar parâmetros da URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('payment_success');
      newSearchParams.delete('credits');
      setSearchParams(newSearchParams, {
        replace: true
      });
    }
  }, [searchParams, setSearchParams, addCredits]);

  // Estados para gerenciamento de planos premium
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>([{
    id: 'free',
    title: 'Free',
    price: '$0/7 dias',
    description: ['4 slots totais', '3 fotos + 1 vídeo', 'Sem restrição para slot de vídeo', 'Todas as features incluídas'],
    link: 'https://dreamlink.pro/pro',
    stripeProductId: 'prod_SvBWXqVqBH5hlK'
  }, {
    id: 'basic',
    title: 'Basic',
    price: '$9/mês',
    description: ['16 slots totais', '12 fotos + 4 vídeos/mês', '1.300 + 1.812 créditos bônus', 'Sem restrição para slot de vídeo', 'Todas as features incluídas'],
    link: 'https://dreamlink.pro/pro',
    stripeProductId: 'prod_SkHR3k5moylM8t'
  }, {
    id: 'pro',
    title: 'Pro',
    price: '$15/mês',
    description: ['52 slots totais', '40 fotos + 12 vídeos/mês', '3.400 + 1.812 créditos bônus', 'Sem restrição para slot de vídeo', 'Todas as features incluídas'],
    link: 'https://dreamlink.pro/pro',
    stripeProductId: 'prod_SkHY1XdCaL1NZY'
  }, {
    id: 'vip',
    title: 'VIP',
    price: '$25/mês',
    description: ['Slots infinitos', '8.300 + 1.812 créditos bônus/mês', 'Sem restrição para slot de vídeo', 'Todas as features incluídas'],
    link: 'https://dreamlink.pro/pro',
    stripeProductId: 'prod_SkHcmX6aKWG7yi'
  }]);
  const [customAudio, setCustomAudio] = useState<string>(""); // Estado para áudio MP3 personalizado
  const [isPlaying, setIsPlaying] = useState(false); // Estado para controle de reprodução
  const [showMusicEdit, setShowMusicEdit] = useState(false); // Estado para mostrar botão de edit
  const [showButtonEditDialog, setShowButtonEditDialog] = useState(false); // Estado para dialog de edição do botão
  const [buttonText, setButtonText] = useState(t('main.defaultButtonText') || "get cake 🍰"); // Texto do botão
  const [buttonUrl, setButtonUrl] = useState(""); // URL do botão
  const [buttonColor, setButtonColor] = useState("#ef4444"); // Cor do botão
  const [lockMessage, setLockMessage] = useState("Tempo Esgotado!"); // Mensagem personalizada do bloqueio
  const [showLockMessageDialog, setShowLockMessageDialog] = useState(false); // Dialog para editar mensagem
  const [showSocialDialog, setShowSocialDialog] = useState(false); // Dialog para adicionar redes sociais
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false); // Dialog para configurações de visibilidade
  const [purchasedContentMinimized, setPurchasedContentMinimized] = useState(false); // Estado para minimizar conteúdo comprado
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamerImage = "/lovable-uploads/92d5fed3-713a-49da-bf77-d5f86bb21f47.png";

  // Aplicar o modo escuro ao documento
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Salvar preferência no localStorage
    localStorage.setItem('auralink-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      toast.info("⏰ Timer finished!");
      // Bloquear a tela principal quando o timer acabar
      if (!isLocked) {
        toggleLock();
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleLockClick = () => {
    console.log('🔒 Lock button clicked:', {
      hasPassword,
      isLocked,
      masterPassword: masterPassword ? 'SET' : 'NOT_SET'
    });
    if (!hasPassword) {
      console.log('🔒 Opening password dialog to SET password');
      setPasswordDialogMode('set');
      setShowPasswordDialog(true);
    } else if (isLocked) {
      console.log('🔒 Opening password dialog to VERIFY password');
      setPasswordDialogMode('verify');
      setShowPasswordDialog(true);
    } else {
      console.log('🔒 Calling toggleLock to lock system');
      toggleLock();
    }
  };
  const handlePasswordVerification = (action: string, callback: () => void) => {
    if (!hasPassword) {
      setPasswordDialogMode('set');
      setShowPasswordDialog(true);
      setPendingAction(action);
      return;
    }
    if (isLocked) {
      setPasswordDialogMode('verify');
      setShowPasswordDialog(true);
      setPendingAction(action);
      return;
    }
    callback();
  };
  const handlePasswordSet = (password: string, confirmPassword: string) => {
    setPassword(password, confirmPassword);
    if (pendingAction) {
      setTimeout(() => {
        const callback = () => {
          console.log("Executing pending action:", pendingAction);
        };
        callback();
        setPendingAction("");
      }, 100);
    }
  };
  const handlePasswordChange = async (currentPassword: string, newPassword: string, confirmPassword: string, autoLockMinutes?: number) => {
    try {
      await changePassword(currentPassword, newPassword, confirmPassword, autoLockMinutes);
      setShowPasswordDialog(false);
    } catch (error) {
      throw error;
    }
  };
  const handleSaveTimeOnly = async (autoLockMinutes: number) => {
    try {
      await setAutoLockTime(autoLockMinutes);
      setShowPasswordDialog(false);
    } catch (error) {
      toast.error(`❌ ${(error as Error).message}`);
    }
  };
  const handlePasswordVerify = (password: string) => {
    const success = verifyPassword(password);
    if (success && pendingAction) {
      setTimeout(() => {
        const callback = () => {
          console.log("Executing pending action:", pendingAction);
        };
        callback();
        setPendingAction("");
      }, 100);
    }
    return success;
  };
  const handleAudioPlay = (text: string) => {
    console.log('Botão de áudio clicado, texto:', text);
    playAudio(text);
  };

  // Helper function to handle credit deduction with notification
  const handleCreditDeduction = (amount: number) => {
    if (!user) {
      subtractCredits(amount);
      setDeductedCredits(amount);
      setShowDeductionNotification(true);
    }
  };
  const handleImageUpload = async () => {
    if (!user && !checkTrialAction()) return;
    fileInputRef.current?.click();
  };
  const handleVideoUpload = async () => {
    if (!user && !checkTrialAction()) return;
    videoInputRef.current?.click();
  };
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user && !checkTrialAction()) return;
    if (!user && credits <= 0) {
      toast.error('🔒 Seus créditos expiraram! Faça login para continuar.');
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      handleCreditDeduction(4); // Descontar 4 créditos por upload
      await uploadMedia(file, 'image');
      toast.success("📤 Image uploaded!");
    }
  };
  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user && !checkTrialAction()) return;
    if (!user && credits <= 0) {
      toast.error('🔒 Seus créditos expiraram! Faça login para continuar.');
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      handleCreditDeduction(4); // Descontar 4 créditos por upload
      await uploadMedia(file, 'video');
      toast.success("🎥 Video uploaded!");
    }
  };
  const savePriceEdit = async () => {
    if (editingMediaId && editPrice.trim()) {
      await updateMedia(editingMediaId, {
        price: editPrice
      });
      setShowPriceDialog(false);
      setEditPrice("");
      setEditingMediaId(null);
      toast.success("💰 Price updated!");
    }
  };
  const saveLinkEdit = async () => {
    if (editingMediaId && editLink.trim()) {
      await updateMedia(editingMediaId, {
        link: editLink
      });
      setShowLinkDialog(false);
      setEditLink("");
      setEditingMediaId(null);
      toast.success("🔗 Link updated!");
    }
  };
  const handleImageUploadFromSettings = async (file: File) => {
    handleCreditDeduction(4); // Descontar 4 créditos por upload
    await uploadMedia(file, 'image');
  };
  const handleVideoUploadFromSettings = async (file: File) => {
    handleCreditDeduction(4); // Descontar 4 créditos por upload
    await uploadMedia(file, 'video');
  };
  const toggleMediaProperty = async (id: string, property: string) => {
    const item = mediaItems.find(item => item.id === id);
    if (item) {
      if (item.is_locked && property !== 'is_locked') {
        toast.error("🔒 Media locked! Unlock first to edit.");
        return;
      }
      await updateMedia(id, {
        [property]: !item[property as keyof typeof item]
      });
    }
  };
  const openZoom = (url: string) => {
    console.log('openZoom called with url:', url);
    console.log('Setting zoomedImage to:', url);
    setZoomedImage(url);
    setShowFullscreenImage(true);
    console.log('showFullscreenImage set to true');
  };
  const handleMediaClick = (item: any) => {
    if (item.link) {
      window.open(item.link, '_blank');
    } else if (!item.is_locked) {
      openZoom(item.url);
    }
  };
  const handleEditMedia = (item: any) => {
    handlePasswordVerification(`edit-media-${item.id}`, () => {
      setEditingMedia(item);
      setShowMediaForm(true);
    });
  };
  const handleGetCake = () => {
    if (buttonUrl) {
      window.open(buttonUrl, "_blank");
    } else {
      window.open("https://www.google.com", "_blank");
    }
  };
  const handleSaveButtonEdit = () => {
    setShowButtonEditDialog(false);
    toast.success("✏️ Button updated!");
  };
  const handlePlanClick = (planName: string) => {
    window.open("https://www.google.com", "_blank");
  };
  const editMessageSpeech = (message: any) => {
    handlePasswordVerification("edit-speech", () => {
      setEditingMessage(message);
      setShowEditDialog(true);
    });
  };
  const saveEditedMessage = async (newSpeech: string) => {
    if (editingMessage) {
      await updateMessageSpeech(editingMessage.id, newSpeech);
      setShowEditDialog(false);
      setEditingMessage(null);
      toast.success("✏️ Message edited!");
    }
  };
  const setNewTimer = () => {
    const minutes = parseInt(newTime) || 0;
    const seconds = parseInt(newSeconds) || 0;
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setTimer(totalSeconds);
      setIsTimerRunning(true);
      setShowTimerDialog(false);
      setNewTime("");
      setNewSeconds("");
      const timeDisplay = minutes > 0 && seconds > 0 ? `${minutes} minutos e ${seconds} segundos` : minutes > 0 ? `${minutes} minutos` : `${seconds} segundos`;
      toast.success(`⏱️ Timer definido para ${timeDisplay}!`);
    }
  };
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimer(300);
    setNewTime("");
    setNewSeconds("");
    toast.success("⏱️ Timer resetado!");
  };
  const handleSaveState = () => {
    const state = {
      mediaItems,
      messages,
      timer,
      isTimerRunning,
      hasPassword,
      masterPassword
    };
    localStorage.setItem('linkchatTV_state', JSON.stringify(state));
  };
  const handleLoadState = () => {
    const savedState = localStorage.getItem('linkchatTV_state');
    if (savedState) {
      const state = JSON.parse(savedState);
      toast.success("📂 State loaded from local storage!");
    } else {
      toast.error("❌ No saved state found!");
    }
  };

  // Funções para controlar o áudio MP3 personalizado
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const audioUrl = e.target?.result as string;
        setCustomAudio(audioUrl);
        toast.success("🎵 Audio uploaded!");
        setShowMusicEdit(false);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("❌ Please select a valid MP3 file");
    }
  };
  const toggleAudioPlay = () => {
    if (!customAudio) {
      toast.error("❌ No audio file uploaded");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      toast.info("⏸️ Audio paused");
    } else {
      audio.play();
      setIsPlaying(true);
      toast.success("▶️ Playing audio");
    }
  };
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };
  const mainMedia = mediaItems.find(item => item.is_main) || {
    storage_path: streamerImage,
    is_blurred: false,
    price: "",
    type: 'image' as const
  };

  // Get timer for main media if it has one
  const mainMediaTimer = (mainMedia as any).id ? getTimer((mainMedia as any).id) : null;

  // Mostrar tela de loading durante carregamento inicial
  if (dataLoading || authLoading) {
    return <AuthLoadingScreen message={loadingMessage} showVitrine={showVitrineLoading} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4">

      <div className="max-w-2xl mx-auto space-y-4" style={{
      width: currentViewport.width !== '100%' ? currentViewport.width : undefined,
      maxWidth: currentViewport.width !== '100%' ? currentViewport.width : '2xl',
      height: currentViewport.height !== '100vh' ? currentViewport.height : undefined,
      maxHeight: currentViewport.height !== '100vh' ? currentViewport.height : undefined,
      margin: currentViewport.width !== '100%' ? '0 auto' : undefined,
      overflow: currentViewport.width !== '100%' || currentViewport.height !== '100vh' ? 'auto' : undefined,
      border: currentViewport.width !== '100%' || currentViewport.height !== '100vh' ? '2px solid hsl(var(--border))' : undefined,
      borderRadius: currentViewport.width !== '100%' || currentViewport.height !== '100vh' ? '12px' : undefined,
      boxShadow: currentViewport.width !== '100%' || currentViewport.height !== '100vh' ? '0 10px 30px -10px rgba(0,0,0,0.3)' : undefined
    }}>
        
        <SupabaseStatus />

        {/* Social Link Brand Header */}
        {headerVisible && (
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Logo with Brand Name */}
            <div className="flex items-center justify-center space-x-4">
              <img 
                src="/lovable-uploads/f6e8b19f-3057-43cd-92ce-50c158b9bb7f.png" 
                alt="Social Link Logo" 
                className="h-20 sm:h-24 w-auto"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Social Link
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium">
                  For Influencers, Creators & Sellers
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Hide/Show Header Icon */}
        <Button
          onClick={() => setHeaderVisible(!headerVisible)}
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-primary/10"
        >
          {headerVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        {/* Hide/Show Credits Icon - Below Eye Icon */}
        <Button
          onClick={() => setCreditsVisible(!creditsVisible)}
          variant="ghost"
          size="sm"
          className="fixed top-16 left-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-primary/10"
        >
          <Coins className="w-4 h-4" />
        </Button>


        {/* Layout responsivo mobile-first */}
        {creditsVisible && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-4 sm:gap-2">
          
          {/* Controles da esquerda - Mobile: ocupam linha completa, Desktop: lado esquerdo */}
          <div className="flex flex-col items-start gap-2 sm:flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-6 py-2">
                
              </Button>

              <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-2 animate-[pulse_3s_ease-in-out_infinite]">
                    <Crown className="w-4 h-4 mr-2" />
                    BE PREMIUM
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
                  <PremiumPlansManager plans={premiumPlans} onPlansUpdate={setPremiumPlans} disabled={hasPassword && isLocked} isUserView={true} />
                </DialogContent>
              </Dialog>

              <CheckoutTransparenteDialog>
                <Button className="hidden bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2">
                  <CreditCard className="w-4 h-4 mr-2" />
                  CHECKOUT
                </Button>
              </CheckoutTransparenteDialog>
              
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2">
                
              </Button>


              <div className="flex items-center gap-2">
                <Button onClick={() => setShowPixDialog(true)} className="bg-green-600 hover:bg-green-700 rounded-full px-6 py-2 flex items-center gap-2">
                  💳 {t('main.usePix')}
                </Button>
              </div>

              

              

               <Button onClick={() => setShowAddCreditsDialog(true)} className="bg-green-500 hover:bg-green-600 rounded-full px-6 py-2 flex items-center gap-1.5 animate-pulse">
                <div className="w-2 h-2 rounded-full animate-blink-circle"></div>
                <span className="text-foreground font-medium">
                  {creditsLoading ? '...' : credits}
                </span>
                <span className="text-red-500 animate-blink-red font-medium">{t('main.getCredits')}</span>
              </Button>

            </div>
            
            {/* Botão para configurar visibilidade */}
            
          </div>

          {/* Logo centralizado - espaço vazio agora */}
          <div className="flex items-center justify-center sm:flex-1 sm:mx-4">
            <div className="flex flex-col items-center gap-1">
              <div className="text-center">
                
              </div>
            </div>
          </div>

          {/* Espaço vazio para manter layout equilibrado */}
          <div className="flex items-center justify-end gap-2 sm:flex-shrink-0">
            {/* Espaço reservado para manter simetria */}
          </div>
        </div>
        )}

        {/* Controles reposicionados - barra vertical direita */}
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 rounded-lg p-3">
          {/* ViewportToggle */}
          <ViewportToggle currentViewport={currentViewport} onViewportChange={setCurrentViewport} />
          
          {/* Hide/Show Credits Icon */}
          <Button
            onClick={() => setCreditsVisible(!creditsVisible)}
            variant="ghost"
            size="sm"
            className="bg-background/80 backdrop-blur-sm hover:bg-primary/10"
          >
            <Coins className="w-4 h-4" />
          </Button>
          
          {/* Ícones controláveis com transição */}
          <div className={`flex flex-col items-center gap-2 transition-all duration-300 ease-in-out ${iconsExpanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
            <Button size="sm" onClick={() => {
              const newMode = !isDarkMode;
              setIsDarkMode(newMode);
              toast.info(newMode ? `🌙 ${t('main.darkModeActivated')}` : `☀️ ${t('main.lightModeActivated')}`);
            }} className={`bg-transparent hover:bg-muted/10 transition-all duration-300 ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-600 hover:text-slate-500'}`} title={isDarkMode ? t('main.lightMode') : t('main.darkMode')}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={() => handlePasswordVerification("set-timer", () => setShowTimerDialog(true))} className="bg-transparent hover:bg-muted/10 transition-all duration-300 text-slate-600 hover:text-slate-500" title={t('main.timer')} disabled={hasPassword && isLocked}>
              <Timer className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleLockClick} className={`
              bg-transparent hover:bg-muted/10 transition-all duration-300 hover:scale-105
              ${isLocked ? 'text-destructive hover:text-red-600 animate-pulse' : 'text-muted-foreground hover:text-primary'}
            `} title={hasPassword ? isLocked ? "Sistema bloqueado - clique para desbloquear" : "Sistema desbloqueado - clique para bloquear" : "Definir senha de segurança"}>
              <div className={`transition-transform duration-300 ${isLocked ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}`}>
                {hasPassword ? isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
            </Button>
            <ProfileDialog masterPassword={masterPassword} passwordSet={hasPassword} onPasswordSet={password => {
              try {
                setPassword(password, password);
                toast.success("🔐 Senha definida!");
              } catch (error) {
                toast.error(`❌ ${(error as Error).message}`);
              }
            }} onPasswordRemove={removePassword} onClearChat={clearMessages} disabled={hasPassword && isLocked} />
            
            <Button size="sm" onClick={() => setShowNotificationDialog(true)} className="bg-transparent hover:bg-muted/10 text-muted-foreground" title={t('main.notifications')}>
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* Trial Timer */}
            {isTrialActive && <TrialTimer />}
            
            <GoogleAuthButton onLoginSuccess={() => {
              // Interface já permanece consistente - apenas mostrar dialog sem forçar re-renders
              setTimeout(() => {
                setShowUserDialog(true);
              }, 200);
            }} />
            
            <MenuDropdown onImageUpload={handleImageUploadFromSettings} onVideoUpload={handleVideoUploadFromSettings} onSaveState={handleSaveState} onLoadState={handleLoadState} onTimerClick={() => handlePasswordVerification("set-timer", () => setShowTimerDialog(true))} disabled={hasPassword && isLocked} />
          </div>

          {/* Seta de controle */}
          <Button size="sm" onClick={() => setIconsExpanded(!iconsExpanded)} className="bg-muted hover:bg-muted/90 text-muted-foreground rounded-full p-1.5 transition-all duration-300 hover:scale-110" title={iconsExpanded ? t('main.collapseIcons') : t('main.expandIcons')}>
            <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${iconsExpanded ? 'rotate-180' : 'rotate-0'}`} />
          </Button>
        </div>

        {visibilitySettings.showMainMediaDisplay && <>
            <div className="relative w-screen h-screen fixed inset-0">
              {/* Timer principal no canto superior quando ativo */}
              {isTimerRunning && timer > 0 && <div className={`absolute top-4 left-4 z-30 rounded-lg px-4 py-2 border shadow-lg ${timerTransparentBg ? 'bg-transparent border-white/40' : 'bg-black/80 backdrop-blur-sm border-white/20'}`}>
                  <div className={`flex items-center gap-2 text-white font-bold text-lg ${timer <= 30 ? 'animate-pulse text-red-400' : isTimerBlinking ? 'animate-[pulse_1s_ease-in-out_infinite] text-white' : 'text-white'}`}>
                    <span className="text-yellow-400 text-xl">⏱️</span>
                    <span className={timer <= 30 ? 'text-red-400' : isTimerBlinking ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}>
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>}

              {/* Bloqueio da tela principal quando timer acabar ou sistema estiver bloqueado */}
              {(timer === 0 || hasPassword && isLocked) && <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm rounded-lg">
                  <div className="bg-foreground/90 text-background p-6 rounded-xl shadow-2xl border border-white/20">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-xl font-bold mb-2">
                        {timer === 0 ? timerEndMessage : t('main.systemLocked')}
                      </h3>
                      <p className="text-sm opacity-80">
                        {timer === 0 ? t('main.timerEnded') : t('main.accessRestricted')}
                      </p>
                    </div>
                  </div>
                </div>}

              {/* Timer do cronômetro da mídia principal no canto superior */}
              {mainMediaTimer && mainMediaTimer.isActive && <div className="absolute top-4 right-4 z-30 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 shadow-lg">
                  <div className={`flex items-center gap-2 text-white font-bold text-sm ${mainMediaTimer.remainingSeconds <= 10 ? 'animate-pulse text-red-400' : 'animate-[fade_2s_ease-in-out_infinite_alternate]'}`}>
                    <span className="text-yellow-400">⏱️</span>
                    <span className={mainMediaTimer.remainingSeconds <= 10 ? 'text-red-400' : 'text-white'}>
                      {formatMediaTime(mainMediaTimer.remainingSeconds)}
                    </span>
                  </div>
                </div>}

              {mainMedia.type === 'video' ? <video 
                src={getMediaUrl(mainMedia.storage_path)} 
                poster={getMediaUrl(mainMedia.storage_path)}
                preload="metadata"
                muted
                playsInline
                controls 
                className={`w-full h-full object-cover cursor-pointer transition-all duration-300 ${mainMedia.is_blurred && (!('hover_unblur' in mainMedia && mainMedia.hover_unblur) || !hoveredMainMedia) || timer === 0 || hasPassword && isLocked ? 'blur-md' : ''}`} 
                onClick={() => handleMediaClick(mainMedia)} 
                title={(mainMedia as any).description || "Main display"} 
                onMouseEnter={() => {
            if ('hover_unblur' in mainMedia && mainMedia.hover_unblur && mainMedia.is_blurred) {
              setHoveredMainMedia(true);
            }
          }} onMouseLeave={() => {
            if ('hover_unblur' in mainMedia && mainMedia.hover_unblur && mainMedia.is_blurred) {
              setHoveredMainMedia(false);
            }
          }} /> : <img src={getMediaUrl(mainMedia.storage_path)} alt="Streamer" className={`w-full h-full object-cover cursor-pointer transition-all duration-300 ${mainMedia.is_blurred && (!('hover_unblur' in mainMedia && mainMedia.hover_unblur) || !hoveredMainMedia) || timer === 0 || hasPassword && isLocked ? 'blur-md' : ''}`} onClick={() => handleMediaClick(mainMedia)} title={(mainMedia as any).description || "Main display"} onError={e => {
            const target = e.target as HTMLImageElement;
            console.error('❌ Media image failed to load', {
              storage_path: mainMedia.storage_path,
              resolved_url: getMediaUrl(mainMedia.storage_path)
            });
            target.src = `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&h=600`;
          }} loading="lazy" onMouseEnter={() => {
            if ('hover_unblur' in mainMedia && mainMedia.hover_unblur && mainMedia.is_blurred) {
              setHoveredMainMedia(true);
            }
          }} onMouseLeave={() => {
            if ('hover_unblur' in mainMedia && mainMedia.hover_unblur && mainMedia.is_blurred) {
              setHoveredMainMedia(false);
            }
          }} />}
              {mainMedia.is_blurred && mainMedia.price && !isLocked && !(hasPassword && isLocked) && timer !== 0 && <div className="absolute inset-0 flex items-center justify-center" style={{
            display: 'none',
            opacity: 0
          }}>
                  <div className="bg-foreground/70 text-background font-bold px-4 py-2 rounded-lg text-lg" style={{
              display: 'none'
            }}>
                    
                  </div>
                </div>}
              <Button className="absolute bottom-4 right-4 rounded-full p-2 bg-card/80 hover:bg-card border" onClick={() => {
            console.log('Zoom button clicked');
            console.log('mainMedia:', mainMedia);
            const url = getMediaUrl(mainMedia.storage_path);
            console.log('Generated URL:', url);
            openZoom(url);
          }}>
                <ZoomIn className="w-5 h-5 text-foreground" />
              </Button>
            </div>

            <MediaShowcase mediaItems={mediaItems} onUploadImage={file => {
          if (hasPassword && isLocked) {
            handlePasswordVerification("upload-image", () => {
              handleCreditDeduction(4); // Descontar 4 créditos por upload
              uploadMedia(file, 'image');
            });
          } else {
            handleCreditDeduction(4); // Descontar 4 créditos por upload
            uploadMedia(file, 'image');
          }
        }} onUploadVideo={file => {
          if (hasPassword && isLocked) {
            handlePasswordVerification("upload-video", () => {
              handleCreditDeduction(4); // Descontar 4 créditos por upload
              uploadMedia(file, 'video');
            });
          } else {
            handleCreditDeduction(4); // Descontar 4 créditos por upload
            uploadMedia(file, 'video');
          }
        }} onReplaceMedia={async (id, file) => {
          if (hasPassword && isLocked) {
            handlePasswordVerification("replace-media", async () => {
              const success = await subtractCredits(4, "Troca de mídia");
              if (success) {
                await uploadMedia(file, file.type.startsWith('image/') ? 'image' : 'video');
                await deleteMedia(id);
              }
            });
          } else {
            const success = await subtractCredits(4, "Troca de mídia");
            if (success) {
              await uploadMedia(file, file.type.startsWith('image/') ? 'image' : 'video');
              await deleteMedia(id);
            }
          }
        }} onUpdateMedia={updateMedia} onDeleteMedia={id => {
          handlePasswordVerification(`delete-${id}`, () => {
            deleteMedia(id);
            toast.success("🗑️ Mídia deletada!");
          });
        }} onSetAsMain={setAsMain} onEditMedia={handleEditMedia} onSetPrice={id => {
          handlePasswordVerification(`set-price-${id}`, () => {
            setEditingMediaId(id);
            const item = mediaItems.find(item => item.id === id);
            setEditPrice(item?.price || "");
            setShowPriceDialog(true);
          });
        }} onSetLink={id => {
          handlePasswordVerification(`set-link-${id}`, () => {
            setEditingMediaId(id);
            const item = mediaItems.find(item => item.id === id);
            setEditLink(item?.link || "");
            setShowLinkDialog(true);
          });
        }} passwordProtected={hasPassword && isLocked} onPasswordVerify={handlePasswordVerification} credits={credits} onAddCredits={addCredits} onSubtractCredits={subtractCredits} onSlideshowConfigChange={setSlideshowConfig} visibilitySettings={visibilitySettings} creatorId={user?.id} onTogglePurchasedContent={setPurchasedContentMinimized} />
          </>}



        {/* Slideshow Display - apenas se não estiver minimizado */}
        <SlideshowDisplay mediaItems={slideshowConfig.mediaItems} currentIndex={slideshowConfig.currentSlideIndex} isActive={slideshowConfig.slideshowMode && !slideshowMinimized} onMinimize={() => {
        setSlideshowMinimized(true);
        toast.info("🎬 Slideshow minimizado - continue navegando normalmente!");
      }} onClose={() => {
        setSlideshowConfig(prev => ({
          ...prev,
          slideshowMode: false
        }));
        setSlideshowMinimized(false);
        toast.info("⏹️ Slideshow finalizado");
      }} />

        {/* Indicador de slideshow minimizado */}
        {slideshowConfig.slideshowMode && slideshowMinimized && <div className="fixed bottom-4 right-4 z-40 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white text-sm">
                <span className="animate-pulse">🎬</span>
                <span>Slideshow ativo ({slideshowConfig.currentSlideIndex + 1}/{slideshowConfig.mediaItems.length})</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setSlideshowMinimized(false)} size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full bg-white/20 hover:bg-white/40 text-white" title="Maximizar slideshow">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button onClick={() => {
              setSlideshowConfig(prev => ({
                ...prev,
                slideshowMode: false
              }));
              setSlideshowMinimized(false);
            }} size="sm" variant="ghost" className="h-6 w-6 p-0 rounded-full bg-red-500/70 hover:bg-red-600/90 text-white" title="Fechar slideshow">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>}

        {visibilitySettings.showChat && <div className="relative">
            <Card className="p-4 bg-card border">
              <EnhancedChat 
                messages={messages} 
                onSendMessage={sendMessage} 
                onEditMessage={editMessageSpeech} 
                passwordProtected={hasPassword && isLocked} 
                onPasswordVerify={callback => handlePasswordVerification("edit-message", callback)} 
                onTrialCheck={user ? undefined : checkTrialAction} 
                onSubtractCredits={async (amount, action) => await subtractCredits(amount, action)} 
                credits={credits} 
                isLoggedIn={isLoggedIn} 
                creatorId={user?.id}
                visibilitySettings={{
                  showChatEditing: visibilitySettings.showChatEditing,
                  showChatCloseIcon: visibilitySettings.showChatCloseIcon
                }} 
              />
            </Card>
          </div>}

        {/* Seção de Mídias Compradas */}
        {user && !purchasedContentMinimized && (
          <React.Suspense fallback={<div className="p-4">Carregando mídias compradas...</div>}>
            <PurchasedMediaSection onSetAsMain={setAsMain} />
          </React.Suspense>
        )}

        {/* Componente de Teste de Visibilidade - apenas para desenvolvimento */}
        {user && <VisibilityTestComponent />}

        <MediaForm isOpen={showMediaForm} onClose={() => setShowMediaForm(false)} mediaItem={editingMedia} onUpdate={updateMedia} />

        <PasswordDialog isOpen={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} mode={passwordDialogMode} onPasswordSet={handlePasswordSet} onPasswordVerify={handlePasswordVerify} onPasswordChange={handlePasswordChange} onSaveTimeOnly={handleSaveTimeOnly} userEmail={user?.email} />

        <Dialog open={showZoomDialog} onOpenChange={setShowZoomDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 relative">
            <DialogHeader className="sr-only">
              <DialogTitle>Zoom da Imagem</DialogTitle>
            </DialogHeader>
            <Button className="absolute top-2 right-2 rounded-full p-2 bg-foreground/50 hover:bg-foreground/70 z-50" onClick={() => {
            console.log('Close button clicked');
            setShowZoomDialog(false);
          }}>
              <X className="w-4 h-4 text-background" />
            </Button>
            {zoomedImage ? <img src={zoomedImage} alt="Zoomed image" className="w-full h-full object-contain rounded-lg" onLoad={() => console.log('Image loaded successfully')} onError={e => console.log('Image load error:', e)} /> : <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhuma imagem para exibir
              </div>}
          </DialogContent>
        </Dialog>

        <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>💰 Define Price</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Ex: $9.99" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
              <Button onClick={savePriceEdit} className="w-full">
                Save Price
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🔗 Define Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="https://exemplo.com" value={editLink} onChange={e => setEditLink(e.target.value)} />
              <Button onClick={saveLinkEdit} className="w-full">
                Save Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>✏️ Edit Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input defaultValue={editingMessage?.speech || ""} onChange={e => setEditingMessage(prev => prev ? {
              ...prev,
              speech: e.target.value
            } : null)} />
              <Button onClick={() => saveEditedMessage(editingMessage?.speech || "")} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showTimerDialog} onOpenChange={setShowTimerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>⏱️ Configurar Timer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minutos</label>
                  <Input type="number" placeholder="0" value={newTime} onChange={e => setNewTime(e.target.value)} min="0" max="999" />
                </div>
                <div>
                  <label className="text-sm font-medium">Segundos</label>
                  <Input type="number" placeholder="0" value={newSeconds} onChange={e => setNewSeconds(e.target.value)} min="0" max="59" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="timer-blink" checked={isTimerBlinking} onChange={e => setIsTimerBlinking(e.target.checked)} className="rounded" />
                <label htmlFor="timer-blink" className="text-sm font-medium">
                  ✨ Fazer timer piscar
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="timer-transparent" checked={timerTransparentBg} onChange={e => setTimerTransparentBg(e.target.checked)} className="rounded" />
                <label htmlFor="timer-transparent" className="text-sm font-medium">
                  🔳 Plano de fundo transparente
                </label>
              </div>
              
              <div>
                <label className="text-sm font-medium">Mensagem quando acabar</label>
                <Input placeholder="Ex: Tempo Esgotado!" value={timerEndMessage} onChange={e => setTimerEndMessage(e.target.value)} />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={setNewTimer} className="flex-1">
                  ⏱️ Iniciar Timer
                </Button>
                <Button onClick={resetTimer} variant="outline" className="flex-1">
                  🔄 Resetar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showButtonEditDialog} onOpenChange={setShowButtonEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>✏️ Edit Button</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Button Text</label>
                <Input placeholder={`Ex: ${t('main.defaultButtonText')}`} value={buttonText} onChange={e => setButtonText(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">URL (optional)</label>
                <Input placeholder="https://example.com" value={buttonUrl} onChange={e => setButtonUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Button Color</label>
                <Input type="color" value={buttonColor} onChange={e => setButtonColor(e.target.value)} className="h-12" />
              </div>
              <Button onClick={handleSaveButtonEdit} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showLockMessageDialog} onOpenChange={setShowLockMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🔒 Configurar Mensagem do Bloqueio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mensagem personalizada</label>
                <Input placeholder="Ex: Tempo Esgotado!" value={lockMessage} onChange={e => setLockMessage(e.target.value)} />
              </div>
              <Button onClick={() => {
              setShowLockMessageDialog(false);
              toast.success("🔒 Mensagem do bloqueio atualizada!");
            }} className="w-full">
                Salvar Mensagem
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>🔔 Notificações</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowNotificationDialog(false)} className="text-muted-foreground hover:text-destructive" title="Fechar notificações">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <NotificationsList />
            </div>
          </DialogContent>
        </Dialog>

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
        <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />

        {/* Audio player element */}
        {customAudio && <audio ref={audioRef} src={customAudio} onEnded={handleAudioEnd} style={{
        display: 'none'
      }} />}

        <UserFloatingDialog isOpen={showUserDialog} onClose={() => setShowUserDialog(false)} />

        <AddCreditsDialog open={showAddCreditsDialog} onOpenChange={setShowAddCreditsDialog} />

        <SocialMediaDialog isOpen={showSocialDialog} onClose={() => setShowSocialDialog(false)} network={null} onSave={updates => {
        toast.success("🔗 Rede social adicionada!");
        setShowSocialDialog(false);
      }} />

        {showSuccessNotification && <CreditSuccessNotification credits={addedCredits} onClose={() => setShowSuccessNotification(false)} />}

        {showDeductionNotification && <CreditDeductionNotification credits={deductedCredits} onClose={() => setShowDeductionNotification(false)} />}

        {/* Dialog de configurações de visibilidade */}
        <VisibilitySettingsDialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog} />

        {/* PIX Payment Dialog */}
        <PixPaymentDialog isOpen={showPixDialog} onClose={() => setShowPixDialog(false)} />

        {/* LivePix Payment Dialog */}
        <LivePixPaymentDialog isOpen={showLivePixDialog} onClose={() => setShowLivePixDialog(false)} />

        {/* Payment Methods Dialog */}
        <PaymentMethodsDialog isOpen={showPaymentMethodsDialog} onClose={() => setShowPaymentMethodsDialog(false)} />

      </div>


      {/* Forced Login Dialog - aparece quando trial expira */}
      <ForcedLoginDialog isOpen={showLoginModal && !user} onClose={() => setShowLoginModal(false)} />

      {/* Fullscreen Image Overlay */}
      {showFullscreenImage && zoomedImage && <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-pointer" onClick={() => setShowFullscreenImage(false)}>
          <Button className="absolute top-4 right-4 rounded-full p-3 bg-white/20 hover:bg-white/30 z-[101]" onClick={e => {
        e.stopPropagation();
        setShowFullscreenImage(false);
      }}>
            <X className="w-6 h-6 text-white" />
          </Button>
          <img src={zoomedImage} alt="Fullscreen image" className="max-w-[95vw] max-h-[95vh] object-contain" onClick={e => e.stopPropagation()} />
        </div>}
      
      {/* Gift Welcome Messages */}
      {pendingGifts.map((gift) => (
        <WelcomeGiftMessage
          key={gift.id}
          giftId={gift.id}
          creatorName={gift.creator_name}
          credits={gift.credits_amount}
          message={gift.message}
          onClose={() => markGiftAsShown(gift.id)}
        />
      ))}
      
       {/* Sales History Button */}
       <SalesHistoryButton />
       
       {/* Componente de teste Supabase - apenas para debug */}
       {process.env.NODE_ENV === 'development' && <SupabaseTestComponent />}
     </div>;
 };
export default Index;