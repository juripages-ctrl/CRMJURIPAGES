import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add missing lucide icons
if "ArrowUpRight" not in content:
    content = content.replace("import { Activity,", "import { Activity, Search, ArrowUpRight,")
elif "Search" not in content:
    content = content.replace("import { Activity,", "import { Activity, Search,")

indexed_pages_ui = """
                   </div>
                 </>
               )}
            </div>

            {/* Páginas Indexadas (GSC) */}
            {!selectedPageUrl && (
              <div className="bg-gradient-to-br from-white to-[#F6F6F6] rounded-[2rem] p-6 lg:p-8 border border-white/60 relative mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base text-gray-600 font-medium">Páginas Indexadas (Google)</h3>
                      <p className="text-xs text-gray-400">URLs que apareceram nos resultados de busca ({
                        dateFilter === 'hoje' ? 'Hoje' :
                        dateFilter === '7_dias' ? '7 Dias' :
                        dateFilter === '30_dias' ? '30 Dias' : 'Personalizado'
                      })</p>
                    </div>
                  </div>
                </div>

                {indexedPages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {indexedPages.map((page: any, idx: number) => {
                      const rawUrl = page.keys[0]
                      const formattedUrl = (rawUrl.replace(`https://${site.dominio}`, '') === '' || rawUrl.replace(`https://${site.dominio}`, '') === '/') 
                        ? 'Página Principal' 
                        : rawUrl.replace(`https://${site.dominio}`, '')
                        
                      return (
                        <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                          <div>
                            <div className="flex items-start justify-between mb-3 gap-2">
                              <h4 className="font-medium text-sm text-gray-900 break-all line-clamp-2" title={rawUrl}>
                                {formattedUrl}
                              </h4>
                              <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black flex-shrink-0">
                                <ArrowUpRight className="w-4 h-4" />
                              </a>
                            </div>
                            <div className="flex gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Cliques</p>
                                <p className="font-semibold text-gray-900">{page.clicks.toLocaleString('pt-BR')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Impressões</p>
                                <p className="font-semibold text-gray-900">{page.impressions.toLocaleString('pt-BR')}</p>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedPageUrl(rawUrl)}
                            className="mt-6 w-full py-2 bg-gray-50 hover:bg-black text-gray-700 hover:text-white rounded-xl text-xs font-medium transition-colors border border-gray-100 group-hover:border-black"
                          >
                            Filtrar por esta página
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <p>Nenhuma página indexada encontrada neste período.</p>
                  </div>
                )}
              </div>
            )}"""

# Replace the closing tags of the GSC chart block with the indexed_pages_ui
target = """                   </div>
                 </>
               )}
            </div>"""

if target in content and "Páginas Indexadas (Google)" not in content:
    content = content.replace(target, indexed_pages_ui, 1)

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Indexed pages added")
