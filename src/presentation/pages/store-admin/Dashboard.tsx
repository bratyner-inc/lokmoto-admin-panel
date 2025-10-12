import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { useTicketStats } from '@/presentation/hooks/useTickets';
import { useMaintenanceStats } from '@/presentation/hooks/useMaintenance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Car, 
  FileText, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  CreditCard,
  ClipboardList,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Ticket,
  Package,
  Loader2,
  Wrench
} from 'lucide-react';
import { UserRole } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading, error, refresh } = useDashboard();
  const { stats: ticketStats, loading: loadingTickets } = useTicketStats();
  const { stats: maintenanceStats, loading: loadingMaintenance } = useMaintenanceStats();
  
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

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.name}! Aqui está um resumo da sua {user?.role === UserRole.GLOBAL_ADMIN ? 'administração global' : 'loja'}.
          </p>
        </div>
        {!loading && (
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        )}
      </div>

      {/* 📊 SEÇÃO: CLIENTES E SUPORTE */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Clientes & Suporte</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Clients */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">{stats?.totalClients.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.totalClients === 0 
                      ? 'Aguardando propostas' 
                      : 'Clientes ativos'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-success">{stats?.activeContracts || '0'}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Gerando receita mensal
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tickets Abertos */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingTickets ? (
                <>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-warning">{ticketStats?.open || '0'}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {ticketStats?.inProgress || 0} em andamento
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tickets Resolvidos */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Fechados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingTickets ? (
                <>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-success">{ticketStats?.closed || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total de {ticketStats?.total || 0} tickets
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* 💰 SEÇÃO: FINANCEIRO */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-success" />
          <h2 className="text-xl font-semibold">Financeiro</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-success">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pagamentos recebidos
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-warning">{formatCurrency(stats?.pendingPayments || 0)}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Aguardando recebimento
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Receita Média por Contrato */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Média</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(stats?.activeContracts ? (stats.monthlyRevenue / stats.activeContracts) : 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por contrato ativo
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* 📦 SEÇÃO: ESTOQUE */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Estoque de Veículos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Vehicles */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">{stats?.totalVehicles || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Motos no estoque
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Vehicles Available */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motos Disponíveis</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-success">{stats?.availableVehicles || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalVehicles ? 
                      `${Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}% do estoque` 
                      : 'Nenhuma moto cadastrada'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Occupancy Rate */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-500">
                    {stats?.totalVehicles ? 
                      `${Math.round(((stats.totalVehicles - stats.availableVehicles) / stats.totalVehicles) * 100)}%` 
                      : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    {stats?.activeContracts || 0} de {stats?.totalVehicles || 0} alugadas
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* 🔧 SEÇÃO: MANUTENÇÃO */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold">Manutenção</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Maintenances */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Manutenções</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-primary">{maintenanceStats?.total || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registros totais
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Maintenances */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-warning">{maintenanceStats?.byStatus.agendada || '0'}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Aguardando execução
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-500">{maintenanceStats?.byStatus.em_andamento || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sendo executadas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Costs */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-destructive">
                    {formatCurrency(maintenanceStats?.costs.total || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gastos com manutenção
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-success">{maintenanceStats?.byStatus.concluida || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Finalizadas com sucesso
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preventive */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preventivas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-500">{maintenanceStats?.byType.preventiva || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manutenções preventivas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Corrective */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corretivas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-orange-500">{maintenanceStats?.byType.corretiva || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manutenções corretivas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Accidents */}
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sinistros</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMaintenance ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-500">{maintenanceStats?.byType.sinistro || '0'}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Acidentes/Sinistros
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Visão Geral Financeira
            </CardTitle>
            <CardDescription>
              Estatísticas de receitas e contratos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-6">
                {/* Simple Visual Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Recebido</span>
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {formatCurrency(stats?.monthlyRevenue || 0)}
                    </div>
                    <div className="mt-2 h-2 bg-success/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all"
                        style={{ 
                          width: `${stats?.monthlyRevenue && stats?.pendingPayments ? 
                            (stats.monthlyRevenue / (stats.monthlyRevenue + stats.pendingPayments) * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Pendente</span>
                      <Clock className="h-4 w-4 text-warning" />
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      {formatCurrency(stats?.pendingPayments || 0)}
                    </div>
                    <div className="mt-2 h-2 bg-warning/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning rounded-full transition-all"
                        style={{ 
                          width: `${stats?.monthlyRevenue && stats?.pendingPayments ? 
                            (stats.pendingPayments / (stats.monthlyRevenue + stats.pendingPayments) * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contract Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Contratos Ativos</p>
                        <p className="text-xs text-muted-foreground">Gerando receita mensal</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {stats?.activeContracts || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Car className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Motos Disponíveis</p>
                        <p className="text-xs text-muted-foreground">Prontas para alugar</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-500">
                      {stats?.availableVehicles || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Users className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total de Clientes</p>
                        <p className="text-xs text-muted-foreground">Com propostas enviadas</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-500">
                      {stats?.totalClients || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <Ticket className="h-4 w-4 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tickets Pendentes</p>
                        <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      {loadingTickets ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        (ticketStats?.open || 0) + (ticketStats?.inProgress || 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Comece adicionando motos e recebendo propostas
                </p>
              </div>
            )}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/contratos/novo">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Novo Contrato</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/veiculos/novo">
                <Car className="h-6 w-6" />
                <span className="text-sm">Adicionar Moto</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/pagamentos">
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Ver Pagamentos</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/tickets/novo">
                <Ticket className="h-6 w-6" />
                <span className="text-sm">Novo Ticket</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/propostas">
                <ClipboardList className="h-6 w-6" />
                <span className="text-sm">Ver Propostas</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
