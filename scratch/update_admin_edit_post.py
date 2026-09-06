import os

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add updateWpPost to imports
content = content.replace(
    "fetchWpHistory, fetchWpWordfenceData, uploadWpMedia",
    "fetchWpHistory, fetchWpWordfenceData, uploadWpMedia, updateWpPost"
)

# Add import for Pencil if missing
if "Pencil" not in content:
    content = content.replace("ArrowUpRight", "ArrowUpRight, Pencil")

# Add editingPostId state
old_wp_state = "const [creatingWpPost, setCreatingWpPost] = useState(false)"
new_wp_state = """const [creatingWpPost, setCreatingWpPost] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)"""

content = content.replace(old_wp_state, new_wp_state)

# Add handleEditPost function and update handleCreateWpPost
old_handle_create = """  async function handleCreateWpPost(e: React.FormEvent) {
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
  }"""

new_handle_create = """  function handleEditPost(post: any) {
    setEditingPostId(post.id)
    const title = post.title?.raw || post.title?.rendered || ''
    const content = post.content?.raw || post.content?.rendered?.replace(/<[^>]+>/g, '') || ''
    
    let scheduledDate = ''
    if (post.status === 'future' || new Date(post.date) > new Date()) {
      const d = new Date(post.date)
      const pad = (n: number) => n < 10 ? '0' + n : n
      scheduledDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    setWpNewPost({
      title,
      content,
      status: post.status,
      scheduledDate,
      imageFile: null
    })
    setWpModalOpen(true)
  }

  async function handleCreateWpPost(e: React.FormEvent) {
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

    let res: any
    if (editingPostId) {
      res = await updateWpPost(wp.site_url, wp.username, wp.app_password, editingPostId, postPayload)
    } else {
      res = await createWpPost(wp.site_url, wp.username, wp.app_password, postPayload)
    }

    if (res.success) {
      alert(editingPostId ? 'Post atualizado com sucesso!' : wpNewPost.scheduledDate ? 'Post agendado com sucesso!' : 'Post publicado com sucesso!')
      setWpModalOpen(false)
      setEditingPostId(null)
      setWpNewPost({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })
      loadWpData()
    } else {
      alert('Erro ao salvar post: ' + res.error)
    }
    setCreatingWpPost(false)
  }"""

content = content.replace(old_handle_create, new_handle_create)

# Update modal title & cancel button to clear editingPostId
content = content.replace(
  "setWpModalOpen(!wpModalOpen)",
  "() => { if (wpModalOpen) setEditingPostId(null); setWpModalOpen(!wpModalOpen) }"
)

content = content.replace(
  '<h4 className="font-semibold text-gray-900 text-base">Criar ou Agendar Postagem</h4>',
  '<h4 className="font-semibold text-gray-900 text-base">{editingPostId ? "Editar Postagem" : "Criar ou Agendar Postagem"}</h4>'
)

content = content.replace(
  "{creatingWpPost ? 'Publicando...' : wpNewPost.scheduledDate ? 'Agendar Postagem' : 'Publicar Postagem'}",
  "{creatingWpPost ? 'Salvando...' : editingPostId ? 'Salvar Alterações' : wpNewPost.scheduledDate ? 'Agendar Postagem' : 'Publicar Postagem'}"
)

# Update post action buttons to include Editar button
old_post_card_link = """                          {post.link && (
                            <a 
                              href={post.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="mt-4 text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                            >
                              Ver post no site <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}"""

new_post_card_link = """                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-xs font-semibold text-gray-700 hover:text-purple-700 flex items-center gap-1 bg-gray-100 hover:bg-purple-50 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3 h-3" /> Editar
                            </button>
                            {post.link && (
                              <a 
                                href={post.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                              >
                                Ver no site <ArrowUpRight className="w-3 h-3" />
                              </a>
                            )}
                          </div>"""

content = content.replace(old_post_card_link, new_post_card_link)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SiteDashboardClient.tsx with post editing capabilities!")
