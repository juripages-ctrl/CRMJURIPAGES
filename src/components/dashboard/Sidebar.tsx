'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Users, Globe, Settings, Sparkles, Bell, LogOut, LayoutGrid, CreditCard, Shield, User, Menu } from 'lucide-react'
import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'

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
  const [sheetOpen, setSheetOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/dashboard/configuracoes' && pathname === '/dashboard/configuracoes/equipe') return false
    return pathname.startsWith(href)
  }

  // Bottom bar: 2 left, center button, 2 right
  const bottomNavLeft = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  ]
  const bottomNavRight = [
    { name: 'Rede', href: '/dashboard/sites', icon: Globe },
    { name: 'Perfil', href: '/dashboard/perfil', icon: User },
  ]

  // Sheet menu items
  const sheetItems = [
    { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
    { name: 'Rede de Sites', href: '/dashboard/sites', icon: Globe },
    { name: 'Planos e Pacotes', href: '/dashboard/planos', icon: CreditCard },
    { name: 'Equipe e Acessos', href: '/dashboard/configuracoes/equipe', icon: Shield },
    { name: 'Master APIs', href: '/dashboard/configuracoes', icon: Settings },
    { name: 'Notificações', href: '/dashboard/perfil', icon: Bell },
  ]

  return (
    <>
      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside className="w-20 hidden md:flex flex-col items-center py-8 bg-white/50 backdrop-blur-md border-r border-white/40 h-screen fixed left-0 top-0 z-50">
        {/* Logo Icon */}
        <div className="mb-10 w-full flex justify-center">
          <Image src="/logo.webp" alt="Logo" width={44} height={44} className="object-contain" />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-4 w-full items-center">
          {navigation.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            
            return (
                <div key={item.name} className="relative group w-full flex justify-center">
                  <Link href={item.href}>
                    <button 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        active 
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

      {/* ========== MOBILE BOTTOM BAR ========== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[84px] bg-white/92 backdrop-blur-xl border-t border-gray-100 z-50 shadow-[0_-6px_24px_-14px_rgba(17,24,39,0.28)] flex items-start pt-2.5 px-2 pb-safe">
        
        {/* Left nav items */}
        {bottomNavLeft.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 h-[58px] flex flex-col items-center gap-[3px] p-0"
            >
              <div className={`w-11 h-[30px] rounded-xl flex items-center justify-center ${active ? 'bg-[#DFFF00]' : 'bg-transparent'}`}>
                <item.icon className={`w-5 h-5 ${active ? 'text-[#111827]' : 'text-gray-400'}`} />
              </div>
              <span className={`text-[10px] font-semibold tracking-tight ${active ? 'text-[#111827]' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}

        {/* Center Menu Button */}
        <div className="flex-1 flex justify-center">
          <button 
            onClick={() => setSheetOpen(true)}
            className="w-14 h-14 -mt-[18px] border-4 border-white rounded-full bg-[#111827] flex items-center justify-center shadow-[0_14px_28px_-12px_rgba(17,24,39,0.8)] active:scale-95 transition-transform"
          >
            <Menu className="w-6 h-6 text-[#DFFF00]" />
          </button>
        </div>

        {/* Right nav items */}
        {bottomNavRight.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 h-[58px] flex flex-col items-center gap-[3px] p-0"
            >
              <div className={`w-11 h-[30px] rounded-xl flex items-center justify-center ${active ? 'bg-[#DFFF00]' : 'bg-transparent'}`}>
                <item.icon className={`w-5 h-5 ${active ? 'text-[#111827]' : 'text-gray-400'}`} />
              </div>
              <span className={`text-[10px] font-semibold tracking-tight ${active ? 'text-[#111827]' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ========== MENU BOTTOM SHEET ========== */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <p className="text-lg font-medium tracking-tight text-[#111827] mb-1">Ir para</p>
        <p className="text-[13px] text-gray-400 mb-5">Todas as áreas da agência</p>
        
        <div className="grid grid-cols-2 gap-2.5">
          {sheetItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSheetOpen(false)}
                className={`flex items-center gap-3 h-16 px-3.5 rounded-[22px] border transition-transform active:scale-[0.98] ${
                  active 
                    ? 'bg-[#111827] border-[#111827] text-white' 
                    : 'bg-[#F9FAFB] border-[#EFEFEF] text-[#111827]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? 'bg-[#DFFF00]/20' : 'bg-white'
                }`}>
                  <item.icon className={`w-[18px] h-[18px] ${active ? 'text-[#DFFF00]' : 'text-gray-500'}`} />
                </div>
                <span className="text-[13px] font-semibold leading-tight">{item.name}</span>
              </Link>
            )
          })}
        </div>

        <button 
          onClick={() => setSheetOpen(false)}
          className="mt-4 w-full h-12 rounded-full bg-[#F3F4F6] text-gray-500 font-semibold text-[14.5px]"
        >
          Fechar
        </button>
      </BottomSheet>
    </>
  )
}
