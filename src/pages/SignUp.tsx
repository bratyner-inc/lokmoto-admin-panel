import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthV2 } from '@/hooks/useAuthV2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Bike } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuthV2();
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (!cnpj || !tradingName || !companyName) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    const profileData = {
      fullName,
      phone,
      cnpj,
      tradingName,
      companyName,
    };

    const { error } = await signUp(email, password, 'rental_company', profileData);

    if (error) {
      toast.error(`Erro ao criar conta: ${error.message}`);
    } else {
      toast.success('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Lokmoto Admin</h1>
          <p className="text-muted-foreground">Sistema de Gestão de Locação de Motocicletas</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Cadastro de Locadora</CardTitle>
            <CardDescription className="text-center">
              Registre sua empresa no sistema Lokmoto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Nome do Responsável *</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Nome completo do responsável"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trading-name">Razão Social *</Label>
                <Input
                  id="trading-name"
                  type="text"
                  placeholder="Razão Social da empresa"
                  value={tradingName}
                  onChange={(e) => setTradingName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-name">Nome Fantasia *</Label>
                <Input
                  id="company-name"
                  type="text"
                  placeholder="Nome Fantasia da empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </a>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              É um cliente?{" "}
              <a href="/customer-signup" className="text-primary hover:underline font-medium">
                Cadastre-se aqui
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
