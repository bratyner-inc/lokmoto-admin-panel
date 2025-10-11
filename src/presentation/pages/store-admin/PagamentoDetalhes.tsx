import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  User,
  Building,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useTransaction } from '@/presentation/hooks/useTransactions';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { TransactionRepository } from '@/data/repositories/TransactionRepository';
import { useState } from 'react';
import { PaymentMethod } from '@/domain/entities/Transaction';

const transactionRepository = new TransactionRepository();

export default function PagamentoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { transaction, loading, error, refetch } = useTransaction(id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkAsPaid = async () => {
    if (!transaction) return;
    
    setIsProcessing(true);
    try {
      await transactionRepository.markAsPaid(transaction.id);
      toast({
        title: 'Pagamento confirmado!',
        description: 'A transação foi marcada como paga.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Erro ao confirmar pagamento',
        description: error instanceof Error ? error.message : 'Não foi possível confirmar o pagamento.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const methods: Record<PaymentMethod, string> = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'boleto': 'Boleto Bancário',
    };
    return methods[method];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando detalhes do pagamento...</span>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Erro ao carregar pagamento: {error?.message || 'Pagamento não encontrado'}</p>
              <Button onClick={() => navigate('/pagamentos')} className="mt-4">
                Voltar para lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverdue = transaction.status === 'pending' && new Date(transaction.dueDate) < new Date();
  const isPaid = transaction.status === 'paid';
  const isPending = transaction.status === 'pending';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/pagamentos')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Detalhes do Pagamento</h1>
            <p className="text-muted-foreground">ID: {transaction.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <Button
              onClick={handleMarkAsPaid}
              disabled={isProcessing}
              className="bg-success hover:bg-success/90"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Pagamento
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOverdue && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">Pagamento em Atraso</div>
                      <div className="text-sm">Este pagamento está vencido e precisa ser regularizado.</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Valor</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(transaction.amount)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Método de Pagamento</div>
                  <Badge variant="outline" className="text-base">
                    {getPaymentMethodLabel(transaction.paymentMethod)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Data de Vencimento</div>
                    <div className={`text-base ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
                      {formatDate(transaction.dueDate)}
                    </div>
                  </div>
                </div>

                {transaction.paidAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Data do Pagamento</div>
                      <div className="text-base text-success font-semibold">
                        {formatDate(transaction.paidAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {transaction.description && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Descrição</div>
                    <div className="text-base">{transaction.description}</div>
                  </div>
                </>
              )}

              {transaction.referenceMonth && transaction.referenceYear && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Referência</div>
                    <div className="text-base">
                      {transaction.referenceMonth}/{transaction.referenceYear}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Safe2Pay Information */}
          {(transaction.safe2payTransactionId || transaction.safe2payPaymentUrl || 
            transaction.safe2payBarcode || transaction.safe2payPixQrcode) && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Informações de Pagamento (Safe2Pay)
                </CardTitle>
                <CardDescription>Dados da integração de pagamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transaction.safe2payTransactionId && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">ID da Transação Safe2Pay</div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {transaction.safe2payTransactionId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.safe2payTransactionId!, 'ID da transação')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {transaction.safe2payPaymentUrl && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">URL de Pagamento</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(transaction.safe2payPaymentUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir página de pagamento
                      </Button>
                    </div>
                  </div>
                )}

                {transaction.safe2payBarcode && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Código de Barras do Boleto</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                        {transaction.safe2payBarcode}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.safe2payBarcode!, 'Código de barras')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {transaction.safe2payPixQrcode && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">QR Code PIX</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto max-h-20">
                        {transaction.safe2payPixQrcode}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.safe2payPixQrcode!, 'QR Code PIX')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer & Contract Info */}
          {(transaction.customer || transaction.contract) && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações Relacionadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {transaction.customer && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm font-medium text-muted-foreground">Cliente</div>
                    </div>
                    <div className="ml-6">
                      <div className="font-medium">{transaction.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{transaction.customer.email}</div>
                      <div className="text-sm text-muted-foreground">{transaction.customer.phone}</div>
                    </div>
                  </div>
                )}

                {transaction.contract && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm font-medium text-muted-foreground">Contrato</div>
                      </div>
                      <div className="ml-6">
                        <div className="font-medium">{transaction.contract.contractNumber}</div>
                        <Badge variant="outline" className="mt-1">
                          {transaction.contract.status}
                        </Badge>
                        <Button
                          variant="link"
                          className="p-0 h-auto mt-2"
                          onClick={() => navigate(`/contratos/${transaction.contract?.id}`)}
                        >
                          Ver contrato completo →
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status do Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant={isPaid ? 'default' : isOverdue ? 'destructive' : 'secondary'}
                  className={isPaid ? 'bg-success text-white' : ''}
                >
                  {isPaid ? 'Pago' : isOverdue ? 'Em Atraso' : 'Pendente'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <Badge variant="outline">
                  {transaction.transactionType === 'rental_payment' ? 'Aluguel' : 'Assinatura'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Criado em</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
              </div>
              
              {transaction.paidAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <div>
                    <div className="text-sm font-medium">Pago em</div>
                    <div className="text-sm text-success">
                      {formatDate(transaction.paidAt)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

