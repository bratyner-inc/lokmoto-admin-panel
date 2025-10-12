import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface IUserRepository {
  /**
   * Get all users (platform_admins + rental_companies)
   */
  getAll(): Promise<User[]>;

  /**
   * Get a single user by ID
   */
  getById(id: string): Promise<User | null>;

  /**
   * Create a new user (platform_admin or store_admin with rental company)
   */
  create(data: CreateUserDTO): Promise<User>;

  /**
   * Update an existing user
   */
  update(id: string, data: UpdateUserDTO): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;

  /**
   * Toggle user active status
   */
  toggleActive(id: string): Promise<User>;
}


