import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Globe, ArrowRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default async function MeusSitesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('email, cliente_id, role')
    .eq('id', user.id)
    .single()

  // Only clients should see this page
  if (profile?.role !== 'cliente') {
    redirect('/dashboard') // fallback to admin dashboard
  }

  // Auto-link logic: If the client logged in but isn't linked yet, try to find a client with their email
  let currentClienteId = profile.cliente_id
  if (!currentClienteId && profile.email) {
    const { data: matchingClient } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', profile.email)
      .maybeSingle()
      
    if (matchingClient) {
      // Link them now
      await supabase.from('usuarios').update({ cliente_id: matchingClient.id }).eq('id', user.id)
      currentClienteId = matchingClient.id
    }
  }

  // Bloqueia cliente inadimplente
  if (currentClienteId) {
    const { data: assinaturas } = await supabase.from('assinaturas').select('status').eq('cliente_id', currentClienteId)
    const isBlocked = assinaturas?.some(a => ['past_due', 'unpaid', 'atrasada', 'cancelada', 'inadimplente'].includes(a.status?.toLowerCase()))
    if (isBlocked) {
      redirect('/dashboard/financeiro')
    }
  }

  let sites: any[] = []
  if (currentClienteId) {
    const { data, error } = await supabase
      .from('sites')
      .select('id, nome, dominio, status, criado_em, integracoes_google(id)')
      .eq('cliente_id', currentClienteId)
      .is('deleted_at', null)
      .order('criado_em', { ascending: false })
      
    if (error) {
      console.error('Erro ao buscar sites do cliente:', error.message || error.details || JSON.stringify(error))
    }
    sites = data || []
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'no_ar':
        return <Badge className="bg-green-100 text-green-700 border border-green-200">No Ar</Badge>
      default:
        return <Badge className="bg-red-100 text-red-700 border border-red-200">Fora do Ar</Badge>
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Meus Sites</h1>
        <p className="text-sm text-gray-500 mt-1">Acompanhe o desempenho de todos os seus projetos.</p>
      </div>

      {!sites || sites.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-[2rem] p-12 text-center shadow-sm max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
            <Globe className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum site vinculado</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            A sua agência ainda não vinculou um projeto à sua conta. Assim que o administrador do sistema adicionar um site, ele aparecerá aqui com todos os relatórios disponíveis.
          </p>
        </div>
      ) : (
        <>
        {/* ===== MOBILE: Card List ===== */}
        <div className="md:hidden flex flex-col gap-3">
          {sites.map((site: any) => (
            <Link key={site.id} href={`/dashboard/meus-sites/${site.id}`}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-[26px] p-3.5 shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)] active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-[15px] font-bold text-gray-500 shrink-0">
                {site.nome?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-semibold text-gray-900 truncate tracking-tight">{site.nome}</p>
                <p className="text-[12.5px] text-gray-400 truncate mt-0.5">{site.dominio}</p>
                <div className="flex items-center gap-2 mt-2">
                  {site.status === 'no_ar' ? (
                    <span className="text-[10.5px] font-semibold text-[#111827] bg-[#DFFF00] px-2.5 py-0.5 rounded-full">No ar</span>
                  ) : (
                    <span className="text-[10.5px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">Fora do ar</span>
                  )}
                  {site.integracoes_google?.length > 0 && (
                    <span className="text-[11px] text-gray-400">GSC ativo</span>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>

        {/* ===== DESKTOP: Table ===== */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-[1.5rem] overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site: any) => (
                <TableRow key={site.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{site.nome}</TableCell>
                  <TableCell>
                    <a href={`https://${site.dominio}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {site.dominio}
                    </a>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {site.plano || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(site.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/meus-sites/${site.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-900 hover:bg-[#DFFF00] hover:text-black transition-colors rounded-lg">
                        Gerenciar meu site <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </>
      )}
    </div>
  )
}
