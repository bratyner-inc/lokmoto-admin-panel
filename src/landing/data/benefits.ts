/**
 * Benefits data for landing page
 */

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export const benefits: Benefit[] = [
  {
    icon: 'LayoutDashboard',
    title: 'Gestão Completa',
    description: 'Tenha controle total da sua locadora em um único lugar. Dashboard intuitivo com todas as informações que você precisa.',
  },
  {
    icon: 'DollarSign',
    title: 'Controle Financeiro',
    description: 'Acompanhe receitas, despesas e pagamentos em tempo real. Relatórios financeiros detalhados para melhor gestão.',
  },
  {
    icon: 'FileText',
    title: 'Contratos Digitais',
    description: 'Crie, gerencie e monitore contratos de locação de forma digital e segura. Sem papelada, tudo na nuvem.',
  },
  {
    icon: 'Wrench',
    title: 'Manutenção Programada',
    description: 'Controle de manutenções preventivas e corretivas. Nunca mais perca o prazo de revisão dos seus veículos.',
  },
  {
    icon: 'BarChart',
    title: 'Relatórios Detalhados',
    description: 'Análises e relatórios completos sobre o desempenho da sua locadora. Tome decisões baseadas em dados reais.',
  },
  {
    icon: 'Headphones',
    title: 'Suporte Dedicado',
    description: 'Equipe de suporte sempre disponível para ajudar você. Atendimento rápido e eficiente quando você precisar.',
  },
];

