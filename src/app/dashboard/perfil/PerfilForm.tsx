'use client'

import { useState, useRef } from 'react'
import { updateProfile } from './actions'
import { Camera, Loader2, User as UserIcon, Mail, Phone, Shield } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

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
  
  const [avatarUrl, setAvatarUrl] = useState(usuario.avatar_url)
  const [nome, setNome] = useState(usuario.nome)
  const [email, setEmail] = useState(usuario.email)
  const [telefone, setTelefone] = useState(usuario.telefone)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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
      setSuccess('Perfil atualizado com sucesso! Se você alterou o e-mail, verifique sua caixa de entrada.')
    }
    setIsPending(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      
      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center relative">
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
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{nome}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="capitalize">{usuario.role}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <UserIcon className="w-4 h-4 text-gray-400" />
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-gray-400" />
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" />
              E-mail de Login
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={usuario.role !== 'admin'}
              className={`w-full h-11 px-4 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${usuario.role !== 'admin' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50/50'}`}
            />
            {usuario.role === 'admin' ? (
              <p className="text-xs text-gray-500 mt-1">
                Caso altere seu e-mail, um link de confirmação será enviado. O login só mudará após a confirmação.
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                A alteração do e-mail de acesso não é permitida por motivos de segurança.
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="h-11 px-8 bg-[#DFFF00] text-black font-semibold rounded-xl hover:bg-[#cbe600] transition-colors flex items-center justify-center disabled:opacity-50 min-w-[140px]"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
