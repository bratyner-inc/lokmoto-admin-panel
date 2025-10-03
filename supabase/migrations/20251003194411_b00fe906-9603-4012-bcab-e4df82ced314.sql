-- Add rental_company role to app_role enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'rental_company', 'customer');
  ELSE
    -- Add new values if they don't exist
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rental_company';
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Function to sync rental_companies with user_roles
CREATE OR REPLACE FUNCTION public.sync_rental_company_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Insert role for new rental company
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'rental_company')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Remove role when rental company is deleted
    DELETE FROM public.user_roles
    WHERE user_id = OLD.id AND role = 'rental_company';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for rental_companies
DROP TRIGGER IF EXISTS sync_rental_company_role_trigger ON public.rental_companies;
CREATE TRIGGER sync_rental_company_role_trigger
  AFTER INSERT OR DELETE ON public.rental_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_rental_company_role();

-- Sync existing rental companies to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'rental_company'
FROM public.rental_companies
ON CONFLICT (user_id, role) DO NOTHING;