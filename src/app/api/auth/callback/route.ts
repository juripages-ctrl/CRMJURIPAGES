import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next é a página para onde queremos redirecionar após o login bem-sucedido
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalhost = process.env.NODE_ENV === 'development'
      
      // Construir o redirecionamento
      if (isLocalhost) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('Error exchanging code for session:', error.message)
    }
  }

  // Se der erro ou faltar código, redireciona para login com mensagem de erro
  return NextResponse.redirect(`${origin}/login?error=O%20link%20de%20recupera%C3%A7%C3%A3o%20expirou%20ou%20%C3%A9%20inv%C3%A1lido.`)
}
