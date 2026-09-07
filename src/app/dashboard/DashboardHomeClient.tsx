'use client'

import { useState, useEffect } from 'react'
import { Cloud, Search, Globe, ChevronRight, Activity, Server, Unplug, ArrowUpRight, CheckCircle2, FileText, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchGscAnalytics, fetchGscIndexedPages, fetchWpStatus, fetchWpPosts } from './sites/integrations-actions'
import Link from 'next/link'
import Image from 'next/image'

type DashboardHomeClientProps = {
  sites: any[]
  firstName: string
  isClientView?: boolean
}

export function DashboardHomeClient({ sites, firstName, isClientView = false }: DashboardHomeClientProps) {
  const [selectedSite, setSelectedSite] = useState<any | null>(sites.length > 0 ? sites[0] : null)
  const [gscData, setGscData] = useState<any[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [indexedPages, setIndexedPages] = useState<any[]>([])
  
  // WP State
  const [wpStatus, setWpStatus] = useState<any>(null)
  const [wpPosts, setWpPosts] = useState<any[]>([])
  const [loadingWp, setLoadingWp] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string>('all')
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)

  const uniqueClientsMap = new Map()
  sites.forEach(s => {
    if (s.clientes) {
      uniqueClientsMap.set(s.clientes.id, s.clientes)
    }
  })
  const allClients = Array.from(uniqueClientsMap.values())

  type DateFilter = 'hoje' | '7_dias' | '30_dias' | 'periodo'
  const [dateFilter, setDateFilter] = useState<DateFilter>('30_dias')
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0])
  
  // Drill-down State
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (selectedSite) {
      loadAnalytics(selectedSite)
    }
  }, [selectedSite, dateFilter, customStartDate, customEndDate, selectedPageUrl])

  async function loadAnalytics(site: any) {
    setLoadingAnalytics(true)
    setGscData([])
    setIndexedPages([])

    const hasGsc = site.integracoes_google && site.integracoes_google.length > 0

    // Fetch GSC
    if (hasGsc) {
      const propUrl = site.integracoes_google[0].propriedade_search_console
      if (propUrl) {
        let startDate = ''
        let endDate = new Date().toISOString().split('T')[0]
        
        if (dateFilter === 'hoje') {
          startDate = endDate
        } else if (dateFilter === '7_dias') {
          const d = new Date()
          d.setDate(d.getDate() - 7)
          startDate = d.toISOString().split('T')[0]
        } else if (dateFilter === '30_dias') {
          const d = new Date()
          d.setDate(d.getDate() - 30)
          startDate = d.toISOString().split('T')[0]
        } else {
          startDate = customStartDate
          endDate = customEndDate
        }

        const res = await fetchGscAnalytics(selectedSite.id, propUrl, startDate, endDate, selectedPageUrl || undefined)
        if (res.data) {
          const chartData = res.data.map((row: any) => ({
            date: row.keys[0],
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: row.ctr ? (row.ctr * 100).toFixed(2) : '0.00',
            position: row.position ? row.position.toFixed(1) : '0.0',
            rawCtr: row.ctr || 0,
            rawPosition: row.position || 0
          }))
          setGscData(chartData)
        }

        // Also fetch indexed pages
        const indexedRes = await fetchGscIndexedPages(selectedSite.id, propUrl, startDate, endDate)
        if (indexedRes.data) {
          setIndexedPages(indexedRes.data)
        }
      }
    }

    // Fetch WP
    const hasWp = site.integracoes_wordpress && site.integracoes_wordpress.length > 0
    if (hasWp) {
      setLoadingWp(true)
      const wpConfig = site.integracoes_wordpress[0]
      if (wpConfig.site_url) {
        const [statusRes, postsRes] = await Promise.all([
          fetchWpStatus(wpConfig.site_url, wpConfig.username, wpConfig.app_password),
          fetchWpPosts(site.id, wpConfig.site_url, wpConfig.username, wpConfig.app_password, false)
        ])
        if (statusRes.success) setWpStatus(statusRes.data)
        else setWpStatus(null)

        if (postsRes.success) setWpPosts(postsRes.data)
        else setWpPosts([])
      }
      setLoadingWp(false)
    } else {
      setWpStatus(null)
      setWpPosts([])
    }

    setLoadingAnalytics(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredSites = sites.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || s.dominio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClient = selectedClientId === 'all' || s.cliente_id === selectedClientId
    return matchesSearch && matchesClient
  })

  const activeSitesCount = sites.filter(s => s.status === 'no_ar').length
  
  // Calculations for GSC
  const totalClicks = gscData.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0)
  const totalImpressions = gscData.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0)
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
  const validPositions = gscData.map(curr => parseFloat(curr.rawPosition ?? curr.position)).filter(p => !isNaN(p) && p > 0)
  const avgPosition = validPositions.length > 0 ? (validPositions.reduce((a, b) => a + b, 0) / validPositions.length).toFixed(1) : '0.0'

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Row: Enterprise Analytics Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Welcome Card (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-b from-white to-gray-100 rounded-[2.5rem] p-8 shadow-sm border border-white/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#DFFF00]/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-medium text-gray-900 tracking-tight leading-[1.1] mb-6">
                Olá {firstName},<br />
                aqui está a sua rede.
              </h1>
            </div>
            <div>
              <p className="text-gray-500 text-base mb-1">Total de Projetos</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-gray-900">{sites.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lime Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#DFFF00] rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between group">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 w-48 h-48 border border-black/5 rounded-full"></div>
          <div className="absolute -right-6 -top-6 w-48 h-48 border border-black/5 rounded-full"></div>
          <div className="absolute -right-2 -top-2 w-48 h-48 border border-black/5 rounded-full"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <span className="text-base text-black/70 font-medium">Sites Ativos (No Ar)</span>
            <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="relative z-10 mt-10">
            <h4 className="text-5xl font-medium text-black tracking-tight mb-2">{activeSitesCount}</h4>
            <p className="text-sm text-black/50 font-medium">{sites.length - activeSitesCount} projetos pausados/em produção</p>
          </div>
        </div>

      </div>

      {/* Main Split Layout: Left List, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 min-h-0 lg:min-h-[600px]">
        
        {/* Left Col: Site List */}
        <div className="lg:col-span-4 bg-[#F2F2F2] rounded-3xl lg:rounded-[2.5rem] p-4 md:p-6 border border-white/60 flex flex-col h-auto max-h-[500px] lg:max-h-none lg:h-[700px]">
          <div className="mb-6 space-y-3">
            <h3 className="text-lg text-gray-600 font-medium px-2">Selecione um Projeto</h3>
            
            {!isClientView && allClients.length > 0 && (
              <div className="px-2 relative">
                <button
                  type="button"
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className="w-full bg-white border border-gray-200 rounded-full text-sm px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    {selectedClientId === 'all' ? (
                      <span className="font-medium text-gray-700">Todos os clientes</span>
                    ) : (
                      <>
                        {(() => {
                          const c = allClients.find((c: any) => c.id === selectedClientId)
                          if (!c) return <span className="font-medium text-gray-700">Selecione</span>
                          return (
                            <>
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                {c.avatar_url ? (
                                  <Image src={c.avatar_url} alt={c.nome} width={20} height={20} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-500">{c.nome.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <span className="font-medium text-gray-700 truncate">{c.nome}</span>
                            </>
                          )
                        })()}
                      </>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </button>

                {isClientDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsClientDropdownOpen(false)}></div>
                    <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedClientId('all')
                          setIsClientDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedClientId === 'all' ? 'bg-[#DFFF00]/20 text-black font-semibold' : 'text-gray-700'}`}
                      >
                        <span>Todos os clientes</span>
                      </button>
                      
                      {allClients.map((c: any) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedClientId(c.id)
                            setIsClientDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${selectedClientId === c.id ? 'bg-[#DFFF00]/20 text-black font-semibold' : 'text-gray-700'}`}
                        >
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                            {c.avatar_url ? (
                              <Image src={c.avatar_url} alt={c.nome} width={24} height={24} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-gray-500">{c.nome.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="truncate">{c.nome}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="relative mx-2">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar projeto..." 
                className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {filteredSites.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Nenhum site encontrado.</div>
            ) : (
              filteredSites.map(site => {
                const isSelected = selectedSite?.id === site.id
                const hasGsc = site.integracoes_google && site.integracoes_google.length > 0
                const hasWp = site.integracoes_wordpress && site.integracoes_wordpress.length > 0
                
                return (
                  <button 
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group
                      ${isSelected 
                        ? 'bg-black text-white shadow-lg shadow-black/20 translate-x-1' 
                        : 'bg-white text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-medium text-base truncate">{site.nome}</h3>
                      <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>{site.dominio}</p>
                      
                      {site.clientes && !isClientView && (
                        <p className={`text-[10px] uppercase tracking-wider font-semibold truncate mt-1 ${isSelected ? 'text-white/60' : 'text-purple-600'}`}>
                          {site.clientes.nome}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-3 items-center">
                        <span className={`w-2 h-2 rounded-full ${site.status === 'no_ar' ? 'bg-[#DFFF00]' : site.status === 'pausado' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                        <div className="flex gap-1.5">
                          {hasGsc && <Search className={`w-3.5 h-3.5 ${isSelected ? 'text-white/70' : 'text-blue-500'}`} />}
                          {hasWp && <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-white/70' : 'text-purple-500'}`} />}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-4">
                          <Link 
                            href={isClientView ? `/dashboard/meus-sites/${site.id}` : `/dashboard/sites/${site.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg inline-flex items-center gap-1 hover:bg-gray-200 transition-colors"
                          >
                            Gerenciar Site <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                    {!isClientView ? (
                      <Link 
                        href={`/dashboard/sites/${site.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:text-black hover:bg-gray-200'}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link 
                        href={`/dashboard/meus-sites/${site.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:text-black hover:bg-gray-200'}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Col: Details & Analytics */}
        <div className="lg:col-span-8 bg-[#EAEAEA] rounded-3xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 shadow-sm border border-white/50 relative flex flex-col h-auto lg:h-[700px]">
          
          {!selectedSite ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Globe className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">Nenhum site selecionado</p>
              <p className="text-sm">Selecione um projeto na lista ao lado.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 tracking-tight">{selectedSite.nome}</h2>
                  <a href={`https://${selectedSite.dominio}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black hover:underline mt-1 inline-flex items-center gap-1 text-sm">
                    {selectedSite.dominio} <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="bg-gray-200/60 p-1 rounded-full flex flex-wrap items-center gap-1">
                    <button 
                      onClick={() => setDateFilter('hoje')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'hoje' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Hoje
                    </button>
                    <button 
                      onClick={() => setDateFilter('7_dias')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === '7_dias' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      7 Dias
                    </button>
                    <button 
                      onClick={() => setDateFilter('30_dias')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === '30_dias' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      30 Dias
                    </button>
                    <button 
                      onClick={() => setDateFilter('periodo')}
                      className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'periodo' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Período
                    </button>
                  </div>

                  {dateFilter === 'periodo' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm animate-in fade-in zoom-in-95">
                      <input 
                        type="date" 
                        value={customStartDate} 
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="text-xs bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                      />
                      <span className="text-gray-400 text-xs">até</span>
                      <input 
                        type="date" 
                        value={customEndDate} 
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="text-xs bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                      />
                    </div>
                  )}

                  <Link href={isClientView ? `/dashboard/meus-sites/${selectedSite.id}` : `/dashboard/sites/${selectedSite.id}`} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2 mt-2">
                    Gerenciar Site <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {loadingAnalytics ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                  <Activity className="w-8 h-8 animate-spin mb-4" />
                  <p>Sincronizando dados...</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  
                  {/* Google Search Console - Graphic Card */}
                  <div className="bg-gradient-to-br from-white to-[#F6F6F6] rounded-[2rem] p-6 lg:p-8 border border-white/60 relative">
                    <div className="absolute top-6 right-6 flex items-center gap-3">
                      {!isClientView && (
                        <Link href={`/dashboard/sites/${selectedSite.id}?tab=analytics`} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                          Ver relatório completo <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <Search className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-8">
                      {selectedPageUrl && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <button 
                            onClick={() => setSelectedPageUrl(null)}
                            className="hover:text-black hover:underline transition-all"
                          >
                            Visão Geral do Domínio
                          </button>
                          <ChevronRight className="w-3 h-3" />
                          <span className="text-gray-900 font-medium truncate max-w-[200px]" title={selectedPageUrl}>
                            {(selectedPageUrl.replace(`https://${selectedSite.dominio}`, '') === '' || selectedPageUrl.replace(`https://${selectedSite.dominio}`, '') === '/') ? 'Página Principal' : selectedPageUrl.replace(`https://${selectedSite.dominio}`, '')}
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-base text-gray-600 font-medium">
                        Google Search Console ({
                          dateFilter === 'hoje' ? 'Hoje' :
                          dateFilter === '7_dias' ? '7 Dias' :
                          dateFilter === '30_dias' ? '30 Dias' : 'Personalizado'
                        })
                      </h3>
                    </div>

                    {!(selectedSite.integracoes_google && selectedSite.integracoes_google.length > 0) ? (
                      <div className="py-10 text-center">
                        <p className="text-gray-500 text-sm">Google Search Console não vinculado a este site.</p>
                      </div>
                    ) : gscData.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-gray-500 text-sm">Nenhum dado encontrado para o período.</p>
                      </div>
                    ) : (
                      <>
                        <div className="relative w-full h-48 mb-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gscData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#CBD5E1" />
                              <XAxis dataKey="date" tick={{fontSize: 10, fill: '#9ca3af'}} tickLine={false} axisLine={false} dy={10} />
                              <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} tickLine={false} axisLine={false} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#000', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'transparent' }}
                              />
                              <Bar dataKey="clicks" name="Cliques" radius={[8, 8, 2, 2]} maxBarSize={32}>
                                {gscData.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={index === gscData.length - 1 ? '#111827' : '#E3E4E6'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Total Cliques</p>
                            <h4 className="text-2xl font-semibold text-gray-900">{totalClicks.toLocaleString('pt-BR')}</h4>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">CTR Médio</p>
                            <h4 className="text-2xl font-semibold text-gray-900">{avgCtr}%</h4>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Posição Média</p>
                            <h4 className="text-2xl font-semibold text-gray-900">{avgPosition}</h4>
                          </div>
                        </div>
                      </>
                    )}
                  </div>


                  {/* Páginas Indexadas (GSC) */}
                  {selectedSite.integracoes_google && selectedSite.integracoes_google.length > 0 && !selectedPageUrl && (
                    <div className="bg-gradient-to-br from-white to-[#F6F6F6] rounded-[2rem] p-6 lg:p-8 border border-white/60">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <Search className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base text-gray-600 font-medium">Páginas Indexadas (Google)</h3>
                            <p className="text-xs text-gray-400">URLs que apareceram nos resultados de busca ({
                              dateFilter === 'hoje' ? 'Hoje' :
                              dateFilter === '7_dias' ? '7 Dias' :
                              dateFilter === '30_dias' ? '30 Dias' : 'Personalizado'
                            })</p>
                          </div>
                        </div>
                        {!isClientView && (
                          <Link href={`/dashboard/sites/${selectedSite.id}?tab=analytics`} className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                            Ver todas <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      {indexedPages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {indexedPages.map((page: any, idx: number) => {
                            const rawUrl = page.keys[0]
                            const formattedUrl = (rawUrl.replace(`https://${selectedSite.dominio}`, '') === '' || rawUrl.replace(`https://${selectedSite.dominio}`, '') === '/') 
                              ? 'Página Principal' 
                              : rawUrl.replace(`https://${selectedSite.dominio}`, '')
                              
                            return (
                              <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                                <div>
                                  <div className="flex items-start justify-between mb-3 gap-2">
                                    <h4 className="font-medium text-sm text-gray-900 break-all line-clamp-2" title={rawUrl}>
                                      {formattedUrl}
                                    </h4>
                                    <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black flex-shrink-0">
                                      <ArrowUpRight className="w-4 h-4" />
                                    </a>
                                  </div>
                                  <div className="flex gap-4 mt-4">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-0.5">Cliques</p>
                                      <p className="font-semibold text-gray-900">{page.clicks.toLocaleString('pt-BR')}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-0.5">Impressões</p>
                                      <p className="font-semibold text-gray-900">{page.impressions.toLocaleString('pt-BR')}</p>
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => setSelectedPageUrl(rawUrl)}
                                  className="mt-6 w-full py-2 bg-gray-50 hover:bg-black text-gray-700 hover:text-white rounded-xl text-xs font-medium transition-colors border border-gray-100 group-hover:border-black"
                                >
                                  Gerenciar página
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          <p>Nenhuma página indexada encontrada neste período.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* WordPress & Blog Widget */}
                  {selectedSite.integracoes_wordpress && selectedSite.integracoes_wordpress.length > 0 && !selectedPageUrl && (
                    <div className="bg-gradient-to-br from-white to-[#F6F6F6] rounded-[2rem] p-6 lg:p-8 border border-white/60 relative mt-6">
                      <div className="absolute top-6 right-6 flex items-center gap-3">
                        {!isClientView && (
                          <Link href={`/dashboard/sites/${selectedSite.id}?tab=blog`} className="text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full transition-colors">
                            Gerenciar Blog <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mb-8">
                        <h3 className="text-base text-gray-600 font-medium">
                          Blog / WordPress
                        </h3>
                      </div>

                      {loadingWp ? (
                        <div className="py-10 text-center flex flex-col items-center text-gray-400">
                           <Activity className="w-6 h-6 animate-spin mb-2" />
                           <p className="text-sm">Carregando dados do WordPress...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                           <div className="flex flex-wrap gap-4 items-center">
                              <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <div className="text-gray-900 font-bold text-xl">{wpPosts.filter(p => p.status === 'publish').length}</div>
                                <div>
                                  <p className="text-xs text-gray-500">Posts Publicados</p>
                                </div>
                              </div>

                              <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <div className="text-gray-900 font-bold text-xl">{wpPosts.filter(p => p.status === 'future').length}</div>
                                <div>
                                  <p className="text-xs text-gray-500">Posts Agendados</p>
                                </div>
                              </div>
                           </div>

                           {wpPosts.length > 0 && (
                             <div className="mt-6">
                               <p className="text-sm font-medium text-gray-700 mb-4">Últimas Postagens</p>
                               <div className="space-y-3">
                                 {wpPosts.slice(0, 3).map((post: any) => {
                                   let title = post.title?.raw || post.title?.rendered || 'Sem título'
                                   title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
                                   
                                   const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
                                   
                                   let displayStatus = post.status
                                   const gmtDateStr = post.date_gmt && !post.date_gmt.includes('0000-00-00') ? post.date_gmt + 'Z' : post.date + 'Z'
                                   const postTime = new Date(gmtDateStr)
                                   
                                   if ((post.status === 'future' || post.status === 'publish') && postTime <= new Date()) {
                                     displayStatus = 'publish'
                                   } else if (post.status === 'publish' && postTime > new Date()) {
                                     displayStatus = 'future'
                                   }
                                   
                                   return (
                                     <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-purple-200 transition-colors">
                                       <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                                          {featuredImg ? (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                              <img src={featuredImg} alt={title} className="w-full h-full object-cover" />
                                            </div>
                                          ) : (
                                            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-300 flex items-center justify-center flex-shrink-0">
                                              <FileText className="w-5 h-5" />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
                                            <div className="flex gap-3 mt-1">
                                              <span className="text-xs text-gray-500">{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                                              <span className={`text-xs px-2 py-0.5 rounded-full ${displayStatus === 'publish' ? 'bg-green-100 text-green-700' : displayStatus === 'future' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {displayStatus === 'publish' ? 'Publicado' : displayStatus === 'future' ? 'Agendado' : 'Rascunho'}
                                              </span>
                                            </div>
                                          </div>
                                       </div>
                                       {!isClientView && (
                                         <Link href={`/dashboard/sites/${selectedSite.id}?tab=blog`} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                           <ChevronRight className="w-4 h-4" />
                                         </Link>
                                       )}
                                     </div>
                                   )
                                 })}
                               </div>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
