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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Contract } from '@/types';

const contractSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  vehicleId: z.string().min(1, 'Veículo é obrigatório'),
  startDate: z.date({ required_error: 'Data de início é obrigatória' }),
  endDate: z.date({ required_error: 'Data de fim é obrigatória' }),
  dailyRate: z.number().min(1, 'Valor da diária deve ser maior que zero'),
  notes: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["endDate"],
});

type ContractFormData = z.infer<typeof contractSchema>;

// Mock data
const mockClients = [
  { id: 'client-1', name: 'Carlos Mendes', email: 'carlos@email.com' },
  { id: 'client-2', name: 'Ana Paula Santos', email: 'ana@email.com' },
  { id: 'client-3', name: 'Roberto Silva', email: 'roberto@email.com' },
  { id: 'client-4', name: 'Mariana Costa', email: 'mariana@email.com' },
];

const mockVehicles = [
  { id: 'vehicle-1', model: 'Honda CB 600F', brand: 'Honda', plate: 'ABC-1234', dailyRate: 85, status: 'available' },
  { id: 'vehicle-2', model: 'Yamaha MT-07', brand: 'Yamaha', plate: 'XYZ-5678', dailyRate: 95, status: 'available' },
  { id: 'vehicle-3', model: 'Kawasaki Ninja 300', brand: 'Kawasaki', plate: 'MOT-9012', dailyRate: 75, status: 'available' },
  { id: 'vehicle-4', model: 'BMW F 800 R', brand: 'BMW', plate: 'BMW-3456', dailyRate: 120, status: 'available' },
];

const mockContract = {
  id: 'CTR-2024-001',
  clientId: 'client-1',
  vehicleId: 'vehicle-1',
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-02-15'),
  dailyRate: 85,
  totalAmount: 2550,
  status: 'active' as const,
  paymentStatus: 'paid' as const,
  notes: 'Contrato padrão de locação mensal',
  createdAt: '2024-01-10T00:00:00Z',
};

export default function ContratoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  const isEditing = Boolean(id);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      clientId: '',
      vehicleId: '',
      startDate: undefined,
      endDate: undefined,
      dailyRate: 0,
      notes: '',
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
    if (isEditing) {
      // Simulate API call
      setTimeout(() => {
        form.reset({
          clientId: mockContract.clientId,
          vehicleId: mockContract.vehicleId,
          startDate: mockContract.startDate,
          endDate: mockContract.endDate,
          dailyRate: mockContract.dailyRate,
          notes: mockContract.notes,
        });
        
        const vehicle = mockVehicles.find(v => v.id === mockContract.vehicleId);
        setSelectedVehicle(vehicle);
      }, 500);
    }
  }, [isEditing, form]);

  const onSubmit = async (data: ContractFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const days = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const total = days * data.dailyRate;
      
      toast({
        title: isEditing ? 'Contrato atualizado!' : 'Contrato criado!',
        description: `Contrato ${isEditing ? 'atualizado' : 'criado'} com sucesso. Total: R$ ${total.toFixed(2)}`,
      });
      
      navigate('/contratos');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o contrato.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = mockVehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle);
    
    if (vehicle) {
      form.setValue('dailyRate', vehicle.dailyRate);
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
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockClients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-xs text-muted-foreground">{client.email}</div>
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
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veículo *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleVehicleChange(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o veículo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockVehicles.filter(v => v.status === 'available').map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {vehicle.plate} • {formatCurrency(vehicle.dailyRate)}/dia
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
                          {selectedVehicle && (
                            <span className="text-primary">
                              Valor sugerido para este veículo: {formatCurrency(selectedVehicle.dailyRate)}
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
                  <CardTitle>Observações</CardTitle>
                  <CardDescription>
                    Informações adicionais sobre o contrato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
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
                  {form.watch('clientId') && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Cliente</div>
                      <div className="text-sm">
                        {mockClients.find(c => c.id === form.watch('clientId'))?.name || 'Não selecionado'}
                      </div>
                    </div>
                  )}

                  {selectedVehicle && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Veículo</div>
                      <div className="text-sm">
                        {selectedVehicle.brand} {selectedVehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Placa: {selectedVehicle.plate}
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