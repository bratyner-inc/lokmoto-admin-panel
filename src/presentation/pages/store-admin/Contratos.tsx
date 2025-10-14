import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Plus, Search, Calendar, User, Car, Eye, Edit, Download, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/presentation/hooks/useContracts';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { Contract } from '@/domain/entities/Contract';

export default function Contratos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { contracts, loading, error, stats, refresh } = useContracts();

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteContract = (contractId: string) => {
    // TODO: Implement delete with contract repository
    toast({
      title: 'Contrato excluído',
      description: 'O contrato foi excluído com sucesso.',
    });
    refresh();
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

  const calculateMonthsActive = (contract: Contract) => {
    const start = contract.startDate;
    const end = contract.endDate || new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  const calculateTotalValue = (contract: Contract) => {
    const months = calculateMonthsActive(contract);
    return contract.monthlyValue * months;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar contratos</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={refresh}>Tentar Novamente</Button>
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
            <FileText className="h-8 w-8 text-primary" />
            Contratos
          </h1>
          <p className="text-muted-foreground">
            Gerencie contratos de assinatura da loja
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
                {stats.active}
              </div>
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {stats.completed}
              </div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {stats.suspended}
              </div>
              <p className="text-sm text-muted-foreground">Suspensos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {stats.cancelled}
              </div>
              <p className="text-sm text-muted-foreground">Cancelados</p>
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
                placeholder="Buscar por número do contrato..." 
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
                <option value="suspended">Suspensos</option>
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
                <CardTitle className="text-lg font-mono">{contract.contractNumber}</CardTitle>
                <div className="flex gap-2">
                  {getStatusBadge(contract.status)}
                </div>
              </div>
              <CardDescription>
                Criado em {formatDate(contract.createdAt)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Contract Period */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">
                      {formatDate(contract.startDate)}
                      {contract.endDate && ` - ${formatDate(contract.endDate)}`}
                      {!contract.endDate && ' - Indeterminado'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Dia de pagamento: {contract.paymentDay}
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{formatCurrency(contract.monthlyValue)}</div>
                    <div className="text-xs text-muted-foreground">Mensalidade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">
                      {calculateMonthsActive(contract)} meses
                    </div>
                    <div className="text-xs text-muted-foreground">Duração</div>
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
                          Tem certeza que deseja excluir o contrato {contract.contractNumber}? Esta ação não pode ser desfeita.
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
                  : 'Comece criando seu primeiro contrato de assinatura.'
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

