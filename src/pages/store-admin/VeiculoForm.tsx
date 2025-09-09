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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { 
  Car, 
  ArrowLeft, 
  Save, 
  Settings,
  Upload,
  X,
  Image as ImageIcon,
  Plus
} from 'lucide-react';

const vehicleSchema = z.object({
  model: z.string().min(2, 'Modelo deve ter pelo menos 2 caracteres'),
  brand: z.string().min(2, 'Marca deve ter pelo menos 2 caracteres'),
  year: z.number().min(1990, 'Ano deve ser maior que 1990').max(2030, 'Ano não pode ser maior que 2030'),
  plate: z.string().min(7, 'Placa deve ter formato válido'),
  color: z.string().min(2, 'Cor é obrigatória'),
  chassisNumber: z.string().min(17, 'Número do chassi deve ter 17 caracteres'),
  fuelType: z.enum(['gasoline', 'ethanol', 'flex', 'electric']),
  dailyRate: z.number().min(1, 'Valor da diária deve ser maior que 0'),
  mileage: z.number().min(0, 'Quilometragem deve ser maior ou igual a 0'),
  location: z.string().min(2, 'Localização é obrigatória'),
  description: z.string().optional(),
  // Especificações técnicas
  engine: z.string().optional(),
  power: z.string().optional(),
  torque: z.string().optional(),
  transmission: z.string().optional(),
  weight: z.string().optional(),
  fuelCapacity: z.string().optional()
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VeiculoFormProps {
  mode?: 'create' | 'edit';
}

// Mock data para edição
const mockVehicleData = {
  id: '1',
  model: 'Honda CB 600F Hornet',
  brand: 'Honda',
  year: 2023,
  plate: 'ABC-1234',
  color: 'Vermelho',
  chassisNumber: '9BD12345678901234',
  fuelType: 'gasoline' as const,
  dailyRate: 85,
  mileage: 12500,
  location: 'Pátio Principal',
  description: 'Moto em excelente estado de conservação, ideal para passeios urbanos e viagens.',
  engine: '599cc, 4 cilindros',
  power: '102 cv @ 12.000 rpm',
  torque: '64 Nm @ 10.500 rpm',
  transmission: '6 marchas',
  weight: '201 kg',
  fuelCapacity: '19 litros',
  images: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400'
  ]
};

export default function VeiculoForm({ mode = 'create' }: VeiculoFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(mode === 'edit' ? mockVehicleData.images : []);
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Editar Veículo' : 'Cadastrar Veículo';
  const submitText = isEdit ? 'Salvar Alterações' : 'Cadastrar Veículo';

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: isEdit ? {
      model: mockVehicleData.model,
      brand: mockVehicleData.brand,
      year: mockVehicleData.year,
      plate: mockVehicleData.plate,
      color: mockVehicleData.color,
      chassisNumber: mockVehicleData.chassisNumber,
      fuelType: mockVehicleData.fuelType,
      dailyRate: mockVehicleData.dailyRate,
      mileage: mockVehicleData.mileage,
      location: mockVehicleData.location,
      description: mockVehicleData.description,
      engine: mockVehicleData.engine,
      power: mockVehicleData.power,
      torque: mockVehicleData.torque,
      transmission: mockVehicleData.transmission,
      weight: mockVehicleData.weight,
      fuelCapacity: mockVehicleData.fuelCapacity
    } : {
      model: '',
      brand: '',
      year: new Date().getFullYear(),
      plate: '',
      color: '',
      chassisNumber: '',
      fuelType: 'gasoline',
      dailyRate: 0,
      mileage: 0,
      location: 'Pátio Principal',
      description: '',
      engine: '',
      power: '',
      torque: '',
      transmission: '',
      weight: '',
      fuelCapacity: ''
    }
  });

  const onSubmit = async (data: VehicleFormData) => {
    setIsLoading(true);
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Dados do veículo:', data);
      console.log('Imagens:', images);
      
      toast({
        title: isEdit ? "Veículo atualizado" : "Veículo cadastrado",
        description: isEdit 
          ? "As informações do veículo foram salvas com sucesso."
          : "O novo veículo foi cadastrado com sucesso.",
      });
      
      navigate(isEdit ? `/veiculos/${id}` : '/veiculos');
    } catch (error) {
      toast({
        title: "Erro",
        description: isEdit 
          ? "Não foi possível salvar as alterações."
          : "Não foi possível cadastrar o veículo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(isEdit ? `/veiculos/${id}` : '/veiculos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              {title}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Edite as informações e fotos do veículo' : 'Preencha os dados do novo veículo'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(isEdit ? `/veiculos/${id}` : '/veiculos')}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? (isEdit ? 'Salvando...' : 'Cadastrando...') : submitText}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="specs">Especificações</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dados do Veículo */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dados do Veículo</CardTitle>
                    <CardDescription>
                      Informações principais de identificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: CB 600F Hornet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                </SelectContent>
                              </Select>
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
                    </div>

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
                      name="chassisNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Chassi</FormLabel>
                          <FormControl>
                            <Input placeholder="17 dígitos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Configurações */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações</CardTitle>
                    <CardDescription>
                      Tipo de combustível, valores e localização
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Combustível</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gasoline">Gasolina</SelectItem>
                                <SelectItem value="ethanol">Etanol</SelectItem>
                                <SelectItem value="flex">Flex</SelectItem>
                                <SelectItem value="electric">Elétrico</SelectItem>
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
                        name="dailyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da Diária (R$)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="85.00"
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
                        name="mileage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quilometragem</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="12500"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pátio Principal">Pátio Principal</SelectItem>
                                <SelectItem value="Pátio Secundário">Pátio Secundário</SelectItem>
                                <SelectItem value="Oficina">Oficina</SelectItem>
                                <SelectItem value="Em uso">Em uso</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrição detalhada do veículo..."
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
            </TabsContent>

            <TabsContent value="specs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Especificações Técnicas
                  </CardTitle>
                  <CardDescription>
                    Detalhes técnicos do veículo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="engine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motor</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 599cc, 4 cilindros" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="power"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Potência</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 102 cv @ 12.000 rpm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="torque"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Torque</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 64 Nm @ 10.500 rpm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmissão</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 6 marchas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 201 kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fuelCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidade do Tanque</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 19 litros" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Fotos do Veículo
                  </CardTitle>
                  <CardDescription>
                    Adicione fotos do veículo (máximo 10 imagens)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar ou arraste as imagens aqui
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG até 5MB cada
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Image Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}