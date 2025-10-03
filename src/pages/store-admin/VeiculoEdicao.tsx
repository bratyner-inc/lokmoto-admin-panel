import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motorcycleFormSchema, type MotorcycleFormData } from '@/lib/validations/motorcycle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMotorcycle } from '@/hooks/useMotorcycles';
import { 
  Car, 
  ArrowLeft, 
  Save,
  Loader2
} from 'lucide-react';

export default function VeiculoEdicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { motorcycle, isLoading: isLoadingMotorcycle, updateMotorcycle, isUpdating } = useMotorcycle(id || '');

  const form = useForm<MotorcycleFormData>({
    resolver: zodResolver(motorcycleFormSchema),
    values: motorcycle ? {
      brand: motorcycle.brand,
      model: motorcycle.model,
      version: motorcycle.version,
      year: motorcycle.year,
      plate: motorcycle.plate,
      renavam: motorcycle.renavam,
      chassis: motorcycle.chassis,
      color: motorcycle.color,
      engineCapacity: motorcycle.engineCapacity,
      isAvailable: motorcycle.isAvailable,
    } : undefined,
  });

  const onSubmit = async (data: MotorcycleFormData) => {
    try {
      await updateMotorcycle(data);
      
      toast({
        title: "Motocicleta atualizada",
        description: "As informações da motocicleta foram salvas com sucesso.",
      });
      
      navigate(`/veiculos/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar motocicleta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingMotorcycle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Car className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Motocicleta não encontrada</p>
        <Button onClick={() => navigate('/veiculos')}>
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
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/veiculos/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              Editar Veículo
            </h1>
            <p className="text-muted-foreground">
              Edite as informações e fotos do veículo
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/veiculos/${id}`)}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isUpdating}
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Dados da Motocicleta</CardTitle>
              <CardDescription>
                Edite as informações da motocicleta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Honda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CB 500F" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versão</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ABS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2023"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="renavam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RENAVAM</FormLabel>
                      <FormControl>
                        <Input placeholder="00000000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chassis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassi</FormLabel>
                      <FormControl>
                        <Input placeholder="9BD12345678901234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Vermelho" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cilindrada (cc)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilidade</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={(value) => field.onChange(value === 'true')} 
                          value={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Disponível</SelectItem>
                            <SelectItem value="false">Indisponível</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}