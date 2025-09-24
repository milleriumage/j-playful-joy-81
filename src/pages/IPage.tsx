import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, MessageSquare, ThumbsUp, ChevronRight, Eye, Copy, DollarSign, Smartphone, Laptop, Tablet, Key, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import { getMediaUrl } from "@/lib/mediaUtils";
import { useSubscription } from '@/hooks/useSubscription';
import { useAccessVerification } from '@/hooks/useAccessVerification';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StripePublicKeyDialog } from '@/components/StripePublicKeyDialog';
import SupportBubble from '@/components/SupportBubble';
// Usando imagem placeholder temporária
const profileImage = '/lovable-uploads/4bb15841-814d-4462-aa20-1488516e0562.png';

// Componente 3D para a imagem rotativa
function RotatingCard() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(profileImage);
  useFrame(state => {
    if (meshRef.current) {
      // Rotação automática suave
      meshRef.current.rotation.y += hovered ? 0.02 : 0.005;
      // Efeito de flutuação
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  return <mesh ref={meshRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} scale={hovered ? 1.1 : 1}>
      <planeGeometry args={[3, 4]} />
      <meshStandardMaterial map={texture} transparent />
    </mesh>;
}

// Ícones flutuantes
const FloatingIcon = ({
  icon: Icon,
  position,
  color,
  delay
}: any) => {
  return <div className={`absolute ${position} ${color} p-3 rounded-full shadow-lg animate-bounce`} style={{
    animationDelay: `${delay}s`,
    animationDuration: '3s'
  }}>
      <Icon size={24} />
    </div>;
};
export default function IPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [creatorPages, setCreatorPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'laptop'>('laptop');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [accessTimeout, setAccessTimeout] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showStripeKeyDialog, setShowStripeKeyDialog] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  const defaultUserId = '171c4bb2-9fdd-4c5e-a340-c3f2c8c89e07';
  const {
    createCheckout,
    isLoggedIn
  } = useSubscription();
  const {
    hasAccess,
    isLoading: accessLoading,
    user
  } = useAccessVerification();
  const { signInWithGoogle, session } = useGoogleAuth();
  // Timeout para aguardar verificação de acesso
  useEffect(() => {
    const timer = setTimeout(() => {
      setAccessTimeout(true);
    }, 3000); // 3 segundos para verificação

    return () => clearTimeout(timer);
  }, []);

  // Redirecionamento após login/cadastro bem-sucedido - OTIMIZADO
  useEffect(() => {
    if (session && user) {
      console.log('🔄 Usuário logado detectado, redirecionando...', { user: user.id, session: !!session });
      toast.success("🎉 Login realizado! Redirecionando...");
      setTimeout(() => {
        // Usar navigate ao invés de window.location.href
        window.location.href = '/dashboard';
      }, 1000);
    }
  }, [session, user]);
  useEffect(() => {
    const initializePage = async () => {
      try {
        await fetchUsers();
        await loadCreatorPages();
      } catch (error) {
        console.error('Error initializing page:', error);
      }
    };
    initializePage();
  }, []);
  const fetchUsers = async () => {
    try {
      const {
        data: profiles,
        error
      } = await supabase.from('profiles').select('*').limit(10);
      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }
      if (profiles && profiles.length > 0) {
        // Encontrar o usuário padrão e colocá-lo no início
        const defaultUserIndex = profiles.findIndex(p => p.user_id === defaultUserId);
        let sortedProfiles = [...profiles];
        if (defaultUserIndex > -1) {
          // Move o usuário padrão para o início
          const defaultUser = sortedProfiles.splice(defaultUserIndex, 1)[0];
          sortedProfiles.unshift(defaultUser);
        }
        setUsers(sortedProfiles);
        setCurrentUser(sortedProfiles[0]);
        setCurrentUserIndex(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const loadCreatorPages = async () => {
    // Páginas disponíveis do criador
    const pages = [{
      id: '1',
      name: 'User View - Social Link',
      route: '/user/171c4bb2-9fdd-4c5e-a340-c3f2c8c89e07',
      thumbnail: '/lovable-uploads/661650dd-7dc7-4a01-8963-5b89882f52f0.png',
      description: '👤 Página principal do criador - User View'
    }, {
      id: '3',
      name: 'CleanPanel Style',
      route: '/cleanpanel',
      thumbnail: '/lovable-uploads/661650dd-7dc7-4a01-8963-5b89882f52f0.png',
      description: 'Interface limpa e minimalista para seu conteúdo digital'
    }, {
      id: '6',
      name: 'StreamPanel Style',
      route: '/streampanel',
      thumbnail: '/lovable-uploads/661650dd-7dc7-4a01-8963-5b89882f52f0.png',
      description: 'Painel moderno para conteúdos digitais'
    }];
    setCreatorPages(pages);
    setSelectedPage(pages[0]); // Selecionar primeira página por padrão
  };
  const handleCopyLink = async (page: any) => {
    const fullUrl = `${window.location.origin}${page.route}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success(`🔗 Link da ${page.name} copiado!`);
    } catch (error) {
      toast.error("❌ Erro ao copiar link");
    }
  };
  const handleBuyPage = async (page: any) => {
    // Mostrar confirmação
    const confirmed = window.confirm(`Deseja comprar acesso premium à página "${page.name}"?\n\nCusto: 50 créditos`);
    if (confirmed) {
      toast.success(`✅ Acesso premium à ${page.name} adquirido!`);
    }
  };
  const handleNextUser = () => {
    try {
      if (users.length > 0) {
        const nextIndex = (currentUserIndex + 1) % users.length;
        setCurrentUserIndex(nextIndex);
        setCurrentUser(users[nextIndex]);
      }
    } catch (error) {
      console.error('Error changing user:', error);
    }
  };
  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error("As senhas não coincidem");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres");
          setIsLoading(false);
          return;
        }
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) {
          console.error("Erro no signup:", error);
          if (error.message.includes("already registered") || error.message.includes("already")) {
            toast.error("Este email já está cadastrado. Tente fazer login.");
            setIsSignUp(false);
          } else if (error.message.includes("Invalid email")) {
            toast.error("Email inválido. Verifique o formato do email.");
          } else if (error.message.includes("Password")) {
            toast.error("Senha muito fraca. Use pelo menos 6 caracteres.");
          } else {
            toast.error("Erro ao criar conta: " + error.message);
          }
        } else {
          toast.success("✅ Conta criada com sucesso! Verificando acesso...");
          if (data.user) {
            // Aguardar verificação de acesso - será redirecionado pelo useEffect
            console.log("🔐 Usuário criado, aguardando verificação de acesso...");
          }
        }
      } else {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (error) {
          console.error("Erro no login:", error);
          if (error.message.includes("Invalid login credentials") || error.message.includes("invalid")) {
            toast.error("Email ou senha incorretos. Verifique suas credenciais.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Por favor, confirme seu email antes de fazer login");
          } else if (error.message.includes("Too many requests")) {
            toast.error("Muitas tentativas. Aguarde um momento e tente novamente.");
          } else {
            toast.error("Erro ao fazer login: " + error.message);
          }
        } else {
          toast.success("Login realizado com sucesso! Verificando acesso...");
          // Aguardar verificação de acesso - será redirecionado pelo useEffect
          console.log("🔐 Login bem-sucedido, aguardando verificação de acesso...");
        }
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // O redirecionamento será feito pelo useEffect quando hasAccess for true
    } catch (error) {
      console.error('Erro no Google Auth:', error);
      toast.error("Erro no login com Google. Tente novamente.");
    } finally {
      setIsGoogleLoading(false);
    }
  };
  const handleFreeTrial = async () => {
    try {
      toast.loading("Redirecionando para o checkout...");
      await createCheckout('free', 'prod_SvBWXqVqBH5hlK');
    } catch (error) {
      console.error('Error starting free trial:', error);
      toast.error("Erro ao iniciar plano gratuito. Tente novamente.");
    }
  };

  // Se já tem acesso, aguardar redirecionamento
  if (hasAccess === true && user) {
    return <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-xl font-semibold">🎉 Acesso liberado!</p>
          <p className="text-white/80">Redirecionando para o dashboard...</p>
        </div>
      </div>;
  }

  // Se ainda está carregando mas passou do timeout, mostrar erro - OTIMIZADO
  if (accessLoading && accessTimeout) {
    return <div className="min-h-screen bg-gradient-to-br from-red-600 via-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <p className="text-xl font-semibold mb-4">⚠️ Verificação de acesso demorou mais que o esperado</p>
          <p className="text-white/80 mb-6">Pode haver um problema temporário. Tente novamente.</p>
          <Button 
            onClick={() => {
              setAccessTimeout(false);
              toast.success('🔄 Tentando novamente...');
            }} 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            🔄 Tentar novamente
          </Button>
        </div>
      </div>;
  }
  return <div className={`min-h-screen overflow-hidden ${
    isDarkTheme 
      ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800' 
      : 'bg-gradient-to-br from-red-50 via-white to-red-50'
  }`}>
      {/* Language Selector and Theme Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        <LanguageSelector 
          currentLanguage={language} 
          onLanguageChange={setLanguage}
        />
        <ThemeToggle 
          isDarkTheme={isDarkTheme}
          onThemeChange={setIsDarkTheme}
        />
      </div>

      {/* Layout principal com duas colunas */}
      <div className="container mx-auto px-4 py-12 pt-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[80vh]">
          
          {/* Coluna da esquerda - Formulário de cadastro */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            {/* Social Link Preview Image */}
            <div className="mb-8 flex justify-center">
              <img 
                src="/lovable-uploads/cb7ed264-5552-4a5c-b836-3ae5afe8058d.png" 
                alt="Social Link - For Influencers, Creators & Sellers" 
                className="w-full max-w-sm h-auto rounded-lg shadow-2xl"
              />
            </div>
            
            <Card className={`w-full max-w-md backdrop-blur-md shadow-2xl ${
              isDarkTheme 
                ? 'bg-white/10 border-white/20' 
                : 'bg-white border-red-200'
            }`}>
              <CardContent className="p-8 space-y-6">
                <div className="text-center">
                  <h1 className={`text-3xl font-bold mb-2 ${
                    isDarkTheme ? 'text-white' : 'text-red-600'
                  }`}>{t('auth.welcome')}</h1>
                  <p className={isDarkTheme ? 'text-white/80' : 'text-red-500'}>
                    {isSignUp ? t('auth.createAccountMessage') : t('auth.loginMessage')}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input 
                    type="email" 
                    placeholder={t('auth.emailPlaceholder')} 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className={isDarkTheme 
                      ? "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40" 
                      : "bg-red-50 border-red-200 text-red-700 placeholder:text-red-400 focus:border-red-400"
                    } 
                  />
                  <Input 
                    type="password" 
                    placeholder={t('auth.passwordPlaceholder')} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className={isDarkTheme 
                      ? "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40" 
                      : "bg-red-50 border-red-200 text-red-700 placeholder:text-red-400 focus:border-red-400"
                    } 
                  />
                  {isSignUp && <Input 
                    type="password" 
                    placeholder={t('auth.confirmPasswordPlaceholder')} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className={isDarkTheme 
                      ? "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40" 
                      : "bg-red-50 border-red-200 text-red-700 placeholder:text-red-400 focus:border-red-400"
                    } 
                  />}
                  <Button 
                    onClick={handleAuth} 
                    disabled={isLoading} 
                    className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkTheme 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isLoading ? t('auth.processing') : isSignUp ? t('auth.createAccount') : t('auth.signIn')}
                  </Button>

                  {/* Separador "ou" */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/70">{t('auth.or')}</span>
                    </div>
                  </div>

                  {/* Botão Google */}
                  <Button 
                    onClick={handleGoogleAuth} 
                    disabled={isGoogleLoading || isLoading} 
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isGoogleLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    {isGoogleLoading ? t('auth.signingIn') : `${isSignUp ? t('auth.createAccount') : t('auth.signIn')} ${t('auth.withGoogle')}`}
                  </Button>
                  <div className="space-y-2">
                    <p className="text-center text-foreground/70">
                      {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}{' '}
                      <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
                        {isSignUp ? t('auth.signIn') : t('auth.createAccount')}
                      </button>
                    </p>
                    
                    {!isSignUp && <p className="text-center">
                        <button onClick={() => setShowForgotPassword(true)} className="text-white/80 hover:text-white text-sm hover:underline font-medium">
                          {t('auth.forgotPassword')}
                        </button>
                      </p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita - Device Preview */}
          <div className="relative flex-1 flex justify-center items-center">
            <div className="relative max-w-md">
              
              {/* Device Toggle Icons */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex gap-4">
                <Button onClick={() => setDeviceType('phone')} variant={deviceType === 'phone' ? 'default' : 'outline'} size="sm" className={`flex items-center gap-2 ${deviceType === 'phone' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white/20 hover:bg-white/30 text-white border-white/30'}`}>
                  <Smartphone size={16} />
                  Celular
                </Button>
                <Button onClick={() => setDeviceType('tablet')} variant={deviceType === 'tablet' ? 'default' : 'outline'} size="sm" className={`flex items-center gap-2 ${deviceType === 'tablet' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white/20 hover:bg-white/30 text-white border-white/30'}`}>
                  <Tablet size={16} />
                  Tablet
                </Button>
                <Button onClick={() => setDeviceType('laptop')} variant={deviceType === 'laptop' ? 'default' : 'outline'} size="sm" className={`flex items-center gap-2 ${deviceType === 'laptop' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white/20 hover:bg-white/30 text-white border-white/30'}`}>
                  <Laptop size={16} />
                  Notebook
                </Button>
              </div>

              {/* Device Mockup - Conditional rendering based on deviceType */}
              {deviceType === 'phone' ?
            // Smartphone mockup
            <div className="w-80 h-[600px] bg-black rounded-[2.5rem] p-2 shadow-2xl relative">
                  {/* Scroll Control Buttons - Left side of device */}
                  <div className="absolute left-[-80px] top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-30">
                    <Button
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Preview"]') as HTMLIFrameElement;
                        if (iframe?.contentWindow) {
                          iframe.contentWindow.scrollBy(0, -100);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                      title="Scroll para cima"
                    >
                      <ChevronUp className="w-5 h-5 text-white" />
                    </Button>
                    
                    <Button
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Preview"]') as HTMLIFrameElement;
                        if (iframe?.contentWindow) {
                          iframe.contentWindow.scrollBy(0, 100);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                      title="Scroll para baixo"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
                    </Button>
                  </div>

                  <div className="w-full h-full bg-gray-900 rounded-[2rem] overflow-hidden relative">
                    {/* Notch do smartphone */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>
                    
                    {/* Preview dentro do smartphone */}
                    <div className="pt-6 px-1 pb-1 h-full pointer-events-none">
                      {selectedPage ? <iframe src={selectedPage.route} className="w-full h-full rounded-[1.5rem] border-0" title={`Preview de ${selectedPage.name}`} sandbox="allow-same-origin allow-scripts allow-forms" /> : <div className="w-full h-full rounded-[1.5rem] bg-gray-800 flex items-center justify-center">
                          <p className="text-white/50 text-sm">Selecione uma página</p>
                        </div>}
                    </div>
                  </div>
                 </div> : deviceType === 'tablet' ?
            // Tablet mockup
            <div className="w-[480px] h-[640px] bg-black rounded-[2rem] p-2 shadow-2xl relative">
                  {/* Scroll Control Buttons - Left side of device */}
                  <div className="absolute left-[-80px] top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-30">
                    <Button
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Preview"]') as HTMLIFrameElement;
                        if (iframe?.contentWindow) {
                          iframe.contentWindow.scrollBy(0, -100);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                      title="Scroll para cima"
                    >
                      <ChevronUp className="w-5 h-5 text-white" />
                    </Button>
                    
                    <Button
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Preview"]') as HTMLIFrameElement;
                        if (iframe?.contentWindow) {
                          iframe.contentWindow.scrollBy(0, 100);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                      title="Scroll para baixo"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
                    </Button>
                  </div>

                  <div className="w-full h-full bg-gray-900 rounded-[1.5rem] overflow-hidden relative">
                    {/* Preview dentro do tablet */}
                    <div className="p-2 h-full pointer-events-none">
                      {selectedPage ? <iframe src={selectedPage.route} className="w-full h-full rounded-[1.2rem] border-0" title={`Preview de ${selectedPage.name}`} sandbox="allow-same-origin allow-scripts allow-forms" /> : <div className="w-full h-full rounded-[1.2rem] bg-gray-800 flex items-center justify-center">
                          <p className="text-white/50 text-base">Selecione uma página</p>
                        </div>}
                    </div>
                  </div>
                </div> :
            // Laptop mockup
            <div className="relative">
                  {/* Scroll Control Buttons - Left side of device */}
                  <div className="absolute left-[-80px] top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-30">
                    <Button
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Preview"]') as HTMLIFrameElement;
                        if (iframe?.contentWindow) {
                          iframe.contentWindow.scrollBy(0, -100);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                      title="Scroll para cima"
                    >
                      <ChevronUp className="w-5 h-5 text-white" />
                    </Button>
                    
                    <Button
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title*="Preview"]') as HTMLIFrameElement;
                        if (iframe?.contentWindow) {
                          iframe.contentWindow.scrollBy(0, 100);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-12 w-12 p-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                      title="Scroll para baixo"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
                    </Button>
                  </div>

                  {/* Laptop screen */}
                  <div className="w-[640px] h-[400px] bg-black rounded-t-2xl p-2 shadow-2xl">
                    <div className="w-full h-full bg-gray-900 rounded-t-xl overflow-hidden relative">
                      {/* Preview dentro do laptop */}
                      <div className="p-2 h-full pointer-events-none">
                        {selectedPage ? <iframe src={selectedPage.route} className="w-full h-full rounded-lg border-0" title={`Preview de ${selectedPage.name}`} sandbox="allow-same-origin allow-scripts allow-forms" /> : <div className="w-full h-full rounded-lg bg-gray-800 flex items-center justify-center">
                            <p className="text-white/50 text-lg">Selecione uma página</p>
                          </div>}
                      </div>
                    </div>
                  </div>
                  {/* Laptop base */}
                  <div className="w-[680px] h-8 bg-gray-300 rounded-b-3xl mx-auto relative -top-1 shadow-lg">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>}

              {/* Next User Button */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <Button onClick={handleNextUser} className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 px-6 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  Próximo Usuário <ChevronRight size={16} />
                </Button>
                {currentUser && <p className="text-white/70 text-xs mt-2 text-center">
                    {currentUserIndex + 1} de {users.length} usuários
                  </p>}
              </div>

              {/* Componente 3D rotativo */}
              <div className="absolute -right-32 top-1/2 transform -translate-y-1/2 w-64 h-80 hidden xl:block">
                <Canvas camera={{
                position: [0, 0, 5],
                fov: 50
              }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <RotatingCard />
                  <OrbitControls enableZoom={false} enablePan={false} />
                </Canvas>
              </div>
            </div>

            {/* Ícones flutuantes - ajustados para nova posição */}
            <FloatingIcon icon={Heart} position="top-10 left-10" color="bg-red-500 text-white" delay={0} />
            <FloatingIcon icon={ThumbsUp} position="top-20 right-10" color="bg-blue-500 text-white" delay={0.5} />
            <FloatingIcon icon={ShoppingCart} position="bottom-32 left-16" color="bg-green-500 text-white" delay={1} />
            <FloatingIcon icon={MessageSquare} position="bottom-20 right-16" color="bg-purple-500 text-white" delay={1.5} />
            
            {/* Emojis flutuantes - ajustados para nova posição */}
            <div className="absolute top-16 left-20 animate-bounce text-4xl" style={{
            animationDelay: '0.2s'
          }}>
              😍
            </div>
            <div className="absolute bottom-40 right-20 animate-bounce text-4xl" style={{
            animationDelay: '0.8s'
          }}>
              💜
            </div>
            <div className="absolute top-1/2 left-8 animate-bounce text-4xl" style={{
            animationDelay: '1.2s'
          }}>
              💬
            </div>
          </div>
        </div>
      </div>

      {/* Preview da Página User */}
      <div className="container mx-auto px-4 pb-12">
        
      </div>

      {/* Dialog de recuperação de senha */}
      <ForgotPasswordDialog isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />

      {/* NOVA LANDING PAGE SOCIAL LINK - ADICIONADA ABAIXO */}
      
      {/* Features Section */}
      <section className={`py-20 ${isDarkTheme ? 'bg-slate-800/50' : 'bg-red-50/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDarkTheme ? 'text-white' : 'text-red-600'
            }`}>
              {t('ipage.featuresTitle')}
            </h2>
            <p className={`text-xl ${isDarkTheme ? 'text-gray-300' : 'text-red-500'}`}>
              {t('ipage.feature3Description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className={`backdrop-blur-md p-6 ${
              isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-white border-red-200'
            }`}>
              <div className="text-4xl mb-4">💬</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.feature1Title')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.feature1Description')}
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className={`backdrop-blur-md p-6 ${
              isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-white border-red-200'
            }`}>
              <div className="text-4xl mb-4">💳</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.feature2Title')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.feature2Description')}
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className={`backdrop-blur-md p-6 ${
              isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-white border-red-200'
            }`}>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.feature3Title')}</h3>
              <p className="text-gray-300">
                Crie uma página exclusiva, com cores, textos, preços, animações e até música de fundo.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className={`backdrop-blur-md p-6 ${
              isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-white border-red-200'
            }`}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.feature4Title')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.feature4Description')}
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className={`backdrop-blur-md p-6 ${
              isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-white border-red-200'
            }`}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.feature5Title')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.feature5Description')}
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className={`backdrop-blur-md p-6 ${
              isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-white border-red-200'
            }`}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.feature6Title')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.feature6Description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className={`py-20 ${
        isDarkTheme 
          ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50' 
          : 'bg-gradient-to-r from-red-100/80 to-red-200/60'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${
            isDarkTheme ? 'text-white' : 'text-red-600'
          }`}>
            {t('ipage.exampleTitle')}
          </h2>
          <Card className={`backdrop-blur-md p-8 ${
            isDarkTheme ? 'bg-white/10 border-white/20' : 'bg-white border-red-200'
          }`}>
            <p className={`text-lg mb-6 ${isDarkTheme ? 'text-gray-300' : 'text-red-500'}`}>
              {t('ipage.exampleText')}
            </p>
            <blockquote className={`text-xl font-semibold border-l-4 ${
              isDarkTheme ? 'text-white border-blue-500' : 'text-red-600 border-red-500'
            } pl-6 italic`}>
              {t('ipage.testimonialQuote')}
            </blockquote>
            <p className={`mt-4 font-medium ${
              isDarkTheme ? 'text-blue-400' : 'text-red-500'
            }`}>{t('ipage.testimonialAuthor')}</p>
          </Card>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className={`py-20 ${isDarkTheme ? 'bg-slate-800/50' : 'bg-red-50/50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${
            isDarkTheme ? 'text-white' : 'text-red-600'
          }`}>
            {t('ipage.whyChooseTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkTheme 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.showcase1')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.showcase1Desc')}
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkTheme 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <span className="text-2xl">💬</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.showcase2')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.showcase2Desc')}
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkTheme 
                  ? 'bg-gradient-to-br from-pink-500 to-red-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkTheme ? 'text-white' : 'text-red-600'
              }`}>{t('ipage.showcase3')}</h3>
              <p className={isDarkTheme ? 'text-gray-300' : 'text-red-500'}>
                {t('ipage.showcase3Desc')}
              </p>
            </div>
          </div>
          <p className={`text-xl mb-8 ${isDarkTheme ? 'text-gray-300' : 'text-red-500'}`}>
            {t('ipage.feature3Description')}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${
        isDarkTheme 
          ? 'bg-gradient-to-br from-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-red-600 to-red-700'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('ipage.startNowTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('ipage.startNowDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading || isLoading} 
              className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGoogleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isGoogleLoading ? t('auth.signingIn') : t('auth.createAccount')}
            </Button>
            <Button variant="outline" className="px-8 py-3 text-lg border-white/20 text-white hover:bg-white/10">
              {t('landing.demo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${isDarkTheme ? 'bg-slate-900' : 'bg-red-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">{t('ipage.footerTitle')}</h3>
          <p className="text-gray-400 mb-6">
            {t('ipage.footerSubtitle')}
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

      {/* Rodapé Original - Mantido */}
      <div className="text-center pb-12">
        <Button asChild className={`font-bold text-lg px-12 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 animate-pulse mb-4 ${
          isDarkTheme 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}>
          <Link to="/signup">
            {t('ipage.signUpButton')}
          </Link>
        </Button>
        <br />
        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`font-bold text-lg px-12 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 animate-pulse ${
          isDarkTheme 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}>
          {t('ipage.freeTrialButton')}
        </Button>
        <p className={`mt-4 text-sm ${isDarkTheme ? 'text-white/70' : 'text-white/90'}`}>
          {t('ipage.commitmentText')}
        </p>
      </div>

      {/* Seção de Lista de Páginas - Estrutura do MyListPage */}
      <div className="container mx-auto px-4 pb-12">
        
      </div>
      
      {/* Botão de configuração Stripe - apenas para admin (oculto) */}
      {session?.user?.email === 'admin@lokshare.com' && (
        <Button
          onClick={() => setShowStripeKeyDialog(true)}
          variant="ghost"
          className="fixed bottom-4 left-4 opacity-10 hover:opacity-100 transition-opacity"
          size="sm"
        >
          <Key className="h-4 w-4" />
        </Button>
      )}
      
      {/* Stripe Public Key Dialog */}
      <StripePublicKeyDialog 
        open={showStripeKeyDialog}
        onOpenChange={setShowStripeKeyDialog}
      />
      
      {/* Support Bubble */}
      <SupportBubble />
    </div>;
}