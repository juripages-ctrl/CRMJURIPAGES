import {
  Sparkles, Asterisk, GripHorizontal, ArrowUpRight,
  Check, Info, ArrowRight, ShieldCheck, LifeBuoy, Zap, ArrowDown
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
)

export default function SupportPlansPage() {
  return (
    <div className="bg-[#F3F4F6] text-gray-800 antialiased selection:bg-[#DFFF00] selection:text-black min-h-screen font-sans">

      {/* Navbar Sticky */}
      <nav className="sticky top-0 z-50 bg-[#F3F4F6]/80 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Image src="/logo.webp" alt="JuriPages" width={180} height={40} className="h-8 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-500 text-sm font-medium hidden sm:flex items-center gap-1.5 group hover:text-[#25D366] transition-colors">
              <span>Falar com um web desing</span>
              <WhatsAppIcon className="w-5 h-5 hidden group-hover:block text-[#25D366]" />
            </button>
            <Link href="/login">
              <button className="px-6 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors text-sm font-medium">
                Entrar
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Sections */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-20">

        {/* Section 1: Hero */}
        <section className="relative flex flex-col md:flex-row items-center justify-between py-10 md:py-20 lg:py-24">
          {/* Decorative blur */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-[#DFFF00]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 md:w-3/5 lg:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 tracking-tight leading-[1.1] mb-6">
              Sua estrutura online sempre
              <span className="italic text-gray-500"> segura e Atualizada.</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              Foque em advogar enquanto nós cuidamos de toda a tecnologia do seu escritório. Hospedagem, atualizações e suporte contínuo.
            </p>

            <div className="flex items-center gap-4">
              <button className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors text-lg shadow-lg shadow-black/10">
                Explorar Planos <ArrowDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Abstract Graphic */}
          <div className="relative z-10 mt-16 md:mt-0 md:w-2/5 lg:w-1/2 flex justify-center md:justify-end">
            <div className="w-72 h-72 md:w-96 md:h-96 bg-white/40 backdrop-blur-xl rounded-full border border-white flex items-center justify-center relative shadow-[0_0_60px_rgba(0,0,0,0.05)]">
              <div className="absolute inset-8 border-2 border-dashed border-gray-200/60 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-16 border border-gray-100/50 rounded-full"></div>
              <div className="w-40 h-40 md:w-48 md:h-48 bg-[#DFFF00] rounded-full flex items-center justify-center shadow-2xl z-10 relative">
                <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-black" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing Cards */}
        <section className="flex flex-col gap-10">

          <div className="text-center flex flex-col items-center">
            <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 tracking-tight mb-4">Escolha o Plano Ideal</h2>

            {/* Cycle Filter Pill */}
            <div className="bg-gray-200/60 p-1.5 rounded-full flex flex-wrap justify-center items-center gap-1 mb-6">
              <button className="px-5 py-2 text-sm text-white bg-black font-medium rounded-full shadow-md transition-colors">Mensal</button>
              <button className="px-5 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium rounded-full transition-colors">Semestral (-10%)</button>
              <button className="px-5 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium rounded-full transition-colors">Anual (-20%)</button>
            </div>

            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Tudo o que você precisa para manter o site do seu escritório no ar, rápido e gerando resultados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Plano Essencial */}
            <div className="bg-[#F2F2F2] rounded-[2.5rem] p-8 md:p-10 relative border border-white/60 flex flex-col hover:-translate-y-2 transition-transform duration-300">
              <div className="flex justify-between items-start mb-8">
                <span className="text-lg text-gray-600 font-medium">Essencial</span>
                <button className="w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-medium text-gray-500">R$</span>
                  <span className="text-5xl font-medium text-gray-900 tracking-tight">120</span>
                  <span className="text-base text-gray-500">/mês</span>
                </div>
                <div className="mt-4 bg-white/50 py-1.5 px-4 rounded-full inline-block text-sm font-medium text-gray-600 border border-white/60">
                  Até 1 Site
                </div>
              </div>

              <ul className="space-y-4 flex-1 mb-10">
                {[
                  "Atualizações mensais do sistema",
                  "Backup semanal preventivo",
                  "Suporte em horário comercial",
                  "Segurança básica (SSL)",
                  "Checagem de indexação no Google"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-gray-600">
                    <Check className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-4 bg-white border border-gray-200 rounded-2xl font-medium text-gray-900 hover:bg-gray-50 transition-colors text-base shadow-sm">
                Selecionar Essencial
              </button>
            </div>

            {/* Plano Profissional (Destaque Lime) */}
            <div className="bg-[#DFFF00] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              {/* Decorative Circles */}
              <div className="absolute -right-10 -top-10 w-64 h-64 border border-black/5 rounded-full pointer-events-none"></div>
              <div className="absolute -right-2 -top-2 w-64 h-64 border border-black/5 rounded-full pointer-events-none"></div>

              <div className="relative z-10 flex justify-between items-start mb-8">
                <div className="flex flex-col gap-2">
                  <span className="text-lg text-black/70 font-medium">Profissional</span>
                  <span className="text-xs uppercase font-bold tracking-wider bg-black text-[#DFFF00] px-3 py-1 rounded-full w-max">Mais Popular</span>
                </div>
                <button className="w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors mt-1">
                  <ArrowUpRight className="w-5 h-5 text-black" />
                </button>
              </div>

              <div className="relative z-10 mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-medium text-black/50">R$</span>
                  <span className="text-5xl font-medium text-black tracking-tight">220</span>
                  <span className="text-base text-black/50">/mês</span>
                </div>
                <div className="mt-4 bg-white/30 py-1.5 px-4 rounded-full inline-block text-sm font-medium text-black border border-black/10">
                  Até 3 Sites
                </div>
              </div>

              <ul className="relative z-10 space-y-4 flex-1 mb-10">
                {[
                  "Atualização de conteúdo (15 dias)",
                  "Backup diário automático",
                  "Suporte 7 dias por semana",
                  "Segurança avançada (WAF)",
                  "Otimização SEO básico",
                  "Atualização de blog (6 textos)",
                  "Hospedagem e Domínio grátis"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-black/80 font-medium">
                    <Check className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="relative z-10 w-full py-4 bg-black rounded-2xl font-medium text-[#DFFF00] hover:bg-gray-900 transition-colors text-base shadow-2xl shadow-black/20">
                Selecionar Profissional
              </button>
            </div>

            {/* Plano Premium (Black) */}
            <div className="bg-black rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden flex flex-col text-white hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
              {/* Decorative Circles */}
              <div className="absolute -left-10 bottom-0 w-64 h-64 border border-white/10 rounded-full pointer-events-none"></div>
              <div className="absolute -left-2 bottom-4 w-64 h-64 border border-white/10 rounded-full pointer-events-none"></div>

              <div className="relative z-10 flex justify-between items-start mb-8">
                <span className="text-lg text-gray-400 font-medium">Premium</span>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="relative z-10 mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-medium text-gray-500">R$</span>
                  <span className="text-5xl font-medium text-white tracking-tight">350</span>
                  <span className="text-base text-gray-500">/mês</span>
                </div>
                <div className="mt-4 bg-white/10 py-1.5 px-4 rounded-full inline-block text-sm font-medium text-gray-300 border border-white/10">
                  Até 12 Sites
                </div>
              </div>

              <ul className="relative z-10 space-y-4 flex-1 mb-10">
                {[
                  "Atualização de conteúdo semanal",
                  "Backup diário duplo (Offsite)",
                  "Monitoramento 24h Proativo",
                  "Segurança avançada prioritária",
                  "Otimização para campanhas (Ads)",
                  "SEO contínuo (GSC/Clarity)",
                  "Blog e Novas páginas ilimitado*",
                  "Hospedagem VIP e Domínio"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-gray-300">
                    <Check className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="relative z-10 w-full py-4 bg-white/10 border border-white/20 rounded-2xl font-medium text-white hover:bg-white hover:text-black transition-colors text-base">
                Selecionar Premium
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Condições / FAQ */}
        <section className="mb-12">
          <div className="mb-8">
            <h3 className="text-2xl font-medium text-gray-900">Transparência e Condições</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#EAEAEA] rounded-[2rem] p-8 border border-white/50 flex flex-col gap-4 transition-colors hover:bg-white">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Info className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-lg text-gray-900">Forma de Contratação</h4>
              <p className="text-base text-gray-500 leading-relaxed">Planos em ciclos mensal, semestral e anual. Descontos aplicados automaticamente em pagamentos adiantados para garantir sua tranquilidade a longo prazo.</p>
            </div>

            <div className="bg-[#EAEAEA] rounded-[2rem] p-8 border border-white/50 flex flex-col gap-4 transition-colors hover:bg-white">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Zap className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-lg text-gray-900">Atualizações Extras</h4>
              <p className="text-base text-gray-500 leading-relaxed">Alterações fora do escopo ou ciclo de cada plano estão sujeitas a uma taxa avulsa de R$ 50 por solicitação específica, sempre com orçamento prévio.</p>
            </div>

            <div className="bg-[#EAEAEA] rounded-[2rem] p-8 border border-white/50 flex flex-col gap-4 transition-colors hover:bg-white">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <LifeBuoy className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-lg text-gray-900">Agende um Diagnóstico</h4>
              <p className="text-base text-gray-500 leading-relaxed mb-4">Em dúvida sobre o melhor plano? Conversamos sobre as necessidades específicas do seu escritório.</p>
              <button className="text-base font-medium text-black flex items-center gap-2 hover:gap-3 transition-all mt-auto w-max py-2">
                Falar no WhatsApp <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
