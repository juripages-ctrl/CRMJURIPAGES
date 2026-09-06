'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (password !== confirmPassword) {
    redirect('/atualizar-senha?error=As senhas não coincidem.')
  }
  
  if (password.length < 6) {
    redirect('/atualizar-senha?error=A senha deve ter pelo menos 6 caracteres.')
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('Update Password Error:', error.message)
    redirect(`/atualizar-senha?error=${encodeURIComponent('Erro ao atualizar senha: ' + error.message)}`)
  }

  // Se sucesso, vamos para o dashboard e forçamos o refresh do layout
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
