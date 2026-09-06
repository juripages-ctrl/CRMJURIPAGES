import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { resetPassword } from "./actions"

export default async function RecuperarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, message?: string }>
}) {
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
              <CardTitle className="text-2xl font-bold text-gray-900">Recuperar Senha</CardTitle>
              <CardDescription className="text-gray-500 mt-2">
                Digite o e-mail associado à sua conta e enviaremos um link para você redefinir sua senha.
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
                  <label className="text-sm font-semibold text-gray-700" htmlFor="email">E-mail</label>
                  <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="h-11 rounded-xl" />
                </div>
                
                <div className="pt-4">
                  <Button formAction={resetPassword} variant="default" className="w-full h-11 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800">
                    Enviar link de recuperação
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
