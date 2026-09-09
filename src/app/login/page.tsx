import { Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { login } from "./actions"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  return (
    <div className="flex w-full min-h-screen overflow-hidden bg-[#F3F4F6] font-sans antialiased text-[#111827]">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center p-16">
          <div className="w-[420px]">
            <Link href="/" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
              <div className="w-[38px] h-[38px] rounded-full bg-[#111827] flex items-center justify-center">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="#DFFF00">
                  <path d="M12 2.5l1.9 5.1 5.1 1.9-5.1 1.9L12 16.5l-1.9-5.1L5 9.5l5.1-1.9z"></path>
                </svg>
              </div>
              <span className="text-[20px] font-semibold tracking-[-0.03em]">JuriPages</span>
            </Link>
            
            <h1 className="m-0 mb-2 text-[40px] font-medium tracking-[-0.035em] leading-[1.1]">Acesse sua conta</h1>
            <p className="m-0 mb-8 text-[16px] text-[#6B7280]">Painel de gestão de sites e SEO do seu escritório.</p>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium text-center">
                {error}
              </div>
            )}

            <form action={login}>
              <label className="block text-[13px] font-semibold text-[#374151] mb-2">E-mail</label>
              <div className="flex items-center gap-3 h-[52px] px-[18px] bg-white border border-[#E5E7EB] rounded-full mb-5 focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                  <path d="M3 6l9 7 9-7"></path>
                </svg>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="seu@email.com.br"
                  className="flex-1 border-0 outline-none bg-transparent font-inherit text-[15px] min-w-0"
                />
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <label className="text-[13px] font-semibold text-[#374151]">Senha</label>
                <Link href="/recuperar-senha" className="text-[13px] font-medium text-[#6214d1] hover:text-[#4c0fa6]">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="flex items-center gap-3 h-[52px] px-[18px] bg-white border border-[#E5E7EB] rounded-full mb-7 focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent transition-shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                  <rect x="4" y="10" width="16" height="10" rx="3"></rect>
                  <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                </svg>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="flex-1 border-0 outline-none bg-transparent font-inherit text-[15px] tracking-[0.15em] min-w-0"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="flex-[1.5] h-[54px] border-0 rounded-full bg-[#111827] text-white font-inherit text-[15.5px] font-semibold cursor-pointer shadow-[0_14px_28px_-14px_rgba(17,24,39,0.7)] hover:bg-[#1E293B] transition-colors active:scale-[0.98]"
                >
                  Entrar
                </button>
                <Link 
                  href="/cadastro"
                  className="flex-1 flex items-center justify-center h-[54px] border border-[#E5E7EB] rounded-full bg-white font-inherit text-[15.5px] font-semibold text-[#111827] cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]"
                >
                  Criar conta
                </Link>
              </div>
            </form>

            <p className="mt-[26px] mb-0 text-[12.5px] text-[#9CA3AF]">Acesso protegido · JuriPages CRM</p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Painel Decorativo */}
      <div className="box-border w-[620px] flex-none p-[26px] pl-0 max-lg:hidden">
        <div className="box-border relative overflow-hidden h-full rounded-[40px] bg-gradient-to-br from-[#111827] via-[#000] via-[55%] to-[#1E293B] p-[56px] flex flex-col justify-between">
          <div className="absolute -right-[90px] -top-[90px] w-[360px] h-[360px] rounded-full bg-[rgba(223,255,0,0.14)] blur-[70px]"></div>
          <div className="absolute -left-[100px] -bottom-[110px] w-[340px] h-[340px] rounded-full bg-[rgba(98,20,209,0.35)] blur-[70px]"></div>
          
          <p className="relative m-0 text-[13px] font-semibold tracking-[0.1em] uppercase text-white/50">
            JuriPages CRM
          </p>
          
          <div className="relative">
            <h2 className="m-0 mb-[18px] text-[44px] font-medium tracking-[-0.04em] leading-[1.08] text-white">
              Todo o desempenho<br/>do seu escritório<br/>em um só painel.
            </h2>
            <p className="m-0 text-[16px] leading-[1.6] text-white/60 max-w-[400px]">
              Search Console, WordPress, blog e faturamento conectados — com relatórios que o cliente entende.
            </p>
          </div>
          
          <div className="relative flex gap-[14px]">
            {/* Números removidos conforme solicitação */}
          </div>
        </div>
      </div>
    </div>
  )
}
