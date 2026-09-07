'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login Error:', error.message)
    let errorMessage = 'Ocorreu um erro ao tentar entrar.'
    if (error.message === 'Invalid login credentials') {
      errorMessage = 'E-mail ou senha incorretos.'
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Por favor, confirme seu e-mail antes de entrar.'
    }
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  const nome = formData.get('nome') as string

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        full_name: nome,
      },
    },
  })

  if (error) {
    console.error('Signup Error:', error.message)
    let errorMessage = 'Ocorreu um erro ao criar a conta.'
    if (error.message.includes('Password should be at least 6 characters')) {
      errorMessage = 'A senha deve ter no mínimo 6 caracteres.'
    } else if (error.message.includes('User already registered')) {
      errorMessage = 'Este e-mail já está cadastrado.'
    } else {
      errorMessage = error.message // Fallback for other errors
    }
    redirect(`/cadastro?error=${encodeURIComponent(errorMessage)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
