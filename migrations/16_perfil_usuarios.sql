-- 1. Adicionar campos de perfil para todos os usuários (Admins e Clientes)
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS telefone text;

-- 2. Criar bucket de storage para os avatares (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Acesso para o bucket 'avatars'
-- Permitir leitura pública
CREATE POLICY "Permitir leitura publica de avatares" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

-- Permitir inserção (upload) apenas para usuários autenticados na própria pasta (o uid deve ser parte do path ou podemos simplificar)
CREATE POLICY "Permitir upload autenticado em avatares"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir atualização do próprio avatar
CREATE POLICY "Permitir update autenticado em avatares"
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir deleção do próprio avatar
CREATE POLICY "Permitir delete autenticado em avatares"
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Função e Trigger para manter o email sincronizado
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email <> OLD.email THEN
    UPDATE public.usuarios SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE PROCEDURE public.handle_user_email_update();

-- 5. Políticas RLS para permitir a atualização do próprio perfil
DROP POLICY IF EXISTS "Usuarios atualizam proprio registro" ON public.usuarios;
CREATE POLICY "Usuarios atualizam proprio registro" ON public.usuarios FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Clientes atualizam proprio registro" ON public.clientes;
CREATE POLICY "Clientes atualizam proprio registro" ON public.clientes FOR UPDATE USING (id = public.get_my_cliente_id());
