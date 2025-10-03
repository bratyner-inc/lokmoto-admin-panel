import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useRentalCompany } from '@/hooks/useRentalCompanies';
import { 
  ArrowLeft, 
  Edit, 
  Building2, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';

export default function ClienteDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: company, isLoading, error } = useRentalCompany(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Locadora não encontrada</p>
        <Button onClick={() => navigate('/admin/clientes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/clientes')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              {company.companyName}
            </h1>
            <p className="text-muted-foreground">
              Cliente desde {new Date(company.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={
            company.subscriptionStatus === 'active' ? 'default' :
            company.subscriptionStatus === 'pending' ? 'secondary' :
            'destructive'
          }>
            {company.subscriptionStatus === 'active' ? 'Ativo' :
             company.subscriptionStatus === 'pending' ? 'Pendente' :
             company.subscriptionStatus === 'canceled' ? 'Cancelado' : 'Inativo'}
          </Badge>
          <Button 
            onClick={() => navigate(`/admin/clientes/${company.id}/editar`)}
            className="bg-primary hover:bg-primary-dark"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Locadora
          </Button>
        </div>
      </div>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome Fantasia</Label>
                <p className="font-medium">{company.companyName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Razão Social</Label>
                <p>{company.tradingName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                <p>{company.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                <p>{company.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">CNPJ</Label>
                <p className="font-mono">{company.cnpj}</p>
              </div>
            </div>

            {company.subscriptionPlan && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Plano de Assinatura</Label>
                  <p>{company.subscriptionPlan}</p>
                </div>
              </div>
            )}

            {company.subscriptionExpiration && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Vencimento da Assinatura</Label>
                  <p>{new Date(company.subscriptionExpiration).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Cadastrado em</Label>
                <p>{new Date(company.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Última Atualização</Label>
                <p>{new Date(company.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
