'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createCliente, updateCliente } from './actions'

export type ClienteType = {
  id: string
  nome: string
  email: string
  telefone_whatsapp?: string
  empresa?: string
  login_vinculado?: string
  avatar_url?: string
}

export function ClienteModal({ 
  cliente, 
  isOpen, 
  onClose,
  planos 
}: { 
  cliente?: ClienteType | null
  isOpen: boolean
  onClose: () => void 
  planos?: any[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    let res
    if (cliente) {
      res = await updateCliente(cliente.id, formData)
    } else {
      res = await createCliente(formData)
    }

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cliente ? 'Editar Cliente' : 'Novo Cliente'}>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome completo</label>
          <Input id="nome" name="nome" required defaultValue={cliente?.nome} placeholder="João Silva" />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</label>
          <Input id="email" name="email" type="email" required defaultValue={cliente?.email} placeholder="joao@empresa.com" />
        </div>

        <div className="space-y-2">
          <label htmlFor="telefone_whatsapp" className="text-sm font-medium text-gray-700">WhatsApp</label>
          <Input id="telefone_whatsapp" name="telefone_whatsapp" defaultValue={cliente?.telefone_whatsapp} placeholder="(11) 99999-9999" />
        </div>

        <div className="space-y-2">
          <label htmlFor="empresa" className="text-sm font-medium text-gray-700">Empresa (Opcional)</label>
          <Input id="empresa" name="empresa" defaultValue={cliente?.empresa} placeholder="Nome da Empresa" />
        </div>

        <div className="space-y-2 pt-2 pb-2">
          <label htmlFor="login_vinculado" className="text-sm font-medium text-gray-700">E-mail de Login do Usuário (Opcional)</label>
          <p className="text-xs text-gray-500 mb-2">Para dar acesso ao painel do cliente, digite o e-mail que ele usou/usará para criar a conta.</p>
          <Input id="login_vinculado" name="login_vinculado" defaultValue={cliente?.login_vinculado} placeholder="E-mail de login para vínculo" />
        </div>

        {!cliente && planos && planos.length > 0 && (
          <div className="space-y-2 pb-4">
            <label htmlFor="plano_id" className="text-sm font-medium text-gray-700">Vincular a um Plano (Opcional)</label>
            <p className="text-xs text-gray-500 mb-2">O cliente receberá uma fatura por e-mail referente a este plano.</p>
            <select 
              id="plano_id" 
              name="plano_id" 
              className="w-full h-10 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DFFF00] focus:border-transparent text-sm bg-white"
            >
              <option value="">Nenhum plano agora</option>
              {planos.map(plano => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome} - R$ {plano.valor}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
