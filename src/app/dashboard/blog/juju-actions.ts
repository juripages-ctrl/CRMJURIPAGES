'use server';

import { createClient } from '@/utils/supabase/server'; // Assumindo estrutura padrão de projeto Next.js Supabase
import { extrairNichoJuridico, gerarTituloEConteudo, getWordpressCategories, getWordpressTags, getWordpressAuthors, searchStockImage, getSeoKeywordSuggestions } from '@/lib/juju/tools';
import { MENSAGENS_PADRAO } from '@/lib/juju/prompts';
import { createWpCategory, createWpTag } from '@/app/dashboard/sites/integrations-actions';

// Interfaces
interface RoteiroContexto {
  fase: number;
  temaLivre?: string;
  nichoExtraido?: any;
  categoriaId?: number;
  tagsIds?: number[];
  autorId?: number;
  palavraChavePrincipal?: string;
  tituloSugerido?: string;
  conteudoGerado?: string;
  imagemUrl?: string;
}
export async function iniciarConversaJuju(siteId: string) {
  const supabase = await createClient();
  
  // Cria um rascunho em roteiros_blog
  const { data: usuario } = await supabase.auth.getUser();
  if (!usuario.user) throw new Error('Não autenticado');

  const { data: siteData } = await supabase.from('sites').select('cliente_id').eq('id', siteId).single();
  
  const { data: roteiro, error: roteiroErr } = await supabase.from('roteiros_blog').insert({
    cliente_id: siteData?.cliente_id,
    site_id: siteId,
    autor_id: usuario.user.id,
    origem: 'ia',
    status: 'em_elaboracao'
  }).select().single();

  if (roteiroErr || !roteiro) throw new Error('Erro ao criar roteiro base');

  // Cria o estado inicial da conversa
  const historico = [
    { role: 'model', text: MENSAGENS_PADRAO.abertura }
  ];

  const contextoInicial: RoteiroContexto = { fase: 1 };

  const { data: conversa } = await supabase.from('roteiros_conversas').insert({
    roteiro_id: roteiro.id,
    historico_mensagens: historico,
    contexto_coletado: contextoInicial
  }).select().single();

  return { roteiro, conversa };
}

export async function processarMensagemJuju(conversaId: string, siteId: string, mensagemUsuario: string, dadosExtras?: any) {
  const supabase = await createClient();

  // 1. Carrega o estado atual da conversa
  const { data: conversa, error: convErr } = await supabase
    .from('roteiros_conversas')
    .select('*')
    .eq('id', conversaId)
    .single();

  if (convErr || !conversa) throw new Error('Conversa não encontrada');

  const historico: any[] = [...conversa.historico_mensagens];
  if (!dadosExtras?.hidden) {
    historico.push({ role: 'user', text: mensagemUsuario });
  }
  let contexto: RoteiroContexto = { ...conversa.contexto_coletado };
  let novaMensagemModel: any = { role: 'model', text: "" };

  try {
    // Máquina de estados baseada na fase
    if (contexto.fase === 1) {
      if (mensagemUsuario.toLowerCase().includes('buscar sugestões') || dadosExtras?.tipo === 'gsc') {
        const sugestoes = await getSeoKeywordSuggestions(supabase, siteId);
        novaMensagemModel.text = "Aqui estão algumas oportunidades de temas baseados no Search Console do seu site:\n" + 
          JSON.stringify(sugestoes, null, 2) + "\nQual desses temas você prefere?";
      } else {
        const nicho = await extrairNichoJuridico(mensagemUsuario);
        contexto.nichoExtraido = nicho;
        contexto.temaLivre = mensagemUsuario;
        
        const categorias = await getWordpressCategories(supabase, siteId);
        
        novaMensagemModel.text = `Excelente! O nicho detectado foi ${nicho.area_direito}. Sugiro a palavra-chave "${nicho.palavras_chave_relacionadas[0]}".\n` +
          MENSAGENS_PADRAO.transicaoParaCategorias + `\n\nPor favor, escolha a categoria deste artigo abaixo:`;
        novaMensagemModel.optionsType = 'category';
        novaMensagemModel.options = categorias && Array.isArray(categorias) ? categorias : [];
        
        contexto.palavraChavePrincipal = nicho.palavras_chave_relacionadas[0];
        contexto.fase = 2;
      }
    } 
    else if (contexto.fase === 2) {
      contexto.categoriaId = dadosExtras?.categoriaId || parseInt(mensagemUsuario) || undefined;
      
      const tags = await getWordpressTags(supabase, siteId);
      
      novaMensagemModel.text = "Ótimo! Categoria selecionada. Agora, escolha as tags relacionadas a este assunto (você pode selecionar mais de uma):";
      novaMensagemModel.optionsType = 'tags';
      novaMensagemModel.options = tags && Array.isArray(tags) ? tags : [];
      
      contexto.fase = 3;
    }
    else if (contexto.fase === 3) {
      contexto.tagsIds = dadosExtras?.tagsIds || [];
      
      const authors = await getWordpressAuthors(supabase, siteId);
      
      novaMensagemModel.text = "Tags confirmadas. Por fim, selecione quem será o Autor deste artigo:";
      novaMensagemModel.optionsType = 'author';
      novaMensagemModel.options = authors && Array.isArray(authors) ? authors : [];
      
      contexto.fase = 4;
    }
    else if (contexto.fase === 4) {
      contexto.autorId = dadosExtras?.autorId || parseInt(mensagemUsuario) || undefined;
      
      novaMensagemModel.text = "Tudo certo! Agora vou começar a redigir o seu artigo. Como eu escrevo parágrafo por parágrafo otimizando para SEO, isso pode levar entre 30 a 60 segundos. Por favor, aguarde!";
      novaMensagemModel.optionsType = 'loading_content';
      
      contexto.fase = 4.5;
    }
    else if (contexto.fase === 4.5) {
      const conteudoFinal = await gerarTituloEConteudo(contexto.nichoExtraido, contexto.nichoExtraido.area_direito, contexto.palavraChavePrincipal!);
      contexto.conteudoGerado = conteudoFinal;
      
      novaMensagemModel.text = `Pronto! O conteúdo foi gerado.\nQuer que eu busque uma imagem corporativa em um banco de imagens gratuito para a capa deste post?`;
      
      contexto.fase = 5;
    }
    else if (contexto.fase === 5) {
      if (mensagemUsuario.toLowerCase().includes('sim')) {
        const imagens = await searchStockImage(contexto.nichoExtraido.subnicho, contexto.nichoExtraido.area_direito);
        if (imagens.length > 0) {
          contexto.imagemUrl = imagens[0].url;
          novaMensagemModel.text = "Aqui está a imagem corporativa que encontrei:\n\n" + imagens[0].url + "\n\n" + MENSAGENS_PADRAO.confirmacaoFinal;
        } else {
          novaMensagemModel.text = MENSAGENS_PADRAO.imagemNaoEncontrada;
        }
      } else {
        novaMensagemModel.text = "Tudo bem, você poderá inserir uma imagem manualmente depois.\n\n" + MENSAGENS_PADRAO.confirmacaoFinal;
      }
      
      contexto.fase = 6;
      
      await supabase.from('roteiros_blog').update({
        status: 'em_elaboracao',
        titulo: contexto.nichoExtraido?.subnicho ? contexto.nichoExtraido.subnicho : "Rascunho sem título",
        conteudo: contexto.conteudoGerado,
        imagem_url: contexto.imagemUrl,
        categoria_wp_id: contexto.categoriaId
      }).eq('id', conversa.roteiro_id);
    }
    
  } catch (err: any) {
    novaMensagemModel.text = err.message || "Desculpe, ocorreu um erro na minha máquina de estados.";
  }

  historico.push(novaMensagemModel);

  // 2. Salva o estado atualizado no banco
  await supabase
    .from('roteiros_conversas')
    .update({
      historico_mensagens: historico,
      contexto_coletado: contexto,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', conversaId);

  return { historico, contexto, responseText: novaMensagemModel, roteiroId: conversa.roteiro_id };
}

export async function getFirstSiteId() {
  const supabase = await createClient();
  const { data: site } = await supabase.from('sites').select('id').limit(1).single();
  return site?.id || null;
}

export async function getWordPressSites() {
  const supabase = await createClient();
  
  // Traz todos os sites do usuário (RLS aplica automaticamente) que tem uma integração WP ativa
  const { data: sites, error } = await supabase
    .from('sites')
    .select(`
      id,
      nome,
      dominio,
      integracoes_wordpress!inner ( id )
    `)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar sites com wordpress:', error);
    return [];
  }
  
  return sites || [];
}

export async function publicarNoWordPress(roteiroId: string, dadosEditados: { titulo: string, conteudo: string, imagemUrl?: string, status?: 'publish' | 'draft' | 'future', date?: string }) {
  const supabase = await createClient();
  
  // 1. Busca roteiro e WordPress
  const { data: roteiro } = await supabase.from('roteiros_blog').select('*').eq('id', roteiroId).single();
  if (!roteiro) throw new Error('Roteiro não encontrado');
  
  const { data: wp } = await supabase.from('integracoes_wordpress').select('*').eq('site_id', roteiro.site_id).single();
  if (!wp) throw new Error('Integração com WordPress não configurada neste site.');

  // 2. Converte Markdown simples para HTML caso haja resquícios, e converte quebras de linha
  let htmlContent = dadosEditados.conteudo
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br/>');
    
  htmlContent = `<p>${htmlContent}</p>`;

  // 3. Monta a autenticação Basic
  const auth = Buffer.from(`${wp.username}:${wp.app_password}`).toString('base64');
  
  // 3.5. Faz o upload da Imagem para a Biblioteca de Mídia do WP para definir como Imagem Destacada
  let featuredMediaId = null;
  if (dadosEditados.imagemUrl) {
    try {
      const imgRes = await fetch(dadosEditados.imagemUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uploadRes = await fetch(`${wp.site_url}/wp-json/wp/v2/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Disposition': `attachment; filename="capa-${roteiroId}.jpg"`,
            'Content-Type': 'image/jpeg'
          },
          body: buffer
        });
        
        if (uploadRes.ok) {
          const mediaData = await uploadRes.json();
          featuredMediaId = mediaData.id;
        } else {
          console.error('Falha ao subir mídia:', await uploadRes.text());
        }
      }
    } catch (e) {
      console.error('Erro de rede ao subir imagem pro WP:', e);
    }
  }

  // 4. Payload WordPress (agora suportando draft, publish, future)
  const wpPayload: any = {
    title: dadosEditados.titulo,
    content: htmlContent,
    status: dadosEditados.status || 'publish',
  };
  
  if (dadosEditados.date) {
    wpPayload.date = dadosEditados.date;
  }
  
  if (featuredMediaId) {
    wpPayload.featured_media = featuredMediaId;
  }
  
  if (roteiro.categoria_wp_id) {
    wpPayload.categories = [roteiro.categoria_wp_id];
  }

  // 5. Chamada para a REST API do WordPress
  const res = await fetch(`${wp.site_url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify(wpPayload)
  });

  const wpData = await res.json();
  
  if (!res.ok) {
    console.error('Erro WP API:', wpData);
    throw new Error(wpData.message || 'Falha ao conectar com o WordPress');
  }

  const finalStatus = dadosEditados.status === 'draft' ? 'rascunho' : (dadosEditados.status === 'future' ? 'agendado' : 'publicado');

  // 6. Atualiza CRM com Sucesso
  await supabase.from('roteiros_blog').update({
    status: finalStatus,
    titulo: dadosEditados.titulo,
    conteudo: dadosEditados.conteudo,
    wp_post_id: wpData.id,
    atualizado_em: new Date().toISOString()
  }).eq('id', roteiroId);

  // 7. Limpa o cache da aba de postagens do WordPress para forçar o recarregamento na tela
  await supabase.from('api_cache')
    .delete()
    .eq('site_id', roteiro.site_id)
    .eq('cache_key', 'wp_posts');

  return { success: true, wpPostId: wpData.id };
}

export async function createCategoryOrTagAction(siteId: string, type: 'category' | 'tag', name: string) {
  const supabase = await createClient();
  const { data: wp } = await supabase.from('integracoes_wordpress').select('site_url, username, app_password').eq('site_id', siteId).single();
  
  if (!wp) return { success: false, error: 'WordPress não conectado.' };

  if (type === 'category') {
    const res = await createWpCategory(wp.site_url, wp.username, wp.app_password, name);
    if (res.success) {
      await supabase.from('api_cache').delete().eq('site_id', siteId).eq('cache_key', `wp_categories:${siteId}`);
    }
    return { ...res, data: 'data' in res ? res.data : undefined };
  } else {
    const res = await createWpTag(wp.site_url, wp.username, wp.app_password, name);
    if (res.success) {
      await supabase.from('api_cache').delete().eq('site_id', siteId).eq('cache_key', `wp_tags:${siteId}`);
    }
    return { ...res, data: 'data' in res ? res.data : undefined };
  }
}

export async function getRoteiroByIdAction(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('roteiros_blog').select('*').eq('id', id).single();
  return data;
}