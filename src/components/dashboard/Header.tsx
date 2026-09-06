'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  
  if (pathname !== '/dashboard') {
    return (
      <header className="w-full flex items-center mb-8 md:hidden">
        <button type="button" className="text-gray-700">
          <Menu className="h-6 w-6" />
        </button>
      </header>
    )
  }

  return (
    <header className="w-full h-16 flex items-center justify-between mb-8 bg-white/50 backdrop-blur-md rounded-[2rem] px-4 md:px-6 shadow-sm border border-white/60">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button type="button" className="text-gray-700 md:hidden mr-2">
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-xl font-medium tracking-tight text-gray-900">Visão Geral</span>
      </div>
    </header>
  )
}
