import { useGlobalDashboard } from '@/presentation/hooks/useGlobalDashboard';
import { useExpiringSubscriptions } from '@/presentation/hooks/useRentalCompanies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Users 
} from 'lucide-react';

export default function GlobalAdminDashboard() {
  const { stats, loading, error, refresh } = useGlobalDashboard();
  const { companies: expiringCompanies, loading: loadingExpiring } = useExpiringSubscriptions(7);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Global</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Global</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma Lokmoto
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Locadoras */}
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locadoras</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registradas na plataforma
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Locadoras Ativas */}
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-success">{stats?.activeCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Assinaturas ativas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Locadoras Inativas */}
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">{stats?.inactiveCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Suspensas ou canceladas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Locadoras Pendentes */}
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-warning">{stats?.pendingCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando aprovação
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assinaturas Expirando */}
        <Card className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirando</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">{stats?.expiringSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Próximos 7 dias
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring Subscriptions Alert */}
      {!loadingExpiring && expiringCompanies.length > 0 && (
        <Card className="border-warning shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              Assinaturas Próximas ao Vencimento
            </CardTitle>
            <CardDescription>
              As seguintes locadoras têm assinaturas expirando nos próximos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringCompanies.map(company => (
                <div key={company.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{company.companyName}</p>
                      <p className="text-sm text-muted-foreground">{company.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-warning text-warning">
                    Expira em {company.subscriptionExpiration ? 
                      Math.ceil((company.subscriptionExpiration.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
                      : '?'} dias
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <a
              href="/locadoras"
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Users className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Gerenciar Locadoras</span>
            </a>
            <a
              href="/locadoras/novo"
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Building2 className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Nova Locadora</span>
            </a>
            <a
              href="/planos-safe2pay"
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Planos Safe2Pay</span>
            </a>
            <button
              onClick={refresh}
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <CheckCircle className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Atualizar Dados</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


