'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createSite, updateSite, getUnlinkedSites, linkSiteToClient, unlinkSite } from './actions'

export type SiteType = {
  id: string
  nome?: string
  dominio?: string
  status: string
  plano?: string
  cliente_id?: string
}

type DiscoveredSite = {
  id: string
  name: string
  source: 'cloudflare' | 'google' | 'both'
  cf_zone_id?: string
  gsc_url?: string
}

export function SiteModal({ 
  site, 
  clienteId,
  isOpen, 
  onClose 
}: { 
  site?: SiteType | null
  clienteId: string
  isOpen: boolean
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discoveredSites, setDiscoveredSites] = useState<DiscoveredSite[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState('')
  const [manualDomain, setManualDomain] = useState(site?.dominio || '')
  const [nome, setNome] = useState(site?.nome || '')

  useEffect(() => {
    async function loadDiscovered() {
      const { data } = await getUnlinkedSites()
      if (data) {
        const mapped = data.map((site: any) => {
          let source = 'neither'
          if (site.integracoes_google?.length) source = 'google'

          return {
            id: site.id,
            name: site.dominio,
            source,
            originalName: site.nome,
            originalStatus: site.status
          }
        })
        setDiscoveredSites(mapped as any)
      }
    }

    if (isOpen && !site) {
      loadDiscovered()
      setSelectedSourceId('')
      setManualDomain('')
      setNome('')
    } else if (isOpen && site) {
      setSelectedSourceId('')
      setManualDomain(site.dominio || '')
      setNome(site.nome || '')
    }
  }, [isOpen, site])

  const handleSourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedSourceId(val)
    if (val !== 'manual' && val !== '') {
      const found = discoveredSites.find(s => s.id === val)
      if (found) {
        setManualDomain(found.name)
        if (!nome) setNome((found as any).originalName || found.name.split('.')[0])
      }
    } else {
      setManualDomain('')
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('dominio', manualDomain)

    let res
    if (site) {
      res = await updateSite(site.id, formData)
    } else {
      if (selectedSourceId && selectedSourceId !== 'manual') {
        // Link existing site
        res = await linkSiteToClient(selectedSourceId, clienteId)
      } else {
        // Create brand new site
        res = await createSite(clienteId, formData)
      }
    }

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  async function handleUnlinkAction() {
    if (confirm('Deseja realmente desvincular este site? Ele voltará para a lista de "Não Vinculados".')) {
      setLoading(true)
      const res = await unlinkSite(site!.id)
      setLoading(false)
      if (res.error) setError(res.error)
      else onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={site ? 'Editar Site' : 'Vincular Novo Site'}>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {!site && (
          <div className="space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label htmlFor="source_select" className="text-sm font-medium text-blue-900">Vincular Site Existente</label>
            <p className="text-xs text-blue-700 mb-2">Estes domínios foram importados das APIs e não possuem dono.</p>
            <select 
              id="source_select"
              value={selectedSourceId}
              onChange={handleSourceSelect}
              className="flex h-10 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900"
            >
              <option value="">Selecione um domínio importado...</option>
              {discoveredSites.map((s, idx) => (
                <option key={`${s.id}-${idx}`} value={s.id}>
                  {s.name} ({(s as any).source === 'google' ? 'GSC' : 'Sem Integração'})
                </option>
              ))}
              <option value="manual">+ Adicionar domínio manualmente</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome do Projeto</label>
          <Input id="nome" name="nome" required value={nome} onChange={e => setNome(e.target.value)} placeholder="Meu Site Incrível" />
        </div>

        <div className="space-y-2">
          <label htmlFor="dominio" className="text-sm font-medium text-gray-700">Domínio Primário</label>
          <Input 
            id="dominio" 
            name="dominio" 
            required 
            value={manualDomain} 
            onChange={e => setManualDomain(e.target.value)} 
            placeholder="meusite.com.br" 
            disabled={selectedSourceId !== 'manual' && selectedSourceId !== ''} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">Status Inicial</label>
          <select 
            id="status" 
            name="status" 
            defaultValue={site?.status || 'no_ar'}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="no_ar">No Ar (Ativo)</option>
            <option value="fora_do_ar">Fora do Ar</option>
          </select>
        </div>

        <div className="space-y-2 pb-4">
          <label htmlFor="plano" className="text-sm font-medium text-gray-700">Plano (Opcional)</label>
          <Input id="plano" name="plano" defaultValue={site?.plano} placeholder="Ex: Plano PRO Mensal" />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-6">
          {site ? (
            <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2" onClick={handleUnlinkAction} disabled={loading}>
              Desvincular Site
            </Button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
