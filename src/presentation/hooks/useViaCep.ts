/**
 * Custom Hook: useViaCep
 * Facilita a integração com o serviço ViaCEP nos formulários
 */

import { useState } from 'react';
import { viaCepService, Address } from '@/services/viaCepService';

export function useViaCep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  /**
   * Busca endereço por CEP
   */
  const searchCep = async (cep: string): Promise<Address | null> => {
    // Resetar estados
    setError(null);
    setAddress(null);

    // Validar CEP
    if (!viaCepService.isValidCep(cep)) {
      setError('CEP inválido. Digite um CEP com 8 dígitos.');
      return null;
    }

    setLoading(true);
    try {
      const result = await viaCepService.getAddressByCep(cep);

      if (!result) {
        setError('CEP não encontrado. Verifique o número digitado.');
        return null;
      }

      setAddress(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar CEP. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa os dados e erros
   */
  const reset = () => {
    setAddress(null);
    setError(null);
    setLoading(false);
  };

  /**
   * Formata CEP enquanto digita
   */
  const formatCep = (value: string): string => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 5) return clean;
    return clean.replace(/(\d{5})(\d{0,3})/, '$1-$2');
  };

  return {
    loading,
    error,
    address,
    searchCep,
    reset,
    formatCep,
    isValidCep: viaCepService.isValidCep,
  };
}

