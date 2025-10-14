/**
 * Assinatura Page - Store Admin
 * Gerencia assinatura da locadora e planos disponíveis
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageLoader } from '@/components/ui/page-loader';
import {
  PenTool,
  Crown,
  Zap,
  Shield,
  TrendingUp,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/hooks/useAuth';
import { useSafe2PayPlans } from '@/presentation/hooks/useSafe2PayPlans';
import { useContracts } from '@/presentation/hooks/useContracts';
import { useMotorcycles } from '@/presentation/hooks/useMotorcycles';
import { useCustomers } from '@/presentation/hooks/useCustomers';

export default function Assinatura() {
  const { user } = useAuth();
  const { plans, loading: loadingPlans, error: plansError } = useSafe2PayPlans();
  const { contracts } = useContracts();
  const { motorcycles } = useMotorcycles();
  const { customers } = useCustomers();

  const {
    isOpen,
    items,
    openSubscriptionCheckout,
    closeCheckout,
    handleSuccess,
    handleError,
  } = useCheckout({
    title: 'Assinatura LokMoto',
    description: 'Escolha seu plano e finalize o pagamento',
    onSuccess: (paymentData) => {
      console.log('Pagamento da assinatura realizado:', paymentData);
      // TODO: Atualizar status da assinatura via API
    },
    onError: (error) => {
      console.error('Erro no pagamento da assinatura:', error);
    },
  });

  // Extrair informações do plano atual a partir do user (rental company)
  const currentPlan = useMemo(() => {
    if (!user) return null;

    // Buscar o plano ativo nos planos Safe2Pay
    const activePlan = plans.find((p) => p.name === user.subscriptionPlan && p.status === 'active');

    // Calcular dias restantes
    let daysRemaining = 0;
    if (user.subscriptionExpiration) {
      const expirationDate = new Date(user.subscriptionExpiration);
      const today = new Date();
      const diffTime = expirationDate.getTime() - today.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      name: user.subscriptionPlan || 'Sem plano',
      price: activePlan?.amount || 0,
      startDate: user.createdAt,
      expirationDate: user.subscriptionExpiration,
      isActive: user.subscriptionStatus === 'active',
      daysRemaining,
      status: user.subscriptionStatus,
    };
  }, [user, plans]);

  // Calcular estatísticas de uso
  const usage = useMemo(() => {
    // Limites fictícios - você pode ajustar baseado no plano
    const limits = {
      vehicles: 50,
      clients: 1000,
      contracts: 200,
    };

    return {
      vehicles: { current: motorcycles.length, limit: limits.vehicles },
      clients: { current: customers.length, limit: limits.clients },
      contracts: {
        current: contracts.filter((c) => c.status === 'active').length,
        limit: limits.contracts,
      },
    };
  }, [motorcycles, customers, contracts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateUsagePercentage = (current: number, limit: number) => {
    return (current / limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const getPlanIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('basic') || lowerType.includes('básico')) {
      return <Shield className="h-6 w-6" />;
    }
    if (lowerType.includes('premium')) {
      return <Crown className="h-6 w-6" />;
    }
    if (lowerType.includes('enterprise') || lowerType.includes('empresarial')) {
      return <Zap className="h-6 w-6" />;
    }
    return <PenTool className="h-6 w-6" />;
  };

  const getPlanColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('basic') || lowerType.includes('básico')) {
      return 'text-blue-500';
    }
    if (lowerType.includes('premium')) {
      return 'text-primary';
    }
    if (lowerType.includes('enterprise') || lowerType.includes('empresarial')) {
      return 'text-purple-500';
    }
    return 'text-muted-foreground';
  };

  if (loadingPlans) return <PageLoader />;

  if (plansError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Erro ao carregar planos</h2>
        <p className="text-muted-foreground">{plansError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" />
          Assinatura
        </h1>
        <p className="text-muted-foreground">Gerencie seu plano e assinatura</p>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <Card className="border-primary shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={getPlanColor(currentPlan.name)}>{getPlanIcon(currentPlan.name)}</div>
                <div>
                  <CardTitle className="text-2xl">{currentPlan.name}</CardTitle>
                  <CardDescription>Seu plano atual</CardDescription>
                </div>
              </div>
              <div>
                {currentPlan.isActive ? (
                  <Badge className="bg-success text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor Mensal</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(currentPlan.price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Próximo Vencimento</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(currentPlan.expirationDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dias Restantes</p>
                <p className="text-2xl font-bold text-primary">{currentPlan.daysRemaining} dias</p>
              </div>
            </div>

            {/* Usage */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Uso do Plano</h3>
              <div className="space-y-4">
                {/* Vehicles */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Veículos</span>
                    <span className={`text-sm font-semibold ${getUsageColor(calculateUsagePercentage(usage.vehicles.current, usage.vehicles.limit))}`}>
                      {usage.vehicles.current} / {usage.vehicles.limit}
                    </span>
                  </div>
                  <Progress
                    value={calculateUsagePercentage(usage.vehicles.current, usage.vehicles.limit)}
                    className="h-2"
                  />
                </div>

                {/* Clients */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Clientes</span>
                    <span className={`text-sm font-semibold ${getUsageColor(calculateUsagePercentage(usage.clients.current, usage.clients.limit))}`}>
                      {usage.clients.current} / {usage.clients.limit}
                    </span>
                  </div>
                  <Progress
                    value={calculateUsagePercentage(usage.clients.current, usage.clients.limit)}
                    className="h-2"
                  />
                </div>

                {/* Contracts */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Contratos Ativos</span>
                    <span className={`text-sm font-semibold ${getUsageColor(calculateUsagePercentage(usage.contracts.current, usage.contracts.limit))}`}>
                      {usage.contracts.current} / {usage.contracts.limit}
                    </span>
                  </div>
                  <Progress
                    value={calculateUsagePercentage(usage.contracts.current, usage.contracts.limit)}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Planos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans
            .filter((plan) => plan.status === 'active')
            .map((plan) => {
              const isCurrentPlan = currentPlan?.name === plan.name;
              const isPremium = plan.name.toLowerCase().includes('premium');

              return (
                <Card
                  key={plan.id}
                  className={`relative ${isPremium ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                >
                  {isPremium && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white">Recomendado</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className={getPlanColor(plan.name)}>{getPlanIcon(plan.name)}</div>
                    </div>
                    <CardTitle className="text-xl text-center">{plan.name}</CardTitle>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">
                        {formatCurrency(plan.amount)}
                      </div>
                      <p className="text-sm text-muted-foreground">por mês</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features from metadata */}
                    {plan.metadata && plan.metadata.description && (
                      <p className="text-sm text-muted-foreground text-center">
                        {plan.metadata.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {plan.metadata && plan.metadata.features && Array.isArray(plan.metadata.features) ? (
                        plan.metadata.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span className="text-sm">Acesso completo à plataforma</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'outline' : 'default'}
                      disabled={isCurrentPlan}
                      onClick={() => {
                        if (!isCurrentPlan) {
                          openSubscriptionCheckout({
                            planId: plan.planId,
                            planName: plan.name,
                            amount: plan.amount,
                            interval: plan.planIntervalType,
                          });
                        }
                      }}
                    >
                      {isCurrentPlan ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Plano Atual
                        </>
                      ) : (
                        'Escolher Plano'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {plans.filter((p) => p.status === 'active').length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum plano disponível</h3>
              <p className="text-muted-foreground">
                Não há planos ativos no momento. Entre em contato com o suporte.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isOpen}
        onClose={closeCheckout}
        items={items}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}

