import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find the start of the analytics tab
start_idx = content.find("{/* Tab: Analytics */}")
if start_idx == -1:
    print("Could not find start index")
    exit(1)

# Find the end of the analytics tab (which is right before the last </div>)
end_idx = content.rfind("    </div>\n  )\n}")

if end_idx == -1:
    print("Could not find end index")
    exit(1)

new_tabs = """      {/* Tab: Historico */}
      {activeTab === 'historico' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico do Projeto</h3>
          <p className="text-sm text-gray-500">Acompanhe as atualizações e andamento do projeto.</p>
          <div className="mt-8 text-center text-gray-400 text-sm">
            Nenhuma atualização recente.
          </div>
        </div>
      )}

      {/* Tab: SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-8">
          {isGscConnected ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
              <Search className="w-8 h-8 mx-auto text-blue-500 mb-3" />
              <p className="text-gray-900 font-medium">Google Search Console Ativo</p>
              <p className="text-gray-500 text-sm">A integração está funcionando. Os dados detalhados podem ser vistos no painel do cliente.</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Search className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Passo a Passo: Google Search Console</h3>
              <p className="text-sm text-gray-600 mb-6 text-left">
                1. Acesse sua conta Master do Google Search Console.<br/>
                2. Verifique o domínio ou prefixo de URL do cliente.<br/>
                3. Copie a URL exata da propriedade gerada.<br/>
                4. Conecte no CRM usando a aba "Integrações Técnicas".
              </p>
              <Button onClick={() => setActiveTab('integracoes')}>Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Rede */}
      {activeTab === 'rede' && (
        <div className="space-y-8">
          {isCfConnected ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
              <Cloud className="w-8 h-8 mx-auto text-orange-500 mb-3" />
              <p className="text-gray-900 font-medium">Cloudflare Ativo</p>
              <p className="text-gray-500 text-sm">Proteção WAF e cache estão operando. Verifique o painel do cliente para gráficos de tráfego.</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Cloud className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Passo a Passo: Cloudflare</h3>
              <p className="text-sm text-gray-600 mb-6 text-left">
                1. Adicione o domínio do cliente na conta Cloudflare da agência.<br/>
                2. Altere os nameservers (DNS) no registro do domínio.<br/>
                3. Copie o "Zone ID" gerado no painel da Cloudflare.<br/>
                4. Conecte no CRM usando a aba "Integrações Técnicas".
              </p>
              <Button onClick={() => setActiveTab('integracoes')}>Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Aquisição */}
      {activeTab === 'aquisicao' && (
        <div className="space-y-8">
          {isGa4Connected ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
              <BarChart3 className="w-8 h-8 mx-auto text-blue-500 mb-3" />
              <p className="text-gray-900 font-medium">Google Analytics 4 Ativo</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Passo a Passo: Google Analytics 4</h3>
              <p className="text-sm text-gray-600 mb-6 text-left">
                1. Crie uma propriedade GA4 para o cliente.<br/>
                2. Pegue o ID Numérico da Propriedade (Não é o G-XXXX, é o ID apenas numérico).<br/>
                3. Conecte no CRM usando a aba "Integrações Técnicas".
              </p>
              <Button onClick={() => setActiveTab('integracoes')}>Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: UX */}
      {activeTab === 'ux' && (
        <div className="space-y-8">
          {isClarityConnected ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
              <Activity className="w-8 h-8 mx-auto text-indigo-500 mb-3" />
              <p className="text-gray-900 font-medium">Microsoft Clarity Ativo</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Activity className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Passo a Passo: Microsoft Clarity</h3>
              <p className="text-sm text-gray-600 mb-6 text-left">
                1. Crie o projeto no Microsoft Clarity.<br/>
                2. Vá em Configurações > Visão Geral e copie o Project ID.<br/>
                3. Conecte no CRM usando a aba "Integrações Técnicas".
              </p>
              <Button onClick={() => setActiveTab('integracoes')}>Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Rastreamento */}
      {activeTab === 'rastreamento' && (
        <div className="space-y-8">
          {isGtmConnected ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
              <Globe className="w-8 h-8 mx-auto text-yellow-500 mb-3" />
              <p className="text-gray-900 font-medium">Google Tag Manager Ativo</p>
              <p className="text-sm text-gray-500">ID do Container: {gtm.container_id}</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Globe className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Passo a Passo: Google Tag Manager</h3>
              <p className="text-sm text-gray-600 mb-6 text-left">
                1. Crie um Workspace/Container no GTM.<br/>
                2. Copie o Container ID (Ex: GTM-XXXXXXX).<br/>
                3. Instale o snippet no cabeçalho do site do cliente.<br/>
                4. Conecte no CRM usando a aba "Integrações Técnicas".
              </p>
              <Button onClick={() => setActiveTab('integracoes')}>Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}
"""

final_content = content[:start_idx] + new_tabs + content[end_idx:]

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx", "w", encoding="utf-8") as f:
    f.write(final_content)
print("File rewritten successfully")
