-- Política para permitir que o próprio usuário leia seu perfil
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.usuarios FOR SELECT USING (id = auth.uid());

-- Política para permitir que Admins vejam todos os usuários (opcional, mas bom para gestão)
CREATE POLICY "Admins podem ver todos os usuários" ON public.usuarios FOR SELECT USING (public.is_admin());
