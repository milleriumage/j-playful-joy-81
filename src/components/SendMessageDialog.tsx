import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
export const SendMessageDialog = ({
  isOpen,
  setIsOpen
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const { user } = useGoogleAuth();
  const [userEmail, setUserEmail] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [userCpf, setUserCpf] = useState('');
  const [userId, setUserId] = useState('');
  const [realValue, setRealValue] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Preencher automaticamente o ID do usuário quando disponível
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  // Auto-generate subject and message based on form data
  const subject = 'RIC (Requisição Instantânea de Crédito)';
  const message = `Dados da Requisição:
- Email do Usuário: ${userEmail}
- Identificador do Comprovante: ${receiptId}
- Data do Comprovante: ${receiptDate}
- CPF do Usuário: ${userCpf}
- ID do Usuário: ${userId}
- Valor Real Depositado: R$ ${realValue}
- Quantidade de Créditos Solicitada: ${creditAmount}

Aguardando verificação do depósito para liberação dos créditos.`;
  const handleSendMessage = async () => {
    if (!userEmail || !receiptId || !receiptDate || !userCpf || !realValue || !creditAmount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const fixedEmail = 'linkteamcreators@gmail.com';
    
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('send-message', {
        body: {
          email: fixedEmail,
          subject,
          message
        }
      });
      if (error) {
        throw error;
      }

      // Enviar email de confirmação para quem enviou
      await supabase.functions.invoke('send-message', {
        body: {
          email: 'admin@chatlinks.site',
          subject: '✅ Confirmação de Envio - LinkchatTV',
          message: `Sua RIC foi enviada com sucesso!\n\nPara: ${fixedEmail}\nAssunto: ${subject}\n\nMensagem enviada às ${new Date().toLocaleString('pt-BR')}`
        }
      });
      toast.success('📧 RIC enviada com sucesso! Aguarde 5-20 minutos para processamento.');
      setIsOpen(false);
      setUserEmail('');
      setReceiptId('');
      setReceiptDate('');
      setUserCpf('');
      setRealValue('');
      setCreditAmount('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('❌ Erro ao enviar RIC: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            💳 Requisição Instantânea de Crédito (RIC)
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Aguarde de 5 a 20 minutos para checagem de crédito não depositado
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulário de Preenchimento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados da Requisição</h3>
            
            <div>
              <Label htmlFor="userEmail">Email do Usuário</Label>
              <Input 
                id="userEmail" 
                type="email"
                value={userEmail} 
                onChange={e => setUserEmail(e.target.value)} 
                placeholder="seu@email.com" 
              />
            </div>
            
            <div>
              <Label htmlFor="receiptId" className="text-blue-600 font-semibold">Identificador do Comprovante</Label>
              <Input 
                id="receiptId" 
                type="text"
                value={receiptId} 
                onChange={e => setReceiptId(e.target.value)} 
                placeholder="mpqrinter124152964567" 
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <Label htmlFor="receiptDate" className="text-blue-600 font-semibold">Data do Comprovante</Label>
              <Input 
                id="receiptDate" 
                type="text"
                value={receiptDate} 
                onChange={e => setReceiptDate(e.target.value)} 
                placeholder="29/08/2025 - 17:18:22" 
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <Label htmlFor="userCpf">CPF do Usuário</Label>
              <Input 
                id="userCpf" 
                type="text"
                value={userCpf} 
                onChange={e => {
                  const cpf = e.target.value.replace(/\D/g, '').slice(0, 11);
                  const formatted = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                  setUserCpf(formatted);
                }} 
                placeholder="000.000.000-00" 
              />
            </div>
            
            <div>
              <Label htmlFor="userId">ID do Usuário</Label>
              <Input 
                id="userId" 
                value={userId} 
                disabled
                className="bg-muted text-muted-foreground" 
                placeholder="ID será preenchido automaticamente" 
              />
            </div>
            
            <div>
              <Label htmlFor="realValue">Valor Real Depositado (R$)</Label>
              <Input 
                id="realValue" 
                type="number" 
                step="0.01"
                value={realValue} 
                onChange={e => setRealValue(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
            
            <div>
              <Label htmlFor="creditAmount">Quantidade de Créditos</Label>
              <Input 
                id="creditAmount" 
                type="number"
                value={creditAmount} 
                onChange={e => setCreditAmount(e.target.value)} 
                placeholder="Quantidade de créditos solicitada" 
              />
            </div>
            
            <Button onClick={handleSendMessage} disabled={isLoading} className="w-full">
              {isLoading ? 'Enviando RIC...' : 'Enviar Requisição'}
            </Button>
            
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
              <p className="text-xs text-muted-foreground">
                <strong>Exemplo de identificador:</strong> mpqrinter124152964567
              </p>
            </div>
          </div>
          
          {/* Preview da Mensagem */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Preview da Mensagem</h3>
            
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Assunto:</Label>
                  <p className="text-sm">{subject}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Mensagem:</Label>
                  <div className="text-sm bg-background border rounded p-3 min-h-[120px] whitespace-pre-line">
                    {message || 'Preencha os campos ao lado para ver o preview da mensagem...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};