import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingFallbackProps {
  message?: string;
  className?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Carregando...", 
  className = "min-h-screen" 
}) => {
  return (
    <div className={`${className} flex items-center justify-center bg-background p-4`}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const PageLoadingFallback: React.FC = () => (
  <LoadingFallback message="Carregando página..." />
);

export const ComponentLoadingFallback: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingFallback 
    message={message || "Carregando componente..."} 
    className="min-h-[200px]" 
  />
);