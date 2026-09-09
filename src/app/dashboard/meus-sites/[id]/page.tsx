import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { SiteReportTabs } from './SiteReportTabs'

export default async function ClientSiteReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('usuarios')
    .select('cliente_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'cliente' || !profile.cliente_id) {
    redirect('/dashboard')
  }

  // Bloqueia cliente inadimplente
  if (profile.cliente_id) {
    const { data: assinaturas } = await supabase.from('assinaturas').select('status').eq('cliente_id', profile.cliente_id)
    const isBlocked = assinaturas?.some(a => ['past_due', 'unpaid', 'atrasada', 'cancelada', 'inadimplente'].includes(a.status?.toLowerCase()))
    if (isBlocked) {
      redirect('/dashboard/financeiro')
    }
  }

  // Fetch site and ENSURE it belongs to this client (RLS should do this, but we explicitly check)
  const { data: site } = await supabase
    .from('sites')
    .select('*, clientes(*, assinaturas(*, planos(*))), integracoes_google(*), integracoes_wordpress(*)')
    .eq('id', id)
    .eq('cliente_id', profile.cliente_id)
    .single()

  if (!site) notFound()

  const { data: notas } = await supabase
    .from('notas_cliente')
    .select(`
      id,
      conteudo,
      criado_em,
      usuarios ( nome, foto_url )
    `)
    .eq('cliente_id', profile.cliente_id)
    .eq('visivel_cliente', true)
    .order('criado_em', { ascending: false })

  const isOnline = site.status === 'no_ar'

  return (
    <div className="w-full pb-10">
      <Link href="/dashboard/meus-sites" className="inline-flex items-center text-[13.5px] font-medium text-[#9CA3AF] hover:text-[#111827] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Voltar para Meus Sites
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-[#111827]">{site.nome}</h1>
          <a href={`https://${site.dominio}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mt-1">
            {site.dominio} <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="bg-[#DFFF00] text-[#111827] px-3.5 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111827] animate-pulse"></span>
              Sistema Online e Protegido
            </div>
          ) : (
            <div className="bg-red-100 text-red-700 px-3.5 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Em Desenvolvimento
            </div>
          )}
        </div>
      </div>

      <SiteReportTabs isOnline={isOnline} notas={notas || []} site={site} />
    </div>
  )
}
