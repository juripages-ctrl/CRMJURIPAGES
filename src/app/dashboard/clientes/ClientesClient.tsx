'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Eye, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { ClienteModal, ClienteType } from './ClienteModal'
import { deleteCliente } from './actions'
import { BottomSheet } from '@/components/ui/BottomSheet'

export function ClientesClient({ clientes, planos }: { clientes: ClienteType[], planos: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteType | null>(null)
  const [actionSheetCliente, setActionSheetCliente] = useState<ClienteType | null>(null)

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

      {/* ===== MOBILE: Card List ===== */}
      <div className="md:hidden flex flex-col gap-3 pb-10">
        {clientes.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[2rem] p-11 text-center">
            <p className="text-base font-semibold text-gray-900 mb-1">Nenhum cliente</p>
            <p className="text-[13.5px] text-gray-500">Cadastre o primeiro cliente.</p>
          </div>
        ) : (
          clientes.map((cliente) => (
            <div key={cliente.id}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-[26px] p-3.5 shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)] active:scale-[0.98] transition-transform"
            >
              <div className="w-[46px] h-[46px] rounded-full bg-primary/10 text-primary flex items-center justify-center text-[15px] font-bold shrink-0 overflow-hidden">
                {cliente.avatar_url ? (
                  <Image src={cliente.avatar_url} alt={cliente.nome} width={46} height={46} className="w-full h-full object-cover" />
                ) : (
                  cliente.nome.charAt(0).toUpperCase()
                )}
              </div>
              <Link href={`/dashboard/clientes/${cliente.id}`} className="flex-1 min-w-0 block">
                <p className="text-[14.5px] font-semibold text-gray-900 truncate tracking-tight">{cliente.nome}</p>
                <p className="text-[12.5px] text-gray-400 truncate mt-0.5">{cliente.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10.5px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {cliente.empresa || 'Sem empresa'}
                  </span>
                </div>
              </Link>
              <button onClick={() => setActionSheetCliente(cliente)} className="p-2 -mr-2 text-gray-400 hover:text-black">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ===== DESKTOP: Grid Layout ===== */}
      <div className="hidden md:block w-full overflow-x-auto pb-10">
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

      <BottomSheet open={!!actionSheetCliente} onClose={() => setActionSheetCliente(null)}>
        {actionSheetCliente && (
          <div className="flex flex-col gap-1 pb-4">
            <h3 className="text-[15px] font-semibold text-gray-900 mb-3 px-2 truncate tracking-tight">{actionSheetCliente.nome}</h3>
            
            <Link href={`/dashboard/clientes/${actionSheetCliente.id}`} onClick={() => setActionSheetCliente(null)} className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
              <Eye className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-[15px]">Ver Perfil & Projetos</span>
            </Link>
            
            <button onClick={() => { setActionSheetCliente(null); handleOpenEdit(actionSheetCliente); }} className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-gray-50 rounded-xl active:bg-gray-100 transition-colors text-left w-full">
              <Edit2 className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-[15px]">Editar Cliente</span>
            </button>

            <button onClick={() => { setActionSheetCliente(null); handleDelete(actionSheetCliente.id); }} className="flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl active:bg-red-100 transition-colors text-left w-full mt-1">
              <Trash2 className="w-5 h-5 text-red-500" />
              <span className="font-medium text-[15px]">Excluir Cliente</span>
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
