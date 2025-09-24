import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Clock, X, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
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

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendRecoveryCode = async () => {
    if (!email) {
      toast.error("❌ Digite seu email!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("❌ Formato de email inválido!");
      return;
    }

    setIsSending(true);
    const generatedCode = generateVerificationCode();
    setVerificationCode(generatedCode);

    try {
      const { error } = await supabase.functions.invoke('send-recovery-code', {
        body: {
          email: email.trim().toLowerCase(),
        },
      });

      if (error) throw error;

      toast.success("📧 Código de recuperação enviado para seu email!");
      setStep('code');
      setTimer(60); // 1 minute = 60 seconds
      setCanResend(false);
      setCode("");
    } catch (error) {
      console.error('Error sending recovery code:', error);
      toast.error("❌ Erro ao enviar código: " + (error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (code !== verificationCode) {
      toast.error("❌ Código incorreto!");
      return;
    }

    toast.success("✅ Código verificado com sucesso!");
    setStep('password');
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("❌ Preencha todos os campos!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("❌ A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("❌ As senhas não coincidem!");
      return;
    }

    setIsLoading(true);

    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error("❌ Erro ao atualizar senha: " + error.message);
        return;
      }

      toast.success("🔐 Senha alterada com sucesso! Agora você pode fazer login com a nova senha.");
      handleClose();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error("❌ Erro inesperado ao alterar senha!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCanResend(false);
    setTimer(60);
    await sendRecoveryCode();
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setTimer(0);
    setCanResend(false);
    setIsLoading(false);
    setIsSending(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5" />
            Recuperar Senha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'email' && (
            <>
              <div className="text-center text-sm text-muted-foreground">
                Digite seu email para receber o código de recuperação
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendRecoveryCode()}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={sendRecoveryCode}
                  disabled={isSending || !email}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? "Enviando..." : "📧 Enviar Código"}
                </Button>
              </div>
            </>
          )}

          {step === 'code' && (
            <>
              <div className="text-center text-sm text-muted-foreground">
                Digite o código enviado para: <span className="font-medium">{email}</span>
              </div>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  onComplete={verifyCode}
                >
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
              
              {timer > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Código expira em: {formatTime(timer)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={!canResend || isSending}
                  className="flex-1"
                >
                  {isSending ? "Enviando..." : canResend ? "📤 Reenviar" : `⏱️ ${formatTime(timer)}`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
              
              {code.length === 6 && (
                <Button
                  onClick={verifyCode}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar Código
                </Button>
              )}
            </>
          )}

          {step === 'password' && (
            <>
              <div className="text-center text-sm text-muted-foreground">
                Digite sua nova senha
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nova Senha</Label>
                  <Input
                    type="password"
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePasswordReset}
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Alterando..." : "🔐 Alterar Senha"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}