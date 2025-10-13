/**
 * Address Entity
 * Domain layer - Entidade de endereço normalizada
 */

export interface Address {
  id: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string; // UF
  zipCode?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para criar/atualizar endereço
 */
export interface CreateAddressDTO {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * DTO para atualizar endereço
 */
export interface UpdateAddressDTO extends Partial<CreateAddressDTO> {}

