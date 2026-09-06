'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any }) 
  : null;

export async function updatePlano(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const nome = formData.get('nome') as string
  const valor = parseFloat(formData.get('valor') as string)
  const limiteSites = parseInt(formData.get('limite_sites') as string)
  
  // Recursors normally comes as a string of JSON array or comma separated
  const recursosStr = formData.get('recursos') as string
  let recursos: string[] = []
  if (recursosStr) {
    recursos = recursosStr.split('\n').map(r => r.trim()).filter(r => r.length > 0)
  }

  const featureSeo = formData.get('feature_seo') === 'on'
  const featureBlog = formData.get('feature_blog') === 'on'
  const features: string[] = []
  if (featureSeo) features.push('gerenciamento_seo')
  if (featureBlog) features.push('gerenciamento_blog')

  const { error } = await supabase
    .from('planos')
    .update({
      nome,
      valor,
      limite_sites: limiteSites,
      recursos: JSON.stringify(recursos),
      features: JSON.stringify(features)
    })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar plano:', error)
    return { error: 'Erro ao atualizar o plano.' }
  }

  revalidatePath('/dashboard/planos')
  return { success: true }
}

export async function createPlano(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const nome = formData.get('nome') as string
  const valor = parseFloat(formData.get('valor') as string)
  const periodicidade = formData.get('periodicidade') as string || 'mensal'
  const limiteSites = parseInt(formData.get('limite_sites') as string)
  
  const recursosStr = formData.get('recursos') as string
  let recursos: string[] = []
  if (recursosStr) {
    recursos = recursosStr.split('\n').map(r => r.trim()).filter(r => r.length > 0)
  }

  const featureSeo = formData.get('feature_seo') === 'on'
  const featureBlog = formData.get('feature_blog') === 'on'
  const features: string[] = []
  if (featureSeo) features.push('gerenciamento_seo')
  if (featureBlog) features.push('gerenciamento_blog')

  let stripeProductId = null
  let stripePriceId = null

  if (stripe) {
    try {
      const product = await stripe.products.create({
        name: nome,
        description: 'Plano criado pelo CRM',
      })
      stripeProductId = product.id

      // Converter valor para centavos
      const interval = periodicidade === 'anual' ? 'year' : 'month'
      
      if (periodicidade !== 'unico') {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(valor * 100),
          currency: 'brl',
          recurring: { interval: interval }
        })
        stripePriceId = price.id
      } else {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(valor * 100),
          currency: 'brl',
        })
        stripePriceId = price.id
      }
    } catch (e: any) {
      console.error('Erro no Stripe:', e)
      return { error: 'Erro ao criar plano no Stripe: ' + e.message }
    }
  }

  const { error } = await supabase
    .from('planos')
    .insert({
      nome,
      valor,
      periodicidade,
      limite_sites: limiteSites,
      recursos: JSON.stringify(recursos),
      features: JSON.stringify(features),
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      ativo: true
    })

  if (error) {
    console.error('Erro ao criar plano:', error)
    return { error: 'Erro ao criar o plano.' }
  }

  revalidatePath('/dashboard/planos')
  return { success: true }
}

export async function desvincularAssinatura(assinaturaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // Hard delete a assinatura. 
  // Nota: Num sistema financeiro real, você faria um "update status = cancelada"
  const { error } = await supabase
    .from('assinaturas')
    .delete()
    .eq('id', assinaturaId)

  if (error) {
    console.error('Erro ao desvincular:', error)
    return { error: 'Não foi possível desvincular o cliente. Pode haver pagamentos vinculados.' }
  }

  revalidatePath('/dashboard/planos')
  return { success: true }
}

export async function concederIsencao(assinaturaId: string, isento: boolean, dataFim?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { error } = await supabase
    .from('assinaturas')
    .update({
      isento_pagamento: isento,
      isencao_fim: isento && dataFim ? dataFim : null
    })
    .eq('id', assinaturaId)

  if (error) {
    console.error('Erro ao conceder isenção:', error)
    return { error: 'Não foi possível configurar a isenção.' }
  }

  revalidatePath('/dashboard/planos')
  return { success: true }
}
