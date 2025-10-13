-- Add is_active field to customers table
-- This allows Global Admin to suspend/activate customers

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for quick filtering
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- Comment
COMMENT ON COLUMN customers.is_active IS 'Whether the customer is active or suspended';


