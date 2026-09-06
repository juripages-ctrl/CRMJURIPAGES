import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ClientDetailView } from './ClientDetailView'

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cliente) {
    notFound()
  }

  const { data: sites } = await supabase
    .from('sites')
    .select(`
      *,
      integracoes_google ( id )
    `)
    .eq('cliente_id', id)
    .is('deleted_at', null)
    .order('criado_em', { ascending: false })

  const { data: planos } = await supabase.from('planos').select('*').eq('ativo', true).order('valor')
  const { data: assinaturas } = await supabase.from('assinaturas').select('*, planos(nome, valor)').eq('cliente_id', id)
  
  // Get all payments for these subscriptions
  let pagamentos = []
  if (assinaturas && assinaturas.length > 0) {
    const assIds = assinaturas.map(a => a.id)
    const { data: pgs } = await supabase
      .from('pagamentos')
      .select('*, assinaturas(planos(nome))')
      .in('assinatura_id', assIds)
      .order('criado_em', { ascending: false })
    pagamentos = pgs || []
  }

  return (
    <ClientDetailView 
      cliente={cliente} 
      initialSites={sites || []}
      planos={planos || []}
      assinaturas={assinaturas || []}
      pagamentos={pagamentos}
    />
  )
}
