import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useUsers } from '@/presentation/hooks/useUsers';
import { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const usuarioSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  role: z.enum([UserRole.GLOBAL_ADMIN, UserRole.STORE_ADMIN]),
  // Para STORE_ADMIN
  tradingName: z.string().optional(),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
}).refine((data) => {
  if (data.role === UserRole.STORE_ADMIN) {
    return !!(data.tradingName && data.companyName && data.cnpj);
  }
  return true;
}, {
  message: 'Razão Social, Nome Fantasia e CNPJ são obrigatórios para Store Admin',
  path: ['tradingName'],
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

export default function UsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [submitting, setSubmitting] = useState(false);

  const { user, loading: loadingUser } = useUser(id || '');
  const { createUser, updateUser } = useUsers();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      role: UserRole.GLOBAL_ADMIN,
    },
  });

  const selectedRole = watch('role');

  // Populate form when editing
  useEffect(() => {
    if (user && isEditing) {
      setValue('fullName', user.fullName);
      setValue('email', user.email);
      setValue('phone', user.phone || '');
      setValue('role', user.role);
    }
  }, [user, isEditing, setValue]);

  const onSubmit = async (data: UsuarioFormData) => {
    setSubmitting(true);

    try {
      if (isEditing) {
        // Update existing user
        await updateUser(id, {
          fullName: data.fullName,
          phone: data.phone,
        });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Create new user
        if (!data.password) {
          toast.error('Senha é obrigatória para criar um novo usuário');
          return;
        }

        await createUser({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
          tradingName: data.tradingName,
          companyName: data.companyName,
          cnpj: data.cnpj,
        });
        toast.success('Usuário criado com sucesso!');
      }

      navigate('/usuarios');
    } catch (error) {
      toast.error(`Erro ao salvar usuário: ${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditing && loadingUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/usuarios')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados do usuário' : 'Cadastre um novo usuário no sistema'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Ex: João Silva"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="usuario@exemplo.com"
                  disabled={isEditing}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              {!isEditing && (
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="Senha de acesso"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Usuário</CardTitle>
              <CardDescription>
                Defina o papel do usuário no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">Função *</Label>
                <Select
                  value={watch('role')}
                  onValueChange={(value) => setValue('role', value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.GLOBAL_ADMIN}>Admin Global (Plataforma)</SelectItem>
                    <SelectItem value={UserRole.STORE_ADMIN}>Admin de Loja (Locadora)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>

              {selectedRole === UserRole.STORE_ADMIN && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium">Dados da Locadora</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tradingName">Razão Social *</Label>
                      <Input
                        id="tradingName"
                        {...register('tradingName')}
                        placeholder="Ex: Lokmoto Motos LTDA"
                      />
                      {errors.tradingName && (
                        <p className="text-xs text-destructive mt-1">{errors.tradingName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyName">Nome Fantasia *</Label>
                      <Input
                        id="companyName"
                        {...register('companyName')}
                        placeholder="Ex: Lokmoto Motos"
                      />
                      {errors.companyName && (
                        <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        {...register('cnpj')}
                        placeholder="00000000000000"
                        maxLength={14}
                      />
                      {errors.cnpj && (
                        <p className="text-xs text-destructive mt-1">{errors.cnpj.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/usuarios')}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Usuário')}
          </Button>
        </div>
      </form>
    </div>
  );
}


