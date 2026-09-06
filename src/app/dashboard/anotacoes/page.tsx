import { createClient } from '@/utils/supabase/server'
import { MessageSquare, Calendar } from 'lucide-react'

const formatNoteContent = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {part}
        </a>
      )
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>
  })
}

export const dynamic = 'force-dynamic'

export default async function AnotacoesPage() {
  const supabase = await createClient()

  // Get current user and explicitly filter
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-8 text-center">Acesso negado.</div>

  // Puxar o profile para garantir que pegamos o cliente_id da tabela usuarios.
  // Isso funciona independente de eventuais falhas do RLS da function customizada
  const { data: profile } = await supabase.from('usuarios').select('cliente_id, role').eq('id', user.id).single()
  
  if (!profile || profile.role !== 'cliente' || !profile.cliente_id) {
    return (
      <div className="p-8 text-center text-gray-500">
        Você não possui um perfil de cliente válido ou seu cadastro ainda não foi vinculado pela agência.
      </div>
    )
  }

  // Buscar as notas do cliente logado passando o EQ explícito
  // O RLS (Row Level Security) garante no banco também a visibilidade
  const { data: notas, error } = await supabase
    .from('notas_cliente')
    .select('*, usuarios(nome)')
    .eq('cliente_id', profile.cliente_id)
    .eq('visivel_cliente', true)
    .order('criado_em', { ascending: false })

  if (error) {
    console.warn('Erro ao buscar notas:', JSON.stringify(error, null, 2))
  }

  return (
    <div className="w-full max-w-5xl animate-in fade-in duration-500 pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Anotações do Time</h1>
        <p className="text-gray-500 text-lg">Acompanhe os comunicados, relatórios e atualizações da nossa equipe.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Caixa de Entrada</h2>
            <p className="text-sm text-gray-500">Histórico completo de mensagens e reports.</p>
          </div>
        </div>

        <div className="space-y-6">
          {!notas || notas.length === 0 ? (
            <div className="text-center bg-gray-50 rounded-2xl border border-gray-100 py-16 px-6">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma atualização ainda</h3>
              <p className="text-gray-500">Quando a nossa equipe adicionar uma anotação ou relatório para você, ele aparecerá aqui.</p>
            </div>
          ) : (
            notas.map((nota) => (
              <div key={nota.id} className="flex flex-col sm:flex-row gap-5 bg-white border border-gray-100 p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-100 transition-all group">
                <div className="flex-shrink-0 flex items-center sm:items-start gap-4 sm:gap-0 sm:flex-col">
                  {nota.usuarios?.foto_url ? (
                    <img src={nota.usuarios.foto_url} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center font-bold border border-gray-200 shadow-sm text-lg">
                      {nota.usuarios?.nome?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                  <div className="sm:hidden block">
                    <span className="font-bold text-gray-900 block">{nota.usuarios?.nome || 'Equipe Agência'}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(nota.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="hidden sm:flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900 text-lg">{nota.usuarios?.nome || 'Equipe Agência'}</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 group-hover:bg-white transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(nota.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="text-gray-700 leading-relaxed text-sm md:text-base bg-gray-50/50 p-5 rounded-xl border border-gray-100/50">
                    {formatNoteContent(nota.conteudo)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
