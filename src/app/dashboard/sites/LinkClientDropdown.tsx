'use client'

import { useState } from 'react'
import { linkSiteToClient } from './actions'
import { useRouter } from 'next/navigation'

export function LinkClientDropdown({ siteId, clientes }: { siteId: string, clientes: { id: string, nome: string }[] }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLink(clienteId: string) {
    if (!clienteId) return
    setLoading(true)
    await linkSiteToClient(siteId, clienteId)
    setLoading(false)
    router.refresh()
  }

  return (
    <select 
      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 w-36 cursor-pointer focus:outline-none focus:border-black"
      onChange={(e) => handleLink(e.target.value)}
      disabled={loading}
      defaultValue=""
    >
      <option value="" disabled>{loading ? 'Salvando...' : 'Vincular Cliente'}</option>
      {clientes.map(c => (
        <option key={c.id} value={c.id}>{c.nome}</option>
      ))}
    </select>
  )
}
