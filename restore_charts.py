import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add Date Filter UI before Tabs Content
if "Date Filter UI" not in content:
    date_filter_ui = """
      {/* Date Filter UI */}
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col items-end gap-3">
          <div className="bg-gray-200/60 p-1 rounded-full flex flex-wrap items-center gap-1">
            <button onClick={() => setDateFilter('hoje')} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'hoje' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>Hoje</button>
            <button onClick={() => setDateFilter('7_dias')} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === '7_dias' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>7 Dias</button>
            <button onClick={() => setDateFilter('30_dias')} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === '30_dias' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>30 Dias</button>
            <button onClick={() => setDateFilter('periodo')} className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${dateFilter === 'periodo' ? 'text-white bg-black shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>Período</button>
          </div>
          {dateFilter === 'periodo' && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs bg-transparent border-none outline-none text-gray-700 cursor-pointer" />
              <span className="text-gray-400 text-xs">até</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs bg-transparent border-none outline-none text-gray-700 cursor-pointer" />
            </div>
          )}
        </div>
      </div>
      
      {/* Tab Content */}"""
    content = content.replace("{/* Tab Content */}", date_filter_ui)

# Update SEO / GSC
if "const totalClicks =" not in content:
    # Add calculations at the top of the component render block
    calc_logic = """
  // Calculations for GSC
  const totalClicks = gscData.reduce((acc, curr) => acc + curr.clicks, 0)
  const avgCtr = gscData.length > 0 ? (gscData.reduce((acc, curr) => acc + parseFloat(curr.ctr), 0) / gscData.length).toFixed(2) : 0
  const avgPosition = gscData.length > 0 ? (gscData.reduce((acc, curr) => acc + parseFloat(curr.position), 0) / gscData.length).toFixed(1) : 0
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
"""
    content = content.replace("  return (\n", calc_logic)

gsc_ui = """            <div className="bg-gradient-to-br from-white to-[#F6F6F6] rounded-[2rem] p-6 lg:p-8 border border-white/60 relative">
               <h3 className="font-semibold text-gray-900 mb-6">Google Search Console</h3>
               {gscData.length === 0 ? (
                 <div className="py-10 text-center">
                   <p className="text-gray-500 text-sm">Nenhum dado encontrado para o período.</p>
                 </div>
               ) : (
                 <>
                   <div className="relative w-full h-48 mb-8">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={gscData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                         <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#CBD5E1" />
                         <XAxis dataKey="date" tick={{fontSize: 10, fill: '#9ca3af'}} tickLine={false} axisLine={false} dy={10} />
                         <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} tickLine={false} axisLine={false} />
                         <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#000', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                         <Line type="monotone" dataKey="clicks" name="Cliques" stroke="#000" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#DFFF00', stroke: '#000', strokeWidth: 2 }} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                     <div><p className="text-sm text-gray-500 mb-1">Total Cliques</p><h4 className="text-2xl font-semibold text-gray-900">{totalClicks.toLocaleString('pt-BR')}</h4></div>
                     <div><p className="text-sm text-gray-500 mb-1">CTR Médio</p><h4 className="text-2xl font-semibold text-gray-900">{avgCtr}%</h4></div>
                     <div><p className="text-sm text-gray-500 mb-1">Posição Média</p><h4 className="text-2xl font-semibold text-gray-900">{avgPosition}</h4></div>
                   </div>
                 </>
               )}
            </div>"""

cf_ui = """            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-gray-100 shadow-sm relative">
                <h3 className="text-base text-gray-500 font-medium mb-6">Tráfego de Rede (30d)</h3>
                {!cfData ? (
                  <p className="text-sm text-gray-400 mt-10">Aguardando dados...</p>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-3xl font-bold text-gray-900 tracking-tight">{cfData.totals?.requests?.all?.toLocaleString('pt-BR') || 0}</h4>
                      <p className="text-sm text-gray-400 mt-1">Requisições Totais (Edge)</p>
                    </div>
                    <div className="w-full h-px bg-gray-100 my-4"></div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 tracking-tight">{cfData.totals?.uniques?.all?.toLocaleString('pt-BR') || 0}</h4>
                      <p className="text-sm text-gray-400 mt-1">Visitantes Únicos</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-[#DFFF00] rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group">
                <h3 className="text-base text-black/70 font-medium mb-6 relative z-10">Banda Consumida</h3>
                <div className="relative z-10 mt-auto pt-10">
                  {!cfData ? (
                    <h4 className="text-2xl font-medium text-black/40 tracking-tight">...</h4>
                  ) : (
                    <>
                      <h4 className="text-4xl font-semibold text-black tracking-tight mb-2">{formatBytes(cfData.totals?.bandwidth?.all || 0)}</h4>
                      <p className="text-sm text-black/50 font-medium">Banda de cache + origem</p>
                    </>
                  )}
                </div>
              </div>
            </div>"""

# Replace in content
gsc_pattern = re.compile(r'<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">\s*<h3 className="font-semibold text-gray-900 mb-2">Métricas de SEO</h3>\s*<p className="text-sm text-gray-500">A integração do Google Search Console está funcionando corretamente.</p>\s*\{\/\* Aqui entram os graficos reais futuramente \*\/}\s*<\/div>')
content = gsc_pattern.sub(gsc_ui, content)

cf_pattern = re.compile(r'<div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">\s*<h3 className="font-semibold text-gray-900 mb-2">Segurança e Tráfego WAF</h3>\s*<p className="text-sm text-gray-500">A integração do Cloudflare está funcionando corretamente.</p>\s*<\/div>')
content = cf_pattern.sub(cf_ui, content)

# Also fix the import of LineChart if missing
if "LineChart" not in content[:500]:
    content = content.replace("import { Activity,", "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'\nimport { Activity,")

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Restored charts")
