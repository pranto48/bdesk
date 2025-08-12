-- Grant admin role to a specific user by email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'mail@arifmahmud.com'
ON CONFLICT (user_id, role) DO NOTHING;