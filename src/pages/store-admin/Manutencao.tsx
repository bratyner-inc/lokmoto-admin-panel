import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Car,
  Eye,
  Edit,
  Trash2,
  DollarSign
} from 'lucide-react';

// Mock data para manutenções
const mockMaintenances = [
  {
    id: '1',
    title: 'Troca de pastilhas de freio',
    type: 'preventiva',
    status: 'concluida',
    vehicleId: '1',
    vehicleName: 'Honda CB 600F Hornet',
    vehiclePlate: 'ABC-1234',
    description: 'Substituição das pastilhas de freio dianteiras e traseiras devido ao desgaste natural.',
    customerReturn: 'Pastilhas substituídas com sucesso. Veículo liberado para uso normal.',
    cost: 180,
    mechanicName: 'João Silva',
    createdAt: '2024-01-15',
    completedAt: '2024-01-16',
    priority: 'media',
    internalNotes: 'Verificar pastilhas novamente em 3 meses.'
  },
  {
    id: '2',
    title: 'Sinistro - Queda da moto',
    type: 'sinistro',
    status: 'em_andamento',
    vehicleId: '2',
    vehicleName: 'Yamaha MT-07',
    vehiclePlate: 'XYZ-5678',
    description: 'Cliente reportou queda da moto durante chuva. Arranhões no tanque e guidão torto.',
    customerReturn: 'Recebido relatório do sinistro. Em análise para orçamento de reparo.',
    cost: 450,
    mechanicName: 'Carlos Santos',
    createdAt: '2024-01-20',
    completedAt: null,
    priority: 'alta',
    internalNotes: 'Aguardando peças do fornecedor. Previsão de entrega: 25/01.'
  },
  {
    id: '3',
    title: 'Revisão dos 10.000 km',
    type: 'preventiva',
    status: 'pendente',
    vehicleId: '3',
    vehicleName: 'Kawasaki Ninja 300',
    vehiclePlate: 'MOT-9012',
    description: 'Revisão programada dos 10.000 km conforme manual do fabricante.',
    customerReturn: '',
    cost: 320,
    mechanicName: 'João Silva',
    createdAt: '2024-01-22',
    completedAt: null,
    priority: 'baixa',
    internalNotes: 'Agendar para próxima semana.'
  },
  {
    id: '4',
    title: 'Problema no motor - Ruído estranho',
    type: 'corretiva',
    status: 'cancelada',
    vehicleId: '1',
    vehicleName: 'Honda CB 600F Hornet',
    vehiclePlate: 'ABC-1234',
    description: 'Cliente reportou ruído estranho no motor durante aceleração.',
    customerReturn: 'Após análise técnica, identificado que o ruído era normal do motor. Não necessita reparo.',
    cost: 0,
    mechanicName: 'Carlos Santos',
    createdAt: '2024-01-18',
    completedAt: '2024-01-18',
    priority: 'alta',
    internalNotes: 'Falso alarme - comportamento normal do motor.'
  }
];

export default function Manutencao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [maintenances] = useState(mockMaintenances);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="border-warning text-warning"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'em_andamento':
        return <Badge className="bg-primary text-white"><Wrench className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case 'concluida':
        return <Badge className="bg-success text-white"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'preventiva':
        return <Badge variant="outline" className="border-success text-success">Preventiva</Badge>;
      case 'corretiva':
        return <Badge variant="outline" className="border-warning text-warning">Corretiva</Badge>;
      case 'sinistro':
        return <Badge variant="outline" className="border-destructive text-destructive"><AlertTriangle className="h-3 w-3 mr-1" />Sinistro</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'media':
        return <Badge className="bg-warning text-white">Média</Badge>;
      case 'baixa':
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
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

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Manutenção excluída",
        description: "O registro de manutenção foi removido com sucesso.",
      });
      
      console.log('Manutenção excluída:', maintenanceId);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro.",
        variant: "destructive",
      });
    }
  };

  const filteredMaintenances = maintenances.filter(maintenance => {
    const matchesSearch = maintenance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || maintenance.status === statusFilter;
    const matchesType = typeFilter === 'todos' || maintenance.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: maintenances.length,
    pendente: maintenances.filter(m => m.status === 'pendente').length,
    emAndamento: maintenances.filter(m => m.status === 'em_andamento').length,
    concluida: maintenances.filter(m => m.status === 'concluida').length,
    sinistros: maintenances.filter(m => m.type === 'sinistro').length,
    custoTotal: maintenances.reduce((acc, m) => acc + m.cost, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            Manutenção
          </h1>
          <p className="text-muted-foreground">
            Gerencie manutenções, sinistros e histórico de reparos
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/manutencao/nova')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.pendente}</div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.emAndamento}</div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.concluida}</div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.sinistros}</div>
              <p className="text-sm text-muted-foreground">Sinistros</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(stats.custoTotal)}</div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
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
                  type="text"
                  placeholder="Buscar por título, veículo ou placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="preventiva">Preventiva</SelectItem>
                <SelectItem value="corretiva">Corretiva</SelectItem>
                <SelectItem value="sinistro">Sinistro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance List */}
      <div className="space-y-4">
        {filteredMaintenances.map((maintenance) => (
          <Card key={maintenance.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{maintenance.title}</CardTitle>
                    {getStatusBadge(maintenance.status)}
                    {getTypeBadge(maintenance.type)}
                    {getPriorityBadge(maintenance.priority)}
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      {maintenance.vehicleName} - {maintenance.vehiclePlate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(maintenance.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(maintenance.cost)}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Descrição</h4>
                  <p className="text-sm">{maintenance.description}</p>
                </div>

                {maintenance.customerReturn && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Retorno para o Cliente</h4>
                    <p className="text-sm bg-muted/30 p-2 rounded-md">{maintenance.customerReturn}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Responsável: <span className="font-medium text-foreground">{maintenance.mechanicName}</span></span>
                    {maintenance.completedAt && (
                      <span>Concluído em: <span className="font-medium text-foreground">{formatDate(maintenance.completedAt)}</span></span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/manutencao/${maintenance.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/manutencao/${maintenance.id}/editar`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o registro "{maintenance.title}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteMaintenance(maintenance.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMaintenances.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma manutenção encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Não há registros que correspondam aos filtros selecionados.
                </p>
                <Button onClick={() => navigate('/manutencao/nova')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira manutenção
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}