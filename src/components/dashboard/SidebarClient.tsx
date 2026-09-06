'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Globe, LogOut, CreditCard, MessageSquare } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function SidebarClient({ userInitial, avatarUrl }: { userInitial?: string, avatarUrl?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = [
    { name: 'Visão Geral', href: '/dashboard', icon: LayoutGrid },
    { name: 'Meus Sites', href: '/dashboard/meus-sites', icon: Globe },
    { name: 'Anotações do time', href: '/dashboard/anotacoes', icon: MessageSquare },
    { name: 'Financeiro', href: '/dashboard/financeiro', icon: CreditCard },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-20 hidden md:flex flex-col items-center py-8 bg-white/50 backdrop-blur-md border-r border-white/40 h-screen fixed left-0 top-0 z-50">
        
        {/* Logo Icon */}
        <div className="mb-10 w-full flex justify-center">
          <Image src="/logo.webp" alt="Logo" width={44} height={44} className="object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
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
                    <item.icon className="w-5 h-5" />
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
          <button 
            onClick={handleLogout}
            className="w-10 h-10 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center rounded-full hover:bg-white"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
            Sair
          </span>
        </div>
          
        <div className="relative group w-full flex justify-center">
          <Link href="/dashboard/perfil" className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-sm bg-primary/20 flex items-center justify-center text-primary font-bold hover:ring-2 hover:ring-primary transition-all">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              userInitial || 'C'
            )}
          </Link>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md">
            Meu Perfil
          </span>
        </div>
        </div>
      </aside>

      {/* Mobile Navigation (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 px-6 py-3 flex justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors
                ${isActive ? 'text-black' : 'text-gray-400'}
              `}
            >
              <div className={`p-2 rounded-xl ${isActive ? 'bg-[#DFFF00]' : 'bg-transparent'}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
