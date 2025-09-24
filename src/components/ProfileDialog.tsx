import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { User, Lock, Unlock, Trash2, Upload, Camera, X, Clock, Mail, CheckCircle, XCircle, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { SendMessageDialog } from './SendMessageDialog';
import { PasswordDialog } from './PasswordDialog';
import { useLanguage } from "@/hooks/useLanguage";
interface ProfileData {
  fullName: string;
  email: string;
  secondEmail: string;
  primaryEmail: 'first' | 'second';
  birthDate: string;
  phone: string;
  profileImage?: string;
}
interface ProfileDialogProps {
  masterPassword: string;
  passwordSet: boolean;
  onPasswordSet: (password: string) => void;
  onPasswordRemove: () => void;
  onClearChat?: () => void;
  disabled?: boolean;
}
export const ProfileDialog = ({
  masterPassword,
  passwordSet,
  onPasswordSet,
  onPasswordRemove,
  onClearChat,
  disabled = false
}: ProfileDialogProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordDialogMode, setPasswordDialogMode] = useState<'set' | 'verify' | 'change'>('set');
  const [showSendMessageDialog, setShowSendMessageDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelConfirmation, setCancelConfirmation] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState("60"); // Default 1 hour in minutes
  const [emailVerified, setEmailVerified] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [autoResetPassword, setAutoResetPassword] = useState(false);
  const [newEmailToSave, setNewEmailToSave] = useState("");
  const [emailNeedsVerification, setEmailNeedsVerification] = useState(false);

  // OTP verification states for primary email
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // OTP verification states for secondary email
  const [secondEmailVerified, setSecondEmailVerified] = useState(false);
  const [showSecondOtpStep, setShowSecondOtpStep] = useState(false);
  const [secondOtpCode, setSecondOtpCode] = useState("");
  const [isSecondVerifying, setIsSecondVerifying] = useState(false);
  const [isSendingSecondCode, setIsSendingSecondCode] = useState(false);
  const [secondTimer, setSecondTimer] = useState(0);
  const [canResendSecond, setCanResendSecond] = useState(false);
  const [secondVerificationCode, setSecondVerificationCode] = useState("");

  // Password change states
  const [showPasswordChangeStep, setShowPasswordChangeStep] = useState(false);
  const [passwordChangeCode, setPasswordChangeCode] = useState("");
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isSendingPasswordCode, setIsSendingPasswordCode] = useState(false);
  const [passwordChangeTimer, setPasswordChangeTimer] = useState(0);
  const [canResendPasswordCode, setCanResendPasswordCode] = useState(false);
  const [passwordChangeVerificationCode, setPasswordChangeVerificationCode] = useState("");
  const [newPasswordForChange, setNewPasswordForChange] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Email change states
  const [showEmailChangeStep, setShowEmailChangeStep] = useState(false);
  const [showEmailChangeInputStep, setShowEmailChangeInputStep] = useState(false);
  const [emailChangeCode, setEmailChangeCode] = useState("");
  const [isEmailChanging, setIsEmailChanging] = useState(false);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [emailChangeTimer, setEmailChangeTimer] = useState(0);
  const [canResendEmailCode, setCanResendEmailCode] = useState(false);
  const [emailChangeVerificationCode, setEmailChangeVerificationCode] = useState("");
  const [newEmailForChange, setNewEmailForChange] = useState("");
  const {
    profileData,
    updateProfile,
    saveProfile,
    isLoading
  } = useUserProfile();
  const {
    subscribed,
    subscription_tier,
    checkSubscription
  } = useSubscription();
  const {
    createNotification
  } = useNotifications();
  const [loginEmail, setLoginEmail] = useState("");

  // Load current authenticated user's email
  useEffect(() => {
    const loadCurrentUserEmail = async () => {
      try {
        // Busca o usuário atualmente autenticado no banco de dados
        const {
          data: {
            user
          },
          error
        } = await supabase.auth.getUser();
        if (error) {
          console.error('Erro ao buscar usuário autenticado:', error);
          return;
        }
        if (user?.email) {
          // Garantir que estamos sempre buscando o email do usuário atual
          setLoginEmail(user.email);
        } else {
          console.warn('Usuário não possui email registrado');
          setLoginEmail('Email não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar email de login:', error);
        setLoginEmail('Erro ao carregar email');
      }
    };

    // Executar quando o componente montar
    loadCurrentUserEmail();

    // Escutar mudanças de autenticação para atualizar o email
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user?.email) {
          setLoginEmail(session.user.email);
        }
      } else if (event === 'SIGNED_OUT') {
        setLoginEmail('');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Timer effect for primary email
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Timer effect for secondary email
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (secondTimer > 0) {
      interval = setInterval(() => {
        setSecondTimer(prevTimer => {
          if (prevTimer <= 1) {
            setCanResendSecond(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [secondTimer]);

  // Timer effect for password change
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (passwordChangeTimer > 0) {
      interval = setInterval(() => {
        setPasswordChangeTimer(prevTimer => {
          if (prevTimer <= 1) {
            setCanResendPasswordCode(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [passwordChangeTimer]);

  // Timer effect for email change
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailChangeTimer > 0) {
      interval = setInterval(() => {
        setEmailChangeTimer(prevTimer => {
          if (prevTimer <= 1) {
            setCanResendEmailCode(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailChangeTimer]);
  const handleSetPassword = () => {
    if (newPassword.length >= 4) {
      onPasswordSet(newPassword);
      setNewPassword("");
      toast.success("🔐 Password set successfully!");
    } else {
      toast.error("❌ Password must be at least 4 characters!");
    }
  };
  const handleRemovePassword = () => {
    if (currentPassword === masterPassword) {
      onPasswordRemove();
      setCurrentPassword("");
      toast.success("🔓 Password removed successfully!");
    } else {
      toast.error("❌ Incorrect password!");
    }
  };
  const handleClearChat = () => {
    if (confirm("🧽 Are you sure you want to clear all chat messages?")) {
      onClearChat?.();
      toast.success("🧽 Chat cleared successfully!");
    }
  };
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error("❌ Please select an image file!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("❌ Image size must be less than 5MB!");
        return;
      }

      // Show loading state
      toast.info("📤 Uploading profile image...");

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `profile_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload to Supabase Storage
      const {
        error: uploadError
      } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("❌ Failed to upload image!");
        return;
      }

      // Get public URL
      const {
        data: urlData
      } = supabase.storage.from('media').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      // Update profile with the new image URL
      updateProfile('profileImage', publicUrl);

      // Save profile to persist the image URL
      await saveProfile();
      toast.success("📷 Profile image uploaded and saved!");
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error("❌ Failed to upload profile image!");
    }
  };
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const sendVerificationCode = async () => {
    if (!profileData.email) {
      toast.error("❌ Digite um email válido primeiro!");
      return;
    }
    setIsSendingCode(true);
    const code = generateVerificationCode();
    setVerificationCode(code);
    try {
      const {
        error
      } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: profileData.email,
          code: code
        }
      });
      if (error) throw error;
      toast.success("📧 Código enviado para seu email!");
      setShowOtpStep(true);
      setTimer(300); // 5 minutos = 300 segundos
      setCanResend(false);
      setOtpCode("");
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error("❌ Erro ao enviar código: " + (error as Error).message);
    } finally {
      setIsSendingCode(false);
    }
  };
  const verifyCode = () => {
    // Verificar se o código ainda está válido (timer > 0)
    if (timer <= 0) {
      toast.error("❌ Código expirado! Solicite um novo código.");
      setOtpCode("");
      setVerificationCode("");
      return;
    }
    if (otpCode === verificationCode) {
      toast.success("✅ Email verificado com sucesso!");
      setEmailVerified(true);
      setShowOtpStep(false);
      setOtpCode("");
      setVerificationCode("");
      setTimer(0);
      setEmailNeedsVerification(false); // Permite salvar após verificação

      // Se o toggle auto reset estiver ativado, resetar a senha do cadeado
      if (autoResetPassword && passwordSet) {
        onPasswordRemove();
        toast.success("🔐 Senha do cadeado resetada automaticamente!");
      }
    } else {
      toast.error("❌ Código incorreto! Tente novamente.");
      setOtpCode("");
    }
  };
  const handleResendCode = async () => {
    setCanResend(false);
    setTimer(300); // Resetar para 5 minutos
    await sendVerificationCode();

    // Enviar email de confirmação
    try {
      await supabase.functions.invoke('send-message', {
        body: {
          email: profileData.email,
          subject: '✅ Código Reenviado - LinkchatTV',
          message: `Olá ${profileData.fullName || 'usuário'},\n\nSeu código de verificação foi reenviado com sucesso!\n\nSe você não solicitou este reenvio, pode ignorar este email.\n\nEquipe LinkchatTV`
        }
      });
      toast.success("📧 Email de confirmação enviado!");
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };
  const handleCancelVerification = () => {
    setShowOtpStep(false);
    setOtpCode("");
    setVerificationCode("");
    setTimer(0);
    setCanResend(false);
  };
  const sendSecondEmailVerificationCode = async () => {
    if (!profileData.secondEmail) {
      toast.error("❌ Digite um email secundário válido primeiro!");
      return;
    }
    setIsSendingSecondCode(true);
    const code = generateVerificationCode();
    setSecondVerificationCode(code);
    try {
      const {
        error
      } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: profileData.secondEmail,
          code: code
        }
      });
      if (error) throw error;
      toast.success("📧 Código enviado para seu email secundário!");
      setShowSecondOtpStep(true);
      setSecondTimer(300); // 5 minutos = 300 segundos
      setCanResendSecond(false);
      setSecondOtpCode("");
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error("❌ Erro ao enviar código: " + (error as Error).message);
    } finally {
      setIsSendingSecondCode(false);
    }
  };
  const verifySecondEmailCode = () => {
    // Verificar se o código ainda está válido (timer > 0)
    if (secondTimer <= 0) {
      toast.error("❌ Código expirado! Solicite um novo código.");
      setSecondOtpCode("");
      setSecondVerificationCode("");
      return;
    }
    if (secondOtpCode === secondVerificationCode) {
      toast.success("✅ Email secundário verificado com sucesso!");
      setSecondEmailVerified(true);
      setShowSecondOtpStep(false);
      setSecondOtpCode("");
      setSecondVerificationCode("");
      setSecondTimer(0);
    } else {
      toast.error("❌ Código incorreto! Tente novamente.");
      setSecondOtpCode("");
    }
  };
  const handleResendSecondCode = async () => {
    setCanResendSecond(false);
    setSecondTimer(300); // Resetar para 5 minutos
    await sendSecondEmailVerificationCode();

    // Enviar email de confirmação
    try {
      await supabase.functions.invoke('send-message', {
        body: {
          email: profileData.secondEmail,
          subject: '✅ Código Reenviado - LinkchatTV',
          message: `Olá ${profileData.fullName || 'usuário'},\n\nSeu código de verificação foi reenviado com sucesso para o email secundário!\n\nSe você não solicitou este reenvio, pode ignorar este email.\n\nEquipe LinkchatTV`
        }
      });
      toast.success("📧 Email de confirmação enviado!");
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };
  const handleCancelSecondVerification = () => {
    setShowSecondOtpStep(false);
    setSecondOtpCode("");
    setSecondVerificationCode("");
    setSecondTimer(0);
    setCanResendSecond(false);
  };
  const sendPasswordChangeCode = async () => {
    if (!loginEmail) {
      toast.error("❌ Email principal necessário para alteração de senha!");
      return;
    }
    setIsSendingPasswordCode(true);
    const code = generateVerificationCode();
    setPasswordChangeVerificationCode(code);
    try {
      const {
        error
      } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: loginEmail,
          code: code
        }
      });
      if (error) throw error;
      toast.success("📧 Código para alteração de senha enviado para seu email principal!");
      setShowPasswordChangeStep(true);
      setPasswordChangeTimer(300); // 5 minutos = 300 segundos
      setCanResendPasswordCode(false);
      setPasswordChangeCode("");
    } catch (error) {
      console.error('Error sending password change code:', error);
      toast.error("❌ Erro ao enviar código: " + (error as Error).message);
    } finally {
      setIsSendingPasswordCode(false);
    }
  };
  const sendEmailChangeCode = async () => {
    if (!profileData.email) {
      toast.error("❌ Digite um email válido primeiro!");
      return;
    }

    // Mostrar campo para inserir novo email
    setShowEmailChangeInputStep(true);
  };
  const handleEmailChangeSubmit = async () => {
    if (!newEmailForChange) {
      toast.error("❌ Digite o novo email!");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailForChange)) {
      toast.error("❌ Digite um email válido!");
      return;
    }
    setIsSendingEmailCode(true);
    const code = generateVerificationCode();
    setEmailChangeVerificationCode(code);
    try {
      const {
        error
      } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: newEmailForChange,
          code: code
        }
      });
      if (error) throw error;
      toast.success(`📧 Código enviado para ${newEmailForChange}!`);
      setShowEmailChangeInputStep(false);
      setShowEmailChangeStep(true);
      setEmailChangeTimer(60); // 1 minuto = 60 segundos
      setCanResendEmailCode(false);
      setEmailChangeCode("");
    } catch (error) {
      console.error('Error sending email change code:', error);
      toast.error("❌ Erro ao enviar código: " + (error as Error).message);
    } finally {
      setIsSendingEmailCode(false);
    }
  };
  const verifyEmailChangeCode = async () => {
    // Verificar se o código ainda está válido
    if (emailChangeTimer <= 0) {
      toast.error("❌ Código expirado! Solicite um novo código.");
      setEmailChangeCode("");
      setEmailChangeVerificationCode("");
      return;
    }
    if (emailChangeCode === emailChangeVerificationCode) {
      try {
        // Obter usuário atual
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();

        // Atualizar email no Supabase Auth
        const {
          error: authError
        } = await supabase.auth.updateUser({
          email: newEmailForChange
        });
        if (authError) {
          toast.error("❌ Erro ao atualizar email: " + authError.message);
          return;
        }

        // Atualizar email no banco de dados do perfil também
        if (user) {
          const {
            error: profileError
          } = await supabase.from('profiles').update({
            settings: {
              ...profileData,
              email: newEmailForChange
            }
          }).eq('user_id', user.id);
          if (profileError) {
            console.error('Error updating profile email:', profileError);
          }
        }

        // Atualizar email no perfil local
        updateProfile('email', newEmailForChange);
        toast.success("✅ Email alterado com sucesso! Fazendo logout para que você possa logar com o novo email...");

        // Resetar estados
        setShowEmailChangeStep(false);
        setEmailChangeCode("");
        setEmailChangeVerificationCode("");
        setNewEmailForChange("");
        setEmailChangeTimer(0);

        // Fechar o dialog
        setIsOpen(false);

        // Fazer logout para forçar login com novo email
        setTimeout(async () => {
          await supabase.auth.signOut();
          toast.info("👤 Faça login novamente com seu novo email.");
        }, 2000);
      } catch (error) {
        console.error('Error updating email:', error);
        toast.error("❌ Erro inesperado ao alterar email!");
      }
    } else {
      toast.error("❌ Código incorreto! Tente novamente.");
      setEmailChangeCode("");
    }
  };
  const handleResendEmailCode = async () => {
    setCanResendEmailCode(false);
    setEmailChangeTimer(60); // 1 minuto = 60 segundos

    const code = generateVerificationCode();
    setEmailChangeVerificationCode(code);
    try {
      const {
        error
      } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: newEmailForChange,
          code: code
        }
      });
      if (error) throw error;
      toast.success("📧 Código reenviado!");
    } catch (error) {
      console.error('Error resending email change code:', error);
      toast.error("❌ Erro ao reenviar código!");
    }
  };
  const handleCancelEmailChange = () => {
    setShowEmailChangeStep(false);
    setShowEmailChangeInputStep(false);
    setEmailChangeCode("");
    setEmailChangeVerificationCode("");
    setNewEmailForChange("");
    setEmailChangeTimer(0);
    setCanResendEmailCode(false);
  };
  const verifyPasswordChangeCode = () => {
    // Verificar se o código ainda está válido
    if (passwordChangeTimer <= 0) {
      toast.error("❌ Código expirado! Solicite um novo código.");
      setPasswordChangeCode("");
      setPasswordChangeVerificationCode("");
      return;
    }
    if (passwordChangeCode === passwordChangeVerificationCode) {
      toast.success("✅ Código verificado! Digite sua nova senha.");
      setIsPasswordChanging(true);
    } else {
      toast.error("❌ Código incorreto! Tente novamente.");
      setPasswordChangeCode("");
    }
  };
  const handlePasswordChange = async () => {
    if (newPasswordForChange.length < 4) {
      toast.error("❌ Nova senha deve ter pelo menos 4 caracteres!");
      return;
    }
    if (newPasswordForChange !== confirmNewPassword) {
      toast.error("❌ Senhas não coincidem!");
      return;
    }
    try {
      // Atualizar senha no Supabase Auth (para login)
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPasswordForChange
      });
      if (error) {
        toast.error("❌ Erro ao atualizar senha: " + error.message);
        return;
      }

      // Atualizar senha do cadeado (funcionalidade local)
      onPasswordSet(newPasswordForChange);

      // Salvar senha do cadeado no banco de dados
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          error: dbError
        } = await supabase.from('subscriptions').update({
          lock_password_hash: newPasswordForChange,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id);
        if (dbError) {
          console.error('Erro ao salvar senha do cadeado no banco:', dbError);
          toast.error("❌ Erro ao salvar senha do cadeado!");
          return;
        }
      }

      // Resetar estados
      setShowPasswordChangeStep(false);
      setIsPasswordChanging(false);
      setPasswordChangeCode("");
      setPasswordChangeVerificationCode("");
      setNewPasswordForChange("");
      setConfirmNewPassword("");
      setPasswordChangeTimer(0);
      toast.success("🔐 Senha e senha do cadeado alteradas com sucesso!");
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error("❌ Erro inesperado ao alterar senha!");
    }
  };
  const handleResendPasswordCode = async () => {
    setCanResendPasswordCode(false);
    setPasswordChangeTimer(300);
    await sendPasswordChangeCode();
  };
  const handleCancelPasswordChange = () => {
    setShowPasswordChangeStep(false);
    setIsPasswordChanging(false);
    setPasswordChangeCode("");
    setPasswordChangeVerificationCode("");
    setNewPasswordForChange("");
    setConfirmNewPassword("");
    setPasswordChangeTimer(0);
    setCanResendPasswordCode(false);
  };
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };
  const handleCancelSubscription = async () => {
    if (cancelConfirmation.toLowerCase() !== "sim") {
      toast.error("❌ Digite 'sim' para confirmar o cancelamento!");
      return;
    }
    setIsCanceling(true);
    try {
      const {
        error
      } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      if (error) throw error;
      toast.success("✅ Assinatura cancelada com sucesso! Você retornou ao plano gratuito.");
      setShowCancelDialog(false);
      setCancelConfirmation("");

      // Refresh subscription status
      await checkSubscription();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error("❌ Erro ao cancelar assinatura: " + (error as Error).message);
    } finally {
      setIsCanceling(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-transparent hover:bg-muted/10 text-muted-foreground relative" disabled={disabled}>
          {profileData.profileImage ? <img src={profileData.profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover" /> : <User className="w-4 h-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>👤 {t('profile.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          
          {/* Profile Information */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              👤 {t('profile.personalInfo')}
            </h3>
            
            {/* Profile Image */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileData.profileImage ? <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-gray-400" />}
              </div>
              <div>
                <Label htmlFor="profileImage" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {t('profile.uploadPhoto')}
                    </span>
                  </Button>
                </Label>
                <input id="profileImage" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <Label>{t('profile.fullName')}</Label>
              <Input placeholder="Enter your full name" value={profileData.fullName} onChange={e => updateProfile('fullName', e.target.value)} />
            </div>

            {/* Primary Email */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label>{t('profile.primaryEmail')}</Label>
                {profileData.primaryEmail === 'first' && <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {t('profile.primary')}
                  </div>}
              </div>
              <div className="flex gap-2">
                <Input type="email" placeholder="Enter your email" value={profileData.email} onChange={e => {
                const newEmail = e.target.value;
                setNewEmailToSave(newEmail);
                updateProfile('email', newEmail);
                if (isEditingEmail) {
                  setEmailVerified(false);
                  setEmailNeedsVerification(true);
                }
              }} className="flex-1" disabled={!isEditingEmail} />
                
                {!isEditingEmail ? <Button size="sm" variant="outline" onClick={() => setIsEditingEmail(true)} className="px-3 text-xs">
                    {t('profile.changeEmail')}
                  </Button> : <Button size="sm" variant="outline" onClick={async () => {
                if (!emailVerified || emailNeedsVerification) {
                  toast.error("❌ Email precisa ser verificado primeiro!");
                  return;
                }

                // Salvar email no Supabase Auth se foi verificado
                if (emailVerified && newEmailToSave) {
                  try {
                    const {
                      error
                    } = await supabase.auth.updateUser({
                      email: newEmailToSave
                    });
                    if (error) {
                      toast.error("❌ Erro ao atualizar email: " + error.message);
                      return;
                    }
                    toast.success("✅ Email salvo e atualizado para login!");
                  } catch (error) {
                    console.error('Error updating email in auth:', error);
                    toast.error("❌ Erro ao salvar email!");
                    return;
                  }
                }
                setIsEditingEmail(false);
                setEmailNeedsVerification(false);
              }} disabled={!emailVerified || emailNeedsVerification} className={`px-3 text-xs ${!emailVerified || emailNeedsVerification ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {t('profile.save')}
                  </Button>}

                <div className={`
                    flex items-center justify-center w-10 h-9 rounded-md border text-sm font-medium
                    ${emailVerified ? 'bg-green-500/20 border-green-500/50 text-green-600 animate-pulse' : 'bg-red-500/20 border-red-500/50 text-red-600'}
                  `}>
                  ✓
                </div>
              </div>
              
              {/* Email de Login */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">🔑 {t('profile.loginEmail')}</Label>
                  <p className="text-xs text-muted-foreground font-mono">
                    {loginEmail || "Carregando..."}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('profile.useLoginEmail')}</p>
                </div>
              </div>
              
              {/* Email Verification Section */}
              {!showOtpStep ? <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={sendVerificationCode} disabled={isSendingCode || !profileData.email} className="flex-1 text-xs">
                      <Mail className="w-4 h-4 mr-2" />
                      {isSendingCode ? t('profile.validating') : t('profile.validateEmail')}
                    </Button>
                    <SendMessageDialog isOpen={showSendMessageDialog} setIsOpen={setShowSendMessageDialog} />
                  </div>
                  
                  {/* Botões de alteração de senha */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={sendPasswordChangeCode} disabled={isSendingPasswordCode || !loginEmail} className="flex-1 text-xs">
                      🔐 {isSendingPasswordCode ? t('profile.sending') : t('profile.changePassword')}
                    </Button>
                    
                  </div>
                  
                  {/* Botão alterar email */}
                  {!showEmailChangeStep && !showEmailChangeInputStep ? <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={sendEmailChangeCode} disabled={isSendingEmailCode || !profileData.email} className="flex-1 text-xs">
                        📧 {isSendingEmailCode ? "Enviando..." : "Alterar Email"}
                      </Button>
                    </div> : showEmailChangeInputStep ? <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                      <div className="text-center space-y-2">
                        <h4 className="font-medium text-sm">📧 Digite o Novo Email</h4>
                        <p className="text-xs text-muted-foreground">
                          Insira o novo endereço de email que deseja usar
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <Input type="email" placeholder="novo@email.com" value={newEmailForChange} onChange={e => setNewEmailForChange(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleEmailChangeSubmit();
                    }
                  }} />
                        
                        <div className="flex gap-2">
                          <Button onClick={handleEmailChangeSubmit} disabled={isSendingEmailCode || !newEmailForChange} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            <Send className="w-4 h-4 mr-2" />
                            {isSendingEmailCode ? "Enviando..." : "Enviar Código"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEmailChange} className="flex-1">
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div> : <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                      <div className="text-center space-y-2">
                        <h4 className="font-medium text-sm">📧 Verificação de Alteração de Email</h4>
                        <p className="text-xs text-muted-foreground">
                          Digite o código enviado para: <span className="font-medium">{newEmailForChange}</span>
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={emailChangeCode} onChange={setEmailChangeCode} onComplete={verifyEmailChangeCode}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        
                        {emailChangeTimer > 0 && <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Código expira em: {formatTime(emailChangeTimer)}</span>
                            </div>
                          </div>}
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleResendEmailCode} disabled={!canResendEmailCode || isSendingEmailCode} className="flex-1">
                            {isSendingEmailCode ? "Enviando..." : canResendEmailCode ? "📤 Reenviar" : `⏱️ ${formatTime(emailChangeTimer)}`}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEmailChange} className="flex-1">
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                        
                        {emailChangeCode.length === 6 && <Button onClick={verifyEmailChangeCode} className="w-full bg-blue-600 hover:bg-blue-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmar Novo Email
                          </Button>}
                      </div>
                    </div>}
                </div> : <div className="space-y-4 p-4 border rounded-lg bg-muted/5">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium text-sm">📧 Verificação de Email</h4>
                    <p className="text-xs text-muted-foreground">
                      Digite o código de 6 dígitos enviado para:
                    </p>
                    <p className="text-xs font-medium">{profileData.email}</p>
                    
                    {/* Botão para disparar mensagem - só aparece se auto reset estiver ativado */}
                    {autoResetPassword && <Button variant="outline" size="sm" disabled={true} className="mt-2 text-xs opacity-60 cursor-not-allowed">
                        você solicitou reset do cadeado
                      </Button>}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} onComplete={verifyCode}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    
                    {timer > 0 && <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Código expira em: {formatTime(timer)}</span>
                        </div>
                      </div>}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleResendCode} disabled={!canResend || isSendingCode} className="flex-1">
                        {isSendingCode ? "Enviando..." : canResend ? "📤 Reenviar" : `⏱️ ${formatTime(timer)}`}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelVerification} className="flex-1">
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                    
                    {otpCode.length === 6 && <Button onClick={verifyCode} disabled={isVerifying} className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isVerifying ? "Verificando..." : "Verificar Código"}
                      </Button>}
                  </div>
                </div>}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">🔐 Auto Reset de Senha</Label>
                  <p className="text-xs text-muted-foreground">
                    Resetar senha do cadeado automaticamente após validação do email
                  </p>
                </div>
                <Switch checked={autoResetPassword} onCheckedChange={setAutoResetPassword} />
              </div>
            </div>

            {/* Second Email */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label>Email Secundário</Label>
                {profileData.primaryEmail === 'second' && <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Principal
                  </div>}
              </div>
              <div className="flex gap-2">
                <Input type="email" placeholder="Enter your second email" value={profileData.secondEmail} onChange={e => updateProfile('secondEmail', e.target.value)} className="flex-1" />
                
                <div className={`
                    flex items-center justify-center w-10 h-9 rounded-md border text-sm font-medium
                    ${secondEmailVerified ? 'bg-green-500/20 border-green-500/50 text-green-600 animate-pulse' : 'bg-gray-500/20 border-gray-500/50 text-gray-600'}
                  `}>
                  ✓
                </div>
              </div>
              
              
              {/* Secondary Email Verification Section */}
              {!showSecondOtpStep ? <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={sendSecondEmailVerificationCode} disabled={isSendingSecondCode || !profileData.secondEmail} className="flex-1 text-xs">
                      <Mail className="w-4 h-4 mr-2" />
                      {isSendingSecondCode ? "Enviando..." : "📧 Enviar Código"}
                    </Button>
                  </div>
                  
                </div> : <div className="space-y-4 p-4 border rounded-lg bg-muted/5">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium text-sm">📧 Verificação de Email Secundário</h4>
                    <p className="text-xs text-muted-foreground">
                      Digite o código de 6 dígitos enviado para:
                    </p>
                    <p className="text-xs font-medium">{profileData.secondEmail}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={secondOtpCode} onChange={setSecondOtpCode} onComplete={verifySecondEmailCode}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    
                    {secondTimer > 0 && <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Código expira em: {formatTime(secondTimer)}</span>
                        </div>
                      </div>}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleResendSecondCode} disabled={!canResendSecond || isSendingSecondCode} className="flex-1">
                        {isSendingSecondCode ? "Enviando..." : canResendSecond ? "📤 Reenviar" : `⏱️ ${formatTime(secondTimer)}`}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelSecondVerification} className="flex-1">
                        <X className="w-4 h-4 mr-1" />
                        {t('profile.cancel')}
                      </Button>
                    </div>
                    
                    {secondOtpCode.length === 6 && <Button onClick={verifySecondEmailCode} disabled={isSecondVerifying} className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isSecondVerifying ? t('profile.verifying') : t('profile.verifyCode')}
                      </Button>}
                  </div>
                </div>}
            </div>

            {/* Password Change Dialog */}
            {showPasswordChangeStep && <div className="space-y-4 p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
                <div className="text-center space-y-2">
                  <h4 className="font-medium text-sm">🔐 Alteração de Senha</h4>
                  <p className="text-xs text-muted-foreground">
                    {!isPasswordChanging ? <>Digite o código enviado para: <span className="font-medium">{loginEmail}</span></> : "Digite sua nova senha"}

            {/* Email Change Dialog */}
            {showEmailChangeStep && <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="text-center space-y-2">
                  <h4 className="font-medium text-sm">📧 Alteração de Email</h4>
                  <p className="text-xs text-muted-foreground">
                    Digite o código enviado para: <span className="font-medium">{newEmailForChange}</span>
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={emailChangeCode} onChange={setEmailChangeCode} onComplete={verifyEmailChangeCode}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  
                  {emailChangeTimer > 0 && <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{t('profile.codeExpires')}: {formatTime(emailChangeTimer)}</span>
                      </div>
                    </div>}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleResendEmailCode} disabled={!canResendEmailCode || isSendingEmailCode} className="flex-1">
                      {isSendingEmailCode ? t('profile.sending') : canResendEmailCode ? `📤 ${t('profile.resend')}` : `⏱️ ${formatTime(emailChangeTimer)}`}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEmailChange} className="flex-1">
                      <X className="w-4 h-4 mr-1" />
                      {t('profile.cancel')}
                    </Button>
                  </div>
                  
                  {emailChangeCode.length === 6 && <Button onClick={verifyEmailChangeCode} className="w-full bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Alterar Email
                    </Button>}
                </div>
              </div>}
                  </p>
                </div>
                
                {!isPasswordChanging ? <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={passwordChangeCode} onChange={setPasswordChangeCode} onComplete={verifyPasswordChangeCode}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    
                    {passwordChangeTimer > 0 && <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{t('profile.codeExpires')}: {formatTime(passwordChangeTimer)}</span>
                        </div>
                      </div>}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleResendPasswordCode} disabled={!canResendPasswordCode || isSendingPasswordCode} className="flex-1">
                        {isSendingPasswordCode ? t('profile.sending') : canResendPasswordCode ? `📤 ${t('profile.resend')}` : `⏱️ ${formatTime(passwordChangeTimer)}`}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancelPasswordChange} className="flex-1">
                        <X className="w-4 h-4 mr-1" />
                        {t('profile.cancel')}
                      </Button>
                    </div>
                    
                    {passwordChangeCode.length === 6 && <Button onClick={verifyPasswordChangeCode} className="w-full bg-orange-600 hover:bg-orange-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('profile.verifyCode')}
                      </Button>}
                  </div> : <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Nova Senha</Label>
                      <Input type="password" placeholder="Digite a nova senha (mín. 4 caracteres)" value={newPasswordForChange} onChange={e => setNewPasswordForChange(e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Confirmar Nova Senha</Label>
                      <Input type="password" placeholder="Confirme a nova senha" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handlePasswordChange} disabled={!newPasswordForChange || !confirmNewPassword} className="flex-1 bg-green-600 hover:bg-green-700">
                        🔐 Alterar Senha
                      </Button>
                      <Button variant="outline" onClick={handleCancelPasswordChange} className="flex-1">
                        {t('profile.cancel')}
                      </Button>
                    </div>
                  </div>}
              </div>}

            {/* Birth Date */}
            <div className="space-y-1">
              <Label>{t('profile.birthDate')}</Label>
              <Input type="date" value={profileData.birthDate} onChange={e => updateProfile('birthDate', e.target.value)} />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label>{t('profile.phone')}</Label>
              <Input type="tel" placeholder="Enter your phone number" value={profileData.phone} onChange={e => updateProfile('phone', e.target.value)} />
            </div>

            <Button onClick={saveProfile} className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              💾 {isLoading ? t('profile.saving') : t('profile.saveProfile')}
            </Button>
          </div>



          {/* Subscription Management */}
          <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">💳 {t('profile.subscription')}</h3>
              <div className="text-sm text-muted-foreground">
                <p>{t('profile.currentPlan')}: <span className="font-medium">{subscribed ? subscription_tier : 'Free'}</span></p>
                {subscribed && (
                  <p className="text-xs mt-1">{t('profile.status')}: <span className="text-green-600 font-medium">{t('profile.active')}</span></p>
                )}
                {!subscribed && (
                  <p className="text-xs mt-1">{t('profile.status')}: <span className="text-muted-foreground">{t('profile.free')}</span></p>
                )}
              </div>
              {subscribed && (
                <Button onClick={() => setShowCancelDialog(true)} className="w-full bg-red-500 hover:bg-red-600">
                  <X className="w-4 h-4 mr-2" />
                  🚫 {t('profile.cancelSubscription')}
                </Button>
              )}
            </div>

          {/* Cancel Subscription Dialog */}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>🚫 Cancelar Assinatura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tem certeza que deseja cancelar sua assinatura? Você retornará ao plano gratuito.
                </p>
                <div className="space-y-2">
                  <Label>Digite "sim" para confirmar:</Label>
                  <Input type="text" placeholder="Digite 'sim' para confirmar" value={cancelConfirmation} onChange={e => setCancelConfirmation(e.target.value)} disabled={isCanceling} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCancelSubscription} className="flex-1 bg-red-500 hover:bg-red-600" disabled={isCanceling || cancelConfirmation.toLowerCase() !== "sim"}>
                    {isCanceling ? "Cancelando..." : "Confirmar Cancelamento"}
                  </Button>
                  <Button onClick={() => {
                  setShowCancelDialog(false);
                  setCancelConfirmation("");
                }} variant="outline" disabled={isCanceling}>
                    Voltar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <PasswordDialog isOpen={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} mode={passwordDialogMode} onPasswordSet={(password, confirmPassword, autoLockMinutes) => {
          onPasswordSet(password);
          setShowPasswordDialog(false);
        }} onPasswordVerify={password => {
          return password === masterPassword;
        }} onPasswordChange={async (currentPassword, newPassword, confirmPassword, autoLockMinutes) => {
          if (currentPassword !== masterPassword) {
            throw new Error('Senha atual incorreta');
          }
          onPasswordSet(newPassword);
          setShowPasswordDialog(false);
        }} userEmail={profileData.email} />

        </div>
      </DialogContent>
    </Dialog>;
};