import React from 'react';
import { TemplateUserTest } from '@/components/TemplateUserTest';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TestTemplate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao App
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Teste do Sistema de Template de Usuário
            </h1>
            <p className="text-muted-foreground">
              Valide que a funcionalidade de clonagem de dados está funcionando corretamente
            </p>
          </div>

          <TemplateUserTest />
          
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">📋 Checklist de Validação</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>✅ Usuário de teste criado com sucesso</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>✅ RPC initialize_user_from_template executada</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>✅ user_settings clonado com initialized=true</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>✅ social_icons clonados (3 ícones)</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>✅ subscription criada com 80 créditos</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>✅ Segunda chamada retorna "already initialized"</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>✅ Dados não foram duplicados</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Importante
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Use um email único para cada teste para evitar conflitos. 
              O sistema não permitirá criar usuários com emails já existentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTemplate;