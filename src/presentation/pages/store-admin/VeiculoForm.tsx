import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, ArrowLeft, Save } from 'lucide-react';
import { useMotorcycle, useMotorcycles } from '@/presentation/hooks/useMotorcycles';
import { useVehicleCategories } from '@/presentation/hooks/useVehicleCategories';
import { MOTORCYCLE_COLORS, POPULAR_BRANDS } from '@/shared/constants/motorcycleConstants';
import { ImageUpload } from '@/presentation/components/ImageUpload';
import { storageService } from '@/infrastructure/storage/storageService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// Validation schema matching our domain entity
const motorcycleSchema = z.object({
  brand: z.string().min(2, 'Marca deve ter pelo menos 2 caracteres'),
  model: z.string().min(2, 'Modelo deve ter pelo menos 2 caracteres'),
  version: z.string().min(1, 'Versão é obrigatória'),
  year: z.coerce.number().int().min(1990, 'Ano deve ser maior que 1990').max(new Date().getFullYear() + 1, 'Ano inválido'),
  plate: z.string().min(7, 'Placa deve ter formato válido (ABC-1234 ou ABC1D23)').max(8),
  renavam: z.string().min(11, 'Renavam deve ter 11 caracteres').max(11),
  chassis: z.string().min(17, 'Chassis deve ter 17 caracteres').max(17),
  color: z.string().min(2, 'Cor é obrigatória'),
  engineCapacity: z.coerce.number().int().min(50, 'Cilindrada deve ser maior que 50cc').max(3000, 'Cilindrada muito alta'),
  categoryId: z.string().optional(),
  dailyRate: z.coerce.number().min(0, 'Valor da diária deve ser maior ou igual a 0').optional(),
  isAvailable: z.boolean().default(true),
});

type MotorcycleFormData = z.infer<typeof motorcycleSchema>;

export default function VeiculoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = !!id;
  const title = isEdit ? 'Editar Motocicleta' : 'Cadastrar Motocicleta';
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { motorcycle, loading: loadingMotorcycle } = useMotorcycle(id || '');
  const { createMotorcycle, updateMotorcycle } = useMotorcycles();
  const { categories, loading: loadingCategories } = useVehicleCategories();

  const form = useForm<MotorcycleFormData>({
    resolver: zodResolver(motorcycleSchema),
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
      categoryId: '',
      dailyRate: 0,
      isAvailable: true,
    },
  });

  // Load existing motorcycle data for edit mode
  useEffect(() => {
    if (isEdit && motorcycle) {
      form.reset({
        brand: motorcycle.brand,
        model: motorcycle.model,
        version: motorcycle.version,
        year: motorcycle.year,
        plate: motorcycle.plate,
        renavam: motorcycle.renavam,
        chassis: motorcycle.chassis,
        color: motorcycle.color,
        engineCapacity: motorcycle.engineCapacity,
        categoryId: motorcycle.categoryId || '',
        dailyRate: motorcycle.dailyRate || 0,
        isAvailable: motorcycle.isAvailable,
      });
      // Load existing images
      if (motorcycle.images) {
        setImages(motorcycle.images);
      }
    }
  }, [isEdit, motorcycle, form]);

  const onSubmit = async (data: MotorcycleFormData) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setUploading(true);
    try {
      // Separate existing URLs from new data URLs
      const existingImages = images.filter(img => img.startsWith('http'));
      const newImages = images.filter(img => img.startsWith('data:'));
      
      // Upload new images
      const uploadedImageUrls: string[] = [];
      for (const dataUrl of newImages) {
        // Convert data URL to File
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileName = `image-${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: blob.type });
        
        // Upload to Supabase Storage
        const tempId = id || 'temp-' + Date.now(); // Use temp ID for new motorcycles
        const result = await storageService.uploadMotorcycleImage(file, user.id, tempId);
        
        if (result.success && result.publicUrl) {
          uploadedImageUrls.push(result.publicUrl);
        } else {
          toast.error(result.error || 'Erro ao fazer upload de imagem');
          throw new Error(result.error);
        }
      }
      
      // Combine existing and newly uploaded URLs
      const finalImageUrls = [...existingImages, ...uploadedImageUrls];
      
      // Save motorcycle data
      if (isEdit && id) {
        await updateMotorcycle(id, {
          brand: data.brand,
          model: data.model,
          version: data.version,
          year: data.year,
          plate: data.plate,
          renavam: data.renavam,
          chassis: data.chassis,
          color: data.color,
          engineCapacity: data.engineCapacity,
          categoryId: data.categoryId || undefined,
          dailyRate: data.dailyRate || undefined,
          isAvailable: data.isAvailable,
          images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        });
      } else {
        await createMotorcycle({
          brand: data.brand,
          model: data.model,
          version: data.version,
          year: data.year,
          plate: data.plate,
          renavam: data.renavam,
          chassis: data.chassis,
          color: data.color,
          engineCapacity: data.engineCapacity,
          categoryId: data.categoryId || undefined,
          dailyRate: data.dailyRate || undefined,
          isAvailable: data.isAvailable,
          images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        });
      }
      
      toast.success(`Motocicleta ${isEdit ? 'atualizada' : 'cadastrada'} com sucesso!`);
      navigate('/veiculos');
    } catch (error) {
      console.error('Error saving motorcycle:', error);
      toast.error('Erro ao salvar motocicleta');
    } finally {
      setUploading(false);
    }
  };

  // Loading state
  if (isEdit && loadingMotorcycle) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/veiculos')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            {title}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Atualize as informações da motocicleta' : 'Preencha os dados da nova motocicleta'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Motocicleta</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {POPULAR_BRANDS.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                          <SelectItem value="Outra">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CB 600F Hornet" {...field} />
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
                        <Input placeholder="Ex: ABS, Standard, Limited" {...field} />
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
                      <FormLabel>Ano *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2023" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOTORCYCLE_COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
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
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cilindrada (cc) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="600" {...field} />
                      </FormControl>
                      <FormDescription>Cilindrada em centímetros cúbicos</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Documentation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documentação</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ABC-1234" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription>Formato: ABC-1234 ou ABC1D23</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="renavam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renavam *</FormLabel>
                        <FormControl>
                          <Input placeholder="12345678901" maxLength={11} {...field} />
                        </FormControl>
                        <FormDescription>11 dígitos</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chassis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chassis *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="9BD12345678901234" 
                            maxLength={17}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription>17 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                          value={field.value || 'none'}
                          disabled={loadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma categoria</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Categoria da motocicleta (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Diária (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="150.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Valor cobrado por dia de locação</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Imagens da Motocicleta</h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione fotos da motocicleta (até 5 imagens)
                  </p>
                </div>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                  disabled={uploading}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/veiculos')}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark"
                  disabled={uploading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {uploading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Motocicleta'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

