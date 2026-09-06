import os

def update_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add currentCoverUrl state if not present
    if "const [currentCoverUrl, setCurrentCoverUrl] = useState" not in content:
        content = content.replace(
            "const [editingPostId, setEditingPostId] = useState<number | null>(null)",
            "const [editingPostId, setEditingPostId] = useState<number | null>(null)\n  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null)"
        )

    # 2. Improved handleEditPost function preserving line breaks, pre-filling date/time for all posts and setting current cover image
    old_handle_edit = """  function handleEditPost(post: any) {
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
  }"""

    new_handle_edit = """  function handleEditPost(post: any) {
    setEditingPostId(post.id)
    
    // Clean title HTML entities
    let title = post.title?.raw || post.title?.rendered || ''
    title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')

    // Preserve paragraph breaks and line breaks from content
    let contentStr = post.content?.raw || ''
    if (!contentStr && post.content?.rendered) {
      contentStr = post.content.rendered
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '\\n\\n')
        .replace(/<br\s*[\/]?>/gi, '\\n')
        .replace(/<[^>]+>/g, '')
        .trim()
    }

    // Pre-fill date & time for any post (published, scheduled or draft)
    let scheduledDate = ''
    if (post.date) {
      const d = new Date(post.date)
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => n < 10 ? '0' + n : n
        scheduledDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
    }

    // Featured image
    const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
    setCurrentCoverUrl(featuredImg)

    setWpNewPost({
      title,
      content: contentStr,
      status: post.status,
      scheduledDate,
      imageFile: null
    })
    setWpModalOpen(true)
  }"""

    content = content.replace(old_handle_edit, new_handle_edit)

    # 3. Update modal form to display current cover image preview when editing
    old_cover_input = """                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Imagem de Capa (Destacada)</label>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => setWpNewPost({
                            ...wpNewPost, 
                            imageFile: e.target.files?.[0] || null 
                          })}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                        />
                      </div>"""

    new_cover_input = """                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Imagem de Capa (Destacada)</label>
                        {currentCoverUrl && (
                          <div className="mb-2 flex items-center gap-2">
                            <img src={currentCoverUrl} alt="Capa Atual" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                            <span className="text-[11px] text-gray-500">Capa atual. Selecione um novo arquivo abaixo se desejar trocar.</span>
                          </div>
                        )}
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => setWpNewPost({
                            ...wpNewPost, 
                            imageFile: e.target.files?.[0] || null 
                          })}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                        />
                      </div>"""

    content = content.replace(old_cover_input, new_cover_input)

    # 4. Clear currentCoverUrl on cancel / reset
    content = content.replace("setEditingPostId(null)", "setEditingPostId(null); setCurrentCoverUrl(null)")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully updated {filepath}")

update_file(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx")
update_file(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx")
