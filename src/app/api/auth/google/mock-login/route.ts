import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')

  if (!siteId) {
    return NextResponse.json({ error: 'Missing siteId' }, { status: 400 })
  }

  // Isso é um MOCK! Na vida real, o botão redirecionaria para accounts.google.com/o/oauth2/v2/auth
  // e o Google redirecionaria de volta para este callback com um "code" que trocaríamos pelo access_token.
  
  const supabase = await createClient()
  
  // Simular salvamento de token fake na tabela integracoes_google
  const { error } = await supabase.from('integracoes_google').insert({
    site_id: siteId,
    access_token: 'mock_google_access_token_123',
    refresh_token: 'mock_google_refresh_token_456',
    propriedade_search_console: 'sc-domain:mocked-domain.com'
  })

  if (error) {
    console.error('Mock Google OAuth Error:', error)
    return NextResponse.redirect(new URL(`/dashboard/sites/${siteId}?error=oauth_failed`, request.url))
  }

  // Redireciona de volta para a tela do site
  return NextResponse.redirect(new URL(`/dashboard/sites/${siteId}?success=gsc_connected`, request.url))
}
