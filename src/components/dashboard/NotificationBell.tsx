'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  CreditCard, 
  Search, 
  ShieldCheck, 
  FileText, 
  CheckCheck, 
  Sparkles, 
  ExternalLink,
  X
} from 'lucide-react'
import { 
  fetchNotificacoes, 
  marcarNotificacaoComoLida, 
  marcarTodasComoLidas, 
  seedExemploNotificacoes,
  NotificacaoItem 
} from '@/app/dashboard/notifications-actions'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    loadData()

    // Refresh every 30s
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadData() {
    const res = await fetchNotificacoes()
    if (res.notificacoes) {
      setNotificacoes(res.notificacoes)
      setUnreadCount(res.unreadCount)
    }
  }

  async function handleNotificationClick(item: NotificacaoItem) {
    if (!item.lida) {
      await marcarNotificacaoComoLida(item.id)
      setNotificacoes(prev => prev.map(n => n.id === item.id ? { ...n, lida: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setIsOpen(false)
    if (item.link) {
      router.push(item.link)
    }
  }

  async function handleMarkAllAsRead() {
    setLoading(true)
    await marcarTodasComoLidas()
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    setUnreadCount(0)
    setLoading(false)
  }

  async function handleGenerateSamples() {
    setSeeding(true)
    await seedExemploNotificacoes()
    await loadData()
    setSeeding(false)
  }

  const getCategoryIcon = (tipo: string) => {
    switch (tipo) {
      case 'pagamento':
        return <CreditCard className="w-4 h-4 text-emerald-600" />
      case 'seo':
        return <Search className="w-4 h-4 text-blue-600" />
      case 'wordpress':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />
      case 'blog':
        return <FileText className="w-4 h-4 text-purple-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getCategoryBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'pagamento': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'seo': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'wordpress': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'blog': return 'bg-purple-50 text-purple-700 border-purple-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Button with Badge */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:shadow-md transition-all focus:outline-none"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        
        {/* Red Dot Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popup Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">Notificações</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} novas
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-black flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Lidas
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {notificacoes.length > 0 ? (
              notificacoes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-4 hover:bg-gray-50/80 transition-colors cursor-pointer relative group flex gap-3 ${
                    !item.lida ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${getCategoryBadgeClass(item.tipo)}`}>
                    {getCategoryIcon(item.tipo)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className={`text-sm font-semibold truncate ${!item.lida ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.titulo}
                      </h4>
                      {!item.lida && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                      {item.mensagem}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{new Date(item.criado_em).toLocaleDateString('pt-BR')} às {new Date(item.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-medium">
                        Ver origem <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-700">Nenhuma notificação por enquanto.</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Alertas sobre Pagamentos, SEO, WordPress e Blog aparecerão aqui.
                </p>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs">
            <button
              onClick={handleGenerateSamples}
              disabled={seeding}
              className="text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {seeding ? 'Gerando...' : 'Gerar notificações de teste'}
            </button>
            <span className="text-gray-400 text-[11px]">CRM Notificações</span>
          </div>
        </div>
      )}
    </div>
  )
}
