import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin,
  FileText,
  Eye,
  Download
} from 'lucide-react';

// Mock data
const mockClient = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(11) 99999-9999',
  cpf: '123.456.789-00',
  birthDate: '1990-01-15',
  status: 'active' as const,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
  address: {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
  },
  totalContracts: 3,
  activeContracts: 1,
  totalRevenue: 45000.00,
};

const mockContracts = [
  {
    id: '1',
    vehicleModel: 'Honda CB 600F Hornet',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    dailyRate: 150.00,
    totalAmount: 4650.00,
    status: 'active' as const,
    paymentStatus: 'paid' as const,
  },
  {
    id: '2',
    vehicleModel: 'Yamaha MT-07',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    dailyRate: 120.00,
    totalAmount: 3720.00,
    status: 'completed' as const,
    paymentStatus: 'paid' as const,
  },
  {
    id: '3',
    vehicleModel: 'Kawasaki Ninja 400',
    startDate: '2023-10-15',
    endDate: '2023-11-15',
    dailyRate: 135.00,
    totalAmount: 4185.00,
    status: 'completed' as const,
    paymentStatus: 'paid' as const,
  },
];

export default function ClienteDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-white">Ativo</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContractStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-primary text-white">Ativo</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-success text-white">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'partial':
        return <Badge variant="outline" className="border-warning text-warning">Parcial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/clientes')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              {mockClient.name}
            </h1>
            <p className="text-muted-foreground">
              Cliente desde {new Date(mockClient.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(`/clientes/editar/${id}`)}
          className="bg-primary hover:bg-primary-dark"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockClient.totalContracts}</div>
              <p className="text-sm text-muted-foreground">Total de Contratos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{mockClient.activeContracts}</div>
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                R$ {mockClient.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(mockClient.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                <p className="font-mono">{mockClient.cpf}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                  <p>{mockClient.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                  <p>{mockClient.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
                  <p>{new Date(mockClient.birthDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                {mockClient.address.street}, {mockClient.address.number}
                {mockClient.address.complement && ` - ${mockClient.address.complement}`}
              </p>
              <p className="text-muted-foreground">
                {mockClient.address.neighborhood}, {mockClient.address.city} - {mockClient.address.state}
              </p>
              <p className="text-muted-foreground font-mono">
                CEP: {mockClient.address.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Contratos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Contratos
          </CardTitle>
          <CardDescription>
            Todos os contratos do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Diária</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.vehicleModel}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(contract.startDate).toLocaleDateString('pt-BR')}</div>
                      <div className="text-muted-foreground">
                        até {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    R$ {contract.dailyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {contract.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {getContractStatusBadge(contract.status)}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(contract.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}