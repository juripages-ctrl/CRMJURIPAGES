import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PerfilForm } from './PerfilForm'

export const metadata = {
  title: 'Meu Perfil | JuriPages',
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !usuario) {
    return <div className="p-8 text-red-500">Erro ao carregar os dados do perfil.</div>
  }

  return (
    <div className="flex-1 w-full bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações pessoais e foto de perfil.
          </p>
        </div>

        <PerfilForm 
          usuario={{
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email, // Preferindo o da tabela usuarios
            telefone: usuario.telefone || '',
            avatar_url: usuario.avatar_url || '',
            role: usuario.role
          }} 
        />

      </div>
    </div>
  )
}
