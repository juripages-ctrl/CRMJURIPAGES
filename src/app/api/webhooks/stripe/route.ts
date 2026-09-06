import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey || !endpointSecret) {
    return new Response('Configuração ausente no backend', { status: 200 })
  }

  // Cria o cliente Supabase com a Service Role Key para poder atualizar dados via backend (ignora RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any })

  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clienteId = session.metadata?.cliente_id;
        const planoId = session.metadata?.plano_id;
        const subscriptionId = session.subscription as string;

        if (clienteId && planoId && subscriptionId) {
          // Cria ou atualiza a assinatura
          await supabase.from('assinaturas').insert({
            cliente_id: clienteId,
            plano_id: planoId,
            gateway: 'stripe',
            gateway_subscription_id: subscriptionId,
            status: 'active'
          });
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status; // 'active', 'past_due', 'canceled', etc
        
        await supabase
          .from('assinaturas')
          .update({ status: status })
          .eq('gateway_subscription_id', subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  } catch (err: any) {
    console.error(`Erro ao processar Webhook do Stripe: ${err.message}`)
    return new Response('Webhook handler falhou', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
