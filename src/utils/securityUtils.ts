/**
 * Utilitários de segurança e gestão de sessão
 * Previne vulnerabilidades de sobreposição de contas e garante isolamento de dados
 */

export interface SessionInfo {
  userId: string | null;
  isGuest: boolean;
  sessionId?: string;
  lastActivity: number;
  expiresAt?: number;
}

/**
 * Gerenciador de sessões seguro
 */
export class SecureSessionManager {
  private static readonly SESSION_KEY = 'secure_session_info';
  private static readonly MAX_IDLE_TIME = 30 * 60 * 1000; // 30 minutos
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

  /**
   * Inicia uma nova sessão de usuário
   */
  static startUserSession(userId: string): void {
    const sessionInfo: SessionInfo = {
      userId,
      isGuest: false,
      lastActivity: Date.now()
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionInfo));
    this.cleanupOldGuestSessions();
    console.log('🔐 Sessão de usuário iniciada:', userId);
  }

  /**
   * Inicia uma nova sessão guest
   */
  static startGuestSession(sessionId: string, expiresAt: number): void {
    const sessionInfo: SessionInfo = {
      userId: null,
      isGuest: true,
      sessionId,
      lastActivity: Date.now(),
      expiresAt
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionInfo));
    console.log('👤 Sessão guest iniciada:', sessionId);
  }

  /**
   * Atualiza atividade da sessão atual
   */
  static updateActivity(): void {
    const current = this.getCurrentSession();
    if (current) {
      current.lastActivity = Date.now();
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(current));
    }
  }

  /**
   * Obtém informações da sessão atual
   */
  static getCurrentSession(): SessionInfo | null {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      if (!data) return null;
      
      const session: SessionInfo = JSON.parse(data);
      
      // Verificar se a sessão expirou
      if (this.isSessionExpired(session)) {
        this.endSession();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Verifica se a sessão está expirada
   */
  static isSessionExpired(session: SessionInfo): boolean {
    const now = Date.now();
    
    // Verificar expiração por inatividade
    if (now - session.lastActivity > this.MAX_IDLE_TIME) {
      console.log('⏱️ Sessão expirada por inatividade');
      return true;
    }
    
    // Verificar expiração definida (para guests)
    if (session.expiresAt && now > session.expiresAt) {
      console.log('🕒 Sessão guest expirada');
      return true;
    }
    
    return false;
  }

  /**
   * Encerra a sessão atual
   */
  static endSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    console.log('🚪 Sessão encerrada');
  }

  /**
   * Força limpeza de dados de sessão anterior
   */
  static forceCleanup(newUserId?: string): void {
    const current = this.getCurrentSession();
    
    if (current && current.userId && current.userId !== newUserId) {
      console.log('🧹 Limpeza forçada - mudança de usuário detectada');
      this.cleanupUserData(current.userId);
    }
    
    this.cleanupOldGuestSessions();
  }

  /**
   * Limpa dados específicos do usuário
   */
  private static cleanupUserData(userId: string): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes(userId) ||
        key.startsWith('user_') ||
        key.startsWith('profile_')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Dados do usuário ${userId} removidos:`, keysToRemove.length, 'itens');
  }

  /**
   * Limpa sessões guest antigas
   */
  private static cleanupOldGuestSessions(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wishlist_guest_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    if (keysToRemove.length > 0) {
      console.log('🧹 Sessões guest antigas removidas:', keysToRemove.length);
    }
  }
}

/**
 * Rate limiting para operações sensíveis
 */
export class RateLimiter {
  private static limits = new Map<string, number[]>();

  static check(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const requests = this.limits.get(key) || [];
    
    // Remove requests antigos
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit excedido
    }
    
    validRequests.push(now);
    this.limits.set(key, validRequests);
    return true;
  }

  static reset(key: string): void {
    this.limits.delete(key);
  }
}

/**
 * Validador de integridade de dados
 */
export class DataIntegrityValidator {
  /**
   * Verifica integridade dos dados do localStorage
   */
  static validateLocalStorage(): {
    isValid: boolean;
    corruptedKeys: string[];
    repairedKeys: string[];
  } {
    const corruptedKeys: string[] = [];
    const repairedKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      try {
        const value = localStorage.getItem(key);
        if (value && (key.includes('data') || key.includes('guest'))) {
          JSON.parse(value); // Testa se é JSON válido
        }
      } catch {
        corruptedKeys.push(key);
        localStorage.removeItem(key); // Remove dados corrompidos
        repairedKeys.push(key);
      }
    }
    
    if (corruptedKeys.length > 0) {
      console.warn('🔧 Dados corrompidos detectados e reparados:', corruptedKeys);
    }
    
    return {
      isValid: corruptedKeys.length === 0,
      corruptedKeys,
      repairedKeys
    };
  }

  /**
   * Verifica se há conflitos de dados entre usuários
   */
  static detectDataConflicts(): string[] {
    const conflicts: string[] = [];
    const guestKeys: string[] = [];
    const userKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      if (key.startsWith('wishlist_guest_')) {
        guestKeys.push(key);
      } else if (key.startsWith('wishlist_') && !key.includes('guest')) {
        userKeys.push(key);
      }
    }
    
    if (guestKeys.length > 1) {
      conflicts.push(`Múltiplas sessões guest detectadas: ${guestKeys.length}`);
    }
    
    if (guestKeys.length > 0 && userKeys.length > 0) {
      conflicts.push('Dados guest e usuário coexistindo');
    }
    
    return conflicts;
  }
}