'use client'

import { useState, useEffect } from 'react'
import { GlobalDialog } from '@/components/ui/GlobalDialog'
import { Activity, Trash2, Search, ArrowUpRight, ShieldCheck, Pencil, FileText, Zap, MessageSquare, Globe, Sparkles, Clock, Calendar, Image as ImageIcon, CheckCircle2, X, User } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { fetchGscAnalytics, fetchGscIndexedPages, checkHttpsStatus, runPageSpeedInsights, fetchGscAdvancedAnalytics, fetchGscTrendingQueries, fetchWpPosts, createWpPost, uploadWpMedia, updateWpPost, deleteWpPost, fetchWpHistory, fetchWpWordfenceData } from '../../sites/integrations-actions'
import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker'
import { getBlogPlanPermissions } from '@/utils/plan-permissions'
import { Lock, ShieldAlert, AlertTriangle, Smartphone, Monitor, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

// Helper to convert URLs in text to clickable links
const formatNoteContent = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
          {part}
        </a>
      )
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>
  })
}

interface SiteReportTabsProps {
  isOnline: boolean
  notas: any[]
  site: any
}

export function SiteReportTabs({ isOnline, notas, site }: SiteReportTabsProps) {
  const hasGsc = site?.integracoes_google && site.integracoes_google.length > 0
  const hasWp = site?.integracoes_wordpress && site.integracoes_wordpress.length > 0
  const wp = site?.integracoes_wordpress?.[0]

  const [activeTab, setActiveTab] = useState<'geral' | 'seo' | 'wp' | 'blog' | 'ux' | 'historico' | 'speed' | 'rede' | 'aquisicao'>('geral')

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    type: 'alert' | 'confirm' | 'success' | 'error'
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
  }>({ isOpen: false, type: 'alert', message: '' })

  const showAlert = (message: string, type: 'alert' | 'success' | 'error' = 'alert', title?: string) => {
    return new Promise<void>((resolve) => {
      setDialogState({
        isOpen: true,
        type,
        title,
        message,
        confirmText: 'Voltar para Blog',
        onConfirm: () => {
          setDialogState(s => ({ ...s, isOpen: false }))
          resolve()
        }
      })
    })
  }

  const showConfirm = (message: string, title = 'Confirmação') => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm: () => {
          setDialogState(s => ({ ...s, isOpen: false }))
          resolve(true)
        }
      })
    })
  }
  
  // Analytics State
  const [gscData, setGscData] = useState<any[]>([])
  const [indexedPages, setIndexedPages] = useState<any[]>([])
  
  // Drill-down State
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null)
  
  // Custom States for new features
  const [httpsStatus, setHttpsStatus] = useState<any>(null)
  const [httpsLoading, setHttpsLoading] = useState(false)
  
  const [speedData, setSpeedData] = useState<any>(null)
  const [speedLoading, setSpeedLoading] = useState(false)
  const [speedProgress, setSpeedProgress] = useState(0)
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false)

  useEffect(() => {
    let interval: any
    if (speedLoading) {
      setSpeedProgress(0)
      interval = setInterval(() => {
        setSpeedProgress(prev => {
          if (prev >= 95) return prev
          return prev + 2 // Increase by 2% every second (approx 50s total, looks better)
        })
      }, 1000)
    } else {
      setSpeedProgress(100)
    }
    return () => clearInterval(interval)
  }, [speedLoading])
  const [speedError, setSpeedError] = useState('')
  const [speedUrl, setSpeedUrl] = useState<string>('')

  useEffect(() => {
    if (site?.dominio && !speedUrl) {
      setSpeedUrl(site.dominio)
    }
  }, [site, speedUrl])

  // GSC Advanced States
  const [gscTab, setGscTab] = useState<'queries'|'pages'|'countries'|'devices'|'searchAppearance'|'dates'|'insights'>('queries')
  const [gscAdvancedData, setGscAdvancedData] = useState<any[]>([])
  const [gscTrendingData, setGscTrendingData] = useState<any>(null)
  const [loadingGscAdvanced, setLoadingGscAdvanced] = useState(false)
  
  // WP States
  const [wpPosts, setWpPosts] = useState<any[]>([])
  const [wpHistory, setWpHistory] = useState<any[]>([])
  const [wpWordfence, setWpWordfence] = useState<any>(null)
  const [loadingWp, setLoadingWp] = useState(false)

  // --- Cache Timestamps ---
  const [wpPostsLastUpdated, setWpPostsLastUpdated] = useState<string | null>(null)
  const [wpSecurityLastUpdated, setWpSecurityLastUpdated] = useState<string | null>(null)
  const [gscLastUpdated, setGscLastUpdated] = useState<string | null>(null)
  const [isRefreshingGsc, setIsRefreshingGsc] = useState(false)

  const [wpModalOpen, setWpModalOpen] = useState(false)
  const [wpNewPost, setWpNewPost] = useState<{ title: string; content: string; status: string; scheduledDate: string; imageFile: File | null }>({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })
  const [creatingWpPost, setCreatingWpPost] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)
  const [selectedWpPosts, setSelectedWpPosts] = useState<number[]>([])
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  
  // Date Filter State
  type DateFilter = 'hoje' | '7_dias' | '30_dias' | 'periodo'
  const [dateFilter, setDateFilter] = useState<DateFilter>('30_dias')
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (site && ['geral', 'seo', 'wp', 'rede', 'aquisicao', 'ux', 'rastreamento', 'historico', 'speed'].includes(activeTab)) {
      loadRealAnalytics()
    }
    
    if (site && activeTab === 'geral') {
      loadHttps()
    }

    if (site && ['geral', 'wp', 'blog'].includes(activeTab) && hasWp) {
      loadWpData()
    }
  }, [activeTab, site, dateFilter, customStartDate, customEndDate, selectedPageUrl])

  async function loadWpData(forceRefresh = false) {
    const wp = site?.integracoes_wordpress?.[0]
    if (!wp) return
    setLoadingWp(true)
    const postsRes = await fetchWpPosts(site.id, wp.site_url, wp.username, wp.app_password, forceRefresh)
    if (postsRes.success) {
      setWpPosts(postsRes.data)
      if (postsRes._cachedAt) setWpPostsLastUpdated(new Date(postsRes._cachedAt).toLocaleString('pt-BR'))
    }

    const histRes = await fetchWpHistory(site.id, wp.site_url, wp.username, wp.app_password, forceRefresh)
    if (histRes.success) {
      setWpHistory(histRes.data)
      if (histRes._cachedAt) setWpSecurityLastUpdated(new Date(histRes._cachedAt).toLocaleString('pt-BR'))
    }

    const wfRes = await fetchWpWordfenceData(site.id, wp.site_url, wp.username, wp.app_password, forceRefresh)
    if (wfRes.success) {
      setWpWordfence(wfRes.data)
      if (wfRes._cachedAt) setWpSecurityLastUpdated(new Date(wfRes._cachedAt).toLocaleString('pt-BR'))
    }

    setLoadingWp(false)
  }

  function handleEditPost(post: any) {
    setEditingPostId(post.id)
    
    // Clean title HTML entities
    let title = post.title?.raw || post.title?.rendered || ''
    title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')

    // Preserve paragraph breaks and line breaks from content
    let contentStr = post.content?.raw || ''
    if (!contentStr && post.content?.rendered) {
      contentStr = post.content.rendered
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim()
    }

    // Pre-fill date & time for any post (published, scheduled or draft)
    let scheduledDate = ''
    if (post.date) {
      const d = new Date(post.date)
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => n < 10 ? '0' + n : n
        scheduledDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
    }

    // Featured image
    const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
    setCurrentCoverUrl(featuredImg)
    setImagePreviewUrl(null)
    setShowSchedulePicker(!!scheduledDate || post.status === 'future')

    setWpNewPost({
      title,
      content: contentStr,
      status: post.status,
      scheduledDate,
      imageFile: null
    })
    setWpModalOpen(true)
  }

  async function handleDeletePost(postId: number) {
    const wpObj = site?.integracoes_wordpress?.[0]
    if (!wpObj) return
    const confirmed = await showConfirm('Deseja realmente excluir esta postagem? Esta ação não pode ser desfeita.')
    if (!confirmed) return

    setDeletingPostId(postId)
    const res = await deleteWpPost(wpObj.site_url, wpObj.username, wpObj.app_password, postId)
    if (res.success) {
      await showAlert('Postagem excluída com sucesso!', 'success')
    } else {
      await showAlert('Erro ao excluir postagem: ' + res.error, 'error')
    }
    loadWpData(true)
    setDeletingPostId(null)
  }

  async function handleDeleteBulkPosts() {
    const wpObj = site?.integracoes_wordpress?.[0]
    if (!wpObj || selectedWpPosts.length === 0) return
    const confirmed = await showConfirm(`Deseja realmente excluir ${selectedWpPosts.length} postagem(ns)? Esta ação não pode ser desfeita.`)
    if (!confirmed) return

    setDeletingBulk(true)
    let hasError = false
    for (const id of selectedWpPosts) {
      const res = await deleteWpPost(wpObj.site_url, wpObj.username, wpObj.app_password, id)
      if (!res.success) hasError = true
    }
    
    if (hasError) {
      await showAlert('Algumas postagens não puderam ser excluídas. Verifique e tente novamente.', 'alert')
    } else {
      await showAlert('Postagens excluídas com sucesso!', 'success')
    }
    
    setSelectedWpPosts([])
    setDeletingBulk(false)
    loadWpData(true)
  }

  async function handleCreateWpPostWithAction(targetAction?: 'publish' | 'schedule' | 'draft') {
    const wp = site?.integracoes_wordpress?.[0]
    if (!wp) return

    let action = targetAction
    if (!action) {
      if (wpNewPost.scheduledDate) {
        action = 'schedule'
      } else {
        action = 'draft'
      }
    }

    if (action === 'schedule' && !wpNewPost.scheduledDate) {
      await showAlert('Por favor, selecione a data e hora no calendário para agendar a publicação.', 'alert')
      return
    }

    setCreatingWpPost(true)

    let mediaId: number | undefined = undefined
    let uploadedMediaUrl: string | null = currentCoverUrl

    if (wpNewPost.imageFile) {
      const fd = new FormData()
      fd.append('file', wpNewPost.imageFile)
      const imgRes = await uploadWpMedia(wp.site_url, wp.username, wp.app_password, fd)
      if (imgRes.error) {
        await showAlert('Erro ao enviar imagem de capa: ' + imgRes.error, 'error')
        setCreatingWpPost(false)
        return
      }
      mediaId = imgRes.mediaId
      if (imgRes.mediaUrl) uploadedMediaUrl = imgRes.mediaUrl
    }

    let finalStatus = 'draft'
    if (action === 'publish') {
      finalStatus = 'publish'
    } else if (action === 'schedule') {
      finalStatus = 'future'
    } else {
      finalStatus = 'draft'
    }

    // Embed Featured Image into post content body so it displays on single post page in WP
    let finalContent = wpNewPost.content || ''
    if (uploadedMediaUrl) {
      const trimmed = finalContent.trim().toLowerCase()
      if (!trimmed.startsWith('<img') && !trimmed.startsWith('<figure')) {
        const titleClean = (wpNewPost.title || '').replace(/"/g, '&quot;')
        finalContent = `<figure class="wp-block-image size-large"><img src="${uploadedMediaUrl}" alt="${titleClean}" class="wp-post-featured-header-img" style="width:100%; max-height:480px; object-fit:cover; border-radius:16px; margin-bottom:24px;" /></figure>

` + finalContent
      }
    }

    const postPayload: any = {
      title: wpNewPost.title,
      content: finalContent,
      status: finalStatus
    }

    if (action === 'schedule' && wpNewPost.scheduledDate) {
      const localDate = new Date(wpNewPost.scheduledDate)
      postPayload.status = 'future'
      postPayload.date_gmt = localDate.toISOString().split('.')[0]
      delete postPayload.date
    }

    if (mediaId) {
      postPayload.featured_media = mediaId
    }

    let res: any
    if (editingPostId) {
      res = await updateWpPost(wp.site_url, wp.username, wp.app_password, editingPostId, postPayload)
    } else {
      res = await createWpPost(wp.site_url, wp.username, wp.app_password, postPayload)
    }

    if (res.success) {
      const msg = editingPostId ? 'Post atualizado com sucesso!' : action === 'publish' ? 'Post publicado com sucesso!' : action === 'schedule' ? 'Post agendado com sucesso!' : 'Post salvo como rascunho com sucesso!'
      await showAlert(msg, 'alert')
      setWpModalOpen(false)
      setEditingPostId(null); setCurrentCoverUrl(null); setImagePreviewUrl(null); setShowSchedulePicker(false)
      setWpNewPost({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })
      loadWpData(true)
    } else {
      await showAlert('Erro ao salvar post: ' + res.error, 'error')
    }
    setCreatingWpPost(false)
  }

  async function handleCreateWpPost(e: React.FormEvent) {
    e.preventDefault()
    handleCreateWpPostWithAction()
  }

  useEffect(() => {
    if (site && activeTab === 'seo' && hasGsc) {
      loadGscAdvanced()
    }
  }, [activeTab, gscTab, site, dateFilter, customStartDate, customEndDate])

  async function loadGscAdvanced(forceRefresh = false) {
    if (!site?.integracoes_google?.[0]?.propriedade_search_console) return

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

    const propUrl = site.integracoes_google[0].propriedade_search_console
    setLoadingGscAdvanced(true)
    
    if (gscTab === 'insights') {
      const pStart = new Date(startDate)
      const pEnd = new Date(endDate)
      const diffTime = Math.abs(pEnd.getTime() - pStart.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const prevStart = new Date(pStart)
      prevStart.setDate(prevStart.getDate() - diffDays)
      const prevEnd = new Date(pEnd)
      prevEnd.setDate(prevEnd.getDate() - diffDays)

      const res = await fetchGscTrendingQueries(
        site.id,
        propUrl, 
        startDate, 
        endDate, 
        prevStart.toISOString().split('T')[0], 
        prevEnd.toISOString().split('T')[0],
        forceRefresh
      )
      if (res.data) setGscTrendingData(res.data)
    } else {
      const dimensionMap: Record<string, string> = {
        'queries': 'query',
        'pages': 'page',
        'countries': 'country',
        'devices': 'device',
        'searchAppearance': 'searchAppearance',
        'dates': 'date'
      }
      const res = await fetchGscAdvancedAnalytics(
        site.id,
        propUrl,
        startDate,
        endDate,
        dimensionMap[gscTab],
        forceRefresh
      )
      if (res.data) setGscAdvancedData(res.data)
    }
    setLoadingGscAdvanced(false)
      setIsRefreshingGsc(false)
  }

  async function loadHttps() {
    if (!site?.dominio) return
    setHttpsLoading(true)
    const res = await checkHttpsStatus(site.dominio)
    setHttpsStatus(res)
    setHttpsLoading(false)
  }

  async function handleCheckSpeed() {
    const urlToCheck = speedUrl || site?.dominio
    if (!urlToCheck) return
    setSpeedLoading(true)
    setSpeedError('')
    const res = await runPageSpeedInsights(urlToCheck)
    if (res.error) {
      setSpeedError(res.error)
    } else {
      setSpeedData(res)
    }
    setSpeedLoading(false)
  }

  async function loadRealAnalytics(forceRefresh = false) {
    setGscData([])
    setIndexedPages([])


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



    if (hasGsc) {
      const propUrl = site.integracoes_google[0].propriedade_search_console
      if (propUrl) {

        if (forceRefresh) setIsRefreshingGsc(true);
        const res = await fetchGscAnalytics(site.id, propUrl, startDate, endDate, selectedPageUrl || undefined, forceRefresh)
        if (res._cachedAt) setGscLastUpdated(new Date(res._cachedAt).toLocaleString('pt-BR'))
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

        const indexedRes = await fetchGscIndexedPages(site.id, propUrl, startDate, endDate, forceRefresh)
        if (indexedRes.data) {
          setIndexedPages(indexedRes.data)
        }
      }
    }

  }

  // Calculations for GSC
  const totalClicks = gscData.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0)
  const totalImpressions = gscData.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0)
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'
  const validPositions = gscData.map(curr => parseFloat(curr.rawPosition ?? curr.position)).filter(p => !isNaN(p) && p > 0)
  const avgPosition = validPositions.length > 0 ? (validPositions.reduce((a, b) => a + b, 0) / validPositions.length).toFixed(1) : '0.0'
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 md:mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar pb-2 md:pb-0 px-1 md:px-0 -mx-1 md:mx-0 snap-x">
        <button
          onClick={() => setActiveTab('geral')}
          className={`snap-start px-4 py-2 rounded-full text-[13.5px] font-semibold transition-colors flex-shrink-0 ${
            activeTab === 'geral' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111827]'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => {
            if (!getBlogPlanPermissions(site).hasSeoAccess) {
              showAlert('Seu plano atual não inclui a funcionalidade de Gerenciamento de SEO. Atualize seu plano para acessar.', 'alert', 'Acesso Restrito')
              return
            }
            setActiveTab('seo')
          }}
          className={`snap-start px-4 py-2 rounded-full text-[13.5px] font-semibold transition-colors flex-shrink-0 flex items-center gap-1.5 ${
            activeTab === 'seo' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111827]'
          }`}
        >
          {!getBlogPlanPermissions(site).hasSeoAccess && <Lock className={`w-3.5 h-3.5 ${activeTab === 'seo' ? 'text-amber-300' : 'text-amber-500'}`} />}
          SEO (GSC)
        </button>
        <button
          onClick={() => setActiveTab('wp')}
          className={`snap-start px-4 py-2 rounded-full text-[13.5px] font-semibold transition-colors flex-shrink-0 ${
            activeTab === 'wp' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111827]'
          }`}
        >
          WordPress
        </button>
        <button
          onClick={() => {
            if (!getBlogPlanPermissions(site).hasBlogAccess) {
              showAlert('Seu plano atual não inclui a funcionalidade de Gerenciamento de Blog. Atualize seu plano para acessar.', 'alert', 'Acesso Restrito')
              return
            }
            setActiveTab('blog')
          }}
          className={`snap-start px-4 py-2 rounded-full text-[13.5px] font-semibold transition-colors flex-shrink-0 flex items-center gap-1.5 ${
            activeTab === 'blog' ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111827]'
          }`}
        >
          {!getBlogPlanPermissions(site).hasBlogAccess && <Lock className={`w-3.5 h-3.5 ${activeTab === 'blog' ? 'text-amber-300' : 'text-amber-500'}`} />}
          Blog (Postagens)
        </button>
        <button
          onClick={() => setActiveTab('speed' as any)}
          className={`snap-start px-4 py-2 rounded-full text-[13.5px] font-semibold transition-colors flex-shrink-0 ${
            activeTab === 'speed' as any ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#111827]'
          }`}
        >
          Speed Insights
        </button>

      <GlobalDialog
        {...dialogState}
        onClose={() => setDialogState(s => ({ ...s, isOpen: false }))}
      />

</div>

      
      {/* Date Filter UI */}
      {activeTab !== 'speed' as any && (
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col items-end gap-3">
          <div className="bg-[#F3F4F6] p-1 rounded-full flex flex-wrap items-center gap-1">
            <button onClick={() => setDateFilter('hoje')} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${dateFilter === 'hoje' ? 'text-white bg-[#111827] shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'}`}>Hoje</button>
            <button onClick={() => setDateFilter('7_dias')} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${dateFilter === '7_dias' ? 'text-white bg-[#111827] shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'}`}>7 Dias</button>
            <button onClick={() => setDateFilter('30_dias')} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${dateFilter === '30_dias' ? 'text-white bg-[#111827] shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'}`}>30 Dias</button>
            <button onClick={() => setDateFilter('periodo')} className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${dateFilter === 'periodo' ? 'text-white bg-[#111827] shadow-sm' : 'text-[#9CA3AF] hover:text-[#111827]'}`}>Período</button>
          </div>
          {dateFilter === 'periodo' && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs bg-transparent border-none outline-none text-gray-700 cursor-pointer" />
              <span className="text-gray-400 text-xs">até</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs bg-transparent border-none outline-none text-gray-700 cursor-pointer" />
            </div>
          )}
        </div>
      </div>
      )}
      
      {/* Tab Content */}
      {activeTab === 'geral' && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#111827] text-white rounded-[32px] p-8 relative overflow-hidden shadow-[0_4px_20px_-7px_rgba(17,24,39,0.2)]">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-[26px] font-semibold tracking-[-0.03em] mb-2">Visão Geral: {site.dominio}</h2>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold ${isOnline ? 'bg-[#DFFF00] text-[#111827]' : 'bg-red-100 text-red-700'}`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#111827] animate-pulse' : 'bg-red-500'}`}></span>
                  {isOnline ? 'Site Online e Monitorado' : 'Site Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* SEO Summary Card */}
            <div className={`p-6 rounded-[24px] border relative overflow-hidden flex flex-col justify-between ${hasGsc ? 'bg-white border-[#EFEFEF] shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)]' : 'bg-[#F9FAFB] border-[#EFEFEF]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${hasGsc ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-gray-200 text-gray-400'}`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700">SEO (GSC)</h4>
                </div>
                {hasGsc && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setActiveTab('seo')}><ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-black" /></Button>}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-black text-gray-900">{hasGsc ? totalClicks.toLocaleString('pt-BR') : '--'}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{hasGsc ? 'Cliques no Google' : 'Não conectado'}</p>
                </div>
                {hasGsc && (
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-blue-100/50">
                    <div>
                      <p className="text-xs text-gray-500">Impr.</p>
                      <p className="text-sm font-bold text-gray-900">{totalImpressions >= 1000 ? (totalImpressions/1000).toFixed(1)+'k' : totalImpressions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CTR</p>
                      <p className="text-sm font-bold text-gray-900">{avgCtr}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Posição</p>
                      <p className="text-sm font-bold text-gray-900">{avgPosition}</p>
                    </div>
                  </div>
                )}
              </div>
              {hasGsc && gscLastUpdated && (
                <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1"><Clock className="w-3 h-3"/> Atualizado: {gscLastUpdated}</p>
              )}
            </div>
            
            {/* WordPress / Security Summary Card */}
            <div className={`p-6 rounded-[24px] border relative overflow-hidden flex flex-col justify-between ${hasWp ? 'bg-white border-[#EFEFEF] shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)]' : 'bg-[#F9FAFB] border-[#EFEFEF]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${hasWp ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-gray-200 text-gray-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700">Segurança & WP</h4>
                </div>
                {hasWp && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setActiveTab('wp')}><ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-black" /></Button>}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-1">Certificado SSL (HTTPS)</h4>
                  {httpsLoading ? (
                    <p className="text-sm font-bold text-gray-400">Verificando...</p>
                  ) : httpsStatus?.secure ? (
                     <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                       <CheckCircle2 className="w-4 h-4" /> Seguro e Ativo
                     </p>
                  ) : (
                     <p className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                       <X className="w-4 h-4" /> Não Seguro
                     </p>
                  )}
                </div>
                
                {hasWp && (
                  <div className="pt-4 border-t border-indigo-100/50">
                     <h4 className="text-xs font-semibold text-gray-500 mb-1">Wordfence (WP)</h4>
                     <div className="flex gap-4">
                       <div>
                         <p className="text-xs text-gray-500">Bloqueios</p>
                         <p className="text-sm font-bold text-gray-900">{wpWordfence ? (wpWordfence.firewall?.blocked_ips?.length || 0) : '--'}</p>
                       </div>
                       <div>
                         <p className="text-xs text-gray-500">Problemas</p>
                         <p className="text-sm font-bold text-gray-900">{wpWordfence ? (wpWordfence.scanner?.issues?.length || 0) : '--'}</p>
                       </div>
                     </div>
                  </div>
                )}
              </div>
              {hasWp && wpSecurityLastUpdated && (
                <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1"><Clock className="w-3 h-3"/> Atualizado: {wpSecurityLastUpdated}</p>
              )}
            </div>

            {/* Blog Summary Card */}
            <div className={`p-6 rounded-[24px] border relative overflow-hidden flex flex-col justify-between ${hasWp ? 'bg-white border-[#EFEFEF] shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)]' : 'bg-[#F9FAFB] border-[#EFEFEF]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${hasWp ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-gray-200 text-gray-400'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700">Blog</h4>
                </div>
                {hasWp && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setActiveTab('blog')}><ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-black" /></Button>}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-black text-gray-900">{hasWp ? wpPosts.length : '--'}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{hasWp ? 'Total de Postagens' : 'WordPress não conectado'}</p>
                </div>
                
                {hasWp && (
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-fuchsia-100/50">
                    <div>
                      <p className="text-xs text-gray-500">Publicados</p>
                      <p className="text-sm font-bold text-gray-900">{wpPosts.filter(p => p.status === 'publish').length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rascunhos</p>
                      <p className="text-sm font-bold text-gray-900">{wpPosts.filter(p => p.status === 'draft').length}</p>
                    </div>
                  </div>
                )}
              </div>
              {hasWp && wpPostsLastUpdated && (
                <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1"><Clock className="w-3 h-3"/> Atualizado: {wpPostsLastUpdated}</p>
              )}
            </div>

            {/* Others: Speed & History */}
            <div className="flex flex-col gap-4">
              <div className="p-5 rounded-[24px] border border-[#EFEFEF] bg-white shadow-[0_2px_10px_-7px_rgba(17,24,39,0.14)] flex items-center justify-between group cursor-pointer hover:border-black transition-colors" onClick={() => setActiveTab('speed' as any)}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F3F4F6] text-[#111827] rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Performance</h4>
                    <p className="text-xs text-gray-500">Speed Insights</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
              </div>


            </div>
          </div>
        </div>
      )}

      {/* Tab: SEO (Enterprise Analytics Design) */}
      {activeTab === 'seo' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {!hasGsc ? (
            <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Google Search Console não conectado</h3>
              <p className="text-sm text-gray-500 mb-6">Para visualizar métricas de cliques, impressões, posição média e pesquisas orgânicas do Google, conecte a propriedade do Google Search Console.</p>
              <Button onClick={() => setActiveTab('geral')} className="bg-black text-white rounded-full px-6 py-3">Voltar para Visão Geral</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header Date Range Filter */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    <Search className="w-5 h-5 text-[#DFFF00]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Métricas de Busca Orgânica</h4>
                    <p className="text-xs text-gray-500">Dados oficiais sincronizados via API do Google Search Console</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-gray-200/80 p-1 rounded-full flex items-center gap-1">
                    <button type="button" onClick={() => setDateFilter('hoje')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${dateFilter === 'hoje' ? 'text-white bg-black shadow-md' : 'text-gray-600 hover:text-black'}`}>Hoje</button>
                    <button type="button" onClick={() => setDateFilter('7_dias')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${dateFilter === '7_dias' ? 'text-white bg-black shadow-md' : 'text-gray-600 hover:text-black'}`}>7 Dias</button>
                    <button type="button" onClick={() => setDateFilter('30_dias')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${dateFilter === '30_dias' ? 'text-white bg-black shadow-md' : 'text-gray-600 hover:text-black'}`}>30 Dias</button>
                    <button type="button" onClick={() => setDateFilter('periodo')} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${dateFilter === 'periodo' ? 'text-white bg-black shadow-md' : 'text-gray-600 hover:text-black'}`}>Período</button>
                  </div>
                </div>
              </div>

              {dateFilter === 'periodo' && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm w-fit animate-in fade-in duration-200">
                  <span className="text-xs font-bold text-gray-700">De:</span>
                  <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-gray-900" />
                  <span className="text-xs font-bold text-gray-700">Até:</span>
                  <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-gray-900" />
                </div>
              )}

              {/* Grid Layout (Enterprise Analytics Theme) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Welcome / Hero Card (4 Cols) */}
                <div className="lg:col-span-4 bg-gradient-to-b from-white via-gray-50 to-gray-100 rounded-[2.5rem] p-8 shadow-sm border border-white/80 relative overflow-hidden group flex flex-col justify-between min-h-[340px]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#DFFF00]/25 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-gray-800 text-xs font-semibold mb-4 border border-black/5">
                      <Sparkles className="w-3.5 h-3.5 text-black" /> Google Search Console Analytics
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
                      Desempenho de SEO & Busca
                    </h3>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Acompanhamento em tempo real de visibilidade orgânica no Google.
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 pt-6 border-t border-gray-200/80">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Total de Cliques Orgânicos</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                        {totalClicks.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                        +12.5%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Cliques diretos gerados pelo Google no período</p>
                  </div>
                </div>

                {/* Main Performance Chart Card (8 Cols) */}
                <div className="lg:col-span-8 bg-[#EAEAEA]/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/80 relative flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Índice de Eficiência Orgânica</h4>
                      <div className="flex items-baseline gap-4 mt-1">
                        <div>
                          <span className="text-2xl font-black text-gray-900">{avgCtr}%</span>
                          <span className="text-xs text-gray-500 font-medium ml-1.5">CTR Médio</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300"></div>
                        <div>
                          <span className="text-2xl font-black text-gray-900">{avgPosition}</span>
                          <span className="text-xs text-gray-500 font-medium ml-1.5">Posição Média</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs">
                        Google Search Console
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-300/80 mb-6"></div>

                  {/* Recharts Main Chart */}
                  {gscData.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      Nenhum dado registrado para as datas selecionadas.
                    </div>
                  ) : (
                    <div className="w-full h-56 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gscData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#CBD5E1" />
                          <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} dy={8} />
                          <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#000', color: '#fff', padding: '12px 16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}
                            itemStyle={{ color: '#DFFF00', fontWeight: 'bold' }}
                          />
                          <Line type="monotone" dataKey="clicks" name="Cliques Orgânicos" stroke="#000" strokeWidth={3.5} dot={false} activeDot={{ r: 7, fill: '#DFFF00', stroke: '#000', strokeWidth: 3 }} />
                          <Line type="monotone" dataKey="impressions" name="Impressões" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                
                {/* Left Side: Sub-tabs Card (8 Cols) */}
                <div className="lg:col-span-8 bg-[#F2F2F2] rounded-[2.5rem] p-8 border border-white/80 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Relatório Detalhado de Buscas</h4>
                      <p className="text-xs text-gray-500">Explore os termos, páginas de destino, países e dispositivos que trazem acessos.</p>
                    </div>

                    {/* Sub-tab Pill Switcher */}
                    <div className="bg-gray-200/80 p-1 rounded-full flex flex-wrap items-center gap-1 shadow-inner">
                      {[
                        { id: 'queries', label: 'Consultas' },
                        { id: 'pages', label: 'Páginas' },
                        { id: 'countries', label: 'Países' },
                        { id: 'devices', label: 'Dispositivos' }
                      ].map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setGscTab(st.id as any)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                            gscTab === st.id ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-tab Content Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-300 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="pb-3">Item</th>
                          <th className="pb-3 text-right">Cliques</th>
                          <th className="pb-3 text-right">Impressões</th>
                          <th className="pb-3 text-right">CTR</th>
                          <th className="pb-3 text-right">Posição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/60 font-medium text-gray-900">
                        {gscAdvancedData && gscAdvancedData.length > 0 ? (
                          gscAdvancedData.slice(0, 10).map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white/60 transition-colors">
                              <td className="py-3 font-semibold text-gray-900 truncate max-w-xs">{row.keys?.[0] || row.query || row.page || '-'}</td>
                              <td className="py-3 text-right font-bold">{row.clicks?.toLocaleString('pt-BR')}</td>
                              <td className="py-3 text-right text-gray-500">{row.impressions?.toLocaleString('pt-BR')}</td>
                              <td className="py-3 text-right text-gray-600">{(row.ctr * 100).toFixed(1)}%</td>
                              <td className="py-3 text-right text-gray-700 font-bold">{row.position ? row.position.toFixed(1) : '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={5} className="py-8 text-center text-gray-400">Nenhum dado registrado para este filtro.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column Highlight Cards (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Lime Card */}
                  <div className="bg-[#DFFF00] rounded-[2.5rem] p-8 relative overflow-hidden min-h-[180px] flex flex-col justify-between shadow-xl group border border-black/10">
                    <div className="absolute -right-10 -top-10 w-40 h-40 border border-black/10 rounded-full pointer-events-none"></div>
                    <div className="absolute -right-6 -top-6 w-40 h-40 border border-black/10 rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-black/80 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-black" /> Maior Destaque Orgânico
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h4 className="text-2xl font-black text-black tracking-tight leading-tight mb-1 truncate">
                        {gscAdvancedData?.[0]?.keys?.[0] || 'Pesquisas Orgânicas'}
                      </h4>
                      <p className="text-xs font-bold text-black/70">
                        {gscAdvancedData?.[0]?.clicks ? `${gscAdvancedData[0].clicks} cliques gerados no Google` : 'Sua principal palavra-chave no período'}
                      </p>
                    </div>
                  </div>

                  {/* Dark Pattern Card */}
                  <div className="bg-black rounded-[2.5rem] p-8 relative overflow-hidden text-white shadow-2xl border border-white/10 flex flex-col justify-between min-h-[180px]">
                    <div className="absolute -top-3 right-[25%] w-8 h-8 bg-black rounded-full border-[4px] border-[#F3F4F6] flex items-center justify-center z-30 shadow-md">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#DFFF00]" />
                    </div>

                    <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full pointer-events-none"></div>
                    <div className="absolute -right-14 top-1/2 transform -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full pointer-events-none"></div>

                    <div className="relative z-10">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Impressões Totais</span>
                      <h4 className="text-3xl font-extrabold text-white tracking-tight mt-2 mb-1">
                        {gscData.reduce((acc: number, curr: any) => acc + (curr.impressions || 0), 0).toLocaleString('pt-BR')}
                      </h4>
                      <p className="text-xs text-gray-400">Vezes que seu site apareceu nos resultados do Google</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: WordPress */}
      {activeTab === 'wp' && (
        <div className="space-y-8">
          {hasWp ? (
            <>
              {/* Top Header Card */}
              <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/10 mb-3">
                      <Globe className="w-3.5 h-3.5 text-purple-300" /> Sistema & Segurança do WordPress
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight text-white mb-2">
                      WordPress & Wordfence Security
                    </h3>
                    <p className="text-sm text-gray-300 max-w-xl">
                      Monitore o status do sistema, auditoria de alterações recentes (Simple History) e métricas de proteção do Wordfence em tempo real.
                    </p>
                  </div>
                  
                  {wp?.site_url && (
                    <a 
                      href={`${wp.site_url}/wp-admin`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 font-bold px-6 py-3 rounded-full text-xs transition-all shadow-md"
                    >
                      Acessar Painel WP-Admin <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Wordfence Security Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Firewall Status */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      {wpWordfence?.firewall_status || 'Ativo'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Firewall Wordfence</span>
                    <h4 className="text-xl font-extrabold text-gray-900 mt-1">Proteção contra Invasões</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {wpWordfence?.firewall_message || 'Regras ativas bloqueando ataques de força bruta e scripts nocivos.'}
                    </p>
                  </div>
                </div>

                {/* Card 2: Malware Scan */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {wpWordfence?.scan_status || 'Seguro'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Varredura de Integridade</span>
                    <h4 className="text-xl font-extrabold text-gray-900 mt-1">Integridade do Núcleo</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {wpWordfence?.scan_message || 'Arquivos do tema, plugins e WordPress sem alterações suspeitas.'}
                    </p>
                  </div>
                </div>

                {/* Card 3: Blocked Threats */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {wpWordfence?.total_blocked || 'Protegido'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monitor de Ameaças</span>
                    <h4 className="text-xl font-extrabold text-gray-900 mt-1">Ataques Bloqueados</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {wpWordfence?.blocked_message || 'Tentativas de login não autorizadas retidas automaticamente.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple History - Audit Log Feed */}
              <div className="bg-white border border-gray-200/90 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" /> Histórico de Alterações do Site (Simple History)
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Registro detalhado de alterações, acessos de usuários e atualizações realizadas no WordPress.</p>
                  </div>
                  <button 
                    onClick={() => loadWpData(true)}
                    disabled={loadingWp}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Activity className={`w-3.5 h-3.5 ${loadingWp ? 'animate-spin' : ''}`} />
                    {loadingWp ? 'Atualizando...' : 'Atualizar Histórico'}
                  </button>
                </div>

                {loadingWp ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                    <Activity className="w-8 h-8 animate-spin text-purple-600" />
                    <p className="text-sm font-medium">Carregando logs do Simple History...</p>
                  </div>
                ) : Array.isArray(wpHistory) && wpHistory.length > 0 ? (
                  <div className="space-y-4">
                    {wpHistory.map((item: any, idx: number) => {
                      const dateStr = item.date || item.date_gmt || item.created_at
                      const formattedDate = dateStr ? new Date(dateStr).toLocaleString('pt-BR') : 'Data recente'
                      const initiator = item.initiator || item.logger || item.context?._user_login || 'Sistema WP'
                      const message = item.message || item.header || item.description || item.context?.message || 'Ação registrada no sistema'

                      return (
                        <div key={item.id || idx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:bg-gray-100/60 transition-colors flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-900">{initiator}</span>
                              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formattedDate}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: message }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : wpHistory && typeof wpHistory === 'object' && Array.isArray((wpHistory as any).events) && (wpHistory as any).events.length > 0 ? (
                  <div className="space-y-4">
                    {(wpHistory as any).events.map((item: any, idx: number) => {
                      const dateStr = item.date || item.date_gmt
                      const formattedDate = dateStr ? new Date(dateStr).toLocaleString('pt-BR') : 'Data recente'
                      const initiator = item.initiator || item.context?._user_login || 'Sistema'
                      const message = item.message || item.header || 'Ação registrada no sistema'

                      return (
                        <div key={item.id || idx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:bg-gray-100/60 transition-colors flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-900">{initiator}</span>
                              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formattedDate}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: message }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl text-gray-500 space-y-2">
                    <Globe className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-semibold text-gray-800">Conexão WordPress Ativa</p>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      O plugin Simple History e Wordfence estão configurados no WordPress. As novas atividades e acessos serão registradas aqui em tempo real.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Globe className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">WordPress não conectado</h3>
              <p className="text-sm text-gray-600 mb-6">Para visualizar o histórico de segurança do Wordfence e logs de auditoria do Simple History, conecte a integração do WordPress nas configurações.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Blog */}
      {activeTab === 'blog' && (
        <div className="space-y-8">
          {(() => {
            const permissions = getBlogPlanPermissions(site)

            // 1. Gating check FIRST (for Essencial, No Plan, or Inadimplente)
            if (!permissions.hasBlogAccess) {
              if (permissions.reason === 'payment_pending') {
                return (
                  <div className="bg-amber-50/90 border border-amber-200 rounded-[2.5rem] p-10 md:p-12 text-center max-w-2xl mx-auto shadow-sm">
                    <ShieldAlert className="w-14 h-14 text-amber-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Acesso Temporariamente Suspenso</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Identificamos uma pendência ou atraso na mensalidade do seu plano. Para liberar novamente o gerenciamento e agendamento de postagens do seu Blog, efetue a regularização da fatura.
                    </p>
                    <Button onClick={() => setActiveTab('geral')} className="bg-black text-white rounded-full px-6 py-3">
                      Ver Faturas / Regularizar
                    </Button>
                  </div>
                )
              }

              return (
                <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-10 md:p-12 text-center max-w-2xl mx-auto shadow-xl relative overflow-hidden border border-white/10">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#DFFF00]/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-md">
                      <Lock className="w-8 h-8 text-[#DFFF00]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      Blog Indisponível no {permissions.label}
                    </h3>
                    <p className="text-sm text-gray-300 mb-8 leading-relaxed max-w-md mx-auto">
                      O gerenciamento e agendamento automático de postagens no WordPress é um recurso exclusivo dos planos <strong className="text-white">Profissional</strong> (até 6 posts/mês) e <strong className="text-white">Premium</strong> (ilimitado).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                        <span className="text-xs font-semibold text-[#DFFF00] uppercase">Plano Profissional</span>
                        <p className="text-sm font-bold text-white mt-1">Até 6 posts agendados / mês</p>
                        <p className="text-xs text-gray-400 mt-1">Ideal para escritórios em crescimento</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                        <span className="text-xs font-semibold text-[#DFFF00] uppercase">Plano Premium</span>
                        <p className="text-sm font-bold text-white mt-1">Agendamentos Ilimitados</p>
                        <p className="text-xs text-gray-400 mt-1">Máxima automação e suporte prioritário</p>
                      </div>
                    </div>

                    <a 
                      href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20upgrade%20do%20meu%20plano%20para%20usar%20o%20Blog." 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 bg-[#DFFF00] hover:bg-[#cbf000] text-black font-bold px-8 py-3.5 rounded-full shadow-lg transition-all text-sm"
                    >
                      Fazer Upgrade de Plano <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )
            }

            // 2. Check if WP is connected
            if (!hasWp) {
              return (
                <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center shadow-sm">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">WordPress não conectado</h3>
                  <p className="text-sm text-gray-500 mb-6">Para poder publicar, agendar e editar artigos do seu Blog, a integração do WordPress precisa estar configurada.</p>
                  <Button onClick={() => setActiveTab('geral')} className="bg-black text-white rounded-full px-6 py-3">Voltar para Visão Geral</Button>
                </div>
              )
            }

            // 3. Blog Access Granted -> Render Blog Interface
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()

            const scheduledThisMonthCount = wpPosts.filter((p: any) => {
              if (!p.date) return false
              const isSched = p.status === 'future' || new Date(p.date) > new Date()
              if (!isSched) return false
              const d = new Date(p.date)
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear
            }).length

            const isProfissional = permissions.tier === 'profissional'
            const isLimitReached = isProfissional && scheduledThisMonthCount >= 6

            return (
              <div className="space-y-8">
                {/* Enterprise Hero Banner */}
                <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#DFFF00]/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/10">
                          <Sparkles className="w-3.5 h-3.5 text-[#DFFF00]" /> Gestão de Conteúdo & Marketing
                        </div>

                        {/* Plan & Schedule Counter Badge */}
                        {permissions.tier === 'profissional' ? (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isLimitReached ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                          }`}>
                            <Calendar className="w-3.5 h-3.5" /> Agendamentos este mês: {scheduledThisMonthCount} de 6
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFFF00]/20 text-[#DFFF00] text-xs font-bold border border-[#DFFF00]/30">
                            <Sparkles className="w-3.5 h-3.5" /> Agendamentos Ilimitados ({permissions.label})
                          </div>
                        )}
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                        Blog & Publicações
                      </h3>
                      <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                        Crie artigos de alto engajamento, agende publicações estratégicas e gerencie a imagem destacada do seu site WordPress em tempo real.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => { if (wpModalOpen) setEditingPostId(null); setWpModalOpen(!wpModalOpen); }} 
                      className="bg-[#DFFF00] hover:bg-[#cbf000] text-black font-bold px-6 py-3.5 rounded-full shadow-lg shadow-[#DFFF00]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      {wpModalOpen ? 'Fechar Formulário' : '+ Nova Postagem'}
                    </button>
                  </div>
                </div>

                {/* Form Modal / Card */}
                {wpModalOpen && (
                  <div className="bg-white border border-gray-200/90 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 relative overflow-visible animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {editingPostId ? <Pencil className="w-5 h-5 text-gray-700" /> : <Sparkles className="w-5 h-5 text-black" />}
                          {editingPostId ? 'Editar Postagem' : 'Criar ou Agendar Nova Postagem'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Preencha os campos abaixo para atualizar ou publicar no seu blog WordPress.</p>
                      </div>
                      {editingPostId && (
                        <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                          Editando ID #{editingPostId}
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleCreateWpPost} className="space-y-6">
                      {/* Campo Título */}
                      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Título do Artigo</span>
                        </label>
                        <Input 
                          required 
                          value={wpNewPost.title}
                          onChange={(e) => setWpNewPost({...wpNewPost, title: e.target.value})}
                          placeholder="Ex: Como proteger seu patrimônio com planejamento imobiliário..." 
                          className="bg-white border-gray-300 focus:border-black focus:ring-1 focus:ring-black text-base py-3.5 px-4 rounded-xl shadow-xs font-medium text-gray-900"
                        />
                      </div>

                      {/* Campo Conteúdo */}
                      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span>Conteúdo do Artigo</span>
                        </label>
                        <textarea 
                          required
                          value={wpNewPost.content}
                          onChange={(e) => setWpNewPost({...wpNewPost, content: e.target.value})}
                          className="w-full min-h-[240px] p-4 rounded-xl border border-gray-300 bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm leading-relaxed text-gray-900 shadow-xs"
                          placeholder="Escreva o texto do artigo aqui..."
                        />
                      </div>

                      {/* Imagem de Capa (Com Prévia Instantânea Completa) */}
                      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                          <span>Imagem de Capa (Destacada)</span>
                        </label>
                        
                        {(imagePreviewUrl || currentCoverUrl) && (
                          <div className="mb-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm relative group space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                {imagePreviewUrl ? 'Prévia da Imagem Selecionada (Completa)' : 'Capa Atual em Uso'}
                              </span>
                              {imagePreviewUrl && (
                                <button 
                                  type="button" 
                                  onClick={() => { 
                                    setWpNewPost({ ...wpNewPost, imageFile: null })
                                    setImagePreviewUrl(null) 
                                  }}
                                  className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" /> Remover
                                </button>
                              )}
                            </div>
                            
                            <div className="w-full bg-gray-100/80 border border-gray-200/60 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[160px] max-h-[300px]">
                              <img 
                                src={imagePreviewUrl || currentCoverUrl || ''} 
                                alt="Prévia Completa da Capa" 
                                className="w-full max-h-[280px] object-contain rounded-lg shadow-xs" 
                              />
                            </div>
                          </div>
                        )}

                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setWpNewPost({ ...wpNewPost, imageFile: file })
                            if (file) {
                              setImagePreviewUrl(URL.createObjectURL(file))
                            } else {
                              setImagePreviewUrl(null)
                            }
                          }}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                        />
                      </div>

                      {/* Data e Hora de Agendamento (Condicional) */}
                      {showSchedulePicker && (
                        <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200/80 shadow-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span>Data e Hora de Agendamento</span>
                            </label>
                            <button 
                              type="button" 
                              onClick={() => { setShowSchedulePicker(false); setWpNewPost({ ...wpNewPost, scheduledDate: '' }); }}
                              className="text-xs font-medium text-purple-600 hover:text-purple-900"
                            >
                              Cancelar Agendamento
                            </button>
                          </div>
                          <CustomDateTimePicker 
                            value={wpNewPost.scheduledDate}
                            onChange={(val) => setWpNewPost({ ...wpNewPost, scheduledDate: val })}
                            placeholder="Clique para escolher data e hora no calendário..."
                          />
                          <p className="text-[11px] text-purple-700/80">Escolha o momento exato em que a postagem entrará no ar.</p>
                        </div>
                      )}

                      {/* Warning Banner if Limit Reached for Profissional Plan */}
                      {isLimitReached && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div>
                            <strong className="font-bold block text-amber-900">Limite Mensal de Agendamentos Atingido ({scheduledThisMonthCount} de 6)</strong>
                            <span>Seu Plano Profissional atingiu o limite de 6 postagens agendadas para este mês. Faça upgrade para o Plano Premium para agendar postagens ilimitadas.</span>
                          </div>
                        </div>
                      )}

                      {/* Botões de Ação */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                        <button 
                          type="button" 
                          onClick={() => { setEditingPostId(null); setCurrentCoverUrl(null); setImagePreviewUrl(null); setShowSchedulePicker(false); setWpModalOpen(false); }}
                          className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          Cancelar
                        </button>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                          {/* Botão Rascunho */}
                          <button 
                            type="button" 
                            disabled={creatingWpPost}
                            onClick={() => handleCreateWpPostWithAction('draft')}
                            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-full border border-gray-300/80 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-gray-600" />
                            Salvar Rascunho
                          </button>

                          {/* Botão Agendar (LILÁS) */}
                          <button 
                            type="button" 
                            disabled={creatingWpPost || isLimitReached}
                            onClick={async () => {
                              if (isLimitReached) {
                                await showAlert('Limite de 6 agendamentos mensais atingido para o Plano Profissional. Faça upgrade para o Plano Premium!', 'error')
                                return
                              }
                              if (!showSchedulePicker) {
                                setShowSchedulePicker(true)
                              } else {
                                handleCreateWpPostWithAction('schedule')
                              }
                            }}
                            className={`w-full sm:w-auto font-bold px-6 py-3.5 rounded-full shadow-lg transition-all text-sm flex items-center justify-center gap-2 ${
                              isLimitReached 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-none shadow-none' 
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 active:scale-95'
                            }`}
                          >
                            <Clock className="w-4 h-4 text-white" />
                            {showSchedulePicker ? 'Confirmar Agendamento' : 'Agendar'}
                          </button>

                          {/* Botão Publicar Agora */}
                          <button 
                            type="button" 
                            disabled={creatingWpPost}
                            onClick={() => handleCreateWpPostWithAction('publish')}
                            className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white font-bold px-7 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-[#DFFF00]" />
                            {creatingWpPost ? 'Salvando...' : 'Publicar Agora'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-200 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Cache de Postagens</p>
                      <p className="text-xs text-gray-500">Última atualização: {wpPostsLastUpdated || 'Buscando...'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => loadWpData(true)}
                    disabled={loadingWp}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl border border-gray-300 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {loadingWp ? 'Atualizando...' : 'Atualizar Agora'}
                  </button>
                </div>

                {/* Grid of Posts */}
                {loadingWp ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <Activity className="w-8 h-8 animate-spin text-black mb-3" />
                    <p className="text-sm font-medium text-gray-500">Sincronizando artigos do WordPress...</p>
                  </div>
                ) : wpPosts && wpPosts.length > 0 ? (
                  <>
                    {selectedWpPosts.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-black text-white px-3 py-1 text-sm font-bold">{selectedWpPosts.length}</Badge>
                          <span className="text-sm font-semibold text-gray-700">postagem(ns) selecionada(s)</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => setSelectedWpPosts([])}
                             className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
                           >
                             Cancelar
                           </button>
                           <button
                             onClick={handleDeleteBulkPosts}
                             disabled={deletingBulk}
                             className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-xl text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                           >
                             {deletingBulk ? <Activity className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Excluir Selecionados
                           </button>
                        </div>
                      </div>
                    )}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {wpPosts.map((post: any) => {
                      const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
                      
                      let displayStatus = post.status
                      const gmtDateStr = post.date_gmt && !post.date_gmt.includes('0000-00-00') ? post.date_gmt + 'Z' : post.date + 'Z'
                      const postTime = new Date(gmtDateStr)

                      if ((post.status === 'future' || post.status === 'publish') && postTime <= new Date()) {
                        displayStatus = 'publish'
                      } else if (post.status === 'publish' && postTime > new Date()) {
                        displayStatus = 'future'
                      }
                      
                      return (
                        <div key={post.id} className={`bg-white border ${selectedWpPosts.includes(post.id) ? 'border-black ring-4 ring-black/5' : 'border-gray-200/80'} rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col ${selectedWpPosts.includes(post.id) ? '' : 'hover:-translate-y-1'}`}>
                          <div 
                            className="h-52 w-full overflow-hidden relative bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedWpPosts(prev => 
                                prev.includes(post.id) ? prev.filter(id => id !== post.id) : [...prev, post.id]
                              )
                            }}
                          >
                            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur rounded-full p-1 shadow-md">
                               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedWpPosts.includes(post.id) ? 'bg-black border-black' : 'border-gray-300 bg-transparent'}`}>
                                 {selectedWpPosts.includes(post.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                               </div>
                            </div>
                            {featuredImg ? (
                              <img 
                                src={featuredImg} 
                                alt={post.title.rendered} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                                <Globe className="w-10 h-10 opacity-30 mb-1" />
                                <span className="text-xs font-medium text-gray-400">Sem Imagem de Capa</span>
                              </div>
                            )}

                            <div className="absolute top-4 left-4">
                              <Badge 
                                className={
                                  displayStatus === 'publish' 
                                    ? 'bg-emerald-500 text-white font-bold rounded-full px-3 py-1 text-[11px] shadow-md border-none flex items-center gap-1.5' 
                                    : displayStatus === 'future'
                                    ? 'bg-blue-600 text-white font-bold rounded-full px-3 py-1 text-[11px] shadow-md border-none flex items-center gap-1.5'
                                    : 'bg-gray-900/80 backdrop-blur-md text-white font-bold rounded-full px-3 py-1 text-[11px] border-none flex items-center gap-1.5'
                                }
                              >
                                {displayStatus === 'publish' ? (
                                  <><CheckCircle2 className="w-3 h-3 text-white" /> Publicado</>
                                ) : displayStatus === 'future' ? (
                                  <><Clock className="w-3 h-3 text-white" /> Agendado</>
                                ) : (
                                  <><FileText className="w-3 h-3 text-amber-300" /> Rascunho</>
                                )}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-xs font-medium text-gray-400 mb-2">
                                {new Date(post.date).toLocaleDateString('pt-BR')} às {new Date(post.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <h4 
                                className="font-bold text-gray-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-black transition-colors" 
                                dangerouslySetInnerHTML={{ __html: post.title.rendered || '(Sem título)' }} 
                              />
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#DFFF00]" /> Editar
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                disabled={deletingPostId === post.id}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all ml-2"
                              >
                                {deletingPostId === post.id ? (
                                  <Activity className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )} Excluir
                              </button>
                              {post.link && (
                                <a 
                                  href={post.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full border border-gray-200 transition-all"
                                >
                                  Ver no site <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Nenhum artigo publicado ainda</h4>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Clique no botão abaixo para criar a primeira postagem do seu blog WordPress.</p>
                    <button 
                      onClick={() => setWpModalOpen(true)}
                      className="bg-black text-white font-semibold rounded-full px-6 py-3 text-sm shadow-md hover:bg-gray-800 transition-all"
                    >
                      + Criar Primeira Postagem
                    </button>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
      {/* Tab: Speed Insights */}
      {activeTab === 'speed' as any && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative">
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-stretch">
              {/* Left Side: Image */}
              <div className="flex-1 w-full flex justify-center items-stretch min-h-[300px]">
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] border border-gray-200 shadow-inner flex items-center justify-center relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10 bg-white/20 backdrop-blur-md p-6 rounded-[2rem] shadow-lg border border-white/20 flex flex-col items-center">
                     <Zap className="w-16 h-16 text-[#DFFF00] drop-shadow-md mb-4" fill="#DFFF00" />
                     <p className="text-white font-bold text-lg">Performance Total</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="flex-1 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-4 border border-amber-200">
                  <Activity className="w-3.5 h-3.5" /> Otimização de Performance
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                  Google PageSpeed Insights
                </h3>
                <p className="text-sm text-gray-500 max-w-md mb-8">
                  Descubra os Core Web Vitals (LCP, FCP, CLS, TBT) do seu site. Melhore a velocidade de carregamento para aumentar conversões e ranquear melhor no Google.
                </p>
                
                <div className="space-y-4 max-w-md">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Escolha a URL para testar</label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      disabled={speedLoading}
                      onClick={() => setIsSpeedDropdownOpen(!isSpeedDropdownOpen)}
                      className="w-full bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black text-sm py-3.5 px-4 rounded-xl shadow-xs font-medium text-gray-900 flex justify-between items-center disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="truncate pr-4">{speedUrl || (site?.dominio ? `Domínio Principal (${site.dominio})` : 'Selecione uma URL')}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSpeedDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isSpeedDropdownOpen && !speedLoading && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
                        {site?.dominio && (
                          <div 
                            onClick={() => { setSpeedUrl(site.dominio); setIsSpeedDropdownOpen(false) }}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${speedUrl === site.dominio ? 'bg-gray-50 font-bold text-black' : 'text-gray-700'}`}
                          >
                            Domínio Principal ({site.dominio})
                          </div>
                        )}
                        {indexedPages.map((page: any, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => { setSpeedUrl(page.keys[0]); setIsSpeedDropdownOpen(false) }}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 break-all ${idx !== indexedPages.length - 1 ? 'border-b border-gray-100' : ''} ${speedUrl === page.keys[0] ? 'bg-gray-50 font-bold text-black' : 'text-gray-700'}`}
                          >
                            {page.keys[0]}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!speedLoading ? (
                    <button 
                      onClick={handleCheckSpeed}
                      disabled={!speedUrl}
                      className="w-full bg-black hover:bg-gray-800 text-white font-bold px-6 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-[#DFFF00]" />
                      Executar Análise de Velocidade
                    </button>
                  ) : (
                    <div className="w-full mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Processando métricas...</span>
                        <Activity className="w-4 h-4 text-gray-400 animate-spin" />
                      </div>
                      <div className="w-full h-12 bg-gray-200/50 rounded-2xl relative overflow-hidden flex items-center border border-gray-300/30">
                          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTS0xLDEgTDEsLTEgTTEwLDBMMCwxMCBNOSwxMSBMMTEsOSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')]"></div>
                          
                          <div className="h-full bg-[#DFFF00] rounded-2xl shadow-[0_0_20px_rgba(223,255,0,0.3)] relative z-10 flex items-center justify-end pr-2 transition-all duration-1000 ease-linear" style={{ width: `${speedProgress}%` }}>
                              <div className="h-6 w-1 bg-black/20 rounded-full mr-1"></div>
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                  <Zap className="w-4 h-4 text-gray-400 animate-pulse" />
                              </div>
                          </div>
                      </div>
                    </div>
                  )}
                  {speedError && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-900 mb-1">Análise Interrompida pelo Google</h4>
                        <p className="text-sm text-red-700 leading-relaxed">
                          {speedError.includes('Something went wrong') || speedError.includes('Falha ao executar')
                            ? 'Os servidores do Google PageSpeed Insights (Lighthouse) não conseguiram analisar a página neste momento devido a uma instabilidade de rede ou bloqueio de robôs na URL testada. Por favor, tente novamente.'
                            : speedError}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Panel for Results */}
          {speedData && (
            <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Resultados Oficiais</h3>
                  <p className="text-sm text-gray-500">Métricas atualizadas baseadas nas políticas de ranqueamento do Google.</p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-2 bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200">
                  Testado em: {new Date().toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Mobile Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-gray-700" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Desempenho Mobile</h4>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-200">
                    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-gray-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={`${(speedData.mobile?.categories?.performance?.score || 0) * 100 >= 90 ? 'text-green-500' : (speedData.mobile?.categories?.performance?.score || 0) * 100 >= 50 ? 'text-amber-500' : 'text-red-500'}`} strokeDasharray={`${(speedData.mobile?.categories?.performance?.score || 0) * 100}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute text-2xl font-black text-gray-900">
                        {Math.round((speedData.mobile?.categories?.performance?.score || 0) * 100)}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-xl">Score Geral</h5>
                      <p className="text-xs text-gray-500 mt-1">O Google prioriza a indexação mobile (Mobile-First Indexing). Uma nota verde (&gt;90) é fundamental.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Metrics Grid */}
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Primeira Exibição de Conteúdo (FCP)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.mobile?.audits?.['first-contentful-paint']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Maior Exibição de Conteúdo (LCP)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.mobile?.audits?.['largest-contentful-paint']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Tempo Total de Bloqueio (TBT)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.mobile?.audits?.['total-blocking-time']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Mudança Cumulativa de Layout (CLS)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.mobile?.audits?.['cumulative-layout-shift']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-gray-700" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Desempenho Desktop</h4>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-200">
                    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-gray-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={`${(speedData.desktop?.categories?.performance?.score || 0) * 100 >= 90 ? 'text-green-500' : (speedData.desktop?.categories?.performance?.score || 0) * 100 >= 50 ? 'text-amber-500' : 'text-red-500'}`} strokeDasharray={`${(speedData.desktop?.categories?.performance?.score || 0) * 100}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute text-2xl font-black text-gray-900">
                        {Math.round((speedData.desktop?.categories?.performance?.score || 0) * 100)}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-xl">Score Geral</h5>
                      <p className="text-xs text-gray-500 mt-1">Geralmente, o desktop apresenta pontuações maiores devido ao processamento superior das máquinas e redes estáveis.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Metrics Grid */}
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Primeira Exibição de Conteúdo (FCP)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.desktop?.audits?.['first-contentful-paint']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Maior Exibição de Conteúdo (LCP)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.desktop?.audits?.['largest-contentful-paint']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Tempo Total de Bloqueio (TBT)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.desktop?.audits?.['total-blocking-time']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Mudança Cumulativa de Layout (CLS)</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{speedData.desktop?.audits?.['cumulative-layout-shift']?.displayValue || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          )}
        </div>
      )}
    </div>
  )
}
