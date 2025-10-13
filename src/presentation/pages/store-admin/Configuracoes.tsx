/**
 * Configuracoes Page - Store Admin
 * Gerenciar perfil da loja, dados bancários e termos de uso
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageLoader } from '@/components/ui/page-loader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useBankAccounts } from '@/presentation/hooks/useBankAccounts';
import { useBanks } from '@/presentation/hooks/useBanks';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { RentalCompanyRepository } from '@/data/repositories/RentalCompanyRepository';
import {
  Settings,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Save,
  Upload,
  Plus,
  Trash2,
  Check,
  Star,
  ExternalLink,
} from 'lucide-react';

const rentalCompanyRepository = new RentalCompanyRepository();

export default function Configuracoes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const { accounts, loading: loadingAccounts, createAccount, deleteAccount, setPrimary } = useBankAccounts();
  const { banks, loading: loadingBanks } = useBanks();

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  // Form state for profile
  const [profileData, setProfileData] = useState({
    companyName: user?.companyName || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      number: user?.address?.number || '',
      complement: user?.address?.complement || '',
      neighborhood: user?.address?.neighborhood || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
    },
  });

  // Bank account modal state
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountData, setAccountData] = useState({
    bankCode: '',
    accountType: 'corrente' as 'corrente' | 'poupanca',
    agency: '',
    accountNumber: '',
    accountDigit: '',
    pixKey: '',
    pixKeyType: '' as '' | 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
    isPrimary: false,
  });

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await rentalCompanyRepository.updateProfile(user.id, profileData);
      await refreshUser();
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O logo deve ter no máximo 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
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
      await refreshUser();
      toast({
        title: 'Logo atualizado',
        description: 'Seu logo foi enviado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload do logo.',
        variant: 'destructive',
      });
      console.error('Error uploading logo:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveAccount = async () => {
    // Validação básica
    if (!accountData.bankCode || !accountData.agency || !accountData.accountNumber) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha banco, agência e número da conta.',
        variant: 'destructive',
      });
      return;
    }

    setSavingAccount(true);
    try {
      await createAccount({
        bankCode: accountData.bankCode,
        accountType: accountData.accountType,
        agency: accountData.agency,
        accountNumber: accountData.accountNumber,
        accountDigit: accountData.accountDigit || undefined,
        pixKey: accountData.pixKey || undefined,
        pixKeyType: accountData.pixKeyType || undefined,
        isPrimary: accountData.isPrimary,
      });

      toast({
        title: 'Conta adicionada',
        description: 'Conta bancária cadastrada com sucesso.',
      });

      // Resetar form e fechar modal
      setAccountData({
        bankCode: '',
        accountType: 'corrente',
        agency: '',
        accountNumber: '',
        accountDigit: '',
        pixKey: '',
        pixKeyType: '',
        isPrimary: false,
      });
      setIsAddAccountModalOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a conta bancária.',
        variant: 'destructive',
      });
      console.error('Error creating account:', error);
    } finally {
      setSavingAccount(false);
    }
  };

  if (loadingBanks) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground">Gerencie o perfil da sua loja e dados bancários</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="perfil">
            <Building2 className="h-4 w-4 mr-2" />
            Perfil da Loja
          </TabsTrigger>
          <TabsTrigger value="bancarios">
            <CreditCard className="h-4 w-4 mr-2" />
            Dados Bancários
          </TabsTrigger>
          <TabsTrigger value="termos">
            <FileText className="h-4 w-4 mr-2" />
            Termos de Uso
          </TabsTrigger>
        </TabsList>

        {/* Aba: Perfil da Loja */}
        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Atualize os dados da sua locadora. Campos como CNPJ, Email e Razão Social não podem ser alterados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo da Empresa</Label>
                <div className="flex items-center gap-4">
                  {user?.logoUrl ? (
                    <img
                      src={user.logoUrl}
                      alt="Logo"
                      className="h-20 w-20 object-contain rounded-lg border"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      className="hidden"
                      onChange={handleUploadLogo}
                      disabled={uploadingLogo}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>Enviando...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Alterar Logo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou SVG (máx. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Campos NÃO editáveis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informações Fixas (não editáveis)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input value={user?.tradingName || ''} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input value={user?.cnpj || ''} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Principal</Label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Campos editáveis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informações Editáveis</h3>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome Fantasia *</Label>
                  <Input
                    id="companyName"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Rua/Avenida</Label>
                  <Input
                    id="street"
                    value={profileData.address.street}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      address: { ...profileData.address, street: e.target.value }
                    })}
                    placeholder="Rua das Flores"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={profileData.address.number}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        address: { ...profileData.address, number: e.target.value }
                      })}
                      placeholder="123"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={profileData.address.complement}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        address: { ...profileData.address, complement: e.target.value }
                      })}
                      placeholder="Apto 45, Bloco B"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={profileData.address.neighborhood}
                    onChange={(e) => setProfileData({ 
                      ...profileData, 
                      address: { ...profileData.address, neighborhood: e.target.value }
                    })}
                    placeholder="Centro"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={profileData.address.city}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        address: { ...profileData.address, city: e.target.value }
                      })}
                      placeholder="São Paulo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado (UF)</Label>
                    <Input
                      id="state"
                      value={profileData.address.state}
                      maxLength={2}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        address: { ...profileData.address, state: e.target.value.toUpperCase() }
                      })}
                      placeholder="SP"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={profileData.address.zipCode}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        address: { ...profileData.address, zipCode: e.target.value }
                      })}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Dados Bancários */}
        <TabsContent value="bancarios" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contas Bancárias</CardTitle>
                  <CardDescription>
                    Gerencie as contas bancárias da sua locadora para recebimento de pagamentos
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddAccountModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAccounts ? (
                <div className="py-8 text-center text-muted-foreground">Carregando...</div>
              ) : accounts.length === 0 ? (
                <div className="py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conta cadastrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione uma conta bancária para receber seus pagamentos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <Card key={account.id} className={account.isPrimary ? 'border-primary' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{account.bank?.name}</h4>
                              {account.isPrimary && (
                                <Badge className="bg-primary text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  Principal
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Agência: {account.agency} • Conta: {account.accountNumber}-{account.accountDigit}</p>
                              <p>Tipo: {account.accountType === 'corrente' ? 'Conta Corrente' : 'Poupança'}</p>
                              {account.pixKey && <p>Chave PIX: {account.pixKey}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!account.isPrimary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPrimary(account.id)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAccount(account.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Termos de Uso */}
        <TabsContent value="termos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Termos de Uso da Plataforma</CardTitle>
              <CardDescription>
                Consulte os termos e condições de uso da plataforma Lokmoto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Termos de Uso</h3>
                <p className="text-muted-foreground mb-4">
                  Acesse nossa página de termos para ler todos os detalhes
                </p>
                <Button variant="outline" onClick={() => window.open('/termos-de-uso', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Termos de Uso
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Adicionar Conta Bancária */}
      <Dialog open={isAddAccountModalOpen} onOpenChange={setIsAddAccountModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Conta Bancária</DialogTitle>
            <DialogDescription>
              Cadastre uma nova conta bancária para receber seus pagamentos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Banco */}
            <div className="space-y-2">
              <Label htmlFor="bank">Banco *</Label>
              <Select
                value={accountData.bankCode}
                onValueChange={(value) => setAccountData({ ...accountData, bankCode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.code} - {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Conta */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Conta *</Label>
              <Select
                value={accountData.accountType}
                onValueChange={(value: 'corrente' | 'poupanca') =>
                  setAccountData({ ...accountData, accountType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agência */}
            <div className="space-y-2">
              <Label htmlFor="agency">Agência *</Label>
              <Input
                id="agency"
                placeholder="Ex: 1234"
                value={accountData.agency}
                onChange={(e) => setAccountData({ ...accountData, agency: e.target.value })}
              />
            </div>

            {/* Número da Conta */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="accountNumber">Número da Conta *</Label>
                <Input
                  id="accountNumber"
                  placeholder="Ex: 12345678"
                  value={accountData.accountNumber}
                  onChange={(e) => setAccountData({ ...accountData, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountDigit">Dígito</Label>
                <Input
                  id="accountDigit"
                  placeholder="Ex: 9"
                  maxLength={2}
                  value={accountData.accountDigit}
                  onChange={(e) => setAccountData({ ...accountData, accountDigit: e.target.value })}
                />
              </div>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX (opcional)</Label>
              <Input
                id="pixKey"
                placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                value={accountData.pixKey}
                onChange={(e) => setAccountData({ ...accountData, pixKey: e.target.value })}
              />
            </div>

            {/* Tipo de Chave PIX */}
            {accountData.pixKey && (
              <div className="space-y-2">
                <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
                <Select
                  value={accountData.pixKeyType}
                  onValueChange={(value: any) =>
                    setAccountData({ ...accountData, pixKeyType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Conta Principal */}
            {accounts.length === 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={accountData.isPrimary}
                  onChange={(e) =>
                    setAccountData({ ...accountData, isPrimary: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isPrimary" className="text-sm font-normal">
                  Definir como conta principal
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountModalOpen(false)} disabled={savingAccount}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAccount} disabled={savingAccount}>
              {savingAccount ? 'Salvando...' : 'Adicionar Conta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

