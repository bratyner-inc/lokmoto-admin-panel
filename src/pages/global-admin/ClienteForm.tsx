import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save, Building2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRentalCompany, useCreateRentalCompany, useUpdateRentalCompany } from '@/hooks/useRentalCompanies';
import { RentalCompany } from '@/domain/entities/RentalCompany';

const companyFormSchema = z.object({
  companyName: z.string().min(3, 'Nome fantasia deve ter no mínimo 3 caracteres'),
  tradingName: z.string().min(3, 'Razão social deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  subscriptionStatus: z.enum(['active', 'inactive', 'pending', 'canceled']),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

// Funções de formatação
const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export default function ClienteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = Boolean(id);

  const { data: company, isLoading: isLoadingCompany } = useRentalCompany(id || '');
  const createMutation = useCreateRentalCompany();
  const updateMutation = useUpdateRentalCompany();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: isEdit && company ? {
      companyName: company.companyName,
      tradingName: company.tradingName,
      email: company.email,
      phone: company.phone,
      cnpj: company.cnpj,
      subscriptionStatus: company.subscriptionStatus,
    } : {
      companyName: '',
      tradingName: '',
      email: '',
      phone: '',
      cnpj: '',
      subscriptionStatus: 'pending',
    },
  });

  React.useEffect(() => {
    if (company && isEdit) {
      form.reset({
        companyName: company.companyName,
        tradingName: company.tradingName,
        email: company.email,
        phone: company.phone,
        cnpj: company.cnpj,
        subscriptionStatus: company.subscriptionStatus,
      });
    }
  }, [company, isEdit, form]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ 
          id, 
          data: data as Partial<RentalCompany>
        });
        toast({
          title: "Locadora atualizada",
          description: "As informações da locadora foram atualizadas com sucesso.",
        });
      } else {
        await createMutation.mutateAsync({
          id: crypto.randomUUID(),
          companyName: data.companyName,
          tradingName: data.tradingName,
          email: data.email,
          phone: data.phone,
          cnpj: data.cnpj,
          subscriptionStatus: data.subscriptionStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as RentalCompany);
        toast({
          title: "Locadora criada",
          description: "A nova locadora foi cadastrada com sucesso.",
        });
      }
      
      navigate('/admin/clientes');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a locadora.",
        variant: "destructive",
      });
    }
  };

  if (isEdit && isLoadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEdit && !company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
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
            {isEdit ? 'Editar Locadora' : 'Nova Locadora'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Atualize as informações da locadora' : 'Preencha os dados da nova locadora'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações básicas da locadora
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Moto Rent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradingName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Moto Rent Locações LTDA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contato@motorent.com" {...field} />
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
                        <Input 
                          placeholder="(11) 99999-9999" 
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00.000.000/0000-00" 
                          {...field}
                          onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                          maxLength={18}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscriptionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status da Assinatura</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          {...field}
                        >
                          <option value="pending">Pendente</option>
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                          <option value="canceled">Cancelado</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/clientes')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="bg-primary hover:bg-primary-dark"
            >
              {(form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Atualizar Locadora' : 'Criar Locadora'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
