'use client'

import { useState } from 'react'
import { CheckCircle2, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { clientSubscribeToPlan } from './client-finance-actions'

export function ClientPlansShowcase({ planos }: { planos: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'semestral' | 'anual'>('mensal')

  const handleSubscribe = async (planoId: string) => {
    setLoadingId(planoId)
    const res = await clientSubscribeToPlan(planoId)
    if (res?.error) {
      alert(res.error)
      setLoadingId(null)
    } else if (res?.url) {
      window.location.href = res.url
    } else {
      // Fallback local
      setLoadingId(null)
    }
  }

  const getRecursos = (recursos: any) => {
    if (Array.isArray(recursos)) return recursos
    if (typeof recursos === 'string') {
      try { return JSON.parse(recursos) } catch { return [] }
    }
    return []
  }

  return (
    <div className="w-full mt-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Escolha o plano ideal para seus projetos</h2>
        <p className="text-gray-500 mt-2">Você ainda não possui uma assinatura ativa. Selecione um pacote de suporte abaixo.</p>
        
        <div className="mt-8 flex items-center justify-center">
          <div className="bg-[#F3F4F6] p-1 rounded-full flex gap-1">
            <button
              onClick={() => setBillingCycle('mensal')}
              className={`px-6 py-2 rounded-full text-[13.5px] font-semibold transition-all ${billingCycle === 'mensal' ? 'bg-[#111827] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('semestral')}
              className={`px-6 py-2 rounded-full text-[13.5px] font-semibold transition-all ${billingCycle === 'semestral' ? 'bg-[#111827] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'}`}
            >
              Semestral (-10%)
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              className={`px-6 py-2 rounded-full text-[13.5px] font-semibold transition-all ${billingCycle === 'anual' ? 'bg-[#111827] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'}`}
            >
              Anual (-20%)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {planos?.filter(p => p.periodicidade === billingCycle).map((plano) => (
          <div key={plano.id} className={`bg-white rounded-[32px] p-5 lg:p-8 shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)] border ${plano.valor === 350 ? 'border-[#111827] ring-4 ring-black/5' : 'border-[#EFEFEF]'} relative flex flex-col`}>
            
            {plano.valor === 350 && (
              <div className="absolute top-0 right-8 -mt-3">
                <Badge className="bg-[#111827] text-[#DFFF00] border-0 px-3 py-1 flex items-center gap-1.5 shadow-xl font-bold">
                  <Shield className="w-3.5 h-3.5" /> Premium
                </Badge>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{plano.nome}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-gray-500 text-lg">R$</span>
                <span className="text-4xl font-bold tracking-tight text-gray-900">{plano.valor}</span>
                <span className="text-gray-500">/{plano.periodicidade === 'mensal' ? 'mês' : (plano.periodicidade === 'semestral' ? '6 meses' : 'ano')}</span>
              </div>
            </div>

            <div className="mb-8 flex-1">
              <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <p className="text-sm font-medium text-gray-900">Até {plano.limite_sites || 1} Site{(plano.limite_sites || 1) > 1 ? 's' : ''}</p>
              </div>

              <ul className="space-y-2.5">
                {getRecursos(plano.recursos).map((recurso: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{recurso}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-6 border-t border-[#EFEFEF]">
              <Button 
                variant={plano.valor === 350 ? 'default' : 'outline'} 
                className={`w-full ${plano.valor === 350 ? 'bg-[#DFFF00] text-[#111827] hover:bg-[#ccee00] font-bold' : ''}`}
                onClick={() => handleSubscribe(plano.id)}
                disabled={loadingId !== null}
              >
                {loadingId === plano.id ? 'Processando...' : 'Contratar Plano'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
