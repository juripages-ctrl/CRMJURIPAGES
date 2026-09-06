export type PlanTier = 'essencial' | 'profissional' | 'premium' | 'none'
export type AccessReason = 'ok' | 'plan_upgrade_required' | 'payment_pending'

export interface PlanPermissions {
  hasBlogAccess: boolean
  hasSeoAccess: boolean
  reason: AccessReason
  tier: PlanTier
  label: string
  monthlyLimit: number
  isPendingOrOverdue: boolean
}

export function getBlogPlanPermissions(site: any): PlanPermissions {
  if (!site) {
    return {
      hasBlogAccess: false,
      hasSeoAccess: false,
      reason: 'plan_upgrade_required',
      tier: 'none',
      label: 'Nenhum Plano',
      monthlyLimit: 0,
      isPendingOrOverdue: false,
    }
  }

  // 1. Determine Payment Status (Inadimplente/Atrasado/Pendente)
  const paymentStatus = (
    site.status_pagamento || 
    site.clientes?.status_pagamento || 
    site.clientes?.assinaturas?.[0]?.pagamentos?.[0]?.status || 
    site.assinaturas?.[0]?.status ||
    ''
  ).toLowerCase()

  const siteStatus = (site.status || '').toLowerCase()

  const isPendingOrOverdue = 
    paymentStatus === 'atrasado' || 
    paymentStatus === 'pendente' || 
    paymentStatus === 'em_atraso' || 
    paymentStatus === 'inadimplente' ||
    paymentStatus === 'past_due' ||
    paymentStatus === 'unpaid' ||
    paymentStatus === 'canceled' ||
    siteStatus === 'suspenso' ||
    siteStatus === 'inadimplente'

  if (isPendingOrOverdue) {
    return {
      hasBlogAccess: false,
      hasSeoAccess: false,
      reason: 'payment_pending',
      tier: 'none',
      label: 'Pagamento Pendente / Em Atraso',
      monthlyLimit: 0,
      isPendingOrOverdue: true,
    }
  }

  // 2. Extrair features do plano
  const plano = site.planoObj || site.clientes?.assinaturas?.[0]?.planos || site.assinaturas?.[0]?.planos
  const rawPlanoName = (site.plano || plano?.nome || '').toLowerCase().trim()
  
  let parsedFeatures: string[] = []
  if (plano && plano.features) {
    if (typeof plano.features === 'string') {
      try { parsedFeatures = JSON.parse(plano.features) } catch { }
    } else if (Array.isArray(plano.features)) {
      parsedFeatures = plano.features
    }
  }

  // Por retrocompatibilidade, se for premium/pro, garantimos o acesso
  const legacyBlog = rawPlanoName.includes('premium') || rawPlanoName.includes('profissional') || rawPlanoName.includes('pro')
  const legacySeo = rawPlanoName.includes('premium') || rawPlanoName.includes('profissional') || rawPlanoName.includes('pro')

  const hasBlogAccess = parsedFeatures.includes('gerenciamento_blog') || legacyBlog
  const hasSeoAccess = parsedFeatures.includes('gerenciamento_seo') || legacySeo

  let tier: PlanTier = 'essencial'
  let monthlyLimit = 0

  if (rawPlanoName.includes('premium')) {
    tier = 'premium'
    monthlyLimit = Infinity
  } else if (rawPlanoName.includes('profissional') || rawPlanoName.includes('pro')) {
    tier = 'profissional'
    monthlyLimit = 6
  }

  return {
    hasBlogAccess,
    hasSeoAccess,
    reason: (hasBlogAccess || hasSeoAccess) ? 'ok' : 'plan_upgrade_required',
    tier,
    label: plano?.nome || rawPlanoName || 'Plano Básico',
    monthlyLimit,
    isPendingOrOverdue: false,
  }
}
