import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Search, Filter, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

// Mock data
const mockPayments = [
  {
    id: '1',
    contractId: 'CTR-2024-001',
    clientName: 'Carlos Mendes',
    amount: 2500,
    paymentDate: '2024-01-22',
    dueDate: '2024-01-22',
    paymentMethod: 'pix' as const,
    status: 'completed' as const,
    transactionId: 'PIX123456789'
  },
  {
    id: '2',
    contractId: 'CTR-2024-002',
    clientName: 'Ana Paula',
    amount: 1800,
    paymentDate: null,
    dueDate: '2024-01-25',
    paymentMethod: 'credit_card' as const,
    status: 'pending' as const
  },
  {
    id: '3',
    contractId: 'CTR-2024-003',
    clientName: 'Roberto Silva',
    amount: 950,
    paymentDate: '2024-01-20',
    dueDate: '2024-01-18',
    paymentMethod: 'bank_transfer' as const,
    status: 'completed' as const,
    isOverdue: true
  }
];

export default function Pagamentos() {
  const getStatusBadge = (status: string, isOverdue?: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive">Em Atraso</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-white">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'refunded':
        return <Badge variant="outline">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const methods = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'bank_transfer': 'Transferência',
      'cash': 'Dinheiro'
    };
    
    return <Badge variant="outline">{methods[method as keyof typeof methods] || method}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
        <Button className="bg-primary hover:bg-primary-dark">
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
                {formatCurrency(mockPayments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Recebido</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {formatCurrency(mockPayments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Pendente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {mockPayments.filter(p => p.isOverdue).length}
              </div>
              <p className="text-sm text-muted-foreground">Em Atraso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockPayments.length}
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
                <input 
                  type="text"
                  placeholder="Buscar por cliente, contrato ou ID da transação..." 
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <CardDescription>
            Histórico de pagamentos e transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contrato</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vencimento</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pagamento</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Método</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">{payment.clientName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-primary">{payment.contractId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-foreground">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={payment.isOverdue ? 'text-destructive font-medium' : 'text-foreground'}>
                        {formatDate(payment.dueDate)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="py-4 px-4">
                      {getPaymentMethodBadge(payment.paymentMethod)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(payment.status, payment.isOverdue)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {payment.status === 'pending' ? (
                          <Button variant="ghost" size="sm" className="text-success">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        ) : payment.status === 'completed' ? (
                          <Button variant="ghost" size="sm">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Confirmar Pagamento</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Enviar Cobrança</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Relatório Mensal</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm">Conciliar Cartão</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}