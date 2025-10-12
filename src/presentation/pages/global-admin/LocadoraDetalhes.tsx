import { useNavigate, useParams } from 'react-router-dom';
import { useRentalCompany } from '@/presentation/hooks/useRentalCompanies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  CreditCard,
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { formatDate } from '@/shared/utils/formatters';

const statusColors: Record<string, string> = {
  active: 'bg-success text-success-foreground',
  inactive: 'bg-muted text-muted-foreground',
  pending: 'bg-warning text-warning-foreground',
  canceled: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<string, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  pending: 'Pendente',
  canceled: 'Cancelada',
};

export default function LocadoraDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { company, loading, error } = useRentalCompany(id || '');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar locadora: {error?.message || 'Locadora não encontrada'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/locadoras')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{company.companyName}</h1>
            <p className="text-muted-foreground">{company.tradingName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[company.subscriptionStatus]}>
            {statusLabels[company.subscriptionStatus]}
          </Badge>
          <Button onClick={() => navigate(`/locadoras/editar/${company.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
          <TabsTrigger value="bancarios">Dados Bancários</TabsTrigger>
        </TabsList>

        {/* Dados Gerais */}
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Dados cadastrais da locadora
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                  <p className="text-base font-medium mt-1">{company.tradingName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                  <p className="text-base font-medium mt-1">{company.companyName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-medium">{company.cnpj}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-medium">{company.email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-medium">{company.phone}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-medium">{formatDate(company.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assinatura */}
        <TabsContent value="assinatura">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações da Assinatura
              </CardTitle>
              <CardDescription>
                Plano e status da assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-2">
                    <Badge className={statusColors[company.subscriptionStatus]}>
                      {statusLabels[company.subscriptionStatus]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plano</label>
                  <p className="text-base font-medium mt-1">
                    {company.subscriptionPlan || 'Não definido'}
                  </p>
                </div>

                {company.subscriptionExpiration && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Vencimento</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base font-medium">
                        {formatDate(company.subscriptionExpiration)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados Bancários */}
        <TabsContent value="bancarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
              <CardDescription>
                Conta para repasses e pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.bankAccount ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Banco</label>
                    <p className="text-base font-medium mt-1">{company.bankAccount.bankCode}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agência</label>
                    <p className="text-base font-medium mt-1">{company.bankAccount.agency}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Conta</label>
                    <p className="text-base font-medium mt-1">{company.bankAccount.account}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma conta bancária cadastrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


