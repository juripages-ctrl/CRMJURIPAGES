'use client'

import { useState, useRef } from 'react'
import { updateProfile } from './actions'
import { Camera, Loader2, User as UserIcon, Mail, Phone, Shield, Key, Users, Settings, CreditCard, MessageSquare, Bell, LogOut, ChevronRight, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PerfilData = {
  id: string
  nome: string
  email: string
  telefone: string
  avatar_url: string
  role: string
}

export function PerfilForm({ usuario }: { usuario: PerfilData }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alertasEnabled, setAlertasEnabled] = useState(true)
  
  const [avatarUrl, setAvatarUrl] = useState(usuario.avatar_url)
  const [nome, setNome] = useState(usuario.nome)
  const [email, setEmail] = useState(usuario.email)
  const [telefone, setTelefone] = useState(usuario.telefone)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const isAdmin = usuario.role === 'admin'

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      setError('')

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para enviar.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${usuario.id}/avatar-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      
      // Auto-salva a nova URL do avatar
      await updateProfile({ nome, avatar_url: publicUrl })
      
    } catch (error: any) {
      setError('Erro ao enviar imagem: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    setError('')
    setSuccess('')

    const res = await updateProfile({
      nome,
      email,
      telefone,
      avatar_url: avatarUrl
    })

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess('Perfil atualizado com sucesso!')
      setTimeout(() => setIsModalOpen(false), 1500)
    }
    setIsPending(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = isAdmin
    ? [
        { icon: UserIcon, label: 'Dados da conta', sub: 'Nome, e-mail e telefone', onClick: () => setIsModalOpen(true) },
        { icon: Key, label: 'Senha e segurança', sub: 'Trocar senha', onClick: () => router.push('/atualizar-senha') },
        { icon: Users, label: 'Equipe e acessos', sub: 'Gerenciar membros', onClick: () => router.push('/dashboard/configuracoes/equipe') },
        { icon: Settings, label: 'Master APIs', sub: 'Integrações globais', onClick: () => router.push('/dashboard/configuracoes') }
      ]
    : [
        { icon: UserIcon, label: 'Dados da conta', sub: 'Nome, e-mail e telefone', onClick: () => setIsModalOpen(true) },
        { icon: Key, label: 'Senha e segurança', sub: 'Trocar senha', onClick: () => router.push('/atualizar-senha') },
        { icon: CreditCard, label: 'Assinatura', sub: 'Gerenciar plano', onClick: () => router.push('/dashboard/financeiro') },
        { icon: MessageSquare, label: 'Anotações do time', sub: 'Comunicados', onClick: () => router.push('/dashboard/anotacoes') }
      ]

  return (
    <div className="w-full max-w-2xl mx-auto pb-10">
      
      {/* Header Profile */}
      <div className="flex flex-col items-center mb-10 pt-4">
        <div className="relative group mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md flex items-center justify-center relative">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <span className="text-gray-400 font-bold text-3xl">{nome.charAt(0).toUpperCase()}</span>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-20 disabled:opacity-50"
            title="Alterar Foto"
          >
            <Camera className="w-4 h-4" />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">{nome}</h2>
        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
          <Shield className="w-3.5 h-3.5 text-[#DFFF00]" />
          <span className="capitalize font-medium">{usuario.role}</span>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex flex-col divide-y divide-gray-50">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors active:bg-gray-100 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-base">{item.label}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Settings Toggles */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-6 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">Alertas por e-mail</p>
            <p className="text-sm text-gray-400 mt-0.5">Receber notificações</p>
          </div>
        </div>
        
        {/* Toggle switch */}
        <button 
          type="button" 
          onClick={() => setAlertasEnabled(!alertasEnabled)}
          className={`w-12 h-7 rounded-full p-1 transition-colors relative ${alertasEnabled ? 'bg-[#111827]' : 'bg-gray-200'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${alertasEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full bg-white rounded-[2rem] shadow-sm border border-gray-100 p-5 flex items-center justify-center gap-2 text-red-500 font-semibold hover:bg-red-50 transition-colors active:bg-red-100"
      >
        <LogOut className="w-5 h-5" />
        Sair da conta
      </button>

      {/* Modal de Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg z-10 overflow-hidden jp-sheet-up md:jp-fade-in relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Dados da Conta</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}
                {success && <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium">{success}</div>}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">E-mail de Login</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!isAdmin}
                    className={`w-full h-12 px-4 rounded-xl border border-gray-200 outline-none transition-all ${!isAdmin ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black'}`}
                  />
                  {isAdmin && (
                    <p className="text-xs text-gray-500 mt-1">
                      O login só mudará após a confirmação via e-mail.
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
