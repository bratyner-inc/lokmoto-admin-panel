/**
 * ManutencaoDetalhes Page - Store Admin
 * Exibe detalhes completos de um registro de manutenção
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageLoader } from '@/components/ui/page-loader';
import {
  Wrench,
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  User,
  Car,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Building,
} from 'lucide-react';
import { useMaintenanceRecord } from '@/presentation/hooks/useMaintenance';
import {
  maintenanceStatusLabels,
  maintenanceTypeLabels,
  maintenancePriorityLabels,
} from '@/domain/entities/MaintenanceRecord';

export default function ManutencaoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { maintenance, loading, error } = useMaintenanceRecord(id);

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

  const formatDateTime = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) return <PageLoader />;

  if (error || !maintenance) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Manutenção não encontrada</h2>
        <p className="text-muted-foreground">
          {error?.message || 'Não foi possível encontrar esta manutenção.'}
        </p>
        <Button onClick={() => navigate('/manutencao')}>Voltar para lista</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/manutencao')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              Detalhes da Manutenção
            </h1>
            <p className="text-muted-foreground">Visualize todas as informações do registro</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/manutencao/${id}/editar`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Main Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{maintenance.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(maintenance.status)}
                {getTypeBadge(maintenance.maintenanceType)}
                {getPriorityBadge(maintenance.priority)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(maintenance.actualCost || maintenance.estimatedCost)}
              </div>
              <div className="text-sm text-muted-foreground">
                {maintenance.actualCost ? 'Custo Real' : 'Custo Estimado'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle */}
          {maintenance.motorcycle && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Car className="h-4 w-4" />
                Veículo
              </h3>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-lg font-semibold">
                    {maintenance.motorcycle.brand} {maintenance.motorcycle.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placa: {maintenance.motorcycle.plate}
                    {maintenance.motorcycle.year && ` • Ano: ${maintenance.motorcycle.year}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição
            </h3>
            <p className="text-foreground whitespace-pre-wrap">{maintenance.description}</p>
          </div>

          {/* Customer Return */}
          {maintenance.customerReturn && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Retorno ao Cliente
                </h3>
                <p className="text-foreground whitespace-pre-wrap">{maintenance.customerReturn}</p>
              </div>
            </>
          )}

          {/* Internal Notes */}
          {maintenance.internalNotes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas Internas
                </h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">{maintenance.internalNotes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Custo Estimado:</span>
              <span className="font-semibold">{formatCurrency(maintenance.estimatedCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Custo Real:</span>
              <span className="font-semibold">{formatCurrency(maintenance.actualCost)}</span>
            </div>
            {maintenance.estimatedCost && maintenance.actualCost && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Diferença:</span>
                  <span
                    className={`font-semibold ${
                      maintenance.actualCost > maintenance.estimatedCost
                        ? 'text-destructive'
                        : 'text-success'
                    }`}
                  >
                    {formatCurrency(Math.abs(maintenance.actualCost - maintenance.estimatedCost))}
                    {maintenance.actualCost > maintenance.estimatedCost ? ' acima' : ' abaixo'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Responsible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenance.mechanicName && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mecânico:</span>
                <span className="font-semibold">{maintenance.mechanicName}</span>
              </div>
            )}
            {maintenance.workshopName && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Oficina:</span>
                <span className="font-semibold">{maintenance.workshopName}</span>
              </div>
            )}
            {!maintenance.mechanicName && !maintenance.workshopName && (
              <p className="text-muted-foreground text-sm">Nenhum responsável definido</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenance.scheduledDate && (
              <div className="flex items-start gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {formatDate(maintenance.scheduledDate)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="font-medium">Agendada</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Manutenção agendada para esta data</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="w-24 text-sm text-muted-foreground">{formatDate(maintenance.createdAt)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">Criada</span>
                </div>
                <p className="text-sm text-muted-foreground">Registro de manutenção criado</p>
              </div>
            </div>

            {maintenance.startedAt && (
              <div className="flex items-start gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {formatDate(maintenance.startedAt)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="h-4 w-4 text-primary" />
                    <span className="font-medium">Iniciada</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Manutenção iniciada</p>
                </div>
              </div>
            )}

            {maintenance.completedAt && (
              <div className="flex items-start gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {formatDate(maintenance.completedAt)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="font-medium">Concluída</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Manutenção finalizada com sucesso</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="w-24 text-sm text-muted-foreground">{formatDate(maintenance.updatedAt)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Última Atualização</span>
                </div>
                <p className="text-sm text-muted-foreground">Última modificação no registro</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

