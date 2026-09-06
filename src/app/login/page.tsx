import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Badge } from "@/components/ui/Badge"
import { Sparkles, CheckCircle2 } from "lucide-react"
import { login, signup } from "./actions"
import { PublicPlansShowcase } from "./PublicPlansShowcase"
import { createClient } from "@/utils/supabase/server"
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;
  
  // Buscar planos publicamente
  const supabase = await createClient();
  const { data: planos } = await supabase.from('planos').select('*').eq('ativo', true).order('valor', { ascending: true })
  
  return (
    <div className="min-h-screen bg-page flex flex-col font-sans">
      
      {/* Header Simples */}
      <header className="w-full bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary fill-current" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">JuriPages</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Lado Esquerdo: Copywriting */}
        <div className="space-y-8">
          <Badge className="bg-primary/10 text-primary border-0 px-3 py-1 text-sm font-medium">CRM Inteligente</Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
            Seu escritório sob controle absoluto.
          </h1>
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
            Gerencie clientes, assinaturas de suporte, histórico de sites e métricas de desempenho em um único painel integrado, seguro e projetado para escritórios jurídicos.
          </p>
          
          <ul className="space-y-4">
            {['Gestão financeira simplificada', 'Acompanhamento de SEO e tráfego', 'Suporte técnico prioritário', 'Planos escaláveis para seu tamanho'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lado Direito: Formulário de Autenticação */}
        <div className="w-full max-w-md mx-auto lg:ml-auto shadow-2xl rounded-2xl relative">
          {/* Efeito visual atrás do card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2rem] blur-xl opacity-70"></div>
          
          <Card className="w-full bg-white relative border-0 shadow-none rounded-[1.5rem] z-10 p-2">
            <CardHeader className="text-center pb-6 pt-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Acesse sua conta</CardTitle>
              <CardDescription className="text-gray-500 mt-1">Crie sua conta ou faça login para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                  {error === 'true' ? 'E-mail ou senha incorretos.' : error}
                </div>
              )}
              <form className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="email">E-mail</label>
                  <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="password">Senha</label>
                    <Link href="/recuperar-senha" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <PasswordInput id="password" name="password" placeholder="••••••••" required className="h-11 rounded-xl" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button formAction={signup} variant="outline" className="flex-1 h-11 rounded-xl font-semibold">Criar Conta</Button>
                  <Button formAction={login} variant="default" className="flex-1 h-11 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800">Entrar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Showcase de Planos (Vitrine) */}
      <section className="bg-white border-t border-gray-100 flex-1">
        <PublicPlansShowcase planos={planos || []} />
      </section>

      {/* Footer Simples */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} JuriPages. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
