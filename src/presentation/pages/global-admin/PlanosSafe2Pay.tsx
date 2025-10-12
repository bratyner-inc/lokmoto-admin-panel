import { useSafe2PayPlans } from '@/presentation/hooks/useSafe2PayPlans';
import { useSyncSafe2PayPlans } from '@/presentation/hooks/useSyncSafe2PayPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  RefreshCw, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Calendar,
  TrendingUp 
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/shared/utils/formatters';

export default function PlanosSafe2Pay() {
  const { plans, loading, error, refresh } = useSafe2PayPlans();
  const { syncPlans, syncing } = useSyncSafe2PayPlans();

  const handleSync = async () => {
    try {
      const result = await syncPlans();
      toast.success(
        `Sincronização completa! ${result.inserted} novos, ${result.updated} atualizados, ${result.deprecated} desativados`
      );
      refresh(); // Atualizar lista após sincronização
    } catch (error) {
      toast.error(`Erro ao sincronizar planos: ${(error as Error).message}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar planos: {error.message}
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
          <h1 className="text-3xl font-bold tracking-tight">Planos Safe2Pay</h1>
          <p className="text-muted-foreground">
            Sincronize e visualize os planos de assinatura disponíveis
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing || loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Planos'}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            Sobre os Planos
          </CardTitle>
          <CardDescription>
            Os planos são sincronizados diretamente da API Safe2Pay. Use o botão "Sincronizar Planos" para atualizar a lista.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{plans.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Planos disponíveis
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold text-success">
                  {plans.filter(p => p.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponíveis para uso
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-sm font-medium">
                  {plans[0]?.syncedAt ? formatDate(plans[0].syncedAt) : 'Nunca'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Data da última atualização
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planos List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Planos Cadastrados ({plans.length})
          </CardTitle>
          <CardDescription>
            Visualize todos os planos sincronizados da Safe2Pay
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum plano sincronizado ainda
              </p>
              <Button onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                Sincronizar Agora
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome do Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Frequência</TableHead>
                    <TableHead>Limite de Assinaturas</TableHead>
                    <TableHead>Assinaturas Ativas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map(plan => (
                    <TableRow key={plan.idPlan}>
                      <TableCell className="font-mono">{plan.idPlan}</TableCell>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">R$ {plan.amount.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{plan.frequence}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{plan.subscriptionLimit}</TableCell>
                      <TableCell className="text-center">{plan.quantitySubscription}</TableCell>
                      <TableCell>
                        {plan.isActive ? (
                          <Badge className="bg-success text-success-foreground">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


