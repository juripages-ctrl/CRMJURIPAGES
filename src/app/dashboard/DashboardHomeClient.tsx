'use client'

import { useState, useEffect } from 'react'
import { Cloud, Search, Globe, ChevronRight, Activity, Server, Unplug, ArrowUpRight, CheckCircle2, FileText, ChevronDown } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
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
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
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
  const [dateFilter, setDateFilter] = useState<'hoje' | '7_dias' | '30_dias' | 'periodo'>('30_dias')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null)

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, index, payload } = props
    const isSelected = fill === '#111827'
    const clicks = payload?.clicks ?? 0
    const labelText = `${clicks} ${clicks === 1 ? 'clique' : 'cliques'}`
    const labelWidth = Math.max(labelText.length * 7 + 22, 70)
    const barHeight = Math.max(height || 0, 12)
    const barY = height && height > 0 ? y : y - 12

    return (
      <g style={{ cursor: 'pointer' }} onClick={() => setSelectedBarIndex(isSelected ? null : index)}>
        <rect x={x} y={barY} width={width} height={barHeight} fill={fill} rx={width / 2} ry={width / 2} />
        {isSelected && barHeight > 16 && (
          <rect x={x + width / 2 - 8} y={barY + barHeight - 10} width={16} height={4} fill="#DFFF00" rx={2} ry={2} />
        )}
        {isSelected && (
          <g style={{ pointerEvents: 'none' }}>
            <rect 
              x={x + width / 2 - labelWidth / 2} 
              y={barY - 32} 
              width={labelWidth} 
              height={24} 
              fill="#111827" 
              rx={12} 
              ry={12} 
            />
            <text 
              x={x + width / 2} 
              y={barY - 16} 
              textAnchor="middle" 
              fill="#fff" 
              fontSize={11} 
              fontWeight={600}
            >
              {labelText}
            </text>
          </g>
        )}
      </g>
    )
  }
  
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
        
        if (postsRes.success) {
          setWpPosts(postsRes.data)
          // Se conseguimos buscar os posts, a conexão e autenticação estão funcionando
          // Mesmo que o endpoint customizado de status (mu-plugin) não exista
          if (statusRes.success) {
            setWpStatus(statusRes.data)
          } else {
            setWpStatus({ connected: true, pluginMissing: true })
          }
        } else {
          setWpPosts([])
          setWpStatus(null)
        }
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
    <div className="w-full flex flex-col gap-[22px] animate-[dkFade_.25s_ease-out]">
      
      {/* Top Row: Welcome & Lime */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[22px]">
        
        {/* Welcome Card (8 cols) */}
        <div className="lg:col-span-8 box-border relative overflow-hidden bg-gradient-to-b from-white to-[#F1F2F4] border border-white/60 rounded-[40px] p-[34px] min-h-[230px] flex flex-col justify-between shadow-sm">
          <div className="absolute -top-[40px] -right-[40px] w-[260px] h-[260px] rounded-full bg-[rgba(219,234,254,0.6)] blur-[56px] pointer-events-none"></div>
          <div className="absolute -bottom-[60px] -left-[50px] w-[260px] h-[260px] rounded-full bg-[rgba(223,255,0,0.28)] blur-[56px] pointer-events-none"></div>

          <h2 className="relative m-0 text-[38px] font-medium tracking-[-0.038em] leading-[1.1] text-[#111827]">
            Olá {firstName},<br />
            aqui está {isClientView ? 'o seu projeto' : 'a sua rede'}.
          </h2>
          
          <div className="relative mt-8">
            <p className="m-0 mb-[3px] text-[15px] text-[#6B7280]">Total de Projetos</p>
            <div className="flex items-baseline gap-[10px]">
              <span className="text-[40px] font-semibold tracking-[-0.04em] text-[#111827]">{sites.length}</span>
              {sites.length > 0 && <span className="text-[12.5px] font-semibold text-[#166534] bg-[#DCFCE7] px-[11px] py-[4px] rounded-full">Ativos</span>}
            </div>
          </div>
        </div>

        {/* Lime Card (4 cols) */}
        <div className="lg:col-span-4 relative overflow-hidden bg-[#DFFF00] rounded-[40px] p-[32px] flex flex-col justify-between">
          <div className="absolute -right-[40px] -top-[40px] w-[230px] h-[230px] border border-black/5 rounded-full pointer-events-none"></div>
          <div className="absolute -right-[22px] -top-[22px] w-[230px] h-[230px] border border-black/5 rounded-full pointer-events-none"></div>
          
          <div className="relative flex items-start justify-between">
            <span className="text-[16px] font-medium text-black/70">Sites Ativos (No Ar)</span>
            <div className="w-[42px] h-[42px] flex-none rounded-full bg-white/45 flex items-center justify-center">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.9" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M8 12.4l2.6 2.6L16 9.6"></path>
              </svg>
            </div>
          </div>
          
          <div className="relative mt-10">
            <p className="m-0 mb-[6px] text-[54px] font-medium tracking-[-0.045em] text-[#000] leading-none">{activeSitesCount}</p>
            <p className="m-0 text-[13.5px] font-medium text-black/50">{sites.length - activeSitesCount} projetos inativos/pausados</p>
          </div>
        </div>

      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[22px] items-start">
        
        {/* Left Col: Site List */}
        <div className="lg:col-span-4 box-border bg-[#F2F2F2] border border-white/60 rounded-[40px] p-[24px] flex flex-col lg:h-[650px] max-h-[600px] lg:max-h-none">
          <h3 className="m-0 mb-[16px] px-[8px] text-[17px] font-medium text-[#6B7280]">Selecione um projeto</h3>
          
          {!isClientView && allClients.length > 0 && (
            <div className="px-[8px] relative mb-[8px]">
              <button
                type="button"
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                className="w-full h-[44px] bg-white/70 border border-white/50 rounded-full text-[13.5px] px-[16px] flex items-center justify-between hover:bg-white transition-all focus:outline-none"
              >
                <div className="flex items-center gap-2 truncate">
                  {selectedClientId === 'all' ? (
                    <span className="text-[#374151]">Todos os clientes</span>
                  ) : (
                    <>
                      {(() => {
                        const c = allClients.find((c: any) => c.id === selectedClientId)
                        if (!c) return <span className="text-[#374151]">Selecione</span>
                        return <span className="text-[#374151] truncate">{c.nome}</span>
                      })()}
                    </>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              </button>

              {isClientDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsClientDropdownOpen(false)}></div>
                  <div className="absolute top-full left-[8px] right-[8px] mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedClientId('all')
                        setIsClientDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedClientId === 'all' ? 'text-black font-semibold' : 'text-gray-700'}`}
                    >
                      Todos os clientes
                    </button>
                    {allClients.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedClientId(c.id)
                          setIsClientDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors truncate ${selectedClientId === c.id ? 'text-black font-semibold' : 'text-gray-700'}`}
                      >
                        {c.nome}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-[10px] h-[44px] mx-[8px] mb-[16px] px-[16px] bg-white/70 border border-white/50 rounded-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.9" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M16.5 16.5L21 21"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar projeto..." 
              className="flex-1 border-0 outline-none bg-transparent font-inherit text-[13.5px] min-w-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-[8px] pr-[6px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {filteredSites.length === 0 ? (
              <div className="p-4 text-center text-[#9CA3AF] text-[13.5px]">Nenhum site encontrado.</div>
            ) : (
              filteredSites.map(site => {
                const isSelected = selectedSite?.id === site.id
                
                return (
                  <button 
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className={`w-full text-left border rounded-[22px] p-[16px] cursor-pointer font-inherit transition-transform duration-150
                      ${isSelected 
                        ? 'border-[#111827] bg-[#111827] text-white shadow-[0_12px_24px_-12px_rgba(17,24,39,0.8)] translate-x-[4px]' 
                        : 'border-transparent bg-transparent hover:border-[#E5E7EB] hover:bg-white text-[#111827]'}`}
                  >
                    <p className="m-0 text-[15px] font-medium tracking-[-0.01em] truncate">{site.nome}</p>
                    <p className={`m-0 mt-[3px] text-[12px] truncate ${isSelected ? 'text-white/60' : 'text-[#6B7280]'}`}>{site.dominio}</p>
                    
                    {!isClientView && site.clientes && (
                       <p className={`m-0 mt-[3px] text-[10px] uppercase font-bold truncate ${isSelected ? 'text-white/40' : 'text-[#6214d1]'}`}>
                         {site.clientes.nome}
                       </p>
                    )}

                    <div className="flex items-center gap-[9px] mt-[11px]">
                      <span className={`w-[8px] h-[8px] rounded-full ${site.status === 'no_ar' ? 'bg-[#DFFF00]' : site.status === 'pausado' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                      <span className={`text-[11px] font-semibold ${isSelected ? 'text-white/60' : 'text-[#6B7280]'}`}>
                        {site.status === 'no_ar' ? 'Ativo' : site.status === 'pausado' ? 'Pausado' : 'Configurando'}
                      </span>
                    </div>

                    {isSelected && (
                      <Link 
                        href={isClientView ? `/dashboard/meus-sites/${site.id}` : `/dashboard/sites/${site.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-[5px] mt-[14px] px-[13px] py-[7px] rounded-[12px] bg-white text-[#111827] text-[12px] font-semibold"
                      >
                        <span>Gerenciar site</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.6" strokeLinecap="round">
                          <path d="M7 17L17 7M9 7h8v8"></path>
                        </svg>
                      </Link>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Col: Details & Analytics */}
        <div className="lg:col-span-8 flex flex-col gap-[22px]">
          
          {!selectedSite ? (
            <div className="bg-white border border-[#EFEFEF] rounded-[40px] p-[28px] flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
              <Globe className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-[15px]">Nenhum site selecionado</p>
              <p className="text-[13px]">Selecione um projeto na lista.</p>
            </div>
          ) : (
            <>
              {loadingAnalytics ? (
                <div className="bg-white border border-[#EFEFEF] rounded-[40px] p-[28px] flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                  <Activity className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-[13px]">Sincronizando dados...</p>
                </div>
              ) : (
                <>
                  {/* Google Search Console - 4 Metrics Grid (If Data Exists) */}
                  {selectedSite.integracoes_google && selectedSite.integracoes_google.length > 0 && gscData.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
                      <div className="bg-[#EAEAEA] border border-white/60 rounded-[32px] p-[20px]">
                        <div className="flex items-center justify-between mb-[20px]">
                          <span className="text-[13px] font-medium text-[#6B7280]">Total Cliques</span>
                          <span className="text-[10px] font-bold text-[#111827] bg-white px-[8px] py-[3px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)]">GSC</span>
                        </div>
                        <p className="m-0 text-[28px] font-semibold tracking-[-0.035em]">{totalClicks.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-[#EAEAEA] border border-white/60 rounded-[32px] p-[20px]">
                        <div className="flex items-center justify-between mb-[20px]">
                          <span className="text-[13px] font-medium text-[#6B7280]">Total Impr.</span>
                          <span className="text-[10px] font-bold text-[#111827] bg-white px-[8px] py-[3px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)]">GSC</span>
                        </div>
                        <p className="m-0 text-[28px] font-semibold tracking-[-0.035em]">{totalImpressions.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-[#EAEAEA] border border-white/60 rounded-[32px] p-[20px]">
                        <div className="flex items-center justify-between mb-[20px]">
                          <span className="text-[13px] font-medium text-[#6B7280]">CTR Médio</span>
                          <span className="text-[10px] font-bold text-[#111827] bg-white px-[8px] py-[3px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)]">GSC</span>
                        </div>
                        <p className="m-0 text-[28px] font-semibold tracking-[-0.035em]">{avgCtr}%</p>
                      </div>
                      <div className="bg-[#EAEAEA] border border-white/60 rounded-[32px] p-[20px]">
                        <div className="flex items-center justify-between mb-[20px]">
                          <span className="text-[13px] font-medium text-[#6B7280]">Posição</span>
                          <span className="text-[10px] font-bold text-[#111827] bg-white px-[8px] py-[3px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)]">GSC</span>
                        </div>
                        <p className="m-0 text-[28px] font-semibold tracking-[-0.035em]">{avgPosition}</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Graphic Card */}
                  <div className="bg-white border border-[#EFEFEF] rounded-[40px] p-[28px] lg:px-[30px]">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-[24px] gap-4">
                      <div className="flex flex-col gap-[4px]">
                        <div className="flex items-center gap-2">
                          {selectedPageUrl && (
                            <button 
                              onClick={() => setSelectedPageUrl(null)}
                              className="w-[26px] h-[26px] rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
                              title="Limpar filtro de página"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M15 18l-6-6 6-6"></path>
                              </svg>
                            </button>
                          )}
                          <p className="m-0 text-[19px] font-medium tracking-[-0.025em]">Tráfego Orgânico</p>
                        </div>
                        <p className="m-0 text-[13.5px] text-[#9CA3AF] flex items-center gap-1.5 mt-1">
                          <span>Search Console ·</span>
                          {selectedPageUrl ? (
                            <span className="font-medium text-[#111827]">{(selectedPageUrl.replace(`https://${selectedSite.dominio}`, '') === '' || selectedPageUrl.replace(`https://${selectedSite.dominio}`, '') === '/') ? 'Principal' : selectedPageUrl.replace(`https://${selectedSite.dominio}`, '')}</span>
                          ) : (
                            <span className="font-medium text-[#111827]">{selectedSite.dominio}</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2 self-start lg:self-end">
                          <div className="bg-[#F3F4F6] rounded-full p-[4px] flex gap-[4px]">
                            <button 
                              onClick={() => setChartType('bar')}
                              className={`h-[34px] px-[18px] border-0 rounded-full font-inherit text-[13px] font-semibold cursor-pointer transition-all ${chartType === 'bar' ? 'bg-white text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#6B7280]'}`}
                            >Barras</button>
                            <button 
                              onClick={() => setChartType('line')}
                              className={`h-[34px] px-[18px] border-0 rounded-full font-inherit text-[13px] font-semibold cursor-pointer transition-all ${chartType === 'line' ? 'bg-white text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#6B7280]'}`}
                            >Linha</button>
                          </div>
                          <div className="bg-[#F3F4F6] rounded-full p-[4px] flex flex-wrap gap-[4px]">
                            <button 
                              onClick={() => setDateFilter('hoje')}
                              className={`h-[34px] px-[18px] border-0 rounded-full font-inherit text-[13px] font-semibold cursor-pointer transition-all ${dateFilter === 'hoje' ? 'bg-white text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#6B7280]'}`}
                            >Hoje</button>
                            <button 
                              onClick={() => setDateFilter('7_dias')}
                              className={`h-[34px] px-[18px] border-0 rounded-full font-inherit text-[13px] font-semibold cursor-pointer transition-all ${dateFilter === '7_dias' ? 'bg-white text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#6B7280]'}`}
                            >7D</button>
                            <button 
                              onClick={() => setDateFilter('30_dias')}
                              className={`h-[34px] px-[18px] border-0 rounded-full font-inherit text-[13px] font-semibold cursor-pointer transition-all ${dateFilter === '30_dias' ? 'bg-white text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#6B7280]'}`}
                            >30D</button>
                            <button 
                              onClick={() => setDateFilter('periodo')}
                              className={`h-[34px] px-[18px] border-0 rounded-full font-inherit text-[13px] font-semibold cursor-pointer transition-all ${dateFilter === 'periodo' ? 'bg-white text-[#111827] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#6B7280]'}`}
                            >Outro</button>
                          </div>
                        </div>
                        {dateFilter === 'periodo' && (
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm self-start lg:self-end">
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
                      </div>
                    </div>

                    {!(selectedSite.integracoes_google && selectedSite.integracoes_google.length > 0) ? (
                      <div className="h-[220px] flex items-center justify-center text-[#9CA3AF] text-[13.5px]">
                        Google Search Console não vinculado a este site.
                      </div>
                    ) : gscData.length === 0 ? (
                      <div className="h-[220px] flex items-center justify-center text-[#9CA3AF] text-[13.5px]">
                        Nenhum dado encontrado para o período.
                      </div>
                    ) : (() => {
                      const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
                      const mesesFull = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
                      const diasSemana = ['dom','seg','ter','qua','qui','sex','sáb']
                      
                      const chartData = gscData.map((entry: any, idx: number) => {
                        let label = `${idx + 1}`
                        let fullDate = ''
                        const dateStr = entry?.date || entry?.keys?.[0]
                        if (dateStr && typeof dateStr === 'string' && dateStr.includes('-')) {
                          const parts = dateStr.split('-')
                          const y = parseInt(parts[0]), m = parseInt(parts[1]), day = parseInt(parts[2])
                          label = `${day}`
                          fullDate = `${String(day).padStart(2, '0')} de ${mesesFull[m - 1]} de ${y}`
                        }
                        return { label, fullDate, clicks: Number(entry?.clicks) || 0 }
                      })

                      const activeIdx = selectedBarIndex !== null ? selectedBarIndex : chartData.length - 1

                      const CustomTooltipContent = ({ active, payload }: any) => {
                        if (!active || !payload || !payload.length) return null
                        const data = payload[0]?.payload
                        return (
                          <div style={{ background: '#111827', borderRadius: '16px', padding: '10px 16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
                            <p style={{ color: '#DFFF00', fontSize: '11px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{data?.fullDate || ''}</p>
                            <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}>{data?.clicks ?? 0} cliques</p>
                          </div>
                        )
                      }

                      return (
                      <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'bar' ? (
                            <BarChart data={chartData} margin={{ top: 40, right: 4, bottom: 0, left: 4 }} barGap={2}>
                              <CartesianGrid stroke="none" />
                              <XAxis 
                                dataKey="label"
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                dy={8}
                                minTickGap={10}
                              />
                              <Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                              <Bar dataKey="clicks" name="Cliques" maxBarSize={36} shape={<CustomBar />}>
                                {chartData.map((_: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={index === activeIdx ? '#111827' : '#E5E7EB'} />
                                ))}
                              </Bar>
                            </BarChart>
                          ) : (
                            <LineChart data={chartData} margin={{ top: 10, right: 4, bottom: 0, left: 4 }}>
                              <CartesianGrid stroke="none" />
                              <XAxis 
                                dataKey="label"
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                dy={8}
                                minTickGap={10}
                              />
                              <Tooltip content={<CustomTooltipContent />} />
                              <Line type="monotone" dataKey="clicks" name="Cliques" stroke="#111827" strokeWidth={3} dot={{ fill: '#111827', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#DFFF00', stroke: '#111827', strokeWidth: 2 }} />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                      )
                    })()}
                  </div>

                  {/* WordPress & Blog Overview */}
                  {selectedSite.integracoes_wordpress && selectedSite.integracoes_wordpress.length > 0 && !selectedPageUrl && (
                    <div className="bg-white border border-[#EFEFEF] rounded-[40px] p-[28px] lg:p-[34px]">
                      <div className="flex flex-col lg:flex-row gap-[30px] lg:gap-[40px]">
                        
                        {/* Esquerda: Saúde WP */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-[12px] mb-[24px]">
                            <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center ${wpStatus ? 'bg-[#DCFCE7]' : 'bg-gray-100'}`}>
                              {loadingWp ? (
                                <Activity className="w-[22px] h-[22px] text-gray-400 animate-spin" />
                              ) : wpStatus ? (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.8" strokeLinecap="round">
                                  <rect x="3" y="4" width="18" height="7" rx="2"></rect><rect x="3" y="13" width="18" height="7" rx="2"></rect><path d="M7 7.5h.01M7 16.5h.01"></path>
                                </svg>
                              ) : (
                                <Unplug className="w-[22px] h-[22px] text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="m-0 text-[17px] font-semibold tracking-[-0.01em]">{loadingWp ? 'Verificando...' : wpStatus ? 'Blog sincronizado' : 'Sem conexão com o blog'}</p>
                              <p className="m-0 mt-[2px] text-[13.5px] text-[#9CA3AF]">Gestão de conteúdo</p>
                            </div>
                          </div>
                          
                          {!loadingWp && (
                            <div className="flex flex-col flex-1 justify-center gap-2">
                              <div className="flex items-center justify-between py-[14px] border-t border-[#F3F4F6]">
                                <span className="text-[14px] text-[#6B7280]">Publicados</span>
                                <span className="text-[14px] font-semibold">{wpPosts.filter(p => p.status === 'publish').length}</span>
                              </div>
                              <div className="flex items-center justify-between py-[14px] border-t border-[#F3F4F6]">
                                <span className="text-[14px] text-[#6B7280]">Agendados</span>
                                <span className="text-[14px] font-semibold">{wpPosts.filter(p => p.status === 'future').length}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Divisor Desktop */}
                        <div className="hidden lg:block w-[1px] bg-[#F1F1F1]"></div>

                        {/* Direita: Últimos Posts */}
                        <div className="flex-[1.8] flex flex-col">
                          <div className="flex items-center justify-between mb-[20px]">
                            <p className="m-0 text-[18px] font-medium tracking-[-0.02em]">Últimas publicações</p>
                            {!isClientView && (
                               <Link href={`/dashboard/sites/${selectedSite.id}?tab=blog`} className="h-[36px] px-[18px] border-0 rounded-full bg-[#111827] text-white font-inherit text-[13px] font-semibold cursor-pointer inline-flex items-center justify-center hover:bg-black transition-colors">
                                 Abrir blog
                               </Link>
                            )}
                          </div>
                          
                          {loadingWp ? (
                             <div className="flex-1 flex items-center justify-center"><p className="text-[13.5px] text-[#9CA3AF]">Carregando...</p></div>
                          ) : wpPosts.length === 0 ? (
                             <div className="flex-1 flex items-center justify-center"><p className="text-[13.5px] text-[#9CA3AF]">Nenhuma publicação recente.</p></div>
                          ) : (
                            <div className="flex flex-col mt-auto">
                              {wpPosts.slice(0, 3).map((post: any, idx: number) => {
                                let title = post.title?.raw || post.title?.rendered || 'Sem título'
                                title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
                                
                                return (
                                  <div key={post.id} className={`flex items-center gap-[14px] py-[12px] ${idx !== 0 ? 'border-t border-[#F3F4F6]' : ''}`}>
                                    <div className="w-[42px] h-[42px] flex-none rounded-[12px] bg-[#F3F4F6] flex items-center justify-center">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.7" strokeLinecap="round">
                                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5M9 13h6M9 17h4"></path>
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="m-0 text-[14px] font-medium leading-[1.35] truncate">{title}</p>
                                      <p className="m-0 mt-[3px] text-[12px] text-[#9CA3AF]">{new Date(post.date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Páginas Indexadas */}
                  {selectedSite.integracoes_google && selectedSite.integracoes_google.length > 0 && !selectedPageUrl && indexedPages.length > 0 && (
                    <div className="bg-white border border-[#EFEFEF] rounded-[40px] p-[28px] lg:px-[30px]">
                      <p className="m-0 mb-[4px] text-[18px] font-medium tracking-[-0.02em]">Páginas indexadas</p>
                      <p className="m-0 mb-[18px] text-[13px] text-[#9CA3AF]">{indexedPages.length} páginas no índice do Google</p>
                      
                      <div className="flex flex-col">
                        {indexedPages.slice(0, 5).map((page: any, idx: number) => {
                          const rawUrl = page.keys[0]
                          const formattedUrl = (rawUrl.replace(`https://${selectedSite.dominio}`, '') === '' || rawUrl.replace(`https://${selectedSite.dominio}`, '') === '/') 
                            ? 'Página Principal' 
                            : rawUrl.replace(`https://${selectedSite.dominio}`, '')
                          
                          return (
                            <div key={idx} className="flex items-center gap-[14px] py-[14px] border-t border-[#F3F4F6] cursor-pointer hover:bg-gray-50" onClick={() => setSelectedPageUrl(rawUrl)}>
                              <div className="flex-1 min-w-0">
                                <p className="m-0 text-[13.5px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{formattedUrl}</p>
                                <p className="m-0 mt-[3px] text-[12px] text-[#9CA3AF]">{page.clicks.toLocaleString('pt-BR')} cliques</p>
                              </div>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7"></path></svg>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
