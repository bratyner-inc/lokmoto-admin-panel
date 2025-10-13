import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Car, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  Edit, 
  Download,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useContract } from '@/presentation/hooks/useContracts';
import { formatCurrency, formatDate, formatPlate } from '@/shared/utils/formatters';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ContratoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { contract, loading, error, cancelContract, refresh } = useContract(id || '');
  const [cancellationReason, setCancellationReason] = React.useState('');
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancelContract = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe o motivo do cancelamento.',
        variant: 'destructive',
      });
      return;
    }

    setIsCancelling(true);
    try {
      const result = await cancelContract(cancellationReason);
      if (result.success) {
        toast({
          title: 'Contrato cancelado',
          description: 'O contrato foi cancelado com sucesso.',
        });
        refresh();
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Não foi possível cancelar o contrato.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-white">Ativo</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'suspended':
        return <Badge className="bg-warning text-white">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateMonthsActive = () => {
    if (!contract) return 0;
    const start = contract.startDate;
    const end = contract.endDate || new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !contract) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contratos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contrato não encontrado</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contrato não encontrado</h3>
            <p className="text-muted-foreground mb-6">
              O contrato solicitado não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Button onClick={() => navigate('/contratos')}>
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthsActive = calculateMonthsActive();
  const totalValue = contract.monthlyValue * monthsActive;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/contratos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Contrato {contract.contractNumber}
            </h1>
            <p className="text-muted-foreground">
              Detalhes completos do contrato de assinatura
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contract.status === 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Contrato
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar Contrato</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá cancelar o contrato. Por favor, informe o motivo do cancelamento.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                  <Textarea
                    placeholder="Motivo do cancelamento..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Fechar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelContract}
                    disabled={isCancelling || !cancellationReason.trim()}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Status and Quick Info */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {getStatusBadge(contract.status)}
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm text-muted-foreground">
                Criado em {formatDate(contract.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-success">
                {formatCurrency(contract.monthlyValue)}
              </div>
              <div className="text-sm text-muted-foreground">Valor Mensal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Info */}
      {contract.status === 'cancelled' && contract.cancellationDate && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-destructive mb-1">
                  Contrato Cancelado
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Cancelado em {formatDate(contract.cancellationDate)}
                </div>
                {contract.cancellationReason && (
                  <div className="text-sm">
                    <span className="font-medium">Motivo:</span> {contract.cancellationReason}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          {contract.customer && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Nome</div>
                  <div className="text-base font-medium">{contract.customer.name}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">E-mail</div>
                      <div className="text-sm">{contract.customer.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Telefone</div>
                      <div className="text-sm">{contract.customer.phone}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motorcycle Information */}
          {contract.motorcycle && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Informações da Motocicleta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Marca/Modelo</div>
                    <div className="font-medium">{contract.motorcycle.brand} {contract.motorcycle.model}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Versão</div>
                    <div className="font-medium">{contract.motorcycle.version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ano</div>
                    <div className="font-medium">{contract.motorcycle.year}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Placa</div>
                    <div className="font-mono font-medium">{formatPlate(contract.motorcycle.plate)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contract Period */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Período do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Data de Início</div>
                  <div className="font-medium">{formatDate(contract.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Data de Término</div>
                  <div className="font-medium">
                    {contract.endDate ? formatDate(contract.endDate) : 'Indeterminado'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Dia de Pagamento</div>
                  <div className="font-medium">Dia {contract.paymentDay} de cada mês</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duração</div>
                  <div className="font-medium">{monthsActive} meses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {contract.notes && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contract.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Valor Mensal</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(contract.monthlyValue)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Acumulado</div>
                <div className="text-xl font-bold text-success">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {monthsActive} meses × {formatCurrency(contract.monthlyValue)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Criado em
                </div>
                <div className="font-medium">{formatDate(contract.createdAt)}</div>
              </div>
              
              {contract.updatedAt.getTime() !== contract.createdAt.getTime() && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Última atualização
                    </div>
                    <div className="font-medium">{formatDate(contract.updatedAt)}</div>
                  </div>
                </>
              )}
              
              {contract.cancellationDate && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <XCircle className="h-4 w-4" />
                      Cancelado em
                    </div>
                    <div className="font-medium">{formatDate(contract.cancellationDate)}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/contratos')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

