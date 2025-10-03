-- Add admin role and profile for admin@lokmoto.com user
DO $$
DECLARE
  v_admin_id uuid := '84600cf4-9d1a-421c-9e4d-5e7d31b6ec53';
BEGIN
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'platform_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert platform admin profile
  INSERT INTO public.platform_admins (id, email, full_name, role)
  VALUES (
    v_admin_id,
    'admin@lokmoto.com',
    'Administrador Global',
    'super_admin'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  RAISE NOTICE 'Admin role and profile created successfully for user %', v_admin_id;
END $$;