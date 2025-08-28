import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Plus, Search, Calendar, User, Car, Eye, Edit, Download, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockContracts = [
  {
    id: 'CTR-2024-001',
    clientName: 'Carlos Mendes',
    vehicleModel: 'Honda CB 600F',
    vehiclePlate: 'ABC-1234',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    dailyRate: 85,
    totalAmount: 2550,
    status: 'active' as const,
    paymentStatus: 'paid' as const,
    createdAt: '2024-01-10'
  },
  {
    id: 'CTR-2024-002',
    clientName: 'Ana Paula',
    vehicleModel: 'Yamaha MT-07',
    vehiclePlate: 'XYZ-5678',
    startDate: '2024-01-20',
    endDate: '2024-03-20',
    dailyRate: 95,
    totalAmount: 5700,
    status: 'active' as const,
    paymentStatus: 'partial' as const,
    createdAt: '2024-01-18'
  },
  {
    id: 'CTR-2024-003',
    clientName: 'Roberto Silva',
    vehicleModel: 'Kawasaki Ninja 300',
    vehiclePlate: 'MOT-9012',
    startDate: '2024-01-05',
    endDate: '2024-01-20',
    dailyRate: 75,
    totalAmount: 1125,
    status: 'completed' as const,
    paymentStatus: 'paid' as const,
    createdAt: '2024-01-02'
  }
];

export default function Contratos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = 
      contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteContract = (contractId: string) => {
    toast({
      title: 'Contrato excluído',
      description: 'O contrato foi excluído com sucesso.',
    });
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            <FileText className="h-8 w-8 text-primary" />
            Contratos
          </h1>
          <p className="text-muted-foreground">
            Gerencie contratos de locação da loja
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={() => navigate('/contratos/novo')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockContracts.filter(c => c.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {mockContracts.filter(c => c.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(mockContracts.reduce((acc, c) => acc + c.totalAmount, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {mockContracts.filter(c => c.paymentStatus === 'partial').length}
              </div>
              <p className="text-sm text-muted-foreground">Pagamentos Parciais</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text"
                placeholder="Buscar por cliente, veículo ou ID do contrato..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">{contract.id}</CardTitle>
                <div className="flex gap-2">
                  {getStatusBadge(contract.status)}
                  {getPaymentStatusBadge(contract.paymentStatus)}
                </div>
              </div>
              <CardDescription>
                Criado em {formatDate(contract.createdAt)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Client Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{contract.clientName}</div>
                    <div className="text-sm text-muted-foreground">Cliente</div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{contract.vehicleModel}</div>
                    <div className="text-sm text-muted-foreground">Placa: {contract.vehiclePlate}</div>
                  </div>
                </div>

                {/* Contract Period */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {calculateDays(contract.startDate, contract.endDate)} dias
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{formatCurrency(contract.dailyRate)}</div>
                    <div className="text-xs text-muted-foreground">Diária</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">{formatCurrency(contract.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/contratos/${contract.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/contratos/editar/${contract.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o contrato {contract.id}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteContract(contract.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-1"
              onClick={() => navigate('/contratos/novo')}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Novo Contrato</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Renovar Contrato</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Relatórios</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Download className="h-5 w-5" />
              <span className="text-sm">Exportar Lista</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Nenhum contrato encontrado' : 'Nenhum contrato cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro contrato de locação.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => navigate('/contratos/novo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}