-- Create initial platform admin user
-- This will be used to bootstrap the system

-- Insert test data for development

-- Insert some vehicle categories (if not exists)
INSERT INTO public.vehicle_categories (name, description) 
VALUES 
  ('Sport', 'Motocicletas esportivas de alta performance'),
  ('Touring', 'Motocicletas para viagens longas'),
  ('Adventure', 'Motocicletas para aventuras on/off-road'),
  ('Urban', 'Motocicletas para uso urbano'),
  ('Cruiser', 'Motocicletas estilo cruiser')
ON CONFLICT (name) DO NOTHING;

-- Note: To create the initial admin user, they need to sign up via the application
-- Then their user_id will be inserted into user_roles and platform_admins tables
-- This is more secure than creating auth users directly via SQL