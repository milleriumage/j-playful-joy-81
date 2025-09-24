import React, { useState, useEffect } from 'react';
import { LoadingFallback } from './LoadingFallback';

interface OptimizedLoadingWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  minLoadingTime?: number;
}

/**
 * Wrapper otimizado para loading que evita flashes e melhora UX
 */
export const OptimizedLoadingWrapper: React.FC<OptimizedLoadingWrapperProps> = ({
  children,
  isLoading = false,
  loadingMessage = 'Carregando...',
  minLoadingTime = 300
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [hasShownLoading, setHasShownLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setHasShownLoading(true);
      setShowLoading(true);
    } else if (hasShownLoading) {
      // Garantir tempo mínimo de loading para evitar flashes
      timer = setTimeout(() => {
        setShowLoading(false);
      }, minLoadingTime);
    } else {
      // Se nunca mostrou loading, não mostrar agora
      setShowLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, hasShownLoading, minLoadingTime]);

  if (showLoading) {
    return <LoadingFallback message={loadingMessage} />;
  }

  return <>{children}</>;
};