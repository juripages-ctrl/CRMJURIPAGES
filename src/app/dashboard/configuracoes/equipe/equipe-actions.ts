'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Admin client para bypass de RLS e uso do auth.admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function inviteTeamMember(formData: FormData) {
  const email = formData.get('email') as string
  const nome = formData.get('nome') as string
  const cargoId = formData.get('cargo_id') as string

  if (!email || !nome || !cargoId) {
    return { error: 'Preencha todos os campos' }
  }

  try {
    const supabase = await createServerClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    // Convidar o usuário (cria o auth.users e envia o email)
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
    
    if (inviteError) {
      console.error(inviteError)
      return { error: 'Erro ao convidar usuário: ' + inviteError.message }
    }

    // Criar o registro na tabela usuarios com o cargo_id e role admin
    if (inviteData?.user?.id) {
      const { error: insertError } = await supabaseAdmin
        .from('usuarios')
        .insert({
          id: inviteData.user.id,
          email: email,
          nome: nome,
          role: 'admin',
          cargo_id: cargoId
        })
      
      if (insertError) {
        console.error(insertError)
        return { error: 'Erro ao salvar os dados do membro: ' + insertError.message }
      }

      // Inserir log
      await supabaseAdmin.from('logs_auditoria').insert({
        usuario_id: currentUser?.id,
        acao: 'CREATE',
        entidade: 'equipe',
        entidade_id: inviteData.user.id,
        detalhes: { nome, email, cargo_id: cargoId }
      })
    }

    revalidatePath('/dashboard/configuracoes/equipe')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Erro interno ao convidar membro' }
  }
}

export async function updateTeamMemberRole(userId: string, newCargoId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Usando admin para bypass do RLS ao alterar perfis (opcional, dependendo de como as politicas foram configuradas)
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({ cargo_id: newCargoId })
      .eq('id', userId)

    if (error) {
      console.error(error)
      return { error: error.message }
    }

    await supabaseAdmin.from('logs_auditoria').insert({
      usuario_id: currentUser?.id,
      acao: 'UPDATE',
      entidade: 'equipe',
      entidade_id: userId,
      detalhes: { cargo_id: newCargoId }
    })

    revalidatePath('/dashboard/configuracoes/equipe')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Erro interno' }
  }
}
