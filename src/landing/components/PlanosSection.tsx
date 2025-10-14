/**
 * Planos Section
 * Display real plans from database with Safe2Pay integration
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle } from 'lucide-react';
import { useSafe2PayPlans } from '@/presentation/hooks/useSafe2PayPlans';

export function PlanosSection() {
  const { plans, loading, error } = useSafe2PayPlans(true);

  // Sort plans: Free plan first, then by amount
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.idPlan === 0) return -1;
    if (b.idPlan === 0) return 1;
    return a.amount - b.amount;
  });

  // Determine which plan is "most popular" (middle tier)
  const mostPopularIndex = sortedPlans.length > 2 ? 1 : 0;

  const getDefaultFeatures = (planName: string) => {
    if (planName.toLowerCase().includes('free') || planName.toLowerCase().includes('gratuito')) {
      return [
        '1 usuário administrador',
        'Até 20 veículos cadastrados',
        'Gestão básica de contratos',
        'Relatórios essenciais',
        'Suporte por email',
      ];
    }
    return [
      'Usuários ilimitados',
      'Veículos ilimitados',
      'Gestão completa de contratos',
      'Relatórios avançados',
      'Suporte prioritário',
      'Integrações completas',
    ];
  };

  if (loading) {
    return (
      <section id="planos" className="py-20 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Planos para Todo Tamanho de Negócio
            </h2>
            <p className="text-lg text-muted-foreground">
              Escolha o plano ideal para sua locadora
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-10 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="planos" className="py-20 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Planos para Todo Tamanho de Negócio
            </h2>
            <p className="text-muted-foreground">
              Erro ao carregar planos. Entre em contato para mais informações.
            </p>
            <Button asChild>
              <Link to="/register">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="planos" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Planos para Todo Tamanho de Negócio
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para sua locadora e comece hoje mesmo
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPlans.map((plan, index) => {
            const isMostPopular = index === mostPopularIndex && sortedPlans.length > 2;
            const isFree = plan.idPlan === 0;
            
            // Get features from metadata or use defaults
            const features = plan.metadata?.features || getDefaultFeatures(plan.name);

            return (
              <Card
                key={plan.idPlan}
                className={`relative border-border hover:shadow-elegant transition-all duration-300 ${
                  isMostPopular ? 'border-primary shadow-glow lg:scale-105' : ''
                }`}
              >
                {isMostPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-foreground">
                      {isFree ? (
                        'Grátis'
                      ) : (
                        <>
                          R$ {plan.amount.toFixed(2).replace('.', ',')}
                          <span className="text-lg font-normal text-muted-foreground">/mês</span>
                        </>
                      )}
                    </div>
                    {!isFree && plan.description && (
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <ul className="space-y-3">
                    {features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    asChild
                    variant={isMostPopular ? 'default' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    <Link to={`/register?plan=${plan.idPlan}`}>
                      Escolher Plano
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem 30 dias de garantia. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}

