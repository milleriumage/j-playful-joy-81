/**
 * Utilitários de validação e sanitização de dados
 * Previne erros de dados corrompidos e garante consistência
 */

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
}

/**
 * Valida e sanitiza dados de créditos
 */
export const validateCredits = (value: any): ValidationResult<number> => {
  if (value === null || value === undefined) {
    return { isValid: true, data: 0 };
  }

  const num = Number(value);
  
  if (isNaN(num)) {
    return { 
      isValid: false, 
      error: 'Créditos deve ser um número válido',
      data: 0 
    };
  }

  if (num < 0) {
    return { 
      isValid: false, 
      error: 'Créditos não pode ser negativo',
      data: 0 
    };
  }

  if (num > 999999) {
    return { 
      isValid: false, 
      error: 'Créditos excede o limite máximo',
      data: 999999 
    };
  }

  return { isValid: true, data: Math.floor(num) };
};

/**
 * Valida e parse seguro de JSON do localStorage
 */
export const safeJSONParse = <T>(
  jsonString: string | null, 
  defaultValue: T
): ValidationResult<T> => {
  if (!jsonString) {
    return { isValid: true, data: defaultValue };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, data: parsed };
  } catch (error) {
    console.error('JSON parse error:', error);
    return { 
      isValid: false, 
      error: 'Dados corrompidos detectados',
      data: defaultValue 
    };
  }
};

/**
 * Valida estrutura de dados guest
 */
export const validateGuestData = (data: any): ValidationResult<{
  notifications: any[];
  credits: number;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}> => {
  const defaultData = {
    notifications: [],
    credits: 40,
    sessionId: crypto.randomUUID(),
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000)
  };

  if (!data || typeof data !== 'object') {
    return { isValid: false, data: defaultData, error: 'Dados inválidos' };
  }

  const creditsValidation = validateCredits(data.credits);
  
  const validatedData = {
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    credits: creditsValidation.data || 40,
    sessionId: typeof data.sessionId === 'string' ? data.sessionId : crypto.randomUUID(),
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    expiresAt: typeof data.expiresAt === 'number' ? data.expiresAt : Date.now() + (24 * 60 * 60 * 1000)
  };

  return { isValid: true, data: validatedData };
};

/**
 * Valida dados de perfil do Supabase
 */
export const validateProfileData = (data: any): ValidationResult<{
  credits: number;
  display_name?: string;
  avatar_url?: string;
}> => {
  if (!data) {
    return { isValid: true, data: { credits: 0 } };
  }

  const creditsValidation = validateCredits(data.credits);

  return {
    isValid: creditsValidation.isValid,
    data: {
      credits: creditsValidation.data || 0,
      display_name: typeof data.display_name === 'string' ? data.display_name : undefined,
      avatar_url: typeof data.avatar_url === 'string' ? data.avatar_url : undefined
    },
    error: creditsValidation.error
  };
};

/**
 * Sanitiza URL para evitar XSS
 */
export const sanitizeUrl = (url: string): ValidationResult<string> => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL inválida', data: '' };
  }

  const trimmed = url.trim();
  
  // Bloquear javascript: e data: URLs
  if (trimmed.toLowerCase().startsWith('javascript:') || 
      trimmed.toLowerCase().startsWith('data:')) {
    return { isValid: false, error: 'URL não permitida', data: '' };
  }

  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return { isValid: true, data: urlObj.toString() };
  } catch {
    return { isValid: false, error: 'Formato de URL inválido', data: '' };
  }
};

/**
 * Rate limiting simples baseado em timestamp
 */
export const createRateLimit = (maxRequests: number, windowMs: number) => {
  const requests: number[] = [];
  
  return (): ValidationResult<boolean> => {
    const now = Date.now();
    
    // Remove requests antigos
    while (requests.length > 0 && requests[0] <= now - windowMs) {
      requests.shift();
    }
    
    if (requests.length >= maxRequests) {
      return { 
        isValid: false, 
        error: 'Muitas tentativas. Aguarde um momento.',
        data: false 
      };
    }
    
    requests.push(now);
    return { isValid: true, data: true };
  };
};