/**
 * Landing Page
 * Main landing page component for LokMoto
 * Self-contained and portable to other projects
 */

import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { VantagensSection } from './components/VantagensSection';
import { RecursosSection } from './components/RecursosSection';
import { PlanosSection } from './components/PlanosSection';
import { FAQSection } from './components/FAQSection';
import { CTASection } from './components/CTASection';
import { LandingFooter } from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <VantagensSection />
        <RecursosSection />
        <PlanosSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

