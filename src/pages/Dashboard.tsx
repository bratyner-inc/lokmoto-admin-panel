import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthV2 } from '@/hooks/useAuthV2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Car, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  UserCog,
  Image,
  CreditCard,
  ClipboardList,
  Bike
} from 'lucide-react';

// Mock data para o dashboard
const mockGlobalStats = {
  totalClients: 1248,
  totalVehicles: 85,
  activeContracts: 42,
  monthlyRevenue: 125000,
  availableVehicles: 43,
  pendingPayments: 8,
  recentActivity: [
    { id: '1', type: 'contract' as const, description: 'Novo contrato assinado - Cliente João Silva', timestamp: '2024-01-22T10:30:00Z' },
    { id: '2', type: 'payment' as const, description: 'Pagamento recebido - R$ 2.500,00', timestamp: '2024-01-22T09:15:00Z' },
    { id: '3', type: 'client' as const, description: 'Novo cliente cadastrado - Maria Santos', timestamp: '2024-01-22T08:45:00Z' },
    { id: '4', type: 'vehicle' as const, description: 'Moto Honda CB600F adicionada ao estoque', timestamp: '2024-01-21T16:20:00Z' },
  ]
};

const mockStoreStats = {
  totalClients: 156,
  totalVehicles: 12,
  activeContracts: 8,
  monthlyRevenue: 18500,
  availableVehicles: 4,
  pendingPayments: 2,
  recentActivity: [
    { id: '1', type: 'contract' as const, description: 'Contrato renovado - Cliente Pedro Costa', timestamp: '2024-01-22T14:20:00Z' },
    { id: '2', type: 'payment' as const, description: 'Pagamento pendente - R$ 850,00', timestamp: '2024-01-22T11:30:00Z' },
    { id: '3', type: 'proposal' as const, description: 'Nova proposta recebida', timestamp: '2024-01-22T10:15:00Z' },
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isPlatformAdmin, isRentalCompany } = useAuthV2();
  
  const stats = isPlatformAdmin ? mockGlobalStats : mockStoreStats;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="h-4 w-4 text-primary" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-success" />;
      case 'client': return <Users className="h-4 w-4 text-blue-500" />;
      case 'vehicle': return <Car className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo da sua {isPlatformAdmin ? 'administração global' : 'loja'}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalClients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">{stats.availableVehicles} disponíveis</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1 text-success" />
              Todos em dia
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {stats.pendingPayments > 0 ? (
                <>
                  <AlertCircle className="h-3 w-3 mr-1 text-warning" />
                  {stats.pendingPayments} pagamentos pendentes
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1 text-success" />
                  Tudo em dia
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart placeholder */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Receita dos Últimos Meses
            </CardTitle>
            <CardDescription>
              Evolução da receita mensal nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground font-medium">Gráfico de Receita</p>
                <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4" size="sm">
              Ver todas as atividades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isPlatformAdmin ? (
              <>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => navigate('/usuarios')}
                >
                  <UserCog className="h-6 w-6" />
                  <span className="text-sm">Novo Usuário</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate('/clientes')}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Ver Clientes</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate('/financeiro')}
                >
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm">Financeiro</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate('/banners')}
                >
                  <Image className="h-6 w-6" />
                  <span className="text-sm">Banners</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate('/contratos/novo')}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Novo Contrato</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate('/veiculos')}
                >
                  <Bike className="h-6 w-6" />
                  <span className="text-sm">Ver Veículos</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate('/pagamentos')}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm">Pagamentos</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => navigate('/propostas')}
                >
                  <ClipboardList className="h-6 w-6" />
                  <span className="text-sm">Propostas</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}