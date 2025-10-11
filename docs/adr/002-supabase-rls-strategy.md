# ADR 002: Supabase Row-Level Security Strategy

## Status
Accepted

## Context
The Lokmoto platform serves multiple user types (Platform Admins, Rental Companies, Customers) with different access levels. We need a security strategy that:
- Enforces access control at the database level
- Prevents unauthorized data access
- Supports role-based permissions
- Is maintainable and auditable

## Decision
We will use Supabase Row-Level Security (RLS) as the primary authorization mechanism with the following strategy:

### 1. Role Determination
User roles are determined by checking existence in role-specific tables:
- `platform_admins` table → Global Admin role
- `rental_companies` table → Store Admin role
- `customers` table → Customer role

### 2. Helper Functions
Create reusable PostgreSQL functions to check roles:

```sql
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins WHERE id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_rental_company()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM rental_companies WHERE id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

### 3. Policy Patterns

**Admin Full Access Pattern**
```sql
CREATE POLICY "Platform admins can view all"
  ON table_name FOR SELECT
  USING (is_platform_admin());
```

**Owner Access Pattern**
```sql
CREATE POLICY "Users can view own records"
  ON table_name FOR SELECT
  USING (user_id = auth.uid());
```

**Scoped Access Pattern**
```sql
CREATE POLICY "Rental companies can view own motorcycles"
  ON motorcycles FOR SELECT
  USING (rental_company_id = auth.uid());
```

**Relationship-Based Access Pattern**
```sql
CREATE POLICY "Companies can view proposal customers"
  ON customers FOR SELECT
  USING (
    is_rental_company() AND
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.customer_id = customers.id
      AND proposals.rental_company_id = auth.uid()
    )
  );
```

### 4. Policy Organization

Each table has policies for different operations:
- `SELECT`: Read access
- `INSERT`: Create new records
- `UPDATE`: Modify existing records
- `DELETE`: Remove records

Policies are named descriptively: `"[Role] can [action] [scope]"`

Example:
- `"Rental companies can view own motorcycles"`
- `"Platform admins can update rental companies"`

## Consequences

### Positive
- **Database-Level Security**: Protection even if application logic fails
- **Performance**: Policies run at database level, very efficient
- **Auditability**: Clear, declarative access rules
- **Multi-Tenancy**: Natural isolation between rental companies
- **Zero Trust**: Every query is checked, regardless of source

### Negative
- **Complexity**: Can be harder to debug than application-level checks
- **Testing Overhead**: Need to test with different user contexts
- **Migration Challenges**: Changing policies requires database migrations

### Risks & Mitigations

**Risk**: Overly permissive policies
- **Mitigation**: Default deny-all, explicitly grant access
- **Mitigation**: Regular security audits of policies

**Risk**: Performance issues with complex policies
- **Mitigation**: Use indexed columns in policy conditions
- **Mitigation**: Monitor query performance

**Risk**: Difficult debugging
- **Mitigation**: Use Supabase dashboard to test policies
- **Mitigation**: Log policy evaluation in development

## Implementation Guidelines

1. **Enable RLS on ALL tables**
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

2. **Start with deny-all**
   - No policies = no access (except for service role)

3. **Add policies incrementally**
   - Start with SELECT policies
   - Then INSERT, UPDATE, DELETE

4. **Test with different users**
   - Create test users for each role
   - Verify isolation and access

5. **Use SECURITY DEFINER carefully**
   - Only for helper functions
   - Never expose sensitive data

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Default deny-all (no open tables)
- [ ] Admin policies for platform management
- [ ] Owner-scoped policies for user data
- [ ] Relationship-based policies for related data
- [ ] No policies with `USING (true)` in production
- [ ] All policies tested with actual user contexts

## Monitoring

Monitor these metrics:
- Failed authorization attempts (logged by Supabase)
- Query performance with RLS enabled
- Policy evaluation time

## References
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

