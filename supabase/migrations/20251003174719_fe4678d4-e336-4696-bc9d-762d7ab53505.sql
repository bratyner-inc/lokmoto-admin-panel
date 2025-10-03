-- Fix security linter warnings (excluding PostGIS system tables)

-- Ensure all user tables in public schema have RLS enabled (excluding system tables)
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN (
      'audit_log',
      'rate_limits',
      'spatial_ref_sys',  -- PostGIS system table
      'geography_columns', -- PostGIS system table
      'geometry_columns'   -- PostGIS system table
    )
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
  END LOOP;
END $$;

-- Add search_path to update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;