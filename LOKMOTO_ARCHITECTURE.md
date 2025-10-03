# Arquitetura Lokmoto - Documentação Completa

## 📋 Índice
1. [Resumo do Schema](#resumo-do-schema)
2. [Regras RLS e RBAC](#regras-rls-e-rbac)
3. [Integração Safe2Pay](#integração-safe2pay)
4. [Recursos Supabase](#recursos-supabase)
5. [Estratégia de Notificações](#estratégia-de-notificações)
6. [Plano de Migração Frontend](#plano-de-migração-frontend)
7. [Melhorias e Otimizações](#melhorias-e-otimizações)

---

## 1. Resumo do Schema

### 🎯 Visão Geral
O sistema Lokmoto gerencia assinaturas de locação de motocicletas com três perfis principais:
- **Customers (Renters)**: Clientes que alugam motos
- **Rental Companies**: Empresas que fornecem motos para locação
- **Platform Admins**: Administradores da plataforma

### 📊 Entidades e Relacionamentos

#### **user_roles** (Tabela de Roles - Separada para Segurança)
- `id`: UUID (PK)
- `user_id`: UUID (FK → auth.users)
- `role`: ENUM (customer, rental_company, platform_admin)
- **Propósito**: Implementa RBAC seguro evitando ataques de escalação de privilégios

#### **customers** (Perfil de Clientes)
- `id`: UUID (PK, FK → auth.users)
- `full_name`, `email`, `phone`
- `document_id`: CPF do cliente
- **Relacionamentos**: 
  - 1:N com `customer_driver_licenses`
  - 1:N com `proposals`
  - 1:N com `contracts`
  - 1:N com `tickets`
  - 1:N com `addresses`

#### **customer_driver_licenses** (CNH dos Clientes)
- `id`: UUID (PK)
- `customer_id`: UUID (FK → customers)
- `license_number`, `category`, `expiration_date`
- `license_file`: Referência ao Storage bucket 'licenses'
- **Propósito**: Armazena histórico de CNHs e versões

#### **rental_companies** (Empresas de Locação)
- `id`: UUID (PK, FK → auth.users)
- `trading_name` (razão social), `company_name` (nome fantasia)
- `cnpj`, `email`, `phone`
- `subscription_status`: ENUM (active, inactive, pending, canceled)
- `subscription_plan`: ID do plano Safe2Pay
- `safe2pay_subscription_id`: ID da assinatura Safe2Pay
- `bank_account`: JSONB com dados bancários
- **Relacionamentos**:
  - 1:N com `motorcycles`
  - 1:N com `proposals`
  - 1:N com `contracts`
  - 1:N com `tickets`
  - 1:N com `addresses`

#### **platform_admins** (Administradores da Plataforma)
- `id`: UUID (PK, FK → auth.users)
- `full_name`, `email`
- `role`: ENUM (super_admin, manager, support)
- **Propósito**: Gerenciam locadoras, planos, transações e configurações globais

#### **addresses** (Endereços Genéricos)
- `id`: UUID (PK)
- `owner_type`: ENUM (customer, rental_company)
- `owner_id`: UUID (FK dinâmica)
- `street`, `number`, `complement`, `district`, `city`, `state`, `postal_code`
- **Propósito**: Tabela polimórfica para endereços de clientes e locadoras

#### **vehicle_categories** (Categorias de Veículos)
- `id`: UUID (PK)
- `name`, `description`
- **Exemplos**: Sport, Touring, Adventure, Urban

#### **motorcycles** (Motocicletas)
- `id`: UUID (PK)
- `rental_company_id`: UUID (FK → rental_companies)
- `category_id`: UUID (FK → vehicle_categories)
- `brand`, `model`, `version`, `year`
- `plate`, `renavam`, `chassis` (únicos)
- `color`, `engine_capacity` (cilindrada)
- `is_available`: BOOLEAN
- `availability_periods`: JSONB [{"start": "date", "end": "date"}]

#### **proposals** (Propostas de Locação)
- `id`: UUID (PK)
- `customer_id`: UUID (FK → customers)
- `motorcycle_id`: UUID (FK → motorcycles)
- `rental_company_id`: UUID (FK → rental_companies)
- `status`: ENUM (open, pending, answered_company, answered_customer, closed, accepted, rejected)
- `start_date`, `end_date`
- `notes`: TEXT
- **Fluxo**: Customer cria → Rental Company aceita/rejeita → Se aceita, gera Contract

#### **contracts** (Contratos de Locação)
- `id`: UUID (PK)
- `proposal_id`: UUID (FK → proposals, nullable)
- `customer_id`, `motorcycle_id`, `rental_company_id`
- `contract_file`: Referência ao Storage bucket 'contracts'
- `status`: ENUM (active, pending_signature, pending_payment, canceled, expired, finished)
- `start_date`, `end_date`
- `observations`: TEXT

#### **transactions** (Transações Financeiras)
- `id`: UUID (PK)
- `payer_id`: UUID (customer ou rental_company)
- `receiver_id`: UUID (plataforma - fixo)
- `amount`, `currency` (BRL)
- `payment_method`: ENUM (credit_card, boleto, pix)
- `status`: ENUM (pending, paid, failed, refunded)
- `external_reference`: ID da transação Safe2Pay
- `safe2pay_subscription_id`: ID da assinatura Safe2Pay
- `contract_id`: UUID (FK → contracts, nullable)
- `transaction_type`: ENUM (rental_payment, platform_subscription)
- `customer_data`, `rental_company_data`: JSONB (dados completos para auditoria)
- **Propósito**: Todos os pagamentos passam pela plataforma como único recebedor

#### **tickets** (Chamados/Ocorrências)
- `id`: UUID (PK)
- `contract_id`: UUID (FK → contracts)
- `customer_id`, `rental_company_id`
- `type`: ENUM (defect, accident, other)
- `description`, `occurrence_date`
- `location`: TEXT (ou PostGIS geometry)
- `status`: ENUM (open, in_progress, closed)

#### **banners** (Banners Promocionais)
- `id`: UUID (PK)
- `title`, `description`
- `image`: Referência ao Storage bucket 'banners'
- `url`, `type`: ENUM (hero, sidebar_horizontal, sidebar_vertical)
- `start_date`, `end_date`, `is_active`

---

## 2. Regras RLS e RBAC

### 🔐 Funções de Segurança (Security Definer - Evita Recursão)

```sql
-- Verifica se usuário tem role específica
public.has_role(_user_id UUID, _role app_role) → BOOLEAN

-- Verifica se é admin da plataforma
public.is_platform_admin(_user_id UUID) → BOOLEAN

-- Verifica se é locadora
public.is_rental_company(_user_id UUID) → BOOLEAN

-- Verifica se é cliente
public.is_customer(_user_id UUID) → BOOLEAN
```

### 🛡️ Políticas RLS por Tabela

#### **user_roles**
- ✅ Platform admins: Acesso total (SELECT, INSERT, UPDATE, DELETE)
- ✅ Users: Apenas visualizam suas próprias roles

#### **customers**
- ✅ Customers: Visualizam e editam seu próprio perfil
- ✅ Platform admins: Acesso total
- ✅ Rental companies: Visualizam apenas clientes com contratos ativos

#### **customer_driver_licenses**
- ✅ Customers: CRUD completo de suas próprias CNHs
- ✅ Platform admins: Visualizam todas
- ✅ Rental companies: Visualizam CNHs de seus clientes

#### **rental_companies**
- ✅ Rental companies: Visualizam e editam seu próprio perfil
- ✅ Platform admins: Acesso total
- ✅ Customers: Visualizam locadoras (para escolher)

#### **motorcycles**
- ✅ Rental companies: CRUD completo de suas motos
- ✅ Platform admins: Acesso total
- ✅ Customers: Visualizam apenas motos disponíveis

#### **proposals**
- ✅ Customers: Criam e editam suas propostas
- ✅ Rental companies: Visualizam e editam propostas para suas motos
- ✅ Platform admins: Acesso total

#### **contracts**
- ✅ Customers: Visualizam e editam seus contratos
- ✅ Rental companies: Visualizam e editam contratos de suas motos
- ✅ Platform admins: Acesso total

#### **transactions**
- ✅ Users: Visualizam transações onde são payer
- ✅ Platform admins: Acesso total (criam, atualizam)

#### **tickets**
- ✅ Customers: Criam e editam seus tickets
- ✅ Rental companies: Visualizam e editam tickets de seus contratos
- ✅ Platform admins: Acesso total

#### **banners**
- ✅ Anyone: Visualizam banners ativos
- ✅ Platform admins: CRUD completo

---

## 3. Integração Safe2Pay

### 🔑 Credenciais (Sandbox)
```
API Key: FD983FC0592D42A78E4B5B8D8126DFEA
Secret Key: 282C7084C765447D9623C35282AFBD6823AA978D49B646B68E35B5ECC3AF76BD
```

### 📡 Edge Functions Criadas

#### **safe2pay-get-plans**
- **Endpoint**: GET https://services.safe2pay.com.br/recurrence/v1/plans/
- **Propósito**: Lista planos disponíveis do Safe2Pay
- **Resposta**:
```json
{
  "success": true,
  "data": {
    "objects": [
      {
        "idPlan": 1,
        "name": "Plano mensal A",
        "subscriptionLimit": 0,
        "quantitySubscription": 0,
        "amount": 1,
        "frequence": "Mensal"
      }
    ],
    "totalItems": 100
  }
}
```

#### **safe2pay-create-subscription**
- **Endpoint**: POST https://services.safe2pay.com.br/recurrence/v1/subscription
- **Propósito**: Cria assinatura mensal para locadoras
- **Payload**:
```json
{
  "planId": 1,
  "customerId": "uuid",
  "paymentMethod": "credit_card",
  "cardToken": "token",
  "customerData": {
    "name": "Nome",
    "email": "email@example.com",
    "cpfCnpj": "00000000000"
  }
}
```

#### **safe2pay-create-payment**
- **Endpoint**: POST https://services.safe2pay.com.br/v2/Payment
- **Propósito**: Cria pagamento único para locações
- **Payload**:
```json
{
  "contractId": "uuid",
  "amount": 100.00,
  "paymentMethod": "credit_card",
  "cardToken": "token",
  "customerData": { ... },
  "rentalCompanyData": { ... }
}
```

#### **safe2pay-webhook**
- **Endpoint**: POST (configurar no Safe2Pay Dashboard)
- **Propósito**: Recebe webhooks de mudança de status
- **Eventos tratados**:
  - `PaymentApproved`: Atualiza transaction.status = 'paid'
  - `PaymentDenied`: Atualiza transaction.status = 'failed'
  - `SubscriptionCancelled`: Atualiza rental_company.subscription_status = 'canceled'

### 🔄 Fluxo de Pagamentos

#### **Locações (Rental Payments)**
1. Cliente cria proposta → Locadora aceita → Gera contrato
2. Frontend tokeniza cartão (Safe2Pay SDK)
3. Chama `safe2pay-create-payment` com token
4. Safe2Pay processa → Cria transaction record
5. Webhook atualiza status → Notifica cliente

#### **Assinaturas de Locadoras (Platform Subscriptions)**
1. Locadora escolhe plano (via `safe2pay-get-plans`)
2. Frontend tokeniza cartão
3. Chama `safe2pay-create-subscription`
4. Safe2Pay cria assinatura recorrente mensal
5. Webhook atualiza `rental_companies.subscription_status`
6. Cobrança automática todo mês

### 💰 Modelo de Receita
- **Plataforma como único recebedor**: Todos os pagamentos vão para a plataforma
- **Divisão de lucros**: Feita manualmente pelo proprietário da plataforma
- **Transparência**: Dados completos de cliente e locadora em cada transação (JSONB)

---

## 4. Recursos Supabase

### 🔐 Auth
- **Providers**: Email/Password, Google
- **User Metadata**: Armazena role inicial
- **Trigger on signup**: Cria profile (customer, rental_company, ou platform_admin)

### 🗄️ Storage
| Bucket | Público | Tamanho Max | MIME Types | Uso |
|--------|---------|-------------|------------|-----|
| licenses | ❌ | 50MB | image/*, pdf | CNHs dos clientes |
| contracts | ❌ | 50MB | pdf | Contratos assinados |
| banners | ✅ | 10MB | image/* | Banners promocionais |

### ⚡ Edge Functions
- `safe2pay-get-plans`: Lista planos
- `safe2pay-create-subscription`: Cria assinatura
- `safe2pay-create-payment`: Processa pagamento
- `safe2pay-webhook`: Recebe notificações Safe2Pay

### 🔴 Realtime
**Tabelas habilitadas**:
- `proposals`: Atualizações em tempo real de propostas
- `contracts`: Status de contratos
- `transactions`: Pagamentos processados
- `tickets`: Novos chamados
- `motorcycles`: Disponibilidade

**Exemplo de uso**:
```typescript
const channel = supabase
  .channel('proposals-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'proposals',
    filter: `customer_id=eq.${userId}`
  }, (payload) => {
    console.log('Proposal updated:', payload)
  })
  .subscribe()
```

### 🧩 Postgres Extensions
- `uuid-ossp`: Geração de UUIDs
- `pg_trgm`: Busca fuzzy em marcas/modelos
- `postgis`: Coordenadas GPS para localização de ocorrências

---

## 5. Estratégia de Notificações

### 📬 Triggers e pg_notify

#### **Trigger para novas propostas**
```sql
CREATE OR REPLACE FUNCTION notify_new_proposal()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_proposal',
    json_build_object(
      'proposal_id', NEW.id,
      'customer_id', NEW.customer_id,
      'rental_company_id', NEW.rental_company_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_proposal_created
  AFTER INSERT ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION notify_new_proposal();
```

### 📧 Canais de Notificação

#### **Email (via Resend/SendGrid)**
- Welcome emails
- Proposal status updates
- Contract ready for signature
- Payment confirmations
- Subscription expiration warnings (7 days before)

#### **SMS (via Twilio)**
- Ticket urgent alerts (accidents)
- Payment failures
- Subscription canceled

#### **Push Notifications (via FCM)**
- Real-time proposal updates
- New messages in tickets
- Motorcycle availability

#### **In-App (via Realtime)**
- Dashboard notifications
- Toast messages
- Badge counters

### 🔔 Eventos de Notificação

| Evento | Customer | Rental Company | Platform Admin | Canais |
|--------|----------|----------------|----------------|--------|
| Nova proposta criada | ✅ | ✅ | ❌ | Email, In-App |
| Proposta aceita | ✅ | ❌ | ❌ | Email, Push, In-App |
| Proposta rejeitada | ✅ | ❌ | ❌ | Email, In-App |
| Contrato pronto | ✅ | ✅ | ❌ | Email, Push |
| Pagamento sucesso | ✅ | ✅ | ❌ | Email, In-App |
| Pagamento falhou | ✅ | ✅ | ✅ | Email, SMS, In-App |
| Novo ticket | ✅ | ✅ | ❌ | Email, Push |
| Ticket de acidente | ❌ | ✅ | ✅ | Email, SMS |
| Assinatura expirando | ❌ | ✅ | ✅ | Email, In-App |
| Assinatura cancelada | ❌ | ✅ | ✅ | Email, SMS |
| Nova locadora | ❌ | ❌ | ✅ | Email |

---

## 6. Plano de Migração Frontend

### 🏗️ Arquitetura Limpa (Clean Architecture)

```
src/
├── domain/              # Camada de Negócio
│   ├── entities/        # Entidades de domínio
│   │   ├── Customer.ts
│   │   ├── RentalCompany.ts
│   │   ├── Motorcycle.ts
│   │   ├── Proposal.ts
│   │   ├── Contract.ts
│   │   └── Transaction.ts
│   ├── interfaces/      # Contratos de repositórios
│   │   ├── ICustomerRepository.ts
│   │   ├── IMotorcycleRepository.ts
│   │   └── ISafe2PayService.ts
│   └── use-cases/       # Regras de negócio
│       ├── CreateProposal.ts
│       ├── AcceptProposal.ts
│       └── ProcessPayment.ts
│
├── data/                # Camada de Dados
│   ├── repositories/    # Implementações de repositórios
│   │   ├── SupabaseCustomerRepository.ts
│   │   ├── SupabaseMotorcycleRepository.ts
│   │   └── SupabaseProposalRepository.ts
│   ├── services/        # Serviços externos
│   │   ├── Safe2PayService.ts
│   │   └── NotificationService.ts
│   └── mappers/         # Conversores de dados
│       ├── CustomerMapper.ts
│       └── MotorcycleMapper.ts
│
├── presentation/        # Camada de Apresentação
│   ├── pages/          # Páginas
│   │   ├── global-admin/
│   │   ├── store-admin/
│   │   └── customer/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── ui/         # Componentes de UI
│   │   ├── forms/      # Formulários
│   │   └── features/   # Componentes de features
│   ├── hooks/          # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useProposals.ts
│   │   └── usePayment.ts
│   └── contexts/       # Contexts do React
│       ├── AuthContext.tsx
│       └── NotificationContext.tsx
│
├── infrastructure/      # Camada de Infraestrutura
│   ├── supabase/       # Cliente Supabase
│   │   ├── client.ts
│   │   └── types.ts
│   ├── safe2pay/       # Cliente Safe2Pay
│   │   └── sdk.ts
│   └── config/         # Configurações
│       └── constants.ts
│
└── shared/             # Utilitários compartilhados
    ├── utils/
    ├── validators/
    └── constants/
```

### 📝 Interfaces TypeScript Baseadas no Schema

#### **domain/entities/Customer.ts**
```typescript
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentId: string; // CPF
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerDriverLicense {
  id: string;
  customerId: string;
  licenseNumber: string;
  category: 'A' | 'B' | 'AB' | 'C' | 'D' | 'E';
  expirationDate: Date;
  issuingState: string;
  issuingDate: Date;
  licenseFile?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **domain/entities/RentalCompany.ts**
```typescript
export interface RentalCompany {
  id: string;
  tradingName: string; // razão social
  companyName: string; // nome fantasia
  email: string;
  phone: string;
  cnpj: string;
  subscriptionStatus: 'active' | 'inactive' | 'pending' | 'canceled';
  subscriptionPlan?: string;
  subscriptionExpiration?: Date;
  safe2paySubscriptionId?: string;
  bankAccount?: {
    agency: string;
    account: string;
    bankCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### **domain/entities/Motorcycle.ts**
```typescript
export interface Motorcycle {
  id: string;
  rentalCompanyId: string;
  categoryId?: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  renavam: string;
  chassis: string;
  color: string;
  engineCapacity: number;
  isAvailable: boolean;
  availabilityPeriods?: Array<{
    start: Date;
    end: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **domain/entities/Proposal.ts**
```typescript
export type ProposalStatus = 
  | 'open' 
  | 'pending' 
  | 'answered_company' 
  | 'answered_customer' 
  | 'closed' 
  | 'accepted' 
  | 'rejected';

export interface Proposal {
  id: string;
  customerId: string;
  motorcycleId: string;
  rentalCompanyId: string;
  status: ProposalStatus;
  startDate: Date;
  endDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **domain/entities/Contract.ts**
```typescript
export type ContractStatus = 
  | 'active' 
  | 'pending_signature' 
  | 'pending_payment' 
  | 'canceled' 
  | 'expired' 
  | 'finished';

export interface Contract {
  id: string;
  proposalId?: string;
  customerId: string;
  motorcycleId: string;
  rentalCompanyId: string;
  contractFile?: string;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **domain/entities/Transaction.ts**
```typescript
export type PaymentMethod = 'credit_card' | 'boleto' | 'pix';
export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type TransactionType = 'rental_payment' | 'platform_subscription';

export interface Transaction {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  externalReference?: string;
  safe2paySubscriptionId?: string;
  contractId?: string;
  transactionType: TransactionType;
  customerData?: {
    cpfCnpj: string;
    id: string;
    name: string;
    rentalCompanyCnpj?: string;
    rentalCompanyName?: string;
  };
  rentalCompanyData?: {
    cnpj: string;
    id: string;
    tradingName: string;
    subscriptionPlan?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 🔄 Mapeamento de Mocks para Entidades

#### **Antes (Mock)**
```typescript
// src/pages/global-admin/Clientes.tsx
const mockClientes = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    // ... outros campos
  }
];
```

#### **Depois (Real Data)**
```typescript
// src/data/repositories/SupabaseCustomerRepository.ts
import { supabase } from '@/infrastructure/supabase/client';
import { ICustomerRepository } from '@/domain/interfaces/ICustomerRepository';
import { Customer } from '@/domain/entities/Customer';
import { CustomerMapper } from '@/data/mappers/CustomerMapper';

export class SupabaseCustomerRepository implements ICustomerRepository {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data.map(CustomerMapper.toDomain);
  }
  
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw new Error(error.message);
    return data ? CustomerMapper.toDomain(data) : null;
  }
  
  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(CustomerMapper.toDatabase(customer))
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return CustomerMapper.toDomain(data);
  }
  
  // ... outros métodos
}
```

### 🪝 Custom Hooks

#### **hooks/useCustomers.ts**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseCustomerRepository } from '@/data/repositories/SupabaseCustomerRepository';
import { Customer } from '@/domain/entities/Customer';

const repository = new SupabaseCustomerRepository();

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => repository.getAll(),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) =>
      repository.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
```

### 🔐 Integração com Auth

#### **hooks/useAuth.ts**
```typescript
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/infrastructure/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<'customer' | 'rental_company' | 'platform_admin' | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setRole(data.role);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, role: 'customer' | 'rental_company') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role, // Stored in user metadata
        },
      },
    });
    
    if (!error && data.user) {
      // Create user_role record
      await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role });
    }
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    isLoading,
    role,
    isAuthenticated: !!user,
    isCustomer: role === 'customer',
    isRentalCompany: role === 'rental_company',
    isPlatformAdmin: role === 'platform_admin',
    signIn,
    signUp,
    signOut,
  };
};
```

### 💳 Integração Safe2Pay

#### **infrastructure/safe2pay/sdk.ts**
```typescript
export class Safe2PaySDK {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, isSandbox = true) {
    this.apiKey = apiKey;
    this.baseUrl = isSandbox
      ? 'https://services.safe2pay.com.br'
      : 'https://services.safe2pay.com.br';
  }

  async getPlans() {
    const response = await fetch(`${this.baseUrl}/recurrence/v1/plans/`, {
      headers: {
        'X-API-KEY': this.apiKey,
        'accept': 'application/json',
      },
    });
    return response.json();
  }

  // Card tokenization (frontend only)
  async tokenizeCard(cardData: {
    holderName: string;
    cardNumber: string;
    expirationDate: string;
    securityCode: string;
  }): Promise<string> {
    // Implementar com Safe2Pay SDK JavaScript
    // Retorna token do cartão
    return 'card_token';
  }
}
```

#### **hooks/useSafe2Pay.ts**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/infrastructure/supabase/client';

export const useSafe2PayPlans = () => {
  return useQuery({
    queryKey: ['safe2pay-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('safe2pay-get-plans');
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: async (payload: {
      planId: number;
      customerId: string;
      paymentMethod: 'credit_card' | 'boleto';
      cardToken?: string;
      customerData: any;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        'safe2pay-create-subscription',
        { body: payload }
      );
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (payload: {
      contractId: string;
      amount: number;
      paymentMethod: 'credit_card' | 'boleto' | 'pix';
      cardToken?: string;
      customerData: any;
      rentalCompanyData: any;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        'safe2pay-create-payment',
        { body: payload }
      );
      if (error) throw error;
      return data;
    },
  });
};
```

### 📦 Estratégia de Migração Gradual

#### **Fase 1: Preparação (Semana 1)**
1. ✅ Criar estrutura de pastas Clean Architecture
2. ✅ Definir todas as interfaces TypeScript
3. ✅ Criar mappers para conversão de dados
4. ✅ Implementar repositórios Supabase
5. ✅ Configurar TanStack Query

#### **Fase 2: Auth e Perfis (Semana 2)**
1. ✅ Implementar `useAuth` hook
2. ✅ Criar páginas de login/signup
3. ✅ Migrar páginas de perfil (Customer, Rental Company, Platform Admin)
4. ✅ Implementar upload de CNH (Storage)

#### **Fase 3: Motos e Propostas (Semana 3)**
1. ✅ Migrar listagem de motos (usar `useMotorcycles`)
2. ✅ Implementar CRUD de motos para locadoras
3. ✅ Migrar sistema de propostas
4. ✅ Configurar Realtime para propostas

#### **Fase 4: Contratos e Pagamentos (Semana 4)**
1. ✅ Migrar contratos
2. ✅ Integrar Safe2Pay SDK
3. ✅ Implementar fluxo de pagamento
4. ✅ Configurar webhooks

#### **Fase 5: Tickets e Banners (Semana 5)**
1. ✅ Migrar sistema de tickets
2. ✅ Implementar banners
3. ✅ Configurar notificações

#### **Fase 6: Testes e Otimização (Semana 6)**
1. ✅ Testes end-to-end
2. ✅ Otimizações de performance
3. ✅ Ajustes de UX
4. ✅ Deploy

---

## 7. Melhorias e Otimizações

### 🚀 Performance

#### **Índices Adicionais**
```sql
-- Índices para queries complexas
CREATE INDEX idx_contracts_dates ON public.contracts(start_date, end_date);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_proposals_created_at ON public.proposals(created_at DESC);
```

#### **Particionamento de Transactions**
```sql
-- Particionar por ano para melhor performance
CREATE TABLE public.transactions_2025 PARTITION OF public.transactions
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE public.transactions_2026 PARTITION OF public.transactions
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

#### **Materialized Views para Dashboards**
```sql
-- View materializada para estatísticas
CREATE MATERIALIZED VIEW public.dashboard_stats AS
SELECT
  COUNT(DISTINCT c.id) as total_customers,
  COUNT(DISTINCT m.id) as total_motorcycles,
  COUNT(DISTINCT CASE WHEN co.status = 'active' THEN co.id END) as active_contracts,
  SUM(CASE WHEN t.status = 'paid' AND t.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN t.amount ELSE 0 END) as monthly_revenue
FROM public.customers c
CROSS JOIN public.motorcycles m
CROSS JOIN public.contracts co
CROSS JOIN public.transactions t;

-- Refresh automático (via pg_cron)
SELECT cron.schedule(
  'refresh-dashboard-stats',
  '0 * * * *', -- A cada hora
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_stats$$
);
```

### 🔒 Segurança

#### **Auditoria**
```sql
-- Tabela de auditoria
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger genérico de auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar em tabelas críticas
CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_contracts
  AFTER INSERT OR UPDATE OR DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

#### **Rate Limiting**
```sql
-- Tabela de rate limiting
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, action, window_start)
);

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  _user_id UUID,
  _action TEXT,
  _max_requests INTEGER,
  _window_seconds INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  _count INTEGER;
BEGIN
  SELECT SUM(count) INTO _count
  FROM public.rate_limits
  WHERE user_id = _user_id
    AND action = _action
    AND window_start >= NOW() - INTERVAL '1 second' * _window_seconds;
  
  IF _count >= _max_requests THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.rate_limits (user_id, action, count, window_start)
  VALUES (_user_id, _action, 1, NOW())
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 📊 Monitoramento

#### **Logs Estruturados em Edge Functions**
```typescript
// Adicionar em todas as edge functions
const logEvent = (level: 'info' | 'warn' | 'error', message: string, meta?: any) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
    function: Deno.env.get('FUNCTION_NAME'),
  }));
};
```

#### **Métricas**
```sql
-- View para métricas de negócio
CREATE VIEW public.business_metrics AS
SELECT
  (SELECT COUNT(*) FROM public.customers) as total_customers,
  (SELECT COUNT(*) FROM public.rental_companies WHERE subscription_status = 'active') as active_rentals,
  (SELECT COUNT(*) FROM public.contracts WHERE status = 'active') as active_contracts,
  (SELECT SUM(amount) FROM public.transactions WHERE status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_30d,
  (SELECT COUNT(*) FROM public.proposals WHERE status = 'open') as open_proposals,
  (SELECT COUNT(*) FROM public.tickets WHERE status = 'open') as open_tickets;
```

### 🔄 Backup e Disaster Recovery

#### **Backup Automático**
- Supabase Cloud faz backup diário automático
- Configurar Point-in-Time Recovery (PITR) para 7 dias
- Testar restore mensalmente

#### **Replicação**
```sql
-- Configurar replica read-only para relatórios pesados
-- (Configurado via Supabase Dashboard)
```

---

## 📦 Pacotes NPM Necessários

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.58.0",
    "@tanstack/react-query": "^5.83.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "zod": "^3.25.76",
    "react-hook-form": "^7.61.1",
    "@hookform/resolvers": "^3.10.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.462.0",
    "sonner": "^1.7.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.7.3",
    "vite": "^6.0.11",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## 🚀 Scripts CLI para Configuração

### **scripts/setup-supabase.sh**
```bash
#!/bin/bash

echo "🚀 Configurando Supabase para Lokmoto..."

# Aplicar migrations
echo "📝 Aplicando migrations..."
supabase db push

# Seed inicial
echo "🌱 Criando dados iniciais..."
psql "$DATABASE_URL" <<EOF
-- Categorias de veículos
INSERT INTO public.vehicle_categories (name, description) VALUES
  ('Sport', 'Motocicletas esportivas de alta performance'),
  ('Touring', 'Motocicletas para viagens longas'),
  ('Adventure', 'Motocicletas para aventuras on/off-road'),
  ('Urban', 'Motocicletas para uso urbano'),
  ('Cruiser', 'Motocicletas estilo cruiser');

-- Admin inicial
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@lokmoto.com', crypt('admin123', gen_salt('bf')), NOW(), 'authenticated');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'platform_admin' FROM auth.users WHERE email = 'admin@lokmoto.com';

INSERT INTO public.platform_admins (id, full_name, email, role)
SELECT id, 'Admin Lokmoto', 'admin@lokmoto.com', 'super_admin'
FROM auth.users WHERE email = 'admin@lokmoto.com';
EOF

echo "✅ Configuração concluída!"
```

### **scripts/test-safe2pay.sh**
```bash
#!/bin/bash

echo "🧪 Testando integração Safe2Pay..."

# Testar obter planos
echo "📋 Obtendo planos..."
curl -X POST https://your-project.supabase.co/functions/v1/safe2pay-get-plans \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

echo "✅ Teste concluído!"
```

---

## 📞 Próximos Passos

1. **Revisar e ajustar** este documento conforme feedback
2. **Executar migrations** no ambiente de desenvolvimento
3. **Criar primeiro admin** via script de seed
4. **Testar edge functions** com Postman/Insomnia
5. **Iniciar migração do frontend** seguindo as fases
6. **Configurar webhooks** no Safe2Pay Dashboard
7. **Implementar notificações** (email, SMS, push)
8. **Testes de segurança** (penetration testing)
9. **Deploy em staging**
10. **Treinamento da equipe**
11. **Go live!** 🚀

---

**Documentação criada em:** 03/10/2025  
**Versão:** 1.0  
**Autor:** Lovable AI Assistant
