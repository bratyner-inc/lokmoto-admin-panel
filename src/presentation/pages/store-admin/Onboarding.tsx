/**
 * Onboarding Page - Store Admin
 * Fluxo de onboarding obrigatório para novos lojistas
 * 4 etapas: Dados Básicos, Logo, Dados Bancários, Plano
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/presentation/hooks/useOnboarding';
import { useBanks } from '@/presentation/hooks/useBanks';
import { useBankAccounts } from '@/presentation/hooks/useBankAccounts';
import { useSafe2PayPlans } from '@/presentation/hooks/useSafe2PayPlans';
import { useViaCep } from '@/presentation/hooks/useViaCep';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { RentalCompanyRepository } from '@/data/repositories/RentalCompanyRepository';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Upload,
  CreditCard,
  Zap,
  Check,
  Search,
  Loader2,
} from 'lucide-react';

const rentalCompanyRepository = new RentalCompanyRepository();

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const { currentStep, isCompleted, completeStep, completeOnboarding } = useOnboarding();
  const { banks, loading: loadingBanks } = useBanks();
  const { accounts, createAccount } = useBankAccounts();
  const { plans, loading: loadingPlans } = useSafe2PayPlans();
  const { loading: searchingCep, error: cepError, searchCep, formatCep } = useViaCep();

  const [step, setStep] = useState(currentStep);
  const [saving, setSaving] = useState(false);
  const [cepFetched, setCepFetched] = useState(false);

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const response = await authService.verifyToken();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Step 1: Dados Básicos
  const [basicData, setBasicData] = useState({
    companyName: (user as any)?.companyName || '',
    phone: (user as any)?.phone || '',
    address: {
      street: (user as any)?.address?.street || '',
      number: (user as any)?.address?.number || '',
      complement: (user as any)?.address?.complement || '',
      neighborhood: (user as any)?.address?.neighborhood || '',
      city: (user as any)?.address?.city || '',
      state: (user as any)?.address?.state || '',
      zipCode: (user as any)?.address?.zipCode || '',
    },
  });

  // Step 2: Logo
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>((user as any)?.logoUrl || null);

  // Step 3: Dados Bancários
  const [bankData, setBankData] = useState<{
    bankCode: string;
    accountType: 'corrente' | 'poupanca';
    agency: string;
    accountNumber: string;
    accountDigit: string;
    pixKey: string;
    pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | '';
  }>({
    bankCode: '',
    accountType: 'corrente',
    agency: '',
    accountNumber: '',
    accountDigit: '',
    pixKey: '',
    pixKeyType: '',
  });

  // Step 4: Plano
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  // Sincronizar step com o usuário
  useEffect(() => {
    setStep(currentStep);
  }, [currentStep]);

  // Se onboarding já foi completado, redirecionar
  useEffect(() => {
    if (isCompleted) {
      navigate('/dashboard');
    }
  }, [isCompleted, navigate]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleSearchCep = async () => {
    const cep = basicData.address.zipCode;
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      toast({
        title: 'CEP inválido',
        description: 'Digite um CEP válido com 8 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    const address = await searchCep(cep);
    if (address) {
      setBasicData({
        ...basicData,
        address: {
          ...basicData.address,
          zipCode: address.zipCode,
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
        },
      });
      setCepFetched(true);
      toast({
        title: 'CEP encontrado!',
        description: 'Endereço preenchido automaticamente.',
      });
    }
  };

  const handleSaveBasicData = async () => {
    if (!user?.id) return;
    if (!basicData.companyName || !basicData.phone) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await rentalCompanyRepository.updateProfile(user.id, basicData);
      await completeStep(1);
      await refreshUser();
      setStep(1);
      toast({
        title: 'Dados salvos',
        description: 'Suas informações básicas foram atualizadas.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O logo deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use apenas PNG, JPG ou SVG.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const logoUrl = await rentalCompanyRepository.uploadLogo(user.id, file);
      await rentalCompanyRepository.updateProfile(user.id, { logoUrl });
      setLogoPreview(logoUrl);
      await refreshUser();
      toast({
        title: 'Logo enviado',
        description: 'Seu logo foi salvo com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload do logo.',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSkipLogo = async () => {
    setSaving(true);
    try {
      await completeStep(2);
      setStep(2);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível avançar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContinueWithLogo = async () => {
    setSaving(true);
    try {
      await completeStep(2);
      setStep(2);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível avançar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBankAccount = async () => {
    if (!bankData.bankCode || !bankData.agency || !bankData.accountNumber) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios da conta bancária.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await createAccount({
        bankCode: bankData.bankCode,
        accountType: bankData.accountType,
        agency: bankData.agency,
        accountNumber: bankData.accountNumber,
        accountDigit: bankData.accountDigit || undefined,
        pixKey: bankData.pixKey || undefined,
        pixKeyType: (bankData.pixKeyType || undefined) as any,
        isPrimary: true,
      });
      await completeStep(3);
      setStep(3);
      toast({
        title: 'Conta bancária cadastrada',
        description: 'Seus dados bancários foram salvos.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar a conta bancária.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCompletePlan = async () => {
    console.log('selectedPlan', selectedPlan);
    if (selectedPlan === null) {
      toast({
        title: 'Selecione um plano',
        description: 'Escolha um plano para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Atualizar plano (implementar lógica de assinatura depois)
      await completeOnboarding();
      toast({
        title: 'Onboarding concluído!',
        description: 'Bem-vindo à plataforma Lokmoto.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível concluir o onboarding.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        // Step 1: Dados Básicos
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome Fantasia *</Label>
              <Input
                id="companyName"
                value={basicData.companyName}
                onChange={(e) => setBasicData({ ...basicData, companyName: e.target.value })}
                placeholder="Nome da sua empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={basicData.phone}
                onChange={(e) => setBasicData({ ...basicData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* CEP - Primeiro campo */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP *</Label>
              <div className="flex gap-2">
                <Input
                  id="zipCode"
                  value={basicData.address.zipCode}
                  onChange={(e) => {
                    const formatted = formatCep(e.target.value);
                    setBasicData({ 
                      ...basicData, 
                      address: { ...basicData.address, zipCode: formatted }
                    });
                    setCepFetched(false); // Reset quando CEP muda
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchCep}
                  disabled={searchingCep || basicData.address.zipCode.replace(/\D/g, '').length !== 8}
                >
                  {searchingCep ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {cepError && (
                <p className="text-xs text-destructive">{cepError}</p>
              )}
              {cepFetched && (
                <p className="text-xs text-green-600">✓ Endereço encontrado</p>
              )}
            </div>

            {/* Rua - Desabilitado se veio do ViaCEP */}
            <div className="space-y-2">
              <Label htmlFor="street">Rua/Avenida</Label>
              <Input
                id="street"
                value={basicData.address.street}
                onChange={(e) => setBasicData({ 
                  ...basicData, 
                  address: { ...basicData.address, street: e.target.value }
                })}
                placeholder="Rua das Flores"
                disabled={cepFetched}
                className={cepFetched ? 'bg-muted' : ''}
              />
            </div>

            {/* Número e Complemento - Sempre editáveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  value={basicData.address.number}
                  onChange={(e) => setBasicData({ 
                    ...basicData, 
                    address: { ...basicData.address, number: e.target.value }
                  })}
                  placeholder="123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement">Complemento (opcional)</Label>
                <Input
                  id="complement"
                  value={basicData.address.complement}
                  onChange={(e) => setBasicData({ 
                    ...basicData, 
                    address: { ...basicData.address, complement: e.target.value }
                  })}
                  placeholder="Apto 45, Bloco B"
                />
              </div>
            </div>

            {/* Bairro - Desabilitado se veio do ViaCEP */}
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={basicData.address.neighborhood}
                onChange={(e) => setBasicData({ 
                  ...basicData, 
                  address: { ...basicData.address, neighborhood: e.target.value }
                })}
                placeholder="Centro"
                disabled={cepFetched}
                className={cepFetched ? 'bg-muted' : ''}
              />
            </div>

            {/* Cidade e Estado - Desabilitados se veio do ViaCEP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={basicData.address.city}
                  onChange={(e) => setBasicData({ 
                    ...basicData, 
                    address: { ...basicData.address, city: e.target.value }
                  })}
                  placeholder="São Paulo"
                  disabled={cepFetched}
                  className={cepFetched ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={basicData.address.state}
                  maxLength={2}
                  onChange={(e) => setBasicData({ 
                    ...basicData, 
                    address: { ...basicData.address, state: e.target.value.toUpperCase() }
                  })}
                  placeholder="SP"
                  disabled={cepFetched}
                  className={cepFetched ? 'bg-muted' : ''}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveBasicData} disabled={saving}>
                {saving ? 'Salvando...' : 'Próximo'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 1:
        // Step 2: Logo
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-32 w-32 object-contain rounded-lg border"
                />
              ) : (
                <div className="h-32 w-32 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              <div className="text-center">
                <input
                  type="file"
                  id="logo-upload-onboarding"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  className="hidden"
                  onChange={handleUploadLogo}
                  disabled={uploadingLogo}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload-onboarding')?.click()}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {logoPreview ? 'Alterar Logo' : 'Fazer Upload'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou SVG (máx. 2MB)
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkipLogo} disabled={saving}>
                  Pular
                </Button>
                <Button onClick={handleContinueWithLogo} disabled={saving || !logoPreview}>
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        // Step 3: Dados Bancários
        return (
          <div className="space-y-6">
            {accounts.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="ml-2 text-green-800">
                  Você já possui {accounts.length} conta(s) bancária(s) cadastrada(s).
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="bankCode">Banco *</Label>
              <Select value={bankData.bankCode} onValueChange={(value) => setBankData({ ...bankData, bankCode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {loadingBanks ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : (
                    banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.code} - {bank.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Conta *</Label>
              <Select value={bankData.accountType} onValueChange={(value: any) => setBankData({ ...bankData, accountType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agency">Agência *</Label>
                <Input
                  id="agency"
                  value={bankData.agency}
                  onChange={(e) => setBankData({ ...bankData, agency: e.target.value })}
                  placeholder="0001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Conta *</Label>
                <div className="flex gap-2">
                  <Input
                    id="accountNumber"
                    value={bankData.accountNumber}
                    onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                    placeholder="123456"
                    className="flex-1"
                  />
                  <Input
                    value={bankData.accountDigit}
                    onChange={(e) => setBankData({ ...bankData, accountDigit: e.target.value })}
                    placeholder="7"
                    maxLength={2}
                    className="w-16"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX (opcional)</Label>
              <Input
                id="pixKey"
                value={bankData.pixKey}
                onChange={(e) => setBankData({ ...bankData, pixKey: e.target.value })}
                placeholder="email@exemplo.com ou CPF/CNPJ"
              />
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              <Button onClick={accounts.length > 0 ? () => setStep(3) : handleSaveBankAccount} disabled={saving}>
                {saving ? 'Salvando...' : accounts.length > 0 ? 'Próximo' : 'Cadastrar e Continuar'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 3:
        // Step 4: Escolha do Plano
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plano Gratuito */}
              <Card
                className={`cursor-pointer transition-all ${
                  selectedPlan === 0 ? 'border-primary ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlan(0)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Plano Gratuito</CardTitle>
                    {selectedPlan === 0 && <Check className="h-5 w-5 text-primary" />}
                  </div>
                  <CardDescription>Ideal para começar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">R$ 0,00</div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 1 usuário</li>
                    <li>✓ Até 20 veículos</li>
                    <li>✓ Contratos ilimitados</li>
                    <li>✓ Suporte por email</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Planos Safe2Pay */}
              {loadingPlans ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Carregando planos...</p>
                  </CardContent>
                </Card>
              ) : (
                plans
                  .filter((plan) => plan.isActive && plan.idPlan !== 0)
                  .slice(0, 3)
                  .map((plan) => (
                    <Card
                      key={plan.idPlan}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.idPlan ? 'border-primary ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPlan(plan.idPlan)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{plan.name}</CardTitle>
                          {selectedPlan === plan.idPlan && <Check className="h-5 w-5 text-primary" />}
                        </div>
                        <CardDescription>{plan.frequence}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">
                          R$ {plan.amount.toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Recursos expandidos para sua locadora
                        </p>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              <Button onClick={handleCompletePlan} disabled={saving || selectedPlan === null}>
                {saving ? 'Finalizando...' : 'Concluir Onboarding'}
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bem-vindo à Lokmoto!</h1>
          <p className="text-muted-foreground">
            Vamos configurar sua conta em {totalSteps} etapas simples
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Etapa {step + 1} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-between">
          {[
            { icon: Building2, label: 'Dados Básicos' },
            { icon: Upload, label: 'Logo' },
            { icon: CreditCard, label: 'Dados Bancários' },
            { icon: Zap, label: 'Plano' },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${
                  step >= index
                    ? 'bg-primary border-primary text-white'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {step > index ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <item.icon className="h-6 w-6" />
                )}
              </div>
              <span className="text-xs text-center hidden md:block">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 0 && 'Dados Básicos da Empresa'}
              {step === 1 && 'Logo da Empresa'}
              {step === 2 && 'Dados Bancários'}
              {step === 3 && 'Escolha seu Plano'}
            </CardTitle>
            <CardDescription>
              {step === 0 && 'Confirme ou atualize as informações da sua empresa'}
              {step === 1 && 'Adicione o logo da sua empresa (opcional)'}
              {step === 2 && 'Cadastre uma conta bancária para receber pagamentos'}
              {step === 3 && 'Selecione o plano ideal para o seu negócio'}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}

