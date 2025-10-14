# Lokmoto Admin Panel

Admin panel for the Lokmoto motorcycle rental platform. Built with React, TypeScript, and Supabase following Clean Architecture principles.

## Features

- 🏍️ **Motorcycle Management**: Complete CRUD for motorcycle inventory
- 📋 **Proposal System**: Handle rental proposals from customers
- 👥 **Multi-tenant**: Support for multiple rental companies
- 🔐 **Secure**: Row-Level Security (RLS) at database level
- 💳 **Payment Ready**: Integration with Safe2Pay (Phase 1: Stub)
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- ⚡ **Real-time**: Live updates using Supabase Realtime
- 🏗️ **Clean Architecture**: Maintainable and scalable codebase

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Payments**: Safe2Pay API
- **Architecture**: Clean Architecture with SOLID principles

## Project Structure

```
├── docs/                   # Documentation and ADRs
├── supabase/              # Infrastructure as Code
│   ├── migrations/        # Database migrations
│   ├── functions/         # Edge Functions
│   ├── seed/             # Seed data
│   └── config/           # Configuration
├── src/
│   ├── domain/           # Business logic (entities, interfaces)
│   ├── data/             # Data access (repositories, mappers)
│   ├── presentation/     # UI (pages, components, hooks)
│   ├── infrastructure/   # External services (auth, payments)
│   └── shared/           # Utilities and constants
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (already configured: `rvufhbkmqfrjdcqoeyal`)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lokmoto-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   VITE_SUPABASE_URL=https://rvufhbkmqfrjdcqoeyal.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_PROJECT_ID=rvufhbkmqfrjdcqoeyal
   ```

4. **Link to Supabase project**
   ```bash
   npm run supabase:link
   ```

5. **Apply database migrations**
   ```bash
   npm run db:push
   ```

6. **Seed initial data**
   ```bash
   npm run db:seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

8. **Open browser**
   Navigate to `http://localhost:5173`

### Creating Initial Users

See [supabase/SETUP.md](./supabase/SETUP.md) for detailed instructions on creating test users.

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database
- `npm run db:push` - Apply all migrations
- `npm run db:reset` - Reset database (⚠️ destructive)
- `npm run db:seed` - Load seed data
- `npm run db:migration` - Create new migration

### Supabase
- `npm run supabase:link` - Link to Supabase project
- `npm run supabase:status` - Check migration status
- `npm run supabase:start` - Start local Supabase (Docker required)
- `npm run supabase:stop` - Stop local Supabase

## User Roles

### Platform Admin (Global Admin)
- Manage all rental companies
- View all transactions
- Configure platform settings
- Manage users and permissions

### Rental Company (Store Admin)
- Manage motorcycle inventory
- Handle proposals from customers
- View rental contracts
- Track payments
- Manage subscription

### Customer (Not in this app)
- Browse available motorcycles
- Create rental proposals
- View contracts
- Make payments

## Key Features

### 🏍️ Motorcycle Management
- Complete inventory control
- Categories and specifications
- Availability tracking
- Image uploads
- Search and filters

### 📋 Proposals
- Customer rental requests
- Accept/reject workflow
- Automatic contract generation
- Real-time notifications

### 💳 Payment Integration
- Platform subscription billing
- Rental payment processing
- Transaction history
- Automatic status updates (via webhooks)

### 🔐 Security
- Row-Level Security (RLS) on all tables
- Role-based access control (RBAC)
- Supabase Auth integration
- Secure file storage

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** following Clean Architecture layers:
   - Domain → Data → Presentation

3. **Test locally**
   ```bash
   npm run dev
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: my feature"
   git push origin feature/my-feature
   ```

5. **Create Pull Request**

## Architecture

This project follows **Clean Architecture** principles:

- **Domain Layer**: Pure business logic, no dependencies
- **Data Layer**: Repository implementations, data mappers
- **Presentation Layer**: React components and hooks
- **Infrastructure Layer**: External service integrations

See [docs/adr/001-clean-architecture-adoption.md](./docs/adr/001-clean-architecture-adoption.md) for details.

## Documentation

- [Setup Guide](./supabase/SETUP.md)
- [Architecture Documentation](./docs/README.md)
- [ADR-001: Clean Architecture](./docs/adr/001-clean-architecture-adoption.md)
- [ADR-002: RLS Strategy](./docs/adr/002-supabase-rls-strategy.md)
- [ADR-003: Payment Integration](./docs/adr/003-payment-integration-strategy.md)

## Testing

```bash
# Run unit tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting platform**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy`
   - Or any static hosting

3. **Configure environment variables** in your hosting platform

4. **Ensure database migrations are applied** to production Supabase instance

## Troubleshooting

### Login Issues
- Verify `.env.local` has correct Supabase credentials
- Check user exists in both `auth.users` and profile table
- Ensure email confirmation is disabled in Supabase Auth settings

### Data Not Loading
- Check RLS policies are applied: `npm run db:push`
- Verify user role in correct table
- Check browser console for errors

### Migration Errors
- Try applying migrations individually
- Check PostgreSQL logs in Supabase dashboard
- Verify extensions are enabled

See [supabase/SETUP.md](./supabase/SETUP.md) for more troubleshooting tips.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the architecture guidelines
4. Write clean, documented code
5. Create a Pull Request

## License

[Your License Here]

## Support

For issues or questions:
- Check [Documentation](./docs/README.md)
- Review [Setup Guide](./supabase/SETUP.md)
- Open an issue on GitHub

---

Built with ❤️ for the Lokmoto platform
