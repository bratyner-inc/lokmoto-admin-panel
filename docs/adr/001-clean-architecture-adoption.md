# ADR 001: Adoption of Clean Architecture

## Status
Accepted

## Context
The Lokmoto admin panel was initially built with mock data and a simple folder structure. As we integrate with Supabase and Safe2Pay, we need a scalable architecture that:
- Separates business logic from implementation details
- Makes the codebase testable and maintainable
- Allows easy replacement of data sources
- Enforces SOLID principles

## Decision
We will adopt Clean Architecture with the following layer structure:

```
src/
├── domain/           # Business entities and repository interfaces
│   ├── entities/     # Pure business objects (Motorcycle, RentalCompany, etc.)
│   ├── repositories/ # Repository interfaces (contracts)
│   └── services/     # Service interfaces
├── data/
│   ├── repositories/ # Concrete repository implementations (Supabase)
│   ├── mappers/      # Data transformation between DB and domain
│   └── datasources/  # External data source wrappers
├── presentation/
│   ├── pages/        # UI pages/screens
│   ├── components/   # Reusable UI components
│   └── hooks/        # Custom React hooks for data access
├── infrastructure/
│   ├── config/       # Configuration (Supabase client, environment)
│   └── payments/     # External services (Safe2Pay)
└── shared/           # Cross-cutting concerns (utils, constants)
```

### Layer Responsibilities

**Domain Layer (Inner-most)**
- Contains business entities and rules
- Defines interfaces (repository contracts)
- No dependencies on outer layers
- Framework-agnostic

**Data Layer**
- Implements repository interfaces
- Handles data transformation (mappers)
- Manages data sources (Supabase, APIs)
- Depends only on domain layer

**Presentation Layer**
- React components and pages
- Custom hooks for data access
- UI state management
- Depends on domain interfaces, not implementations

**Infrastructure Layer**
- External service integrations
- Configuration and setup
- Framework-specific code

**Shared Layer**
- Utility functions
- Constants
- Cross-cutting concerns

## Consequences

### Positive
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap implementations (e.g., replace Supabase)
- **Scalability**: Structure supports growth
- **Team Collaboration**: Clear boundaries for different concerns

### Negative
- **Initial Complexity**: More files and folders
- **Learning Curve**: Team needs to understand the architecture
- **Boilerplate**: More code for simple operations

### Mitigation
- Provide clear documentation and examples
- Use generators/templates for common patterns
- Start with critical features, migrate gradually

## Implementation Notes

1. **Repository Pattern**: All data access goes through repositories
2. **Dependency Injection**: Presentation layer receives repository instances
3. **Mappers**: Transform database DTOs to domain entities
4. **Custom Hooks**: Encapsulate data fetching logic

## Examples

### Domain Entity
```typescript
// src/domain/entities/Motorcycle.ts
export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  // ... pure business properties
}
```

### Repository Interface
```typescript
// src/domain/repositories/IMotorcycleRepository.ts
export interface IMotorcycleRepository {
  getAll(rentalCompanyId: string): Promise<Motorcycle[]>;
  create(dto: CreateMotorcycleDTO): Promise<Motorcycle>;
}
```

### Repository Implementation
```typescript
// src/data/repositories/MotorcycleRepository.ts
export class MotorcycleRepository implements IMotorcycleRepository {
  async getAll(rentalCompanyId: string): Promise<Motorcycle[]> {
    const { data } = await supabase
      .from('motorcycles')
      .select('*')
      .eq('rental_company_id', rentalCompanyId);
    return data.map(MotorcycleMapper.toDomain);
  }
}
```

### Custom Hook (Presentation)
```typescript
// src/presentation/hooks/useMotorcycles.ts
export function useMotorcycles() {
  const repository = new MotorcycleRepository();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  
  useEffect(() => {
    repository.getAll(userId).then(setMotorcycles);
  }, [userId]);
  
  return { motorcycles };
}
```

## References
- Clean Architecture by Robert C. Martin
- React Clean Architecture patterns
- SOLID Principles

