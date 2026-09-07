'use client'

import { useState } from 'react'
import { Plus, User, Shield, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { inviteTeamMember, updateTeamMemberRole } from './equipe-actions'

export function EquipeClient({ equipe, cargos }: { equipe: any[], cargos: any[] }) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleInviteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await inviteTeamMember(formData)
    if (res.error) {
      alert(res.error)
    } else {
      alert('Convite enviado com sucesso!')
      setIsInviteModalOpen(false)
    }
    setLoading(false)
  }

  async function handleRoleChange(userId: string, newRoleId: string) {
    await updateTeamMemberRole(userId, newRoleId)
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Membros Ativos</h3>
          <Button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Convidar Membro
          </Button>
        </div>
        
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {equipe.map((membro) => (
            <div key={membro.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium shrink-0">
                  {membro.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-[14.5px] truncate">{membro.nome}</p>
                  <p className="text-[12.5px] text-gray-500 truncate mt-0.5">{membro.email}</p>
                </div>
              </div>
              <div className="mt-1">
                <select 
                  className="w-full h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={membro.cargo_id || ''}
                  onChange={(e) => handleRoleChange(membro.id, e.target.value)}
                >
                  <option value="" disabled>Sem cargo definido</option>
                  {cargos.map(cargo => (
                    <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo (Permissões)</TableHead>
              <TableHead>Data de Entrada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipe.map((membro) => (
              <TableRow key={membro.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{membro.nome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-500">{membro.email}</TableCell>
                <TableCell>
                  <select 
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={membro.cargo_id || ''}
                    onChange={(e) => handleRoleChange(membro.id, e.target.value)}
                  >
                    <option value="" disabled>Sem cargo definido</option>
                    {cargos.map(cargo => (
                      <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {new Date(membro.criado_em).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Convidar para a Equipe">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Um link mágico será enviado para o e-mail abaixo. O membro poderá acessar e definir sua própria senha.
          </p>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nome do Membro</label>
            <Input name="nome" placeholder="Ex: João Silva" required />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <Input name="email" type="email" placeholder="joao@suaagencia.com" required />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Cargo Inicial</label>
            <select name="cargo_id" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" required>
              <option value="">Selecione o cargo...</option>
              {cargos.map(cargo => (
                <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Convite'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
