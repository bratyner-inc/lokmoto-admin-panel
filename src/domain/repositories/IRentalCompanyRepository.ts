import { RentalCompany, CreateRentalCompanyDTO, UpdateRentalCompanyDTO, UpdateRentalCompanyProfileDTO } from '../entities/RentalCompany';

export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'canceled';

export interface RentalCompanyStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  canceled: number;
  expiringIn7Days: number;
}

export interface IRentalCompanyRepository {
  // CRUD operations
  getAll(): Promise<RentalCompany[]>;
  getById(id: string): Promise<RentalCompany | null>;
  create(data: CreateRentalCompanyDTO, password: string): Promise<RentalCompany>;
  update(id: string, data: UpdateRentalCompanyDTO): Promise<RentalCompany>;
  delete(id: string): Promise<void>;

  // Filtered queries
  getByStatus(status: SubscriptionStatus): Promise<RentalCompany[]>;
  getExpiringSubscriptions(days: number): Promise<RentalCompany[]>;

  // Statistics
  getStats(): Promise<RentalCompanyStats>;

  // Status management
  suspendCompany(id: string): Promise<RentalCompany>;
  activateCompany(id: string): Promise<RentalCompany>;

  // Profile management (Configurações)
  updateProfile(id: string, data: UpdateRentalCompanyProfileDTO): Promise<RentalCompany>;
  uploadLogo(rentalCompanyId: string, file: File): Promise<string>; // retorna URL

  // Onboarding management
  completeOnboardingStep(id: string, step: number): Promise<RentalCompany>;
  completeOnboarding(id: string): Promise<RentalCompany>;
}

