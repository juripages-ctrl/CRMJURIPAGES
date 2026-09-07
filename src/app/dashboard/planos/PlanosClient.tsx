'use client'

import { useState } from 'react'
import { CheckCircle2, Shield, Settings2, Users, Calendar, Ban, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PlanoModal } from './PlanoModal'
import { IsencaoModal } from './IsencaoModal'
import { desvincularAssinatura } from './planos-actions'

// Safely parse JSONB resources
const getRecursos = (recursos: any) => {
  if (Array.isArray(recursos)) return recursos
  if (typeof recursos === 'string') {
    try { return JSON.parse(recursos) } catch { return [] }
  }
  return []
}

export function PlanosClient({ planos }: { planos: any[] }) {
  const [editingPlano, setEditingPlano] = useState<any>(null)
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false)
  
  const [isencaoAssinatura, setIsencaoAssinatura] = useState<any>(null)
  const [isIsencaoModalOpen, setIsIsencaoModalOpen] = useState(false)

  const handleEditPlano = (plano: any) => {
    setEditingPlano(plano)
    setIsPlanoModalOpen(true)
  }

  const handleNewPlano = () => {
    setEditingPlano(null)
    setIsPlanoModalOpen(true)
  }

  const handleDesvincular = async (assinaturaId: string) => {
    if (confirm('Tem certeza que deseja remover este cliente do plano? Ele perderá os acessos.')) {
      const res = await desvincularAssinatura(assinaturaId)
      if (res.error) alert(res.error)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Planos e Pacotes</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os pacotes e acompanhe os clientes assinantes.</p>
        </div>
        <Button onClick={handleNewPlano}>Novo Plano</Button>
      </div>

      <div className="flex flex-col gap-12">
        {planos.map((plano) => (
          <div key={plano.id} className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
            {/* Cabecalho do Plano */}
            <div className={`p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${plano.valor === 350 ? 'bg-[#DFFF00]/10' : 'bg-gray-50'}`}>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{plano.nome}</h2>
                  {plano.valor === 350 && (
                    <Badge className="bg-black text-[#DFFF00] border-0 px-2 py-0.5 flex items-center gap-1 text-xs">
                      <Shield className="w-3 h-3" /> Elite
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-3">
                  <span className="font-medium text-gray-900">R$ {plano.valor}/{plano.periodicidade === 'mensal' ? 'mês' : plano.periodicidade}</span>
                  <span>•</span>
                  <span>Até {plano.limite_sites} site(s)</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEditPlano(plano)} className="bg-white">
                <Settings2 className="w-4 h-4 mr-2" /> Editar Plano
              </Button>
            </div>

            {/* Recursos do Plano */}
            <div className="p-6 border-b border-gray-100 bg-white">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-400" /> 
                Benefícios Incluídos
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getRecursos(plano.recursos).map((recurso: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{recurso}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lista de Assinantes */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" /> 
                Clientes Assinantes ({plano.assinaturas?.length || 0})
              </h3>

              {(!plano.assinaturas || plano.assinaturas.length === 0) ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  Nenhum cliente assinando este plano no momento.
                </div>
              ) : (
                <div>
                  {/* Mobile Cards */}
                  <div className="md:hidden flex flex-col gap-3">
                    {plano.assinaturas.map((ass: any) => {
                      const cliente = ass.clientes || {}
                      const ultimoPagamento = ass.pagamentos && ass.pagamentos.length > 0 
                        ? ass.pagamentos[0] 
                        : null
                      const statusFatura = ultimoPagamento ? ultimoPagamento.status : (ass.status === 'ativa' ? 'pendente' : ass.status)

                      return (
                        <div key={ass.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-gray-900 text-[14.5px] truncate">{cliente.nome || 'Desconhecido'}</span>
                            <Badge variant={statusFatura === 'pago' ? 'default' : statusFatura === 'pendente' ? 'outline' : 'destructive'} className={statusFatura === 'pago' ? 'bg-green-100 text-green-700' : ''}>
                              {statusFatura.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center mt-1">
                            {ass.isento_pagamento ? (
                              <Badge className="bg-purple-100 text-purple-700 border-0 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> 
                                {ass.isencao_fim ? `Até ${new Date(ass.isencao_fim).toLocaleDateString('pt-BR')}` : 'Vitalício'}
                              </Badge>
                            ) : (
                              <span className="text-[12px] text-gray-500">Sem isenção</span>
                            )}

                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" size="sm" 
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 w-8 p-0 rounded-full"
                                onClick={() => { setIsencaoAssinatura(ass); setIsIsencaoModalOpen(true); }}
                              >
                                <CreditCard className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" size="sm" 
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                                onClick={() => handleDesvincular(ass.id)}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-100">
                          <th className="pb-3 font-medium">Cliente</th>
                          <th className="pb-3 font-medium">Status (Fatura)</th>
                          <th className="pb-3 font-medium">Isenção</th>
                          <th className="pb-3 font-medium text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                      {plano.assinaturas.map((ass: any) => {
                        const cliente = ass.clientes || {}
                        // Simular status da ultima fatura baseando nos pagamentos
                        const ultimoPagamento = ass.pagamentos && ass.pagamentos.length > 0 
                          ? ass.pagamentos[0] 
                          : null

                        const statusFatura = ultimoPagamento ? ultimoPagamento.status : (ass.status === 'ativa' ? 'pendente' : ass.status)

                        return (
                          <tr key={ass.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-4 font-medium text-gray-900">{cliente.nome || 'Desconhecido'}</td>
                            <td className="py-4">
                              <Badge variant={statusFatura === 'pago' ? 'default' : statusFatura === 'pendente' ? 'outline' : 'destructive'} className={statusFatura === 'pago' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                                {statusFatura.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-4">
                              {ass.isento_pagamento ? (
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 flex items-center gap-1 w-max">
                                  <Shield className="w-3 h-3" /> 
                                  {ass.isencao_fim ? `Até ${new Date(ass.isencao_fim).toLocaleDateString('pt-BR')}` : 'Vitalício'}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  onClick={() => {
                                    setIsencaoAssinatura(ass)
                                    setIsIsencaoModalOpen(true)
                                  }}
                                  title="Gerenciar Isenção"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDesvincular(ass.id)}
                                  title="Desvincular Cliente"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <PlanoModal 
        isOpen={isPlanoModalOpen}
        onClose={() => setIsPlanoModalOpen(false)}
        plano={editingPlano}
      />

      {isencaoAssinatura && (
        <IsencaoModal
          isOpen={isIsencaoModalOpen}
          onClose={() => setIsIsencaoModalOpen(false)}
          assinatura={isencaoAssinatura}
        />
      )}
    </div>
  )
}
