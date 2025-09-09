import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Car, Plus, Search, Filter, Fuel, Calendar, MapPin, Edit, Eye, Wrench, Trash2 } from 'lucide-react';

// Mock data
const mockVehicles = [
  {
    id: '1',
    model: 'Honda CB 600F Hornet',
    brand: 'Honda',
    year: 2023,
    plate: 'ABC-1234',
    color: 'Vermelho',
    chassisNumber: '9BD12345678901234',
    fuelType: 'gasoline' as const,
    status: 'available' as const,
    dailyRate: 85,
    mileage: 12500,
    lastMaintenance: '2024-01-15',
    location: 'Pátio Principal'
  },
  {
    id: '2',
    model: 'Yamaha MT-07',
    brand: 'Yamaha',
    year: 2023,
    plate: 'XYZ-5678',
    color: 'Azul',
    chassisNumber: '9BD56789012345678',
    fuelType: 'gasoline' as const,
    status: 'rented' as const,
    dailyRate: 95,
    mileage: 8200,
    lastMaintenance: '2024-01-10',
    location: 'Em uso',
    currentRenter: 'Ana Paula'
  },
  {
    id: '3',
    model: 'Kawasaki Ninja 300',
    brand: 'Kawasaki',
    year: 2022,
    plate: 'MOT-9012',
    color: 'Verde',
    chassisNumber: '9BD90123456789012',
    fuelType: 'gasoline' as const,
    status: 'maintenance' as const,
    dailyRate: 75,
    mileage: 25800,
    lastMaintenance: '2024-01-20',
    location: 'Oficina'
  }
];

export default function Veiculos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles] = useState(mockVehicles);

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Veículo excluído",
        description: "O veículo foi removido com sucesso.",
      });
      
      // Em um app real, aqui você removeria o veículo da lista
      console.log('Veículo excluído:', vehicleId);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o veículo.",
        variant: "destructive",
      });
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success text-white">Disponível</Badge>;
      case 'rented':
        return <Badge className="bg-primary text-white">Alugado</Badge>;
      case 'maintenance':
        return <Badge className="bg-warning text-white">Manutenção</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFuelTypeBadge = (fuelType: string) => {
    const types = {
      'gasoline': 'Gasolina',
      'ethanol': 'Etanol', 
      'flex': 'Flex',
      'electric': 'Elétrico'
    };
    
    return <Badge variant="outline">{types[fuelType as keyof typeof types] || fuelType}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
            <Car className="h-8 w-8 text-primary" />
            Veículos
          </h1>
          <p className="text-muted-foreground">
            Gerencie a frota de veículos da loja
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark"
          onClick={() => navigate('/veiculos/novo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Veículo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {mockVehicles.filter(v => v.status === 'available').length}
              </div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockVehicles.filter(v => v.status === 'rented').length}
              </div>
              <p className="text-sm text-muted-foreground">Alugados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {mockVehicles.filter(v => v.status === 'maintenance').length}
              </div>
              <p className="text-sm text-muted-foreground">Em Manutenção</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(mockVehicles.reduce((acc, v) => acc + v.dailyRate, 0) / mockVehicles.length)}
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
                  placeholder="Buscar por modelo, placa ou chassi..." 
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
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

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{vehicle.model}</CardTitle>
                {getStatusBadge(vehicle.status)}
              </div>
              <CardDescription>
                {vehicle.brand} • {vehicle.year} • {vehicle.color}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Placa</div>
                    <div className="font-mono font-medium">{vehicle.plate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Quilometragem</div>
                    <div className="font-medium">{vehicle.mileage.toLocaleString()} km</div>
                  </div>
                </div>

                {/* Fuel and Rate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    {getFuelTypeBadge(vehicle.fuelType)}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{formatCurrency(vehicle.dailyRate)}</div>
                    <div className="text-xs text-muted-foreground">por dia</div>
                  </div>
                </div>

                {/* Location and Status Info */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{vehicle.location}</span>
                  </div>
                  
                  {vehicle.currentRenter && (
                    <div className="text-sm text-muted-foreground">
                      Cliente: <span className="font-medium text-foreground">{vehicle.currentRenter}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Última manutenção: {formatDate(vehicle.lastMaintenance)}
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
                      onClick={() => navigate(`/veiculos/${vehicle.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/veiculos/${vehicle.id}/editar`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Wrench className="h-4 w-4 mr-1" />
                      Manutenção
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o veículo {vehicle.model}? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteVehicle(vehicle.id)}
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
              <span className="text-sm">Novo Veículo</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Wrench className="h-5 w-5" />
              <span className="text-sm">Agendar Manutenção</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Histórico</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Car className="h-5 w-5" />
              <span className="text-sm">Relatório de Frota</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}