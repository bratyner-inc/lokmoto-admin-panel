import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PenTool, Crown, Zap, Shield, TrendingUp, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

// Mock data da assinatura atual
const currentPlan = {
  name: 'Plano Premium',
  type: 'premium' as const,
  price: 299,
  billingCycle: 'monthly' as const,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  isActive: true,
  daysRemaining: 344,
  features: [
    'Até 50 veículos',
    'Relatórios avançados',
    'Suporte prioritário',
    'API completa',
    'Backup automático'
  ],
  usage: {
    vehicles: { current: 12, limit: 50 },
    clients: { current: 156, limit: 1000 },
    contracts: { current: 8, limit: 200 }
  }
};

// Planos disponíveis
const availablePlans = [
  {
    name: 'Básico',
    type: 'basic' as const,
    price: 99,
    description: 'Ideal para pequenas lojas',
    features: [
      'Até 10 veículos',
      'Relatórios básicos',
      'Suporte por email',
      'Dashboard simples'
    ],
    popular: false
  },
  {
    name: 'Premium',
    type: 'premium' as const,
    price: 299,
    description: 'Melhor custo-benefício',
    features: [
      'Até 50 veículos',
      'Relatórios avançados',
      'Suporte prioritário',
      'API completa',
      'Backup automático'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    type: 'enterprise' as const,
    price: 599,
    description: 'Para grandes operações',
    features: [
      'Veículos ilimitados',
      'Analytics completo',
      'Suporte 24/7',
      'API personalizada',
      'Múltiplas lojas'
    ],
    popular: false
  }
];

export default function Assinatura() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
    switch (type) {
      case 'basic':
        return <Shield className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <Zap className="h-6 w-6" />;
      default:
        return <PenTool className="h-6 w-6" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'basic':
        return 'text-blue-500';
      case 'premium':
        return 'text-primary';
      case 'enterprise':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <PenTool className="h-8 w-8 text-primary" />
          Assinatura
        </h1>
        <p className="text-muted-foreground">
          Gerencie seu plano e assinatura da LokMoto
        </p>
      </div>

      {/* Current Plan Overview */}
      <Card className="shadow-elegant bg-gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-primary/10 ${getPlanColor(currentPlan.type)}`}>
                {getPlanIcon(currentPlan.type)}
              </div>
              <div>
                <CardTitle className="text-xl">{currentPlan.name}</CardTitle>
                <CardDescription>
                  {formatCurrency(currentPlan.price)}/mês • Renovação em {currentPlan.daysRemaining} dias
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-success text-white">Ativo</Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Período */}
            <div className="text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Período</div>
              <div className="font-medium">
                {formatDate(currentPlan.startDate)} - {formatDate(currentPlan.endDate)}
              </div>
            </div>

            {/* Próximo Pagamento */}
            <div className="text-center">
              <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Próximo Pagamento</div>
              <div className="font-medium">{formatCurrency(currentPlan.price)}</div>
              <div className="text-xs text-muted-foreground">em 01/02/2024</div>
            </div>

            {/* Status */}
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium text-success">Ativa e em dia</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Uso Atual do Plano</CardTitle>
          <CardDescription>
            Acompanhe o uso dos recursos do seu plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Vehicles Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Veículos</span>
                <span className={`text-sm font-medium ${getUsageColor(calculateUsagePercentage(currentPlan.usage.vehicles.current, currentPlan.usage.vehicles.limit))}`}>
                  {currentPlan.usage.vehicles.current} / {currentPlan.usage.vehicles.limit}
                </span>
              </div>
              <Progress 
                value={calculateUsagePercentage(currentPlan.usage.vehicles.current, currentPlan.usage.vehicles.limit)} 
                className="h-2"
              />
            </div>

            {/* Clients Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Clientes</span>
                <span className={`text-sm font-medium ${getUsageColor(calculateUsagePercentage(currentPlan.usage.clients.current, currentPlan.usage.clients.limit))}`}>
                  {currentPlan.usage.clients.current} / {currentPlan.usage.clients.limit}
                </span>
              </div>
              <Progress 
                value={calculateUsagePercentage(currentPlan.usage.clients.current, currentPlan.usage.clients.limit)} 
                className="h-2"
              />
            </div>

            {/* Contracts Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Contratos Mensais</span>
                <span className={`text-sm font-medium ${getUsageColor(calculateUsagePercentage(currentPlan.usage.contracts.current, currentPlan.usage.contracts.limit))}`}>
                  {currentPlan.usage.contracts.current} / {currentPlan.usage.contracts.limit}
                </span>
              </div>
              <Progress 
                value={calculateUsagePercentage(currentPlan.usage.contracts.current, currentPlan.usage.contracts.limit)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>
            Escolha o plano ideal para sua operação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <Card 
                key={plan.type} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-elegant' : 'shadow-card'} ${currentPlan.type === plan.type ? 'bg-accent/30' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Mais Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`inline-flex p-3 rounded-xl bg-muted/50 mx-auto ${getPlanColor(plan.type)}`}>
                    {getPlanIcon(plan.type)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={currentPlan.type === plan.type ? "outline" : "default"}
                    disabled={currentPlan.type === plan.type}
                  >
                    {currentPlan.type === plan.type ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Plano Atual
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {plan.type === 'basic' ? 'Fazer Downgrade' : 'Fazer Upgrade'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Últimas transações da sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Plano Premium</div>
                    <div className="text-sm text-muted-foreground">01/01/2024 - Cartão final ****1234</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">{formatCurrency(299)}</div>
                  <Badge className="bg-success text-white text-xs">Pago</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações da Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm">Alterar Cartão</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Ver Faturas</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Upgrade</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Cancelar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}