'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCliente(formData: FormData) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone_whatsapp') as string
  const empresa = formData.get('empresa') as string
  const loginVinculado = formData.get('login_vinculado') as string // Optional email of user
  const planoId = formData.get('plano_id') as string // Optional plan

  if (!nome || !email) {
    return { error: 'Nome e E-mail são obrigatórios.' }
  }

  // Insert cliente
  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({
      nome,
      email,
      telefone_whatsapp: telefone,
      empresa,
      login_vinculado: loginVinculado,
      criado_por: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar cliente:', error)
    return { error: 'Erro ao criar cliente.' }
  }

  // If provided a linked login email, update the usuarios table (must be admin to do this via RLS)
  if (loginVinculado && cliente) {
    const { error: userUpdateError } = await supabase
      .from('usuarios')
      .update({ cliente_id: cliente.id })
      .eq('email', loginVinculado)

    if (userUpdateError) {
      console.error('Erro ao vincular login:', userUpdateError)
      // We don't fail the whole creation if link fails, just log it.
    }
  }

  // Se escolheu um plano na criação do cliente, já gera a assinatura pendente
  if (planoId && cliente) {
    const { error: assError } = await supabase
      .from('assinaturas')
      .insert({
        cliente_id: cliente.id,
        plano_id: planoId,
        gateway: 'asaas',
        status: 'ativa' // A assinatura nasce ativa, a fatura nasce pendente (ainda a implementar faturas automáticas)
      })
    
    if (assError) {
      console.error('Erro ao vincular plano:', assError)
    }
  }

  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function updateCliente(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const telefone = formData.get('telefone_whatsapp') as string
  const empresa = formData.get('empresa') as string
  const loginVinculado = formData.get('login_vinculado') as string

  if (!nome || !email) {
    return { error: 'Nome e E-mail são obrigatórios.' }
  }

  const { error } = await supabase
    .from('clientes')
    .update({
      nome,
      email,
      telefone_whatsapp: telefone,
      empresa,
      login_vinculado: loginVinculado,
    })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar cliente:', error)
    return { error: 'Erro ao atualizar cliente.' }
  }

  if (loginVinculado) {
    // First clear old link if any (optional, keeping it simple for now)
    await supabase.from('usuarios').update({ cliente_id: id }).eq('email', loginVinculado)
  }

  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function deleteCliente(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // Hard delete for MVP (or could add a status field)
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir cliente:', error)
    return { error: 'Erro ao excluir cliente, verifique se ele possui sites vinculados.' }
  }

  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function buscarNotasCliente(clienteId: string) {
  const supabase = await createClient()

  const { data: notas, error } = await supabase
    .from('notas_cliente')
    .select(`
      id,
      conteudo,
      criado_em,
      usuario_id,
      visivel_cliente,
      usuarios ( nome, role )
    `)
    .eq('cliente_id', clienteId)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar notas do cliente:', error)
    return { error: 'Falha ao buscar notas', data: [] }
  }

  return { data: notas }
}

export async function adicionarNotaCliente(clienteId: string, conteudo: string, visivelCliente: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  if (!conteudo || conteudo.trim() === '') {
    return { error: 'O conteúdo não pode ser vazio' }
  }

  const { error } = await supabase
    .from('notas_cliente')
    .insert({
      cliente_id: clienteId,
      usuario_id: user.id,
      conteudo: conteudo.trim(),
      visivel_cliente: visivelCliente
    })

  if (error) {
    console.error('Erro ao adicionar nota:', error)
    return { error: 'Falha ao adicionar nota' }
  }

  if (visivelCliente) {
    // Busca os usuários logados deste cliente para receberem a notificação
    const { data: usuariosCliente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('cliente_id', clienteId)

    if (usuariosCliente && usuariosCliente.length > 0) {
      const notifs = usuariosCliente.map(u => ({
        usuario_id: u.id,
        titulo: 'Nova Anotação da Equipe',
        mensagem: conteudo.trim().substring(0, 80) + (conteudo.length > 80 ? '...' : ''),
        tipo: 'geral',
        link: '/dashboard/anotacoes'
      }))
      await supabase.from('notificacoes').insert(notifs)
    }
  }

  revalidatePath(`/dashboard/clientes/${clienteId}`)
  return { success: true }
}

export async function editarNotaCliente(notaId: string, conteudo: string, visivelCliente: boolean = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  if (!conteudo || conteudo.trim() === '') {
    return { error: 'O conteúdo não pode ser vazio' }
  }

  // A política RLS "Apenas autor edita nota" vai garantir que apenas o dono altere
  const { error } = await supabase
    .from('notas_cliente')
    .update({ 
      conteudo: conteudo.trim(),
      visivel_cliente: visivelCliente
    })
    .eq('id', notaId)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Erro ao editar nota:', error)
    return { error: 'Falha ao editar anotação' }
  }

  return { success: true }
}

export async function excluirNotaCliente(notaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // A política RLS "Apenas autor exclui nota" garante segurança
  const { error } = await supabase
    .from('notas_cliente')
    .delete()
    .eq('id', notaId)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Erro ao excluir nota:', error)
    return { error: 'Falha ao excluir anotação' }
  }

  return { success: true }
}
