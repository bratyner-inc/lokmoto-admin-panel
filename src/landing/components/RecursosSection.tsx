/**
 * Recursos Section
 * Alternating layout for features with images
 */

import { CheckCircle } from 'lucide-react';
import { features } from '../data/features';

export function RecursosSection() {
  return (
    <section id="recursos" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Recursos Poderosos para sua Locadora
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas completas para otimizar cada aspecto do seu negócio
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                feature.imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div
                className={`space-y-6 ${
                  feature.imagePosition === 'left' ? 'lg:order-2' : ''
                }`}
              >
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <ul className="space-y-3">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Placeholder */}
              <div
                className={`relative ${
                  feature.imagePosition === 'left' ? 'lg:order-1' : ''
                }`}
              >
                <div className="aspect-video bg-gradient-card rounded-2xl shadow-elegant border border-border overflow-hidden">
                  {/* Placeholder for feature screenshot/illustration */}
                  <div className="h-full w-full p-8 space-y-4">
                    <div className="h-8 bg-muted rounded animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-32 bg-muted rounded animate-pulse" />
                      <div className="h-32 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-48 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

