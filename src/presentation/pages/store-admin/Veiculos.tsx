import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Car, Plus, Search, Filter, Calendar, MapPin, Edit, Eye, Wrench, Trash2 } from 'lucide-react';
import { useMotorcycles } from '@/presentation/hooks/useMotorcycles';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';

export default function Veiculos() {
  const navigate = useNavigate();
  const { motorcycles, loading, deleteMotorcycle, searchMotorcycles } = useMotorcycles();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteMotorcycle = async (id: string, model: string) => {
    try {
      await deleteMotorcycle(id);
    } catch (error) {
      console.error('Error deleting motorcycle:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchMotorcycles(query);
    }
  };

  const getStatusBadge = (isAvailable: boolean) => {
    if (isAvailable) {
      return <Badge className="bg-green-500 text-white">Disponível</Badge>;
    }
    return <Badge className="bg-yellow-500 text-white">Indisponível</Badge>;
  };

  // Calculate stats
  const availableCount = motorcycles.filter(m => m.isAvailable).length;
  const unavailableCount = motorcycles.filter(m => !m.isAvailable).length;
  const averageRate = motorcycles.length > 0
    ? motorcycles.reduce((acc, m) => acc + (m.dailyRate || 0), 0) / motorcycles.length
    : 0;

  if (loading && motorcycles.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              Motocicletas
            </h1>
            <p className="text-muted-foreground">
              Gerencie a frota de motocicletas da loja
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            Motocicletas
          </h1>
          <p className="text-muted-foreground">
            Gerencie a frota de motocicletas da loja
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/veiculos/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Motocicleta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {availableCount}
              </div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {unavailableCount}
              </div>
              <p className="text-sm text-muted-foreground">Indisponíveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {motorcycles.length}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(averageRate)}
              </div>
              <p className="text-sm text-muted-foreground">Diária Média</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input 
                  type="text"
                  placeholder="Buscar por modelo, marca ou placa..." 
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {motorcycles.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma motocicleta cadastrada</h3>
            <p className="text-muted-foreground mb-6">
              Comece cadastrando sua primeira motocicleta para gerenciar sua frota
            </p>
            <Button onClick={() => navigate('/veiculos/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Motocicleta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Motorcycles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {motorcycles.map((motorcycle) => (
          <Card key={motorcycle.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{motorcycle.brand} {motorcycle.model}</CardTitle>
                {getStatusBadge(motorcycle.isAvailable)}
              </div>
              <CardDescription>
                {motorcycle.version} • {motorcycle.year} • {motorcycle.color}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Placa</div>
                    <div className="font-mono font-medium">{motorcycle.plate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cilindrada</div>
                    <div className="font-medium">{motorcycle.engineCapacity}cc</div>
                  </div>
                </div>

                {/* Rate */}
                {motorcycle.dailyRate && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{formatCurrency(motorcycle.dailyRate)}</div>
                      <div className="text-xs text-muted-foreground">por dia</div>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Chassis: <span className="font-mono text-foreground">{motorcycle.chassis}</span></div>
                    <div>Renavam: <span className="font-mono text-foreground">{motorcycle.renavam}</span></div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Cadastrado em: {formatDate(motorcycle.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/veiculos/${motorcycle.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/veiculos/${motorcycle.id}/editar`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a motocicleta {motorcycle.brand} {motorcycle.model} ({motorcycle.plate})? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteMotorcycle(motorcycle.id, `${motorcycle.brand} ${motorcycle.model}`)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-1"
              onClick={() => navigate('/veiculos/novo')}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Nova Motocicleta</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Histórico</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Car className="h-5 w-5" />
              <span className="text-sm">Relatório de Frota</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-1"
              onClick={() => navigate('/propostas')}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Ver Propostas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

