/**
 * Hero Section
 * Main hero with title, subtitle, CTAs and illustration
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Gerencie sua Locadora de Motos com{' '}
                <span className="text-primary">Eficiência</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Controle completo de contratos, veículos e pagamentos em uma única plataforma.
                Simplifique sua gestão e aumente seus resultados.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="shadow-elegant group">
                <Link to="/register">
                  Comece Grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="#recursos">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Locadoras Ativas</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">10k+</div>
                <div className="text-sm text-muted-foreground">Contratos Gerenciados</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">4.8★</div>
                <div className="text-sm text-muted-foreground">Avaliação Média</div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative lg:h-[600px] animate-slide-up">
            <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl rounded-full" />
            <div className="relative h-full flex items-center justify-center">
              {/* Dashboard Mockup Placeholder */}
              <div className="w-full max-w-lg aspect-square bg-gradient-card rounded-2xl shadow-elegant border border-border p-8 space-y-4">
                <div className="h-12 bg-gradient-primary/20 rounded-lg animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-muted rounded-lg animate-pulse" />
                  <div className="h-32 bg-muted rounded-lg animate-pulse" />
                </div>
                <div className="h-40 bg-muted rounded-lg animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-muted rounded-lg animate-pulse" />
                  <div className="h-20 bg-muted rounded-lg animate-pulse" />
                  <div className="h-20 bg-muted rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

