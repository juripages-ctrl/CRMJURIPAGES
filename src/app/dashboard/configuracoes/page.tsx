import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesClient } from './ConfiguracoesClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Verificacao de admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('usuarios').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch Master configs
  const { data: config } = await supabase.from('configuracoes_agencia').select('*').eq('id', 1).single()

  return <ConfiguracoesClient config={config || {}} />
}
