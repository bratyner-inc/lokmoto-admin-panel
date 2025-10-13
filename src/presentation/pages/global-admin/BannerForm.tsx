import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBanner, useBanners } from '@/presentation/hooks/useBanners';
import { BannerPosition } from '@/domain/entities/Banner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const bannerSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  position: z.enum(['hero', 'sidebar', 'footer'] as const),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export default function BannerForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const { banner, loading: loadingBanner } = useBanner(id || '');
  const { createBanner, updateBanner } = useBanners();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      position: 'hero',
      isActive: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (banner && isEditing) {
      setValue('title', banner.title);
      setValue('description', banner.description || '');
      setValue('position', banner.position);
      setValue('isActive', banner.isActive);
      if (banner.startDate) {
        setValue('startDate', banner.startDate.toISOString().split('T')[0]);
      }
      if (banner.endDate) {
        setValue('endDate', banner.endDate.toISOString().split('T')[0]);
      }
      setImagePreview(banner.imageUrl);
    }
  }, [banner, isEditing, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: BannerFormData) => {
    if (!isEditing && !imageFile) {
      toast.error('Imagem é obrigatória para criar um banner');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        // Update existing banner
        await updateBanner(id, {
          title: data.title,
          description: data.description,
          imageFile: imageFile || undefined,
          position: data.position as BannerPosition,
          isActive: data.isActive,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        });
        toast.success('Banner atualizado com sucesso!');
      } else {
        // Create new banner
        await createBanner({
          title: data.title,
          description: data.description,
          imageFile: imageFile!,
          position: data.position as BannerPosition,
          isActive: data.isActive,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        });
        toast.success('Banner criado com sucesso!');
      }

      navigate('/banners');
    } catch (error) {
      toast.error(`Erro ao salvar banner: ${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditing && loadingBanner) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/banners')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Banner' : 'Novo Banner'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados do banner' : 'Crie um novo banner promocional'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagem do Banner
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Faça upload de uma nova imagem (opcional)' : 'Faça upload da imagem do banner *'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="max-w-md"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>

              {imagePreview && (
                <div className="relative max-w-2xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto rounded-lg border-2 border-dashed"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados do banner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Ex: Promoção de Verão 2024"
                />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descrição do banner (opcional)"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Posição *</Label>
                  <Select
                    value={watch('position')}
                    onValueChange={(value) => setValue('position', value as BannerPosition)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero (Principal)</SelectItem>
                      <SelectItem value="sidebar">Sidebar (Lateral)</SelectItem>
                      <SelectItem value="footer">Footer (Rodapé)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.position && (
                    <p className="text-xs text-destructive mt-1">{errors.position.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Banner ativo</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Período de Exibição</CardTitle>
            <CardDescription>
              Defina o período de validade do banner (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/banners')}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Banner')}
          </Button>
        </div>
      </form>
    </div>
  );
}


