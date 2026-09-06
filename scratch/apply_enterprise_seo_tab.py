def build_enterprise_seo_jsx(isAdmin=False):
    isGscVar = "isGscConnected" if isAdmin else "hasGsc"
    tabVar = "gscTab" if isAdmin else "gscSubTab"
    setTabFn = "setGscTab" if isAdmin else "setGscSubTab"
    btnBack = '<Button onClick={() => setActiveTab("geral")} className="bg-black text-white rounded-full px-6 py-3">Configurar Integração GSC</Button>' if isAdmin else '<Button onClick={() => setActiveTab("geral")} className="bg-black text-white rounded-full px-6 py-3">Voltar para Visão Geral</Button>'

    template = """{/* Tab: SEO (Enterprise Analytics Design) */}
      {activeTab === 'seo' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {!IS_GSC_VAR ? (
            <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Google Search Console não conectado</h3>
              <p className="text-sm text-gray-500 mb-6">Para visualizar métricas de cliques, impressões, posição média e pesquisas orgânicas do Google, conecte a propriedade do Google Search Console.</p>
              BTN_BACK_PLACEHOLDER
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header Date Range Filter (Enterprise Analytics) */}
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

              {/* Top Hero + Grid Layout (Enterprise Analytics Theme) */}
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

              {/* Bottom Row Grid: Detailed GSC Sub-tabs & Right Highlight Cards */}
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
                          onClick={() => SET_TAB_FN(st.id as any)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                            TAB_VAR === st.id ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-tab Content Table */}
                  <div className="overflow-x-auto">
                    {TAB_VAR === 'queries' && (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-500 font-bold uppercase tracking-wider">
                            <th className="pb-3">Termo de Pesquisa (Palavra-Chave)</th>
                            <th className="pb-3 text-right">Cliques</th>
                            <th className="pb-3 text-right">Impressões</th>
                            <th className="pb-3 text-right">CTR</th>
                            <th className="pb-3 text-right">Posição</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/60 font-medium text-gray-900">
                          {topQueries && topQueries.length > 0 ? (
                            topQueries.slice(0, 10).map((q: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/60 transition-colors">
                                <td className="py-3 font-semibold text-gray-900">{q.keys?.[0] || q.query}</td>
                                <td className="py-3 text-right font-bold">{q.clicks}</td>
                                <td className="py-3 text-right text-gray-500">{q.impressions}</td>
                                <td className="py-3 text-right text-gray-600">{(q.ctr * 100).toFixed(1)}%</td>
                                <td className="py-3 text-right text-gray-700 font-bold">{q.position ? q.position.toFixed(1) : '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-400">Nenhuma consulta registrada no período.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {TAB_VAR === 'pages' && (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-500 font-bold uppercase tracking-wider">
                            <th className="pb-3">URL da Página</th>
                            <th className="pb-3 text-right">Cliques</th>
                            <th className="pb-3 text-right">Impressões</th>
                            <th className="pb-3 text-right">CTR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/60 font-medium text-gray-900">
                          {topPages && topPages.length > 0 ? (
                            topPages.slice(0, 10).map((p: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/60 transition-colors">
                                <td className="py-3 font-semibold text-gray-900 truncate max-w-xs" title={p.keys?.[0] || p.page}>
                                  {p.keys?.[0] || p.page}
                                </td>
                                <td className="py-3 text-right font-bold">{p.clicks}</td>
                                <td className="py-3 text-right text-gray-500">{p.impressions}</td>
                                <td className="py-3 text-right text-gray-600">{(p.ctr * 100).toFixed(1)}%</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={4} className="py-8 text-center text-gray-400">Nenhuma página registrada no período.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {TAB_VAR === 'countries' && (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-500 font-bold uppercase tracking-wider">
                            <th className="pb-3">País de Origem</th>
                            <th className="pb-3 text-right">Cliques</th>
                            <th className="pb-3 text-right">Impressões</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/60 font-medium text-gray-900">
                          {topCountries && topCountries.length > 0 ? (
                            topCountries.slice(0, 10).map((c: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/60 transition-colors">
                                <td className="py-3 font-semibold text-gray-900 uppercase">{c.keys?.[0] || c.country}</td>
                                <td className="py-3 text-right font-bold">{c.clicks}</td>
                                <td className="py-3 text-right text-gray-500">{c.impressions}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={3} className="py-8 text-center text-gray-400">Nenhum país registrado no período.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {TAB_VAR === 'devices' && (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-500 font-bold uppercase tracking-wider">
                            <th className="pb-3">Dispositivo</th>
                            <th className="pb-3 text-right">Cliques</th>
                            <th className="pb-3 text-right">Impressões</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/60 font-medium text-gray-900">
                          {topDevices && topDevices.length > 0 ? (
                            topDevices.map((d: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/60 transition-colors">
                                <td className="py-3 font-semibold text-gray-900 capitalize">{d.keys?.[0] || d.device}</td>
                                <td className="py-3 text-right font-bold">{d.clicks}</td>
                                <td className="py-3 text-right text-gray-500">{d.impressions}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={3} className="py-8 text-center text-gray-400">Nenhum dispositivo registrado no período.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Right Column Highlight Cards (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Lime Card (Gross Profit / Highlight Card) */}
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
                        {topQueries?.[0]?.keys?.[0] || topQueries?.[0]?.query || 'Pesquisas Orgânicas'}
                      </h4>
                      <p className="text-xs font-bold text-black/70">
                        {topQueries?.[0]?.clicks ? `${topQueries[0].clicks} cliques gerados no Google` : 'Sua principal palavra-chave no período'}
                      </p>
                    </div>
                  </div>

                  {/* Dark Pattern Card (Net Profit / Impressions Card) */}
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
      )}"""

    template = template.replace('IS_GSC_VAR', isGscVar)
    template = template.replace('TAB_VAR', tabVar)
    template = template.replace('SET_TAB_FN', setTabFn)
    template = template.replace('BTN_BACK_PLACEHOLDER', btnBack)

    return template

def update_site_dashboard_client():
    filepath = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    seo_start = content.find("{/* Tab: SEO */}")
    seo_end = content.find("{/* SPEED INSIGHTS */}", seo_start)
    if seo_end == -1:
        seo_end = content.find("activeTab === 'speed'", seo_start)

    seo_end_pos = content.rfind("}", 0, seo_end)

    print("SiteDashboardClient seo_start:", seo_start, "seo_end_pos:", seo_end_pos)

    new_seo_jsx = build_enterprise_seo_jsx(isAdmin=True)
    new_content = content[:seo_start] + new_seo_jsx + "\n\n      " + content[seo_end_pos:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated SiteDashboardClient.tsx with Enterprise Analytics SEO design")

update_site_dashboard_client()
