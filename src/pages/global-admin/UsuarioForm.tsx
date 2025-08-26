import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Shield, Mail, Phone, Building, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole, Permission, PERMISSIONS } from '@/types';

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  role: z.nativeEnum(UserRole),
  storeId: z.string().optional(),
  isActive: z.boolean(),
  permissions: z.array(z.string()),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

// Mock data
const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@lokmoto.com',
  phone: '(11) 99999-9999',
  role: UserRole.STORE_ADMIN,
  storeId: 'store-sp',
  isActive: true,
  permissions: [PERMISSIONS.MANAGE_VEHICLES, PERMISSIONS.MANAGE_CONTRACTS],
  createdAt: '2024-01-01T00:00:00Z',
};

const mockStores = [
  { id: 'store-sp', name: 'Loja São Paulo' },
  { id: 'store-rj', name: 'Loja Rio de Janeiro' },
  { id: 'store-mg', name: 'Loja Minas Gerais' },
];

const rolePermissions = {
  [UserRole.GLOBAL_ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_FINANCIAL,
    PERMISSIONS.MANAGE_BANNERS,
    PERMISSIONS.MANAGE_STORES,
  ],
  [UserRole.STORE_ADMIN]: [
    PERMISSIONS.MANAGE_VEHICLES,
    PERMISSIONS.MANAGE_CONTRACTS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.MANAGE_PROPOSALS,
    PERMISSIONS.VIEW_CLIENTS,
  ],
  [UserRole.STORE_EMPLOYEE]: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_CONTRACTS,
    PERMISSIONS.VIEW_CLIENTS,
  ],
};

export default function UsuarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STORE_EMPLOYEE);

  const isEditing = Boolean(id);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: UserRole.STORE_EMPLOYEE,
      storeId: '',
      isActive: true,
      permissions: [],
      password: '',
      confirmPassword: '',
    },
  });

  // Simulate loading user data for editing
  useEffect(() => {
    if (isEditing) {
      // In a real app, this would be an API call
      setTimeout(() => {
        form.reset({
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          role: mockUser.role,
          storeId: mockUser.storeId,
          isActive: mockUser.isActive,
          permissions: mockUser.permissions,
        });
        setSelectedRole(mockUser.role);
      }, 500);
    }
  }, [isEditing, form]);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: isEditing ? 'Usuário atualizado!' : 'Usuário criado!',
        description: `Usuário "${data.name}" foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });
      
      navigate('/usuarios');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.GLOBAL_ADMIN:
        return 'Admin Global';
      case UserRole.STORE_ADMIN:
        return 'Admin de Loja';
      case UserRole.STORE_EMPLOYEE:
        return 'Funcionário';
      default:
        return role;
    }
  };

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      [PERMISSIONS.MANAGE_USERS]: 'Gerenciar Usuários',
      [PERMISSIONS.MANAGE_CLIENTS]: 'Gerenciar Clientes',
      [PERMISSIONS.MANAGE_FINANCIAL]: 'Gerenciar Financeiro',
      [PERMISSIONS.MANAGE_BANNERS]: 'Gerenciar Banners',
      [PERMISSIONS.MANAGE_STORES]: 'Gerenciar Lojas',
      [PERMISSIONS.MANAGE_VEHICLES]: 'Gerenciar Veículos',
      [PERMISSIONS.MANAGE_CONTRACTS]: 'Gerenciar Contratos',
      [PERMISSIONS.MANAGE_PAYMENTS]: 'Gerenciar Pagamentos',
      [PERMISSIONS.MANAGE_PROPOSALS]: 'Gerenciar Propostas',
      [PERMISSIONS.VIEW_CLIENTS]: 'Visualizar Clientes',
      [PERMISSIONS.VIEW_VEHICLES]: 'Visualizar Veículos',
      [PERMISSIONS.VIEW_CONTRACTS]: 'Visualizar Contratos',
    };
    return labels[permission] || permission;
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    form.setValue('role', role);
    
    // Auto-assign default permissions based on role
    const defaultPermissions = rolePermissions[role] || [];
    form.setValue('permissions', defaultPermissions);
    
    // Clear store selection for global admin
    if (role === UserRole.GLOBAL_ADMIN) {
      form.setValue('storeId', '');
    }
  };

  const availablePermissions = Object.values(PERMISSIONS);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/usuarios')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Modifique as informações do usuário' : 'Crie um novo usuário do sistema'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados pessoais e de contato do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="email@exemplo.com"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="(11) 99999-9999"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Password fields (only for new users or when changing) */}
                  {(!isEditing || form.watch('password')) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{isEditing ? 'Nova Senha' : 'Senha *'}</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Digite a senha"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Senha</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Confirme a senha"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Active Status */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Usuário Ativo</FormLabel>
                          <FormDescription>
                            Usuário pode acessar o sistema
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Role and Store */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Função e Acesso
              </CardTitle>
              <CardDescription>
                Defina o papel e a loja do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função *</FormLabel>
                    <Select onValueChange={handleRoleChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.GLOBAL_ADMIN}>
                          Admin Global
                        </SelectItem>
                        <SelectItem value={UserRole.STORE_ADMIN}>
                          Admin de Loja
                        </SelectItem>
                        <SelectItem value={UserRole.STORE_EMPLOYEE}>
                          Funcionário
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Store Selection (only for non-global admin) */}
              {selectedRole !== UserRole.GLOBAL_ADMIN && (
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loja *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a loja" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockStores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {store.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissões
              </CardTitle>
              <CardDescription>
                Selecione as permissões específicas do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePermissions.map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, permission])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== permission
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {getPermissionLabel(permission)}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary-dark"
              onClick={form.handleSubmit(onSubmit)}
            >
              {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Usuário' : 'Criar Usuário')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/usuarios')}
            >
              Cancelar
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* User Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>
                Visualização das configurações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm text-muted-foreground">
                  {form.watch('name') || 'Nome do usuário'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">
                  {form.watch('email') || 'email@exemplo.com'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Função</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {getRoleLabel(selectedRole)}
                  </Badge>
                </div>
              </div>

              {selectedRole !== UserRole.GLOBAL_ADMIN && form.watch('storeId') && (
                <div>
                  <Label className="text-sm font-medium">Loja</Label>
                  <p className="text-sm text-muted-foreground">
                    {mockStores.find(s => s.id === form.watch('storeId'))?.name || 'Não selecionada'}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge variant={form.watch('isActive') ? 'default' : 'secondary'}>
                    {form.watch('isActive') ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Permissões ({form.watch('permissions')?.length || 0})</Label>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {form.watch('permissions')?.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs block w-fit">
                      {getPermissionLabel(permission)}
                    </Badge>
                  )) || <p className="text-xs text-muted-foreground">Nenhuma permissão selecionada</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Admin Global:</strong>
                <p className="text-muted-foreground">Acesso total ao sistema, todas as lojas</p>
              </div>
              <div>
                <strong>Admin de Loja:</strong>
                <p className="text-muted-foreground">Gerencia uma loja específica</p>
              </div>
              <div>
                <strong>Funcionário:</strong>
                <p className="text-muted-foreground">Acesso limitado às operações básicas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}