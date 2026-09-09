import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Globe, ArrowRight, Link2, Trash2, RefreshCw } from 'lucide-react'
import { deleteSiteSoft, restoreSite, deleteSite } from './actions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SyncButton } from './SyncButton'
import { SiteActionButtons } from './SiteActionButtons'
import { SiteAvatar } from '@/components/dashboard/SiteAvatar'

export default async function SitesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams
  const tab = params.tab || 'ativos'
  const supabase = await createClient()

  // Fetch all sites with their associated client name
  const query = supabase
    .from('sites')
    .select(`
      *,
      clientes ( nome ),
      integracoes_google ( id )
    `)
    .order('criado_em', { ascending: false })

  if (tab === 'lixeira') {
    query.not('deleted_at', 'is', null)
  } else {
    query.is('deleted_at', null)
  }

  const { data: sites } = await query

  const { data: clientes } = await supabase.from('clientes').select('id, nome').order('nome')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'no_ar':
        return <Badge className="text-[11px] font-semibold text-[#111827] bg-[#DFFF00] hover:bg-[#DFFF00]/90 px-3 py-1.5 rounded-full border-none shadow-none">No Ar</Badge>
      default:
        return <Badge className="text-[11px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-100/90 px-3 py-1.5 rounded-full border-none shadow-none">Fora do Ar</Badge>
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="m-0 text-[26px] font-semibold tracking-[-0.03em] text-[#111827]">Visão Global de Sites</h1>
          <p className="m-0 text-[13.5px] text-[#9CA3AF] mt-1">Todos os sites de todos os clientes em um só lugar.</p>
        </div>
        <SyncButton />
      </div>

      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <Link 
          href="/dashboard/sites?tab=ativos" 
          className={`pb-3 text-sm font-medium transition-colors relative ${tab === 'ativos' ? 'text-black' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Sites Ativos
          {tab === 'ativos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </Link>
        <Link 
          href="/dashboard/sites?tab=lixeira" 
          className={`pb-3 text-sm font-medium transition-colors relative ${tab === 'lixeira' ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Lixeira
          {tab === 'lixeira' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600" />}
        </Link>
      </div>

      {/* ===== MOBILE: Card List ===== */}
      <div className="md:hidden flex flex-col gap-3">
        {!sites || sites.length === 0 ? (
          <div className="bg-white border border-dashed border-[#E5E7EB] rounded-[40px] p-11 text-center">
            <div className="w-14 h-14 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">Nada por aqui</p>
            <p className="text-[13.5px] text-gray-500 max-w-[230px] mx-auto">Nenhum site cadastrado no sistema.</p>
          </div>
        ) : (
          sites.map((site: any) => (
            <Link key={site.id} href={`/dashboard/sites/${site.id}`}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-[26px] p-3.5 shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)] active:scale-[0.98] transition-transform"
            >
              <SiteAvatar nome={site.nome} dominio={site.dominio} size={46} />
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-semibold text-gray-900 truncate tracking-tight">{site.nome}</p>
                <p className="text-[12.5px] text-gray-400 truncate mt-0.5">
                  {site.clientes?.nome || site.dominio}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {site.status === 'no_ar' ? (
                    <span className="text-[10.5px] font-semibold text-[#111827] bg-[#DFFF00] px-2.5 py-0.5 rounded-full">No ar</span>
                  ) : (
                    <span className="text-[10.5px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">Fora do ar</span>
                  )}
                  {site.integracoes_google?.length > 0 && (
                    <span className="text-[10.5px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">GSC</span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            </Link>
          ))
        )}
      </div>

      {/* ===== DESKTOP: Table ===== */}
      <div className="hidden md:block bg-white border border-[#EFEFEF] rounded-[40px] px-7 pt-2 pb-3.5">
        <Table className="border-none">
          <TableHeader className="border-none">
            <TableRow className="border-b border-[#F1F1F1] hover:bg-transparent">
              <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Projeto</TableHead>
              <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Cliente</TableHead>
              <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Domínio</TableHead>
              <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Integrações</TableHead>
              <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Status</TableHead>
              <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!sites || sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-gray-500 border-none">
                  <div className="flex flex-col items-center justify-center bg-white border border-dashed border-[#E5E7EB] rounded-[40px] py-20 px-6 max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-5">
                      <Globe className="w-7 h-7 text-[#9CA3AF]" />
                    </div>
                    <p className="m-0 mb-2 text-[18px] font-semibold text-gray-900">Nenhum site vinculado</p>
                    <p className="m-0 mx-auto max-w-[320px] text-[14px] leading-[1.55] text-[#6B7280]">
                      Nenhum site cadastrado no sistema.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site: any) => (
                <TableRow key={site.id} className="border-b border-[#F6F6F6] hover:bg-transparent">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <SiteAvatar nome={site.nome} dominio={site.dominio} size={44} />
                      <div>
                        <Link href={`/dashboard/sites/${site.id}`} className="m-0 text-[15px] font-semibold tracking-[-0.012em] text-gray-900 truncate hover:text-[#9CA3AF] transition-colors">{site.nome}</Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-[13.5px] text-[#6B7280]">
                    {site.cliente_id ? (
                      <Link href={`/dashboard/clientes/${site.cliente_id}`} className="hover:text-black transition-colors">
                        {site.clientes?.nome || 'Cliente Desconhecido'}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Não Vinculado</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-[13.5px] text-[#6B7280]">
                    <a href={`https://${site.dominio}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                      {site.dominio}
                    </a>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex gap-1">
                      {site.integracoes_google && site.integracoes_google.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0 border-blue-200 shadow-none">GSC</Badge>
                      )}
                      {(!site.integracoes_google || site.integracoes_google.length === 0) && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(site.status)}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <SiteActionButtons 
                      siteId={site.id} 
                      clienteId={site.cliente_id} 
                      tab={tab} 
                      clientes={clientes || []} 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
