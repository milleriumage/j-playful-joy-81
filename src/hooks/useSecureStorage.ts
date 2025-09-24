import { useCallback } from 'react';
import { validateCredits, safeJSONParse } from '@/utils/dataValidation';

interface UseSecureStorageReturn {
  getSecureData: <T>(key: string, defaultValue: T) => T;
  setSecureData: <T>(key: string, value: T) => boolean;
  removeSecureData: (key: string) => void;
  clearUserData: (userId?: string) => void;
  validateStorageIntegrity: () => boolean;
}

/**
 * Hook para armazenamento seguro com validação e cleanup automático
 */
export const useSecureStorage = (): UseSecureStorageReturn => {
  
  const getSecureData = useCallback(<T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const result = safeJSONParse(item, defaultValue);
      if (!result.isValid) {
        console.warn(`Dados corrompidos em ${key}:`, result.error);
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      return result.data;
    } catch (error) {
      console.error(`Erro ao ler ${key}:`, error);
      return defaultValue;
    }
  }, []);

  const setSecureData = useCallback(<T>(key: string, value: T): boolean => {
    try {
      // Validações específicas por tipo de dados
      if (key.includes('credits')) {
        const validation = validateCredits(value);
        if (!validation.isValid) {
          console.error(`Tentativa de salvar créditos inválidos em ${key}:`, validation.error);
          return false;
        }
        localStorage.setItem(key, JSON.stringify(validation.data));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      return false;
    }
  }, []);

  const removeSecureData = useCallback((key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
    }
  }, []);

  const clearUserData = useCallback((userId?: string): void => {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        // Remove dados específicos do usuário ou dados sensíveis gerais
        if (userId && key.includes(userId)) {
          keysToRemove.push(key);
        } else if (
          key.startsWith('user_') ||
          key.startsWith('profile_') ||
          key.startsWith('wishlist_') ||
          key.includes('guest') ||
          key.includes('session')
        ) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 ${keysToRemove.length} itens removidos do storage`);
    } catch (error) {
      console.error('Erro na limpeza do storage:', error);
    }
  }, []);

  const validateStorageIntegrity = useCallback((): boolean => {
    try {
      let corruptedCount = 0;
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        try {
          const value = localStorage.getItem(key);
          if (value && (value.startsWith('{') || value.startsWith('['))) {
            JSON.parse(value); // Testa se é JSON válido
          }
        } catch {
          corruptedCount++;
          keysToRemove.push(key);
        }
      }
      
      // Remove dados corrompidos
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (corruptedCount > 0) {
        console.warn(`🔧 ${corruptedCount} itens corrompidos removidos`);
      }
      
      return corruptedCount === 0;
    } catch (error) {
      console.error('Erro na validação de integridade:', error);
      return false;
    }
  }, []);

  return {
    getSecureData,
    setSecureData,
    removeSecureData,
    clearUserData,
    validateStorageIntegrity
  };
};