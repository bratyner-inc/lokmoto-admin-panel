import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useMotorcycles } from '@/hooks/useMotorcycles';
import { Car, Plus, Search, Filter, Calendar, MapPin, Edit, Eye, Trash2, Bike, Loader2 } from 'lucide-react';

export default function Veiculos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { motorcycles, isLoading, deleteMotorcycle, isDeleting } = useMotorcycles();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteMotorcycle(vehicleId);
      
      toast({
        title: "Motocicleta excluída",
        description: "A motocicleta foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir motocicleta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir a motocicleta.",
        variant: "destructive",
      });
    }
  };

  const filteredMotorcycles = motorcycles.filter(motorcycle => {
    const search = searchTerm.toLowerCase();
    return (
      motorcycle.model.toLowerCase().includes(search) ||
      motorcycle.brand.toLowerCase().includes(search) ||
      motorcycle.plate.toLowerCase().includes(search) ||
      motorcycle.chassis.toLowerCase().includes(search)
    );
  });
  const getStatusBadge = (isAvailable: boolean) => {
    if (isAvailable) {
      return <Badge className="bg-success text-white">Disponível</Badge>;
    }
    return <Badge variant="destructive">Indisponível</Badge>;
  };

  if (isLoading) {
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
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bike className="h-8 w-8 text-primary" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {motorcycles.length}
              </div>
              <p className="text-sm text-muted-foreground">Total de Motocicletas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {motorcycles.filter(m => m.isAvailable).length}
              </div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {motorcycles.filter(m => !m.isAvailable).length}
              </div>
              <p className="text-sm text-muted-foreground">Indisponíveis</p>
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
                  placeholder="Buscar por modelo, marca, placa ou chassi..." 
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredMotorcycles.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Bike className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              {searchTerm ? 'Nenhuma motocicleta encontrada' : 'Nenhuma motocicleta cadastrada'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece cadastrando sua primeira motocicleta'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/veiculos/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Motocicleta
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Motorcycles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMotorcycles.map((motorcycle) => (
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
                  <div>
                    <div className="text-muted-foreground">RENAVAM</div>
                    <div className="font-mono text-xs">{motorcycle.renavam}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Chassi</div>
                    <div className="font-mono text-xs truncate" title={motorcycle.chassis}>
                      {motorcycle.chassis.substring(0, 8)}...
                    </div>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a motocicleta {motorcycle.brand} {motorcycle.model}? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteVehicle(motorcycle.id)}
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
      {motorcycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <Bike className="h-5 w-5" />
                <span className="text-sm">Relatório de Frota</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}