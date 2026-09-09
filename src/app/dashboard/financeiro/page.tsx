import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, FileText, AlertCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ClientCheckoutMock } from './ClientCheckoutMock'
import { ClientPlansShowcase } from './ClientPlansShowcase'
import { StripePortalButton } from './StripePortalButton'

export default async function FinanceiroClientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('usuarios').select('cliente_id, role').eq('id', user.id).single()
  if (profile?.role !== 'cliente') redirect('/dashboard')

  // Fetch assinaturas
  const { data: assinaturas } = await supabase.from('assinaturas').select('id, planos(nome)').eq('cliente_id', profile.cliente_id)
  
  // Fetch available plans (if no signatures exist)
  const { data: planos } = await supabase.from('planos').select('*').eq('ativo', true).order('valor', { ascending: true })

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago': return <span className="bg-green-100/70 text-green-700 font-medium text-[11px] px-3 py-1 rounded-full">Pago</span>
      case 'pendente': return <span className="bg-amber-100 text-amber-700 font-medium text-[11px] px-3 py-1 rounded-full">Pendente</span>
      case 'falhou': return <span className="bg-red-100 text-red-700 font-medium text-[11px] px-3 py-1 rounded-full">Falhou</span>
      default: return <span>{status}</span>
    }
  }

  const pendingCount = pagamentos.filter((p: any) => p.status === 'pendente').length
  const pendingTotal = pagamentos
    .filter((p: any) => p.status === 'pendente')
    .reduce((acc: number, curr: any) => acc + Number(curr.valor), 0)

  const hasAssinaturas = assinaturas && assinaturas.length > 0

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-[#111827]">Financeiro</h1>
          <p className="text-[13.5px] text-[#9CA3AF] mt-1">Acompanhe suas assinaturas e faturas.</p>
        </div>
        {hasAssinaturas && (
          <StripePortalButton />
        )}
      </div>

      {!hasAssinaturas ? (
        <ClientPlansShowcase planos={planos || []} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Plano Atual */}
            <div className="bg-[#111827] rounded-[24px] p-6 shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#DFFF00]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[13px] text-gray-400 font-medium">Plano atual</span>
                  <span className="bg-[#DFFF00] text-[#111827] text-[11px] font-bold px-3 py-1 rounded-full">Ativo</span>
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight relative z-10">{assinaturas[0]?.planos?.nome || 'Plano Básico'}</h3>
                <p className="text-[13px] text-gray-400 mt-1 relative z-10">R$ {pendingTotal > 0 ? (Number(pagamentos[0]?.valor) || 0).toFixed(2).replace('.', ',') : '0,00'}/mês</p>
              </div>
              <div className="mt-8 relative z-10">
                <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full h-12 font-medium">Gerenciar assinatura</Button>
              </div>
            </div>

            {/* Card 2: Fatura em Aberto */}
            <div className="bg-[#DFFF00] rounded-[24px] p-6 shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)] flex flex-col justify-between relative">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[13px] text-[#111827] font-medium">Fatura em aberto</span>
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[#111827]" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-[#111827] tracking-tight mt-2">R$ {pendingTotal > 0 ? pendingTotal.toFixed(2).replace('.', ',') : '0,00'}</p>
                <p className="text-[13px] text-[#111827]/70 mt-1">{pendingCount > 0 ? `${pendingCount} fatura(s) pendente(s)` : 'Tudo em dia!'}</p>
              </div>
              <div className="mt-8">
                <Button className="w-full bg-[#111827] hover:bg-black text-white rounded-full h-12 font-medium">Pagar agora</Button>
              </div>
            </div>

            {/* Card 3: Resumo do ano */}
            <div className="bg-[#F9FAFB] border border-[#EFEFEF] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[13px] text-gray-500 font-medium">Resumo do ano</span>
              </div>
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-[13.5px] text-gray-500">Pago em {new Date().getFullYear()}</span>
                  <span className="text-[14px] font-bold text-[#111827]">R$ {pagamentos.filter((p: any) => p.status === 'pago').reduce((a: number, c: any) => a + Number(c.valor), 0).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-[13.5px] text-gray-500">Faturas emitidas</span>
                  <span className="text-[14px] font-bold text-[#111827]">{pagamentos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13.5px] text-gray-500">Atrasos</span>
                  <span className="text-[14px] font-bold text-[#111827]">{pendingCount > 0 ? pendingCount : 'nenhum'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_2px_10px_-7px_rgba(17,24,39,0.08)] py-4">
            
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {pagamentos.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Você não possui faturas geradas.
                </div>
              ) : (
                pagamentos.map((pg: any) => (
                  <div key={pg.id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[14.5px] font-semibold text-gray-900">{pg.assinaturas?.planos?.nome || 'Plano'}</p>
                        <p className="text-[12.5px] text-gray-500 mt-0.5">{new Date(pg.criado_em).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14.5px] font-bold text-gray-900">R$ {Number(pg.valor).toFixed(2)}</p>
                        <div className="mt-1">{getStatusBadge(pg.status)}</div>
                      </div>
                    </div>
                    {pg.status === 'pendente' && (
                      <div className="mt-1">
                        <ClientCheckoutMock pagamento={pg} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader className="border-b border-gray-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-gray-400 py-4 px-6">Referência</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-gray-400 py-4">Data</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-gray-400 py-4">Valor</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-gray-400 py-4">Status</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-bold text-gray-400 py-4 text-right pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                        Você não possui faturas geradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagamentos.map((pg: any) => (
                      <TableRow key={pg.id} className="border-b-0 hover:bg-gray-50/50 transition-colors">
                        <TableCell className="px-6 py-4">
                          <span className="font-semibold text-[#111827] text-[13.5px]">{pg.assinaturas?.planos?.nome} - {new Date(pg.criado_em).toLocaleDateString('pt-BR', { month: 'long' })}</span>
                        </TableCell>
                        <TableCell className="py-4 text-[13.5px] text-gray-500">
                          {new Date(pg.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-[#111827] text-[13.5px]">R$ {Number(pg.valor).toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className="py-4">{getStatusBadge(pg.status)}</TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          {pg.status === 'pendente' && (
                            <ClientCheckoutMock pagamento={pg} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
