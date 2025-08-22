import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Search, Calendar, User, Car, CheckCircle, X, Clock, Eye } from 'lucide-react';

// Mock data
const mockProposals = [
  {
    id: 'PROP-2024-001',
    clientName: 'Miguel Santos',
    clientEmail: 'miguel.santos@email.com',
    vehicleModel: 'Honda CB 600F',
    requestedStartDate: '2024-01-25',
    requestedEndDate: '2024-02-25',
    proposedDailyRate: 85,
    totalAmount: 2635,
    status: 'pending' as const,
    notes: 'Cliente interessado em desconto para período longo',
    createdAt: '2024-01-22T10:30:00Z'
  },
  {
    id: 'PROP-2024-002',
    clientName: 'Fernanda Lima',
    clientEmail: 'fernanda.lima@email.com',
    vehicleModel: 'Yamaha MT-07',
    requestedStartDate: '2024-02-01',
    requestedEndDate: '2024-02-15',
    proposedDailyRate: 95,
    totalAmount: 1330,
    status: 'approved' as const,
    notes: 'Proposta aprovada pelo gerente',
    createdAt: '2024-01-21T15:20:00Z'
  },
  {
    id: 'PROP-2024-003',
    clientName: 'Ricardo Oliveira',
    clientEmail: 'ricardo.oliveira@email.com',
    vehicleModel: 'Kawasaki Ninja 300',
    requestedStartDate: '2024-01-28',
    requestedEndDate: '2024-02-10',
    proposedDailyRate: 75,
    totalAmount: 975,
    status: 'rejected' as const,
    notes: 'Veículo não disponível no período solicitado',
    createdAt: '2024-01-20T09:15:00Z'
  },
  {
    id: 'PROP-2024-004',
    clientName: 'Carolina Rocha',
    clientEmail: 'carolina.rocha@email.com',
    vehicleModel: 'Honda CB 250 Twister',
    requestedStartDate: '2024-01-15',
    requestedEndDate: '2024-01-22',
    proposedDailyRate: 60,
    totalAmount: 420,
    status: 'expired' as const,
    notes: 'Proposta expirou sem resposta do cliente',
    createdAt: '2024-01-10T14:45:00Z'
  }
];

export default function Propostas() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-white">Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-success text-white">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitada</Badge>;
      case 'expired':
        return <Badge variant="outline">Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Propostas
          </h1>
          <p className="text-muted-foreground">
            Gerencie propostas de locação da loja
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {mockProposals.filter(p => p.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {mockProposals.filter(p => p.status === 'approved').length}
              </div>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {mockProposals.filter(p => p.status === 'rejected').length}
              </div>
              <p className="text-sm text-muted-foreground">Rejeitadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(mockProposals.filter(p => p.status === 'approved').reduce((acc, p) => acc + p.totalAmount, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Valor Aprovado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text"
              placeholder="Buscar por cliente, veículo ou ID da proposta..." 
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockProposals.map((proposal) => (
          <Card key={proposal.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">{proposal.id}</CardTitle>
                {getStatusBadge(proposal.status)}
              </div>
              <CardDescription>
                Criada em {formatDateTime(proposal.createdAt)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Client Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{proposal.clientName}</div>
                    <div className="text-sm text-muted-foreground">{proposal.clientEmail}</div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{proposal.vehicleModel}</div>
                    <div className="text-sm text-muted-foreground">Veículo solicitado</div>
                  </div>
                </div>

                {/* Period */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      {formatDate(proposal.requestedStartDate)} - {formatDate(proposal.requestedEndDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {calculateDays(proposal.requestedStartDate, proposal.requestedEndDate)} dias
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{formatCurrency(proposal.proposedDailyRate)}</div>
                    <div className="text-xs text-muted-foreground">Diária</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">{formatCurrency(proposal.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>

                {/* Notes */}
                {proposal.notes && (
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-1">Observações:</div>
                    <div className="text-sm text-muted-foreground">{proposal.notes}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  {proposal.status === 'pending' ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 text-success border-success hover:bg-success hover:text-white">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-white">
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Aprovar Todas Pendentes</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Propostas Urgentes</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Agendar Revisão</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <ClipboardList className="h-5 w-5" />
              <span className="text-sm">Relatório</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}