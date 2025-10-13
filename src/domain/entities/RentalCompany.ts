// Domain entity for Rental Company
export interface RentalCompany {
  id: string;
  tradingName: string; // Razão social (NÃO editável)
  companyName: string; // Nome fantasia (editável)
  email: string; // Email principal (NÃO editável)
  phone: string;
  cnpj: string; // (NÃO editável)
  subscriptionStatus: 'active' | 'inactive' | 'pending' | 'canceled';
  subscriptionPlan?: string;
  subscriptionExpiration?: Date;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
  // Endereço (polimórfico via addresses table com owner_type='rental_company' e owner_id=rental_company.id)
  address?: any; // Address object quando joined
  // Suspensão
  isSuspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: Date;
  // Logo
  logoUrl?: string;
  // Onboarding
  onboardingCompleted?: boolean;
  onboardingStep?: number; // 0-4
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentalCompanyDTO {
  tradingName: string;
  companyName: string;
  email: string;
  phone: string;
  cnpj: string;
  subscriptionPlan?: string;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
}

export interface UpdateRentalCompanyDTO {
  tradingName?: string;
  companyName?: string;
  phone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'pending' | 'canceled';
  subscriptionExpiration?: Date;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
}

/**
 * DTO para atualizar perfil da locadora (configurações)
 * Campos editáveis: companyName, phone, address (objeto completo), logoUrl
 * Campos NÃO editáveis: cnpj, email, tradingName
 */
export interface UpdateRentalCompanyProfileDTO {
  companyName?: string; // nome fantasia
  phone?: string;
  logoUrl?: string;
  // Endereço como objeto separado
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

