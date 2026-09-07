import {
  ArrowRight, ShieldCheck, ArrowDown,
  LayoutDashboard, LineChart, MessageSquare, Bell, CreditCard, Lock, Eye, Layers, Focus
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
)

export default function JuriPagesAppLanding() {
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
              <span>Falar com o suporte</span>
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
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-24">

        {/* Section 1: Hero */}
        <section className="relative flex flex-col md:flex-row items-center justify-between py-10 md:py-20 lg:py-24">
          {/* Decorative blur */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-[#DFFF00]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 md:w-3/5 lg:w-[55%]">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 tracking-tight leading-[1.1] mb-6">
              Toda a gestão do seu <span className="italic text-gray-500">site jurídico</span> em um só lugar.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              Acompanhe o desempenho do seu site, acesse relatórios de SEO e gerencie seu plano de suporte de forma centralizada e intuitiva com o aplicativo exclusivo da JuriPages.
            </p>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors text-lg shadow-lg shadow-black/10">
                  Acessar meu painel <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Abstract Graphic */}
          <div className="relative z-10 mt-16 md:mt-0 md:w-2/5 lg:w-[40%] flex justify-center md:justify-end">
            <div className="w-72 h-72 md:w-96 md:h-96 bg-white/40 backdrop-blur-xl rounded-full border border-white flex items-center justify-center relative shadow-[0_0_60px_rgba(0,0,0,0.05)]">
              <div className="absolute inset-8 border-2 border-dashed border-gray-200/60 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-16 border border-gray-100/50 rounded-full"></div>
              <div className="w-40 h-40 md:w-48 md:h-48 bg-[#DFFF00] rounded-full flex items-center justify-center shadow-2xl z-10 relative">
                <LayoutDashboard className="w-16 h-16 md:w-20 md:h-20 text-black" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Serviços de suporte */}
        <section className="bg-black rounded-[3rem] p-10 md:p-16 lg:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#DFFF00]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6">
              Suporte técnico completo após a entrega do seu projeto.
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              Nosso compromisso não termina quando o seu site vai ao ar. Com o nosso plano de suporte, você conta com uma infraestrutura robusta e uma equipe dedicada para manter a sua presença digital sempre atualizada e segura, sem que você precise lidar com questões técnicas.
            </p>
          </div>
        </section>

        {/* Section 3: Funcionalidades do aplicativo */}
        <section className="flex flex-col gap-12">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 tracking-tight mb-4">
              Tudo o que você precisa para acompanhar a sua presença digital.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
              <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-gray-900">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Controle da sua rede de sites.</h3>
                <p className="text-gray-500 leading-relaxed">Visualize o status de todos os seus projetos online em tempo real. Saiba exatamente o que está ativo, pausado ou em desenvolvimento, sem precisar acessar múltiplas plataformas.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
              <div className="w-14 h-14 bg-[#DFFF00]/20 rounded-2xl flex items-center justify-center text-black">
                <LineChart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Relatórios de performance e SEO.</h3>
                <p className="text-gray-500 leading-relaxed">Entenda como o seu site está se saindo no Google. Acesse gráficos claros e simplificados de cliques e impressões diretamente do Search Console, focados no que realmente importa.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
              <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-gray-900">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Comunicação direta e transparente.</h3>
                <p className="text-gray-500 leading-relaxed">Receba comunicados oficiais, notas técnicas da nossa equipe e atualizações importantes sobre o andamento do seu projeto através de um feed exclusivo.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
              <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-gray-900">
                <Bell className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Alertas dinâmicos e atualizações em tempo real.</h3>
                <p className="text-gray-500 leading-relaxed">Fique por dentro de avisos de SEO, status da sua hospedagem e andamento de manutenções com um sistema de notificações inteligente.</p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
              <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-gray-900">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Controle de planos e faturas.</h3>
                <p className="text-gray-500 leading-relaxed">Acesse seu painel financeiro para visualizar os detalhes da sua assinatura de suporte, extrato de pagamentos e próximas renovações com total clareza.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Benefícios do app e do suporte */}
        <section className="flex flex-col gap-12 bg-gray-100/50 rounded-[3rem] p-8 md:p-12 lg:p-16 border border-white">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 tracking-tight mb-4">
              Por que utilizar o painel do cliente JuriPages?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="flex gap-6 items-start">
              <div className="mt-1 w-12 h-12 shrink-0 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-800">
                <Focus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Foco no seu escritório.</h3>
                <p className="text-gray-600 leading-relaxed">Deixe a parte técnica conosco. Evite a necessidade de navegar por plataformas complexas de hospedagem e foca no atendimento aos seus clientes.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="mt-1 w-12 h-12 shrink-0 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-800">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Proteção e segurança.</h3>
                <p className="text-gray-600 leading-relaxed">Mantenha as credenciais das suas ferramentas e integrações protegidas, acessando apenas o que é relevante para o acompanhamento dos resultados.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="mt-1 w-12 h-12 shrink-0 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-800">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Visão clara de resultados.</h3>
                <p className="text-gray-600 leading-relaxed">Acompanhe o crescimento da sua visibilidade online com relatórios limpos, sem excesso de jargões técnicos.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="mt-1 w-12 h-12 shrink-0 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-800">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Centralização da comunicação.</h3>
                <p className="text-gray-600 leading-relaxed">Troque as dezenas de e-mails perdidos por um ambiente único, onde todo o histórico do seu site e do nosso suporte fica registrado e organizado.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: CTA Final */}
        <section className="bg-[#DFFF00] rounded-[3rem] p-12 md:p-16 lg:p-20 text-center relative overflow-hidden mb-12 shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-black">
              Tenha o controle do seu projeto digital na palma da mão.
            </h2>
            <Link href="/login">
              <button className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors text-lg shadow-2xl shadow-black/20">
                Acessar o aplicativo JuriPages <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
