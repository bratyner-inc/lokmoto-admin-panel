import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, CreditCard, CalendarIcon } from 'lucide-react';
import { TransactionRepository } from '@/data/repositories/TransactionRepository';
import { ContractRepository } from '@/data/repositories/ContractRepository';
import { useContracts } from '@/presentation/hooks/useContracts';
import { supabase } from '@/infrastructure/config/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PaymentMethod, TransactionType } from '@/domain/entities/Transaction';

const transactionRepository = new TransactionRepository();
const contractRepository = new ContractRepository();

// Validation schema
const paymentFormSchema = z.object({
  contractId: z.string().optional(),
  transactionType: z.enum(['rental_payment', 'platform_subscription']),
  paymentMethod: z.enum(['credit_card', 'boleto', 'pix']),
  amount: z.number().min(0.01, 'Valor deve ser maior que 0'),
  dueDate: z.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
  description: z.string().optional(),
  referenceMonth: z.number().min(1).max(12).optional(),
  referenceYear: z.number().min(2024).optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export default function PagamentoForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const { contracts } = useContracts();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      transactionType: 'rental_payment',
      paymentMethod: 'boleto',
      amount: 0,
      description: '',
    },
  });

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

  const onSubmit = async (data: PaymentFormData) => {
    if (!authUserId) {
      toast({
        title: 'Erro de autenticação',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get customer ID from contract if provided
      let customerId: string | undefined;
      if (data.contractId) {
        const contract = await contractRepository.getById(data.contractId);
        customerId = contract?.customerId;
      }

      await transactionRepository.create({
        contractId: data.contractId,
        rentalCompanyId: authUserId,
        customerId,
        transactionType: data.transactionType,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        dueDate: data.dueDate,
        description: data.description,
        referenceMonth: data.referenceMonth,
        referenceYear: data.referenceYear,
      }, authUserId);

      toast({
        title: 'Pagamento registrado!',
        description: 'Transação criada com sucesso.',
      });

      navigate('/pagamentos');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Erro ao criar pagamento',
        description: error instanceof Error ? error.message : 'Não foi possível criar o pagamento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get active contracts only
  const activeContracts = contracts.filter(c => c.status === 'active');

  // Calculate reference month/year from due date
  const watchDueDate = form.watch('dueDate');
  useEffect(() => {
    if (watchDueDate) {
      form.setValue('referenceMonth', watchDueDate.getMonth() + 1);
      form.setValue('referenceYear', watchDueDate.getFullYear());
    }
  }, [watchDueDate, form]);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/pagamentos')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registrar Pagamento</h1>
          <p className="text-muted-foreground">
            Crie uma transação manual de pagamento
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações do Pagamento
              </CardTitle>
              <CardDescription>Dados da transação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Transação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rental_payment">Pagamento de Aluguel</SelectItem>
                          <SelectItem value="platform_subscription">Assinatura da Plataforma</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="boleto">Boleto Bancário</SelectItem>
                          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contractId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrato (Opcional)</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Se selecionar "none", define como undefined
                        field.onChange(value === 'none' ? undefined : value);
                      }} 
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um contrato (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {activeContracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.contractNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Vincule a um contrato existente ou deixe em branco
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Vencimento</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Mensalidade de aluguel - Janeiro/2025"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descrição adicional para a transação
                    </FormDescription>
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
              onClick={() => navigate('/pagamentos')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Registrar Pagamento
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

