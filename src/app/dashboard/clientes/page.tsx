import { createClient } from '@/utils/supabase/server'
import { ClientesClient } from './ClientesClient'

export default async function ClientesPage() {
  const supabase = await createClient()

  // Buscamos os clientes. O RLS já cuida para que o admin veja todos (se for admin).
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('criado_em', { ascending: false })

  const { data: planos } = await supabase
    .from('planos')
    .select('id, nome, valor')
    .eq('ativo', true)
    .order('valor', { ascending: true })

  return (
    <div className="w-full">
      <ClientesClient clientes={clientes || []} planos={planos || []} />
    </div>
  )
}
