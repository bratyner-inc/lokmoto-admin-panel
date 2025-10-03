import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Eye, Loader2, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBanner, useCreateBanner, useUpdateBanner, uploadBannerImage, deleteBannerImage } from '@/hooks/useBanners';
import { Banner } from '@/domain/entities/Banner';

const bannerSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  image: z.string().min(1, 'Imagem é obrigatória'),
  url: z.string().url('URL do link inválida').optional().or(z.literal('')),
  type: z.enum(['hero', 'sidebar_horizontal', 'sidebar_vertical']),
  isActive: z.boolean(),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const isEditing = Boolean(id);

  const { data: banner, isLoading: isLoadingBanner } = useBanner(id || '');
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      url: '',
      type: 'hero',
      isActive: true,
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    if (isEditing && banner) {
      form.reset({
        title: banner.title,
        description: banner.description || '',
        image: banner.image || '',
        url: banner.url || '',
        type: banner.type,
        isActive: banner.isActive,
        startDate: banner.startDate ? banner.startDate.toISOString().split('T')[0] : '',
        endDate: banner.endDate ? banner.endDate.toISOString().split('T')[0] : '',
      });
      setImagePreview(banner.image || '');
    }
  }, [isEditing, banner, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de imagem válido.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadBannerImage(file);
      form.setValue('image', imageUrl);
      setImagePreview(imageUrl);
      setUploadedFile(file);
      toast({
        title: 'Sucesso',
        description: 'Imagem enviada com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao enviar a imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const currentImage = form.getValues('image');
    if (currentImage) {
      try {
        await deleteBannerImage(currentImage);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    form.setValue('image', '');
    setImagePreview('');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: BannerFormData) => {
    try {
      const bannerData: Partial<Banner> = {
        title: data.title,
        description: data.description,
        image: data.image,
        url: data.url || undefined,
        type: data.type,
        isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };

      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, data: bannerData });
        toast({
          title: 'Banner atualizado!',
          description: `Banner "${data.title}" foi atualizado com sucesso.`,
        });
      } else {
        await createMutation.mutateAsync({
          ...bannerData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Banner);
        toast({
          title: 'Banner criado!',
          description: `Banner "${data.title}" foi criado com sucesso.`,
        });
      }
      
      navigate('/admin/banners');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o banner.',
        variant: 'destructive',
      });
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hero':
        return 'Hero (Principal)';
      case 'sidebar_horizontal':
        return 'Sidebar Horizontal';
      case 'sidebar_vertical':
        return 'Sidebar Vertical';
      default:
        return type;
    }
  };

  if (isEditing && isLoadingBanner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin/banners')}
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

                  {/* Image Upload */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagem *</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            
                            {imagePreview ? (
                              <div className="relative">
                                <img 
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={handleRemoveImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-32 border-dashed"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-8 w-8 mr-2" />
                                    Clique para enviar uma imagem
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          JPG, PNG ou WebP (máx. 2MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Link URL */}
                  <FormField
                    control={form.control}
                    name="url"
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

                  {/* Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hero">Hero (Principal - 1200x600px)</SelectItem>
                            <SelectItem value="sidebar_horizontal">Sidebar Horizontal (400x200px)</SelectItem>
                            <SelectItem value="sidebar_vertical">Sidebar Vertical (400x600px)</SelectItem>
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
                          <FormDescription>
                            Ativar este banner para exibição no site
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

                  {/* Submit Buttons */}
                  <div className="flex items-center gap-3 pt-6 border-t">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        isEditing ? 'Atualizar Banner' : 'Criar Banner'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/admin/banners')}
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
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">
                        {getTypeLabel(form.watch('type'))}
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
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Adicione uma imagem para ver o preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Dimensões Recomendadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Hero:</strong>
                <p className="text-muted-foreground">1200x600px (2:1)</p>
              </div>
              <div>
                <strong>Sidebar Horizontal:</strong>
                <p className="text-muted-foreground">400x200px (2:1)</p>
              </div>
              <div>
                <strong>Sidebar Vertical:</strong>
                <p className="text-muted-foreground">400x600px (2:3)</p>
              </div>
              <div className="pt-2 border-t">
                <strong>Formatos:</strong>
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
