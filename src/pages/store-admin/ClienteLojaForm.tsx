import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useStoreCustomers, useStoreCustomer } from '@/hooks/useStoreCustomers';
import { 
  User, 
  ArrowLeft, 
  Save,
  Loader2
} from 'lucide-react';

const customerSchema = z.object({
  fullName: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  phone: z.string()
    .trim()
    .min(10, 'Telefone deve ter pelo menos 10 caracteres')
    .max(20, 'Telefone deve ter no máximo 20 caracteres'),
  documentId: z.string()
    .trim()
    .min(11, 'CPF deve ter pelo menos 11 caracteres')
    .max(14, 'CPF deve ter no máximo 14 caracteres'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function ClienteLojaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  
  const { createCustomer, isCreating } = useStoreCustomers();
  const { customer, isLoading: isLoadingCustomer, updateCustomer, isUpdating } = 
    useStoreCustomer(id || '');

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    values: customer ? {
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      documentId: customer.documentId,
    } : undefined,
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEdit) {
        await updateCustomer(data);
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram salvas com sucesso.",
        });
      } else {
        // Para criar, precisamos de um ID (UUID do usuário)
        const customerData: Omit<typeof customer, 'createdAt' | 'updatedAt'> = {
          id: crypto.randomUUID(), // Temporário - deve ser o ID do usuário autenticado
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          documentId: data.documentId,
        };
        await createCustomer(customerData as any);
        toast({
          title: "Cliente cadastrado",
          description: "O cliente foi cadastrado com sucesso.",
        });
      }
      
      navigate('/clientes-loja');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar o cliente.",
        variant: "destructive",
      });
    }
  };

  if (isEdit && isLoadingCustomer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEdit && !customer) {
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

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(isEdit ? `/clientes-loja/${id}` : '/clientes-loja')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Edite as informações do cliente' : 'Cadastre um novo cliente'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(isEdit ? `/clientes-loja/${id}` : '/clientes-loja')}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
              <CardDescription>
                Preencha as informações do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="exemplo@email.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 98765-4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
