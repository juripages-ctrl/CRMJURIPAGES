'use client'

import { useState } from 'react'

interface SiteAvatarProps {
  nome: string
  dominio: string
  size?: number
}

export function SiteAvatar({ nome, dominio, size = 44 }: SiteAvatarProps) {
  const [error, setError] = useState(false)
  const initial = nome?.charAt(0)?.toUpperCase() || 'S'
  // Usar o serviço de favicon do Google
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${dominio}&sz=128`

  return (
    <div 
      className="rounded-full bg-[#F3F4F6] flex items-center justify-center text-[15px] font-bold text-[#111827] shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {!error ? (
        <img 
          src={faviconUrl} 
          alt={nome} 
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        initial
      )}
    </div>
  )
}
