import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, User, Image, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

const TestVisitanteLivre = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];
    
    // Teste 1: Conectividade Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' });
      
      if (error) {
        results.push({
          name: 'Conectividade Supabase',
          status: 'error',
          message: `Erro ao conectar: ${error.message}`
        });
      } else {
        results.push({
          name: 'Conectividade Supabase',
          status: 'success',
          message: `Conectado com sucesso! ${data?.length || 0} perfis encontrados`
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Conectividade Supabase',
        status: 'error',
        message: `Erro de conexão: ${error.message}`
      });
    }
    
    // Teste 2: Buscar perfis disponíveis
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, bio, avatar_url')
        .limit(5);
      
      if (error) {
        results.push({
          name: 'Buscar Perfis',
          status: 'error',
          message: `Erro ao buscar perfis: ${error.message}`
        });
      } else if (profiles && profiles.length > 0) {
        results.push({
          name: 'Buscar Perfis',
          status: 'success',
          message: `${profiles.length} perfis encontrados`,
          data: profiles
        });
      } else {
        results.push({
          name: 'Buscar Perfis',
          status: 'warning',
          message: 'Nenhum perfil encontrado no banco'
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Buscar Perfis',
        status: 'error',
        message: `Erro ao buscar perfis: ${error.message}`
      });
    }
    
    // Teste 3: Buscar mídias
    try {
      const { data: media, error } = await supabase
        .from('media_items')
        .select('id, user_id, type, storage_path, is_main')
        .limit(10);
      
      if (error) {
        results.push({
          name: 'Buscar Mídias',
          status: 'error',
          message: `Erro ao buscar mídias: ${error.message}`
        });
      } else if (media && media.length > 0) {
        results.push({
          name: 'Buscar Mídias',
          status: 'success',
          message: `${media.length} mídias encontradas`,
          data: media
        });
      } else {
        results.push({
          name: 'Buscar Mídias',
          status: 'warning',
          message: 'Nenhuma mídia encontrada no banco'
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Buscar Mídias',
        status: 'error',
        message: `Erro ao buscar mídias: ${error.message}`
      });
    }
    
    // Teste 4: Buscar ícones sociais
    try {
      const { data: socialIcons, error } = await supabase
        .from('social_icons')
        .select('id, user_id, icon_url, link')
        .limit(10);
      
      if (error) {
        results.push({
          name: 'Buscar Ícones Sociais',
          status: 'error',
          message: `Erro ao buscar ícones sociais: ${error.message}`
        });
      } else if (socialIcons && socialIcons.length > 0) {
        results.push({
          name: 'Buscar Ícones Sociais',
          status: 'success',
          message: `${socialIcons.length} ícones sociais encontrados`,
          data: socialIcons
        });
      } else {
        results.push({
          name: 'Buscar Ícones Sociais',
          status: 'warning',
          message: 'Nenhum ícone social encontrado'
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Buscar Ícones Sociais',
        status: 'error',
        message: `Erro ao buscar ícones sociais: ${error.message}`
      });
    }
    
    // Teste 5: Testar com ID específico (primeiro perfil encontrado)
    try {
      const { data: firstProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1)
        .single();
      
      if (firstProfile) {
        const { data: userMedia, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', firstProfile.user_id);
        
        if (error) {
          results.push({
            name: 'Teste com ID Específico',
            status: 'error',
            message: `Erro ao buscar mídia do usuário: ${error.message}`
          });
        } else {
          results.push({
            name: 'Teste com ID Específico',
            status: 'success',
            message: `Usuário ${firstProfile.user_id}: ${userMedia?.length || 0} mídias`,
            data: { userId: firstProfile.user_id, mediaCount: userMedia?.length || 0 }
          });
        }
      } else {
        results.push({
          name: 'Teste com ID Específico',
          status: 'warning',
          message: 'Nenhum perfil disponível para teste'
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Teste com ID Específico',
        status: 'error',
        message: `Erro no teste específico: ${error.message}`
      });
    }
    
    setTestResults(results);
    setIsRunning(false);
  };
  
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };
  
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">🧪 Teste da Página Visitante Livre</h1>
            <p className="text-muted-foreground mb-4">
              Diagnóstico completo para verificar se os dados estão sendo carregados corretamente
            </p>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="px-8 py-2"
            >
              {isRunning ? 'Executando Testes...' : '🚀 Executar Testes'}
            </Button>
          </div>
        </Card>
        
        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">📊 Resultados dos Testes</h2>
            
            {testResults.map((result, index) => (
              <Card key={index} className={`p-4 border-2 ${getStatusColor(result.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{result.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                    
                    {/* Mostrar dados se disponíveis */}
                    {result.data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                          Ver dados detalhados
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Resumo */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">📋 Resumo dos Testes</h3>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{testResults.filter(r => r.status === 'success').length} Sucessos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span>{testResults.filter(r => r.status === 'warning').length} Avisos</span>
                  </div>
                  <div className="flex items-center gap-2">  
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>{testResults.filter(r => r.status === 'error').length} Erros</span>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Links de Teste */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-3">🔗 Links para Teste</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('/visitante-livre', '_blank')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Página Visitante Livre (sem ID)
                </Button>
                
                {testResults.find(r => r.name === 'Teste com ID Específico' && r.data?.userId) && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      const userId = testResults.find(r => r.name === 'Teste com ID Específico')?.data?.userId;
                      if (userId) {
                        window.open(`/visitante-livre/${userId}`, '_blank');
                      }
                    }}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Página Visitante Livre (com ID específico)
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default TestVisitanteLivre;