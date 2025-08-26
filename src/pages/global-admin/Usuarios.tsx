import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, Search, Edit, Trash2, Eye, EyeOff, Filter, Shield, Building, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

// Mock data
const mockUsers = [
  { 
    id: '1', 
    name: 'Admin Global', 
    email: 'admin@lokmoto.com', 
    phone: '(11) 99999-9999',
    role: UserRole.GLOBAL_ADMIN,
    permissions: ['manage_users', 'manage_clients', 'manage_financial'],
    isActive: true,
    lastLogin: '2024-01-22T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  { 
    id: '2', 
    name: 'João Silva', 
    email: 'joao.silva@lokmoto.com', 
    phone: '(11) 88888-8888',
    role: UserRole.STORE_ADMIN,
    storeId: 'store-sp-001',
    storeName: 'LokMoto São Paulo',
    permissions: ['manage_vehicles', 'manage_contracts'],
    isActive: true,
    lastLogin: '2024-01-22T09:15:00Z',
    createdAt: '2024-01-10T00:00:00Z'
  },
  { 
    id: '3', 
    name: 'Maria Santos', 
    email: 'maria.santos@lokmoto.com', 
    phone: '(21) 77777-7777',
    role: UserRole.STORE_EMPLOYEE,
    storeId: 'store-rj-001',
    storeName: 'LokMoto Rio de Janeiro',
    permissions: ['view_vehicles', 'view_contracts'],
    isActive: false,
    lastLogin: '2024-01-20T14:20:00Z',
    createdAt: '2024-01-05T00:00:00Z'
  },
];

export default function Usuarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.GLOBAL_ADMIN:
        return <Badge className="bg-primary text-white">Admin Global</Badge>;
      case UserRole.STORE_ADMIN:
        return <Badge variant="secondary">Admin Loja</Badge>;
      case UserRole.STORE_EMPLOYEE:
        return <Badge variant="outline">Funcionário</Badge>;
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={() => navigate('/usuarios/novo')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

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
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers
                  .filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {getRoleBadge(user.role)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.storeId ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          {user.storeName}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Todas as lojas</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.isActive)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={user.isActive ? "text-warning" : "text-success"}
                        >
                          {user.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/usuarios/editar/${user.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário "{user.name}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie usuários de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/usuarios/novo')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Admin Global</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/usuarios/novo')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Criar Admin Loja</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Filter className="h-6 w-6" />
              <span className="text-sm">Filtrar por Loja</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm">Gerenciar Permissões</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function handleDeleteUser(userId: string) {
    // Simulate API call
    toast({
      title: 'Usuário excluído',
      description: 'O usuário foi excluído com sucesso.',
    });
  }
}