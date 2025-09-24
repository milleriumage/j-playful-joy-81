import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, LogIn, UserPlus, Chrome, Eye, EyeOff, Mail, Lock, Timer, CheckCircle, XCircle } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [emailForVerification, setEmailForVerification] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationCode = async (email: string) => {
    const code = generateCode();
    setGeneratedCode(code);
    
    try {
      const response = await supabase.functions.invoke('send-verification-code', {
        body: { email, code }
      });
      
      if (response.error) {
        throw response.error;
      }
      
      toast.success('📧 Código enviado para seu email!');
      setTimer(30);
      setCanResend(false);
      setStep('verify');
      setEmailForVerification(email);
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error('❌ Erro ao enviar código. Tente novamente.');
    }
  };

  const handleEmailSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Para cadastro, apenas enviar código
        await sendVerificationCode(data.email);
      } else {
        // Para login, primeiro verificar se é um email alias
        let loginEmail = data.email;
        
        // Check if this email is an alias and get the primary email
        const { data: aliasData } = await supabase
          .from('user_email_aliases')
          .select('user_id')
          .eq('alias_email', data.email.toLowerCase())
          .eq('is_active', true)
          .single();

        if (aliasData) {
          // Get the primary email from profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('settings')
            .eq('user_id', aliasData.user_id)
            .single();

          if (profileData?.settings && typeof profileData.settings === 'object' && 
              profileData.settings !== null && 'email' in profileData.settings) {
            const settings = profileData.settings as { email?: string };
            if (settings.email) {
              loginEmail = settings.email;
              toast.info(`🔄 Usando email principal para login: ${loginEmail}`);
            }
          }
        }

        // Agora fazer login com o email correto
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: data.password
        });
        
        if (error) {
          toast.error('❌ Erro no login: ' + error.message);
        } else {
          toast.success('🎉 Login realizado com sucesso!');
          reset();
          onSuccess();
        }
      }
    } catch (error) {
      toast.error('❌ Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerification = async () => {
    if (verificationCode.length !== 6) {
      return;
    }

    if (verificationCode === generatedCode) {
      setCodeStatus('correct');
      toast.success('✅ Código verificado com sucesso!');
      
      // Prosseguir com o cadastro
      const { error } = await supabase.auth.signUp({
        email: emailForVerification,
        password: watch('password'),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast.error('❌ Erro no cadastro: ' + error.message);
      } else {
        toast.success('✅ Cadastro realizado! Verifique seu email.');
        reset();
        resetDialog();
        onSuccess();
      }
    } else {
      setCodeStatus('incorrect');
      toast.error('❌ Código incorreto. Tente novamente.');
      setTimeout(() => setCodeStatus('idle'), 2000);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setIsLoading(true);
    await sendVerificationCode(emailForVerification);
    setIsLoading(false);
  };

  const resetDialog = () => {
    setStep('email');
    setVerificationCode('');
    setGeneratedCode('');
    setTimer(0);
    setCanResend(false);
    setCodeStatus('idle');
    setEmailForVerification('');
  };

  const handleGoogleAuth = async () => {
    await signInWithGoogle();
    onSuccess();
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    resetDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); resetDialog(); }}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {step === 'email' 
              ? (isSignUp ? '✨ Criar Conta' : '🔐 Fazer Login')
              : '📧 Verificação de Email'
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {step === 'email' ? (
            <>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  {isSignUp ? 'Bem-vindo ao LinkchatTV!' : 'Que bom te ver de volta!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSignUp 
                    ? 'Crie sua conta para acessar todas as funcionalidades da plataforma'
                    : 'Faça login para continuar aproveitando tudo que oferecemos'
                  }
                </p>
              </div>

              {/* Formulário de Email/Senha */}
              <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      {...register('email', { 
                        required: 'Email é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      className="pl-10 pr-10"
                      {...register('password', { 
                        required: 'Senha é obrigatória',
                        minLength: {
                          value: 6,
                          message: 'Senha deve ter pelo menos 6 caracteres'
                        }
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="pl-10"
                        {...register('confirmPassword', { 
                          required: isSignUp ? 'Confirmação de senha é obrigatória' : false,
                          validate: (value) => {
                            if (isSignUp && value !== watch('password')) {
                              return 'Senhas não coincidem';
                            }
                          }
                        })}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Carregando...' : (isSignUp ? 'Continuar' : 'Entrar')}
                </Button>
              </form>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ou continue com
                  </span>
                </div>
              </div>

              {/* Botão Google */}
              <Button
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                variant="outline"
                className="w-full"
              >
                <Chrome className="w-5 h-5 mr-2" />
                {googleLoading 
                  ? 'Conectando...' 
                  : `${isSignUp ? 'Criar conta' : 'Entrar'} com Google`
                }
              </Button>

              {/* Toggle entre Login/SignUp */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
                </p>
                <Button
                  variant="link"
                  onClick={handleToggleMode}
                  className="text-primary hover:text-primary/80"
                >
                  {isSignUp ? (
                    <>
                      <LogIn className="w-4 h-4 mr-1" />
                      Fazer Login
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Criar Conta Grátis
                    </>
                  )}
                </Button>
              </div>

              {/* Política de privacidade */}
              <p className="text-xs text-muted-foreground text-center">
                Ao continuar, você concorda com nossos{' '}
                <span className="text-primary underline cursor-pointer">
                  Termos de Uso
                </span>
                {' '}e{' '}
                <span className="text-primary underline cursor-pointer">
                  Política de Privacidade
                </span>
              </p>
            </>
          ) : (
            <>
              {/* Tela de Verificação OTP */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Verifique seu email</h3>
                  <p className="text-sm text-muted-foreground">
                    Enviamos um código de 6 dígitos para<br />
                    <span className="font-medium text-foreground">{emailForVerification}</span>
                  </p>
                  <Button
                    onClick={() => {
                      resetDialog();
                    }}
                    variant="link"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Alterar email
                  </Button>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Timer className="w-4 h-4" />
                  <span className={timer > 0 ? "text-orange-600" : "text-muted-foreground"}>
                    {timer > 0 ? `Código expira em ${timer}s` : 'Código expirado'}
                  </span>
                </div>

                {/* Campo OTP */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Label>Digite o código de verificação</Label>
                    <div className="flex items-center space-x-2">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={(value) => {
                          setVerificationCode(value);
                          setCodeStatus('idle');
                          if (value.length === 6) {
                            // Validação automática imediata quando 6 dígitos são inseridos
                            handleCodeVerification();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && verificationCode.length === 6) {
                            handleCodeVerification();
                          }
                        }}
                        className={`
                          ${codeStatus === 'correct' ? 'border-green-500' : ''}
                          ${codeStatus === 'incorrect' ? 'border-red-500' : ''}
                        `}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot 
                            index={0} 
                            className={`
                              ${codeStatus === 'correct' ? 'border-green-500 bg-green-50' : ''}
                              ${codeStatus === 'incorrect' ? 'border-red-500 bg-red-50' : ''}
                            `}
                          />
                          <InputOTPSlot 
                            index={1}
                            className={`
                              ${codeStatus === 'correct' ? 'border-green-500 bg-green-50' : ''}
                              ${codeStatus === 'incorrect' ? 'border-red-500 bg-red-50' : ''}
                            `}
                          />
                          <InputOTPSlot 
                            index={2}
                            className={`
                              ${codeStatus === 'correct' ? 'border-green-500 bg-green-50' : ''}
                              ${codeStatus === 'incorrect' ? 'border-red-500 bg-red-50' : ''}
                            `}
                          />
                          <InputOTPSlot 
                            index={3}
                            className={`
                              ${codeStatus === 'correct' ? 'border-green-500 bg-green-50' : ''}
                              ${codeStatus === 'incorrect' ? 'border-red-500 bg-red-50' : ''}
                            `}
                          />
                          <InputOTPSlot 
                            index={4}
                            className={`
                              ${codeStatus === 'correct' ? 'border-green-500 bg-green-50' : ''}
                              ${codeStatus === 'incorrect' ? 'border-red-500 bg-red-50' : ''}
                            `}
                          />
                          <InputOTPSlot 
                            index={5}
                            className={`
                              ${codeStatus === 'correct' ? 'border-green-500 bg-green-50' : ''}
                              ${codeStatus === 'incorrect' ? 'border-red-500 bg-red-50' : ''}
                            `}
                          />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        onClick={handleCodeVerification}
                        disabled={verificationCode.length !== 6}
                        size="sm"
                        className="h-10 w-10 p-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status do código */}
                  {codeStatus === 'correct' && (
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Código correto!</span>
                    </div>
                  )}
                  
                  {codeStatus === 'incorrect' && (
                    <div className="flex items-center justify-center space-x-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Código incorreto</span>
                    </div>
                  )}
                </div>

                {/* Botão Reenviar */}
                <div className="space-y-3">
                  <Button
                    onClick={handleResendCode}
                    disabled={!canResend || isLoading}
                    variant={canResend ? "default" : "secondary"}
                    className="w-full"
                  >
                    {isLoading ? 'Reenviando...' : 'Reenviar código'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      resetDialog();
                      setIsSignUp(false);
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    Voltar ao login
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};