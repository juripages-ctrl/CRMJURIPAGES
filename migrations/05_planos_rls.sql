-- Permitir que qualquer pessoa logada leia a lista de planos ativos
CREATE POLICY "Qualquer usuario logado pode ler planos" ON public.planos FOR SELECT USING (auth.role() = 'authenticated');
