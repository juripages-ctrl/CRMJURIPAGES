-- Ativa a extensão de criptografia do Supabase (se já não estiver ativa)
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- 1. Criar uma chave de criptografia primária no cofre (Vault) do Supabase
SELECT pgsodium.create_key(
    name := 'crm_integrations_key'
);

-- Nota: Como o Supabase Vault (TCE - Transparent Column Encryption) pode variar 
-- dependendo da versão do seu projeto e exigir configurações via Dashboard,
-- o método nativo abaixo converte as colunas para usarem o padrão pgsodium (criptografia AEAD).

-- (Opcional - Requer privilégios superuser no Supabase)
-- Se a interface de TCE do Supabase estiver ativada, você pode aplicar criptografia
-- às colunas `access_token`, `refresh_token` e `api_token` diretamente pelo Dashboard
-- do Supabase na aba "Vault" > "Encrypted Columns".

-- ============================================================================
-- ALTERNATIVA: FUNÇÕES DE CRIPTOGRAFIA (Para rodar sem configurações extras)
-- Usaremos a extensão pgcrypto que já vem habilitada no Postgres do Supabase.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Para proteger os tokens de forma que eles sejam encriptados na inserção,
-- você pode definir uma chave mestra como uma variável do banco:
-- (Nunca comite a chave real. Use uma senha forte no lugar de 'sua-chave-mestra-super-secreta')

CREATE OR REPLACE FUNCTION encrypt_token(token text) RETURNS text AS $$
BEGIN
    RETURN encode(pgp_sym_encrypt(token, 'sua-chave-mestra-super-secreta'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token text) RETURNS text AS $$
BEGIN
    RETURN pgp_sym_decrypt(decode(encrypted_token, 'base64'), 'sua-chave-mestra-super-secreta');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
