import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useCustomer } from '@/hooks/useCustomers';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';

export default function ClienteDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: customer, isLoading, error } = useCustomer(id || '');

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
        <Button onClick={() => navigate('/clientes')}>
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
            onClick={() => navigate('/clientes')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              {customer.fullName}
            </h1>
            <p className="text-muted-foreground">
              Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="bg-success text-white">Cliente Ativo</Badge>
          <Button 
            onClick={() => navigate(`/clientes/${customer.id}/editar`)}
            className="bg-primary hover:bg-primary-dark"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Cliente
          </Button>
        </div>
      </div>

      {/* Client Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">{customer.fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                <p>{customer.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                <p>{customer.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                <p className="font-mono">{customer.documentId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Cadastrado em</Label>
                <p>{new Date(customer.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Última Atualização</Label>
                <p>{new Date(customer.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}