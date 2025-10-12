import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBanners } from '@/presentation/hooks/useBanners';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/shared/utils/formatters';

const positionLabels = {
  hero: 'Hero',
  sidebar: 'Sidebar',
  footer: 'Footer',
};

const positionColors = {
  hero: 'bg-primary text-white',
  sidebar: 'bg-secondary text-secondary-foreground',
  footer: 'bg-muted text-muted-foreground',
};

export default function Banners() {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { banners, loading, error, deleteBanner, toggleActive } = useBanners();

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteBanner(deletingId);
      toast.success('Banner excluído com sucesso');
      setDeletingId(null);
    } catch (error) {
      toast.error(`Erro ao excluir banner: ${(error as Error).message}`);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive(id);
      toast.success('Status do banner atualizado com sucesso');
    } catch (error) {
      toast.error(`Erro ao atualizar status: ${(error as Error).message}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar banners: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            Banners
          </h1>
          <p className="text-muted-foreground">
            Gerencie banners e campanhas promocionais
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/banners/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{banners.length}</div>
                <p className="text-sm text-muted-foreground">Total de Banners</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {banners.filter(b => b.isActive).length}
                </div>
                <p className="text-sm text-muted-foreground">Banners Ativos</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {banners.filter(b => b.position === 'hero').length}
                </div>
                <p className="text-sm text-muted-foreground">Banners Hero</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {banners.filter(b => b.endDate && new Date(b.endDate) < new Date()).length}
                </div>
                <p className="text-sm text-muted-foreground">Expirados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum banner cadastrado</p>
              <Button onClick={() => navigate('/banners/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Banner
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="shadow-card hover:shadow-elegant transition-shadow">
              <div className="relative">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className={positionColors[banner.position]}>
                    {positionLabels[banner.position]}
                  </Badge>
                  {banner.isActive ? (
                    <Badge className="bg-success text-success-foreground">Ativo</Badge>
                  ) : (
                    <Badge variant="destructive">Inativo</Badge>
                  )}
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{banner.title}</CardTitle>
                {banner.description && (
                  <CardDescription>{banner.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Dates */}
                  <div className="text-sm text-muted-foreground">
                    {banner.startDate && banner.endDate ? (
                      <>
                        <div>Início: {formatDate(banner.startDate)}</div>
                        <div>Fim: {formatDate(banner.endDate)}</div>
                      </>
                    ) : (
                      <div>Criado em: {formatDate(banner.createdAt)}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={banner.isActive ? "text-warning" : "text-success"}
                      onClick={() => handleToggleActive(banner.id)}
                    >
                      {banner.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/banners/editar/${banner.id}`)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(banner.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie seus banners de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/banners/novo')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Banner Hero</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/banners/novo')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Banner Sidebar</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm">Visualizar no Site</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
            >
              <ImageIcon className="h-6 w-6" />
              <span className="text-sm">Galeria de Imagens</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este banner? 
              A imagem também será removida do storage. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


