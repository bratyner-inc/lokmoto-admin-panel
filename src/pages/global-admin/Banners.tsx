import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useBanners, useToggleBannerStatus, useDeleteBanner, deleteBannerImage } from '@/hooks/useBanners';
import { useToast } from '@/hooks/use-toast';

export default function Banners() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: banners = [], isLoading } = useBanners();
  const toggleStatusMutation = useToggleBannerStatus();
  const deleteMutation = useDeleteBanner();

  const getPositionBadge = (position: string) => {
    switch (position) {
      case 'hero':
        return <Badge className="bg-primary text-white">Hero</Badge>;
      case 'sidebar_horizontal':
        return <Badge variant="secondary">Sidebar Horizontal</Badge>;
      case 'sidebar_vertical':
        return <Badge variant="outline">Sidebar Vertical</Badge>;
      default:
        return <Badge variant="outline">{position}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-success text-white">Ativo</Badge>
    ) : (
      <Badge variant="destructive">Inativo</Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({ id, isActive: !currentStatus });
      toast({
        title: currentStatus ? "Banner desativado" : "Banner ativado",
        description: "Status atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do banner.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      // Delete image from storage first
      if (imageUrl) {
        await deleteBannerImage(imageUrl);
      }
      
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Banner excluído",
        description: "O banner foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o banner.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeBanners = banners.filter(b => b.isActive);
  const heroBanners = banners.filter(b => b.type === 'hero');
  const expiredBanners = banners.filter(b => b.endDate && new Date(b.endDate) < new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Image className="h-8 w-8 text-primary" />
            Banners
          </h1>
          <p className="text-muted-foreground">
            Gerencie banners e campanhas promocionais
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/admin/banners/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{banners.length}</div>
              <p className="text-sm text-muted-foreground">Total de Banners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{activeBanners.length}</div>
              <p className="text-sm text-muted-foreground">Banners Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{heroBanners.length}</div>
              <p className="text-sm text-muted-foreground">Banners Hero</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{expiredBanners.length}</div>
              <p className="text-sm text-muted-foreground">Expirados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Nenhum banner cadastrado</p>
              <Button onClick={() => navigate('/admin/banners/novo')}>
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
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x200/dc2626/ffffff?text=Erro+ao+Carregar';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {getPositionBadge(banner.type)}
                  {getStatusBadge(banner.isActive)}
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
                      onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                      disabled={toggleStatusMutation.isPending}
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
                        onClick={() => navigate(`/admin/banners/${banner.id}/editar`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(banner.id, banner.image)}
                        disabled={deleteMutation.isPending}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/admin/banners/novo')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Banner Hero</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/admin/banners/novo')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Banner Sidebar</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/admin/banners/novo')}
            >
              <Image className="h-6 w-6" />
              <span className="text-sm">Criar Banner Footer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
