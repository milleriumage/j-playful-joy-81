import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCreatorSubscriptions, SubscriptionPlan } from '@/hooks/useCreatorSubscriptions';
import { Plus, Crown, Package, AlertTriangle, Users } from 'lucide-react';

const DEFAULT_MOTIVATIONAL_MESSAGE = "Deixe conteúdo gratuito para atrair novos seguidores!";

export const CreatorSubscriptionsManager: React.FC = () => {
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const { plans, loading, createOrUpdatePlan, activatePlan, deactivatePlan } = useCreatorSubscriptions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan> | null>(null);

  const generalPlan = plans.find(p => p.plan_type === 'general');
  const customPlans = plans.filter(p => p.plan_type === 'custom');

  const initializeGeneralPlan = () => {
    setCurrentPlan({
      plan_type: 'general',
      name: null,
      duration_days: 30,
      total_credits: 100,
      credits_per_day: 3,
      max_photos: 0,
      max_videos: 0,
      price: 0,
      description: null,
      motivational_message: DEFAULT_MOTIVATIONAL_MESSAGE,
      status: 'draft'
    });
    setIsCreateDialogOpen(true);
  };

  const initializeCustomPlan = () => {
    setCurrentPlan({
      plan_type: 'custom',
      name: '',
      duration_days: 30,
      total_credits: 100,
      credits_per_day: 3,
      max_photos: 5,
      max_videos: 2,
      price: 0,
      description: '',
      motivational_message: DEFAULT_MOTIVATIONAL_MESSAGE,
      status: 'draft'
    });
    setIsCreateDialogOpen(true);
  };

  const handleSavePlan = async (asDraft: boolean = true) => {
    if (!currentPlan) return;

    const planData = {
      ...currentPlan,
      status: (asDraft ? 'draft' : 'active') as 'draft' | 'active'
    };

    const success = await createOrUpdatePlan(planData);
    if (success) {
      setIsCreateDialogOpen(false);
      setCurrentPlan(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      pending_media: { label: 'Pendente mídia', variant: 'outline' as const },
      active: { label: 'Ativo', variant: 'default' as const },
      disabled: { label: 'Desativado', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const DeactivationDialog: React.FC<{ planId: string; planName: string }> = ({ planId, planName }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Desativar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Tem certeza que deseja desativar este plano?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>Aviso:</strong> usuários que já assinaram este plano podem se desapontar 
              ou desistir de futuras assinaturas. Isso pode impactar sua credibilidade.
            </p>
            <p className="text-sm text-muted-foreground">
              • Usuários atuais mantêm assinatura até expirar<br/>
              • Novas assinaturas serão bloqueadas<br/>
              • O plano "{planName}" ficará indisponível
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => deactivatePlan(planId)}
            className="bg-destructive hover:bg-destructive/90"
          >
            Confirmar Desativação
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <>
      {/* Botão Trigger */}
      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none">
            <Users className="w-4 h-4 mr-2" />
            <span>Assinaturas do Criador</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📋 Gerenciar Assinaturas do Criador</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
          <p className="text-muted-foreground">Gerencie seus planos de conteúdo para assinantes</p>
        </div>
        <div className="flex gap-2">
          {!generalPlan && (
            <Button onClick={initializeGeneralPlan} variant="outline">
              <Crown className="w-4 h-4 mr-2" />
              Criar Plano Geral
            </Button>
          )}
          <Button onClick={initializeCustomPlan}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano Personalizado
          </Button>
        </div>
      </div>

      {/* Motivational Message */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground italic">
            💡 {DEFAULT_MOTIVATIONAL_MESSAGE}
          </p>
        </CardContent>
      </Card>

      {/* Plans List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Seus Planos</h3>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum plano criado ainda
          </div>
        ) : (
          <div className="grid gap-4">
            {/* General Plan */}
            {generalPlan && (
              <Card className="border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      Plano Geral
                    </CardTitle>
                    {getStatusBadge(generalPlan.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duração:</span>
                      <p className="font-medium">{generalPlan.duration_days} dias</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total de créditos:</span>
                      <p className="font-medium">{generalPlan.total_credits}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Créditos/dia:</span>
                      <p className="font-medium">{generalPlan.credits_per_day}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {generalPlan.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => activatePlan(generalPlan.id)}
                      >
                        Ativar Plano
                      </Button>
                    )}
                    {generalPlan.status === 'active' && (
                      <DeactivationDialog 
                        planId={generalPlan.id} 
                        planName="Plano Geral" 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Plans */}
            {customPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {plan.name || 'Plano Personalizado'}
                    </CardTitle>
                    {getStatusBadge(plan.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duração:</span>
                      <p className="font-medium">{plan.duration_days} dias</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total de créditos:</span>
                      <p className="font-medium">{plan.total_credits}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Créditos/dia:</span>
                      <p className="font-medium">{plan.credits_per_day}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mídias:</span>
                      <p className="font-medium">
                        Fotos {plan.current_photos}/{plan.max_photos} | 
                        Vídeos {plan.current_videos}/{plan.max_videos}
                      </p>
                    </div>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  )}
                  <div className="flex gap-2">
                    {plan.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => activatePlan(plan.id)}
                      >
                        Ativar Plano
                      </Button>
                    )}
                    {plan.status === 'active' && (
                      <DeactivationDialog 
                        planId={plan.id} 
                        planName={plan.name || 'Plano Personalizado'} 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentPlan?.plan_type === 'general' ? 'Configurar Plano Geral' : 'Criar Plano Personalizado'}
            </DialogTitle>
          </DialogHeader>

          {currentPlan && (
            <div className="space-y-4">
              {currentPlan.plan_type === 'custom' && (
                <div>
                  <Label htmlFor="plan-name">Nome do Plano</Label>
                  <Input
                    id="plan-name"
                    value={currentPlan.name || ''}
                    onChange={(e) => setCurrentPlan({...currentPlan, name: e.target.value})}
                    placeholder="Ex: FOXGIRL Premium"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duração (dias)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={currentPlan.duration_days}
                    onChange={(e) => setCurrentPlan({...currentPlan, duration_days: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="total-credits">Total de créditos</Label>
                  <Input
                    id="total-credits"
                    type="number"
                    value={currentPlan.total_credits}
                    onChange={(e) => setCurrentPlan({...currentPlan, total_credits: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="credits-per-day">Créditos por dia</Label>
                  <Input
                    id="credits-per-day"
                    type="number"
                    value={currentPlan.credits_per_day}
                    onChange={(e) => setCurrentPlan({...currentPlan, credits_per_day: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {currentPlan.plan_type === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-photos">Máximo de fotos</Label>
                    <Input
                      id="max-photos"
                      type="number"
                      value={currentPlan.max_photos}
                      onChange={(e) => setCurrentPlan({...currentPlan, max_photos: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-videos">Máximo de vídeos</Label>
                    <Input
                      id="max-videos"
                      type="number"
                      value={currentPlan.max_videos}
                      onChange={(e) => setCurrentPlan({...currentPlan, max_videos: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={currentPlan.price}
                  onChange={(e) => setCurrentPlan({...currentPlan, price: parseFloat(e.target.value)})}
                />
              </div>

              {currentPlan.plan_type === 'custom' && (
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={currentPlan.description || ''}
                    onChange={(e) => setCurrentPlan({...currentPlan, description: e.target.value})}
                    placeholder="Descreva o que está incluído neste plano..."
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleSavePlan(true)}
                  disabled={loading}
                >
                  Salvar como Rascunho
                </Button>
                <Button 
                  onClick={() => handleSavePlan(false)}
                  disabled={loading}
                >
                  Ativar Plano
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};