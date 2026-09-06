import os
import re

# 1. Fix SiteReportTabs.tsx
report_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"
with open(report_path, "r", encoding="utf-8") as f:
    report_content = f.read()

# Add handleCreateWpPost function if not present
if "async function handleCreateWpPost(" not in report_content:
    target = "  async function handleCreateWpPostWithAction("
    replacement = """  async function handleCreateWpPost(e?: React.FormEvent) {
    if (e) e.preventDefault()
    await handleCreateWpPostWithAction()
  }

  async function handleCreateWpPostWithAction("""
    report_content = report_content.replace(target, replacement)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
    print("Fixed SiteReportTabs.tsx handleCreateWpPost")

# 2. Fix SiteDashboardClient.tsx
client_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx"
with open(client_path, "r", encoding="utf-8") as f:
    client_content = f.read()

wp_functions = """
  async function loadWpData() {
    if (!wp) return
    setLoadingWp(true)
    const postsRes = await fetchWpPosts(wp.site_url, wp.username, wp.app_password)
    if (postsRes.success) setWpPosts(postsRes.data)
    setLoadingWp(false)
  }

  async function handleCreateWpPost(e?: React.FormEvent) {
    if (e) e.preventDefault()
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

    const postPayload: any = {
      title: wpNewPost.title,
      content: wpNewPost.content,
      status: wpNewPost.scheduledDate ? 'future' : wpNewPost.status
    }

    if (wpNewPost.scheduledDate) {
      const d = new Date(wpNewPost.scheduledDate)
      postPayload.date = d.toISOString()
    }

    if (mediaId) {
      postPayload.featured_media = mediaId
    }

    const res = await createWpPost(wp.site_url, wp.username, wp.app_password, postPayload)
    if (res.success) {
      alert(wpNewPost.scheduledDate ? 'Post agendado com sucesso!' : 'Post salvo com sucesso!')
      setWpModalOpen(false)
      setWpNewPost({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })
      loadWpData()
    } else {
      alert('Erro ao criar post: ' + res.error)
    }
    setCreatingWpPost(false)
  }
"""

if "async function loadWpData(" not in client_content:
    target = "  async function handleHostingSubmit("
    client_content = client_content.replace(target, wp_functions + "\n" + target)

    # Ensure useEffect calls loadWpData
    old_effect = "if (['wp', 'blog'].includes(activeTab) && wp) {"
    new_effect = "if (['wp', 'blog'].includes(activeTab) && wp) {\n      loadWpData()"
    client_content = client_content.replace(old_effect, new_effect)

    with open(client_path, "w", encoding="utf-8") as f:
        f.write(client_content)
    print("Fixed SiteDashboardClient.tsx WP functions")
