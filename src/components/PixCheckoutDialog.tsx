import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function PixCheckoutDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("10.00");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [brCode, setBrCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usar o supabase function invoke em vez de fetch direto
      const { data, error } = await supabase.functions.invoke('process-pix-payment', {
        body: {
          transactionAmount: parseFloat(amount),
          description: description || `Pagamento PIX - R$ ${amount}`,
          email: email
        }
      });

      if (error) {
        console.error('Erro Supabase:', error);
        toast.error(error.message || "Erro ao gerar Pix");
        return;
      }

      if (data && data.qrCodeImage) {
        setQrCode(data.qrCodeImage);
        setBrCode(data.brCode);
        toast.success("✅ Pix gerado com sucesso!");
      } else {
        toast.error("Erro ao gerar dados do Pix");
      }
    } catch (err) {
      console.error('Erro:', err);
      toast.error("Erro inesperado ao gerar Pix");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Pagamento via Pix
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Plano Premium"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Pix...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Gerar Pix
              </>
            )}
          </Button>
        </form>

        {qrCode && (
          <div className="mt-6 text-center space-y-3">
            <img src={qrCode} alt="QR Code Pix" className="mx-auto w-48 rounded-lg shadow" />
            <p className="text-sm text-muted-foreground">Ou copie e cole o código abaixo:</p>
            <textarea
              readOnly
              value={brCode || ""}
              className="w-full p-2 border rounded text-xs"
              rows={3}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}