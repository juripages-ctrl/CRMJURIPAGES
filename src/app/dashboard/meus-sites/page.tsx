import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Globe, ArrowRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SiteAvatar } from '@/components/dashboard/SiteAvatar'

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
        return <Badge className="text-[11px] font-semibold text-[#111827] bg-[#DFFF00] hover:bg-[#DFFF00]/90 px-3 py-1.5 rounded-full border-none shadow-none">No Ar</Badge>
      default:
        return <Badge className="text-[11px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-100/90 px-3 py-1.5 rounded-full border-none shadow-none">Fora do Ar</Badge>
    }
  }

  return (
    <div className="w-full">
      <div className="mb-[24px]">
        <h1 className="m-0 text-[26px] font-semibold tracking-[-0.03em] text-[#111827]">Meus Sites</h1>
        <p className="m-0 text-[13.5px] text-[#9CA3AF] mt-1">Acompanhe o desempenho de todos os seus projetos.</p>
      </div>

      {!sites || sites.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E5E7EB] rounded-[40px] py-20 px-6 text-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-5">
            <Globe className="w-7 h-7 text-[#9CA3AF]" />
          </div>
          <p className="m-0 mb-2 text-[18px] font-semibold text-gray-900">Nenhum site vinculado</p>
          <p className="m-0 mx-auto max-w-[320px] text-[14px] leading-[1.55] text-[#6B7280]">
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
              <SiteAvatar nome={site.nome} dominio={site.dominio} size={44} />
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
        <div className="hidden md:block bg-white border border-[#EFEFEF] rounded-[40px] px-7 pt-2 pb-3.5">
          <Table className="border-none">
            <TableHeader className="border-none">
              <TableRow className="border-b border-[#F1F1F1] hover:bg-transparent">
                <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Projeto</TableHead>
                <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Domínio</TableHead>
                <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Plano</TableHead>
                <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4">Status</TableHead>
                <TableHead className="text-[11.5px] font-semibold tracking-[0.07em] uppercase text-[#9CA3AF] h-auto py-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site: any) => (
                <TableRow key={site.id} className="border-b border-[#F6F6F6] hover:bg-transparent">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <SiteAvatar nome={site.nome} dominio={site.dominio} size={44} />
                      <div>
                        <p className="m-0 text-[15px] font-semibold tracking-[-0.012em] text-gray-900 truncate">{site.nome}</p>
                        <p className="m-0 mt-1 text-[12.5px] text-[#9CA3AF] truncate">{site.dominio}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-[13.5px] text-[#6B7280]">
                    <a href={`https://${site.dominio}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                      {site.dominio}
                    </a>
                  </TableCell>
                  <TableCell className="py-4 text-[13.5px] font-semibold text-gray-900">
                    {site.plano || '-'}
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(site.status)}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Link href={`/dashboard/meus-sites/${site.id}`}>
                      <Button variant="ghost" size="sm" className="h-[36px] px-[15px] border border-[#EFEFEF] rounded-full bg-[#F9FAFB] text-[#111827] font-semibold hover:bg-gray-100 text-[12.5px] shadow-none">
                        Abrir
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
