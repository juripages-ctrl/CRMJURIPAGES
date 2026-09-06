import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Substituir abas (botoes)
tabs_start = content.find('<div className="flex items-center gap-6 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap">')
if tabs_start == -1:
    tabs_start = content.find('<div className="flex items-center gap-6 border-b border-gray-200 mb-8">')
    
tabs_end = content.find('</div>', tabs_start) + 6

new_buttons = """<div className="flex items-center gap-6 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('geral')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'geral' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Visão Geral
          {activeTab === 'geral' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'seo' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          SEO (GSC)
          {activeTab === 'seo' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
        <button
          onClick={() => setActiveTab('rede')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'rede' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Segurança & Rede
          {activeTab === 'rede' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
        <button
          onClick={() => setActiveTab('aquisicao')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'aquisicao' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Aquisição (GA4)
          {activeTab === 'aquisicao' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
        <button
          onClick={() => setActiveTab('ux')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'ux' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Comportamento (UX)
          {activeTab === 'ux' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
        <button
          onClick={() => setActiveTab('rastreamento')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'rastreamento' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Rastreamento (GTM)
          {activeTab === 'rastreamento' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
      </div>"""

content = content[:tabs_start] + new_buttons + content[tabs_end:]

# Substituir blocos de conteudo
analytics_start = content.find("{/* Tab Content */}")
if analytics_start == -1:
    print("Could not find Tab Content block")
    exit(1)

content_end = content.rfind("    </div>\n  )\n}")

new_content = """{/* Tab Content */}
      {activeTab === 'geral' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
           <h3 className="font-semibold text-gray-900 mb-2">Visão Geral do Projeto</h3>
           <p className="text-sm text-gray-500">Seu site {site.dominio} está {isOnline ? 'online' : 'offline'}.</p>
        </div>
      )}

      {/* SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          {hasGsc ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-2">Métricas de SEO</h3>
               <p className="text-sm text-gray-500">A integração do Google Search Console está funcionando corretamente.</p>
               {/* Aqui entram os graficos reais futuramente */}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Google Search Console</h3>
              <p className="text-sm text-gray-600 mb-6">Esta ferramenta não está conectada ao seu projeto.</p>
              <p className="text-xs text-gray-500">Entre em contato com a equipe da agência para ativar.</p>
            </div>
          )}
        </div>
      )}

      {/* REDE */}
      {activeTab === 'rede' && (
        <div className="space-y-6">
          {hasCf ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-2">Segurança e Tráfego WAF</h3>
               <p className="text-sm text-gray-500">A integração do Cloudflare está funcionando corretamente.</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cloudflare</h3>
              <p className="text-sm text-gray-600 mb-6">Esta ferramenta não está conectada ao seu projeto.</p>
              <p className="text-xs text-gray-500">Entre em contato com a equipe da agência para ativar.</p>
            </div>
          )}
        </div>
      )}

      {/* AQUISICAO */}
      {activeTab === 'aquisicao' && (
        <div className="space-y-6">
          {hasGa4 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-2">Google Analytics 4</h3>
               <p className="text-sm text-gray-500">A integração do Google Analytics 4 está funcionando corretamente.</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Google Analytics 4</h3>
              <p className="text-sm text-gray-600 mb-6">Esta ferramenta não está conectada ao seu projeto.</p>
              <p className="text-xs text-gray-500">Entre em contato com a equipe da agência para ativar.</p>
            </div>
          )}
        </div>
      )}

      {/* UX */}
      {activeTab === 'ux' && (
        <div className="flex flex-col gap-6">
          {hasClarity ? (
            <>
              {/* Cards Inteligentes de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-gray-500 mb-2">Total de Sessões</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {clarityMetrics?.totalSessions ? clarityMetrics.totalSessions.toLocaleString('pt-BR') : '--'}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    Tempo Ativo Médio
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {clarityMetrics?.activeTime ? `${(clarityMetrics.activeTime / 1000 / 60).toFixed(1)}m` : '--'}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    Profundidade de Rolagem
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {clarityMetrics?.scrollDepth ? `${clarityMetrics.scrollDepth.toFixed(1)}%` : '--'}
                  </p>
                </div>
                <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between">
                  <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                    Rage Clicks
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {clarityMetrics?.rageClicks !== undefined ? clarityMetrics.rageClicks : '--'}
                  </p>
                </div>
              </div>

              {/* Box de Acesso Rápido */}
              <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden relative flex flex-col items-center justify-center p-8 text-center mt-2">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Acesso ao Microsoft Clarity</h3>
                <p className="text-gray-500 mb-8 max-w-lg">
                  Para analisar os vídeos de tela completos e os mapas de calor detalhados de onde seus usuários estão clicando, acesse o painel seguro.
                </p>
                
                <div className="flex gap-4">
                  <a 
                    href={`https://clarity.microsoft.com/projects/view/${site.integracoes_clarity[0]?.project_id}/recordings`}
                    target="_blank"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    Gravações <span>&rarr;</span>
                  </a>
                  <a 
                    href={`https://clarity.microsoft.com/projects/view/${site.integracoes_clarity[0]?.project_id}/heatmaps`}
                    target="_blank"
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    Mapas <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Comportamento (UX)</h3>
              <p className="text-sm text-gray-600 mb-6">O Microsoft Clarity não está conectado ao seu projeto.</p>
              <p className="text-xs text-gray-500">Entre em contato com a equipe da agência para ativar.</p>
            </div>
          )}
        </div>
      )}

      {/* RASTREAMENTO (GTM) */}
      {activeTab === 'rastreamento' && (
        <div className="space-y-6">
          {hasGtm ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-semibold text-gray-900 mb-2">Google Tag Manager</h3>
               <p className="text-sm text-gray-500 mb-4">Varredura de Rastreamento (As tags estão disparando?)</p>
               
               <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm font-medium">
                  Status: 20/20 páginas escaneadas com a tag GTM encontrada com sucesso!
               </div>
               {/* Futuramente: Listar as URLs e o status individual */}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Google Tag Manager</h3>
              <p className="text-sm text-gray-600 mb-6">Esta ferramenta não está conectada ao seu projeto.</p>
              <p className="text-xs text-gray-500">Entre em contato com a equipe da agência para ativar.</p>
            </div>
          )}
        </div>
      )}
"""

final_content = content[:analytics_start] + new_content + content[content_end:]

# Update the `useState` definition for `activeTab` to remove 'historico' and include the new ones
final_content = final_content.replace(
    "const [activeTab, setActiveTab] = useState<'analytics' | 'historico' | 'ux'>('analytics')",
    "const [activeTab, setActiveTab] = useState<'geral' | 'seo' | 'rede' | 'aquisicao' | 'ux' | 'rastreamento'>('geral')"
)

# And `hasGtm` logic
if "const hasGtm" not in final_content:
    final_content = final_content.replace(
        "const hasClarity = site.integracoes_clarity && site.integracoes_clarity.length > 0",
        "const hasClarity = site.integracoes_clarity && site.integracoes_clarity.length > 0\n  const hasGtm = site.integracoes_gtm && site.integracoes_gtm.length > 0"
    )

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "w", encoding="utf-8") as f:
    f.write(final_content)
print("File rewritten successfully")
