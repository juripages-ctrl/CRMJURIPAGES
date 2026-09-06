import os
import re

def upgrade_seo_tab(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    new_seo_block = """      {/* Tab: SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-8">
          {(typeof isGscConnected !== 'undefined' ? isGscConnected : hasGsc) ? (
            <>
              {/* Enterprise Hero Banner */}
              <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#DFFF00]/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 backdrop-blur-md border border-white/10">
                      <Search className="w-3.5 h-3.5 text-[#DFFF00]" /> Inteligência Orgânica
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                      Google Search Console
                    </h3>
                    <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                      Análise profunda de tráfego de busca, termos em alta, CTR médio e posições no ranking do Google.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
                    <span className="text-xs text-gray-300 font-semibold px-2">Período:</span>
                    <input 
                      type="date" 
                      value={typeof indexedStartDate !== 'undefined' ? indexedStartDate : (typeof customStartDate !== 'undefined' ? customStartDate : '')} 
                      onChange={e => typeof setIndexedStartDate !== 'undefined' ? setIndexedStartDate(e.target.value) : (typeof setCustomStartDate !== 'undefined' && setCustomStartDate(e.target.value))} 
                      className="bg-black/40 text-white text-xs border border-white/20 rounded-xl px-3 py-2 outline-none" 
                    />
                    <span className="text-xs text-gray-400">até</span>
                    <input 
                      type="date" 
                      value={typeof indexedEndDate !== 'undefined' ? indexedEndDate : (typeof customEndDate !== 'undefined' ? customEndDate : '')} 
                      onChange={e => typeof setIndexedEndDate !== 'undefined' ? setIndexedEndDate(e.target.value) : (typeof setCustomEndDate !== 'undefined' && setCustomEndDate(e.target.value))} 
                      className="bg-black/40 text-white text-xs border border-white/20 rounded-xl px-3 py-2 outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Chart & KPI Card */}
              <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h4 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" /> Desempenho de Cliques Orgânicos
                  </h4>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    Search Analytics
                  </span>
                </div>

                {gscData.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-sm">
                    Nenhum dado de busca retornado para este período.
                  </div>
                ) : (
                  <>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gscData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} dy={10} />
                          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#09090b', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} 
                            itemStyle={{ color: '#fff' }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="clicks" 
                            name="Cliques" 
                            stroke="#000000" 
                            strokeWidth={3} 
                            dot={false} 
                            activeDot={{ r: 7, fill: '#DFFF00', stroke: '#000000', strokeWidth: 2 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                      <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Cliques</p>
                        <p className="text-3xl font-extrabold text-gray-900">{totalClicks.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Impressões</p>
                        <p className="text-3xl font-extrabold text-gray-900">{totalImpressions.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CTR Médio</p>
                        <p className="text-3xl font-extrabold text-emerald-600">{avgCtr}%</p>
                      </div>
                      <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Posição Média</p>
                        <p className="text-3xl font-extrabold text-blue-600">{avgPosition}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Indexed Pages Table */}
              <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 shadow-sm overflow-hidden space-y-4">
                <h4 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4 flex items-center justify-between">
                  <span>Páginas Mais Acessadas via Busca</span>
                  <span className="text-xs font-normal text-gray-500">Google Search Console Index</span>
                </h4>

                {indexedPages && indexedPages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {indexedPages.slice(0, 9).map((page: any, idx: number) => {
                      const displayUrl = page.keys[0].replace(`https://${site.dominio}`, '') || 'Página Principal'
                      return (
                        <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-colors flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-gray-900 truncate pr-2" title={page.keys[0]}>{displayUrl}</span>
                              <a href={page.keys[0]} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black">
                                <ArrowUpRight className="w-4 h-4" />
                              </a>
                            </div>
                            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200/50">
                              <div>
                                <p className="text-[11px] text-gray-400 font-medium">Cliques</p>
                                <p className="font-bold text-gray-900 text-sm">{page.clicks.toLocaleString('pt-BR')}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-400 font-medium">Impressões</p>
                                <p className="font-bold text-gray-900 text-sm">{page.impressions.toLocaleString('pt-BR')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">Nenhuma página indexada encontrada para este período.</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Google Search Console Não Conectado</h3>
              <p className="text-sm text-gray-500 mb-6">Conecte o serviço de busca nas integrações técnicas para visualizar relatórios orgânicos.</p>
            </div>
          )}
        </div>
      )}"""

    old_seo_pattern = r'\{activeTab === \'seo\' && \([\s\S]*?\n      \}\)'
    if "{activeTab === 'seo' && (" in content:
        content = re.sub(old_seo_pattern, new_seo_block, content)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully upgraded SEO tab in {filepath}")
    else:
        print(f"Could not find SEO tab pattern in {filepath}")

upgrade_seo_tab(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx")
upgrade_seo_tab(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx")
