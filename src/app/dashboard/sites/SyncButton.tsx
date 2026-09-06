'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'
import { syncGlobalSites } from './integrations-actions'
import { useRouter } from 'next/navigation'

export function SyncButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    const res = await syncGlobalSites()
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      alert(`Sincronização concluída! ${res?.count} novos sites adicionados.`)
      router.refresh()
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} className="flex items-center gap-2">
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Sincronizando...' : 'Sincronizar APIs Globais'}
    </Button>
  )
}
