import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AutoLockCountdown } from "./AutoLockCountdown";
import { usePasswordProtection } from "@/hooks/usePasswordProtection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'set' | 'verify' | 'change';
  onPasswordSet?: (password: string, confirmPassword: string, autoLockMinutes?: number) => void;
  onPasswordVerify?: (password: string) => boolean;
  onPasswordChange?: (currentPassword: string, newPassword: string, confirmPassword: string, autoLockMinutes?: number) => void;
  onSaveTimeOnly?: (autoLockMinutes: number) => void;
  userEmail?: string;
  onPasswordChangeRequest?: () => void;
}
export const PasswordDialog = ({
  isOpen,
  onClose,
  mode,
  onPasswordSet,
  onPasswordVerify,
  onPasswordChange,
  onSaveTimeOnly,
  userEmail,
  onPasswordChangeRequest
}: PasswordDialogProps) => {
  const {
    timeRemaining,
    isTimerActive
  } = usePasswordProtection();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [autoLockTime, setAutoLockTime] = useState('30');
  const [autoLockUnit, setAutoLockUnit] = useState('minutes');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [sentCode, setSentCode] = useState('');
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para validação de email e reset
  const [autoResetPassword, setAutoResetPassword] = useState(false);
  const [emailValidationCode, setEmailValidationCode] = useState('');
  const [showEmailValidation, setShowEmailValidation] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);

  // Validações em tempo real
  const isPasswordValid = password.length >= 4;
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0;
  const canProceed = mode === 'verify' && !codeVerified ? password.length > 0 : 
                    (mode === 'set' || codeVerified) ? isPasswordValid && isPasswordMatch : 
                    mode === 'change' ? !currentPasswordVerified ? currentPassword.length > 0 : isPasswordValid && isPasswordMatch : 
                    false;
  const handleSubmit = () => {
    if (mode === 'set' || codeVerified) {
      try {
        const timeInMinutes = autoLockUnit === 'hours' ? parseInt(autoLockTime) * 60 : parseInt(autoLockTime);
        onPasswordSet?.(password, confirmPassword, timeInMinutes);
        toast.success("🔐 Senha definida com sucesso!");
        handleClose();
      } catch (error) {
        toast.error(`❌ ${(error as Error).message}`);
      }
    } else if (mode === 'change') {
      if (!currentPasswordVerified) {
        // Verificar senha atual primeiro
        const success = onPasswordVerify?.(currentPassword);
        if (success) {
          setCurrentPasswordVerified(true);
          toast.success("✅ Senha atual confirmada! Agora defina a nova senha.");
          setCurrentPassword('');
        } else {
          toast.error("❌ Senha atual incorreta!");
          setCurrentPassword('');
        }
      } else {
        // Definir nova senha
        try {
          const timeInMinutes = autoLockUnit === 'hours' ? parseInt(autoLockTime) * 60 : parseInt(autoLockTime);
          onPasswordChange?.(currentPassword, password, confirmPassword, timeInMinutes);
          toast.success("🔄 Senha alterada com sucesso!");
          handleClose();
        } catch (error) {
          toast.error(`❌ ${(error as Error).message}`);
        }
      }
    } else {
      const success = onPasswordVerify?.(password);
      if (success) {
        toast.success("🔓 Desbloqueado com sucesso!");
        handleClose();
      } else {
        toast.error("❌ Senha incorreta!");
        setPassword('');
      }
    }
  };
  const handleSaveTimeOnly = () => {
    try {
      const timeInMinutes = autoLockUnit === 'hours' ? parseInt(autoLockTime) * 60 : parseInt(autoLockTime);
      onSaveTimeOnly?.(timeInMinutes);
      toast.success("⏱️ Tempo de bloqueio salvo!");
      handleClose();
    } catch (error) {
      toast.error(`❌ ${(error as Error).message}`);
    }
  };
  const handleForgotPassword = async () => {
    if (!recoveryEmail) {
      toast.error("❌ Digite seu email para recuperação");
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('send-recovery-code', {
        body: {
          email: recoveryEmail
        }
      });
      if (error) throw error;

      // Salva o código enviado para comparação
      if (data?.code) {
        setSentCode(data.code);
      }
      toast.success("📧 Código de recuperação enviado para seu email!");
      setCodeSent(true);
    } catch (error) {
      console.error('Error sending recovery code:', error);
      toast.error("❌ Erro ao enviar código de recuperação");
    }
  };
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("❌ Digite o código de 6 dígitos");
      return;
    }

    // Verificar se o código digitado corresponde ao código enviado
    if (verificationCode !== sentCode) {
      toast.error("❌ Código incorreto! Verifique seu email.");
      setVerificationCode('');
      return;
    }
    try {
      toast.success("✅ Código verificado! Agora defina sua nova senha.");
      setCodeVerified(true);
      setCodeSent(false);
      setIsRecovering(false);
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error("❌ Código inválido ou expirado");
    }
  };
  // Função para gerar código de verificação
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Função para validar email
  const handleValidateEmail = async () => {
    if (!userEmail) {
      toast.error("❌ Email não disponível para validação");
      return;
    }

    setIsSendingEmailCode(true);
    const code = generateVerificationCode();
    setEmailValidationCode(code);

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: userEmail,
          code: code
        }
      });

      if (error) throw error;

      toast.success("📧 Código de verificação enviado para seu email!");
      setShowEmailValidation(true);
    } catch (error) {
      console.error('Error sending validation code:', error);
      toast.error("❌ Erro ao enviar código de verificação");
    } finally {
      setIsSendingEmailCode(false);
    }
  };

  // Função para verificar código de validação
  const handleVerifyEmailCode = () => {
    if (!inputCode || inputCode.length !== 6) {
      toast.error("❌ Digite o código de 6 dígitos");
      return;
    }

    if (inputCode !== emailValidationCode) {
      toast.error("❌ Código incorreto! Verifique seu email.");
      setInputCode('');
      return;
    }

    toast.success("✅ Email verificado com sucesso!");
    
    // Se o auto reset estiver ativado, resetar a senha
    if (autoResetPassword) {
      toast.success("🔐 Senha do cadeado resetada! Defina uma nova senha.");
      setShowEmailValidation(false);
      setInputCode('');
      setEmailValidationCode('');
      // Mudar para modo set para criar nova senha
      setCodeVerified(true);
    } else {
      setShowEmailValidation(false);
      setInputCode('');
      setEmailValidationCode('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setCurrentPasswordVerified(false);
    setIsRecovering(false);
    setRecoveryEmail('');
    setCodeSent(false);
    setVerificationCode('');
    setCodeVerified(false);
    setSentCode('');
    setShowEmailValidation(false);
    setInputCode('');
    setEmailValidationCode('');
    setAutoResetPassword(false);
    onClose();
  };
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {mode === 'set' ? 'Definir Senha Mestre' : mode === 'change' ? currentPasswordVerified ? 'Nova Senha' : 'Alterar Senha' : 'Senha Necessária'}
            </DialogTitle>
          </div>
          {mode === 'change' && !currentPasswordVerified && <p className="text-sm text-muted-foreground">
              Por favor, confirme sua senha atual primeiro
            </p>}
          {mode === 'change' && currentPasswordVerified && <p className="text-sm text-green-600">
              ✅ Senha atual confirmada! Agora defina sua nova senha
            </p>}
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Senha atual - modo change - ETAPA 1 */}
          {mode === 'change' && !currentPasswordVerified && <div className="space-y-3 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center gap-2 text-orange-700">
                <Shield className="w-5 h-5" />
                <h4 className="font-semibold">ETAPA 1: Confirme sua senha atual</h4>
              </div>
              <p className="text-sm text-orange-600 mb-3">
                Por segurança, confirme primeiro sua senha atual antes de definir uma nova
              </p>
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2 font-medium">
                  <Lock className="w-4 h-4" />
                  Senha atual
                </Label>
                <div className="relative">
                  <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual para continuar" className={`pr-10 ${currentPassword.length > 0 ? 'border-orange-400 focus:border-orange-500' : 'border-orange-300'}`} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {currentPassword.length === 0 && <div className="text-xs text-orange-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Digite sua senha atual para prosseguir
                  </div>}
              </div>
            </div>}

          {/* Nova senha ou senha para verificar ou recuperação */}
          {(mode !== 'change' || currentPasswordVerified || codeVerified) && !codeSent && !isRecovering && <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {mode === 'set' ? 'Nova senha (mínimo 4 caracteres)' : mode === 'change' ? 'Nova senha (mínimo 4 caracteres)' : 'Senha'}
              </Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'change' ? "Digite sua nova senha" : "Digite sua senha"} className={`pr-10 ${(mode === 'set' || mode === 'change') && password && !isPasswordValid ? 'border-red-300' : isPasswordValid ? 'border-green-300' : ''}`} />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {(mode === 'set' || mode === 'change') && password && <div className={`text-xs ${isPasswordValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isPasswordValid ? '✅ Senha válida' : '❌ Mínimo 4 caracteres'}
                </div>}
            </div>}

          {/* Confirmar senha - inclui recuperação */}
          {(mode === 'set' || mode === 'change' && currentPasswordVerified || codeVerified) && !codeSent && !isRecovering && <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar nova senha
                </Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Digite a nova senha novamente" className={`pr-10 ${confirmPassword && !isPasswordMatch ? 'border-red-300' : isPasswordMatch ? 'border-green-300' : ''}`} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {confirmPassword && <div className={`text-xs ${isPasswordMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {isPasswordMatch ? '✅ Senhas coincidem' : '❌ Senhas não coincidem'}
                  </div>}
              </div>

              {/* Configuração de tempo */}
              
            </>}

          {/* Validação de Email - sempre visível */}
          {!codeSent && !isRecovering && !showEmailValidation && (
            <>
              <div className="flex items-center justify-center py-2">
                {/* Botão Validar Email */}
                <Button variant="outline" size="sm" onClick={handleValidateEmail} disabled={isSendingEmailCode || !userEmail} className="flex-1 text-xs mr-2">
                  <Mail className="w-4 h-4 mr-2" />
                  {isSendingEmailCode ? "Enviando..." : "Validar Email"}
                </Button>
              </div>

              {/* Toggle Auto Reset de Senha */}
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5 mb-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">🔐 Auto Reset de Senha</Label>
                  <p className="text-xs text-muted-foreground">
                    Resetar senha do cadeado automaticamente após validação do email
                  </p>
                </div>
                <Switch checked={autoResetPassword} onCheckedChange={setAutoResetPassword} />
              </div>
            </>
          )}

          {/* Interface de Validação de Email */}
          {showEmailValidation && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Verificação de Email</h4>
              </div>
              <p className="text-sm text-blue-700">
                Código enviado para: <strong>{userEmail}</strong>
              </p>
              {autoResetPassword && (
                <p className="text-xs text-green-700 bg-green-100 p-2 rounded">
                  ✅ Auto reset ativado - senha será resetada após verificação
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="emailValidationCode">Código de 6 dígitos</Label>
                <Input 
                  id="emailValidationCode" 
                  type="text" 
                  value={inputCode} 
                  onChange={e => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  placeholder="000000" 
                  className="text-center text-lg font-mono tracking-widest" 
                  maxLength={6} 
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setShowEmailValidation(false);
                  setInputCode('');
                  setEmailValidationCode('');
                }}>
                  Voltar
                </Button>
                <Button variant="outline" size="sm" onClick={handleValidateEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar Código
                </Button>
                <Button size="sm" onClick={handleVerifyEmailCode} disabled={inputCode.length !== 6}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Verificar Código
                </Button>
              </div>
            </div>
          )}

          {/* Recuperação de senha */}
          {isRecovering && !codeSent && <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Recuperar Senha</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recoveryEmail">Email para recuperação</Label>
                <Input id="recoveryEmail" type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} placeholder="Digite seu email" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsRecovering(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleForgotPassword}>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Código
                </Button>
              </div>
            </div>}

          {/* Inserir código de verificação */}
          {codeSent && <div className="space-y-4 p-4 border rounded-lg bg-green-50/50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Código de Verificação</h4>
              </div>
              <p className="text-sm text-green-700">
                Código enviado para: <strong>{recoveryEmail}</strong>
              </p>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Código de 6 dígitos</Label>
                <Input id="verificationCode" type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="text-center text-lg font-mono tracking-widest" maxLength={6} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => {
              setCodeSent(false);
              setVerificationCode('');
            }}>
                  Voltar
                </Button>
                <Button variant="outline" size="sm" onClick={handleForgotPassword}>
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar Código
                </Button>
                <Button size="sm" onClick={handleVerifyCode} disabled={verificationCode.length !== 6}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Verificar Código
                </Button>
              </div>
            </div>}

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            
            {/* Botão para alteração de senha via email */}
            {onPasswordChangeRequest && (
              <Button variant="outline" size="sm" onClick={onPasswordChangeRequest} className="flex-1 text-xs">
                🔐 Alterar Senha
              </Button>
            )}
            
            {mode === 'set'}
            {!isRecovering && <Button onClick={handleSubmit} disabled={!canProceed} className="min-w-[140px]">
                {mode === 'set' ? <>
                    <Lock className="w-4 h-4 mr-2" />
                    Definir Senha
                  </> : mode === 'change' ? currentPasswordVerified ? <>
                      <Shield className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </> : <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Verificar Senha
                    </> : <>
                    <Shield className="w-4 h-4 mr-2" />
                    Desbloquear
                  </>}
              </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};