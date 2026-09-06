-- ============================================================================
-- FASE 15 - CORREÇÃO: Visibilidade de Anotações para o Cliente
-- ============================================================================
-- PROBLEMA: A política atual 'Clientes veem notas visiveis' da tabela notas_cliente
-- usava um subselect na tabela 'usuarios'. Como a tabela 'usuarios' possui
-- regras restritas, as vezes a subquery não resolve corretamente dependendo 
-- do contexto. 
--
-- SOLUÇÃO: Usar a mesma function 'public.get_my_cliente_id()' que 
-- é utilizada na tabela de 'sites' com sucesso.
-- ============================================================================

DROP POLICY IF EXISTS "Clientes veem notas visiveis" ON public.notas_cliente;
CREATE POLICY "Clientes veem notas visiveis" ON public.notas_cliente FOR SELECT USING (
  visivel_cliente = true AND
  cliente_id = public.get_my_cliente_id()
);

-- Garantir que o admin possa ler/editar as próprias notas
-- Para segurança, reforçamos também:
DROP POLICY IF EXISTS "Admins leem notas_cliente" ON public.notas_cliente;
CREATE POLICY "Admins leem notas_cliente" ON public.notas_cliente FOR SELECT USING (public.is_admin());

-- Adicional: Permitir que clientes leiam informações básicas dos usuários que criaram as notas
-- Isso garante que as fotos e nomes da equipe da agência carreguem na tela do cliente.
DROP POLICY IF EXISTS "Usuarios leem nomes" ON public.usuarios;
CREATE POLICY "Usuarios leem nomes" ON public.usuarios FOR SELECT USING (true);
