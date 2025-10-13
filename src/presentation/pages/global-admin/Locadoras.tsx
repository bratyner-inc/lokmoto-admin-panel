import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRentalCompanies } from '@/presentation/hooks/useRentalCompanies';
import { SubscriptionStatus } from '@/domain/repositories/IRentalCompanyRepository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Building2, 
  Eye, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  AlertCircle,
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<SubscriptionStatus, string> = {
  active: 'bg-success text-success-foreground',
  inactive: 'bg-muted text-muted-foreground',
  pending: 'bg-warning text-warning-foreground',
  canceled: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<SubscriptionStatus, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  pending: 'Pendente',
  canceled: 'Cancelada',
};

export default function Locadoras() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspending, setSuspending] = useState(false);

  const { companies, loading, error, refresh, deleteCompany, suspendCompany, activateCompany } = useRentalCompanies(filterStatus);

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.tradingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCompany(deleteId);
      toast.success('Locadora excluída com sucesso');
      setDeleteId(null);
    } catch (error) {
      toast.error(`Erro ao excluir locadora: ${(error as Error).message}`);
    }
  };

  const handleOpenSuspendModal = (id: string) => {
    setSuspendId(id);
    setSuspendReason('');
  };

  const handleConfirmSuspend = async () => {
    if (!suspendId) return;
    
    if (!suspendReason || suspendReason.trim().length < 10) {
      toast.error('Motivo da suspensão deve ter no mínimo 10 caracteres');
      return;
    }

    setSuspending(true);
    try {
      await suspendCompany(suspendId, suspendReason.trim());
      toast.success('Locadora suspensa com sucesso');
      setSuspendId(null);
      setSuspendReason('');
    } catch (error) {
      toast.error(`Erro ao suspender locadora: ${(error as Error).message}`);
    } finally {
      setSuspending(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateCompany(id);
      toast.success('Locadora ativada com sucesso');
    } catch (error) {
      toast.error(`Erro ao ativar locadora: ${(error as Error).message}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar locadoras: {error.message}
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
          <h1 className="text-3xl font-bold tracking-tight">Locadoras</h1>
          <p className="text-muted-foreground">
            Gerencie todas as locadoras da plataforma
          </p>
        </div>
        <Button onClick={() => navigate('/locadoras/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Locadora
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Busque e filtre locadoras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Nome, CNPJ, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select 
                value={filterStatus || 'all'} 
                onValueChange={(value) => setFilterStatus(value === 'all' ? undefined : value as SubscriptionStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                  <SelectItem value="canceled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locadoras List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Locadoras Cadastradas ({filteredCompanies.length})
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todas as locadoras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterStatus ? 'Nenhuma locadora encontrada com os filtros aplicados' : 'Nenhuma locadora cadastrada'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map(company => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{company.companyName}</p>
                          <p className="text-xs text-muted-foreground">{company.tradingName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{company.cnpj}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[company.subscriptionStatus]}>
                          {statusLabels[company.subscriptionStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.subscriptionPlan ? (
                          <span className="text-sm">{company.subscriptionPlan}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Não definido</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/locadoras/${company.id}`)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/locadoras/editar/${company.id}`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {company.subscriptionStatus === 'active' || !company.isSuspended ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenSuspendModal(company.id)}
                              title="Suspender Acesso"
                            >
                              <Ban className="h-4 w-4 text-warning" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleActivate(company.id)}
                              title="Reativar Acesso"
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(company.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
      <Dialog open={!!suspendId} onOpenChange={() => {
        setSuspendId(null);
        setSuspendReason('');
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-warning" />
              Suspender Acesso da Locadora
            </DialogTitle>
            <DialogDescription>
              O lojista ficará impedido de acessar a plataforma até que o acesso seja reativado.
              É obrigatório informar o motivo da suspensão.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason" className="text-sm font-medium">
                Motivo da Suspensão *
              </Label>
              <Textarea
                id="suspend-reason"
                placeholder="Descreva o motivo da suspensão (mínimo 10 caracteres)..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {suspendReason.length}/10 caracteres mínimos
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Atenção:</strong> O lojista não terá acesso ao motivo da suspensão.
                Ele será informado apenas que sua conta foi suspensa e deverá entrar em contato com o suporte.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSuspendId(null);
                setSuspendReason('');
              }}
              disabled={suspending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmSuspend}
              disabled={suspending || !suspendReason || suspendReason.trim().length < 10}
            >
              {suspending ? 'Suspendendo...' : 'Confirmar Suspensão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a locadora
              e todos os dados relacionados (motos, contratos, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


