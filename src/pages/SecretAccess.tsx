import { useAccessVerification } from '@/hooks/useAccessVerification';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { PainelSecreto } from '@/components/PainelSecreto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecretAccess() {
  const { hasAccess, isLoading, user } = useAccessVerification();
  const { signInWithGoogle, signOut } = useGoogleAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Faça login para verificar suas permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={signInWithGoogle} 
              className="w-full"
              disabled={isLoading}
            >
              Entrar com Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAccess) {
    return <PainelSecreto />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta área
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Usuário: {user.email}
          </p>
          <Button 
            onClick={signOut} 
            variant="outline" 
            className="w-full"
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}