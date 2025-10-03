-- Insert initial global admin user
-- NOTE: This user needs to sign up through the app first with email: admin@lokmoto.com
-- After signup, this migration will add the admin role and profile

-- First, check if admin role exists and create admin profile
-- This will only work after the user signs up through the normal flow

DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Try to find existing user with admin email
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'admin@lokmoto.com'
  LIMIT 1;

  -- If user exists, ensure they have admin role and profile
  IF v_admin_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'platform_admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Insert platform admin profile if not exists
    INSERT INTO public.platform_admins (id, email, full_name, role)
    VALUES (
      v_admin_id,
      'admin@lokmoto.com',
      'Administrador Global',
      'super_admin'
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Admin role and profile created for existing user';
  ELSE
    RAISE NOTICE 'User admin@lokmoto.com does not exist yet. Please sign up first with this email.';
  END IF;
END $$;