import { useState, useCallback } from 'react';
import { CheckoutItem } from '@/components/checkout/CheckoutModal';
import { useToast } from '@/hooks/use-toast';

export interface CheckoutConfig {
  title?: string;
  description?: string;
  currency?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

export const useCheckout = (config?: CheckoutConfig) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const { toast } = useToast();

  const openCheckout = useCallback((checkoutItems: CheckoutItem[]) => {
    setItems(checkoutItems);
    setIsOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsOpen(false);
    setItems([]);
  }, []);

  const handleSuccess = useCallback((paymentData: any) => {
    config?.onSuccess?.(paymentData);
    toast({
      title: 'Pagamento realizado!',
      description: 'Seu pagamento foi processado com sucesso',
      variant: 'default'
    });
  }, [config, toast]);

  const handleError = useCallback((error: string) => {
    config?.onError?.(error);
    toast({
      title: 'Erro no pagamento',
      description: error,
      variant: 'destructive'
    });
  }, [config, toast]);

  // Shortcuts for common checkout types
  const openSubscriptionCheckout = useCallback((planName: string, price: number, description?: string) => {
    const subscriptionItem: CheckoutItem = {
      id: 'subscription',
      name: planName,
      description: description || 'Plano de assinatura mensal',
      price,
      quantity: 1,
      type: 'subscription'
    };
    openCheckout([subscriptionItem]);
  }, [openCheckout]);

  const openServiceCheckout = useCallback((serviceName: string, price: number, description?: string) => {
    const serviceItem: CheckoutItem = {
      id: 'service',
      name: serviceName,
      description,
      price,
      quantity: 1,
      type: 'service'
    };
    openCheckout([serviceItem]);
  }, [openCheckout]);

  const openProductCheckout = useCallback((products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }>) => {
    const productItems: CheckoutItem[] = products.map(product => ({
      ...product,
      type: 'product'
    }));
    openCheckout(productItems);
  }, [openCheckout]);

  return {
    // State
    isOpen,
    items,
    
    // Actions
    openCheckout,
    closeCheckout,
    openSubscriptionCheckout,
    openServiceCheckout,
    openProductCheckout,
    
    // Handlers
    handleSuccess,
    handleError,
    
    // Config
    config
  };
};