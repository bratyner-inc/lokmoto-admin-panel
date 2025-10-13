/**
 * Manutenção Page - Store Admin
 * Lista e gerencia registros de manutenção de veículos
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PageLoader } from '@/components/ui/page-loader';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useMaintenance, useMaintenanceStats } from '@/presentation/hooks/useMaintenance';
import {
  maintenanceStatusLabels,
  maintenanceTypeLabels,
  maintenancePriorityLabels,
} from '@/domain/entities/MaintenanceRecord';

export default function Manutencao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { maintenances, loading, error, deleteMaintenance, refresh } = useMaintenance();
  const { stats: maintenanceStats } = useMaintenanceStats();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendada':
        return (
          <Badge variant="outline" className="border-warning text-warning">
            <Clock className="h-3 w-3 mr-1" />
            Agendada
          </Badge>
        );
      case 'em_andamento':
        return (
          <Badge className="bg-primary text-white">
            <Wrench className="h-3 w-3 mr-1" />
            Em Andamento
          </Badge>
        );
      case 'concluida':
        return (
          <Badge className="bg-success text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        );
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
        return (
          <Badge variant="outline" className="border-destructive text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Sinistro
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return <Badge variant="destructive">Urgente</Badge>;
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

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    try {
      await deleteMaintenance(maintenanceId);

      toast({
        title: 'Manutenção excluída',
        description: 'O registro de manutenção foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o registro.',
        variant: 'destructive',
      });
    }
  };

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((maintenance) => {
      const matchesSearch =
        maintenance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maintenance.motorcycle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maintenance.motorcycle?.plate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || maintenance.status === statusFilter;
      const matchesType = typeFilter === 'todos' || maintenance.maintenanceType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [maintenances, searchTerm, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    if (maintenanceStats) {
      return {
        total: maintenanceStats.total,
        agendada: maintenanceStats.byStatus.agendada,
        emAndamento: maintenanceStats.byStatus.em_andamento,
        concluida: maintenanceStats.byStatus.concluida,
        sinistros: maintenanceStats.byType.sinistro,
        custoTotal: maintenanceStats.costs.total,
      };
    }
    return {
      total: 0,
      agendada: 0,
      emAndamento: 0,
      concluida: 0,
      sinistros: 0,
      custoTotal: 0,
    };
  }, [maintenanceStats]);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Erro ao carregar manutenções</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={refresh}>Tentar Novamente</Button>
      </div>
    );
  }

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
        <Button className="bg-primary hover:bg-primary-dark" onClick={() => navigate('/manutencao/nova')}>
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
              <div className="text-2xl font-bold text-warning">{stats.agendada}</div>
              <p className="text-sm text-muted-foreground">Agendadas</p>
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
              <div className="text-lg font-bold text-foreground">{formatCurrency(stats.custoTotal)}</div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título, veículo ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
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
        {filteredMaintenances.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma manutenção encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'todos' || typeFilter !== 'todos'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira manutenção.'}
              </p>
              {!searchTerm && statusFilter === 'todos' && typeFilter === 'todos' && (
                <Button onClick={() => navigate('/manutencao/nova')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Manutenção
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMaintenances.map((maintenance) => (
            <Card key={maintenance.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{maintenance.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(maintenance.status)}
                          {getTypeBadge(maintenance.maintenanceType)}
                          {getPriorityBadge(maintenance.priority)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {formatCurrency(maintenance.actualCost || maintenance.estimatedCost)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {maintenance.actualCost ? 'Custo real' : 'Custo estimado'}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    {maintenance.motorcycle && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Veículo:</span>
                        <span>
                          {maintenance.motorcycle.brand} {maintenance.motorcycle.model} - {maintenance.motorcycle.plate}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{maintenance.description}</p>

                    {/* Additional Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      {maintenance.mechanicName && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Mecânico:</span>
                          <span>{maintenance.mechanicName}</span>
                        </div>
                      )}
                      {maintenance.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Agendado: {formatDate(maintenance.scheduledDate)}</span>
                        </div>
                      )}
                      {maintenance.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Concluído: {formatDate(maintenance.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/manutencao/${maintenance.id}`)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/manutencao/${maintenance.id}/editar`)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMaintenance(maintenance.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

