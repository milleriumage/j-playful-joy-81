import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Gift, Clock, DollarSign, Timer, Send } from "lucide-react";
import { useSalesHistory } from "@/hooks/useSalesHistory";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({ open, onOpenChange }) => {
  const {
    salesHistory,
    earningsStats,
    isLoading,
    withdrawalCountdown,
    sendThankYouMessage,
    requestWithdrawal
  } = useSalesHistory();

  const [thankMessage, setThankMessage] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  const handleSendThankYou = async (saleId: string) => {
    if (!thankMessage.trim()) return;
    
    await sendThankYouMessage(saleId, thankMessage);
    setThankMessage('');
    setSelectedSaleId(null);
  };

  const handleRequestWithdrawal = async () => {
    const amount = parseInt(withdrawalAmount);
    if (!amount || amount <= 0) {
      return;
    }

    const success = await requestWithdrawal(amount);
    if (success) {
      setWithdrawalAmount('');
    }
  };

  const availableCredits = earningsStats 
    ? earningsStats.total_earned - earningsStats.total_withdrawn - earningsStats.pending_amount
    : 0;

  const netAmount = withdrawalAmount ? parseInt(withdrawalAmount) * 0.7 : 0;
  const creditValue = 0.05; // 1 CR = 0.05 BRL/USD

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Central de Vendas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thank You Message Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-4 w-4" />
                Mensagem de agradecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Digite sua mensagem aqui"
                value={thankMessage}
                onChange={(e) => setThankMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Sales History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Compras recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Mídia</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Cronômetro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {sale.buyer_name || `User ${sale.buyer_id.slice(0, 8)}`}
                        </TableCell>
                        <TableCell>
                          {sale.media_name || `Mídia ${sale.media_id.slice(0, 8)}`}
                        </TableCell>
                        <TableCell>{sale.credits_amount}</TableCell>
                        <TableCell>
                          <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                            {sale.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {sale.thanked ? (
                            <Badge variant="outline" className="text-green-600">
                              ✅ Agradecido
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSaleId(sale.id)}
                              className="flex items-center gap-1"
                            >
                              <Gift className="h-3 w-3" />
                              Agradecer 🎉
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            {formatDistanceToNow(new Date(sale.created_at), { 
                              addSuffix: false,
                              locale: ptBR 
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Thank You Dialog */}
          {selectedSaleId && (
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span className="font-medium">Enviar agradecimento</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSendThankYou(selectedSaleId)}
                      disabled={!thankMessage.trim()}
                    >
                      Enviar 🎉
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSaleId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Earnings Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {earningsStats?.total_earned || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total recebido</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {availableCredits}
                  </div>
                  <div className="text-sm text-muted-foreground">Disponível para saque</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {earningsStats?.pending_amount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Saque pendente</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Withdrawal Section */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {withdrawalCountdown ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Próximo saque disponível em: {withdrawalCountdown.days} dias {withdrawalCountdown.hours.toString().padStart(2, '0')}:{withdrawalCountdown.minutes.toString().padStart(2, '0')}:{withdrawalCountdown.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                  {earningsStats?.last_withdrawal && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Último saque realizado: {format(new Date(earningsStats.last_withdrawal), 'dd/MM/yyyy HH:mm')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Valor em créditos"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleRequestWithdrawal}
                      disabled={!withdrawalAmount || parseInt(withdrawalAmount) > availableCredits}
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Requisitar Saque
                    </Button>
                  </div>
                  
                  {withdrawalAmount && (
                    <div className="text-sm space-y-1">
                      <div>Valor líquido após taxa de 30%: <span className="font-bold">{Math.floor(netAmount)} créditos</span></div>
                      <div>1CR = {creditValue.toFixed(2)} BRL / USD</div>
                      <div>Valor estimado: <span className="font-bold">R$ {(netAmount * creditValue).toFixed(2)}</span></div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};