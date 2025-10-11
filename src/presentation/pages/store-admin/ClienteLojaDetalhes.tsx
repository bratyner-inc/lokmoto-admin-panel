import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useCustomerWithLicense } from '@/presentation/hooks/useCustomers';
import { formatCPF, formatPhone } from '@/shared/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { CustomerRepository } from '@/data/repositories/CustomerRepository';
import { useState } from 'react';
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

const customerRepository = new CustomerRepository();

export default function ClienteLojaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customer, loading, error } = useCustomerWithLicense(id || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await customerRepository.delete(id);
      toast({
        title: 'Cliente excluído!',
        description: 'Cliente removido com sucesso.',
      });
      navigate('/clientes-loja');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Erro ao excluir',
        description: error instanceof Error ? error.message : 'Não foi possível excluir o cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados do cliente...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Erro ao carregar cliente: {error?.message || 'Cliente não encontrado'}</p>
              <Button onClick={() => navigate('/clientes-loja')} className="mt-4">
                Voltar para lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if CNH is expired
  const isCNHExpired = customer.driverLicense 
    ? new Date(customer.driverLicense.expirationDate) < new Date()
    : false;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/clientes-loja')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              {customer.fullName}
            </h1>
            <p className="text-muted-foreground">Detalhes do cliente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/clientes-loja/editar/${id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Nome Completo</div>
                  <div className="text-base font-medium">{customer.fullName}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">CPF</div>
                  <div className="text-base font-mono">{formatCPF(customer.documentId)}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="text-base">{customer.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Telefone</div>
                    <div className="text-base">{formatPhone(customer.phone)}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Cadastrado em</div>
                    <div className="text-base">
                      {customer.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Última atualização</div>
                    <div className="text-base">
                      {customer.updatedAt.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Driver License */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Carteira Nacional de Habilitação (CNH)
                  </CardTitle>
                  <CardDescription>Dados da habilitação do cliente</CardDescription>
                </div>
                {customer.driverLicense && (
                  <Badge 
                    variant={isCNHExpired ? 'destructive' : 'default'} 
                    className={isCNHExpired ? '' : 'bg-success text-white'}
                  >
                    {isCNHExpired ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Vencida
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Válida
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {customer.driverLicense ? (
                <div className="space-y-4">
                  {isCNHExpired && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                          <div className="font-semibold">CNH Vencida</div>
                          <div className="text-sm">A CNH deste cliente está vencida e precisa ser renovada.</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Número da CNH</div>
                      <div className="text-base font-mono">{customer.driverLicense.licenseNumber}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Categoria</div>
                      <Badge variant="outline" className="text-base">
                        {customer.driverLicense.category}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Estado de Emissão</div>
                        <div className="text-base font-semibold">{customer.driverLicense.issuingState}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Data de Emissão</div>
                        <div className="text-base">
                          {customer.driverLicense.issuingDate.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Data de Validade</div>
                      <div className={`text-base font-semibold ${isCNHExpired ? 'text-destructive' : 'text-success'}`}>
                        {customer.driverLicense.expirationDate.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma CNH cadastrada para este cliente.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(`/clientes-loja/editar/${id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Adicionar CNH
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-success text-white">
                  Ativo
                </Badge>
              </div>
              
              {customer.driverLicense && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CNH</span>
                  <Badge 
                    variant={isCNHExpired ? 'destructive' : 'default'}
                    className={isCNHExpired ? '' : 'bg-success text-white'}
                  >
                    {isCNHExpired ? 'Vencida' : 'Válida'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estatísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contratos Ativos</span>
                <span className="text-lg font-bold text-primary">0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Contratos</span>
                <span className="text-lg font-bold">0</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/propostas/novo')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Nova Proposta
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/clientes-loja/editar/${id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Dados
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{customer.fullName}</strong>?
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

