import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  ArrowLeft, 
  Edit, 
  Wrench, 
  Calendar, 
  MapPin, 
  Fuel, 
  Settings,
  DollarSign,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

// Mock data expandido para detalhes
const mockVehicleDetails = {
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
  nextMaintenance: '2024-04-15',
  location: 'Pátio Principal',
  description: 'Moto em excelente estado de conservação, ideal para passeios urbanos e viagens.',
  specifications: {
    engine: '599cc, 4 cilindros',
    power: '102 cv @ 12.000 rpm',
    torque: '64 Nm @ 10.500 rpm',
    transmission: '6 marchas',
    weight: '201 kg',
    fuelCapacity: '19 litros'
  },
  documents: {
    licenseExpiry: '2024-12-15',
    insuranceExpiry: '2024-08-20',
    inspectionExpiry: '2024-10-10'
  },
  maintenance: [
    {
      id: '1',
      date: '2024-01-15',
      type: 'Revisão Geral',
      description: 'Troca de óleo, filtros e verificação geral',
      cost: 250,
      mechanic: 'João Silva'
    },
    {
      id: '2', 
      date: '2023-11-10',
      type: 'Troca de Pneus',
      description: 'Substituição dos pneus dianteiro e traseiro',
      cost: 480,
      mechanic: 'Carlos Santos'
    }
  ],
  rentals: [
    {
      id: '1',
      clientName: 'Ana Paula',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      dailyRate: 85,
      totalAmount: 425,
      status: 'completed'
    },
    {
      id: '2',
      clientName: 'Pedro Costa',
      startDate: '2024-01-10',
      endDate: '2024-01-15',
      dailyRate: 85,
      totalAmount: 425,
      status: 'completed'
    }
  ]
};

export default function VeiculoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const vehicle = mockVehicleDetails; // Em um app real, buscar pelo ID

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

  const getMaintenanceStatusColor = (date: string) => {
    const today = new Date();
    const maintenanceDate = new Date(date);
    const diffDays = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return 'text-destructive';
    if (diffDays < 30) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/veiculos')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              {vehicle.model}
            </h1>
            <p className="text-muted-foreground">
              {vehicle.brand} • {vehicle.year} • {vehicle.plate}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <Wrench className="h-4 w-4 mr-2" />
            Manutenção
          </Button>
          <Button className="bg-primary hover:bg-primary-dark">
            <DollarSign className="h-4 w-4 mr-2" />
            Alugar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {getStatusBadge(vehicle.status)}
              <p className="text-sm text-muted-foreground mt-2">Status Atual</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(vehicle.dailyRate)}</div>
              <p className="text-sm text-muted-foreground">Diária</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{vehicle.mileage.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Quilometragem</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getMaintenanceStatusColor(vehicle.nextMaintenance)}`}>
                {formatDate(vehicle.nextMaintenance)}
              </div>
              <p className="text-sm text-muted-foreground">Próxima Revisão</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="rentals">Histórico</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Modelo</div>
                    <div className="font-medium">{vehicle.model}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Marca</div>
                    <div className="font-medium">{vehicle.brand}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Ano</div>
                    <div className="font-medium">{vehicle.year}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cor</div>
                    <div className="font-medium">{vehicle.color}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Placa</div>
                    <div className="font-mono font-medium">{vehicle.plate}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Chassi</div>
                    <div className="font-mono text-xs">{vehicle.chassisNumber}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    {getFuelTypeBadge(vehicle.fuelType)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{vehicle.location}</span>
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-sm mb-2">Descrição</div>
                  <p className="text-sm">{vehicle.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Especificações Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Especificações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Motor</span>
                    <span className="font-medium">{vehicle.specifications.engine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potência</span>
                    <span className="font-medium">{vehicle.specifications.power}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Torque</span>
                    <span className="font-medium">{vehicle.specifications.torque}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transmissão</span>
                    <span className="font-medium">{vehicle.specifications.transmission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso</span>
                    <span className="font-medium">{vehicle.specifications.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanque</span>
                    <span className="font-medium">{vehicle.specifications.fuelCapacity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Histórico de Manutenção
              </CardTitle>
              <CardDescription>
                Registro completo das manutenções realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.maintenance.map((maintenance) => (
                  <div key={maintenance.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(maintenance.date)}</span>
                      </div>
                      <Badge variant="outline">{formatCurrency(maintenance.cost)}</Badge>
                    </div>
                    <h4 className="font-semibold">{maintenance.type}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{maintenance.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      Mecânico: {maintenance.mechanic}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rentals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Histórico de Locações
              </CardTitle>
              <CardDescription>
                Registro de todas as locações deste veículo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.rentals.map((rental) => (
                  <div key={rental.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{rental.clientName}</span>
                      </div>
                      <Badge className="bg-success text-white">
                        {formatCurrency(rental.totalAmount)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span>Período: </span>
                        <span className="text-foreground">
                          {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                        </span>
                      </div>
                      <div>
                        <span>Diária: </span>
                        <span className="text-foreground">{formatCurrency(rental.dailyRate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentação
              </CardTitle>
              <CardDescription>
                Status dos documentos obrigatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Licenciamento</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Válido até</div>
                    <div className="text-xs text-muted-foreground">{formatDate(vehicle.documents.licenseExpiry)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span>Seguro</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Expira em</div>
                    <div className="text-xs text-warning">{formatDate(vehicle.documents.insuranceExpiry)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Vistoria</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Válida até</div>
                    <div className="text-xs text-muted-foreground">{formatDate(vehicle.documents.inspectionExpiry)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}