import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AuthLoadingScreenProps {
  message?: string;
  showVitrine?: boolean;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  message = "Carregando seus dados...", 
  showVitrine = false 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Loading */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
            <span className="text-dream-white">Dream</span>
            <span className="text-gold drop-shadow-sm">LINK</span>
          </h1>
        </div>

        {/* Main Loading Card */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            {/* Animated Loading Circles */}
            <div className="flex justify-center items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            </div>

            {/* Main Loading Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full mx-auto"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            </div>

            {/* Loading Message */}
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">Por favor, aguarde...</p>
            </div>

            {/* Progress Animation */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Vitrine Loading (if enabled) */}
        {showVitrine && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">📱 Carregando Vitrine</h3>
              </div>
              
              {/* Skeleton Media Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
              
              {/* Loading Dots */}
              <div className="flex justify-center mt-4">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Loading Hints */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Sincronizando dados de forma segura
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;