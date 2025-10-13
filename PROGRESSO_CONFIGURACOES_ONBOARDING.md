# Progresso: Sistema de Configurações, Perfil e Onboarding

## ✅ Completado

### Migrations (5/5)
- ✅ `20250112000007_create_banks.sql` - Tabela de bancos + seed (150+ bancos)
- ✅ `20250112000008_create_rental_company_bank_accounts.sql` - Contas bancárias
- ✅ `20250112000009_add_rental_company_fields.sql` - Campos suspensão/onboarding/logo
- ✅ `20250112000010_create_company_logos_bucket.sql` - Bucket storage
- ✅ `20250112000011_seed_free_plan.sql` - Plano gratuito padrão

### Domain Layer (6/6)
- ✅ `src/domain/entities/Bank.ts`
- ✅ `src/domain/entities/RentalCompanyBankAccount.ts`
- ✅ `src/domain/entities/RentalCompany.ts` (atualizado)
- ✅ `src/domain/repositories/IBankRepository.ts`
- ✅ `src/domain/repositories/IRentalCompanyBankAccountRepository.ts`
- ✅ `src/domain/repositories/IRentalCompanyRepository.ts` (atualizado)

### Data Layer (6/6)
- ✅ `src/data/mappers/BankMapper.ts`
- ✅ `src/data/mappers/RentalCompanyBankAccountMapper.ts`
- ✅ `src/data/mappers/RentalCompanyMapper.ts` (atualizado)
- ✅ `src/data/repositories/BankRepository.ts`
- ✅ `src/data/repositories/RentalCompanyBankAccountRepository.ts`
- ✅ `src/data/repositories/RentalCompanyRepository.ts` (atualizado)

## ⏳ Faltam Criar

### Presentation Layer - Hooks (3)
- ⏳ `src/presentation/hooks/useBanks.ts`
- ⏳ `src/presentation/hooks/useBankAccounts.ts`
- ⏳ `src/presentation/hooks/useOnboarding.ts`

### Presentation Layer - Páginas (4)
- ⏳ `src/presentation/pages/store-admin/Configuracoes.tsx`
- ⏳ `src/presentation/pages/store-admin/Onboarding.tsx`
- ⏳ `src/presentation/pages/TermosDeUso.tsx`
- ⏳ `src/presentation/pages/Suspended.tsx`

### Sistema de Moderação
- ⏳ Atualizar `src/components/ProtectedRoute.tsx` (verificar suspensão)
- ⏳ Atualizar `src/infrastructure/auth/supabaseAuthService.ts` (buscar is_suspended)

### Guards e Rotas
- ⏳ Adicionar guard de onboarding em `ProtectedRoute.tsx`
- ⏳ Atualizar `src/routes/storeAdminRoutes.tsx`
- ⏳ Atualizar `src/App.tsx` (rotas públicas)
- ⏳ Atualizar `src/components/layout/AdminSidebar.tsx`

### Índices
- ⏳ Atualizar `src/presentation/hooks/index.ts`

## 📝 Próximos Passos

1. Criar os 3 hooks (useBanks, useBankAccounts, useOnboarding)
2. Criar página Configuracoes (com abas: Perfil, Dados Bancários, Termos)
3. Criar página Onboarding (stepper 4 etapas)
4. Criar páginas TermosDeUso e Suspended
5. Implementar sistema de moderação (ProtectedRoute + auth service)
6. Adicionar guard de onboarding
7. Atualizar rotas e sidebar
8. Aplicar migrations no banco
9. Testar fluxo completo

## 🚀 Aplicar Migrations

```bash
npx supabase db push
```

Ou via Supabase Dashboard > SQL Editor

## 📊 Arquivos Criados/Modificados

- **Criados**: 17 arquivos
- **Modificados**: 8 arquivos
- **Total**: 25 arquivos

## ⚠️ Notas Importantes

- Campos NÃO editáveis em Configurações: CNPJ, Email, Razão Social
- Onboarding obrigatório: bloqueia acesso ao dashboard até completar
- Plano gratuito (FREE-PLAN-DEFAULT): fallback quando Safe2Pay não disponível
- Suspensão: redireciona para /suspended, logout forçado

