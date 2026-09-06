import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { Plus, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EquipeClient } from './EquipeClient'

export default async function EquipePage() {
  const supabase = await createClient()

  // Buscar todos os administradores (equipe) e seus respectivos cargos
  // Como `role='admin'` indica equipe, filtramos por isso
  const { data: equipe, error } = await supabase
    .from('usuarios')
    .select('*, cargos(id, nome)')
    .eq('role', 'admin')
    .order('criado_em', { ascending: false })

  const { data: cargos } = await supabase
    .from('cargos')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Membros da Equipe</h1>
          <p className="text-gray-500 mt-1">Gerencie quem tem acesso ao painel administrativo da agência.</p>
        </div>
      </div>

      <EquipeClient equipe={equipe || []} cargos={cargos || []} />
    </div>
  )
}
