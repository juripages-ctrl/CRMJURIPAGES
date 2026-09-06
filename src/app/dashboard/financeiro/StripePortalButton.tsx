'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createCustomerPortalSession } from './client-finance-actions'
import { ExternalLink } from 'lucide-react'

export function StripePortalButton() {
  const [loading, setLoading] = useState(false)

  const handlePortal = async () => {
    setLoading(true)
    const res = await createCustomerPortalSession()
    if (res?.error) {
      alert(res.error)
      setLoading(false)
    } else if (res?.url) {
      window.location.href = res.url
    } else {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePortal} disabled={loading} className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
      {loading ? 'Redirecionando...' : 'Gerenciar Assinatura'}
      <ExternalLink className="w-4 h-4" />
    </Button>
  )
}
