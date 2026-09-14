import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { PenLine, FileText, CheckCircle2, MoreHorizontal, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import BlogRoteirosList from '@/components/blog/BlogRoteirosList';

export default async function BlogRoteirosGallery() {
  const supabase = await createClient();
  
  // No CRM real o cliente_id virá da sessão.
  const { data: usuario } = await supabase.auth.getUser();
  const { data: clienteData } = await supabase.from('usuarios').select('cliente_id').eq('id', usuario?.user?.id || '').single();
  
  // Garbage Collector: Limpa do banco de dados qualquer conversa abandonada da Juju com mais de 2 horas.
  // Isso evita o acúmulo de lixo oculto no servidor.
  const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  await supabase.from('roteiros_blog')
    .delete()
    .eq('status', 'em_elaboracao')
    .lt('criado_em', duasHorasAtras);
  
  let query = supabase.from('roteiros_blog').select('*').neq('status', 'em_elaboracao').order('criado_em', { ascending: false });
  
  if (clienteData?.cliente_id) {
    query = query.or(`cliente_id.eq.${clienteData.cliente_id},autor_id.eq.${usuario?.user?.id}`);
  } else {
    query = query.eq('autor_id', usuario?.user?.id || '');
  }

  const { data: roteiros } = await query;

  async function deleteRoteiro(formData: FormData) {
    'use server'
    const id = formData.get('id') as string;
    const supabase = await createClient();
    await supabase.from('roteiros_blog').delete().eq('id', id);
    revalidatePath('/dashboard/blog');
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
      <BlogRoteirosList roteiros={roteiros || []} deleteAction={deleteRoteiro} />
    </div>
  );
}
