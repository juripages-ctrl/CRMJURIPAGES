import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_geral = """
      {activeTab === 'geral' && (
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-medium mb-2">Visão Geral: {site.dominio}</h2>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  {isOnline ? 'Site Online e Monitorado' : 'Site Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-6 rounded-2xl border ${hasGsc ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tráfego de Busca (GSC)</h4>
              <p className="text-3xl font-bold text-gray-900">{hasGsc ? totalClicks.toLocaleString('pt-BR') : '--'}</p>
              <p className="text-xs text-gray-400 mt-2">{hasGsc ? 'Cliques no Google' : 'Não conectado'}</p>
            </div>
            
            <div className={`p-6 rounded-2xl border ${hasCf ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tráfego Edge (Cloudflare)</h4>
              <p className="text-3xl font-bold text-gray-900">{hasCf && cfData ? (cfData.totals?.requests?.all?.toLocaleString('pt-BR') || 0) : '--'}</p>
              <p className="text-xs text-gray-400 mt-2">{hasCf ? 'Requisições recebidas' : 'Não conectado'}</p>
            </div>

            <div className={`p-6 rounded-2xl border ${hasClarity ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Sessões (Clarity)</h4>
              <p className="text-3xl font-bold text-gray-900">{hasClarity && clarityMetrics ? clarityMetrics.totalSessions.toLocaleString('pt-BR') : '--'}</p>
              <p className="text-xs text-gray-400 mt-2">{hasClarity ? 'Sessões rastreadas' : 'Não conectado'}</p>
            </div>
            
            <div className={`p-6 rounded-2xl border ${hasGtm ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tags Disparadas (GTM)</h4>
              <p className="text-3xl font-bold text-gray-900">{hasGtm ? 'Ativo' : '--'}</p>
              <p className="text-xs text-gray-400 mt-2">{hasGtm ? 'Google Tag Manager OK' : 'Não conectado'}</p>
            </div>
          </div>
        </div>
      )}
"""

pattern = re.compile(r"\{activeTab === 'geral' && \(\s*<div className=\"bg-white rounded-2xl border border-gray-100 p-6 shadow-sm\">\s*<h3 className=\"font-semibold text-gray-900 mb-2\">Visão Geral do Projeto</h3>\s*<p className=\"text-sm text-gray-500\">Seu site \{site\.dominio\} está \{isOnline \? 'online' : 'offline'\}\.</p>\s*</div>\s*\)}")
content = pattern.sub(new_geral.strip(), content)

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated geral")
