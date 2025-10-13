-- Migration: Seed Free Plan
-- Description: Plano gratuito padrão (fallback) gerenciado pela plataforma
-- Author: Lokmoto Team
-- Date: 2025-01-12

-- ============================================================================
-- SEED - PLANO GRATUITO
-- ============================================================================

-- Inserir plano gratuito padrão (não gerenciado pela Safe2Pay)
-- Usa id_plan = 0 para identificar o plano gratuito (planos Safe2Pay começam de 1)
INSERT INTO safe2pay_plans (
    id_plan,
    name,
    amount,
    frequence,
    subscription_limit,
    quantity_subscription,
    is_active
) VALUES (
    0, -- ID 0 = Plano Gratuito (não gerenciado pela Safe2Pay)
    'Plano Gratuito',
    0.00,
    'Mensal',
    -1, -- Sem limite de assinaturas
    0,  -- Nenhuma assinatura inicial
    true
)
ON CONFLICT (id_plan) DO UPDATE SET
    name = EXCLUDED.name,
    amount = EXCLUDED.amount,
    frequence = EXCLUDED.frequence,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE safe2pay_plans IS 'Planos de assinatura. id_plan = 0 é o plano gratuito gerenciado pelo admin da plataforma e serve como fallback quando Safe2Pay não está disponível';
COMMENT ON COLUMN safe2pay_plans.subscription_limit IS 'Limite de assinaturas (-1 = ilimitado). Para plano gratuito: max 1 usuário, max 20 veículos';

