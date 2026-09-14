import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import RoteiroEditorClient from './RoteiroEditorClient';

export default async function RoteiroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: usuario } = await supabase.auth.getUser();
  const { data: userData } = await supabase.from('usuarios').select('cliente_id').eq('id', usuario?.user?.id || '').single();
  const isAdmin = !userData?.cliente_id;

  const { data: roteiro } = await supabase
    .from('roteiros_blog')
    .select('*')
    .eq('id', id)
    .single();

  if (!roteiro) {
    notFound();
  }

  // Converte para o que o PreviewPanel espera
  const roteiroProps = {
    id: roteiro.id,
    titulo: roteiro.titulo || '',
    conteudo: roteiro.conteudo || '',
    imagemUrl: roteiro.imagem_url,
    site_id: roteiro.site_id,
    categoria_wp_id: roteiro.categoria_wp_id
  };

  return <RoteiroEditorClient roteiro={roteiroProps} isAdmin={isAdmin} />;
}
