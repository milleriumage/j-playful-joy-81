import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const { createCheckout } = useSubscription();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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
        toast.success("Login realizado com sucesso! Redirecionando...");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = () => {
    if (isSignUp) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error("Erro no signup:", error);
        if (error.message.includes("already registered") || error.message.includes("already")) {
          toast.error("Este email já está cadastrado. Tente fazer login.");
          setIsSignUp(false); // Muda para modo login
        } else if (error.message.includes("Invalid email")) {
          toast.error("Email inválido. Verifique o formato do email.");
        } else if (error.message.includes("Password")) {
          toast.error("Senha muito fraca. Use pelo menos 6 caracteres.");
        } else {
          toast.error("Erro ao criar conta: " + error.message);
        }
      } else {
        toast.success("✅ Conta criada com sucesso! Redirecionando para checkout...");
        if (data.user) {
          try {
            await createCheckout('trial', 'prod_SvBWXqVqBH5hlK');
          } catch (error) {
            console.error('Erro ao redirecionar para checkout:', error);
            window.location.href = "/dashboard";
          }
        }
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </h1>
            <p className="text-white/80">
              {isSignUp ? 'Crie sua conta e comece agora' : 'Entre na sua conta'}
            </p>
          </div>
          
          <div className="space-y-4">
            <Input 
              type="email" 
              placeholder="Seu e-mail" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40" 
            />
            <Input 
              type="password" 
              placeholder="Sua senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40" 
            />
            {isSignUp && (
              <Input 
                type="password" 
                placeholder="Confirmar senha" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40" 
              />
            )}
            <Button 
              onClick={handleAuth} 
              disabled={isLoading} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isSignUp ? 'Criando conta...' : 'Entrando...') : (isSignUp ? 'Criar conta' : 'Entrar')}
            </Button>
            
            <div className="space-y-2">
              <p className="text-center text-white/70">
                {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}{' '}
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setConfirmPassword('');
                  }} 
                  className="text-white hover:underline font-medium"
                >
                  {isSignUp ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button asChild variant="outline" className="w-full text-white border-white/40 hover:bg-white/10">
              <Link to="/">
                ← Voltar para o início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}