'use client'

import { useState } from 'react'
import { Cloud, Search, CheckCircle2, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { saveMasterCloudflare, saveMasterGoogle, disconnectMasterIntegration, saveMasterPageSpeed } from './actions'

type Props = {
  config: any
}

export function ConfiguracoesClient({ config }: Props) {
  const [loading, setLoading] = useState(false)
  const [cfError, setCfError] = useState('')
  const [gscError, setGscError] = useState('')

  const cfConnected = !!config?.cloudflare_api_token
  const gscConnected = !!config?.gsc_refresh_token
  const psConnected = !!config?.pagespeed_api_key

  async function handleCloudflareSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setCfError('')
    const formData = new FormData(e.currentTarget)
    const res = await saveMasterCloudflare(formData)
    if (res.error) setCfError(res.error)
    setLoading(false)
  }

  const [psError, setPsError] = useState('')
  async function handlePageSpeedSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setPsError('')
    const formData = new FormData(e.currentTarget)
    const res = await saveMasterPageSpeed(formData)
    if (res.error) setPsError(res.error)
    setLoading(false)
  }

  async function handleDisconnect(tipo: 'cloudflare' | 'google' | 'pagespeed') {
    if (confirm('Deseja realmente desconectar esta API Global? Isso pode afetar todos os sites!')) {
      await disconnectMasterIntegration(tipo)
    }
  }

  const StatusBadge = ({ isConnected }: { isConnected: boolean }) => (
    isConnected ? (
      <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Conectado</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600 flex items-center gap-1"><Unplug className="w-3 h-3"/> Desconectado</Badge>
    )
  )

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Integrações Globais (Agência)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Conecte suas contas principais aqui. Ao adicionar um novo site para um cliente, 
          você poderá plugar o domínio na integração correspondente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cloudflare Master Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cloudflare (Global)</h3>
                <p className="text-xs text-gray-500">Acesso a todos os domínios e zonas</p>
              </div>
            </div>
            <StatusBadge isConnected={cfConnected} />
          </div>

          {cfConnected ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium mb-1">API Conectada com Sucesso!</p>
                <p className="text-xs text-green-600">Seus sites já podem ser vinculados ao Cloudflare.</p>
              </div>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDisconnect('cloudflare')}>
                Desconectar Cloudflare Global
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCloudflareSubmit} className="space-y-4">
              {cfError && <p className="text-xs text-red-500">{cfError}</p>}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Global API Key ou Token</label>
                <Input name="api_token" type="password" placeholder="Sua chave de API" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Conectar Cloudflare
              </Button>
            </form>
          )}
        </div>

        {/* Google Search Console Master Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Google Search Console (Global)</h3>
                <p className="text-xs text-gray-500">Acesso para ler métricas de SEO</p>
              </div>
            </div>
            <StatusBadge isConnected={gscConnected} />
          </div>

          {gscConnected ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium mb-1">Conta Google Conectada!</p>
                <p className="text-xs text-green-600">Acesso autorizado ao Search Console.</p>
              </div>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDisconnect('google')}>
                Desconectar Google Global
              </Button>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col justify-center">
              {gscError && <p className="text-xs text-red-500">{gscError}</p>}
              <p className="text-sm text-gray-600 text-center mb-2">
                Conecte a conta do Google que possui acesso de propriedade ou delegação a todos os domínios gerenciados pela sua agência.
              </p>
              <a 
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Conectar com Google Master
              </a>
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* PageSpeed Insights Master Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">PageSpeed Insights</h3>
                <p className="text-xs text-gray-500">Acesso para ler métricas de Velocidade</p>
              </div>
            </div>
            <StatusBadge isConnected={psConnected} />
          </div>

          {psConnected ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium mb-1">API Conectada com Sucesso!</p>
                <p className="text-xs text-green-600">Seus sites já podem rodar análises de velocidade de forma confiável.</p>
              </div>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDisconnect('pagespeed')}>
                Desconectar PageSpeed Global
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {psError && <p className="text-xs text-red-500">{psError}</p>}
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                <p className="text-xs font-semibold text-amber-800 mb-2">Como obter a chave de API:</p>
                <ol className="text-xs text-amber-900 list-decimal pl-4 space-y-1">
                  <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" className="underline font-bold">Google Cloud Console</a>.</li>
                  <li>Crie um projeto ou selecione um existente.</li>
                  <li>Vá em <strong>APIs & Services &gt; Library</strong>.</li>
                  <li>Busque por <strong>PageSpeed Insights API</strong> e ative-a.</li>
                  <li>Vá em <strong>Credentials</strong> &gt; <strong>Create credentials</strong> &gt; <strong>API key</strong>.</li>
                  <li>Copie a chave gerada e cole abaixo.</li>
                </ol>
              </div>

              <form onSubmit={handlePageSpeedSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Chave de API</label>
                  <Input name="pagespeed_api_key" type="password" placeholder="AIzaSy..." required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Conectar PageSpeed Insights
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
