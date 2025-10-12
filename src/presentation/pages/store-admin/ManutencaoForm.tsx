/**
 * ManutencaoForm Page - Store Admin
 * Formulário para criar/editar registro de manutenção
 */

import React, { useState, useEffect } from 'react';
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
import { PageLoader } from '@/components/ui/page-loader';
import { Wrench, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useMaintenance, useMaintenanceRecord } from '@/presentation/hooks/useMaintenance';
import { useMotorcycles } from '@/presentation/hooks/useMotorcycles';
import {
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
} from '@/domain/entities/MaintenanceRecord';

const maintenanceSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  maintenanceType: z.enum(['preventiva', 'corretiva', 'sinistro'] as const),
  status: z.enum(['agendada', 'em_andamento', 'concluida', 'cancelada'] as const),
  motorcycleId: z.string().min(1, 'Selecione um veículo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  customerReturn: z.string().optional(),
  estimatedCost: z.number().min(0, 'Custo estimado deve ser maior ou igual a zero').optional(),
  actualCost: z.number().min(0, 'Custo real deve ser maior ou igual a zero').optional(),
  mechanicName: z.string().optional(),
  workshopName: z.string().optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente'] as const),
  internalNotes: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface ManutencaoFormProps {
  mode?: 'create' | 'edit';
}

export default function ManutencaoForm({ mode = 'create' }: ManutencaoFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { createMaintenance } = useMaintenance();
  const { maintenance, loading: loadingMaintenance, updateMaintenance } = useMaintenanceRecord(id);
  const { motorcycles, loading: loadingMotorcycles } = useMotorcycles();

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Editar Manutenção' : 'Nova Manutenção';
  const submitText = isEdit ? 'Salvar Alterações' : 'Criar Manutenção';

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: '',
      maintenanceType: 'preventiva',
      status: 'agendada',
      motorcycleId: '',
      description: '',
      customerReturn: '',
      estimatedCost: 0,
      actualCost: 0,
      mechanicName: '',
      workshopName: '',
      priority: 'media',
      internalNotes: '',
      scheduledDate: '',
    },
  });

  // Load existing maintenance data when editing
  useEffect(() => {
    if (isEdit && maintenance) {
      form.reset({
        title: maintenance.title,
        maintenanceType: maintenance.maintenanceType,
        status: maintenance.status,
        motorcycleId: maintenance.motorcycleId,
        description: maintenance.description,
        customerReturn: maintenance.customerReturn || '',
        estimatedCost: maintenance.estimatedCost || 0,
        actualCost: maintenance.actualCost || 0,
        mechanicName: maintenance.mechanicName || '',
        workshopName: maintenance.workshopName || '',
        priority: maintenance.priority,
        internalNotes: maintenance.internalNotes || '',
        scheduledDate: maintenance.scheduledDate
          ? new Date(maintenance.scheduledDate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [isEdit, maintenance, form]);

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsLoading(true);
    try {
      if (isEdit && id) {
        // Update existing maintenance
        await updateMaintenance({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          estimatedCost: data.estimatedCost || undefined,
          actualCost: data.actualCost || undefined,
          mechanicName: data.mechanicName || undefined,
          workshopName: data.workshopName || undefined,
          customerReturn: data.customerReturn || undefined,
          internalNotes: data.internalNotes || undefined,
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
          startedAt: data.status === 'em_andamento' ? new Date() : undefined,
          completedAt: data.status === 'concluida' ? new Date() : undefined,
        });

        toast({
          title: 'Manutenção atualizada',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        // Create new maintenance
        await createMaintenance({
          title: data.title,
          description: data.description,
          maintenanceType: data.maintenanceType,
          motorcycleId: data.motorcycleId,
          priority: data.priority,
          estimatedCost: data.estimatedCost || undefined,
          mechanicName: data.mechanicName || undefined,
          workshopName: data.workshopName || undefined,
          internalNotes: data.internalNotes || undefined,
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        });

        toast({
          title: 'Manutenção criada',
          description: 'O registro de manutenção foi criado com sucesso.',
        });
      }

      navigate('/manutencao');
    } catch (error) {
      toast({
        title: 'Erro',
        description: `Não foi possível ${isEdit ? 'atualizar' : 'criar'} a manutenção.`,
        variant: 'destructive',
      });
      console.error('Error submitting maintenance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingMaintenance || loadingMotorcycles) {
    return <PageLoader />;
  }

  // Only show "not found" error when editing
  if (isEdit && !maintenance) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Manutenção não encontrada</h2>
        <Button onClick={() => navigate('/manutencao')}>Voltar para lista</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/manutencao')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              {title}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Edite os detalhes da manutenção' : 'Crie um novo registro de manutenção'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais da manutenção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Manutenção *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Troca de pastilhas de freio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type - only for creation */}
                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="maintenanceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Manutenção *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preventiva">Preventiva</SelectItem>
                            <SelectItem value="corretiva">Corretiva</SelectItem>
                            <SelectItem value="sinistro">Sinistro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="agendada">Agendada</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluida">Concluída</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vehicle - only for creation */}
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="motorcycleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veículo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o veículo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {motorcycles.map((motorcycle) => (
                            <SelectItem key={motorcycle.id} value={motorcycle.id}>
                              {motorcycle.brand} {motorcycle.model} - {motorcycle.plate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Scheduled Date */}
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Agendada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os detalhes da manutenção..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custos e Responsável</CardTitle>
              <CardDescription>Informações sobre custos e execução</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Estimado (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Real (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
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

              {/* Mechanic and Workshop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mechanicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Mecânico</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workshopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Oficina</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Oficina Central" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback e Observações</CardTitle>
              <CardDescription>Informações para o cliente e notas internas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Return */}
              <FormField
                control={form.control}
                name="customerReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retorno ao Cliente</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações que serão compartilhadas com o cliente..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Internal Notes */}
              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Internas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações internas (não visível para o cliente)..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/manutencao')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {submitText}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

