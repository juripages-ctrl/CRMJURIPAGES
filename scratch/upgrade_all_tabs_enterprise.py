import os
import re

def upgrade_all_tabs(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # --- 1. VISÃO GERAL ---
    # Update Visão Geral section with Enterprise Hero and Cards
    old_geral_pattern = r'\{activeTab === \'geral\' && \([\s\S]*?\n      \}\)'

    new_geral_section = """{activeTab === 'geral' && (
        <div className="space-y-8">
          {/* Hero Overview Banner */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#DFFF00]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 backdrop-blur-md border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-[#DFFF00]" /> Visão Geral do Projeto
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                  {site?.dominio || site?.nome}
                </h2>
                <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                  Acompanhe em tempo real o status operacional do site, segurança HTTPS e conectividade com os serviços integrados.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/15">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#DFFF00] shadow-[0_0_12px_#DFFF00]' : 'bg-red-500 animate-pulse'}`}></span>
                <span className="text-sm font-bold tracking-wide text-white uppercase">
                  {isOnline ? 'Site Online & Monitorado' : 'Site Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* HTTPS Card */}
            <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Segurança SSL</p>
                {httpsLoading ? (
                  <p className="text-xl font-bold text-gray-400">Verificando...</p>
                ) : httpsStatus?.secure ? (
                  <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
                    HTTPS Seguro
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-red-600 flex items-center gap-1.5">
                    Não Seguro
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3">Certificado SSL Válido</p>
            </div>

            {/* Google Search Console Card */}
            <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Busca Google (GSC)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {typeof totalClicks !== 'undefined' && totalClicks > 0 ? totalClicks.toLocaleString('pt-BR') : '--'}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3">Cliques Orgânicos Acumulados</p>
            </div>

            {/* WordPress Card */}
            <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
                  <Globe className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">WordPress CMS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(typeof hasWp !== 'undefined' ? hasWp : wp) ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3">API REST Integrada</p>
            </div>

            {/* Speed Insights Card */}
            <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PageSpeed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {speedData?.mobile?.categories?.performance?.score ? `${Math.round(speedData.mobile.categories.performance.score * 100)} / 100` : 'Disponível'}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3">Desempenho Mobile & Desktop</p>
            </div>
          </div>
        </div>
      )}"""

    if "{activeTab === 'geral' && (" in content:
        content = re.sub(old_geral_pattern, new_geral_section, content)

    # --- 2. HISTÓRICO DO PROJETO ---
    old_historico_pattern = r'\{activeTab === \'historico\' && \([\s\S]*?\n      \}\)'

    new_historico_section = """{activeTab === 'historico' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#DFFF00]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 backdrop-blur-md border border-white/10">
                  <Activity className="w-3.5 h-3.5 text-[#DFFF00]" /> Linha do Tempo & Atualizações
                </div>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                  Histórico do Projeto
                </h3>
                <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                  Acompanhe registros de alterações, relatórios de desempenho e Marcos atingidos do projeto.
                </p>
              </div>
              <button 
                onClick={() => alert("Gerando relatório consolidado do projeto...")}
                className="bg-[#DFFF00] hover:bg-[#cbf000] text-black font-bold px-6 py-3.5 rounded-full shadow-lg shadow-[#DFFF00]/20 hover:scale-105 transition-all text-sm flex items-center gap-2"
              >
                <Activity className="w-4 h-4" /> Gerar Relatório de Desempenho
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-6">
            <h4 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">Registros de Atividade</h4>
            
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-black text-[#DFFF00] flex items-center justify-center flex-shrink-0 font-bold">
                  ✓
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Integração de Notificações & Blog Concluída</h5>
                  <p className="text-xs text-gray-500 mt-1">Painel de postagens e sistema de alertas em tempo real ativados para o projeto.</p>
                  <span className="text-[11px] text-gray-400 mt-2 block">Hoje às 15:00</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Monitoramento do Google Search Console Conectado</h5>
                  <p className="text-xs text-gray-500 mt-1">Indexação e métricas de tráfego orgânico sincronizadas com sucesso.</p>
                  <span className="text-[11px] text-gray-400 mt-2 block">Registrado recentemente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}"""

    if "{activeTab === 'historico' && (" in content:
        content = re.sub(old_historico_pattern, new_historico_section, content)

    # --- 3. WORDPRESS (SISTEMA & SEGURANÇA) ---
    old_wp_pattern = r'\{activeTab === \'wp\' && \([\s\S]*?\n      \}\)'

    new_wp_section = """{activeTab === 'wp' && (
        <div className="space-y-8">
          {(typeof hasWp !== 'undefined' ? hasWp : wp) ? (
            <div className="space-y-8">
              {/* Hero Banner WordPress */}
              <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 backdrop-blur-md border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#DFFF00]" /> Saúde do Servidor & Segurança
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                      WordPress: Sistema & Wordfence
                    </h3>
                    <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                      Monitore o ambiente técnico, versões do PHP/WP e proteção ativa de firewall da sua aplicação.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Histórico Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Box */}
                <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2 border-b border-gray-100 pb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Status do Sistema
                  </h4>
                  {typeof wpStatus !== 'undefined' && wpStatus ? (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">Versão WP:</span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-xs">{wpStatus.wp_version || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">Versão PHP:</span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-xs">{wpStatus.php_version || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">Plugins Ativos:</span>
                        <span className="font-bold text-gray-900 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs">{wpStatus.active_plugins || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Ambiente:</span>
                        <span className="font-bold text-gray-900 capitalize bg-gray-100 px-3 py-1 rounded-full text-xs">{wpStatus.environment || 'Produção'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4">Status do sistema conectado via API REST.</p>
                  )}
                </div>

                {/* Simple History Box */}
                <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 shadow-sm lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Activity className="w-5 h-5 text-blue-500" /> Logs do Sistema (Simple History)
                  </h4>
                  {typeof wpHistory !== 'undefined' && wpHistory && wpHistory.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {wpHistory.map((log: any, idx: number) => (
                        <div key={idx} className="flex gap-4 text-sm border-b border-gray-100 pb-3 last:border-0 items-start">
                          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {new Date(log.date).toLocaleDateString('pt-BR')}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{log.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Por: {log.user_email || 'Sistema'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-8">Nenhum log recente registrado.</p>
                  )}
                </div>
              </div>

              {/* Wordfence Box */}
              {typeof wpWordfence !== 'undefined' && wpWordfence && (
                <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/10">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 bg-[#DFFF00] text-black rounded-2xl flex items-center justify-center font-black text-lg">
                      W
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-white">Segurança Wordfence</h4>
                      <p className="text-xs text-gray-400">Proteção ativa de firewall e escaneamento contra intrusões</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                      <p className="text-xs text-gray-400 font-medium mb-1">Status do Firewall</p>
                      <p className={`text-xl font-extrabold capitalize ${wpWordfence.waf_status === 'enabled' ? 'text-[#DFFF00]' : 'text-blue-400'}`}>
                        {wpWordfence.waf_status === 'enabled' ? '● Ativo & Protegendo' : wpWordfence.waf_status}
                      </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                      <p className="text-xs text-gray-400 font-medium mb-1">Ataques Bloqueados (24h)</p>
                      <p className="text-2xl font-extrabold text-white">{wpWordfence.blocks_24h}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                      <p className="text-xs text-gray-400 font-medium mb-1">Alertas do Scan</p>
                      <p className={`text-2xl font-extrabold ${wpWordfence.issues_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {wpWordfence.issues_count} {wpWordfence.issues_count === 1 ? 'alerta' : 'alertas'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center shadow-sm">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">WordPress não conectado</h3>
              <p className="text-sm text-gray-500 mb-6">Conecte a API do WordPress nas integrações para visualizar a saúde do sistema e do Wordfence.</p>
              <Button onClick={() => setActiveTab('integracoes')} className="bg-black text-white rounded-full px-6 py-3">Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}"""

    if "{activeTab === 'wp' && (" in content:
        content = re.sub(old_wp_pattern, new_wp_section, content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully upgraded all tabs in {filepath}")

upgrade_all_tabs(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx")
upgrade_all_tabs(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx")
