import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`

  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID não configurado no servidor.' }, { status: 500 })
  }

  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', scopes)
  authUrl.searchParams.append('access_type', 'offline')
  authUrl.searchParams.append('prompt', 'consent') // Force consent to ensure we get a refresh token

  return NextResponse.redirect(authUrl.toString())
}
