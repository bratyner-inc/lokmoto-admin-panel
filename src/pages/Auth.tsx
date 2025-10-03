import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthV2, UserRole } from '@/hooks/useAuthV2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuthV2();
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast.error(`Erro ao fazer login: ${error.message}`);
    } else {
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const profileData = {
      fullName,
      phone,
      documentId: signupRole === 'customer' ? documentId : undefined,
      cnpj: signupRole === 'rental_company' ? cnpj : undefined,
      tradingName: signupRole === 'rental_company' ? tradingName : undefined,
      companyName: signupRole === 'rental_company' ? companyName : undefined,
    };

    const { error } = await signUp(signupEmail, signupPassword, signupRole, profileData);

    if (error) {
      toast.error(`Erro ao criar conta: ${error.message}`);
    } else {
      toast.success('Conta criada com sucesso! Você já pode fazer login.');
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast.error(`Erro ao fazer login com Google: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Lokmoto</CardTitle>
          <CardDescription className="text-center">
            Sistema de Locação de Motocicletas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Entrar com Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Tipo de Conta</Label>
                  <Select value={signupRole} onValueChange={(value) => setSignupRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="rental_company">Locadora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full-name">
                    {signupRole === 'rental_company' ? 'Nome Responsável' : 'Nome Completo'}
                  </Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {signupRole === 'rental_company' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="trading-name">Razão Social</Label>
                      <Input
                        id="trading-name"
                        type="text"
                        placeholder="Razão Social"
                        value={tradingName}
                        onChange={(e) => setTradingName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nome Fantasia</Label>
                      <Input
                        id="company-name"
                        type="text"
                        placeholder="Nome Fantasia"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {signupRole === 'customer' && (
                  <div className="space-y-2">
                    <Label htmlFor="document-id">CPF</Label>
                    <Input
                      id="document-id"
                      type="text"
                      placeholder="000.000.000-00"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
