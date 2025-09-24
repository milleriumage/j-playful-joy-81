import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGuestData } from '@/hooks/useGuestData';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { toast } from 'sonner';

export const GuestSessionDebug = () => {
  const { guestData } = useGuestData();
  const { user, isGuest } = useGoogleAuth();
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);

  const updateLocalStorageKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('wishlist_') || key.startsWith('dreamlink_') || key.startsWith('guest_'))) {
        keys.push(key);
      }
    }
    setLocalStorageKeys(keys);
  };

  useEffect(() => {
    updateLocalStorageKeys();
    const interval = setInterval(updateLocalStorageKeys, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearAllGuestData = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('wishlist_guest_') || key.startsWith('dreamlink_guest_data'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    updateLocalStorageKeys();
    toast.success(`🧹 ${keysToRemove.length} chaves guest removidas`);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Debug: Sistema Guest vs Usuário
          <Badge variant={isGuest ? "secondary" : "default"}>
            {isGuest ? "Modo Guest" : "Usuário Logado"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status da Sessão */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm">Sessão Atual</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {isGuest ? `Guest ID: ${guestData.sessionId.slice(0, 8)}...` : `User: ${user?.email}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Créditos: {guestData.credits}
            </p>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm">Expiração</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {isGuest ? new Date(guestData.expiresAt).toLocaleString() : "Permanente"}
            </p>
            <p className="text-xs text-muted-foreground">
              Restam: {isGuest ? Math.max(0, Math.floor((guestData.expiresAt - Date.now()) / (1000 * 60 * 60))) + 'h' : '∞'}
            </p>
          </div>
        </div>

        {/* LocalStorage Keys */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Dados no LocalStorage:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {localStorageKeys.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma chave relevante encontrada</p>
            ) : (
              localStorageKeys.map(key => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                  <span className="font-mono">{key}</span>
                  <Badge variant="outline" className="text-xs">
                    {key.startsWith('wishlist_guest_') ? 'Wishlist Guest' : 
                     key.startsWith('dreamlink_guest_data') ? 'Dados Guest' :
                     key.startsWith('wishlist_') ? 'Wishlist User' : 'Outros'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ações de Debug */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={updateLocalStorageKeys}
          >
            🔄 Atualizar
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={clearAllGuestData}
            disabled={!isGuest}
          >
            🧹 Limpar Dados Guest
          </Button>
        </div>

        {/* Informações Técnicas */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">✅ Melhorias Implementadas:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Sessões Guest únicas por usuário (UUID)</li>
            <li>• Expiração automática após 24h</li>
            <li>• Fusão de dados ao fazer login</li>
            <li>• Isolamento completo entre guests</li>
            <li>• Limpeza automática de dados antigos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};