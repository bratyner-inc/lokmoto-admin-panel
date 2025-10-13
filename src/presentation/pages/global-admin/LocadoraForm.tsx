import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRentalCompany, useRentalCompanies } from '@/presentation/hooks/useRentalCompanies';
import { useSafe2PayPlans } from '@/presentation/hooks/useSafe2PayPlans';
import { useViaCep } from '@/presentation/hooks/useViaCep';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Building2, AlertCircle, Search, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const locadoraSchema = z.object({
  tradingName: z.string().min(3, 'Razão social deve ter no mínimo 3 caracteres'),
  companyName: z.string().min(3, 'Nome fantasia deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos'),
  subscriptionPlan: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'inactive', 'pending', 'canceled']).optional(),
  subscriptionExpiration: z.string().optional(),
  // Address fields
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  bankAgency: z.string().optional(),
  bankAccount: z.string().optional(),
  bankCode: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
});

type LocadoraFormData = z.infer<typeof locadoraSchema>;

export default function LocadoraForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [submitting, setSubmitting] = useState(false);
  const [cepFetched, setCepFetched] = useState(false);

  const { company, loading: loadingCompany } = useRentalCompany(id || '');
  const { createCompany, updateCompany } = useRentalCompanies();
  const { plans, loading: loadingPlans } = useSafe2PayPlans(true);
  const { loading: searchingCep, error: cepError, searchCep, formatCep } = useViaCep();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LocadoraFormData>({
    resolver: zodResolver(locadoraSchema),
    defaultValues: {
      subscriptionStatus: 'pending',
    },
  });

  // Handle CEP search
  const handleSearchCep = async () => {
    const cep = watch('zipCode');
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      toast.error('Digite um CEP válido com 8 dígitos');
      return;
    }

    const address = await searchCep(cep);
    if (address) {
      setValue('zipCode', address.zipCode);
      setValue('street', address.street);
      setValue('neighborhood', address.neighborhood);
      setValue('city', address.city);
      setValue('state', address.state);
      setCepFetched(true);
      toast.success('CEP encontrado! Endereço preenchido automaticamente.');
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (company && isEditing) {
      setValue('tradingName', company.tradingName);
      setValue('companyName', company.companyName);
      setValue('email', company.email);
      setValue('phone', company.phone);
      setValue('cnpj', company.cnpj);
      setValue('subscriptionPlan', company.subscriptionPlan || '');
      setValue('subscriptionStatus', company.subscriptionStatus);
      if (company.subscriptionExpiration) {
        setValue('subscriptionExpiration', company.subscriptionExpiration.toISOString().split('T')[0]);
      }
      // Address
      if (company.address) {
        setValue('zipCode', company.address.zipCode || '');
        setValue('street', company.address.street || '');
        setValue('number', company.address.number || '');
        setValue('complement', company.address.complement || '');
        setValue('neighborhood', company.address.neighborhood || '');
        setValue('city', company.address.city || '');
        setValue('state', company.address.state || '');
        if (company.address.street) setCepFetched(true);
      }
      if (company.bankAccount) {
        setValue('bankAgency', company.bankAccount.agency || '');
        setValue('bankAccount', company.bankAccount.account || '');
        setValue('bankCode', company.bankAccount.bankCode || '');
      }
    }
  }, [company, isEditing, setValue]);

  const onSubmit = async (data: LocadoraFormData) => {
    setSubmitting(true);

    try {
      if (isEditing) {
        // Update existing company
        await updateCompany(id, {
          tradingName: data.tradingName,
          companyName: data.companyName,
          phone: data.phone,
          subscriptionPlan: data.subscriptionPlan || undefined,
          subscriptionStatus: data.subscriptionStatus,
          subscriptionExpiration: data.subscriptionExpiration ? new Date(data.subscriptionExpiration) : undefined,
          address: (data.zipCode || data.street || data.city) ? {
            zipCode: data.zipCode || '',
            street: data.street || '',
            number: data.number || '',
            complement: data.complement || undefined,
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
          } : undefined,
          bankAccount: (data.bankAgency || data.bankAccount || data.bankCode) ? {
            agency: data.bankAgency || '',
            account: data.bankAccount || '',
            bankCode: data.bankCode || '',
          } : undefined,
        });
        toast.success('Locadora atualizada com sucesso!');
      } else {
        // Create new company
        if (!data.password) {
          toast.error('Senha é obrigatória para criar uma nova locadora');
          return;
        }

        await createCompany({
          tradingName: data.tradingName,
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          cnpj: data.cnpj,
          subscriptionPlan: data.subscriptionPlan || undefined,
          address: (data.zipCode || data.street || data.city) ? {
            zipCode: data.zipCode || '',
            street: data.street || '',
            number: data.number || '',
            complement: data.complement || undefined,
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
          } : undefined,
          bankAccount: (data.bankAgency || data.bankAccount || data.bankCode) ? {
            agency: data.bankAgency || '',
            account: data.bankAccount || '',
            bankCode: data.bankCode || '',
          } : undefined,
        }, data.password);
        toast.success('Locadora criada com sucesso!');
      }

      navigate('/locadoras');
    } catch (error) {
      toast.error(`Erro ao salvar locadora: ${(error as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditing && loadingCompany) {
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/locadoras')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Locadora' : 'Nova Locadora'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados da locadora' : 'Cadastre uma nova locadora na plataforma'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais da locadora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  disabled={isEditing}
                />
                {errors.cnpj && (
                  <p className="text-xs text-destructive mt-1">{errors.cnpj.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contato@empresa.com"
                  disabled={isEditing}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
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

        {/* Address Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço (Opcional)
            </CardTitle>
            <CardDescription>
              Utilize o CEP para preenchimento automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CEP com busca */}
            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <div className="flex gap-2">
                <Input
                  id="zipCode"
                  {...register('zipCode')}
                  onChange={(e) => {
                    const formatted = formatCep(e.target.value);
                    setValue('zipCode', formatted);
                    setCepFetched(false);
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchCep}
                  disabled={searchingCep || watch('zipCode')?.replace(/\D/g, '').length !== 8}
                >
                  {searchingCep ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {cepError && (
                <p className="text-xs text-destructive mt-1">{cepError}</p>
              )}
              {cepFetched && (
                <p className="text-xs text-green-600 mt-1">✓ Endereço encontrado</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  {...register('street')}
                  placeholder="Ex: Rua das Flores"
                  disabled={cepFetched}
                  className={cepFetched ? 'bg-muted' : ''}
                />
              </div>

              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  {...register('number')}
                  placeholder="123"
                />
              </div>

              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...register('complement')}
                  placeholder="Apto 45, Bloco B"
                />
              </div>

              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  {...register('neighborhood')}
                  placeholder="Centro"
                  disabled={cepFetched}
                  className={cepFetched ? 'bg-muted' : ''}
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="São Paulo"
                  disabled={cepFetched}
                  className={cepFetched ? 'bg-muted' : ''}
                />
              </div>

              <div>
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="SP"
                  maxLength={2}
                  disabled={cepFetched}
                  className={cepFetched ? 'bg-muted' : ''}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>
              Plano e status da assinatura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subscriptionPlan">Plano Safe2Pay</Label>
                <Select
                  value={watch('subscriptionPlan') || 'none'}
                  onValueChange={(value) => setValue('subscriptionPlan', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum plano</SelectItem>
                    {loadingPlans ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : (
                      plans.map(plan => (
                        <SelectItem key={plan.idPlan} value={plan.idPlan.toString()}>
                          {plan.name} - R$ {plan.amount.toFixed(2)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {isEditing && (
                <>
                  <div>
                    <Label htmlFor="subscriptionStatus">Status</Label>
                    <Select
                      value={watch('subscriptionStatus') || 'pending'}
                      onValueChange={(value) => setValue('subscriptionStatus', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="inactive">Inativa</SelectItem>
                        <SelectItem value="canceled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subscriptionExpiration">Data de Vencimento</Label>
                    <Input
                      id="subscriptionExpiration"
                      type="date"
                      {...register('subscriptionExpiration')}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bank Account */}
        <Card>
          <CardHeader>
            <CardTitle>Conta Bancária (Opcional)</CardTitle>
            <CardDescription>
              Para repasses e pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bankCode">Código do Banco</Label>
                <Input
                  id="bankCode"
                  {...register('bankCode')}
                  placeholder="Ex: 001"
                />
              </div>

              <div>
                <Label htmlFor="bankAgency">Agência</Label>
                <Input
                  id="bankAgency"
                  {...register('bankAgency')}
                  placeholder="Ex: 1234"
                />
              </div>

              <div>
                <Label htmlFor="bankAccount">Conta</Label>
                <Input
                  id="bankAccount"
                  {...register('bankAccount')}
                  placeholder="Ex: 12345-6"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/locadoras')}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Locadora')}
          </Button>
        </div>
      </form>
    </div>
  );
}


