# Migration Fixes Applied

This document tracks the fixes that were applied to resolve migration issues.

## Issues Encountered and Fixed

### Issue 1: UUID Generation Function Not Found

**Error:**
```
ERROR: function uuid_generate_v4() does not exist (SQLSTATE 42883)
```

**Cause:**
The `uuid_generate_v4()` function requires the `uuid-ossp` extension, which had schema path issues.

**Fix:**
Replaced all instances of `uuid_generate_v4()` with `gen_random_uuid()`, which is a built-in function in PostgreSQL 13+ and doesn't require any extensions.

**Files Modified:**
- `supabase/migrations/20250111000007_create_customer_driver_licenses.sql`
- `supabase/migrations/20250111000008_create_addresses.sql`
- `supabase/migrations/20250111000009_create_vehicle_categories.sql`
- `supabase/migrations/20250111000010_create_motorcycles.sql`
- `supabase/migrations/20250111000011_create_proposals.sql`
- `supabase/seed/001_vehicle_categories.sql`

### Issue 2: Subquery in CHECK Constraint

**Error:**
```
ERROR: cannot use subquery in check constraint (SQLSTATE 0A000)
```

**Cause:**
The `addresses` table had a CHECK constraint that used EXISTS with a subquery to validate polymorphic relationships, which is not allowed in PostgreSQL CHECK constraints.

**Fix:**
Removed the complex CHECK constraint. Polymorphic relationships are validated at the application level through:
- Repository layer validation
- RLS policies ensuring data access control
- TypeScript type safety

**File Modified:**
- `supabase/migrations/20250111000008_create_addresses.sql`

### Issue 3: Seed Data Execution

**Error:**
```
unknown flag: --file
```

**Cause:**
The Supabase CLI doesn't support `--file` flag for `db execute` command.

**Fix:**
Created a dedicated migration file for seed data:
- `supabase/migrations/20250111000013_seed_vehicle_categories.sql`

This approach is better because:
1. Seed data is version controlled with migrations
2. Applied automatically with `npm run db:push`
3. Idempotent (uses `ON CONFLICT (name) DO NOTHING`)
4. Can be rolled back if needed

## Migration Application Order

All 13 migrations were successfully applied:

1. ✅ `20250111000001_enable_extensions.sql` - Enable PostgreSQL extensions
2. ✅ `20250111000002_create_enums.sql` - Create ENUM types
3. ✅ `20250111000003_create_updated_at_trigger.sql` - Create updated_at trigger function
4. ✅ `20250111000004_create_rental_companies.sql` - Rental companies table
5. ✅ `20250111000005_create_platform_admins.sql` - Platform admins table
6. ✅ `20250111000006_create_customers.sql` - Customers table
7. ✅ `20250111000007_create_customer_driver_licenses.sql` - Driver licenses table (FIXED)
8. ✅ `20250111000008_create_addresses.sql` - Addresses table (FIXED)
9. ✅ `20250111000009_create_vehicle_categories.sql` - Vehicle categories table (FIXED)
10. ✅ `20250111000010_create_motorcycles.sql` - Motorcycles table (FIXED)
11. ✅ `20250111000011_create_proposals.sql` - Proposals table (FIXED)
12. ✅ `20250111000012_create_rls_policies.sql` - Row-Level Security policies
13. ✅ `20250111000013_seed_vehicle_categories.sql` - Seed vehicle categories (NEW)

## Current Database State

### Tables Created (11)
1. `rental_companies` - Rental company profiles
2. `platform_admins` - Platform administrators
3. `customers` - Customer profiles
4. `customer_driver_licenses` - CNH information
5. `addresses` - Generic address storage
6. `vehicle_categories` - Motorcycle categories (with 8 seeded categories)
7. `motorcycles` - Motorcycle inventory
8. `proposals` - Rental proposals

### Security
- ✅ RLS enabled on all tables
- ✅ Helper functions created for role checks
- ✅ Comprehensive policies for all CRUD operations
- ✅ Real-time enabled for proposals and motorcycles

### Indexes
- ✅ Performance indexes on foreign keys
- ✅ Search indexes (GIN) for fuzzy text search
- ✅ Composite indexes for common queries

### Seed Data
- ✅ 8 vehicle categories loaded:
  - Street, Sport, Cruiser, Touring
  - Adventure, Scooter, Naked, Trail

## Verification

To verify everything is working:

```bash
# Check migration status
npx supabase migration list

# View tables in Supabase dashboard
# Navigate to: Table Editor

# Query vehicle categories
# In SQL Editor: SELECT * FROM vehicle_categories;
```

## Lessons Learned

1. **Use Built-in Functions**: Prefer `gen_random_uuid()` over extension-dependent functions
2. **Avoid Complex Constraints**: Use application-level validation for complex business rules
3. **Seed Data as Migrations**: Include seed data in migrations for better version control
4. **Test Incrementally**: Apply migrations one at a time when troubleshooting

## Next Steps

1. ✅ All migrations applied successfully
2. ✅ Seed data loaded
3. ⏭️ Create test users (see QUICK_START.md)
4. ⏭️ Test the application
5. ⏭️ Continue with Phase 2 implementation

---

**Last Updated**: January 11, 2025  
**Status**: ✅ All issues resolved, database ready for use

