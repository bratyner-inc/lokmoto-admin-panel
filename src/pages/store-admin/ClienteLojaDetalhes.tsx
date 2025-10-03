import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStoreCustomer } from '@/hooks/useStoreCustomers';
import { 
  User, 
  ArrowLeft, 
  Edit, 
  Loader2,
  Mail,
  Phone,
  CreditCard,
  Calendar
} from 'lucide-react';

export default function ClienteLojaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customer, isLoading, error } = useStoreCustomer(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <User className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Cliente não encontrado</p>
        <Button onClick={() => navigate('/clientes-loja')}>
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
            variant="outline" 
            size="sm"
            onClick={() => navigate('/clientes-loja')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              {customer.fullName}
            </h1>
            <p className="text-muted-foreground">
              Detalhes do cliente
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/clientes-loja/${customer.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="default" className="bg-success text-white">Cliente Ativo</Badge>
            <p className="text-sm text-muted-foreground mt-2">Status Atual</p>
          </div>
        </CardContent>
      </Card>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-muted-foreground">Nome Completo</div>
                <div className="font-medium">{customer.fullName}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium">{customer.email}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-muted-foreground">Telefone</div>
                <div className="font-medium">{customer.phone}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-muted-foreground">CPF</div>
                <div className="font-mono font-medium">{customer.documentId}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-muted-foreground">Cadastrado em</div>
                <div className="font-medium">
                  {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-muted-foreground">Última Atualização</div>
                <div className="font-medium">
                  {new Date(customer.updatedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
