import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

// Mock data
const mockBanners = [
  {
    id: '1',
    title: 'Promoção de Verão 2024',
    description: 'Desconto especial para contratos de longa duração',
    imageUrl: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=Banner+1',
    position: 'hero' as const,
    isActive: true,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Nova Frota Disponível',
    description: 'Motos 2024 já disponíveis para locação',
    imageUrl: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=Banner+2',
    position: 'sidebar' as const,
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Black Friday',
    description: 'Ofertas imperdíveis por tempo limitado',
    imageUrl: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=Banner+3',
    position: 'footer' as const,
    isActive: false,
    startDate: '2023-11-20',
    endDate: '2023-11-30',
    createdAt: '2023-11-01T00:00:00Z'
  },
];

export default function Banners() {
  const getPositionBadge = (position: string) => {
    switch (position) {
      case 'hero':
        return <Badge className="bg-primary text-white">Hero</Badge>;
      case 'sidebar':
        return <Badge variant="secondary">Sidebar</Badge>;
      case 'footer':
        return <Badge variant="outline">Footer</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

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
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockBanners.length}</div>
              <p className="text-sm text-muted-foreground">Total de Banners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {mockBanners.filter(b => b.isActive).length}
              </div>
              <p className="text-sm text-muted-foreground">Banners Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockBanners.filter(b => b.position === 'hero').length}
              </div>
              <p className="text-sm text-muted-foreground">Banners Hero</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {mockBanners.filter(b => b.endDate && new Date(b.endDate) < new Date()).length}
              </div>
              <p className="text-sm text-muted-foreground">Expirados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBanners.map((banner) => (
          <Card key={banner.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <div className="relative">
              <img 
                src={banner.imageUrl} 
                alt={banner.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {getPositionBadge(banner.position)}
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
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Banner Hero</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Banner Sidebar</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Eye className="h-6 w-6" />
              <span className="text-sm">Visualizar no Site</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Image className="h-6 w-6" />
              <span className="text-sm">Galeria de Imagens</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}