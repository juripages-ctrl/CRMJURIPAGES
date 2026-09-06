'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createPlano, updatePlano } from './planos-actions'

export function PlanoModal({ 
  plano, 
  isOpen, 
  onClose 
}: { 
  plano?: any
  isOpen: boolean
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getRecursosText = () => {
    if (!plano || !plano.recursos) return ''
    let parsed = []
    if (Array.isArray(plano.recursos)) parsed = plano.recursos
    else {
      try { parsed = JSON.parse(plano.recursos) } catch { return '' }
    }
    return parsed.join('\n')
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    let res
    if (plano) {
      res = await updatePlano(plano.id, formData)
    } else {
      res = await createPlano(formData)
    }

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={plano ? 'Editar Plano' : 'Novo Plano'}>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome do Plano</label>
          <Input id="nome" name="nome" required defaultValue={plano?.nome} placeholder="Ex: Suporte Essencial" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="valor" className="text-sm font-medium text-gray-700">Valor (R$)</label>
            <Input id="valor" name="valor" type="number" step="0.01" required defaultValue={plano?.valor} placeholder="150.00" />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="periodicidade" className="text-sm font-medium text-gray-700">Cobrança</label>
            <select 
              id="periodicidade" 
              name="periodicidade" 
              defaultValue={plano?.periodicidade || 'mensal'}
              className="w-full h-10 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DFFF00] bg-white text-sm"
            >
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
              <option value="unico">Único (Vitalício)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="limite_sites" className="text-sm font-medium text-gray-700">Limite de Sites</label>
          <Input id="limite_sites" name="limite_sites" type="number" required defaultValue={plano?.limite_sites || 1} placeholder="1" />
        </div>

        <div className="space-y-2 pb-4">
          <label htmlFor="recursos" className="text-sm font-medium text-gray-700">Recursos Incluídos (Um por linha)</label>
          <textarea 
            id="recursos" 
            name="recursos" 
            rows={4}
            defaultValue={getRecursosText()} 
            placeholder="Hospedagem Dedicada&#10;Relatório Mensal&#10;Otimização"
            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DFFF00] text-sm resize-none"
          ></textarea>
        </div>

        <div className="space-y-2 pb-4 border-b border-gray-100">
          <label className="text-sm font-medium text-gray-700">Funcionalidades do Painel (Features)</label>
          <div className="flex flex-col gap-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="feature_seo" defaultChecked={plano?.features?.includes('gerenciamento_seo')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Liberar Gerenciamento de SEO</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="feature_blog" defaultChecked={plano?.features?.includes('gerenciamento_blog')} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Liberar Gerenciamento de Blog</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
