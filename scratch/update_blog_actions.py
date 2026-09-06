import re

def update_site_dashboard_client():
    filepath = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update imports
    if "import { CustomDateTimePicker }" not in content:
        content = content.replace(
            "import { Cloud, Search, Server",
            "import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker'\nimport { Cloud, Search, Server, Clock, Calendar, Image as ImageIcon"
        )
        content = content.replace("import { Activity, Search, ArrowUpRight, ShieldCheck, Pencil, FileText, Zap, MessageSquare, Globe, Sparkles } from 'lucide-react'",
                                  "import { Activity, Search, ArrowUpRight, ShieldCheck, Pencil, FileText, Zap, MessageSquare, Globe, Sparkles, Clock, Calendar, Image as ImageIcon, CheckCircle2 } from 'lucide-react'")

    # Remove rocket emoji in editing text
    content = content.replace("'✏️ Editar Postagem' : '🚀 Criar ou Agendar Nova Postagem'", "'Editar Postagem' : 'Criar ou Agendar Nova Postagem'")
    content = content.replace("✏️ Editar Postagem", "Editar Postagem")
    content = content.replace("🚀 Criar ou Agendar Nova Postagem", "Criar ou Agendar Nova Postagem")

    # Replace handleCreateWpPost logic
    old_handle = """  async function handleCreateWpPost(e: React.FormEvent) {
    e.preventDefault()
    if (!wp) return
    setCreatingWpPost(true)

    let mediaId: number | undefined = undefined

    if (wpNewPost.imageFile) {
      const fd = new FormData()
      fd.append('file', wpNewPost.imageFile)
      const imgRes = await uploadWpMedia(wp.site_url, wp.username, wp.app_password, fd)
      if (imgRes.error) {
        alert('Erro ao enviar imagem de capa: ' + imgRes.error)
        setCreatingWpPost(false)
        return
      }
      mediaId = imgRes.mediaId
    }

    const targetDate = wpNewPost.scheduledDate ? new Date(wpNewPost.scheduledDate) : null
    const isFutureDate = targetDate ? targetDate.getTime() > (Date.now() + 60000) : false

    let finalStatus = wpNewPost.status
    if (isFutureDate) {
      finalStatus = 'future'
    } else if (finalStatus === 'future') {
      finalStatus = 'publish'
    }

    const postPayload: any = {
      title: wpNewPost.title,
      content: wpNewPost.content,
      status: finalStatus
    }

    if (wpNewPost.scheduledDate) {
      const formattedLocalDate = wpNewPost.scheduledDate.length === 16 ? `${wpNewPost.scheduledDate}:00` : wpNewPost.scheduledDate
      postPayload.date = formattedLocalDate
      
      const gmtDate = new Date(wpNewPost.scheduledDate)
      if (!isNaN(gmtDate.getTime())) {
        postPayload.date_gmt = gmtDate.toISOString()
      }
    }

    if (mediaId) {
      postPayload.featured_media = mediaId
    }

    let res: any
    if (editingPostId) {
      res = await updateWpPost(wp.site_url, wp.username, wp.app_password, editingPostId, postPayload)
    } else {
      res = await createWpPost(wp.site_url, wp.username, wp.app_password, postPayload)
    }

    if (res.success) {
      alert(editingPostId ? 'Post atualizado com sucesso!' : wpNewPost.scheduledDate ? 'Post agendado com sucesso!' : 'Post publicado com sucesso!')
      setWpModalOpen(false)
      setEditingPostId(null); setCurrentCoverUrl(null)
      setWpNewPost({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })
      loadWpData()
    } else {
      alert('Erro ao salvar post: ' + res.error)
    }
    setCreatingWpPost(false)
  }"""

    new_handle = """  async function handleCreateWpPostWithAction(targetAction?: 'publish' | 'schedule' | 'draft') {
    if (!wp) return

    let action = targetAction
    if (!action) {
      if (wpNewPost.scheduledDate) {
        action = 'schedule'
      } else {
        action = 'draft'
      }
    }

    if (action === 'schedule' && !wpNewPost.scheduledDate) {
      alert('Por favor, selecione a data e hora no calendário para agendar a publicação.')
      return
    }

    setCreatingWpPost(true)

    let mediaId: number | undefined = undefined
    let uploadedMediaUrl: string | null = currentCoverUrl

    if (wpNewPost.imageFile) {
      const fd = new FormData()
      fd.append('file', wpNewPost.imageFile)
      const imgRes = await uploadWpMedia(wp.site_url, wp.username, wp.app_password, fd)
      if (imgRes.error) {
        alert('Erro ao enviar imagem de capa: ' + imgRes.error)
        setCreatingWpPost(false)
        return
      }
      mediaId = imgRes.mediaId
      if (imgRes.mediaUrl) uploadedMediaUrl = imgRes.mediaUrl
    }

    let finalStatus = 'draft'
    if (action === 'publish') {
      finalStatus = 'publish'
    } else if (action === 'schedule') {
      finalStatus = 'future'
    } else {
      finalStatus = 'draft'
    }

    // Embed Featured Image into post content body so it displays on single post page in WP
    let finalContent = wpNewPost.content || ''
    if (uploadedMediaUrl) {
      const trimmed = finalContent.trim().toLowerCase()
      if (!trimmed.startsWith('<img') && !trimmed.startsWith('<figure')) {
        const titleClean = (wpNewPost.title || '').replace(/"/g, '&quot;')
        finalContent = `<figure class="wp-block-image size-large"><img src="${uploadedMediaUrl}" alt="${titleClean}" class="wp-post-featured-header-img" style="width:100%; max-height:480px; object-fit:cover; border-radius:16px; margin-bottom:24px;" /></figure>\\n\\n` + finalContent
      }
    }

    const postPayload: any = {
      title: wpNewPost.title,
      content: finalContent,
      status: finalStatus
    }

    if (action === 'schedule' && wpNewPost.scheduledDate) {
      const formattedLocalDate = wpNewPost.scheduledDate.length === 16 ? `${wpNewPost.scheduledDate}:00` : wpNewPost.scheduledDate
      postPayload.date = formattedLocalDate
      
      const gmtDate = new Date(wpNewPost.scheduledDate)
      if (!isNaN(gmtDate.getTime())) {
        postPayload.date_gmt = gmtDate.toISOString()
      }
    }

    if (mediaId) {
      postPayload.featured_media = mediaId
    }

    let res: any
    if (editingPostId) {
      res = await updateWpPost(wp.site_url, wp.username, wp.app_password, editingPostId, postPayload)
    } else {
      res = await createWpPost(wp.site_url, wp.username, wp.app_password, postPayload)
    }

    if (res.success) {
      const msg = editingPostId ? 'Post atualizado com sucesso!' : action === 'publish' ? 'Post publicado com sucesso!' : action === 'schedule' ? 'Post agendado com sucesso!' : 'Post salvo como rascunho com sucesso!'
      alert(msg)
      setWpModalOpen(false)
      setEditingPostId(null); setCurrentCoverUrl(null)
      setWpNewPost({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })
      loadWpData()
    } else {
      alert('Erro ao salvar post: ' + res.error)
    }
    setCreatingWpPost(false)
  }

  async function handleCreateWpPost(e: React.FormEvent) {
    e.preventDefault()
    handleCreateWpPostWithAction()
  }"""

    if "async function handleCreateWpPost(" in content:
        content = content.replace(old_handle, new_handle)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("SiteDashboardClient.tsx functions updated successfully.")

update_site_dashboard_client()
