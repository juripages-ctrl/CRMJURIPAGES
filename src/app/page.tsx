import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Sparkles, LayoutGrid, Users, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-12 pb-20">
      
      {/* Top Navigation Mock */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm rounded-full mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary fill-current" />
          <span className="text-lg font-medium text-gray-900">CRM Agência</span>
        </div>
        <div className="flex gap-4">
          <Button variant="text">Suporte</Button>
          <Button variant="default">Entrar</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section>
        <Card variant="stats" className="w-full lg:w-1/2 relative overflow-hidden bg-gradient-to-b from-white to-gray-100 border-white/50">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6214d1]/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-medium text-gray-900 tracking-tight leading-[1.1] mb-6">
              Gestão inteligente<br />
              de clientes e sites.
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">
              Acompanhe integrações, pagamentos e converse com clientes de forma centralizada.
            </p>
            <div className="flex gap-4">
              <Button>Novo Cliente</Button>
              <Button variant="outline">Ver Relatórios</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* UI Components Preview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Componentes de UI</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-page rounded-[2.5rem] border border-gray-200 border-dashed">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Visão Geral</CardTitle>
                  <Badge variant="success">+15% esse mês</Badge>
                </div>
                <CardDescription>Resumo de atividades recentes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center bg-card-secondary p-4 rounded-[2.5rem] inline-flex border border-white/60">
                  <Button variant="iconActive" size="icon"><LayoutGrid className="w-5 h-5" /></Button>
                  <Button variant="iconHover" size="icon"><Users className="w-5 h-5" /></Button>
                  <Button variant="iconHover" size="icon"><Settings className="w-5 h-5" /></Button>
                </div>
                <div className="mt-4 max-w-sm">
                  <Input placeholder="Buscar cliente ou domínio..." />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card variant="secondary">
              <CardTitle className="text-lg">Status</CardTitle>
              <div className="mt-4 flex gap-2">
                <Badge variant="active">Ativo</Badge>
                <Badge variant="default">Pausado</Badge>
              </div>
            </Card>
          </div>

        </div>
      </section>
    </div>
  )
}
