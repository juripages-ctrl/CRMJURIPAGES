import os
import re

target_file = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables for Cache timestamps
state_vars = """
  // --- Cache Timestamps ---
  const [wpPostsLastUpdated, setWpPostsLastUpdated] = useState<string | null>(null)
  const [wpSecurityLastUpdated, setWpSecurityLastUpdated] = useState<string | null>(null)
  const [gscLastUpdated, setGscLastUpdated] = useState<string | null>(null)
  const [isRefreshingGsc, setIsRefreshingGsc] = useState(false)
"""
content = re.sub(r'(const \[loadingWp, setLoadingWp\] = useState\(false\))', r'\1\n' + state_vars, content)

# 2. Update loadWpData
load_wp_old = """  async function loadWpData() {
    const wp = site?.integracoes_wordpress?.[0]
    if (!wp) return
    setLoadingWp(true)
    const postsRes = await fetchWpPosts(wp.site_url, wp.username, wp.app_password)
    if (postsRes.success) setWpPosts(postsRes.data)

    const histRes = await fetchWpHistory(wp.site_url, wp.username, wp.app_password)
    if (histRes.success) setWpHistory(histRes.data)

    const wfRes = await fetchWpWordfenceData(wp.site_url, wp.username, wp.app_password)
    if (wfRes.success) setWpWordfence(wfRes.data)

    setLoadingWp(false)
  }"""

load_wp_new = """  async function loadWpData(forceRefresh = false) {
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
  }"""

content = content.replace(load_wp_old, load_wp_new)

# 3. Update loadRealAnalytics (for GSC)
content = content.replace("async function loadRealAnalytics() {", "async function loadRealAnalytics(forceRefresh = false) {")

content = content.replace(
    "const res = await fetchGscAnalytics(propUrl, startDate, endDate, selectedPageUrl || undefined)",
    "if (forceRefresh) setIsRefreshingGsc(true);\n        const res = await fetchGscAnalytics(site.id, propUrl, startDate, endDate, selectedPageUrl || undefined, forceRefresh)\n        if (res._cachedAt) setGscLastUpdated(new Date(res._cachedAt).toLocaleString('pt-BR'))"
)
content = content.replace(
    "const indexedRes = await fetchGscIndexedPages(propUrl, startDate, endDate)",
    "const indexedRes = await fetchGscIndexedPages(site.id, propUrl, startDate, endDate, forceRefresh)"
)
content = content.replace(
    "setLoadingGscAdvanced(false)",
    "setLoadingGscAdvanced(false)\n      setIsRefreshingGsc(false)"
)

adv_call_old = """      const res = await fetchGscTrendingQueries(
        propUrl, 
        startDate, 
        endDate, 
        prevStart.toISOString().split('T')[0], 
        prevEnd.toISOString().split('T')[0]
      )"""
adv_call_new = """      const res = await fetchGscTrendingQueries(
        site.id,
        propUrl, 
        startDate, 
        endDate, 
        prevStart.toISOString().split('T')[0], 
        prevEnd.toISOString().split('T')[0],
        forceRefresh
      )"""
content = content.replace(adv_call_old, adv_call_new)

adv_call_2_old = """      const res = await fetchGscAdvancedAnalytics(
        propUrl,
        startDate,
        endDate,
        dimensionMap[gscTab]
      )"""
adv_call_2_new = """      const res = await fetchGscAdvancedAnalytics(
        site.id,
        propUrl,
        startDate,
        endDate,
        dimensionMap[gscTab],
        forceRefresh
      )"""
content = content.replace(adv_call_2_old, adv_call_2_new)


# UI Injections
cache_ui_seo = """
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Cache de Desempenho (GSC)</p>
                      <p className="text-xs text-blue-600/80">Última atualização: {gscLastUpdated || 'Buscando...'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      loadRealAnalytics(true);
                    }}
                    disabled={isRefreshingGsc}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isRefreshingGsc ? 'Atualizando...' : 'Atualizar Agora'}
                  </button>
                </div>
"""

cache_ui_wp_sec = """
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-900">Cache de Segurança</p>
                      <p className="text-xs text-purple-600/80">Última atualização: {wpSecurityLastUpdated || 'Buscando...'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => loadWpData(true)}
                    disabled={loadingWp}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {loadingWp ? 'Atualizando...' : 'Atualizar Agora'}
                  </button>
                </div>
"""

cache_ui_wp_blog = """
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
"""

# Insert SEO cache UI before the first DatePicker
content = content.replace(
    """<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">""",
    cache_ui_seo + """\n              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">""",
    1
)

# Insert WP Sec cache UI before the grid of Wordfence cards
content = content.replace(
    """{/* Wordfence Stats */}\n              <div className="grid gap-4 md:grid-cols-3 mb-8">""",
    cache_ui_wp_sec + """\n              {/* Wordfence Stats */}\n              <div className="grid gap-4 md:grid-cols-3 mb-8">""",
    1
)

# Insert Blog cache UI before the grid
content = content.replace(
    """{/* Grid of Posts */}\n                {loadingWp ? (""",
    cache_ui_wp_blog + """\n                {/* Grid of Posts */}\n                {loadingWp ? (""",
    1
)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete")
