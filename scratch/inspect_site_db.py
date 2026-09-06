import os
from supabase import create_client

# Read .env.local
env_file = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\.env.local'
url = ""
key = ""

if os.path.exists(env_file):
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
                url = line.strip().split('=', 1)[1].strip('"\'')
            elif line.startswith('SUPABASE_SERVICE_ROLE_KEY=') or line.startswith('NEXT_PUBLIC_SUPABASE_ANON_KEY='):
                if not key or 'SERVICE_ROLE' in line:
                    key = line.strip().split('=', 1)[1].strip('"\'')

print("URL:", url)
print("KEY present:", bool(key))

supabase = create_client(url, key)

# Search site with dominio containing drdotrabalhador
res = supabase.from_('sites').select('*, clientes(*, assinaturas(*, planos(*)))').ilike('dominio', '%drdotrabalhador%').execute()

print("FOUND SITES:", res.data)
