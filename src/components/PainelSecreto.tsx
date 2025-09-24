export const PainelSecreto = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            🔐 Painel Secreto
          </h1>
          <p className="text-muted-foreground mb-4">
            Parabéns! Você tem acesso ao conteúdo exclusivo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Área Restrita</h2>
              <p className="text-sm text-muted-foreground">
                Este conteúdo é visível apenas para usuários autorizados.
              </p>
            </div>
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Dados Exclusivos</h2>
              <p className="text-sm text-muted-foreground">
                Informações confidenciais disponíveis aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};