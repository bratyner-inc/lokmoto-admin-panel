import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motorcycleFormSchema, type MotorcycleFormData } from '@/lib/validations/motorcycle';
import { SupabaseMotorcycleRepository } from '@/data/repositories/SupabaseMotorcycleRepository';
import { useMotorcycles } from '@/hooks/useMotorcycles';
import { 
  Bike,
  ArrowLeft, 
  Save, 
  AlertCircle,
  Info
} from 'lucide-react';

export default function VeiculoForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { categories } = useMotorcycles();

  const form = useForm<MotorcycleFormData>({
    resolver: zodResolver(motorcycleFormSchema),
    defaultValues: {
      brand: '',
      model: '',
      version: '',
      year: new Date().getFullYear(),
      plate: '',
      renavam: '',
      chassis: '',
      color: '',
      engineCapacity: 0,
      dailyRate: 0,
      categoryId: null,
      isAvailable: true,
    }
  });

  const onSubmit = async (data: MotorcycleFormData) => {
    setIsLoading(true);
    try {
      const repository = new SupabaseMotorcycleRepository();
      await repository.create({
        rentalCompanyId: '', // Será preenchido automaticamente no repositório
        brand: data.brand,
        model: data.model,
        version: data.version,
        year: data.year,
        plate: data.plate,
        renavam: data.renavam,
        chassis: data.chassis,
        color: data.color,
        engineCapacity: data.engineCapacity,
        dailyRate: data.dailyRate,
        categoryId: data.categoryId || undefined,
        isAvailable: data.isAvailable,
      });
      
      toast({
        title: "Motocicleta cadastrada",
        description: "A nova motocicleta foi cadastrada com sucesso.",
      });
      
      navigate('/veiculos');
    } catch (error) {
      console.error('Erro ao cadastrar motocicleta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível cadastrar a motocicleta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/veiculos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bike className="h-8 w-8 text-primary" />
              Cadastrar Motocicleta
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados da nova motocicleta
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/veiculos')}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Cadastrando...' : 'Cadastrar Motocicleta'}
          </Button>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Todos os campos marcados são obrigatórios. Certifique-se de preencher corretamente os dados do veículo.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identificação do Veículo */}
            <Card>
              <CardHeader>
                <CardTitle>Identificação do Veículo</CardTitle>
                <CardDescription>
                  Informações principais da motocicleta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a marca" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Honda">Honda</SelectItem>
                            <SelectItem value="Yamaha">Yamaha</SelectItem>
                            <SelectItem value="Kawasaki">Kawasaki</SelectItem>
                            <SelectItem value="Suzuki">Suzuki</SelectItem>
                            <SelectItem value="BMW">BMW</SelectItem>
                            <SelectItem value="Ducati">Ducati</SelectItem>
                            <SelectItem value="Harley-Davidson">Harley-Davidson</SelectItem>
                            <SelectItem value="Triumph">Triumph</SelectItem>
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
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: CB 600F" {...field} />
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
                        <FormLabel>Versão *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Hornet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={new Date().getFullYear().toString()}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
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
                        <FormLabel>Cor *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Vermelho" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="engineCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cilindrada (cc) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="600"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Cilindrada do motor em centímetros cúbicos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            placeholder="150.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor cobrado por dia de locação
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categoria do veículo para classificação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Documentação */}
            <Card>
              <CardHeader>
                <CardTitle>Documentação</CardTitle>
                <CardDescription>
                  Placa, RENAVAM e Chassi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABC1D234" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={8}
                        />
                      </FormControl>
                      <FormDescription>
                        Formato: ABC1234 ou ABC1D234 (Mercosul)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="renavam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RENAVAM *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345678901" 
                          {...field}
                          maxLength={11}
                        />
                      </FormControl>
                      <FormDescription>
                        11 dígitos numéricos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chassis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassi *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9BD12345678901234" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={17}
                        />
                      </FormControl>
                      <FormDescription>
                        17 caracteres alfanuméricos (sem I, O, Q)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Disponível para Locação
                        </FormLabel>
                        <FormDescription>
                          A motocicleta está disponível para ser alugada
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
