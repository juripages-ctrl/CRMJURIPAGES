import { Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#EDEDEB] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-violet-200/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#DFFF00]/30 rounded-full blur-[80px]"></div>
      </div>

      <Link href="/" className="flex flex-col items-center justify-center mb-8 hover:opacity-80 transition-opacity">
        <Image src="/logo.webp" alt="JuriPages" width={180} height={40} className="h-10 w-auto object-contain mb-2" />
        <span className="text-xs text-slate-500 font-medium">CRM Workspace</span>
      </Link>

      <div className="w-full max-w-[400px] bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Acesse sua conta</h1>
            <p className="text-sm text-slate-500 mt-2">Gerencie seu escritório no app.</p>
        </div>

        <form className="space-y-5">
            <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 ml-1">E-mail</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-400"
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-[13px] font-semibold text-slate-700">Senha</label>
                    <a href="#" className="text-[13px] font-medium text-violet-600 hover:text-violet-700 transition-colors">Esqueci</a>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-400"
                />
            </div>
            
            <div className="pt-4 space-y-3">
                <button 
                  type="submit"
                  className="w-full h-12 rounded-2xl font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.98] transition-all text-[15px]"
                >
                  Entrar
                </button>
                <button 
                  type="button" 
                  className="w-full h-12 rounded-2xl font-semibold bg-white/50 hover:bg-white/80 border border-slate-200 text-slate-700 active:scale-[0.98] transition-all text-[15px]"
                >
                  Criar Conta
                </button>
            </div>
        </form>
      </div>
    </div>
  )
}
