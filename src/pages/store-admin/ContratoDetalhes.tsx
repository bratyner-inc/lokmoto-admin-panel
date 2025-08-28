import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, User, Car, Calendar, DollarSign, MapPin, Phone, Mail, Edit, Download, CreditCard, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Mock data
const mockContract = {
  id: 'CTR-2024-001',
  client: {
    id: 'client-1',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    phone: '(11) 99999-8888',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    }
  },
  vehicle: {
    id: 'vehicle-1',
    model: 'Honda CB 600F',
    brand: 'Honda',
    year: 2023,
    plate: 'ABC-1234',
    color: 'Azul',
    chassisNumber: 'ABC123DEF456789',
    fuelType: 'gasoline'
  },
  startDate: '2024-01-15',
  endDate: '2024-02-15',
  dailyRate: 85,
  totalAmount: 2550,
  status: 'active' as const,
  paymentStatus: 'paid' as const,
  notes: 'Cliente já conhecido da loja. Contrato de renovação.',
  payments: [
    {
      id: 'pay-1',
      amount: 2550,
      paymentDate: '2024-01-15',
      paymentMethod: 'credit_card',
      status: 'completed',
      transactionId: 'TXN-123456789'
    }
  ],
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z'
};

export default function ContratoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateDays = () => {
    const start = new Date(mockContract.startDate);
    const end = new Date(mockContract.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-white">Ativo</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-white">Pago</Badge>;
      case 'partial':
        return <Badge className="bg-warning text-white">Parcial</Badge>;
      case 'pending':
        return <Badge variant="destructive">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      bank_transfer: 'Transferência Bancária',
      cash: 'Dinheiro'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/contratos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Contrato {mockContract.id}
            </h1>
            <p className="text-muted-foreground">
              Detalhes completos do contrato de locação
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/contratos/editar/${id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
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
                {getStatusBadge(mockContract.status)}
                {getPaymentStatusBadge(mockContract.paymentStatus)}
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm text-muted-foreground">
                Criado em {formatDate(mockContract.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-success">
                {formatCurrency(mockContract.totalAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Total do Contrato</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Nome Completo</div>
                  <div className="text-base font-medium">{mockContract.client.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">CPF</div>
                  <div className="text-base">{mockContract.client.cpf}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="text-base">{mockContract.client.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Telefone</div>
                    <div className="text-base">{mockContract.client.phone}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Endereço</div>
                  <div className="text-base">
                    {mockContract.client.address.street}<br />
                    {mockContract.client.address.neighborhood}, {mockContract.client.address.city} - {mockContract.client.address.state}<br />
                    CEP: {mockContract.client.address.zipCode}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informações do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Modelo</div>
                  <div className="text-base font-medium">
                    {mockContract.vehicle.brand} {mockContract.vehicle.model}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Ano</div>
                  <div className="text-base">{mockContract.vehicle.year}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Placa</div>
                  <div className="text-base font-mono">{mockContract.vehicle.plate}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Cor</div>
                  <div className="text-base">{mockContract.vehicle.color}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Combustível</div>
                  <div className="text-base">Gasolina</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Número do Chassi</div>
                <div className="text-base font-mono">{mockContract.vehicle.chassisNumber}</div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockContract.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getPaymentMethodLabel(payment.paymentMethod)} • {formatDate(payment.paymentDate)}
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-muted-foreground">
                            ID: {payment.transactionId}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-success text-white">Pago</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {mockContract.notes && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{mockContract.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Resumo do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Período</div>
                <div className="text-base">
                  {formatDate(mockContract.startDate)} - {formatDate(mockContract.endDate)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {calculateDays()} dias
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-muted-foreground">Valor da Diária</div>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(mockContract.dailyRate)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Total do Contrato</div>
                <div className="text-xl font-bold text-success">
                  {formatCurrency(mockContract.totalAmount)}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({calculateDays()} dias)</span>
                  <span>{formatCurrency(mockContract.dailyRate * calculateDays())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descontos</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(mockContract.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium">Contrato criado</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(mockContract.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium">Pagamento confirmado</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(mockContract.payments[0].paymentDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium">Locação iniciada</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(mockContract.startDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Devolução prevista</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(mockContract.endDate)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Editar Contrato
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Adicionar Pagamento
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Renovar Contrato
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}