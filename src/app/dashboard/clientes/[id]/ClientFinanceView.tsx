'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { createSubscription, mockPayInvoice } from './finance-actions'
import { usePathname } from 'next/navigation'

const getRecursos = (recursos: any) => {
  if (Array.isArray(recursos)) return recursos
  if (typeof recursos === 'string') {
    try { return JSON.parse(recursos) } catch { return [] }
  }
  return []
}

export function ClientFinanceView({ cliente, assinaturas, pagamentos, planos }: any) {
  const [loading, setLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'semestral' | 'anual'>('mensal')
  const pathname = usePathname()

  const handleAssignPlan = async (planoId: string) => {
    if (confirm('Deseja realmente assinar este plano para o cliente? (Isso gerará uma fatura pendente)')) {
      setLoading(true)
      const res = await createSubscription(cliente.id, planoId)
      if (res.error) alert(res.error)
      setLoading(false)
    }
  }

  const handleMockPay = async (pagamentoId: string) => {
    if (confirm('Simular pagamento aprovado desta fatura?')) {
      setLoading(true)
      await mockPayInvoice(pagamentoId, pathname)
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago': return <Badge className="bg-green-100 text-green-700">Pago</Badge>
      case 'pendente': return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>
      case 'falhou': return <Badge className="bg-red-100 text-red-700">Falhou</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Assinaturas Ativas */}
      <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Assinaturas Ativas</h2>
        </div>

        {assinaturas?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assinaturas.map((ass: any) => (
              <div key={ass.id} className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{ass.planos?.nome}</h3>
                  <Badge className="bg-[#DFFF00]/40 text-black border border-[#DFFF00]/60">{ass.status}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1.5 mb-5 border-b border-gray-200 pb-5">
                  <p>Valor: <span className="font-medium text-gray-900">R$ {ass.planos?.valor}</span></p>
                  <p>Próxima cobrança: <span className="font-medium text-gray-900">{new Date(ass.proxima_cobranca).toLocaleDateString('pt-BR')}</span></p>
                  <p>Gateway: <span className="font-medium text-gray-900">{ass.gateway}</span></p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Benefícios do Plano</p>
                  <ul className="space-y-2">
                    {getRecursos(ass.planos?.recursos).map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">Este cliente não possui nenhuma assinatura ativa.</p>
          </div>
        )}
      </div>

      {/* Ofertar Novo Plano */}
      <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Iniciar Nova Assinatura</h2>
          
          <div className="bg-gray-100 p-1 rounded-full flex gap-1">
            <button
              onClick={() => setBillingCycle('mensal')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${billingCycle === 'mensal' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('semestral')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${billingCycle === 'semestral' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Semestral (-10%)
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${billingCycle === 'anual' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Anual (-20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planos?.filter((p: any) => p.periodicidade === billingCycle).map((plano: any) => (
            <div key={plano.id} className="border border-gray-200 rounded-2xl p-6 flex flex-col hover:border-black transition-colors">
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">{plano.nome}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-500 text-sm">R$</span>
                  <span className="text-2xl font-bold text-gray-900">{plano.valor}</span>
                  <span className="text-gray-500 text-sm">/{plano.periodicidade === 'mensal' ? 'mês' : (plano.periodicidade === 'semestral' ? '6 meses' : 'ano')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {getRecursos(plano.recursos).map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{rec}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline" 
                className="mt-auto w-full rounded-full hover:bg-black hover:text-white border-gray-200 transition-all h-10"
                onClick={() => handleAssignPlan(plano.id)}
                disabled={loading}
              >
                Ativar Plano
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Faturas */}
      <div className="bg-white border border-gray-200 rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Faturas (Asaas)</h2>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plano Referência</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagamentos?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  Nenhuma fatura gerada.
                </td>
              </tr>
            ) : (
              pagamentos?.map((pg: any) => (
                <tr key={pg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 text-sm text-gray-900">{new Date(pg.criado_em).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-5 font-medium text-sm text-gray-900">{pg.assinaturas?.planos?.nome}</td>
                  <td className="px-6 py-5 text-sm text-gray-600">R$ {pg.valor}</td>
                  <td className="px-6 py-5">{getStatusBadge(pg.status)}</td>
                  <td className="px-6 py-5 text-right">
                    {pg.status === 'pendente' && (
                      <Button variant="outline" size="sm" onClick={() => handleMockPay(pg.id)} disabled={loading} className="rounded-full text-xs h-8">
                        Simular Pagamento
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
