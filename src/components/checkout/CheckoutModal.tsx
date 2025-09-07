import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, Receipt, QrCode, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface CheckoutItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  type: 'subscription' | 'service' | 'product';
}

export interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  title?: string;
  description?: string;
  currency?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export const CheckoutModal: React.FC<CheckoutProps> = ({
  isOpen,
  onClose,
  items,
  title = 'Finalizar Pagamento',
  description = 'Revise os detalhes e escolha a forma de pagamento',
  currency = 'BRL',
  onSuccess,
  onError
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'review' | 'payment' | 'processing' | 'success'>('review');
  const { toast } = useToast();

  // Payment form states
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    document: '',
    email: '',
    phone: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (paymentMethod === 'credit_card') {
      const requiredFields = ['number', 'expiry', 'cvc', 'name', 'document', 'email'];
      return requiredFields.every(field => cardData[field as keyof typeof cardData].trim() !== '');
    }
    return cardData.email.trim() !== '' && cardData.document.trim() !== '';
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const paymentData = {
        method: paymentMethod,
        total: calculateTotal(),
        items,
        transactionId: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      setCurrentStep('success');
      onSuccess?.(paymentData);
      
      toast({
        title: 'Pagamento realizado!',
        description: 'Seu pagamento foi processado com sucesso',
        variant: 'default'
      });

      setTimeout(() => {
        onClose();
        setCurrentStep('review');
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      setIsProcessing(false);
      setCurrentStep('payment');
      const errorMessage = 'Erro ao processar pagamento. Tente novamente.';
      onError?.(errorMessage);
      
      toast({
        title: 'Erro no pagamento',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Resumo do Pedido</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="font-medium text-foreground">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.type === 'subscription' ? 'Assinatura' : 
                     item.type === 'service' ? 'Serviço' : 'Produto'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Qtd: {item.quantity}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </div>
                {item.quantity > 1 && (
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(item.price)} cada
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(calculateTotal())}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={() => setCurrentStep('payment')} className="flex-1">
          Continuar para Pagamento
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Forma de Pagamento</h3>
        
        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
          <div className="space-y-3">
            {/* Credit Card */}
            <div className="flex items-center space-x-2 p-4 rounded-lg border bg-card">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Cartão de Crédito</div>
                  <div className="text-sm text-muted-foreground">Visa, Mastercard, Elo</div>
                </div>
              </Label>
            </div>

            {/* PIX */}
            <div className="flex items-center space-x-2 p-4 rounded-lg border bg-card">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                <QrCode className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">PIX</div>
                  <div className="text-sm text-muted-foreground">Pagamento instantâneo</div>
                </div>
              </Label>
            </div>

            {/* Boleto */}
            <div className="flex items-center space-x-2 p-4 rounded-lg border bg-card">
              <RadioGroupItem value="boleto" id="boleto" />
              <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer flex-1">
                <Receipt className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Boleto Bancário</div>
                  <div className="text-sm text-muted-foreground">Vencimento em 3 dias</div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Dados para Pagamento
          </CardTitle>
          <CardDescription>
            {paymentMethod === 'credit_card' && 'Preencha os dados do cartão de crédito'}
            {paymentMethod === 'pix' && 'Dados para gerar o código PIX'}
            {paymentMethod === 'boleto' && 'Dados para gerar o boleto'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethod === 'credit_card' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    value={cardData.number}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      number: formatCardNumber(e.target.value) 
                    }))}
                    maxLength={19}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      expiry: formatExpiry(e.target.value) 
                    }))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardData.cvc}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      cvc: e.target.value.replace(/\D/g, '') 
                    }))}
                    maxLength={4}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    placeholder="Nome como no cartão"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Common fields for all payment methods */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document">CPF/CNPJ</Label>
              <Input
                id="document"
                placeholder="000.000.000-00"
                value={cardData.document}
                onChange={(e) => setCardData(prev => ({ ...prev, document: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={cardData.phone}
                onChange={(e) => setCardData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={cardData.email}
                onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 text-accent-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm">Seus dados estão protegidos com criptografia SSL</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('review')} className="flex-1">
          Voltar
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={!validateForm()}
          className="flex-1"
        >
          Pagar {formatCurrency(calculateTotal())}
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Processando Pagamento</h3>
        <p className="text-muted-foreground">
          {paymentMethod === 'credit_card' && 'Verificando dados do cartão...'}
          {paymentMethod === 'pix' && 'Gerando código PIX...'}
          {paymentMethod === 'boleto' && 'Gerando boleto...'}
        </p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Pagamento Realizado!</h3>
        <p className="text-muted-foreground">
          Seu pagamento foi processado com sucesso.
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'processing' && renderProcessingStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};