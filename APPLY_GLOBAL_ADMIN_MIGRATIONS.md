# Aplicar Migrations do Global Admin

Este documento descreve como aplicar manualmente as migrations necessárias para a funcionalidade do Global Admin.

## Migrations a Aplicar

### 1. `20250112000001_create_safe2pay_plans.sql`
**O que faz:** Cria a tabela `safe2pay_plans` para cache dos planos Safe2Pay.

**Como aplicar:**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o projeto Lokmoto
3. Navegue para **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo de `supabase/migrations/20250112000001_create_safe2pay_plans.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

### 2. `20250112000002_rls_global_admin.sql`
**O que faz:** Configura as Row Level Security (RLS) policies para permitir que platform_admins acessem todos os dados da plataforma.

**Como aplicar:**
1. No mesmo **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo de `supabase/migrations/20250112000002_rls_global_admin.sql`
4. Clique em **Run** ou pressione `Ctrl+Enter`

## Verificação

Para verificar se as migrations foram aplicadas corretamente:

### Verificar tabela safe2pay_plans
```sql
SELECT * FROM safe2pay_plans LIMIT 1;
```

### Verificar RLS policies
```sql
-- Ver policies da tabela rental_companies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'rental_companies';

-- Ver policies da tabela safe2pay_plans
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'safe2pay_plans';
```

## Ordem de Aplicação

1. ✅ `20250112000001_create_safe2pay_plans.sql` (tabela)
2. ✅ `20250112000002_rls_global_admin.sql` (RLS policies)

## Problemas Comuns

### "table already exists"
Se a tabela `safe2pay_plans` já existir, você pode pular a migration 1.

### "policy already exists"
Se as policies já existirem, você pode usar `DROP POLICY` antes de criá-las novamente:
```sql
DROP POLICY IF EXISTS "global_admin_all_access_rental_companies" ON rental_companies;
DROP POLICY IF EXISTS "global_admin_all_access_safe2pay_plans" ON safe2pay_plans;
-- ... e assim por diante
```

## Próximos Passos

Após aplicar as migrations:
1. Fazer login com o usuário platform_admin (ID: `ce29fb9a-0511-41f1-92cf-56e707f679d4`)
2. Testar acesso ao Dashboard Global
3. Sincronizar planos Safe2Pay
4. Criar uma locadora de teste
5. Visualizar dados da locadora


