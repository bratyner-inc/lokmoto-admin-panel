/**
 * TermosDeUso Page - Página Pública
 * Termos e condições de uso da plataforma Lokmoto
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermosDeUso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Termos de Uso</CardTitle>
                <p className="text-muted-foreground mt-1">Plataforma Lokmoto</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            {/* 1. Introdução */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Introdução</h2>
              <p className="text-muted-foreground">
                Bem-vindo à plataforma Lokmoto. Estes Termos de Uso regem o acesso e a utilização dos 
                nossos serviços de gestão de locação de motocicletas por assinatura. Ao utilizar nossa 
                plataforma, você concorda com estes termos.
              </p>
            </section>

            <Separator />

            {/* 2. Definições */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Definições</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Plataforma:</strong> Sistema web Lokmoto para gestão de locação de motocicletas.
                </li>
                <li>
                  <strong>Locadora:</strong> Empresa que utiliza a plataforma para gerenciar seu negócio 
                  de locação de motocicletas.
                </li>
                <li>
                  <strong>Cliente:</strong> Pessoa física que aluga motocicletas através das locadoras 
                  cadastradas na plataforma.
                </li>
                <li>
                  <strong>Assinatura:</strong> Plano de pagamento recorrente para acesso aos recursos da 
                  plataforma.
                </li>
              </ul>
            </section>

            <Separator />

            {/* 3. Cadastro e Conta */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. Cadastro e Conta</h2>
              <p className="text-muted-foreground mb-3">
                Para utilizar a plataforma, a locadora deve:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fornecer informações verdadeiras, precisas e atualizadas.</li>
                <li>Manter a confidencialidade das credenciais de acesso.</li>
                <li>Notificar imediatamente sobre qualquer uso não autorizado da conta.</li>
                <li>Ser responsável por todas as atividades realizadas através de sua conta.</li>
              </ul>
            </section>

            <Separator />

            {/* 4. Planos e Pagamentos */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">4. Planos e Pagamentos</h2>
              <p className="text-muted-foreground mb-3">
                A plataforma oferece diferentes planos de assinatura:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Plano Gratuito:</strong> Acesso limitado com até 20 veículos e 1 usuário.
                </li>
                <li>
                  <strong>Planos Pagos:</strong> Acesso completo com recursos adicionais conforme o 
                  plano escolhido.
                </li>
                <li>Os pagamentos são processados através da plataforma Safe2Pay.</li>
                <li>O cancelamento pode ser feito a qualquer momento, sem multas.</li>
                <li>Não há reembolso proporcional em caso de cancelamento.</li>
              </ul>
            </section>

            <Separator />

            {/* 5. Uso da Plataforma */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">5. Uso da Plataforma</h2>
              <p className="text-muted-foreground mb-3">
                A locadora concorda em:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Utilizar a plataforma apenas para fins legais e autorizados.</li>
                <li>Não tentar acessar áreas restritas ou dados de outras locadoras.</li>
                <li>Não realizar atividades que possam comprometer a segurança da plataforma.</li>
                <li>Respeitar os direitos de propriedade intelectual da Lokmoto.</li>
                <li>Manter atualizadas as informações de seus clientes e veículos.</li>
              </ul>
            </section>

            <Separator />

            {/* 6. Privacidade e Dados */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">6. Privacidade e Dados</h2>
              <p className="text-muted-foreground">
                A coleta, uso e proteção de dados pessoais são regidos pela Lei Geral de Proteção de 
                Dados (LGPD). A locadora é responsável por garantir que possui consentimento adequado 
                de seus clientes para o processamento de dados pessoais através da plataforma.
              </p>
            </section>

            <Separator />

            {/* 7. Suspensão e Cancelamento */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">7. Suspensão e Cancelamento</h2>
              <p className="text-muted-foreground mb-3">
                A Lokmoto reserva-se o direito de suspender ou cancelar contas em caso de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violação destes Termos de Uso.</li>
                <li>Atividades fraudulentas ou ilegais.</li>
                <li>Inadimplência no pagamento das assinaturas.</li>
                <li>Uso indevido da plataforma.</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Em caso de suspensão, a locadora será notificada e deverá entrar em contato com o 
                suporte para regularização.
              </p>
            </section>

            <Separator />

            {/* 8. Limitação de Responsabilidade */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                A Lokmoto não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Danos diretos ou indiretos decorrentes do uso da plataforma.</li>
                <li>Perda de dados causada por falhas técnicas ou ataques externos.</li>
                <li>Interrupções temporárias do serviço para manutenção.</li>
                <li>Relações comerciais entre locadoras e clientes finais.</li>
              </ul>
            </section>

            <Separator />

            {/* 9. Alterações nos Termos */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">9. Alterações nos Termos</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As 
                alterações serão notificadas através da plataforma e entrarão em vigor imediatamente 
                após a publicação. O uso continuado da plataforma após as alterações constitui aceitação 
                dos novos termos.
              </p>
            </section>

            <Separator />

            {/* 10. Contato */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">10. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas, sugestões ou suporte relacionado a estes Termos de Uso, entre em contato:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-3">
                <li>
                  <strong>Email:</strong> suporte@lokmoto.com.br
                </li>
                <li>
                  <strong>Telefone:</strong> (11) 99999-9999
                </li>
                <li>
                  <strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h
                </li>
              </ul>
            </section>

            <Separator />

            {/* Footer */}
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Última atualização: 12 de Janeiro de 2025
              </p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                © 2025 Lokmoto. Todos os direitos reservados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

