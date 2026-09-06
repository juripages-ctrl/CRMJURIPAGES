import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { updatePassword } from "./actions"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AtualizarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string }>
}) {
  const supabase = await createClient()
  
  // Garantir que o usuário está autenticado para ver esta página
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?error=Voc%C3%AA%20precisa%20estar%20logado%20para%20acessar%20esta%20p%C3%A1gina.')
  }

  const { error, message } = await searchParams;
  
  return (
    <div className="min-h-screen bg-page flex flex-col font-sans">
      
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary fill-current" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">JuriPages</span>
        </div>
      </header>

      <section className="flex-1 w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto relative">
          <Card className="w-full bg-white border border-gray-200 shadow-xl rounded-[1.5rem] p-2">
            <CardHeader className="text-center pb-6 pt-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Nova Senha</CardTitle>
              <CardDescription className="text-gray-500 mt-2">
                Digite sua nova senha abaixo.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                  {message}
                </div>
              )}
              
              <form className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="password">Nova Senha</label>
                  <PasswordInput id="password" name="password" placeholder="Mínimo de 6 caracteres" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="confirmPassword">Confirmar Nova Senha</label>
                  <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="Repita a senha" required className="h-11 rounded-xl" />
                </div>
                
                <div className="pt-4">
                  <Button formAction={updatePassword} variant="default" className="w-full h-11 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800">
                    Salvar e Entrar
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ir para o Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
