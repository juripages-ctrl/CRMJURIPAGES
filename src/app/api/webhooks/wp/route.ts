import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Configuração do banco de dados ausente' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const authHeader = req.headers.get('authorization')
    // Uma validação básica de segurança (você pode gerar um token único ou usar o do próprio Supabase)
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET || 'crm_wp_secret_123'}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { site_id, event, title, message, link } = body

    if (!site_id || !event || !title || !message) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    // 1. Encontrar o cliente dono deste site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('cliente_id')
      .eq('id', site_id)
      .single()

    if (siteError || !site || !site.cliente_id) {
      return NextResponse.json({ error: 'Site não encontrado ou sem cliente vinculado' }, { status: 404 })
    }

    // 2. Encontrar os usuários (clientes) vinculados a este cliente_id
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id')
      .eq('cliente_id', site.cliente_id)

    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ success: true, message: 'Nenhum usuário para notificar' })
    }

    // 3. Determinar o tipo de notificação
    let tipo = 'geral'
    if (event === 'post_published' || event === 'post_scheduled') {
      tipo = 'blog'
    } else if (event === 'wordfence_alert' || event === 'simple_history_alert') {
      tipo = 'wordpress'
    }

    // 4. Inserir notificações para cada usuário
    const notifs = usuarios.map(u => ({
      usuario_id: u.id,
      titulo: title,
      mensagem: message,
      tipo: tipo,
      link: link || `/dashboard/sites/${site_id}?tab=${tipo === 'blog' ? 'blog' : 'analytics'}`
    }))

    const { error: insertError } = await supabase.from('notificacoes').insert(notifs)

    if (insertError) {
      console.error('Erro ao inserir notificações (Webhook):', insertError)
      return NextResponse.json({ error: 'Falha ao salvar notificações' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
