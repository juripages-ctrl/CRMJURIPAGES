import os

# Define the WP Tab UI snippet
wp_tab_snippet_report = """      {/* Tab: WordPress */}
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
                    onClick={loadWpData}
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
"""

# Update SiteReportTabs.tsx
report_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"
with open(report_path, "r", encoding="utf-8") as f:
    report_content = f.read()

# Make sure ShieldCheck is imported
if "ShieldCheck" not in report_content:
    report_content = report_content.replace(
        "import { Globe, User, Clock,",
        "import { Globe, User, Clock, ShieldCheck,"
    ).replace(
        "import { Globe,",
        "import { Globe, ShieldCheck,"
    )

# Ensure state variables exist in SiteReportTabs.tsx
if "const [wpHistory, setWpHistory]" not in report_content:
    report_content = report_content.replace(
        "const [wpPosts, setWpPosts] = useState<any[]>([])",
        "const [wpPosts, setWpPosts] = useState<any[]>([])\n  const [wpHistory, setWpHistory] = useState<any[]>([])\n  const [wpWordfence, setWpWordfence] = useState<any>(null)"
    )

# Ensure loadWpData in SiteReportTabs fetches history and wordfence
old_load_wp = """  async function loadWpData() {
    const wp = site?.integracoes_wordpress?.[0]
    if (!wp) return
    setLoadingWp(true)
    const postsRes = await fetchWpPosts(wp.site_url, wp.username, wp.app_password)
    if (postsRes.success) setWpPosts(postsRes.data)
    setLoadingWp(false)
  }"""

new_load_wp = """  async function loadWpData() {
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

if old_load_wp in report_content:
    report_content = report_content.replace(old_load_wp, new_load_wp)

# Replace activeTab === 'wp' block in SiteReportTabs.tsx
wp_start_report = "{/* Tab: WordPress */}"
wp_end_report = "{/* Tab: Blog */}"

if wp_start_report in report_content and wp_end_report in report_content:
    idx1 = report_content.find(wp_start_report)
    idx2 = report_content.find(wp_end_report, idx1)
    if idx1 != -1 and idx2 != -1:
        report_content = report_content[:idx1] + wp_tab_snippet_report.strip() + "\n\n      " + report_content[idx2:]

with open(report_path, "w", encoding="utf-8") as f:
    f.write(report_content)

print("Successfully updated SiteReportTabs.tsx with Wordfence & Simple History!")

# Update SiteDashboardClient.tsx
client_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx"
with open(client_path, "r", encoding="utf-8") as f:
    client_content = f.read()

if "ShieldCheck" not in client_content:
    client_content = client_content.replace(
        "import { Cloud,",
        "import { Cloud, ShieldCheck,"
    )

# Adapt snippet for SiteDashboardClient (where `wp` comes from props or site.integracoes_wordpress)
wp_tab_snippet_client = wp_tab_snippet_report.replace("hasWp", "(!!wp || (site?.integracoes_wordpress && site.integracoes_wordpress.length > 0))").replace("site?.integracoes_wordpress?.[0]", "(wp || site?.integracoes_wordpress?.[0])")

if wp_start_report in client_content and wp_end_report in client_content:
    idx1 = client_content.find(wp_start_report)
    idx2 = client_content.find(wp_end_report, idx1)
    if idx1 != -1 and idx2 != -1:
        client_content = client_content[:idx1] + wp_tab_snippet_client.strip() + "\n\n      " + client_content[idx2:]

with open(client_path, "w", encoding="utf-8") as f:
    f.write(client_content)

print("Successfully updated SiteDashboardClient.tsx with Wordfence & Simple History!")
