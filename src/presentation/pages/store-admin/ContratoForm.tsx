import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, FileText, CalendarIcon, User, Car, DollarSign, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useProposals } from '@/presentation/hooks/useProposals';
import { useAuth } from '@/hooks/useAuth';
import { ContractRepository } from '@/data/repositories/ContractRepository';
import { formatCurrency } from '@/shared/utils/formatters';

const contractSchema = z.object({
  proposalId: z.string().min(1, 'Proposta é obrigatória'),
  startDate: z.date({ required_error: 'Data de início é obrigatória' }),
  endDate: z.date().optional(),
  paymentDay: z.number().min(1, 'Dia de pagamento deve ser entre 1 e 28').max(28, 'Dia de pagamento deve ser entre 1 e 28'),
  notes: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

const contractRepository = new ContractRepository();

export default function ContratoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { proposals, loading: loadingProposals } = useProposals();
  
  // Filter only accepted proposals without contracts
  const availableProposals = proposals.filter(p => 
    p.status === 'accepted' && !p.contractId
  );

  const isEditing = Boolean(id);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      proposalId: '',
      startDate: new Date(),
      endDate: undefined,
      paymentDay: 5, // Default to 5th day of month
      notes: '',
    },
  });

  const selectedProposalId = form.watch('proposalId');
  const selectedProposal = availableProposals.find(p => p.id === selectedProposalId);

  const onSubmit = async (data: ContractFormData) => {
    if (!selectedProposal || !user?.id) {
      toast({
        title: 'Erro',
        description: 'Proposta não encontrada ou usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedProposal.monthlyValue) {
      toast({
        title: 'Erro',
        description: 'A proposta selecionada não possui valor mensal definido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await contractRepository.create({
        proposalId: data.proposalId,
        motorcycleId: selectedProposal.motorcycleId,
        customerId: selectedProposal.customerId,
        startDate: data.startDate,
        endDate: data.endDate || null,
        monthlyValue: selectedProposal.monthlyValue,
        paymentDay: data.paymentDay,
        notes: data.notes || null,
      }, user.id);
      
      toast({
        title: 'Contrato criado!',
        description: 'Contrato de assinatura criado com sucesso.',
      });
      
      navigate('/contratos');
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar o contrato.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/contratos')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Edite as informações do contrato' : 'Crie um novo contrato de assinatura a partir de uma proposta aprovada'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Proposal Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Proposta
                  </CardTitle>
                  <CardDescription>
                    Selecione a proposta aceita para criar o contrato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="proposalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposta Aprovada *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={loadingProposals}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma proposta aceita" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableProposals.length === 0 ? (
                              <SelectItem value="none" disabled>
                                Nenhuma proposta aceita disponível
                              </SelectItem>
                            ) : (
                              availableProposals.map((proposal) => (
                                <SelectItem key={proposal.id} value={proposal.id}>
                                  {proposal.proposalNumber} - {proposal.monthlyValue ? formatCurrency(proposal.monthlyValue) + '/mês' : 'Valor não definido'}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Apenas propostas aceitas e sem contrato são listadas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedProposal && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg space-y-3">
                      <div className="font-semibold text-lg">Detalhes da Proposta</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Número</div>
                          <div className="font-medium">{selectedProposal.proposalNumber}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Valor Mensal</div>
                          <div className="font-medium text-primary text-lg">
                            {formatCurrency(selectedProposal.monthlyValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contract Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Detalhes do Contrato
                  </CardTitle>
                  <CardDescription>
                    Configure as datas e pagamento do contrato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Start Date */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Início *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'pl-3 text-left font-normal',
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
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Data de início da vigência do contrato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Date (Optional) */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Término (Opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ptBR })
                                ) : (
                                  <span>Contrato indeterminado</span>
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
                              disabled={(date) =>
                                date < (form.getValues('startDate') || new Date())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Deixe em branco para contratos por tempo indeterminado
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Day */}
                  <FormField
                    control={form.control}
                    name="paymentDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do Pagamento *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={28}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Dia do mês para cobrança recorrente (1-28)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                  <CardDescription>
                    Adicione notas adicionais ao contrato (opcional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações sobre o contrato..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProposal ? (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Valor Mensal</div>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(selectedProposal.monthlyValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Proposta</div>
                        <div className="font-mono text-sm">{selectedProposal.proposalNumber}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Selecione uma proposta para ver o resumo
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !selectedProposal}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Contrato' : 'Criar Contrato')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/contratos')}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

