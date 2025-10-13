import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, CheckCircle, Clock, AlertCircle, Plus, Loader2, Eye } from 'lucide-react';
import { useTransactions, usePaymentStats, useOverdueTransactions } from '@/presentation/hooks/useTransactions';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Transaction, TransactionStatus, PaymentMethod } from '@/domain/entities/Transaction';
import { TransactionRepository } from '@/data/repositories/TransactionRepository';

const transactionRepository = new TransactionRepository();

export default function Pagamentos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { transactions, loading, error, refetch } = useTransactions();
  const { stats, loading: loadingStats } = usePaymentStats();
  const { transactions: overdueTransactions } = useOverdueTransactions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

  const getStatusBadge = (transaction: Transaction) => {
    const today = new Date();
    const isOverdue = transaction.status === 'pending' && new Date(transaction.dueDate) < today;

    if (isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Em Atraso
        </Badge>
      );
    }
    
    switch (transaction.status) {
      case 'paid':
        return (
          <Badge className="bg-success text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Falhou
          </Badge>
        );
      case 'refunded':
        return <Badge variant="outline">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{transaction.status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const methods: Record<PaymentMethod, string> = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'boleto': 'Boleto',
    };
    return methods[method];
  };

  const handleMarkAsPaid = async (transactionId: string) => {
    try {
      await transactionRepository.markAsPaid(transactionId);
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
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.safe2payTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'all' || transaction.paymentMethod === filterPaymentMethod;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  // Check if transaction is overdue
  const isOverdue = (transaction: Transaction): boolean => {
    const today = new Date();
    return transaction.status === 'pending' && new Date(transaction.dueDate) < today;
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Erro ao carregar pagamentos: {error.message}</p>
              <Button onClick={() => refetch()} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Pagamentos
          </h1>
          <p className="text-muted-foreground">
            Gerencie pagamentos e transações da loja
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/pagamentos/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  formatCurrency(stats.totalRevenue)
                )}
              </div>
              <p className="text-sm text-muted-foreground">Recebido</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  formatCurrency(stats.pendingAmount)
                )}
              </div>
              <p className="text-sm text-muted-foreground">Pendente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  overdueTransactions.length
                )}
              </div>
              <p className="text-sm text-muted-foreground">Em Atraso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  transactions.length
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Buscar por descrição ou ID da transação..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && transactions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando pagamentos...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' || filterPaymentMethod !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Cadastre contratos para gerar pagamentos automaticamente.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      {!loading && filteredTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pagamentos</CardTitle>
            <CardDescription>
              Histórico de pagamentos e transações ({filteredTransactions.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Descrição</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vencimento</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pagamento</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Método</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-foreground">
                          {transaction.description || 'Sem descrição'}
                        </div>
                        {transaction.referenceMonth && transaction.referenceYear && (
                          <div className="text-sm text-muted-foreground">
                            Ref: {transaction.referenceMonth}/{transaction.referenceYear}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-foreground">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={isOverdue(transaction) ? 'text-destructive font-medium' : 'text-foreground'}>
                          {formatDate(transaction.dueDate)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-foreground">
                        {transaction.paidAt ? formatDate(transaction.paidAt) : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(transaction)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/pagamentos/${transaction.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {transaction.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-success"
                              onClick={() => handleMarkAsPaid(transaction.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

