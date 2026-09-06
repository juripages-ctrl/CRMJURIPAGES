'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificacaoItem = {
  id: string
  usuario_id: string
  titulo: string
  mensagem: string
  tipo: 'pagamento' | 'seo' | 'wordpress' | 'blog' | 'geral'
  link: string | null
  lida: boolean
  criado_em: string
}

export async function fetchNotificacoes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notificacoes: [], unreadCount: 0 }

  // Check if notificacoes table exists and fetch
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('usuario_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(20)

  if (error) {
    // Return empty list gracefully if table is not created yet
    return { notificacoes: [], unreadCount: 0, error: error.message }
  }

  const unreadCount = data?.filter((n: NotificacaoItem) => !n.lida).length || 0

  return { 
    notificacoes: (data as NotificacaoItem[]) || [], 
    unreadCount 
  }
}

export async function marcarNotificacaoComoLida(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function marcarTodasComoLidas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('usuario_id', user.id)
    .eq('lida', false)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function seedExemploNotificacoes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Get first site to generate real links if available
  const { data: firstSite } = await supabase.from('sites').select('id, nome').limit(1).maybeSingle()
  const siteId = firstSite?.id || 'demo'

  const amostras = [
    {
      usuario_id: user.id,
      titulo: '💳 Fatura de Hospedagem Vencendo',
      mensagem: 'Sua assinatura do plano Agência vence em 3 dias. Clique para gerenciar o pagamento.',
      tipo: 'pagamento',
      link: '/dashboard/financeiro',
      lida: false
    },
    {
      usuario_id: user.id,
      titulo: '🔍 SEO: Termos em alta no Google',
      mensagem: `O site ${firstSite?.nome || 'Principal'} teve um aumento de +45% em impressões no Google Search Console.`,
      tipo: 'seo',
      link: `/dashboard/sites/${siteId}?tab=seo`,
      lida: false
    },
    {
      usuario_id: user.id,
      titulo: '🛡️ WordPress: Wordfence Bloqueou 12 Ataques',
      mensagem: 'O firewall de segurança repeliu tentativas de acesso indevido nas últimas 24h.',
      tipo: 'wordpress',
      link: `/dashboard/sites/${siteId}?tab=wp`,
      lida: false
    },
    {
      usuario_id: user.id,
      titulo: '📝 Blog: Post Agendado com Sucesso',
      mensagem: 'O artigo "5 Dicas de Direito Imobiliário" foi programado para publicação automática.',
      tipo: 'blog',
      link: `/dashboard/sites/${siteId}?tab=blog`,
      lida: false
    }
  ]

  const { error } = await supabase.from('notificacoes').insert(amostras)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
