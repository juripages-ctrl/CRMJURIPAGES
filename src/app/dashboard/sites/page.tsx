import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Globe, ArrowRight, Link2, Trash2, RefreshCw } from 'lucide-react'
import { deleteSiteSoft, restoreSite, deleteSite } from './actions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SyncButton } from './SyncButton'
import { SiteActionButtons } from './SiteActionButtons'

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
        return <Badge className="bg-green-100 text-green-700">No Ar</Badge>
      default:
        return <Badge className="bg-red-100 text-red-700">Fora do Ar</Badge>
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Visão Global de Sites</h1>
          <p className="text-sm text-gray-500 mt-1">Todos os sites de todos os clientes em um só lugar.</p>
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

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Domínio</TableHead>
              <TableHead>Integrações</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!sites || sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Globe className="w-8 h-8 text-gray-300 mb-2" />
                    <p>Nenhum site cadastrado no sistema.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site: any) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/sites/${site.id}`} className="text-gray-900 hover:text-blue-600 transition-colors hover:underline">
                      {site.nome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {site.cliente_id ? (
                      <Link href={`/dashboard/clientes/${site.cliente_id}`} className="text-blue-600 hover:underline">
                        {site.clientes?.nome || 'Cliente Desconhecido'}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Não Vinculado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <a href={`https://${site.dominio}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black hover:underline">
                      {site.dominio}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {site.integracoes_google && site.integracoes_google.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0 border-blue-200">GSC</Badge>
                      )}
                      {(!site.integracoes_google || site.integracoes_google.length === 0) && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(site.status)}
                  </TableCell>
                  <TableCell className="text-right">
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
