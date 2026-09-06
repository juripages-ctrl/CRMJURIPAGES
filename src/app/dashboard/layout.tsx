import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SidebarClient } from '@/components/dashboard/SidebarClient'
import { Header } from '@/components/dashboard/Header'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Protect all /dashboard routes
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user profile for initials and role
  const { data: profile } = await supabase
    .from('usuarios')
    .select('nome, role, avatar_url')
    .eq('id', user.id)
    .single()

  const initial = profile?.nome ? profile.nome.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()
  const isAdmin = profile?.role === 'admin'
  const avatarUrl = profile?.avatar_url

  return (
    <div className="bg-[#F3F4F6] text-gray-800 antialiased selection:bg-[#DFFF00] selection:text-black min-h-screen flex overflow-hidden">
      {/* Sidebar for Desktop based on role */}
      {isAdmin ? <Sidebar userInitial={initial} avatarUrl={avatarUrl} /> : <SidebarClient userInitial={initial} avatarUrl={avatarUrl} />}

      {/* Main content area */}
      <main className="flex-1 md:ml-20 p-4 md:p-6 lg:p-8 overflow-y-auto h-screen relative">
        <div className="fixed top-6 right-6 md:right-8 z-50">
          <NotificationBell />
        </div>

        <Header />
        
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
