-- Fix admin@lokmoto.com role (corrected)
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user_id from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@lokmoto.com';

  IF admin_user_id IS NOT NULL THEN
    -- Delete any existing roles for this user
    DELETE FROM public.user_roles WHERE user_id = admin_user_id;
    
    -- Insert the correct platform_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'platform_admin');
    
    -- Remove from rental_companies if exists
    DELETE FROM public.rental_companies WHERE id = admin_user_id;
    
    -- Ensure platform_admins record exists (using 'support' as the admin_role value)
    INSERT INTO public.platform_admins (id, full_name, email, role)
    VALUES (
      admin_user_id,
      'Admin Lokmoto',
      'admin@lokmoto.com',
      'support'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Admin Lokmoto',
      email = 'admin@lokmoto.com',
      role = 'support';
    
    RAISE NOTICE 'Admin user role corrected successfully';
  ELSE
    RAISE NOTICE 'Admin user not found';
  END IF;
END $$;