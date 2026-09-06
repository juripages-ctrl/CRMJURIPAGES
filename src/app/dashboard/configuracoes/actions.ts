'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveMasterCloudflare(formData: FormData) {
  const supabase = await createClient()
  const apiToken = formData.get('api_token') as string

  if (!apiToken) return { error: 'O Token é obrigatório.' }

  try {
    const cfRes = await fetch('https://api.cloudflare.com/client/v4/zones?per_page=1', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!cfRes.ok) {
      return { error: 'Token inválido ou sem permissão. Verifique no painel do Cloudflare.' }
    }
  } catch (err) {
    return { error: 'Falha ao conectar na API do Cloudflare.' }
  }

  const { error } = await supabase.from('configuracoes_agencia')
    .update({ cloudflare_api_token: apiToken, atualizado_em: new Date() })
    .eq('id', 1)

  if (error) return { error: 'Erro ao conectar Cloudflare Master.' }

  revalidatePath('/dashboard/configuracoes')
  return { success: true }
}

export async function saveMasterGoogle() {
  const supabase = await createClient()
  
  // Mock Google OAuth connection by saving a dummy token
  const { error } = await supabase.from('configuracoes_agencia')
    .update({ gsc_refresh_token: 'mock_google_oauth_token', atualizado_em: new Date() })
    .eq('id', 1)

  if (error) return { error: 'Erro ao conectar Google Search Console.' }
  
  revalidatePath('/dashboard/configuracoes')
  return { success: true }
}

export async function disconnectMasterIntegration(tipo: 'cloudflare' | 'google' | 'pagespeed') {
  const supabase = await createClient()
  
  let updateData: any = {}
  if (tipo === 'cloudflare') updateData = { cloudflare_api_token: null }
  else if (tipo === 'google') updateData = { gsc_refresh_token: null }
  else if (tipo === 'pagespeed') updateData = { pagespeed_api_key: null }

  const { error } = await supabase.from('configuracoes_agencia').update(updateData).eq('id', 1)
  
  if (error) return { error: 'Erro ao desconectar.' }
  revalidatePath('/dashboard/configuracoes')
  return { success: true }
}

export async function saveMasterPageSpeed(formData: FormData) {
  const supabase = await createClient()
  const apiKey = formData.get('pagespeed_api_key') as string

  if (!apiKey) return { error: 'A Chave de API é obrigatória.' }

  const { error } = await supabase.from('configuracoes_agencia')
    .update({ pagespeed_api_key: apiKey, atualizado_em: new Date() })
    .eq('id', 1)

  if (error) return { error: 'Erro ao salvar chave do PageSpeed.' }

  revalidatePath('/dashboard/configuracoes')
  return { success: true }
}
