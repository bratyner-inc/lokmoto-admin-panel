import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  MessageSquare
} from 'lucide-react';

// Mock data expandido para detalhes
const mockMaintenanceDetails = {
  id: '1',
  title: 'Troca de pastilhas de freio',
  type: 'preventiva',
  status: 'concluida',
  vehicleId: '1',
  vehicleName: 'Honda CB 600F Hornet',
  vehiclePlate: 'ABC-1234',
  description: 'Substituição das pastilhas de freio dianteiras e traseiras devido ao desgaste natural. Cliente reportou ruído durante frenagem e redução na eficiência dos freios.',
  customerReturn: 'Pastilhas substituídas com sucesso. Veículo liberado para uso normal. Recomendamos verificação das pastilhas a cada 3 meses ou 5.000 km rodados.',
  cost: 180,
  mechanicName: 'João Silva',
  priority: 'media',
  internalNotes: 'Verificar pastilhas novamente em 3 meses. Discos estão em bom estado, não necessitam substituição no momento.',
  createdAt: '2024-01-15T09:00:00Z',
  completedAt: '2024-01-16T16:30:00Z',
  timeline: [
    {
      id: '1',
      date: '2024-01-15T09:00:00Z',
      action: 'Manutenção criada',
      description: 'Registro inicial da manutenção',
      user: 'Sistema'
    },
    {
      id: '2',
      date: '2024-01-15T10:30:00Z',
      action: 'Status alterado para "Em Andamento"',
      description: 'Veículo recebido na oficina para início dos trabalhos',
      user: 'João Silva'
    },
    {
      id: '3',
      date: '2024-01-15T14:00:00Z',
      action: 'Peças solicitadas',
      description: 'Pastilhas de freio dianteiras e traseiras solicitadas ao estoque',
      user: 'João Silva'
    },
    {
      id: '4',
      date: '2024-01-16T08:00:00Z',
      action: 'Início do reparo',
      description: 'Desmontagem e substituição das pastilhas iniciada',
      user: 'João Silva'
    },
    {
      id: '5',
      date: '2024-01-16T16:30:00Z',
      action: 'Manutenção concluída',
      description: 'Pastilhas substituídas e teste de frenagem realizado com sucesso',
      user: 'João Silva'
    }
  ],
  parts: [
    {
      id: '1',
      name: 'Pastilha de freio dianteira',
      quantity: 2,
      unitPrice: 45,
      total: 90
    },
    {
      id: '2',
      name: 'Pastilha de freio traseira',
      quantity: 2,
      unitPrice: 35,
      total: 70
    }
  ],
  labor: {
    hours: 2,
    hourlyRate: 10,
    total: 20
  }
};

export default function ManutencaoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const maintenance = mockMaintenanceDetails;

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/manutencao')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              {maintenance.title}
            </h1>
            <p className="text-muted-foreground">
              {maintenance.vehicleName} • {maintenance.vehiclePlate}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/manutencao/${maintenance.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {getStatusBadge(maintenance.status)}
              <p className="text-sm text-muted-foreground mt-2">Status</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {getTypeBadge(maintenance.type)}
              <p className="text-sm text-muted-foreground mt-2">Tipo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {getPriorityBadge(maintenance.priority)}
              <p className="text-sm text-muted-foreground mt-2">Prioridade</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(maintenance.cost)}</div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Gerais */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Veículo</div>
                  <div className="font-medium flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    {maintenance.vehicleName}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Placa</div>
                  <div className="font-mono font-medium">{maintenance.vehiclePlate}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Responsável</div>
                  <div className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {maintenance.mechanicName}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Data de Abertura</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(maintenance.createdAt)}
                  </div>
                </div>
              </div>

              {maintenance.completedAt && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <div className="text-muted-foreground">Data de Conclusão</div>
                    <div className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      {formatDate(maintenance.completedAt)}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <div className="text-muted-foreground text-sm mb-2">Descrição</div>
                <p className="text-sm">{maintenance.description}</p>
              </div>

              {maintenance.internalNotes && (
                <div>
                  <div className="text-muted-foreground text-sm mb-2">Observações Internas</div>
                  <p className="text-sm bg-muted/30 p-3 rounded-md">{maintenance.internalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retorno para o Cliente */}
          {maintenance.customerReturn && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Retorno para o Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm">{maintenance.customerReturn}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline e Custos */}
        <div className="space-y-6">
          {/* Detalhamento de Custos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Detalhamento de Custos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Peças */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Peças Utilizadas</h4>
                <div className="space-y-2">
                  {maintenance.parts.map((part) => (
                    <div key={part.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{part.name}</span>
                        <span className="text-muted-foreground ml-2">x{part.quantity}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(part.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Mão de obra */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Mão de Obra</h4>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{maintenance.labor.hours}h</span>
                    <span className="text-muted-foreground ml-2">× {formatCurrency(maintenance.labor.hourlyRate)}/h</span>
                  </div>
                  <span className="font-medium">{formatCurrency(maintenance.labor.total)}</span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center font-bold">
                <span>Total Geral</span>
                <span className="text-primary">{formatCurrency(maintenance.cost)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico
              </CardTitle>
              <CardDescription>
                Cronologia das ações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {maintenance.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      {index < maintenance.timeline.length - 1 && (
                        <div className="w-px h-full bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{event.action}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(event.date)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">Por: {event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}