'use client'

import { useState } from 'react'
import { Cloud, Search, Server, CheckCircle2, Unplug, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { saveHostingIntegration, saveGoogleIntegration, disconnectIntegration } from '../integrations-actions'

type IntegrationsClientProps = {
  site: any
  gsc?: any
  hosting: any
  provedores: any[]
}

export function IntegrationsClient({ site, gsc, hosting, provedores }: IntegrationsClientProps) {
  const [loading, setLoading] = useState(false)
  const [hostingError, setHostingError] = useState('')

  async function handleHostingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setHostingError('')
    const formData = new FormData(e.currentTarget)
    const res = await saveHostingIntegration(site.id, formData)
    if (res.error) setHostingError(res.error)
    setLoading(false)
  }


  async function handleGscSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await saveGoogleIntegration(site.id, formData)
    if (res.error) alert(res.error)
    setLoading(false)
  }

  // Handle Disconnect
  async function handleDisconnect(table: string) {
    if (confirm('Deseja realmente desconectar esta integração?')) {
      await disconnectIntegration(table, site.id)
    }
  }

  const StatusBadge = ({ isConnected }: { isConnected: boolean }) => (
    isConnected ? (
      <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Sincronizado</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600 flex items-center gap-1"><Unplug className="w-3 h-3"/> Não Sincronizado</Badge>
    )
  )

  const isGscConnected = !!gsc?.propriedade_search_console

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Status de Integração: {site.nome}</h2>
        <p className="text-sm text-gray-500">
          Veja o status de sincronização deste site com as conexões Master da agência.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

        {/* Google Search Console Status Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Google Search Console</h3>
                <p className="text-xs text-gray-500">Métricas de SEO (Cliques/Impressões)</p>
              </div>
            </div>
            <StatusBadge isConnected={isGscConnected} />
          </div>

          {isGscConnected ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Vinculado à Conta Master da Agência.</p>
                <p className="text-xs text-gray-500 mb-1">Propriedade (URL):</p>
                <code className="text-xs font-mono text-gray-800 bg-gray-200 px-2 py-1 rounded">{gsc.propriedade_search_console}</code>
              </div>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDisconnect('integracoes_google')}>
                Desconectar Search Console
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGscSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">URL exata da Propriedade no Google</label>
                <Input name="propriedade" placeholder="Ex: https://meusite.com.br" required />
                <p className="text-[10px] text-gray-400">Exatamente como cadastrado no GSC (com ou sem sc-domain:).</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                Vincular Propriedade
              </Button>
            </form>
          )}
        </div>

        {/* Hosting Integration Card (Kept individual per original plan as hosting can be per project) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hospedagem & Deploy</h3>
                <p className="text-xs text-gray-500">Integração de status do servidor (Individual por Site)</p>
              </div>
            </div>
            <StatusBadge isConnected={!!hosting} />
          </div>

          {hosting ? (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Provedor Conectado</p>
                <p className="text-xs text-gray-500 mt-1">ID do Provedor: {hosting.provedor_id}</p>
              </div>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDisconnect('integracoes_hospedagem')}>
                Desconectar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleHostingSubmit} className="space-y-4 max-w-lg">
              {hostingError && <p className="text-xs text-red-500">{hostingError}</p>}
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Selecione o Provedor</label>
                <select name="provedor_id" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" required>
                  <option value="">Selecione...</option>
                  {provedores?.map(p => (
                    <option key={p.id} value={p.id}>{p.nome_exibicao}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">API Key / Token de Acesso</label>
                <Input name="api_key" type="password" placeholder="Cole o token do servidor aqui" required />
              </div>

              <Button type="submit" disabled={loading}>
                Salvar Hospedagem
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
