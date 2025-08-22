import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bike, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword, isSendingForgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword({ email });
      setEmailSent(true);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 animate-glow">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">LokMoto</h1>
          </div>

          <Card className="shadow-elegant bg-white/95 backdrop-blur border-0">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-2xl font-semibold">E-mail Enviado!</CardTitle>
              <CardDescription>
                Enviamos um link de recuperação para <br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                </p>
                
                <Button asChild className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Login
                  </Link>
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    Não recebeu o e-mail? Tente novamente
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 animate-glow">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">LokMoto</h1>
        </div>

        <Card className="shadow-elegant bg-white/95 backdrop-blur border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Esqueci minha senha</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber um link de recuperação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-medium"
                disabled={isSendingForgotPassword}
              >
                {isSendingForgotPassword ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="ghost" asChild>
                <Link to="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}