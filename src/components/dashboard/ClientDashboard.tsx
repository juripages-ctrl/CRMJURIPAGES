import { ArrowUpRight } from 'lucide-react'

export function ClientDashboard({ firstName, sitesCount }: { firstName: string, sitesCount: number }) {
  return (
    <div className="w-full">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        
        {/* Welcome / Hero Card (4 Cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-white to-gray-100 rounded-[2.5rem] p-8 shadow-sm border border-white/50 relative overflow-hidden group">
          {/* Background decorative blur */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#DFFF00]/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-medium text-gray-900 tracking-tight leading-[1.1] mb-6">
                Olá {firstName},<br />
                aqui está o seu resumo mensal.
              </h1>
            </div>

            <div>
              <p className="text-gray-500 text-base mb-1">Seus Sites Ativos</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight text-gray-900">{sitesCount} site{sitesCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Analytics Card (8 Cols) - Simulated Client Data */}
        <div className="lg:col-span-8 bg-[#EAEAEA] rounded-[2.5rem] p-8 shadow-sm border border-white/50 relative">
          <div className="absolute top-6 right-6">
            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ArrowUpRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-base text-gray-500 font-medium">Cliques Orgânicos Totais</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-gray-900">4.2k</span>
                  <span className="text-sm text-gray-400">visitas este mês</span>
                </div>
              </div>
            </div>

            {/* Simulated Chart */}
            <div className="relative w-full h-40 mb-8 mt-6">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 100">
                <path d="M0,80 Q200,90 400,70 T800,60" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M0,70 Q100,50 200,65 T350,40 T600,25 T800,10" fill="none" stroke="#DFFF00" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
