import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserCog, Plus, Search, Shield, Edit, Trash2 } from 'lucide-react';
import { UserRole } from '@/types';

// Mock data
const mockUsers = [
  { 
    id: '1', 
    name: 'Admin Global', 
    email: 'admin@lokmoto.com', 
    role: UserRole.GLOBAL_ADMIN,
    isActive: true,
    lastLogin: '2024-01-22T10:30:00Z',
    createdAt: '2024-01-01'
  },
  { 
    id: '2', 
    name: 'Admin Loja SP', 
    email: 'loja.sp@lokmoto.com', 
    role: UserRole.STORE_ADMIN,
    storeId: 'store-sp-001',
    storeName: 'LokMoto São Paulo',
    isActive: true,
    lastLogin: '2024-01-22T09:15:00Z',
    createdAt: '2024-01-10'
  },
  { 
    id: '3', 
    name: 'Admin Loja RJ', 
    email: 'loja.rj@lokmoto.com', 
    role: UserRole.STORE_ADMIN,
    storeId: 'store-rj-001',
    storeName: 'LokMoto Rio de Janeiro',
    isActive: false,
    lastLogin: '2024-01-20T14:20:00Z',
    createdAt: '2024-01-05'
  },
];

export default function Usuarios() {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.GLOBAL_ADMIN:
        return <Badge className="bg-primary text-white">Admin Global</Badge>;
      case UserRole.STORE_ADMIN:
        return <Badge variant="secondary">Admin Loja</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
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
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar usuários por nome ou e-mail..." 
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
              <div className="text-2xl font-bold text-primary">{mockUsers.length}</div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {mockUsers.filter(u => u.isActive).length}
              </div>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mockUsers.filter(u => u.role === UserRole.GLOBAL_ADMIN).length}
              </div>
              <p className="text-sm text-muted-foreground">Admins Globais</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Todos os usuários com acesso ao sistema administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Função</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Loja</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Último Login</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground">{user.email}</td>
                    <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-4 px-4">
                      {user.storeName ? (
                        <div className="text-sm">
                          <div className="font-medium text-foreground">{user.storeName}</div>
                          <div className="text-muted-foreground">{user.storeId}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(user.isActive)}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Shield className="h-4 w-4" />
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