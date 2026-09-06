'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateCliente, buscarNotasCliente, adicionarNotaCliente, editarNotaCliente, excluirNotaCliente } from '../actions'
import { ClienteType } from '../ClienteModal'
import { CheckCircle2, Send, MessageSquare, PlusCircle, Pencil, Trash2, X, Check, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// Helper to convert URLs in text to clickable links
function formatNoteContent(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {part}
        </a>
      )
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>
  })
}

export function ClientSettingsView({ cliente }: { cliente: ClienteType }) {
  // Client Edit State
  const [loadingForm, setLoadingForm] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [successForm, setSuccessForm] = useState(false)

  // Notes State
  const [notas, setNotas] = useState<any[]>([])
  const [loadingNotas, setLoadingNotas] = useState(true)
  const [novaNota, setNovaNota] = useState('')
  const [enviandoNota, setEnviandoNota] = useState(false)
  const [visivelCliente, setVisivelCliente] = useState(false)
  const feedEndRef = useRef<HTMLDivElement>(null)
  
  // Current User
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  // Editing State
  const [editingNotaId, setEditingNotaId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingVisivelCliente, setEditingVisivelCliente] = useState(false)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  useEffect(() => {
    loadUser()
    loadNotas()
  }, [])

  async function loadUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)
  }

  async function loadNotas() {
    setLoadingNotas(true)
    const res = await buscarNotasCliente(cliente.id)
    if (res.data) {
      setNotas([...res.data].reverse())
    }
    setLoadingNotas(false)
    scrollToBottom()
  }

  function scrollToBottom() {
    setTimeout(() => {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingForm(true)
    setErrorForm('')
    setSuccessForm(false)

    const formData = new FormData(e.currentTarget)
    const res = await updateCliente(cliente.id, formData)

    setLoadingForm(false)

    if (res.error) {
      setErrorForm(res.error)
    } else {
      setSuccessForm(true)
      setTimeout(() => setSuccessForm(false), 3000)
    }
  }

  async function handleSendNote(e: React.FormEvent) {
    e.preventDefault()
    if (!novaNota.trim()) return

    setEnviandoNota(true)
    const res = await adicionarNotaCliente(cliente.id, novaNota, visivelCliente)
    
    if (res.success) {
      setNovaNota('')
      setVisivelCliente(false)
      await loadNotas()
    } else if (res.error) {
      alert('Erro: ' + res.error)
    }
    setEnviandoNota(false)
  }

  async function handleSaveEdit(notaId: string) {
    if (!editingContent.trim()) return
    setSalvandoEdicao(true)
    const res = await editarNotaCliente(notaId, editingContent, editingVisivelCliente)
    if (res.success) {
      setEditingNotaId(null)
      await loadNotas()
    } else if (res.error) {
      alert('Erro: ' + res.error)
    }
    setSalvandoEdicao(false)
  }

  async function handleDeleteNota(notaId: string) {
    if (!confirm('Deseja realmente excluir esta anotação?')) return
    const res = await excluirNotaCliente(notaId)
    if (res.success) {
      await loadNotas()
    } else if (res.error) {
      alert('Erro: ' + res.error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Esquerda: Formulário de Edição (1 coluna) */}
      <div className="bg-white border border-gray-200 rounded-[1.5rem] p-6 shadow-sm lg:col-span-1 h-fit">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações do Cliente</h2>
        
        <form onSubmit={handleEditSubmit} className="space-y-5">
          {errorForm && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {errorForm}
            </div>
          )}
          
          {successForm && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Atualizado!
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome completo</label>
            <Input id="nome" name="nome" required defaultValue={cliente.nome} placeholder="João Silva" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail de Contato</label>
            <Input id="email" name="email" type="email" required defaultValue={cliente.email} placeholder="joao@empresa.com" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="telefone_whatsapp" className="text-sm font-medium text-gray-700">WhatsApp</label>
            <Input id="telefone_whatsapp" name="telefone_whatsapp" defaultValue={cliente.telefone_whatsapp} placeholder="(11) 99999-9999" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="empresa" className="text-sm font-medium text-gray-700">Empresa</label>
            <Input id="empresa" name="empresa" defaultValue={cliente.empresa} placeholder="Nome da Empresa" />
          </div>

          <div className="space-y-1.5 pt-4">
            <label htmlFor="login_vinculado" className="text-sm font-medium text-gray-700">E-mail de Acesso</label>
            <p className="text-xs text-gray-500 mb-2">E-mail do painel do cliente.</p>
            <Input id="login_vinculado" name="login_vinculado" defaultValue={cliente.login_vinculado} placeholder="login@empresa.com" />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button type="submit" disabled={loadingForm} className="w-full rounded-full bg-black text-white hover:bg-gray-800 h-10">
              {loadingForm ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>

      {/* Direita: Histórico e Anotações (2 colunas) */}
      <div className="bg-white border border-gray-200 rounded-[1.5rem] shadow-sm lg:col-span-2 flex flex-col overflow-hidden h-[600px]">
        
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              Anotações do time
            </h2>
            <p className="text-xs text-gray-500 mt-1">Registre o que está sendo feito (credenciais, links, avisos).</p>
          </div>
          {/* Futuros filtros poderiam ir aqui */}
        </div>

        {/* Feed de Notas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {loadingNotas ? (
            <div className="text-center text-gray-400 text-sm py-10">Carregando histórico...</div>
          ) : notas.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10 flex flex-col items-center">
              <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
              Nenhuma anotação ainda. Comece registrando credenciais ou o progresso do projeto.
            </div>
          ) : (
            notas.map((nota) => (
              <div key={nota.id} className="flex gap-4 group">
                <div className="flex-shrink-0 mt-1">
                  {nota.usuarios?.foto_url ? (
                    <img src={nota.usuarios.foto_url} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                      {nota.usuarios?.nome?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900">{nota.usuarios?.nome || 'Usuário'}</span>
                    <div className="flex items-center gap-2">
                      {nota.visivel_cliente ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          <Eye className="w-3 h-3" /> Visível ao Cliente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          <EyeOff className="w-3 h-3" /> Interno
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(nota.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {currentUserId === nota.usuario_id && !editingNotaId && (
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingNotaId(nota.id)
                              setEditingContent(nota.conteudo)
                              setEditingVisivelCliente(nota.visivel_cliente || false)
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteNota(nota.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {editingNotaId === nota.id && (
                      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl flex flex-col gap-4">
                          <h3 className="text-lg font-semibold text-gray-900">Editar Anotação</h3>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full min-h-[200px] resize-y rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 p-4 text-sm bg-gray-50 outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id={`edit-visivel-${nota.id}`}
                              checked={editingVisivelCliente} 
                              onChange={(e) => setEditingVisivelCliente(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor={`edit-visivel-${nota.id}`} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                              Tornar anotação visível para o cliente
                            </label>
                          </div>
                          <div className="flex justify-end gap-3 mt-2">
                            <Button variant="ghost" onClick={() => setEditingNotaId(null)}>
                              Cancelar
                            </Button>
                            <Button 
                              onClick={() => handleSaveEdit(nota.id)} 
                              disabled={salvandoEdicao || !editingContent.trim()}
                            >
                              {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {formatNoteContent(nota.conteudo)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={feedEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendNote} className="flex flex-col gap-3 relative">
            <div className="flex gap-2 items-center relative w-full">
              <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 shrink-0 rounded-full">
                <PlusCircle className="w-5 h-5" />
              </Button>
              <div className="flex-1 relative flex flex-col justify-center">
                <textarea
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Anotação..."
                  className="block w-full min-h-[44px] max-h-[120px] resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all pr-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendNote(e)
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!novaNota.trim() || enviandoNota}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg shadow-sm bg-black text-white hover:bg-gray-800 flex items-center justify-center p-0"
                >
                  {enviandoNota ? '...' : <Send className="w-4 h-4 ml-0.5" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-[52px]">
              <input 
                type="checkbox" 
                id="visivel" 
                checked={visivelCliente} 
                onChange={e => setVisivelCliente(e.target.checked)} 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="visivel" className="text-xs font-medium text-gray-500 cursor-pointer select-none">
                Exibir esta atualização para o cliente
              </label>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
