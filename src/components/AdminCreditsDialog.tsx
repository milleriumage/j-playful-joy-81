import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Send, Users, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  credits: number;
  settings: any;
}

interface AdminCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCreditsDialog({ isOpen, onClose }: AdminCreditsDialogProps) {
  const [userId, setUserId] = useState('');
  const [creditsAmount, setCreditsAmount] = useState('');
  const [message, setMessage] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProfiles = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, credits, settings')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar perfis:', error);
        toast.error('Erro ao carregar lista de usuários');
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar usuários');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddCredits = async () => {
    if (!userId.trim()) {
      toast.error('Por favor, insira o ID do usuário');
      return;
    }

    if (!creditsAmount.trim() || isNaN(Number(creditsAmount)) || Number(creditsAmount) <= 0) {
      toast.error('Por favor, insira uma quantidade válida de créditos');
      return;
    }

    if (!message.trim()) {
      toast.error('Por favor, insira uma mensagem');
      return;
    }

    setIsLoading(true);
    try {
      // Buscar o perfil do usuário (aceita tanto ID quanto user_id)
      let profile = null;
      
      // Tentar primeiro por ID
      const { data: profileById, error: profileByIdError } = await supabase
        .from('profiles')
        .select('id, user_id, credits, display_name')
        .eq('id', userId.trim())
        .single();

      if (profileById && !profileByIdError) {
        profile = profileById;
      } else {
        // Tentar por user_id se não encontrou por ID
        const { data: profileByUserId, error: profileByUserIdError } = await supabase
          .from('profiles')
          .select('id, user_id, credits, display_name')
          .eq('user_id', userId.trim())
          .single();
        
        if (profileByUserId && !profileByUserIdError) {
          profile = profileByUserId;
        }
      }

      if (!profile) {
        toast.error(`Usuário não encontrado para ID: ${userId.trim()}`);
        console.log('Profile search failed for ID:', userId.trim());
        return;
      }

      console.log('Found profile:', profile);

      const newCredits = profile.credits + Number(creditsAmount);

      // Atualizar créditos com validação estrita (sempre atualiza por profile.id)
      console.log('[AdminCredits] Attempting update', {
        inputUserId: userId.trim(),
        targetProfileId: profile.id,
        targetUserId: profile.user_id,
        previousCredits: profile.credits,
        add: Number(creditsAmount),
        newCredits
      });

      // Tentar via Edge Function com role de serviço (respeita RLS)
      const { data: rpcData, error: rpcError } = await supabase.functions.invoke('update-user-credits', {
        body: {
          user_id: profile.user_id, // CORRETO: usa profile.user_id que aponta para auth.users
          credits_to_add: Number(creditsAmount),
          transaction_type: 'adjustment',
          payment_reference: 'admin_manual'
        }
      });

      console.log('[AdminCredits] EdgeFunction response', { rpcData, rpcError });

      if (rpcError) {
        console.error('Erro na Edge Function update-user-credits:', rpcError);
        toast.error('Erro ao adicionar créditos (edge function)');
        return;
      }

      if (!rpcData?.new_credits && rpcData?.status !== 'success') {
        console.error('Resposta inesperada da Edge Function:', rpcData);
        toast.error('Falha ao confirmar atualização de créditos');
        return;
      }

      const updatedProfile = { id: profile.id, user_id: profile.user_id, credits: rpcData.new_credits } as const;
      console.log('[AdminCredits] Update successful via Edge Function', updatedProfile);

      // Criar notificação
      const { error: notificationError } = await supabase.rpc('create_notification', {
        p_user_id: profile.user_id,
        p_type: 'credit_addition',
        p_title: '💳 Créditos Adicionados!',
        p_message: message.trim(),
        p_credits_amount: Number(creditsAmount)
      });

      if (notificationError) {
        console.error('Erro ao criar notificação:', notificationError);
        // Não falhar a operação por causa da notificação
      }

      toast.success(`${creditsAmount} créditos adicionados com sucesso! Total atual: ${newCredits}`);
      
      // Limpar formulário
      setUserId('');
      setCreditsAmount('');
      setMessage('');
      
      // Atualizar lista
      await fetchProfiles();
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Administração de Créditos
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Formulário */}
          <div className="w-1/2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Créditos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    placeholder="ID do perfil do usuário"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits">Quantidade de Créditos</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    placeholder="Ex: 100"
                    value={creditsAmount}
                    onChange={(e) => setCreditsAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem para o Usuário</Label>
                  <Textarea
                    id="message"
                    placeholder="Mensagem que aparecerá na notificação..."
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleAddCredits}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processando...' : 'Enviar Créditos'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Usuários */}
          <div className="w-1/2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários Registrados ({profiles.length})
                </CardTitle>
                <Button
                  onClick={fetchProfiles}
                  disabled={isRefreshing}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-3">
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setUserId(profile.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {profile.display_name || 'Usuário sem nome'}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              Profile ID: {profile.id}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              User ID: {profile.user_id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Email: {profile.settings?.email || 'Não informado'}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {profile.credits} créditos
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {profiles.length === 0 && !isRefreshing && (
                      <div className="text-center text-muted-foreground py-8">
                        Nenhum usuário encontrado
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}