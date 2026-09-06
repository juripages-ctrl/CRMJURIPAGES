'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSubscription(clienteId: string, planoId: string) {
  const supabase = await createClient()
  
  // Create Assinatura
  const { data: assinatura, error: assError } = await supabase
    .from('assinaturas')
    .insert({
      cliente_id: clienteId,
      plano_id: planoId,
      gateway: 'asaas',
      status: 'ativa',
      proxima_cobranca: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
    })
    .select()
    .single()

  if (assError) return { error: 'Erro ao criar assinatura: ' + assError.message }

  // Get plano price
  const { data: plano } = await supabase.from('planos').select('valor').eq('id', planoId).single()

  // Gerar a primeira Fatura (Pagamento pendente) mockando o Asaas
  const { error: pgError } = await supabase
    .from('pagamentos')
    .insert({
      assinatura_id: assinatura.id,
      valor: plano?.valor || 0,
      status: 'pendente',
      metodo: 'pix' // default
    })

  if (pgError) return { error: 'Erro ao gerar primeira fatura.' }

  revalidatePath(`/dashboard/clientes/${clienteId}`)
  return { success: true }
}

export async function mockPayInvoice(pagamentoId: string, currentPath: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pagamentos')
    .update({ status: 'pago' })
    .eq('id', pagamentoId)

  if (error) return { error: 'Erro ao processar pagamento.' }
  
  revalidatePath(currentPath)
  return { success: true }
}
