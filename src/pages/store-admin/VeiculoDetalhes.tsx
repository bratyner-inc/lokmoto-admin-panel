import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMotorcycle } from '@/hooks/useMotorcycles';
import { 
  Car, 
  ArrowLeft, 
  Edit, 
  Loader2,
  MapPin
} from 'lucide-react';

export default function VeiculoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { motorcycle, isLoading, error } = useMotorcycle(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !motorcycle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Car className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Motocicleta não encontrada</p>
        <Button onClick={() => navigate('/veiculos')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  const getStatusBadge = (isAvailable: boolean) => {
    if (isAvailable) {
      return <Badge className="bg-success text-white">Disponível</Badge>;
    }
    return <Badge variant="destructive">Indisponível</Badge>;
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
              {motorcycle.brand} {motorcycle.model}
            </h1>
            <p className="text-muted-foreground">
              {motorcycle.version} • {motorcycle.year} • {motorcycle.plate}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/veiculos/${motorcycle.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {getStatusBadge(motorcycle.isAvailable)}
              <p className="text-sm text-muted-foreground mt-2">Status Atual</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{motorcycle.engineCapacity}cc</div>
              <p className="text-sm text-muted-foreground">Cilindrada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Modelo</div>
              <div className="font-medium">{motorcycle.model}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Marca</div>
              <div className="font-medium">{motorcycle.brand}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Versão</div>
              <div className="font-medium">{motorcycle.version}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Ano</div>
              <div className="font-medium">{motorcycle.year}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Cor</div>
              <div className="font-medium">{motorcycle.color}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Placa</div>
              <div className="font-mono font-medium">{motorcycle.plate}</div>
            </div>
            <div>
              <div className="text-muted-foreground">RENAVAM</div>
              <div className="font-mono text-xs">{motorcycle.renavam}</div>
            </div>
            <div className="col-span-2">
              <div className="text-muted-foreground">Chassi</div>
              <div className="font-mono text-xs">{motorcycle.chassis}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}