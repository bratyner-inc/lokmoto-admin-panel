import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, User, FileText, CalendarIcon } from 'lucide-react';
import { CustomerRepository } from '@/data/repositories/CustomerRepository';
import { useCustomerWithLicense } from '@/presentation/hooks/useCustomers';
import { supabase } from '@/infrastructure/config/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const customerRepository = new CustomerRepository();

// Brazilian states
const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// CNH Categories
const CNH_CATEGORIES = ['A', 'B', 'AB', 'C', 'D', 'E'];

// Validation schema
const customerFormSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  documentId: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  // Driver License
  licenseNumber: z.string().min(11, 'Número da CNH inválido'),
  category: z.string().min(1, 'Selecione uma categoria'),
  expirationDate: z.date({
    required_error: 'Data de validade é obrigatória',
  }),
  issuingState: z.string().min(2, 'Selecione um estado'),
  issuingDate: z.date({
    required_error: 'Data de emissão é obrigatória',
  }),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export default function ClienteLojaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const isEditing = !!id;
  const { customer, loading: loadingCustomer } = useCustomerWithLicense(id || '');

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      documentId: '',
      licenseNumber: '',
      category: '',
      issuingState: '',
    },
  });

  // Load customer data when editing
  useEffect(() => {
    if (isEditing && customer && !loadingCustomer) {
      form.reset({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        documentId: customer.documentId,
        licenseNumber: customer.driverLicense?.licenseNumber || '',
        category: customer.driverLicense?.category || '',
        expirationDate: customer.driverLicense?.expirationDate,
        issuingState: customer.driverLicense?.issuingState || '',
        issuingDate: customer.driverLicense?.issuingDate,
      });
    }
  }, [isEditing, customer, loadingCustomer, form]);

  // Get authenticated user
  useEffect(() => {
    const getAuthUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthUserId(user.id);
      }
    };
    getAuthUser();
  }, []);

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && id) {
        // Update existing customer
        await customerRepository.update(id, {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          documentId: data.documentId,
        });

        // Update driver license if exists
        if (customer?.driverLicense) {
          await customerRepository.updateDriverLicense(customer.driverLicense.id, {
            licenseNumber: data.licenseNumber,
            category: data.category,
            expirationDate: data.expirationDate,
            issuingState: data.issuingState,
            issuingDate: data.issuingDate,
          });
        } else {
          // Create driver license if doesn't exist
          await customerRepository.createDriverLicense({
            customerId: id,
            licenseNumber: data.licenseNumber,
            category: data.category,
            expirationDate: data.expirationDate,
            issuingState: data.issuingState,
            issuingDate: data.issuingDate,
          });
        }

        toast({
          title: 'Cliente atualizado!',
          description: 'Dados do cliente e CNH atualizados com sucesso.',
        });
      } else {
        // Create new customer
        // First, create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: Math.random().toString(36).slice(-12), // Temporary password
          options: {
            data: {
              full_name: data.fullName,
              role: 'customer',
            },
          },
        });

        if (authError || !authData.user) {
          throw new Error(`Erro ao criar usuário: ${authError?.message}`);
        }

        // Create customer in database
        const newCustomer = await customerRepository.create({
          id: authData.user.id,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          documentId: data.documentId,
        });

        // Create driver license
        await customerRepository.createDriverLicense({
          customerId: newCustomer.id,
          licenseNumber: data.licenseNumber,
          category: data.category,
          expirationDate: data.expirationDate,
          issuingState: data.issuingState,
          issuingDate: data.issuingDate,
        });

        toast({
          title: 'Cliente cadastrado!',
          description: 'Cliente e CNH cadastrados com sucesso.',
        });
      }

      navigate('/clientes-loja');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Erro ao salvar',
        description: error instanceof Error ? error.message : 'Não foi possível salvar o cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing && loadingCustomer) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados do cliente...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/clientes-loja')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados do cliente' : 'Cadastre um novo cliente e sua CNH'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
              <CardDescription>Informações pessoais do cliente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" {...field} />
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
                        <Input type="email" placeholder="joao@email.com" {...field} />
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
                        <Input placeholder="11999999999" {...field} />
                      </FormControl>
                      <FormDescription>Apenas números (DDD + número)</FormDescription>
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
                      <Input placeholder="12345678900" {...field} />
                    </FormControl>
                    <FormDescription>Apenas números</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Driver License Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados da CNH
              </CardTitle>
              <CardDescription>Carteira Nacional de Habilitação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da CNH</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CNH_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issuingState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de Emissão</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BRAZILIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Emissão</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Validade</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>A CNH deve estar válida</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clientes-loja')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

