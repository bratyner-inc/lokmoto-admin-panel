import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, 
  ArrowLeft, 
  Save, 
  Car,
  AlertTriangle,
  Calendar
} from 'lucide-react';

const maintenanceSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  type: z.enum(['preventiva', 'corretiva', 'sinistro']),
  status: z.enum(['pendente', 'em_andamento', 'concluida', 'cancelada']),
  vehicleId: z.string().min(1, 'Selecione um veículo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  customerReturn: z.string().optional(),
  cost: z.number().min(0, 'Custo deve ser maior ou igual a zero'),
  mechanicName: z.string().min(2, 'Nome do responsável é obrigatório'),
  priority: z.enum(['baixa', 'media', 'alta']),
  internalNotes: z.string().optional(),
  completedAt: z.string().optional()
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface ManutencaoFormProps {
  mode?: 'create' | 'edit';
}

// Mock data para veículos disponíveis
const mockVehicles = [
  { id: '1', name: 'Honda CB 600F Hornet', plate: 'ABC-1234' },
  { id: '2', name: 'Yamaha MT-07', plate: 'XYZ-5678' },
  { id: '3', name: 'Kawasaki Ninja 300', plate: 'MOT-9012' }
];

// Mock data para edição
const mockMaintenanceData = {
  id: '1',
  title: 'Troca de pastilhas de freio',
  type: 'preventiva' as const,
  status: 'concluida' as const,
  vehicleId: '1',
  description: 'Substituição das pastilhas de freio dianteiras e traseiras devido ao desgaste natural.',
  customerReturn: 'Pastilhas substituídas com sucesso. Veículo liberado para uso normal.',
  cost: 180,
  mechanicName: 'João Silva',
  priority: 'media' as const,
  internalNotes: 'Verificar pastilhas novamente em 3 meses.',
  completedAt: '2024-01-16'
};

export default function ManutencaoForm({ mode = 'create' }: ManutencaoFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Editar Manutenção' : 'Nova Manutenção';
  const submitText = isEdit ? 'Salvar Alterações' : 'Criar Manutenção';

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: isEdit ? {
      title: mockMaintenanceData.title,
      type: mockMaintenanceData.type,
      status: mockMaintenanceData.status,
      vehicleId: mockMaintenanceData.vehicleId,
      description: mockMaintenanceData.description,
      customerReturn: mockMaintenanceData.customerReturn,
      cost: mockMaintenanceData.cost,
      mechanicName: mockMaintenanceData.mechanicName,
      priority: mockMaintenanceData.priority,
      internalNotes: mockMaintenanceData.internalNotes,
      completedAt: mockMaintenanceData.completedAt
    } : {
      title: '',
      type: 'preventiva',
      status: 'pendente',
      vehicleId: '',
      description: '',
      customerReturn: '',
      cost: 0,
      mechanicName: '',
      priority: 'media',
      internalNotes: '',
      completedAt: ''
    }
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsLoading(true);
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Dados da manutenção:', data);
      
      toast({
        title: isEdit ? "Manutenção atualizada" : "Manutenção criada",
        description: isEdit 
          ? "As informações da manutenção foram salvas com sucesso."
          : "Nova manutenção foi registrada com sucesso.",
      });
      
      navigate(isEdit ? `/manutencao/${id}` : '/manutencao');
    } catch (error) {
      toast({
        title: "Erro",
        description: isEdit 
          ? "Não foi possível salvar as alterações."
          : "Não foi possível criar a manutenção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = form.watch('type');
  const selectedStatus = form.watch('status');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(isEdit ? `/manutencao/${id}` : '/manutencao')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              {title}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Edite as informações da manutenção' : 'Registre uma nova manutenção ou sinistro'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(isEdit ? `/manutencao/${id}` : '/manutencao')}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? (isEdit ? 'Salvando...' : 'Criando...') : submitText}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Principais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Principais</CardTitle>
                <CardDescription>
                  Dados básicos da manutenção ou sinistro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Troca de pastilhas de freio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preventiva">Preventiva</SelectItem>
                              <SelectItem value="corretiva">Corretiva</SelectItem>
                              <SelectItem value="sinistro">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Sinistro
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_andamento">Em Andamento</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veículo</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o veículo" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockVehicles.map(vehicle => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4" />
                                  {vehicle.name} - {vehicle.plate}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mechanicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável/Mecânico</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(selectedStatus === 'concluida' || selectedStatus === 'cancelada') && (
                  <FormField
                    control={form.control}
                    name="completedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Conclusão</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Descrições e Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Descrições e Observações</CardTitle>
                <CardDescription>
                  Detalhes sobre o problema e retorno para o cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedType === 'sinistro' ? 'Descrição do Sinistro' : 'Descrição do Problema'}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            selectedType === 'sinistro' 
                              ? "Descreva o sinistro reportado pelo cliente..."
                              : "Descreva o problema ou manutenção necessária..."
                          }
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retorno para o Cliente</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Resposta ou feedback que será enviado ao cliente..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="internalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Internas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas internas para a equipe (não visível ao cliente)..."
                          className="min-h-[80px]"
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
        </form>
      </Form>
    </div>
  );
}