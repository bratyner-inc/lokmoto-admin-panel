# Lokmoto Supabase Setup Guide

This guide will help you set up the Supabase backend for the Lokmoto admin panel.

## Prerequisites

1. Node.js and npm installed
2. A Supabase account and project (already created: rvufhbkmqfrjdcqoeyal)
3. Supabase CLI installed (already in devDependencies)

## Step 1: Environment Configuration

1. Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://rvufhbkmqfrjdcqoeyal.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=rvufhbkmqfrjdcqoeyal

VITE_SAFE2PAY_TOKEN=your_sandbox_token
VITE_SAFE2PAY_SECRET_KEY=your_secret_key
VITE_SAFE2PAY_SANDBOX=true
```

2. Replace the placeholder values with your actual credentials from the prompt document.

## Step 2: Link to Supabase Project

Run the following command to link the local project to your Supabase cloud instance:

```bash
npx supabase link --project-ref rvufhbkmqfrjdcqoeyal
```

You'll be prompted to enter your Supabase database password.

## Step 3: Apply Migrations

Apply all database migrations to create tables, enable extensions, and set up RLS:

```bash
npx supabase db push
```

This will execute all migration files in the `migrations/` folder in order.

## Step 4: Seed Initial Data

Load the initial vehicle categories:

```bash
npx supabase db execute --file supabase/seed/001_vehicle_categories.sql
```

## Step 5: Create Initial Users

Since we're using Supabase Auth, you need to create users through the Supabase dashboard or programmatically:

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter email and password
5. After creating the user, copy their UUID
6. Insert a record in either `platform_admins` or `rental_companies` table with that UUID

### Option B: Using SQL (Recommended for Initial Setup)

Execute this SQL in the Supabase SQL Editor:

```sql
-- Create a platform admin user
-- First, create the auth user (do this in the dashboard first, then use the UUID here)
-- INSERT INTO platform_admins (id, full_name, email, role)
-- VALUES ('USER_UUID_FROM_AUTH', 'Admin Global', 'admin@lokmoto.com', 'super_admin');

-- Or create a rental company user
-- INSERT INTO rental_companies (id, trading_name, company_name, email, phone, cnpj)
-- VALUES ('USER_UUID_FROM_AUTH', 'Razão Social Ltda', 'Nome Fantasia', 'loja@lokmoto.com', '11999999999', '12345678000190');
```

## Step 6: Verify Setup

1. Check that all tables exist:
```bash
npx supabase db execute --file - <<EOF
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
EOF
```

2. Check that RLS is enabled:
```bash
npx supabase db execute --file - <<EOF
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
EOF
```

## Step 7: Test Authentication

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the login page
3. Try logging in with the credentials you created in Step 5

## Common Issues

### Migration Errors

If you encounter errors during migration:

1. Check the Supabase dashboard logs
2. Verify all extensions are available in your Supabase plan
3. Try applying migrations one by one:

```bash
npx supabase db execute --file supabase/migrations/20250111000001_enable_extensions.sql
npx supabase db execute --file supabase/migrations/20250111000002_create_enums.sql
# ... and so on
```

### RLS Policy Errors

If you can't access data even when logged in:

1. Check that your user exists in the appropriate table (platform_admins or rental_companies)
2. Verify RLS policies are correctly applied
3. Check browser console for authentication errors

### Authentication Issues

If login fails:

1. Verify Supabase URL and anon key in `.env.local`
2. Check that the user exists in both `auth.users` and the appropriate profile table
3. Ensure email confirmation is disabled for development (Supabase dashboard > Authentication > Settings)

## Next Steps

After successful setup:

1. Create some test data (motorcycles, proposals)
2. Test the rental company flow
3. Verify real-time updates work
4. Test file uploads when Storage is configured

## Rollback

If you need to rollback migrations:

```bash
# This will drop all tables - USE WITH CAUTION
npx supabase db reset
```

Then re-run migrations from Step 3.

