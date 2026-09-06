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
      case 'pago': return <Badge className="bg-green-100 text-green-700">Pago</Badge>
      case 'pendente': return <Badge className="bg-yellow-100 text-yellow-700 animate-pulse">Pendente</Badge>
      case 'falhou': return <Badge className="bg-red-100 text-red-700">Falhou</Badge>
      default: return <Badge>{status}</Badge>
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
          <h1 className="text-2xl font-semibold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe suas assinaturas e faturas.</p>
        </div>
        {hasAssinaturas && (
          <StripePortalButton />
        )}
      </div>

      {!hasAssinaturas ? (
        <ClientPlansShowcase planos={planos || []} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-medium text-gray-900">Faturas Pendentes</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-4">R$ {pendingTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{pendingCount} fatura(s) aguardando pagamento</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[1.5rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Faturas</h2>
            </div>
            
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>Data de Emissão</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
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
                    <TableRow key={pg.id}>
                      <TableCell>{new Date(pg.criado_em).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{pg.assinaturas?.planos?.nome}</TableCell>
                      <TableCell className="font-medium text-gray-900">R$ {Number(pg.valor).toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(pg.status)}</TableCell>
                      <TableCell className="text-right">
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
        </>
      )}
    </div>
  )
}
