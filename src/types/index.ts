export * from './auth';

// Common interfaces
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  model: string;
  brand: string;
  year: number;
  plate: string;
  color: string;
  chassisNumber: string;
  fuelType: 'gasoline' | 'ethanol' | 'flex' | 'electric';
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  dailyRate: number;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  clientId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'cash';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  transactionId?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  vehicleId: string;
  requestedStartDate: string;
  requestedEndDate: string;
  proposedDailyRate: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  notes?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'hero' | 'sidebar' | 'footer';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalVehicles: number;
  activeContracts: number;
  monthlyRevenue: number;
  availableVehicles: number;
  pendingPayments: number;
  recentActivity: Array<{
    id: string;
    type: 'contract' | 'payment' | 'client' | 'vehicle';
    description: string;
    timestamp: string;
  }>;
}