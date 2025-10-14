import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalCustomers, useGlobalCustomerStats } from '@/presentation/hooks/useGlobalCustomers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Search, Eye, Edit, Ban, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/shared/utils/formatters';

export default function Clientes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const { customers, loading, error, refresh, suspendCustomer, activateCustomer } = useGlobalCustomers();
  const { stats, loading: loadingStats } = useGlobalCustomerStats();

  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.documentId.includes(searchTerm)
  );

  const handleSuspend = async () => {
    if (!suspendingId) return;

    try {
      await suspendCustomer(suspendingId);
      toast.success('Cliente suspenso com sucesso');
      setSuspendingId(null);
    } catch (error) {
      toast.error(`Erro ao suspender cliente: ${(error as Error).message}`);
    }
  };

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    try {
      await activateCustomer(id);
      toast.success('Cliente ativado com sucesso');
    } catch (error) {
      toast.error(`Erro ao ativar cliente: ${(error as Error).message}`);
    } finally {
      setActivatingId(null);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar clientes: {error.message}
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes da plataforma
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar por nome, e-mail ou CPF..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loadingStats ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats?.total || 0}</div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loadingStats ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{stats?.active || 0}</div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loadingStats ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{stats?.inactive || 0}</div>
                <p className="text-sm text-muted-foreground">Inativos</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loadingStats ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats?.totalContracts || 0}</div>
                <p className="text-sm text-muted-foreground">Total Contratos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Todos os clientes cadastrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum cliente encontrado com os filtros aplicados' : 'Nenhum cliente cadastrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Contratos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.fullName}</div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="font-mono">{customer.documentId}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-primary">{customer.contractsCount || 0}</span>
                      </TableCell>
                      <TableCell>
                        {customer.isActive !== false ? (
                          <Badge className="bg-success text-success-foreground">Ativo</Badge>
                        ) : (
                          <Badge variant="destructive">Suspenso</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/clientes/${customer.id}`)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/clientes/editar/${customer.id}`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {customer.isActive !== false ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSuspendingId(customer.id)}
                              title="Suspender"
                            >
                              <Ban className="h-4 w-4 text-warning" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleActivate(customer.id)}
                              disabled={activatingId === customer.id}
                              title="Ativar"
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={!!suspendingId} onOpenChange={() => setSuspendingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja suspender este cliente? 
              Ele não poderá mais acessar o sistema até que seja reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} className="bg-warning hover:bg-warning/90">
              Suspender
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


