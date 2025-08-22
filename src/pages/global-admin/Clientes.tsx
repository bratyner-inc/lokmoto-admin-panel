import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

// Mock data
const mockClients = [
  { 
    id: '1', 
    name: 'João Silva', 
    email: 'joao.silva@email.com', 
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    status: 'active' as const,
    createdAt: '2024-01-15',
    totalContracts: 3
  },
  { 
    id: '2', 
    name: 'Maria Santos', 
    email: 'maria.santos@email.com', 
    phone: '(11) 88888-8888',
    cpf: '987.654.321-00',
    status: 'active' as const,
    createdAt: '2024-01-10',
    totalContracts: 1
  },
  { 
    id: '3', 
    name: 'Pedro Costa', 
    email: 'pedro.costa@email.com', 
    phone: '(11) 77777-7777',
    cpf: '555.444.333-22',
    status: 'pending' as const,
    createdAt: '2024-01-20',
    totalContracts: 0
  },
];

export default function Clientes() {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes do sistema
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Buscar por nome, e-mail ou CPF..." 
                  className="pl-10"
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockClients.length}</div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {mockClients.filter(c => c.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {mockClients.filter(c => c.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockClients.reduce((acc, c) => acc + c.totalContracts, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Contratos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Todos os clientes cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Telefone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">CPF</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contratos</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-foreground">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground">{client.email}</td>
                    <td className="py-4 px-4 text-foreground">{client.phone}</td>
                    <td className="py-4 px-4 text-foreground font-mono">{client.cpf}</td>
                    <td className="py-4 px-4">{getStatusBadge(client.status)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-primary">{client.totalContracts}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}