-- Add RLS policy to allow platform admins to insert customers
CREATE POLICY "Platform admins can insert customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (is_platform_admin(auth.uid()));

-- Add RLS policy to allow platform admins to delete customers
CREATE POLICY "Platform admins can delete customers"
ON public.customers
FOR DELETE
TO authenticated
USING (is_platform_admin(auth.uid()));