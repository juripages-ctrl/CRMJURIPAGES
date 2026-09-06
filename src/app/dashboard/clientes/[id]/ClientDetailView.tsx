'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Globe, Plus, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { SiteModal, SiteType } from '../../sites/SiteModal'
import { updateSiteStatus, unlinkSite } from '../../sites/actions'
import { ClientFinanceView } from './ClientFinanceView'
import { ClientSettingsView } from './ClientSettingsView'

type ClientDetailProps = {
  cliente: any
  initialSites: SiteType[]
  planos?: any[]
  assinaturas?: any[]
  pagamentos?: any[]
}

export function ClientDetailView({ cliente, initialSites, planos, assinaturas, pagamentos }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<'sites' | 'financeiro' | 'editar'>('sites')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<SiteType | null>(null)
  
  const handleOpenNew = () => {
    setSelectedSite(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (site: SiteType) => {
    setSelectedSite(site)
    setIsModalOpen(true)
  }

  const handleToggleStatus = async (site: SiteType) => {
    const newStatus = site.status === 'fora_do_ar' ? 'no_ar' : 'fora_do_ar'
    await updateSiteStatus(site.id, newStatus)
  }

  const handleUnlink = async (siteId: string) => {
    if (confirm('Deseja realmente desvincular este site deste cliente? O site voltará para a lista de "Não Vinculados".')) {
      await unlinkSite(siteId)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'no_ar': return <Badge className="bg-green-100 text-green-700 cursor-pointer hover:bg-green-200">No Ar</Badge>
      default: return <Badge className="bg-red-100 text-red-700 cursor-pointer hover:bg-red-200">Fora do Ar</Badge>
    }
  }

  return (
    <div className="w-full">
      <Link href="/dashboard/clientes" className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para Clientes
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden border-2 border-gray-200">
            {cliente.avatar_url ? (
              <Image src={cliente.avatar_url} alt={cliente.nome} width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{cliente.nome.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{cliente.nome}</h1>
            <p className="text-sm text-gray-500 mt-1">{cliente.email} • {cliente.empresa || 'Sem empresa'}</p>
          </div>
        </div>
        {activeTab === 'sites' && (
          <Button onClick={handleOpenNew} className="flex items-center rounded-full bg-black hover:bg-gray-800 text-white px-6 h-10">
            <Plus className="w-4 h-4 mr-2" />
            Novo Site
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button 
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'sites' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sites')}
        >
          Projetos & Sites
        </button>
        <button 
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'financeiro' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('financeiro')}
        >
          Financeiro & Assinaturas
        </button>
        <button 
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'editar' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('editar')}
        >
          Informações & Histórico
        </button>
      </div>

      {activeTab === 'financeiro' ? (
        <ClientFinanceView cliente={cliente} planos={planos} assinaturas={assinaturas} pagamentos={pagamentos} />
      ) : activeTab === 'editar' ? (
        <ClientSettingsView cliente={cliente} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-[1.5rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Projeto</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Domínio</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plano Anterior (Legado)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialSites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Globe className="w-10 h-10 text-gray-300 mb-3" />
                      <p>Nenhum site vinculado a este cliente.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialSites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 font-semibold text-sm">
                      <Link href={`/dashboard/sites/${site.id}`} className="text-gray-900 hover:text-blue-600 transition-colors block">
                        {site.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <a href={`https://${site.dominio}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-black transition-colors">
                          {site.dominio}
                        </a>
                        <div className="flex gap-1.5">
                          {(site as any).integracoes_google && (site as any).integracoes_google.length > 0 && (
                            <Badge className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 border-blue-200 uppercase tracking-wider rounded-md font-semibold">GSC</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {site.plano || '-'}
                    </td>
                    <td className="px-6 py-5" onClick={() => handleToggleStatus(site)}>
                      {getStatusBadge(site.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-60 hover:opacity-100 transition-opacity items-center">
                        <Link href={`/dashboard/sites/${site.id}`}>
                          <button className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors font-medium">
                            <Link2 className="w-3.5 h-3.5" /> Gerenciar Site
                          </button>
                        </Link>
                        <button onClick={() => handleOpenEdit(site)} className="text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium">
                          Editar
                        </button>
                        <button onClick={() => handleUnlink(site.id)} className="text-xs text-gray-500 hover:text-red-600 transition-colors font-medium">
                          Desvincular
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <SiteModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          clienteId={cliente.id}
          site={selectedSite}
        />
      )}
    </div>
  )
}
