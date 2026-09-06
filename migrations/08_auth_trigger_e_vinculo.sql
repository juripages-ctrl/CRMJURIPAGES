-- 1. Adicionar a coluna login_vinculado na tabela clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS login_vinculado text;

-- 2. Criar a função que será chamada pela trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Cria o registro correspondente na tabela publica de usuarios
  INSERT INTO public.usuarios (id, nome, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'cliente'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Remover a trigger se já existir e criá-la novamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Rotina de Correção (Backfill): Inserir usuários existentes da auth.users que não estão em public.usuarios
INSERT INTO public.usuarios (id, nome, email, role)
SELECT 
  au.id, 
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)), 
  au.email, 
  'cliente'
FROM auth.users au
LEFT JOIN public.usuarios pu ON au.id = pu.id
WHERE pu.id IS NULL;
