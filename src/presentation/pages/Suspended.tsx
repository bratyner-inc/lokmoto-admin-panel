/**
 * Suspended Page
 * Página exibida quando a conta da locadora está suspensa
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, Mail, Phone, LogOut, AlertTriangle } from 'lucide-react';

export default function Suspended() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Se o usuário não está suspenso, redirecionar para dashboard
  useEffect(() => {
    if (user && !user.isSuspended) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-destructive">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl text-destructive">Conta Suspensa</CardTitle>
          <CardDescription className="text-base mt-2">
            Sua conta foi temporariamente suspensa pela administração da plataforma
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Motivo da suspensão */}
          {user?.suspensionReason && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <strong>Motivo:</strong> {user.suspensionReason}
              </AlertDescription>
            </Alert>
          )}

          {/* Informações */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">O que isso significa?</h3>
            <p className="text-sm text-muted-foreground">
              Sua conta foi suspensa e você não pode acessar a plataforma no momento. Isso pode ter 
              ocorrido devido a violação dos termos de uso, inadimplência, ou outras razões 
              administrativas.
            </p>
          </div>

          {/* Próximos passos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">O que fazer agora?</h3>
            <p className="text-sm text-muted-foreground">
              Entre em contato com nossa equipe de suporte para resolver a situação e reativar 
              sua conta. Nossa equipe está disponível para ajudá-lo.
            </p>
          </div>

          {/* Contato do suporte */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contato do Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href="mailto:suporte@lokmoto.com.br"
                    className="text-sm text-primary hover:underline"
                  >
                    suporte@lokmoto.com.br
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <a
                    href="tel:+5511999999999"
                    className="text-sm text-primary hover:underline"
                  >
                    (11) 99999-9999
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Segunda a sexta, das 9h às 18h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da suspensão */}
          {user?.suspendedAt && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Conta suspensa em: {new Date(user.suspendedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
            </div>
          )}

          {/* Botão de logout */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

