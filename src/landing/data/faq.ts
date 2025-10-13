/**
 * FAQ data for landing page
 */

export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: 'Como funciona o período de teste?',
    answer: 'Você pode começar com nosso plano gratuito que inclui funcionalidades essenciais para você conhecer a plataforma. Não é necessário cadastrar cartão de crédito para começar. Quando quiser expandir, basta escolher um dos nossos planos pagos.',
  },
  {
    question: 'Posso trocar de plano depois?',
    answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento através do painel de configurações. As alterações são aplicadas imediatamente e o valor é ajustado proporcionalmente.',
  },
  {
    question: 'Como são processados os pagamentos?',
    answer: 'Utilizamos o Safe2Pay, uma das plataformas de pagamento mais seguras do Brasil. Aceitamos cartão de crédito, boleto e PIX. Todos os dados financeiros são criptografados e protegidos.',
  },
  {
    question: 'Existe suporte técnico?',
    answer: 'Sim! Oferecemos suporte por email e chat para todos os planos. Nosso time está disponível de segunda a sexta, das 9h às 18h. Para planos empresariais, oferecemos suporte prioritário com tempo de resposta garantido.',
  },
  {
    question: 'Quais recursos estão incluídos no plano gratuito?',
    answer: 'O plano gratuito inclui 1 usuário administrador, cadastro de até 20 veículos, gestão básica de contratos e relatórios essenciais. É perfeito para locadoras pequenas que estão começando ou querem testar a plataforma.',
  },
];

