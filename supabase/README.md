# Supabase Infrastructure as Code

This directory contains all Supabase-related infrastructure code including migrations, edge functions, and configuration.

## Structure

```
supabase/
├── config/          # Supabase CLI configuration
├── migrations/      # Database schema migrations
├── functions/       # Edge Functions (Deno/TypeScript)
└── seed/           # Seed data scripts
```

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_SUPABASE_PROJECT_ID

2. Ensure Supabase CLI is installed as a dev dependency (already in package.json)

3. Link to your Supabase project:
   ```bash
   npx supabase link --project-ref rvufhbkmqfrjdcqoeyal
   ```

## Running Migrations

To apply migrations to your Supabase project:

```bash
npx supabase db push
```

To create a new migration:

```bash
npx supabase migration new migration_name
```

## Edge Functions

To deploy edge functions:

```bash
npx supabase functions deploy function_name
```

## Seed Data

Seed scripts are located in the `seed/` directory and can be run using:

```bash
npx supabase db seed
```

