import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Eye, MessageSquare, FileText } from 'lucide-react';

// Mock data específico para a loja
const mockStoreClients = [
  { 
    id: '1', 
    name: 'Carlos Mendes', 
    email: 'carlos.mendes@email.com', 
    phone: '(11) 98765-4321',
    cpf: '111.222.333-44',
    status: 'active' as const,
    activeContracts: 1,
    totalSpent: 4500,
    lastRental: '2024-01-20'
  },
  { 
    id: '2', 
    name: 'Ana Paula', 
    email: 'ana.paula@email.com', 
    phone: '(11) 87654-3210',
    cpf: '222.333.444-55',
    status: 'active' as const,
    activeContracts: 2,
    totalSpent: 8200,
    lastRental: '2024-01-22'
  },
];

export default function ClientesLoja() {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Clientes da Loja
          </h1>
          <p className="text-muted-foreground">
            Gerencie os clientes da sua loja
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar clientes..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockStoreClients.length}</div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {mockStoreClients.reduce((acc, c) => acc + c.activeContracts, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(mockStoreClients.reduce((acc, c) => acc + c.totalSpent, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStoreClients.map((client) => (
          <Card key={client.id} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                {getStatusBadge(client.status)}
              </div>
              <CardDescription>{client.email}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-medium">{client.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPF:</span>
                    <span className="font-mono text-sm">{client.cpf}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{client.activeContracts}</div>
                      <div className="text-xs text-muted-foreground">Contratos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-success">{formatCurrency(client.totalSpent)}</div>
                      <div className="text-xs text-muted-foreground">Total Gasto</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Último aluguel: {new Date(client.lastRental).toLocaleDateString('pt-BR')}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Contato
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-1" />
                    Contrato
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}