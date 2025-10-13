-- Safe2Pay Plans table
-- Stores synchronized plans from Safe2Pay API for rental company subscriptions

CREATE TABLE safe2pay_plans (
    id_plan INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    subscription_limit INTEGER DEFAULT 0,
    quantity_subscription INTEGER DEFAULT 0,
    amount NUMERIC(10,2) NOT NULL,
    frequence TEXT NOT NULL, -- e.g., "Mensal", "Quinzenal"
    is_active BOOLEAN DEFAULT true,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_safe2pay_plans_active ON safe2pay_plans(is_active);
CREATE INDEX idx_safe2pay_plans_synced_at ON safe2pay_plans(synced_at);

-- Trigger for updated_at
CREATE TRIGGER update_safe2pay_plans_updated_at
    BEFORE UPDATE ON safe2pay_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE safe2pay_plans ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE safe2pay_plans IS 'Cached Safe2Pay subscription plans for rental companies';
COMMENT ON COLUMN safe2pay_plans.id_plan IS 'Safe2Pay plan ID';
COMMENT ON COLUMN safe2pay_plans.synced_at IS 'Last synchronization timestamp with Safe2Pay API';


