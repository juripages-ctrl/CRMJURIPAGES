'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  if (!email) {
    redirect('/recuperar-senha?error=Email é obrigatório')
  }

  // Obter a URL de origem para garantir que o callback retorne para o ambiente correto
  const originList = await headers()
  const origin = originList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/atualizar-senha`,
  })

  if (error) {
    console.error('Reset Password Error:', error.message)
    redirect(`/recuperar-senha?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/recuperar-senha?message=' + encodeURIComponent('E-mail enviado! Verifique sua caixa de entrada e clique no link recebido.'))
}
