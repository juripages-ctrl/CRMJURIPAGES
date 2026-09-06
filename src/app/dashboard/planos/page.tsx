import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PlanosClient } from './PlanosClient'

export default async function AdminPlanosPage() {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('usuarios').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch planos with their active subscriptions, the client details, and the latest payment
  // Note: Since 'assinaturas' references 'planos' and 'clientes', we can join them.
  // We order pagamentos by criado_em descending to get the latest status.
  const { data: planos, error } = await supabase
    .from('planos')
    .select(`
      *,
      assinaturas (
        *,
        clientes (nome),
        pagamentos (status, criado_em)
      )
    `)
    .order('valor', { ascending: true })

  // Sort pagamentos inside each assinatura to get the latest one safely, 
  // though Supabase might not support order in nested select easily without explicit order() modifier on the string.
  // Actually, we can just grab the first one in the UI or sort in JS to be safe.
  if (planos) {
    planos.forEach(plano => {
      if (plano.assinaturas) {
        plano.assinaturas.forEach((ass: any) => {
          if (ass.pagamentos && Array.isArray(ass.pagamentos)) {
            ass.pagamentos.sort((a: any, b: any) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
          }
        })
      }
    })
  }

  return (
    <div className="w-full">
      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <h3 className="font-semibold mb-2">Erro ao buscar planos</h3>
          <p className="text-sm mb-4">Você executou a migração SQL mais recente no Supabase?</p>
          <pre className="text-xs bg-black/5 p-4 rounded overflow-auto">{error.message}</pre>
        </div>
      ) : (
        <PlanosClient planos={planos || []} />
      )}
    </div>
  )
}
