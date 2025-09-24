import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es, it, fr, de, nl, sv, nb } from 'date-fns/locale';

export const NotificationsList = () => {
  const { notifications, isLoading, deleteNotification } = useNotifications();
  const { user, isGuest } = useGoogleAuth();
  const { language, t } = useLanguage();

  const getLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'es': return es;
      case 'it': return it;
      case 'fr': return fr;
      case 'de': return de;
      case 'nl': return nl;
      case 'sv': return sv;
      case 'no': return nb;
      default: return ptBR;
    }
  };

  // Mostrar notificações para usuários logados ou guests
  if (!user && !isGuest) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground">
          {t('notifications.loading')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground">
          {t('notifications.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className="border-l-4 border-l-primary/50 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => deleteNotification(notification.id)}
          title={t('notifications.clickToRemove')}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {notification.type === 'credit_deduction' ? t('notifications.credits') : notification.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                {notification.credits_amount && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs font-medium text-destructive">
                      -{notification.credits_amount} {notification.credits_amount > 1 ? t('notifications.credits_plural') : t('notifications.credit')}
                    </span>
                  </div>
                )}
              </div>
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: getLocale()
                })}
              </time>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};