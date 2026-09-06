'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Users, Globe, Settings, Sparkles, Bell, LogOut, LayoutGrid, CreditCard, Shield } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Rede de Sites', href: '/dashboard/sites', icon: Globe },
  { name: 'Planos e Pacotes', href: '/dashboard/planos', icon: CreditCard },
  { name: 'Equipe e Acessos', href: '/dashboard/configuracoes/equipe', icon: Shield },
  { name: 'Master APIs', href: '/dashboard/configuracoes', icon: Settings },
]

export function Sidebar({ userInitial, avatarUrl }: { userInitial?: string, avatarUrl?: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-20 hidden md:flex flex-col items-center py-8 bg-white/50 backdrop-blur-md border-r border-white/40 h-screen fixed left-0 top-0 z-50">
      {/* Logo Icon */}
      <div className="mb-10 w-full flex justify-center">
        <Image src="/logo.webp" alt="Logo" width={44} height={44} className="object-contain" />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-4 w-full items-center">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
              <div key={item.name} className="relative group w-full flex justify-center">
                <Link href={item.href}>
                  <button 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-black text-white shadow-lg shadow-black/20' 
                        : 'text-gray-400 hover:bg-white hover:text-black'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </Link>
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
                  {item.name}
                </span>
              </div>
            )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-6 items-center mt-auto">
        
        <div className="relative group w-full flex justify-center">
          <form action="/auth/signout" method="post" className="w-full flex justify-center">
            <button type="submit" className="w-10 h-10 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center rounded-full hover:bg-white">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
            Sair
          </span>
        </div>

        <div className="relative group w-full flex justify-center">
          <Link href="/dashboard/perfil" className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-sm bg-primary/20 flex items-center justify-center text-primary font-bold hover:ring-2 hover:ring-primary transition-all">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              userInitial || 'U'
            )}
          </Link>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
            Meu Perfil
          </span>
        </div>
      </div>
    </aside>
  )
}
