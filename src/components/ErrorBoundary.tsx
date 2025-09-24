import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary details:', { error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-xl font-semibold text-destructive">
                Algo deu errado
              </h2>
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado. Tente novamente.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer">Detalhes do erro</summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleRetry}>
                  Tentar novamente
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Ao invés de reload, apenas resetar estado do error boundary
                    this.handleRetry();
                    toast.success('🔄 Componente reiniciado');
                  }}
                >
                  Reiniciar componente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}