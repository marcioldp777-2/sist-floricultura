-- Atribuir role superadmin ao usuário Admin Marcio
INSERT INTO public.user_roles (user_id, role)
VALUES ('f840fbe3-f5a0-4891-93dd-208f2cc3efd6', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;