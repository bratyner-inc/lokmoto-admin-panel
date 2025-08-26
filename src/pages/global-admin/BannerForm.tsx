import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const bannerSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  imageUrl: z.string().url('URL da imagem inválida'),
  linkUrl: z.string().url('URL do link inválida').optional().or(z.literal('')),
  position: z.enum(['hero', 'sidebar', 'footer']),
  isActive: z.boolean(),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
});

type BannerFormData = z.infer<typeof bannerSchema>;

// Mock data
const mockBanner = {
  id: '1',
  title: 'Promoção de Verão 2024',
  description: 'Desconto especial para contratos de longa duração',
  imageUrl: 'https://via.placeholder.com/800x400/dc2626/ffffff?text=Banner+Preview',
  linkUrl: 'https://lokmoto.com/promocao',
  position: 'hero' as const,
  isActive: true,
  startDate: '2024-01-01',
  endDate: '2024-03-31',
};

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(id);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'hero',
      isActive: true,
      startDate: '',
      endDate: '',
    },
  });

  // Simulate loading banner data for editing
  useEffect(() => {
    if (isEditing) {
      // In a real app, this would be an API call
      setTimeout(() => {
        form.reset({
          title: mockBanner.title,
          description: mockBanner.description,
          imageUrl: mockBanner.imageUrl,
          linkUrl: mockBanner.linkUrl,
          position: mockBanner.position,
          isActive: mockBanner.isActive,
          startDate: mockBanner.startDate,
          endDate: mockBanner.endDate,
        });
        setImagePreview(mockBanner.imageUrl);
      }, 500);
    }
  }, [isEditing, form]);

  const onSubmit = async (data: BannerFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: isEditing ? 'Banner atualizado!' : 'Banner criado!',
        description: `Banner "${data.title}" foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });
      
      navigate('/banners');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o banner.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    form.setValue('imageUrl', url);
    setImagePreview(url);
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'hero':
        return 'Hero (Principal)';
      case 'sidebar':
        return 'Sidebar (Lateral)';
      case 'footer':
        return 'Footer (Rodapé)';
      default:
        return position;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/banners')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Editar Banner' : 'Novo Banner'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Modifique as informações do banner' : 'Crie um novo banner promocional'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Informações do Banner</CardTitle>
              <CardDescription>
                Preencha as informações básicas do banner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o título do banner" {...field} />
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
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição do banner (opcional)"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image URL */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem *</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="https://exemplo.com/imagem.jpg"
                              {...field}
                              onChange={(e) => handleImageUrlChange(e.target.value)}
                            />
                            <Button type="button" variant="outline" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Link URL */}
                  <FormField
                    control={form.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Position */}
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posição *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a posição" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hero">Hero (Principal)</SelectItem>
                            <SelectItem value="sidebar">Sidebar (Lateral)</SelectItem>
                            <SelectItem value="footer">Footer (Rodapé)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Fim</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Active Status */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Banner Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Ativar este banner para exibição no site
                          </div>
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

                  {/* Submit Buttons */}
                  <div className="flex items-center gap-3 pt-6 border-t">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Banner' : 'Criar Banner')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/banners')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          {/* Image Preview */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>
                Visualização do banner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview do banner"
                    className="w-full h-48 object-cover rounded-lg border"
                    onError={() => setImagePreview('')}
                  />
                  <div className="space-y-2">
                    <h3 className="font-semibold">{form.watch('title') || 'Título do Banner'}</h3>
                    {form.watch('description') && (
                      <p className="text-sm text-muted-foreground">{form.watch('description')}</p>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {getPositionLabel(form.watch('position'))}
                      </Badge>
                      <Badge variant={form.watch('isActive') ? 'default' : 'secondary'}>
                        {form.watch('isActive') ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Adicione uma URL de imagem para ver o preview</p>
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
                <strong>Dimensões recomendadas:</strong>
                <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                  <li>Hero: 1200x600px</li>
                  <li>Sidebar: 400x600px</li>
                  <li>Footer: 1200x200px</li>
                </ul>
              </div>
              <div>
                <strong>Formatos suportados:</strong>
                <p className="text-muted-foreground">JPG, PNG, WebP</p>
              </div>
              <div>
                <strong>Tamanho máximo:</strong>
                <p className="text-muted-foreground">2MB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}