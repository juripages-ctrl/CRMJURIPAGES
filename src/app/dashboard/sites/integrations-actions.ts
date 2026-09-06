'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'


export async function saveGoogleIntegration(siteId: string, formData: FormData) {
  const supabase = await createClient()
  const propriedade = formData.get('propriedade') as string

  if (!propriedade) return { error: 'URL da Propriedade é obrigatória.' }

  const { data: config } = await supabase.from('configuracoes_agencia').select('gsc_refresh_token').eq('id', 1).single()
  if (!config || !config.gsc_refresh_token) {
    return { error: 'Conecte o Google Search Console nas Configurações Globais primeiro.' }
  }

  const { data: existing } = await supabase.from('integracoes_google').select('id').eq('site_id', siteId).maybeSingle()

  if (existing) {
    const { error } = await supabase.from('integracoes_google')
      .update({ access_token: 'mock', refresh_token: config.gsc_refresh_token, propriedade_search_console: propriedade })
      .eq('id', existing.id)
    if (error) return { error: 'Erro ao atualizar integração do Google.' }
  } else {
    const { error } = await supabase.from('integracoes_google')
      .insert({ site_id: siteId, access_token: 'mock', refresh_token: config.gsc_refresh_token, propriedade_search_console: propriedade })
    if (error) return { error: 'Erro ao criar integração do Google.' }
  }

  revalidatePath(`/dashboard/sites/${siteId}`)
  return { success: true }
}


export async function saveHostingIntegration(siteId: string, formData: FormData) {
  const supabase = await createClient()
  const provedorId = formData.get('provedor_id') as string
  const apelido = formData.get('apelido') as string
  const apiKey = formData.get('api_key') as string // generic field for token/key
  const apiSecret = formData.get('api_secret') as string // optional secret

  if (!provedorId || !apiKey) return { error: 'Provedor e Chave/Token são obrigatórios.' }

  const credenciais = apiSecret ? { key: apiKey, secret: apiSecret } : { token: apiKey }

  const { data: existing } = await supabase.from('integracoes_hospedagem').select('id').eq('site_id', siteId).single()

  if (existing) {
    const { error } = await supabase.from('integracoes_hospedagem')
      .update({ provedor_id: provedorId, apelido, credenciais })
      .eq('id', existing.id)
    if (error) return { error: 'Erro ao atualizar integração de hospedagem.' }
  } else {
    const { error } = await supabase.from('integracoes_hospedagem')
      .insert({ site_id: siteId, provedor_id: provedorId, apelido, credenciais })
    if (error) return { error: 'Erro ao salvar integração de hospedagem.' }
  }

  revalidatePath(`/dashboard/sites/${siteId}`)
  return { success: true }
}

export async function disconnectIntegration(table: string, siteId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(table).delete().eq('site_id', siteId)
  if (error) return { error: 'Erro ao desconectar integração.' }
  
  revalidatePath(`/dashboard/sites/${siteId}`)
  return { success: true }
}

export async function getWithCache(
  siteId: string,
  cacheKey: string,
  ttlMinutes: number,
  forceRefresh: boolean,
  fetchCallback: () => Promise<any>
) {
  const supabase = await createClient()

  if (!forceRefresh) {
    const { data: cacheRow } = await supabase
      .from('api_cache')
      .select('data, updated_at')
      .eq('site_id', siteId)
      .eq('cache_key', cacheKey)
      .single()
    
    if (cacheRow) {
      const updatedAt = new Date(cacheRow.updated_at).getTime()
      const now = new Date().getTime()
      const ageMinutes = (now - updatedAt) / (1000 * 60)
      
      if (ageMinutes < ttlMinutes) {
        return { ...cacheRow.data, _cachedAt: cacheRow.updated_at, _isCached: true }
      }
    }
  }

  const freshData = await fetchCallback()
  
  if (freshData && !freshData.error) {
    const nowIso = new Date().toISOString()
    await supabase.from('api_cache').upsert({
      site_id: siteId,
      cache_key: cacheKey,
      data: freshData,
      updated_at: nowIso
    }, { onConflict: 'site_id,cache_key' })

    return { ...freshData, _cachedAt: nowIso, _isCached: false }
  }

  return freshData
}



export async function fetchGoogleSites() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes_agencia').select('gsc_refresh_token').eq('id', 1).single()
  if (!config || !config.gsc_refresh_token) return { error: 'Google Search Console não configurado.' }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return { error: 'Credenciais OAuth do Google ausentes no servidor.' }

  try {
    // Exchange refresh token for new access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: config.gsc_refresh_token,
        grant_type: 'refresh_token',
      }),
    })
    
    const tokenData = await tokenRes.json()
    if (tokenData.error) return { error: 'Falha ao renovar token do Google. Reconecte a conta.' }

    const accessToken = tokenData.access_token

    // Fetch sites
    const sitesRes = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })
    
    const sitesData = await sitesRes.json()
    if (!sitesRes.ok) return { error: sitesData.error?.message || 'Falha ao buscar propriedades do Google.' }

    return { data: sitesData.siteEntry?.map((s: any) => ({ siteUrl: s.siteUrl })) || [] }
  } catch (err) {
    return { error: 'Erro de rede ao conectar com Google.' }
  }
}

export async function syncGlobalSites() {
  const supabase = await createClient()

  // Fetch from APIs
  const gscRes = await fetchGoogleSites()

  if (gscRes.error) {
    return { error: 'Falha ao conectar com a API do Google.' }
  }

  type DiscoveredSite = {
    id: string
    name: string
    source: 'google'
    gsc_url?: string
  }

  const sitesMap = new Map<string, DiscoveredSite>()
  


  if (gscRes.data) {
    gscRes.data.forEach((s: any) => {
      const domain = s.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^sc-domain:/, '').toLowerCase()
      sitesMap.set(domain, {
        id: domain,
        name: domain,
        source: 'google',
        gsc_url: s.siteUrl
      })
    })
  }

  if (sitesMap.size === 0) {
    return { success: true, count: 0 }
  }

  // Get master config tokens for integrations
  const { data: config } = await supabase.from('configuracoes_agencia').select('*').eq('id', 1).single()

  let addedCount = 0

  // For each discovered site
  for (const site of Array.from(sitesMap.values())) {
    // Check if site already exists in db by domain
    const { data: existingSite } = await supabase.from('sites').select('id').eq('dominio', site.name).maybeSingle()
    
    let siteId = existingSite?.id

    if (!siteId) {
      // Create orphan site
      const { data: newSite, error: insertError } = await supabase
        .from('sites')
        .insert({
          nome: site.name.split('.')[0],
          dominio: site.name,
          status: 'fora_do_ar'
          // cliente_id is null
        })
        .select()
        .single()
      
      if (!insertError && newSite) {
        siteId = newSite.id
        addedCount++
      }
    }

    if (siteId) {


      // Link GSC if missing
      if (site.gsc_url && config?.gsc_refresh_token) {
        const { data: existingGsc } = await supabase.from('integracoes_google').select('id').eq('site_id', siteId).maybeSingle()
        if (!existingGsc) {
          await supabase.from('integracoes_google').insert({
            site_id: siteId,
            access_token: 'mock',
            refresh_token: config.gsc_refresh_token,
            propriedade_search_console: site.gsc_url
          })
        }
      }
    }
  }

  revalidatePath('/dashboard/sites')
  return { success: true, count: addedCount }
}


export async function fetchGscAnalytics(siteId: string, siteUrl: string, startDateStr: string, endDateStr: string, pageUrl?: string, forceRefresh: boolean = false) {
  const cacheKey = `gsc_analytics_${startDateStr}_${endDateStr}_${pageUrl || 'all'}`
  return getWithCache(siteId, cacheKey, 60, forceRefresh, async () => {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes_agencia').select('gsc_refresh_token').eq('id', 1).single()
  if (!config || !config.gsc_refresh_token) return { error: 'GSC não configurado.' }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return { error: 'Credenciais ausentes.' }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: config.gsc_refresh_token,
        grant_type: 'refresh_token',
      }),
    })
    const tokenData = await tokenRes.json()
    if (tokenData.error) return { error: 'Falha no token do Google.' }

    const reqBody: any = {
      startDate: startDateStr,
      endDate: endDateStr,
      dimensions: ['date']
    }

    if (pageUrl) {
      reqBody.dimensionFilterGroups = [
        {
          filters: [
            {
              dimension: 'page',
              operator: 'equals',
              expression: pageUrl
            }
          ]
        }
      ]
    }

    const encodeUrl = encodeURIComponent(siteUrl)
    const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeUrl}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody)
    })
    
    const data = await res.json()
    if (!res.ok) return { error: data.error?.message || 'Falha na API do GSC.' }

    const rawRows = data.rows || []
    const paddedRows = []
    
    const start = new Date(`${startDateStr}T00:00:00Z`)
    const end = new Date(`${endDateStr}T00:00:00Z`)
    const current = new Date(start)
    
    while (current <= end) {
      const dateString = current.toISOString().split('T')[0]
      const existingRow = rawRows.find((r: any) => r.keys && r.keys[0] === dateString)
      
      if (existingRow) {
        paddedRows.push(existingRow)
      } else {
        paddedRows.push({
          keys: [dateString],
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0
        })
      }
      current.setUTCDate(current.getUTCDate() + 1)
    }

    return { data: paddedRows }
  } catch (err) {
    return { error: 'Erro de rede ao conectar com Google Analytics.' }
  }
  })
}

export async function fetchGscIndexedPages(siteId: string, siteUrl: string, startDateStr: string, endDateStr: string, forceRefresh: boolean = false) {
  const cacheKey = `gsc_indexed_${startDateStr}_${endDateStr}`
  return getWithCache(siteId, cacheKey, 60, forceRefresh, async () => {
    const supabase = await createClient()
    const { data: config } = await supabase.from('configuracoes_agencia').select('gsc_refresh_token').eq('id', 1).single()
    if (!config || !config.gsc_refresh_token) return { error: 'GSC não configurado.' }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) return { error: 'Credenciais ausentes.' }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: config.gsc_refresh_token,
          grant_type: 'refresh_token',
        }),
      })
      const tokenData = await tokenRes.json()
      if (tokenData.error) return { error: 'Falha no token do Google.' }

      const reqBody = {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: ['page'],
        rowLimit: 1000 // Get up to 1000 pages
      }

      const encodeUrl = encodeURIComponent(siteUrl)
      const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeUrl}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      })
      
      const data = await res.json()
      if (!res.ok) return { error: data.error?.message || 'Falha na API do GSC.' }

      return { data: data.rows || [] }
    } catch (err) {
      return { error: 'Erro de rede ao conectar com Google Analytics.' }
    }
  })
}


// --- Novas integrações de GSC Avançado, HTTPS e PageSpeed ---

export async function fetchGscAdvancedAnalytics(siteId: string, siteUrl: string, startDateStr: string, endDateStr: string, dimension: string, forceRefresh: boolean = false) {
  const cacheKey = `gsc_adv_${dimension}_${startDateStr}_${endDateStr}`
  return getWithCache(siteId, cacheKey, 60, forceRefresh, async () => {
    const supabase = await createClient()
    const { data: config } = await supabase.from('configuracoes_agencia').select('gsc_refresh_token').eq('id', 1).single()
    if (!config || !config.gsc_refresh_token) return { error: 'GSC não configurado.' }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) return { error: 'Credenciais ausentes.' }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: config.gsc_refresh_token,
          grant_type: 'refresh_token',
        }),
      })
      const tokenData = await tokenRes.json()
      if (tokenData.error) return { error: 'Falha no token do Google.' }

      const reqBody: any = {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: [dimension],
        rowLimit: 50 // Limit to top 50 for performance
      }

      const encodeUrl = encodeURIComponent(siteUrl)
      const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeUrl}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      })
      
      const data = await res.json()
      if (!res.ok) return { error: data.error?.message || 'Falha na API do GSC.' }

      return { data: data.rows || [] }
    } catch (err) {
      return { error: 'Erro de rede ao conectar com Google Analytics.' }
    }
  })
}

export async function fetchGscTrendingQueries(siteId: string, siteUrl: string, startDateStr: string, endDateStr: string, prevStartDateStr: string, prevEndDateStr: string, forceRefresh: boolean = false) {
  const cacheKey = `gsc_trending_${startDateStr}_${endDateStr}`
  return getWithCache(siteId, cacheKey, 60, forceRefresh, async () => {
    const supabase = await createClient()
    const { data: config } = await supabase.from('configuracoes_agencia').select('gsc_refresh_token').eq('id', 1).single()
    if (!config || !config.gsc_refresh_token) return { error: 'GSC não configurado.' }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) return { error: 'Credenciais ausentes.' }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: config.gsc_refresh_token,
          grant_type: 'refresh_token',
        }),
      })
      const tokenData = await tokenRes.json()
      if (tokenData.error) return { error: 'Falha no token do Google.' }

      const encodeUrl = encodeURIComponent(siteUrl)

      // Fetch current period
      const currRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeUrl}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: startDateStr, endDate: endDateStr, dimensions: ['query'], rowLimit: 100 })
      })
      const currData = await currRes.json()
      if (!currRes.ok) return { error: currData.error?.message || 'Falha na API do GSC.' }

      // Fetch previous period
      const prevRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeUrl}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: prevStartDateStr, endDate: prevEndDateStr, dimensions: ['query'], rowLimit: 200 })
      })
      const prevData = await prevRes.json()
      
      const currentRows = currData.rows || []
      const previousRows = prevData.rows || []

      const results = currentRows.map((curr: any) => {
        const q = curr.keys[0]
        const prev = previousRows.find((p: any) => p.keys[0] === q)
        const prevClicks = prev ? prev.clicks : 0
        const diff = curr.clicks - prevClicks
        const percent = prevClicks > 0 ? (diff / prevClicks) * 100 : 100
        
        return {
          query: q,
          clicks: curr.clicks,
          prevClicks,
          diff,
          percent: percent > 999 ? 999 : percent
        }
      })

      // Sort by diff for "Em alta"
      const trendingUp = [...results].filter(r => r.diff > 0).sort((a, b) => b.diff - a.diff).slice(0, 10)
      // Sort by diff ascending for "Em baixa"
      const trendingDown = [...results].filter(r => r.diff < 0).sort((a, b) => a.diff - b.diff).slice(0, 10)
      // Sort by total clicks for "Superior"
      const top = [...results].sort((a, b) => b.clicks - a.clicks).slice(0, 10)

      return { 
        data: { top, trendingUp, trendingDown }
      }
    } catch (err) {
      return { error: 'Erro de rede ao buscar Insights GSC.' }
    }
  })
}

export async function checkHttpsStatus(url: string) {
  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`
    // A simple fetch can verify if HTTPS is working and certificate is valid (Node fetch will throw on invalid SSL)
    const res = await fetch(formattedUrl, { method: 'HEAD', redirect: 'follow' })
    if (res.ok) {
      return { success: true, secure: res.url.startsWith('https://') }
    }
    return { success: false, error: 'O servidor retornou um erro.' }
  } catch (error: any) {
    // If it's a fetch error related to SSL (e.g. CERT_HAS_EXPIRED)
    if (error.cause && error.cause.code && error.cause.code.includes('CERT')) {
       return { success: true, secure: false, error: 'Certificado inválido ou expirado.' }
    }
    return { success: false, error: 'Não foi possível acessar o site.' }
  }
}

export async function runPageSpeedInsights(url: string) {
  const supabase = await createClient()
  const { data: config } = await supabase.from('configuracoes_agencia').select('pagespeed_api_key').eq('id', 1).single()
  const apiKey = config?.pagespeed_api_key?.trim()

  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES${apiKey ? '&key=' + apiKey : ''}`
    
    // We fetch for mobile strategy by default
    const mobileRes = await fetch(`${apiUrl}&strategy=mobile`)
    const mobileData = await mobileRes.json()
    
    if (mobileData.error) {
      let msg = mobileData.error.message
      if (msg.includes('Quota exceeded')) {
        msg = 'O limite diário de verificações de velocidade da API do Google foi excedido. Tente novamente mais tarde ou adicione uma chave de API própria nas configurações.'
      }
      return { error: msg }
    }

    const desktopRes = await fetch(`${apiUrl}&strategy=desktop`)
    const desktopData = await desktopRes.json()

    if (desktopData.error) {
      let msg = desktopData.error.message
      if (msg.includes('Quota exceeded')) {
        msg = 'O limite diário de verificações de velocidade da API do Google foi excedido. Tente novamente mais tarde ou adicione uma chave de API própria nas configurações.'
      }
      return { error: msg }
    }

    return { 
      success: true, 
      mobile: mobileData.lighthouseResult,
      desktop: desktopData.lighthouseResult 
    }
  } catch (error) {
    return { error: 'Falha ao executar PageSpeed Insights.' }
  }
}

// --- Integração WordPress ---

export async function saveWordPressIntegration(siteId: string, formData: FormData) {
  const supabase = await createClient()
  const siteUrl = formData.get('site_url') as string
  const username = formData.get('username') as string
  const appPassword = formData.get('app_password') as string

  if (!siteUrl || !username || !appPassword) return { error: 'Todos os campos são obrigatórios.' }

  // Clean URL
  const cleanUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl
  const formattedUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`

  try {
    // Test connection
    const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
    const res = await fetch(`${formattedUrl}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': authHeader }
    })
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'Usuário ou senha de aplicativo incorretos.' }
      }
      return { error: 'Falha ao conectar com o WordPress. Verifique a URL.' }
    }
    
    // Save
    const { data: existing } = await supabase.from('integracoes_wordpress').select('id').eq('site_id', siteId).maybeSingle()
    
    if (existing) {
      const { error } = await supabase.from('integracoes_wordpress')
        .update({ site_url: formattedUrl, username, app_password: appPassword, conectado_em: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) return { error: 'Erro ao atualizar integração do WordPress.' }
    } else {
      const { error } = await supabase.from('integracoes_wordpress')
        .insert({ site_id: siteId, site_url: formattedUrl, username, app_password: appPassword })
      if (error) return { error: 'Erro ao criar integração do WordPress.' }
    }
    
    revalidatePath(`/dashboard/sites/${siteId}`)
    return { success: true }
  } catch (err) {
    return { error: 'Não foi possível conectar ao site. Verifique a URL e se o site está acessível.' }
  }
}

export async function fetchWpStatus(siteUrl: string, username: string, appPassword: string) {
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  try {
    const res = await fetch(`${siteUrl}/wp-json/site-manager/v1/status`, {
      headers: { 'Authorization': authHeader },
      next: { revalidate: 60 } // cache 1 minute
    })
    if (!res.ok) return { error: 'mu-plugin não encontrado ou erro na API', status: res.status }
    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    return { error: 'Falha de rede ao buscar status' }
  }
}

export async function fetchWpPosts(siteId: string, siteUrl: string, username: string, appPassword: string, forceRefresh: boolean = false) {
  const cacheKey = `wp_posts`
  return getWithCache(siteId, cacheKey, 15, forceRefresh, async () => {
    const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
    try {
      // Disparar o cron do WP para garantir que posts agendados atrasados sejam publicados
      fetch(`${siteUrl}/wp-cron.php?doing_wp_cron`, { method: 'GET' }).catch(() => {})

      const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts?status=publish,future,draft&per_page=20&_embed=true`, {
        headers: { 'Authorization': authHeader },
        cache: 'no-store'
      })
      if (!res.ok) return { error: 'Falha ao buscar posts', status: res.status }
      const data = await res.json()
      return { success: true, data }
    } catch (error) {
      return { error: 'Falha de rede ao buscar posts' }
    }
  })
}

export async function createWpPost(siteUrl: string, username: string, appPassword: string, postData: any) {
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  try {
    const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
    
    if (!res.ok) {
      const err = await res.json()
      return { error: err.message || 'Falha ao criar post' }
    }
    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    return { error: 'Falha de rede ao criar post' }
  }
}

export async function deleteWpPost(siteUrl: string, username: string, appPassword: string, postId: number) {
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  try {
    const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${postId}?force=true`, {
      method: 'DELETE',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    })
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { error: err.message || 'Falha ao excluir post no WordPress' }
    }
    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    return { error: 'Falha de rede ao excluir post' }
  }
}

export async function fetchWpHistory(siteId: string, siteUrl: string, username: string, appPassword: string, forceRefresh: boolean = false) {
  const cacheKey = `wp_history`
  return getWithCache(siteId, cacheKey, 15, forceRefresh, async () => {
    const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
    try {
      const res = await fetch(`${siteUrl}/wp-json/simple-history/v1/events?per_page=20`, {
        headers: { 'Authorization': authHeader },
        cache: 'no-store'
      })
      if (!res.ok) return { error: 'Simple History não encontrado ou erro na API', status: res.status }
      const data = await res.json()
      return { success: true, data }
    } catch (error) {
      return { error: 'Falha de rede ao buscar histórico' }
    }
  })
}

export async function fetchWpWordfenceData(siteId: string, siteUrl: string, username: string, appPassword: string, forceRefresh: boolean = false) {
  const cacheKey = `wp_wordfence`
  return getWithCache(siteId, cacheKey, 15, forceRefresh, async () => {
    const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
    try {
      const res = await fetch(`${siteUrl}/wp-json/crm-api/v1/wordfence`, {
        headers: { 'Authorization': authHeader },
        cache: 'no-store'
      })
      if (!res.ok) return { error: 'Wordfence endpoint não encontrado ou erro na API', status: res.status }
      const data = await res.json()
      return { success: true, data }
    } catch (error) {
      return { error: 'Falha de rede ao buscar Wordfence' }
    }
  })
}

export async function uploadWpMedia(siteUrl: string, username: string, appPassword: string, formData: FormData) {
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Nenhum arquivo de imagem válido enviado.' }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const res = await fetch(`${siteUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Type': file.type || 'image/jpeg',
      },
      body: buffer
    })

    if (!res.ok) {
      const err = await res.json()
      return { error: err.message || 'Falha ao enviar imagem para o WordPress.' }
    }

    const data = await res.json()
    return { success: true, mediaId: data.id, mediaUrl: data.source_url }
  } catch (error) {
    return { error: 'Erro de rede ao enviar mídia.' }
  }
}

export async function updateWpPost(siteUrl: string, username: string, appPassword: string, postId: number | string, postData: any) {
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  try {
    const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${postId}`, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
    
    if (!res.ok) {
      const err = await res.json()
      return { error: err.message || 'Falha ao atualizar post' }
    }
    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    return { error: 'Falha de rede ao atualizar post' }
  }
}

