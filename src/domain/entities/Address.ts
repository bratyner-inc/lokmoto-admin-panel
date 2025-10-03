export type AddressOwnerType = 'customer' | 'rental_company';

export interface Address {
  id: string;
  ownerType: AddressOwnerType;
  ownerId: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
