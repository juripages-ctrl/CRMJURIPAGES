'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  nome: string
  telefone?: string
  avatar_url?: string
  email?: string
}) {
  const supabase = await createClient()
  
  // Obter o usuário logado
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Usuário não autenticado.' }
  }

  try {
    // 1. Atualizar nome e telefone na tabela `usuarios`
    const updates: any = {
      nome: data.nome,
    }
    if (data.telefone !== undefined) updates.telefone = data.telefone
    if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url

    const { error: dbError } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', user.id)

    if (dbError) throw dbError

    // 2. Se for cliente, sincronizar dados com a tabela `clientes`
    if (data.telefone !== undefined || data.nome !== undefined || data.avatar_url !== undefined) {
      // Buscar cliente_id
      const { data: userData } = await supabase
        .from('usuarios')
        .select('cliente_id')
        .eq('id', user.id)
        .single()

      if (userData?.cliente_id) {
        const clienteUpdates: any = {}
        if (data.telefone !== undefined) clienteUpdates.telefone_whatsapp = data.telefone
        if (data.nome !== undefined) clienteUpdates.nome = data.nome
        if (data.avatar_url !== undefined) clienteUpdates.avatar_url = data.avatar_url

        await supabase
          .from('clientes')
          .update(clienteUpdates)
          .eq('id', userData.cliente_id)
      }
    }

    // 3. Atualizar e-mail no Auth se fornecido e for diferente
    if (data.email && data.email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
      })
      if (authError) throw authError
      // A trigger no DB (16_perfil_usuarios.sql) cuidará de sincronizar de auth.users para public.usuarios quando for verificado
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/perfil')
    
    return { success: true }
  } catch (err: any) {
    console.error('Erro ao atualizar perfil:', err)
    return { error: err.message || 'Erro ao atualizar perfil.' }
  }
}
