'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any }) 
  : null;

export async function clientSubscribeToPlan(planoId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('usuarios').select('cliente_id, stripe_customer_id, email, nome').eq('id', user.id).single()
  if (!profile?.cliente_id) return { error: 'Cliente não encontrado' }

  const { data: plano } = await supabase.from('planos').select('*').eq('id', planoId).single()
  if (!plano) return { error: 'Plano não encontrado' }

  if (stripe && plano.stripe_price_id) {
    try {
      let stripeCustomerId = profile.stripe_customer_id
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: profile.email,
          name: profile.nome,
          metadata: {
            cliente_id: profile.cliente_id,
            usuario_id: user.id
          }
        })
        stripeCustomerId = customer.id
        await supabase.from('clientes').update({ stripe_customer_id: customer.id }).eq('id', profile.cliente_id)
        await supabase.from('usuarios').update({ stripe_customer_id: customer.id }).eq('id', user.id)
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: plano.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: plano.periodicidade === 'unico' ? 'payment' : 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/financeiro?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/financeiro?canceled=true`,
        metadata: {
          cliente_id: profile.cliente_id,
          plano_id: plano.id
        }
      })

      return { url: session.url }
    } catch (e: any) {
      console.error('Erro no Checkout do Stripe:', e)
      return { error: 'Falha ao iniciar pagamento: ' + e.message }
    }
  }

  // Fallback (Sem Stripe configurado)
  const { data: assinatura, error: assError } = await supabase
    .from('assinaturas')
    .insert({
      cliente_id: profile.cliente_id,
      plano_id: planoId,
      gateway: 'local',
      status: 'ativa',
      proxima_cobranca: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
    })
    .select()
    .single()

  if (assError) return { error: 'Erro ao criar assinatura: ' + assError.message }

  const { error: pgError } = await supabase
    .from('pagamentos')
    .insert({
      assinatura_id: assinatura.id,
      valor: plano?.valor || 0,
      status: 'pendente',
      metodo: 'pix'
    })

  if (pgError) return { error: 'Erro ao gerar fatura.' }

  revalidatePath('/dashboard/financeiro')
  return { success: true }
}

export async function createCustomerPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase.from('usuarios').select('stripe_customer_id').eq('id', user.id).single()
  
  if (!stripe || !profile?.stripe_customer_id) {
    return { error: 'Portal do cliente não disponível no momento.' }
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/financeiro`,
    })
    return { url: session.url }
  } catch (e: any) {
    return { error: 'Erro ao abrir o portal de faturas: ' + e.message }
  }
}
