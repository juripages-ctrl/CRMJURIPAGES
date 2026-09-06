'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ClienteModal, ClienteType } from './ClienteModal'
import { deleteCliente } from './actions'

export function ClientesClient({ clientes, planos }: { clientes: ClienteType[], planos: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteType | null>(null)

  const handleOpenNew = () => {
    setSelectedCliente(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cliente: ClienteType) => {
    setSelectedCliente(cliente)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const res = await deleteCliente(id)
      if (res.error) {
        alert(res.error)
      }
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os clientes e seus acessos.</p>
        </div>
        <Button onClick={handleOpenNew} className="flex items-center rounded-full bg-black hover:bg-gray-800 text-white px-6 h-10">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="w-full overflow-x-auto pb-10">
        <div className="min-w-[900px]">
          {/* Cabeçalho */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_2.5fr_100px] gap-4 px-6 py-3 mb-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</div>
          </div>

          {/* Lista */}
          <div className="flex flex-col gap-3">
            {clientes.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white rounded-[1.5rem] shadow-sm">
                Nenhum cliente cadastrado ainda.
              </div>
            ) : (
              clientes.map((cliente) => (
                <div 
                  key={cliente.id} 
                  className="grid grid-cols-[2fr_2fr_1.5fr_2.5fr_100px] gap-4 items-center px-6 py-4 bg-white rounded-[1.5rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] transition-all group border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-200">
                      {cliente.avatar_url ? (
                        <Image src={cliente.avatar_url} alt={cliente.nome} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        cliente.nome.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      <Link href={`/dashboard/clientes/${cliente.id}`} className="hover:text-blue-600 transition-colors block truncate">
                        {cliente.nome}
                      </Link>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{cliente.email}</div>
                  <div className="text-sm text-gray-600 truncate">{cliente.telefone_whatsapp || '-'}</div>
                  <div className="text-sm text-gray-600 truncate">{cliente.empresa || '-'}</div>
                  <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/clientes/${cliente.id}`}>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-500 hover:text-black rounded-full hover:bg-gray-100">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cliente.id)} className="w-8 h-8 p-0 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ClienteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        cliente={selectedCliente} 
        planos={planos}
      />
    </div>
  )
}
