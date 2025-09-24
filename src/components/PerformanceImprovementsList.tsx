import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Zap, Mouse, Eye, Smartphone } from 'lucide-react';

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'ux' | 'mobile' | 'accessibility';
  implemented?: boolean;
}

const improvements: ImprovementItem[] = [
  // Performance Critical
  {
    id: 'debounce-buttons',
    title: 'Debounce de Botões e Cliques',
    description: 'Implementar debounce de 300ms em todos os botões para evitar múltiplos cliques acidentais',
    priority: 'high',
    category: 'performance',
    implemented: true
  },
  {
    id: 'lazy-modals',
    title: 'Carregamento Lazy de Modais',
    description: 'Carregar modais apenas quando necessário, não durante o carregamento inicial',
    priority: 'high',
    category: 'performance'
  },
  {
    id: 'virtual-scrolling',
    title: 'Scroll Virtual para Listas',
    description: 'Implementar scroll virtual em listas grandes de mídia para melhor performance',
    priority: 'medium',
    category: 'performance'
  },
  {
    id: 'image-optimization',
    title: 'Otimização de Imagens',
    description: 'Lazy loading de imagens + placeholder skeleton durante carregamento',
    priority: 'high',
    category: 'performance'
  },
  
  // UX Improvements
  {
    id: 'loading-states',
    title: 'Estados de Loading Consistentes',
    description: 'Feedback visual imediato em todos os botões e ações (spinners, desabilitar botões)',
    priority: 'high',
    category: 'ux'
  },
  {
    id: 'smooth-transitions',
    title: 'Transições Suaves',
    description: 'Animações CSS de fade-in/out para modais e elementos que aparecem/desaparecem',
    priority: 'medium',
    category: 'ux'
  },
  {
    id: 'error-handling',
    title: 'Tratamento de Erros Melhorado',
    description: 'Toast notifications informativas para erros de rede e falhas de operação',
    priority: 'high',
    category: 'ux'
  },
  {
    id: 'optimistic-updates',
    title: 'Updates Otimistas',
    description: 'Atualizar UI imediatamente, reverter apenas se houver erro',
    priority: 'medium',
    category: 'ux'
  },
  
  // Mobile Experience
  {
    id: 'touch-targets',
    title: 'Targets de Toque Otimizados',
    description: 'Botões e elementos interativos com tamanho mínimo de 44px para mobile',
    priority: 'high',
    category: 'mobile'
  },
  {
    id: 'swipe-gestures',
    title: 'Gestos de Swipe',
    description: 'Adicionar gestos de swipe para fechar modais e navegar em carrosséis',
    priority: 'medium',
    category: 'mobile'
  },
  {
    id: 'haptic-feedback',
    title: 'Feedback Tátil',
    description: 'Vibração sutil em dispositivos móveis para confirmação de ações',
    priority: 'low',
    category: 'mobile'
  },
  
  // Accessibility
  {
    id: 'keyboard-navigation',
    title: 'Navegação por Teclado',
    description: 'Tab order correto e atalhos de teclado para ações principais',
    priority: 'medium',
    category: 'accessibility'
  },
  {
    id: 'aria-labels',
    title: 'ARIA Labels Completos',
    description: 'Labels descritivos para screen readers em todos os elementos interativos',
    priority: 'medium',
    category: 'accessibility'
  },
  {
    id: 'focus-management',
    title: 'Gerenciamento de Foco',
    description: 'Foco automático em modais e retorno correto após fechamento',
    priority: 'medium',
    category: 'accessibility'
  }
];

const categoryIcons = {
  performance: Zap,
  ux: Mouse,
  mobile: Smartphone,
  accessibility: Eye
};

const priorityColors = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline'
} as const;

export const PerformanceImprovementsList: React.FC = () => {
  const categorizedImprovements = improvements.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ImprovementItem[]>);

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Melhorias para Experiência Fluida</h2>
        <p className="text-muted-foreground">
          Lista de implementações necessárias para tornar a interação mais responsiva e intuitiva
        </p>
      </div>

      {Object.entries(categorizedImprovements).map(([category, items]) => {
        const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                {category === 'performance' && 'Performance'}
                {category === 'ux' && 'Experiência do Usuário'}
                {category === 'mobile' && 'Mobile'}
                {category === 'accessibility' && 'Acessibilidade'}
              </CardTitle>
              <CardDescription>
                {items.filter(item => !item.implemented).length} itens pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      item.implemented ? 'bg-muted/50' : 'bg-background'
                    }`}
                  >
                    <div className="mt-1">
                      {item.implemented ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${item.implemented ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h4>
                        <Badge variant={priorityColors[item.priority]}>
                          {item.priority === 'high' && 'Alta'}
                          {item.priority === 'medium' && 'Média'}
                          {item.priority === 'low' && 'Baixa'}
                        </Badge>
                      </div>
                      <p className={`text-sm ${item.implemented ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Próximos Passos Recomendados</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Implementar debounce em todos os botões (previne múltiplos cliques)</li>
            <li>Adicionar estados de loading visual em ações assíncronas</li>
            <li>Otimizar carregamento de imagens com lazy loading</li>
            <li>Implementar feedback tátil para mobile</li>
            <li>Adicionar transições suaves para melhor percepção de performance</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};