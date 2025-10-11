import { RentalCompany, CreateRentalCompanyDTO, UpdateRentalCompanyDTO } from '../entities/RentalCompany';

export interface IRentalCompanyRepository {
  // Query methods
  getAll(): Promise<RentalCompany[]>;
  getById(id: string): Promise<RentalCompany | null>;
  getByCnpj(cnpj: string): Promise<RentalCompany | null>;
  getByEmail(email: string): Promise<RentalCompany | null>;
  
  // Mutation methods
  create(data: CreateRentalCompanyDTO): Promise<RentalCompany>;
  update(id: string, data: UpdateRentalCompanyDTO): Promise<RentalCompany>;
  delete(id: string): Promise<void>;
}

