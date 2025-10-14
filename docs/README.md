# Lokmoto Admin Panel - Documentation

Welcome to the Lokmoto Admin Panel documentation. This directory contains architecture decisions, setup guides, and technical documentation.

## Getting Started

1. **Setup Guide**: See [../supabase/SETUP.md](../supabase/SETUP.md) for initial setup instructions
2. **Environment Configuration**: Copy `.env.example` to `.env.local` and configure
3. **Database Migrations**: Run migrations using Supabase CLI
4. **Seed Data**: Load initial categories and test data

## Architecture

The application follows **Clean Architecture** principles with clear separation between layers:

- **Domain Layer**: Business entities and repository interfaces
- **Data Layer**: Repository implementations and data mappers
- **Presentation Layer**: React components, pages, and hooks
- **Infrastructure Layer**: External service integrations
- **Shared Layer**: Utilities and constants

See [ADR-001](./adr/001-clean-architecture-adoption.md) for detailed rationale.

## Security

Security is enforced at multiple levels:

1. **Database Level**: Row-Level Security (RLS) policies on all tables
2. **Application Level**: Role-based access control (RBAC)
3. **API Level**: Supabase Auth integration

See [ADR-002](./adr/002-supabase-rls-strategy.md) for RLS implementation details.

## Payment Integration

Payment processing uses Safe2Pay API with a phased approach:

- **Phase 1**: Stub implementation for development
- **Phase 2**: Full Safe2Pay integration
- **Phase 3**: Advanced features (split payments, analytics)

See [ADR-003](./adr/003-payment-integration-strategy.md) for complete strategy.

## Architecture Decision Records (ADR)

ADRs document significant architectural decisions:

- [ADR-001: Clean Architecture Adoption](./adr/001-clean-architecture-adoption.md)
- [ADR-002: Supabase RLS Strategy](./adr/002-supabase-rls-strategy.md)
- [ADR-003: Payment Integration Strategy](./adr/003-payment-integration-strategy.md)

## Project Structure

```
lokmoto-admin-panel/
├── docs/                    # Documentation
│   ├── adr/                # Architecture Decision Records
│   └── README.md           # This file
├── supabase/               # Supabase Infrastructure as Code
│   ├── migrations/         # Database migrations (SQL)
│   ├── functions/          # Edge Functions (Deno)
│   ├── seed/              # Seed data scripts
│   ├── config/            # Configuration files
│   └── SETUP.md           # Setup instructions
├── src/
│   ├── domain/            # Business logic layer
│   │   ├── entities/      # Domain entities
│   │   ├── repositories/  # Repository interfaces
│   │   └── services/      # Service interfaces
│   ├── data/              # Data access layer
│   │   ├── repositories/  # Repository implementations
│   │   └── mappers/       # Data mappers (DB ↔ Domain)
│   ├── presentation/      # UI layer
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── hooks/         # Custom React hooks
│   ├── infrastructure/    # External integrations
│   │   ├── config/        # Configuration (Supabase client)
│   │   ├── auth/          # Authentication service
│   │   └── payments/      # Payment service (Safe2Pay)
│   ├── shared/            # Shared utilities
│   │   ├── constants/     # Application constants
│   │   └── utils/         # Utility functions
│   ├── components/        # Legacy components (to be migrated)
│   ├── hooks/             # Legacy hooks (to be migrated)
│   ├── lib/               # Library wrappers
│   ├── pages/             # Legacy pages (to be migrated)
│   ├── routes/            # Route definitions
│   ├── services/          # Service wrappers
│   ├── stores/            # State management (Zustand)
│   └── types/             # TypeScript type definitions
└── public/                # Static assets
```

## Database Schema

### Core Tables

1. **platform_admins**: Lokmoto platform administrators
2. **rental_companies**: Companies that rent motorcycles
3. **customers**: End users who rent motorcycles
4. **motorcycles**: Motorcycle inventory
5. **proposals**: Rental proposals from customers
6. **contracts**: Active rental contracts
7. **transactions**: Payment transactions
8. **vehicle_categories**: Motorcycle categories

### Supporting Tables

9. **addresses**: Generic address storage
10. **customer_driver_licenses**: CNH information
11. **tickets**: Support tickets for issues
12. **banners**: Marketing banners

See [../supabase/migrations/](../supabase/migrations/) for detailed schema definitions.

## API Integration

### Supabase

- **Auth**: User authentication and session management
- **Database**: PostgreSQL with RLS
- **Storage**: File uploads (licenses, contracts, images)
- **Realtime**: Live updates for proposals and contracts

### Safe2Pay (Future)

- **Plans**: Subscription plan management
- **Subscriptions**: Recurring billing
- **Payments**: One-time and recurring payments
- **Webhooks**: Payment status notifications

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### 2. Update Database (if needed)
```bash
# Create migration
npx supabase migration new my_migration

# Edit supabase/migrations/[timestamp]_my_migration.sql

# Apply migration
npx supabase db push
```

### 3. Implement Feature

Follow Clean Architecture layers:
1. Define domain entity (if new)
2. Define repository interface
3. Implement repository
4. Create custom hook
5. Build UI component/page
6. Update routes

### 4. Test
```bash
npm run dev  # Start development server
```

### 5. Commit and Push
```bash
git add .
git commit -m "feat: description"
git push origin feature/my-feature
```

## Testing Strategy

### Unit Tests
- Domain entities (pure functions)
- Utilities and formatters
- Mappers

### Integration Tests
- Repository implementations
- API integrations
- Database operations

### E2E Tests
- User workflows
- Authentication flows
- CRUD operations

## Deployment

### Prerequisites
- Supabase project configured
- Environment variables set
- Database migrations applied
- Seed data loaded

### Build
```bash
npm run build
```

### Deploy
Deploy to your hosting platform (Vercel, Netlify, etc.)

Ensure environment variables are configured in your hosting platform.

## Troubleshooting

### Common Issues

**Login fails**
- Check Supabase URL and anon key in `.env.local`
- Verify user exists in both `auth.users` and profile table
- Check RLS policies are applied

**Data not loading**
- Verify RLS policies allow access
- Check network tab for API errors
- Ensure user is authenticated

**Migrations fail**
- Check PostgreSQL syntax
- Verify extensions are available
- Try applying migrations one by one

## Contributing

1. Follow Clean Architecture principles
2. Write clear, documented code
3. Add tests for new features
4. Update documentation (including ADRs for significant decisions)
5. Follow TypeScript best practices
6. Use conventional commits

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Safe2Pay API Docs](https://developers.safe2pay.com.br)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Best Practices](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For questions or issues:
1. Check this documentation
2. Review ADRs for context
3. Check Supabase dashboard logs
4. Review browser console for errors

## License

[Your License Here]

