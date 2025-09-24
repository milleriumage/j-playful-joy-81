import { supabase } from "@/integrations/supabase/client";

export const fixMediaPolicies = async () => {
  try {
    console.log('🔧 Executando correção das políticas RLS para media_items...');
    
    const { data, error } = await supabase.functions.invoke('fix-media-policies');
    
    if (error) {
      console.error('❌ Erro ao executar função de correção:', error);
      throw error;
    }
    
    console.log('✅ Políticas RLS corrigidas:', data);
    return { success: true, data };
  } catch (error) {
    console.error('💥 Erro na correção das políticas:', error);
    return { success: false, error };
  }
};