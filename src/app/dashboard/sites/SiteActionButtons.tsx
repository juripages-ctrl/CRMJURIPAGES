'use client'

import { Button } from '@/components/ui/Button'
import { Link2, ArrowRight, Trash2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { deleteSiteSoft, restoreSite, deleteSite } from './actions'
import { LinkClientDropdown } from './LinkClientDropdown'

export function SiteActionButtons({ 
  siteId, 
  clienteId, 
  tab, 
  clientes 
}: { 
  siteId: string
  clienteId: string | null
  tab: string
  clientes: any[]
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {tab === 'ativos' ? (
        <>
          <Link href={`/dashboard/sites/${siteId}`}>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
              <Link2 className="w-4 h-4 mr-1" /> Gerenciar Site
            </Button>
          </Link>
          {clienteId ? (
            <Link href={`/dashboard/clientes/${clienteId}`}>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-black">
                Cliente <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <LinkClientDropdown siteId={siteId} clientes={clientes} />
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50" 
            onClick={() => deleteSiteSoft(siteId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-600 hover:text-green-700 hover:bg-green-50" 
            onClick={() => restoreSite(siteId)}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Restaurar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50" 
            onClick={() => deleteSite(siteId)}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Excluir Definitivo
          </Button>
        </>
      )}
    </div>
  )
}
