import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/configuracoes?error=NoCode', request.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/dashboard/configuracoes?error=MissingEnv', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const data = await tokenRes.json()

    if (data.error) {
      console.error('Google OAuth Error:', data)
      return NextResponse.redirect(new URL('/dashboard/configuracoes?error=GoogleOAuthError', request.url))
    }

    const refreshToken = data.refresh_token

    if (!refreshToken) {
      // If we don't get a refresh token, it means the user already authorized the app before.
      // We need to prompt consent again, or we can just hope we already have it saved.
      // But we forced prompt=consent, so we should get it unless the user revoked it in a weird way.
      console.warn('No refresh token received from Google')
    }

    // Save refresh token to our database
    const supabase = await createClient()
    
    // Only update if we received a new refresh token (if user re-authenticates without prompt=consent, they might not get one)
    if (refreshToken) {
      await supabase.from('configuracoes_agencia')
        .update({ gsc_refresh_token: refreshToken, atualizado_em: new Date() })
        .eq('id', 1)
    }

    return NextResponse.redirect(new URL('/dashboard/configuracoes?success=google_connected', request.url))

  } catch (error) {
    console.error('Error exchanging Google code:', error)
    return NextResponse.redirect(new URL('/dashboard/configuracoes?error=ServerError', request.url))
  }
}
