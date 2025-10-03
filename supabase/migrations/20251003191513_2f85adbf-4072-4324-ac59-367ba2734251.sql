-- Add daily_rate column to motorcycles table
ALTER TABLE public.motorcycles 
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Add comment to daily_rate column
COMMENT ON COLUMN public.motorcycles.daily_rate IS 'Daily rental rate for the motorcycle';