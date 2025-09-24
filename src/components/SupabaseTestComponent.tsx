import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";
export const SupabaseTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testUserId] = useState('509bdca7-b48f-47ab-8150-261585a125c2'); // ID que tem configurações
  const {
    settings: visibilitySettings,
    isLoading
  } = useVisibilitySettings(testUserId);
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);
  const runTests = async () => {
    const results: any[] = [];

    // Teste 1: Verificar se perfil existe
    try {
      const {
        data: profile,
        error
      } = await supabase.from('profiles').select('*').eq('user_id', testUserId).single();
      results.push({
        test: 'Perfil do criador existe',
        success: !error && !!profile,
        data: profile ? `Perfil encontrado com ${profile.credits} créditos` : null,
        error: error?.message
      });
    } catch (e) {
      results.push({
        test: 'Perfil do criador existe',
        success: false,
        error: (e as Error).message
      });
    }

    // Teste 2: Verificar configurações de visibilidade
    try {
      const {
        data: settings,
        error
      } = await supabase.from('profiles').select('settings').eq('user_id', testUserId).single();
      const hasVisibilitySettings = settings?.settings && typeof settings.settings === 'object' && 'visibilitySettings' in settings.settings;
      const visibilityConfig = hasVisibilitySettings ? (settings.settings as any).visibilitySettings : null;
      const showMediaToVisitors = visibilityConfig?.showMediaToVisitors;
      results.push({
        test: 'Configurações de visibilidade salvas',
        success: !error && hasVisibilitySettings,
        data: {
          hasConfig: hasVisibilitySettings,
          showMediaToVisitors: showMediaToVisitors,
          fullConfig: visibilityConfig
        },
        error: error?.message
      });
    } catch (e) {
      results.push({
        test: 'Configurações de visibilidade salvas',
        success: false,
        error: (e as Error).message
      });
    }

    // Teste 3: Verificar mídias do usuário
    try {
      const {
        data: media,
        error
      } = await supabase.from('media_items').select('*').eq('user_id', testUserId);
      results.push({
        test: 'Mídias do criador disponíveis',
        success: !error && (media?.length || 0) > 0,
        data: `${media?.length || 0} mídias encontradas`,
        error: error?.message
      });
    } catch (e) {
      results.push({
        test: 'Mídias do criador disponíveis',
        success: false,
        error: (e as Error).message
      });
    }

    // Teste 4: Verificar bucket media público
    try {
      const {
        data: buckets,
        error
      } = await supabase.storage.listBuckets();
      const mediaBucket = buckets?.find(b => b.id === 'media');
      results.push({
        test: 'Bucket media é público',
        success: !error && !!mediaBucket?.public,
        data: mediaBucket ? `Bucket media: público = ${mediaBucket.public}` : 'Bucket não encontrado',
        error: error?.message
      });
    } catch (e) {
      results.push({
        test: 'Bucket media é público',
        success: false,
        error: (e as Error).message
      });
    }

    // Teste 5: Testar visibilidade atual
    const isCurrentlyVisible = !isLoading && visibilitySettings.showMediaToVisitors;
    results.push({
      test: 'Vitrine visível para visitantes',
      success: isCurrentlyVisible,
      data: isCurrentlyVisible ? 'VISÍVEL - Visitantes podem ver a vitrine' : 'OCULTA - Vitrine está oculta para visitantes',
      error: isLoading ? 'Carregando configurações...' : null
    });
    setTestResults(results);
  };
  useEffect(() => {
    if (!isLoading) {
      runTests();
    }
  }, [isLoading, visibilitySettings]);
  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />;
  };
  const getVisibilityStatus = () => {
    if (isLoading) {
      return <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800">Carregando configurações...</span>
        </div>;
    }
    const isVisible = visibilitySettings.showMediaToVisitors;
    return <div className={`flex items-center gap-2 p-4 rounded-lg border-2 ${isVisible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        {isVisible ? <Eye className="w-6 h-6 text-green-600" /> : <EyeOff className="w-6 h-6 text-red-600" />}
        <div>
          <div className={`font-bold text-lg ${isVisible ? 'text-green-800' : 'text-red-800'}`}>
            {isVisible ? '👁️ VITRINE VISÍVEL' : '🔒 VITRINE OCULTA'}
          </div>
          <div className={`text-sm ${isVisible ? 'text-green-600' : 'text-red-600'}`}>
            {isVisible ? 'Visitantes PODEM ver suas mídias na vitrine' : 'Visitantes NÃO PODEM ver suas mídias na vitrine'}
          </div>
        </div>
      </div>;
  };
  return <>
      
      



    </>;
};