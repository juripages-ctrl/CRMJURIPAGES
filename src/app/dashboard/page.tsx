import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHomeClient } from './DashboardHomeClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  const firstName = profile?.nome?.split(' ')[0] || user.email?.split('@')[0] || 'User'

  if (profile?.role === 'cliente') {
    // Auto-link: se o cliente_id está vazio, tenta encontrar pelo email
    let clienteId = profile.cliente_id
    if (!clienteId) {
      const { data: matchingClient } = await supabase
        .from('clientes')
        .select('id')
        .or(`email.eq.${profile.email},login_vinculado.eq.${profile.email}`)
        .limit(1)
        .maybeSingle()
      
      if (matchingClient) {
        await supabase.from('usuarios').update({ cliente_id: matchingClient.id }).eq('id', user.id)
        clienteId = matchingClient.id
      }
    }

    let clientSites: any[] = []
    if (clienteId) {
      // Bloqueia cliente inadimplente
      const { data: assinaturas } = await supabase.from('assinaturas').select('status').eq('cliente_id', clienteId)
      const isBlocked = assinaturas?.some(a => ['past_due', 'unpaid', 'atrasada', 'cancelada', 'inadimplente'].includes(a.status?.toLowerCase()))
      if (isBlocked) {
        redirect('/dashboard/financeiro')
      }

      const { data, error } = await supabase
        .from('sites')
        .select('*, integracoes_google(*), integracoes_wordpress(*), clientes(*)')
        .eq('cliente_id', clienteId)
        .is('deleted_at', null)
        .order('nome', { ascending: true })
        
      if (error) {
        console.error('Erro ao buscar sites no painel do cliente (Pode faltar a migração 20_sites_lixeira.sql):', error)
      }
      clientSites = data || []
    }

    return (
      <div className="w-full h-full pb-10">
        <DashboardHomeClient sites={clientSites || []} firstName={firstName} isClientView />
      </div>
    )
  }

  // Fetch sites for admin dashboard
  const { data: sites } = await supabase
    .from('sites')
    .select('*, integracoes_google(*), integracoes_wordpress(*), clientes(*)')
    .is('deleted_at', null)
    .order('nome', { ascending: true })

  return (
    <div className="w-full h-full pb-10">
      <DashboardHomeClient sites={sites || []} firstName={firstName} />
    </div>
  )
}
