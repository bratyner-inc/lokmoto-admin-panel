import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  RefreshCw
} from 'lucide-react';
import { UserRole } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, loading, error, refresh } = useDashboard();
  
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

      {/* Stats Cards */}
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
                    ? 'Aguardando propostas de clientes' 
                    : 'Clientes únicos com propostas'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Vehicles */}
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
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
                <p className="text-xs text-muted-foreground">
                  <span className="text-success font-medium">{stats?.availableVehicles || 0} disponíveis</span>
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
                <div className="text-2xl font-bold text-muted-foreground">{stats?.activeContracts || '0'}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Não implementado
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
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
                <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Não implementado
                </p>
              </>
            )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/contratos">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Novo Contrato</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/veiculos">
                <Car className="h-6 w-6" />
                <span className="text-sm">Ver Veículos</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/pagamentos">
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Pagamentos</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <a href="/propostas">
                <ClipboardList className="h-6 w-6" />
                <span className="text-sm">Propostas</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

