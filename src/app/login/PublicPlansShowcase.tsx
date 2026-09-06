'use client'

import { useState } from 'react'
import { CheckCircle2, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function PublicPlansShowcase({ planos }: { planos: any[] }) {
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'semestral' | 'anual'>('mensal')

  const handleSubscribe = () => {
    // Rola para o topo onde está o formulário de login/cadastro
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Você pode também focar em um input específico se quiser
    const emailInput = document.getElementById('email')
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 500)
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
    <div className="w-full py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Planos de Suporte para Site</h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">Proposta de manutenção, segurança e crescimento contínuo do site. Escolha o melhor pacote para você.</p>
        
        <div className="mt-8 flex items-center justify-center">
          <div className="bg-gray-100 p-1 rounded-full flex gap-1">
            <button
              type="button"
              onClick={() => setBillingCycle('mensal')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'mensal' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('semestral')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'semestral' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Semestral (-10%)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('anual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'anual' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Anual (-20%)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6">
        {planos?.filter(p => p.periodicidade === billingCycle).map((plano) => (
          <div key={plano.id} className={`bg-white rounded-[2rem] p-5 lg:p-6 shadow-xl border ${plano.valor === 350 ? 'border-[#DFFF00] ring-4 ring-[#DFFF00]/10' : 'border-gray-200'} relative flex flex-col`}>
            
            {plano.valor === 350 && (
              <div className="absolute top-0 right-8 -mt-3">
                <Badge className="bg-black text-[#DFFF00] border-0 px-3 py-1 flex items-center gap-1 shadow-xl">
                  <Shield className="w-3 h-3" /> Premium
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

            <div className="mt-auto pt-6 border-t border-gray-100">
              <Button 
                type="button"
                variant={plano.valor === 350 ? 'default' : 'outline'} 
                className={`w-full ${plano.valor === 350 ? 'bg-[#DFFF00] text-black hover:bg-[#ccee00]' : ''}`}
                onClick={handleSubscribe}
              >
                Contratar Plano
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
