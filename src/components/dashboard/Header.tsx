'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  const pathname = usePathname()
  
  if (pathname !== '/dashboard') {
    return (
      <header className="w-full flex items-center mb-8 md:hidden">
        <Link href="/dashboard" className="mr-3">
          <Image src="/logo.webp" alt="Logo" width={32} height={32} className="object-contain rounded-[10px]" />
        </Link>
      </header>
    )
  }

  return (
    <header className="w-full h-16 flex items-center justify-between mb-8 bg-white/50 backdrop-blur-md rounded-[2rem] px-4 md:px-6 shadow-sm border border-white/60">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Link href="/dashboard" className="md:hidden mr-1">
          <Image src="/logo.webp" alt="Logo" width={32} height={32} className="object-contain rounded-[10px]" />
        </Link>
        <span className="text-xl font-medium tracking-tight text-gray-900">Visão Geral</span>
      </div>
    </header>
  )
}
