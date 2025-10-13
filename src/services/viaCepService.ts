/**
 * ViaCEP Service
 * Integração com a API pública do ViaCEP para busca de endereços por CEP
 * https://viacep.com.br/
 */

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean; // Retornado quando CEP não existe
}

export interface Address {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  region: string;
  complement?: string;
}

class ViaCepService {
  private baseUrl = 'https://viacep.com.br/ws';

  /**
   * Busca endereço por CEP
   * @param cep CEP com ou sem formatação (00000-000 ou 00000000)
   * @returns Dados do endereço ou null se não encontrado
   */
  async getAddressByCep(cep: string): Promise<Address | null> {
    try {
      // Remover caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, '');

      // Validar formato do CEP (8 dígitos)
      if (cleanCep.length !== 8) {
        throw new Error('CEP deve conter 8 dígitos');
      }

      // Fazer requisição
      const response = await fetch(`${this.baseUrl}/${cleanCep}/json/`);

      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: ViaCepResponse = await response.json();

      // Verificar se CEP existe
      if (data.erro) {
        return null;
      }

      // Mapear para formato interno
      return {
        zipCode: this.formatCep(data.cep),
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        region: data.regiao,
        complement: data.complemento || undefined,
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  }

  /**
   * Formata CEP para o padrão 00000-000
   */
  formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Valida formato de CEP (com ou sem hífen)
   */
  isValidCep(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  }
}

export const viaCepService = new ViaCepService();

