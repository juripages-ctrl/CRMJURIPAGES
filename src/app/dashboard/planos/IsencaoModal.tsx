'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { concederIsencao } from './planos-actions'

export function IsencaoModal({ 
  assinatura, 
  isOpen, 
  onClose 
}: { 
  assinatura: any
  isOpen: boolean
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tipo, setTipo] = useState<'nenhuma' | 'vitalicia' | 'temporaria'>(
    assinatura?.isento_pagamento 
      ? (assinatura.isencao_fim ? 'temporaria' : 'vitalicia')
      : 'nenhuma'
  )

  const defaultDate = assinatura?.isencao_fim 
    ? new Date(assinatura.isencao_fim).toISOString().split('T')[0]
    : ''

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const isento = tipo !== 'nenhuma'
    const dataFim = tipo === 'temporaria' ? (formData.get('isencao_fim') as string) : undefined

    if (tipo === 'temporaria' && !dataFim) {
      setError('Selecione a data de término da isenção.')
      setLoading(false)
      return
    }

    const res = await concederIsencao(assinatura.id, isento, dataFim)

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  const clienteNome = assinatura?.clientes?.nome || 'Cliente'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Isenção de Pagamento - ${clienteNome}`}>
      <form onSubmit={onSubmit} className="space-y-6 mt-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border hover:bg-gray-50 transition-colors">
            <input 
              type="radio" 
              name="tipo_isencao" 
              value="nenhuma" 
              checked={tipo === 'nenhuma'}
              onChange={() => setTipo('nenhuma')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">Sem Isenção (Cobrar normalmente)</p>
              <p className="text-xs text-gray-500">O cliente receberá as faturas mensais e a assinatura será bloqueada se não pagar.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border hover:bg-purple-50 transition-colors">
            <input 
              type="radio" 
              name="tipo_isencao" 
              value="vitalicia" 
              checked={tipo === 'vitalicia'}
              onChange={() => setTipo('vitalicia')}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-purple-900">Isenção Vitalícia</p>
              <p className="text-xs text-purple-600/70">O cliente nunca será cobrado e a assinatura ficará sempre ativa.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border hover:bg-blue-50 transition-colors">
            <input 
              type="radio" 
              name="tipo_isencao" 
              value="temporaria" 
              checked={tipo === 'temporaria'}
              onChange={() => setTipo('temporaria')}
              className="mt-1"
            />
            <div className="w-full">
              <p className="font-medium text-blue-900">Isenção Temporária</p>
              <p className="text-xs text-blue-600/70 mb-2">A assinatura não será cobrada até a data escolhida. Após isso, as faturas voltam.</p>
              
              {tipo === 'temporaria' && (
                <Input 
                  type="date" 
                  name="isencao_fim" 
                  defaultValue={defaultDate}
                  className="mt-2 w-full"
                  required={tipo === 'temporaria'}
                />
              )}
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Aplicar Regra'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
