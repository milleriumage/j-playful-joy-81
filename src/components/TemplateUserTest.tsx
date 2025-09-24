import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
}

export const TemplateUserTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testEmail, setTestEmail] = useState('');

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runCompleteTest = async () => {
    if (!testEmail) {
      toast.error('Por favor, insira um email de teste');
      return;
    }

    setIsRunning(true);
    setResults([]);
    
    const testPassword = 'TestPassword123!';

    try {
      // Passo 1: Criar usuário de teste
      addResult({ step: 'Iniciando teste...', success: true });
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) {
        addResult({ 
          step: 'Criar usuário de teste', 
          success: false, 
          error: signUpError.message 
        });
        return;
      }

      addResult({ 
        step: 'Usuário de teste criado', 
        success: true, 
        data: { userId: signUpData.user?.id } 
      });

      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Passo 2: Fazer login com o usuário de teste
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (signInError) {
        addResult({ 
          step: 'Login do usuário de teste', 
          success: false, 
          error: signInError.message 
        });
        return;
      }

      addResult({ 
        step: 'Login realizado com sucesso', 
        success: true, 
        data: { userId: signInData.user?.id } 
      });

      // Passo 3: Invocar RPC pela primeira vez
      const { data: rpcData1, error: rpcError1 } = await supabase.rpc('initialize_user_from_template');

      if (rpcError1) {
        addResult({ 
          step: 'Primeira invocação da RPC', 
          success: false, 
          error: rpcError1.message 
        });
        return;
      }

      addResult({ 
        step: 'Primeira invocação da RPC', 
        success: true, 
        data: rpcData1 
      });

      // Passo 4: Validar dados clonados - user_settings
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', signInData.user?.id)
        .single();

      if (settingsError) {
        addResult({ 
          step: 'Validar user_settings clonados', 
          success: false, 
          error: settingsError.message 
        });
      } else {
        addResult({ 
          step: 'Validar user_settings clonados', 
          success: userSettings.initialized === true, 
          data: userSettings 
        });
      }

      // Passo 5: Validar social_icons clonados
      const { data: socialIcons, error: iconsError } = await supabase
        .from('social_icons')
        .select('*')
        .eq('user_id', signInData.user?.id);

      if (iconsError) {
        addResult({ 
          step: 'Validar social_icons clonados', 
          success: false, 
          error: iconsError.message 
        });
      } else {
        addResult({ 
          step: 'Validar social_icons clonados', 
          success: socialIcons.length > 0, 
          data: { count: socialIcons.length, icons: socialIcons } 
        });
      }

      // Passo 6: Validar subscription criada
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', signInData.user?.id)
        .single();

      if (subError) {
        addResult({ 
          step: 'Validar subscription criada', 
          success: false, 
          error: subError.message 
        });
      } else {
        addResult({ 
          step: 'Validar subscription criada', 
          success: subscription.credits === 80 && subscription.plan === 'free', 
          data: subscription 
        });
      }

      // Passo 7: Tentar invocar RPC novamente (deve não fazer nada)
      const { data: rpcData2, error: rpcError2 } = await supabase.rpc('initialize_user_from_template');

      if (rpcError2) {
        addResult({ 
          step: 'Segunda invocação da RPC', 
          success: false, 
          error: rpcError2.message 
        });
      } else {
        addResult({ 
          step: 'Segunda invocação da RPC (deve retornar "already initialized")', 
          success: rpcData2 && typeof rpcData2 === 'object' && 'message' in rpcData2 
            ? String(rpcData2.message).includes('already initialized') 
            : false, 
          data: rpcData2 
        });
      }

      // Passo 8: Confirmar que dados não foram duplicados
      const { data: finalSocialIcons, error: finalIconsError } = await supabase
        .from('social_icons')
        .select('*')
        .eq('user_id', signInData.user?.id);

      if (finalIconsError) {
        addResult({ 
          step: 'Confirmar que dados não foram duplicados', 
          success: false, 
          error: finalIconsError.message 
        });
      } else {
        addResult({ 
          step: 'Confirmar que dados não foram duplicados', 
          success: finalSocialIcons.length === socialIcons?.length, 
          data: { 
            initialCount: socialIcons?.length, 
            finalCount: finalSocialIcons.length 
          } 
        });
      }

      // Limpeza: Fazer logout
      await supabase.auth.signOut();
      addResult({ step: 'Logout realizado', success: true });

      toast.success('Teste completo executado!');

    } catch (error) {
      addResult({ 
        step: 'Erro inesperado', 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
      toast.error('Erro durante o teste');
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste do Sistema de Template de Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <input
            type="email"
            placeholder="Email de teste (ex: test@example.com)"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
            disabled={isRunning}
          />
          <Button 
            onClick={runCompleteTest} 
            disabled={isRunning || !testEmail}
            className="px-6"
          >
            {isRunning ? 'Executando...' : 'Executar Teste'}
          </Button>
          <Button 
            onClick={clearResults} 
            variant="outline"
            disabled={isRunning}
          >
            Limpar
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-lg">Resultados do Teste:</h3>
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">{result.step}</span>
                </div>
                
                {result.error && (
                  <div className="text-red-600 text-sm mt-1">
                    Erro: {result.error}
                  </div>
                )}
                
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer">
                      Ver dados
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-800">Resumo:</h4>
            <div className="text-sm text-blue-700">
              ✅ Sucessos: {results.filter(r => r.success).length} |{' '}
              ❌ Falhas: {results.filter(r => !r.success).length} |{' '}
              📊 Total: {results.length}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <strong>O que este teste faz:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Cria um usuário de teste com email/senha</li>
            <li>Faz login com o usuário</li>
            <li>Invoca a RPC `initialize_user_from_template`</li>
            <li>Valida se user_settings foi criado e initialized=true</li>
            <li>Valida se social_icons foram clonados</li>
            <li>Valida se subscription foi criada com 80 créditos</li>
            <li>Invoca a RPC novamente (deve retornar "already initialized")</li>
            <li>Confirma que dados não foram duplicados</li>
            <li>Faz logout para limpeza</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};