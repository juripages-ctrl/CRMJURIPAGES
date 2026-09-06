'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSite(clienteId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const nome = formData.get('nome') as string
  const dominio = formData.get('dominio') as string
  const status = formData.get('status') as string
  const plano = formData.get('plano') as string
  const zoneId = formData.get('cloudflare_zone_id') as string

  if (!nome || !dominio || !status) {
    return { error: 'Nome, Domínio e Status são obrigatórios.' }
  }

  const { error } = await supabase
    .from('sites')
    .insert({
      cliente_id: clienteId,
      nome,
      dominio,
      status,
      plano: plano || null,
      cloudflare_zone_id: zoneId || null
    })

  if (error) {
    console.error('Erro ao criar site:', error)
    return { error: 'Erro ao criar site.' }
  }

  revalidatePath('/dashboard/clientes/[id]', 'page')
  revalidatePath('/dashboard/sites')
  return { success: true }
}

export async function updateSite(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const nome = formData.get('nome') as string
  const dominio = formData.get('dominio') as string
  const status = formData.get('status') as string
  const plano = formData.get('plano') as string
  const zoneId = formData.get('cloudflare_zone_id') as string

  if (!nome || !dominio || !status) {
    return { error: 'Nome, Domínio e Status são obrigatórios.' }
  }

  const { error } = await supabase
    .from('sites')
    .update({
      nome,
      dominio,
      status,
      plano: plano || null,
      cloudflare_zone_id: zoneId || null
    })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar site:', error)
    return { error: 'Erro ao atualizar site.' }
  }

  revalidatePath('/dashboard/clientes/[id]', 'page')
  revalidatePath('/dashboard/sites')
  return { success: true }
}

export async function deleteSite(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir site:', error)
    return { error: 'Erro ao excluir site.' }
  }

  revalidatePath('/dashboard/clientes/[id]', 'page')
  revalidatePath('/dashboard/sites')
  return { success: true }
}

export async function deleteSiteSoft(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { error } = await supabase
    .from('sites')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Erro ao mover site para lixeira:', error)
    return { error: 'Erro ao excluir site.' }
  }

  revalidatePath('/dashboard/clientes/[id]', 'page')
  revalidatePath('/dashboard/sites')
  revalidatePath('/dashboard/meus-sites')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function restoreSite(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { error } = await supabase
    .from('sites')
    .update({ deleted_at: null })
    .eq('id', id)

  if (error) {
    console.error('Erro ao restaurar site:', error)
    return { error: 'Erro ao restaurar site.' }
  }

  revalidatePath('/dashboard/clientes/[id]', 'page')
  revalidatePath('/dashboard/sites')
  revalidatePath('/dashboard/meus-sites')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateSiteStatus(id: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { error } = await supabase
    .from('sites')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar status do site:', error)
    return { error: 'Erro ao atualizar status.' }
  }

  revalidatePath('/dashboard/clientes/[id]', 'page')
  revalidatePath('/dashboard/clientes/[id]', 'page')
  revalidatePath('/dashboard/sites')
  return { success: true }
}

export async function getUnlinkedSites() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .select('*, integracoes_google(id)')
    .is('cliente_id', null)
    .is('deleted_at', null)
  
  if (error) return { data: [] }
  return { data }
}

export async function linkSiteToClient(siteId: string, clienteId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ cliente_id: clienteId }).eq('id', siteId)
  if (error) return { error: 'Erro ao vincular site.' }
  revalidatePath('/dashboard/clientes', 'layout')
  revalidatePath('/dashboard/sites', 'layout')
  return { success: true }
}

export async function unlinkSite(siteId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ cliente_id: null }).eq('id', siteId)
  if (error) return { error: 'Erro ao desvincular site.' }
  revalidatePath('/dashboard/clientes', 'layout')
  revalidatePath('/dashboard/sites', 'layout')
  return { success: true }
}
export async function checkDomainStatus(siteId: string, dominio: string) {
  try {
    // Add protocol if missing
    const url = dominio.startsWith('http') ? dominio : `https://${dominio}`
    
    // We use AbortController to prevent long hangs
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    })
    clearTimeout(timeoutId)

    // Consider valid if it returns any 2xx or 3xx (like 301 redirect)
    const isOnline = response.ok || (response.status >= 300 && response.status < 400)
    const newStatus = isOnline ? 'no_ar' : 'fora_do_ar'

    // Update DB
    const supabase = await createClient()
    const { error } = await supabase
      .from('sites')
      .update({ status: newStatus })
      .eq('id', siteId)

    if (error) {
      console.error('Erro ao atualizar DB no checkDomainStatus:', error)
      return { error: 'Erro ao atualizar status no banco.' }
    }

    revalidatePath('/dashboard/sites')
    revalidatePath(`/dashboard/sites/${siteId}`)
    
    return { success: true, isOnline, status: newStatus }
  } catch (error) {
    console.error('Erro no checkDomainStatus (fetch falhou):', error)
    
    // If fetch failed (DNS error, timeout, SSL error), mark as fora_do_ar
    const supabase = await createClient()
    await supabase.from('sites').update({ status: 'fora_do_ar' }).eq('id', siteId)
    
    revalidatePath('/dashboard/sites')
    revalidatePath(`/dashboard/sites/${siteId}`)
    
    return { success: true, isOnline: false, status: 'fora_do_ar' }
  }
}
