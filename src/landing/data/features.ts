/**
 * Features data for landing page
 */

export interface Feature {
  title: string;
  description: string;
  items: string[];
  imagePosition: 'left' | 'right';
}

export const features: Feature[] = [
  {
    title: 'Dashboard em Tempo Real',
    description: 'Visualize todas as informações importantes da sua locadora em um dashboard moderno e intuitivo. Acompanhe métricas, contratos ativos, manutenções pendentes e muito mais.',
    items: [
      'Visão geral de contratos ativos e receitas',
      'Alertas de manutenções e vencimentos',
      'Estatísticas de ocupação da frota',
      'Gráficos de desempenho financeiro',
    ],
    imagePosition: 'right',
  },
  {
    title: 'Gestão de Contratos',
    description: 'Crie e gerencie contratos de locação de forma simples e rápida. Acompanhe todo o ciclo de vida dos contratos, desde a proposta até o encerramento.',
    items: [
      'Criação de propostas e contratos digitais',
      'Assinatura eletrônica integrada',
      'Histórico completo de cada contrato',
      'Renovações automáticas configuráveis',
    ],
    imagePosition: 'left',
  },
  {
    title: 'Controle de Frotas',
    description: 'Gerencie toda a sua frota de motocicletas com facilidade. Cadastre veículos, acompanhe status, manutenções e documentação.',
    items: [
      'Cadastro completo de motocicletas',
      'Controle de disponibilidade em tempo real',
      'Histórico de manutenções por veículo',
      'Alertas de documentação e licenciamento',
    ],
    imagePosition: 'right',
  },
  {
    title: 'Pagamentos Integrados',
    description: 'Integração com sistema de pagamentos para facilitar cobranças e recebimentos. Acompanhe todas as transações financeiras em um só lugar.',
    items: [
      'Integração com Safe2Pay',
      'Cobranças recorrentes automáticas',
      'Múltiplas formas de pagamento',
      'Relatórios financeiros completos',
    ],
    imagePosition: 'left',
  },
];

