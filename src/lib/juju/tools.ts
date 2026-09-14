// src/lib/juju/tools.ts

import { chatWithJuju, ChatMessage } from './gemini';
import { AreaDireito, getSystemPrompt } from './prompts';

// ---------------------------------------------------------------------------
// 1. extrair_nicho_juridico
// ---------------------------------------------------------------------------
export async function extrairNichoJuridico(textoCliente: string) {
  const schema = {
    type: "object",
    properties: {
      area_direito: { type: "string" },
      subnicho: { type: "string" },
      objetivo_declarado_cliente: { type: "string" },
      publico_provavel: { type: "string" },
      palavras_chave_relacionadas: {
        type: "array",
        items: { type: "string" }
      }
    },
    required: ["area_direito", "subnicho", "objetivo_declarado_cliente", "publico_provavel", "palavras_chave_relacionadas"]
  };

  const messages: ChatMessage[] = [{ role: 'user', text: textoCliente }];
  const systemInstruction = "Você é um assistente que extrai informações de solicitações de blog jurídico. Sempre classifique a área do direito entre: trabalhista, penal, tributario, civil, previdenciario, consumidor, empresarial, imobiliario, digital ou generico. Sempre sugira 3 a 5 palavras-chave focadas em SEO.";

  const response = await chatWithJuju(messages, systemInstruction, schema);
  
  if (response.error || !response.text) {
    throw new Error(response.error || 'Falha ao extrair nicho.');
  }

  return JSON.parse(response.text);
}

// ---------------------------------------------------------------------------
// 2. get_seo_keyword_suggestions
// ---------------------------------------------------------------------------
// Requer o cliente do Supabase instanciado (server-side)
export async function getSeoKeywordSuggestions(supabase: any, siteId: string) {
  // 1. Busca a integração com o Google
  const { data: integracao } = await supabase
    .from('integracoes_google')
    .select('access_token, refresh_token, propriedade_search_console')
    .eq('site_id', siteId)
    .single();

  if (!integracao) {
    return { error: 'gsc_nao_conectado' };
  }

  // OBS: Aqui entra a chamada real à API do Google Search Console.
  // Utilizaremos dados mockados para estruturação inicial, 
  // simulando termos encontrados nas posições 5-15.
  return [
    {
      query: "estabilidade acidentária quanto tempo",
      posicao_media: 8.2,
      impressoes: 340,
      ctr: 0.021,
      tema_sugerido: "Estabilidade acidentária: por quanto tempo o trabalhador tem direito?"
    },
    {
      query: "como fazer acordo de sócios",
      posicao_media: 11.5,
      impressoes: 210,
      ctr: 0.015,
      tema_sugerido: "Acordo de Sócios: O que não pode faltar no seu contrato?"
    }
  ];
}

// ---------------------------------------------------------------------------
// 3. get_wordpress_categories
// ---------------------------------------------------------------------------
export async function getWordpressCategories(supabase: any, siteId: string) {
  // 1. Checa cache
  const cacheKey = `wp_categories:${siteId}`;
  const { data: cache } = await supabase
    .from('api_cache')
    .select('data')
    .eq('site_id', siteId)
    .eq('cache_key', cacheKey)
    .single();

  if (cache && cache.data) {
    return cache.data;
  }

  // 2. Busca credenciais
  const { data: wp } = await supabase
    .from('integracoes_wordpress')
    .select('site_url, username, app_password')
    .eq('site_id', siteId)
    .single();

  if (!wp) return { error: 'wp_nao_conectado' };

  try {
    const auth = Buffer.from(`${wp.username}:${wp.app_password}`).toString('base64');
    const res = await fetch(`${wp.site_url}/wp-json/wp/v2/categories`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (!res.ok) return { error: 'wp_auth_failed' };
    
    const categories = await res.json();
    const result = categories.map((c: any) => ({ id: c.id, nome: c.name, slug: c.slug }));

    // 3. Salva no cache
    await supabase.from('api_cache').insert({
      site_id: siteId,
      cache_key: cacheKey,
      data: result
    });

    return result;
  } catch (error) {
    return { error: 'wp_connection_error' };
  }
}

// ---------------------------------------------------------------------------
// 4. gerar_titulo_e_conteudo
// ---------------------------------------------------------------------------
export async function gerarTituloEConteudo(
  contextoColetado: any, 
  areaDireito: AreaDireito, 
  palavraChavePrincipal: string
) {
  const promptSistema = getSystemPrompt(areaDireito, palavraChavePrincipal);
  const mensagemUsuario = `Escreva o conteúdo completo sobre o tema: ${contextoColetado.subnicho}. 
  Objetivo: ${contextoColetado.objetivo_declarado_cliente}. 
  Público: ${contextoColetado.publico_provavel}. 
  Escreva em texto puro, com parágrafos bem espaçados. NÃO use nenhum caractere de formatação Markdown como "*", "**" ou "#". Use letras MAIÚSCULAS para os intertítulos ao invés de hashtags.
  
  MUITO IMPORTANTE: Retorne APENAS o artigo. NÃO inclua saudações, despedidas, ou comentários como "Aqui está o texto" ou "Olá, sou a Juju". O seu output deve ser estritamente o conteúdo do post.`;

  const messages: ChatMessage[] = [{ role: 'user', text: mensagemUsuario }];
  
  const response = await chatWithJuju(messages, promptSistema);
  
  if (response.error || !response.text) {
    throw new Error(response.error || 'Falha ao gerar o conteúdo. Por favor, tente novamente.');
  }
  
  return response.text;
}

// ---------------------------------------------------------------------------
// 5. verificar_palavra_chave (Checagem Determinística)
// ---------------------------------------------------------------------------
export function verificarPalavraChave(conteudoMarkdown: string, palavraChave: string): boolean {
  if (!conteudoMarkdown) return false;
  
  const conteudoLower = conteudoMarkdown.toLowerCase();
  const keywordLower = palavraChave.toLowerCase();

  // 1. Checa no Título (H1 ou início do texto)
  const primeiraLinha = conteudoLower.split('\\n')[0] || '';
  const tituloOk = primeiraLinha.includes(keywordLower);

  // 2. Checa em pelo menos um H2 (##)
  const temH2 = conteudoLower.split('\\n').some(linha => linha.startsWith('##') && linha.includes(keywordLower));

  // 3. Checa no corpo geral (primeiro parágrafo geralmente está nas primeiras linhas após o H1)
  const temNoCorpo = conteudoLower.indexOf(keywordLower, primeiraLinha.length) > -1;

  return tituloOk && (temH2 || temNoCorpo);
}

// ---------------------------------------------------------------------------
// 6. search_stock_image (Pexels / Unsplash)
// ---------------------------------------------------------------------------
export async function searchStockImage(termoNicho: string, areaDireito: string) {
  const query = `${termoNicho} ${areaDireito} professional realistic corporate photography, natural lighting, documentary style, no illustration, no cartoon`;
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!pexelsKey) return [];

  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`, {
      headers: { 'Authorization': pexelsKey }
    });

    if (!res.ok) return [];
    const data = await res.json();

    return data.photos.map((p: any) => ({
      url: p.src.large,
      thumbnail_url: p.src.medium,
      credito: p.photographer,
      fonte: 'pexels'
    }));
  } catch (err) {
    console.error('Erro na busca de imagens:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 7. get_wordpress_tags
// ---------------------------------------------------------------------------
export async function getWordpressTags(supabase: any, siteId: string) {
  const cacheKey = `wp_tags:${siteId}`;
  const { data: cache } = await supabase.from('api_cache').select('data').eq('site_id', siteId).eq('cache_key', cacheKey).single();
  if (cache && cache.data) return cache.data;

  const { data: wp } = await supabase.from('integracoes_wordpress').select('site_url, username, app_password').eq('site_id', siteId).single();
  if (!wp) return { error: 'wp_nao_conectado' };

  try {
    const auth = Buffer.from(`${wp.username}:${wp.app_password}`).toString('base64');
    const res = await fetch(`${wp.site_url}/wp-json/wp/v2/tags?per_page=100`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    if (!res.ok) return { error: 'wp_auth_failed' };
    
    const tags = await res.json();
    const result = tags.map((t: any) => ({ id: t.id, nome: t.name, slug: t.slug }));

    await supabase.from('api_cache').upsert({
      site_id: siteId,
      cache_key: cacheKey,
      data: result,
      updated_at: new Date().toISOString()
    });
    return result;
  } catch (e) {
    return { error: 'wp_api_error' };
  }
}

// ---------------------------------------------------------------------------
// 8. get_wordpress_authors
// ---------------------------------------------------------------------------
export async function getWordpressAuthors(supabase: any, siteId: string) {
  const cacheKey = `wp_authors:${siteId}`;
  const { data: cache } = await supabase.from('api_cache').select('data').eq('site_id', siteId).eq('cache_key', cacheKey).single();
  if (cache && cache.data) return cache.data;

  const { data: wp } = await supabase.from('integracoes_wordpress').select('site_url, username, app_password').eq('site_id', siteId).single();
  if (!wp) return { error: 'wp_nao_conectado' };

  try {
    const auth = Buffer.from(`${wp.username}:${wp.app_password}`).toString('base64');
    const res = await fetch(`${wp.site_url}/wp-json/wp/v2/users`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    if (!res.ok) return { error: 'wp_auth_failed' };
    
    const users = await res.json();
    const result = users.map((u: any) => ({ id: u.id, nome: u.name }));

    await supabase.from('api_cache').upsert({
      site_id: siteId,
      cache_key: cacheKey,
      data: result,
      updated_at: new Date().toISOString()
    });
    return result;
  } catch (e) {
    return { error: 'wp_api_error' };
  }
}

