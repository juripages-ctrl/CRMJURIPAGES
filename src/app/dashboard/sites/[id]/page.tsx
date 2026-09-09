import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { SiteDashboardClient } from './SiteDashboardClient'

export default async function SiteConfigPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch site with client
  const { data: site } = await supabase
    .from('sites')
    .select('*, clientes(*, assinaturas(*, planos(*))))')
    .eq('id', id)
    .single()

  if (!site) notFound()

  // Fetch Integrations
  const { data: gsc } = await supabase.from('integracoes_google').select('*').eq('site_id', id).maybeSingle()
  const { data: hosting } = await supabase.from('integracoes_hospedagem').select('*').eq('site_id', id).maybeSingle()
  const { data: wp } = await supabase.from('integracoes_wordpress').select('*').eq('site_id', id).maybeSingle()

  // Fetch Provedores list for the dropdown
  const { data: provedores } = await supabase.from('provedores').select('*').eq('ativo', true).order('nome_exibicao')

  // Fetch all clients for linking if unlinked
  const { data: clientes } = await supabase.from('clientes').select('id, nome').order('nome')

  return (
    <div className="w-full">
      <Link href="/dashboard/sites" className="inline-flex items-center text-[13.5px] font-medium text-[#9CA3AF] hover:text-[#111827] transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Voltar para Sites
      </Link>
      
      <Suspense fallback={<div>Carregando dashboard...</div>}>
        <SiteDashboardClient 
          site={site} 
          gsc={gsc} 
          wp={wp}
          hosting={hosting} 
          provedores={provedores || []} 
          clientes={clientes || []}
        />
      </Suspense>
    </div>
  )
}
