import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Car, 
  ArrowLeft, 
  Edit, 
  Calendar, 
  MapPin, 
  Settings,
  DollarSign,
  Info,
  FileText,
  ImageIcon
} from 'lucide-react';
import { useMotorcycle } from '@/presentation/hooks/useMotorcycles';
import { useVehicleCategories } from '@/presentation/hooks/useVehicleCategories';
import { formatCurrency, formatDate, formatPlate } from '@/shared/utils/formatters';

export default function VeiculoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { motorcycle, loading, error } = useMotorcycle(id || '');
  const { categories } = useVehicleCategories();

  // Get category name
  const categoryName = motorcycle?.categoryId 
    ? categories.find(c => c.id === motorcycle.categoryId)?.name 
    : 'Não especificada';

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !motorcycle) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/veiculos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Motocicleta não encontrada</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Motocicleta não encontrada</h3>
            <p className="text-muted-foreground mb-6">
              A motocicleta solicitada não existe ou você não tem permissão para visualizá-la.
            </p>
            <Button onClick={() => navigate('/veiculos')}>
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (isAvailable: boolean) => {
    if (isAvailable) {
      return <Badge className="bg-green-500 text-white">Disponível</Badge>;
    }
    return <Badge className="bg-yellow-500 text-white">Indisponível</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {motorcycle.brand} {motorcycle.model}
            </h1>
            <p className="text-muted-foreground">
              {motorcycle.version} • {motorcycle.year}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(motorcycle.isAvailable)}
          <Button onClick={() => navigate(`/veiculos/${id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      {motorcycle.images && motorcycle.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Galeria de Imagens ({motorcycle.images.length})
            </CardTitle>
            <CardDescription>
              Imagens da motocicleta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {motorcycle.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors group cursor-pointer"
                  onClick={() => window.open(imageUrl, '_blank')}
                >
                  <img
                    src={imageUrl}
                    alt={`${motorcycle.brand} ${motorcycle.model} - Imagem ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Marca</div>
                  <div className="font-medium">{motorcycle.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Modelo</div>
                  <div className="font-medium">{motorcycle.model}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Versão</div>
                  <div className="font-medium">{motorcycle.version}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ano</div>
                  <div className="font-medium">{motorcycle.year}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Cor</div>
                  <div className="font-medium">{motorcycle.color}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Categoria</div>
                  <div className="font-medium">{categoryName}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Especificações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Cilindrada</div>
                  <div className="font-medium">{motorcycle.engineCapacity}cc</div>
                </div>
                {motorcycle.dailyRate && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Valor da Diária</div>
                    <div className="font-medium text-primary text-lg">
                      {formatCurrency(motorcycle.dailyRate)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Placa</div>
                  <div className="font-mono font-medium text-lg">{formatPlate(motorcycle.plate)}</div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Renavam</div>
                    <div className="font-mono text-sm">{motorcycle.renavam}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Chassis</div>
                    <div className="font-mono text-sm">{motorcycle.chassis}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Disponibilidade</div>
                {getStatusBadge(motorcycle.isAvailable)}
              </div>
              
              {motorcycle.dailyRate && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <DollarSign className="h-4 w-4" />
                      Valor da Diária
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(motorcycle.dailyRate)}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Cadastrado em
                </div>
                <div className="font-medium">{formatDate(motorcycle.createdAt)}</div>
              </div>
              
              {motorcycle.updatedAt.getTime() !== motorcycle.createdAt.getTime() && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Última atualização
                    </div>
                    <div className="font-medium">{formatDate(motorcycle.updatedAt)}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => navigate(`/veiculos/${id}/editar`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Motocicleta
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/veiculos')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

