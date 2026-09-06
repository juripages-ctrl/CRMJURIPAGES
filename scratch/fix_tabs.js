const fs = require('fs');
const path = require('path');

const file = path.resolve('c:/Espaço de Trabalho/JuriPages/Projetos/CRM - SITE/src/app/dashboard/meus-sites/[id]/SiteReportTabs.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the useState for activeTab
content = content.replace(
  /useState<'geral' \| 'seo' \| 'rede' \| 'aquisicao' \| 'ux' \| 'rastreamento' \| 'historico'>/g,
  `useState<'geral' | 'seo' | 'ux' | 'historico' | 'speed'>`
);

// 2. Remove the navigation buttons for Rede, Aquisicao, Rastreamento
content = content.replace(/<button[^>]*onClick=\{[^}]*setActiveTab\('rede'\)[^>]*>[\s\S]*?<\/button>/g, '');
content = content.replace(/<button[^>]*onClick=\{[^}]*setActiveTab\('aquisicao'\)[^>]*>[\s\S]*?<\/button>/g, '');
content = content.replace(/<button[^>]*onClick=\{[^}]*setActiveTab\('rastreamento'\)[^>]*>[\s\S]*?<\/button>/g, '');

// 3. Let's chop off everything from {/* RASTREAMENTO (GTM) */} down to the broken !speedData block
const startRastreamento = content.indexOf('{/* RASTREAMENTO (GTM) */}');
const endSpeedError = content.indexOf('{!speedData && !speedLoading && !speedError && (');

if (startRastreamento !== -1 && endSpeedError !== -1) {
  const replacement = `      {/* HISTORICO */}
      {activeTab === 'historico' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Histórico e Relatório</h3>
              <p className="text-sm text-gray-500">Resumo consolidado do desempenho do projeto ({dateFilter.replace('_', ' ')}).</p>
            </div>
            <button 
              onClick={() => alert('O relatório já está sendo exibido abaixo. No futuro, este botão chamará a IA para re-gerar o texto.')}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Atualizar Relatório
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-5 shadow-sm max-w-3xl">
                <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                  Olá! Aqui está o resumo do desempenho do site **{site.dominio}** no período analisado:
                  
                  {hasGsc && \`\\n\\n🔍 **Pesquisa Google (SEO):** O site obteve um total de **\${totalClicks.toLocaleString('pt-BR')} cliques** e **\${gscData.reduce((acc, curr) => acc + curr.impressions, 0).toLocaleString('pt-BR')} impressões**. A taxa de clique (CTR) média ficou em **\${avgCtr}%**, com uma posição média de **\${avgPosition}** nos resultados de busca.\`}
                  
                  {!hasGsc && \`\\n\\n⚠️ O projeto ainda não possui dados suficientes coletados. Conecte as integrações para obter insights automáticos.\`}
                  
                  {'\\n\\n'}Estou monitorando os dados continuamente. Se precisar de uma análise mais profunda sobre alguma página específica, verifique as abas de SEO e UX!
                </p>
                <span className="text-xs text-gray-400 mt-4 block">Gerado automaticamente pelo Assistente</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* SPEED INSIGHTS */}
      {activeTab === 'speed' as any && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">PageSpeed Insights</h3>
                <p className="text-sm text-gray-500">
                  Avalie a velocidade de carregamento e experiência da página do seu site em tempo real usando a ferramenta oficial do Google.
                </p>
              </div>
              <button 
                onClick={handleCheckSpeed}
                disabled={speedLoading}
                className={\`px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 \${
                  speedLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800'
                }\`}
              >
                {speedLoading ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {speedLoading ? 'Verificando Velocidade...' : 'Realizar verificação de velocidade'}
              </button>
            </div>
            
            {speedError && (
              <div className="p-4 mb-6 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                {speedError}
              </div>
            )}
            
            `;
  content = content.substring(0, startRastreamento) + replacement + content.substring(endSpeedError);
}

// 4. Also remove the Rede and Aquisicao blocks if they exist
content = content.replace(/\{\/\* REDE E SEGURANÇA \*\/\}[\s\S]*?\{\/\* AQUISIÇÃO \(GA4\) \*\/\}/, '{/* AQUISIÇÃO (GA4) */}');
content = content.replace(/\{\/\* AQUISIÇÃO \(GA4\) \*\/\}[\s\S]*?\{\/\* UX E COMPORTAMENTO \*\/\}/, '{/* UX E COMPORTAMENTO */}');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SiteReportTabs.tsx!');
