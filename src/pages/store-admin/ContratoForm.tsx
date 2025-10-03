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
import { ArrowLeft, FileText, CalendarIcon, User, Car, DollarSign, Save, Upload, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthV2 } from '@/hooks/useAuthV2';
import { useCreateContract, useUpdateContract, useContract, uploadContractFile, deleteContractFile } from '@/hooks/useContracts';
import { useCustomers } from '@/hooks/useCustomers';
import { useMotorcycles } from '@/hooks/useMotorcycles';

const contractSchema = z.object({
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  motorcycleId: z.string().min(1, 'Veículo é obrigatório'),
  startDate: z.date({ required_error: 'Data de início é obrigatória' }),
  endDate: z.date({ required_error: 'Data de fim é obrigatória' }),
  dailyRate: z.number().min(1, 'Valor da diária deve ser maior que zero'),
  observations: z.string().optional(),
  contractFile: z.instanceof(File).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["endDate"],
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function ContratoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthV2();
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<any>(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  const isEditing = Boolean(id);

  const { data: customers = [] } = useCustomers();
  const { motorcycles = [] } = useMotorcycles();
  const { data: existingContract } = useContract(id || '');
  const { mutate: createContract, isPending: isCreating } = useCreateContract();
  const { mutate: updateContract, isPending: isUpdating } = useUpdateContract();

  const isLoading = isCreating || isUpdating;

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      customerId: '',
      motorcycleId: '',
      startDate: undefined,
      endDate: undefined,
      dailyRate: 0,
      observations: '',
    },
  });

  // Watch for changes to calculate total
  const watchedFields = form.watch(['startDate', 'endDate', 'dailyRate']);

  useEffect(() => {
    const [startDate, endDate, dailyRate] = watchedFields;
    if (startDate && endDate && dailyRate) {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      setCalculatedTotal(days * dailyRate);
    }
  }, [watchedFields]);

  // Load contract data for editing
  useEffect(() => {
    if (isEditing && existingContract) {
      form.reset({
        customerId: existingContract.customerId,
        motorcycleId: existingContract.motorcycleId,
        startDate: existingContract.startDate,
        endDate: existingContract.endDate,
        dailyRate: 0,
        observations: existingContract.observations,
      });
      
      if (existingContract.contractFile) {
        setExistingFileUrl(existingContract.contractFile);
      }
      
      const motorcycle = motorcycles.find(m => m.id === existingContract.motorcycleId);
      setSelectedMotorcycle(motorcycle);
    }
  }, [isEditing, existingContract, form, motorcycles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('O arquivo deve ter no máximo 5MB');
        return;
      }
      setContractFile(file);
    }
  };

  const handleRemoveFile = () => {
    setContractFile(null);
    setExistingFileUrl(null);
  };

  const onSubmit = async (data: ContractFormData) => {
    if (!user) return;

    try {
      const contractId = id || crypto.randomUUID();
      let fileUrl = existingFileUrl;

      // Upload file if exists
      if (contractFile) {
        fileUrl = await uploadContractFile(contractFile, contractId);
      }

      const contractData = {
        id: contractId,
        customerId: data.customerId,
        motorcycleId: data.motorcycleId,
        rentalCompanyId: user.id,
        startDate: data.startDate,
        endDate: data.endDate,
        observations: data.observations,
        contractFile: fileUrl,
        status: 'pending_signature' as const,
      };

      if (isEditing) {
        updateContract({ id: contractId, contract: contractData }, {
          onSuccess: () => navigate('/contratos'),
        });
      } else {
        createContract(contractData, {
          onSuccess: () => navigate('/contratos'),
        });
      }
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
    }
  };

  const handleMotorcycleChange = (motorcycleId: string) => {
    const motorcycle = motorcycles.find(m => m.id === motorcycleId);
    setSelectedMotorcycle(motorcycle);
    
    if (motorcycle) {
      form.setValue('dailyRate', motorcycle.dailyRate);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/contratos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Modifique as informações do contrato' : 'Crie um novo contrato de locação'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client and Vehicle Selection */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cliente e Veículo
                  </CardTitle>
                  <CardDescription>
                    Selecione o cliente e o veículo para locação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client Selection */}
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{customer.fullName}</div>
                                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vehicle Selection */}
                  <FormField
                    control={form.control}
                    name="motorcycleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veículo *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleMotorcycleChange(value);
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o veículo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {motorcycles.filter(m => m.isAvailable).map((motorcycle) => (
                              <SelectItem key={motorcycle.id} value={motorcycle.id}>
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{motorcycle.brand} {motorcycle.model}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {motorcycle.plate} • {formatCurrency(motorcycle.dailyRate)}/dia
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Contract Period */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Período de Locação
                  </CardTitle>
                  <CardDescription>
                    Defina as datas de início e fim do contrato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
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
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Fim *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
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
                                  date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                  (form.getValues('startDate') && date <= form.getValues('startDate'))
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Informações Financeiras
                  </CardTitle>
                  <CardDescription>
                    Valores e condições de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Diária (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          {selectedMotorcycle && (
                            <span className="text-primary">
                              Valor sugerido para este veículo: {formatCurrency(selectedMotorcycle.dailyRate)}
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Observações e Documentos</CardTitle>
                  <CardDescription>
                    Informações adicionais e upload do contrato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite observações adicionais sobre o contrato..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Arquivo do Contrato (PDF)</FormLabel>
                    <div className="mt-2">
                      {(contractFile || existingFileUrl) ? (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm flex-1">
                            {contractFile?.name || 'Arquivo existente'}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="contract-file"
                          />
                          <label
                            htmlFor="contract-file"
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            <span className="text-sm">Escolher arquivo</span>
                          </label>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Arquivo PDF, máximo 5MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Contrato' : 'Criar Contrato')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/contratos')}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              {/* Contract Summary */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Resumo do Contrato</CardTitle>
                  <CardDescription>
                    Informações calculadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.watch('customerId') && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Cliente</div>
                      <div className="text-sm">
                        {customers.find(c => c.id === form.watch('customerId'))?.fullName || 'Não selecionado'}
                      </div>
                    </div>
                  )}

                  {selectedMotorcycle && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Veículo</div>
                      <div className="text-sm">
                        {selectedMotorcycle.brand} {selectedMotorcycle.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Placa: {selectedMotorcycle.plate}
                      </div>
                    </div>
                  )}

                  {form.watch('startDate') && form.watch('endDate') && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Período</div>
                      <div className="text-sm">
                        {format(form.watch('startDate'), "dd/MM/yyyy")} - {format(form.watch('endDate'), "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.ceil((form.watch('endDate').getTime() - form.watch('startDate').getTime()) / (1000 * 60 * 60 * 24))} dias
                      </div>
                    </div>
                  )}

                  {form.watch('dailyRate') > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Diária</div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(form.watch('dailyRate'))}
                      </div>
                    </div>
                  )}

                  {calculatedTotal > 0 && (
                    <div className="pt-3 border-t">
                      <div className="text-sm font-medium text-muted-foreground">Total Estimado</div>
                      <div className="text-xl font-bold text-success">
                        {formatCurrency(calculatedTotal)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Dicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Valor da diária:</strong>
                    <p className="text-muted-foreground">O valor sugerido é baseado no veículo selecionado, mas pode ser alterado</p>
                  </div>
                  <div>
                    <strong>Período mínimo:</strong>
                    <p className="text-muted-foreground">Recomendamos um período mínimo de 1 dia para locações</p>
                  </div>
                  <div>
                    <strong>Documentação:</strong>
                    <p className="text-muted-foreground">Certifique-se de que o cliente possui documentação válida</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}