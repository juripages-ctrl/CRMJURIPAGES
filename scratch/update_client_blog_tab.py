import os

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add uploadWpMedia, updateWpPost to imports
content = content.replace(
    "fetchWpPosts, createWpPost",
    "fetchWpPosts, createWpPost, uploadWpMedia, updateWpPost"
)

# Add icons: Pencil, FileText
content = content.replace(
    "ArrowUpRight, ShieldCheck",
    "ArrowUpRight, ShieldCheck, Pencil, FileText"
)

# Update Tab types
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'geral' | 'seo' | 'wp' | 'ux' | 'historico' | 'speed'>('geral')",
    "const [activeTab, setActiveTab] = useState<'geral' | 'seo' | 'wp' | 'blog' | 'ux' | 'historico' | 'speed'>('geral')"
)

# Update tab buttons in UI header
old_tabs_wp = """        <button
          onClick={() => setActiveTab('wp')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'wp' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          WordPress
          {activeTab === 'wp' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>"""

new_tabs_wp = """        <button
          onClick={() => setActiveTab('wp')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'wp' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          WordPress
          {activeTab === 'wp' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'blog' ? 'text-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Blog (Postagens)
          {activeTab === 'blog' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>"""

content = content.replace(old_tabs_wp, new_tabs_wp)

# Update useEffect watcher
content = content.replace(
    "if (site && activeTab === 'wp' && hasWp) {",
    "if (site && ['wp', 'blog'].includes(activeTab) && hasWp) {"
)

# Update wpNewPost state and add editingPostId
old_wp_states = """  const [wpPosts, setWpPosts] = useState<any[]>([])
  const [loadingWp, setLoadingWp] = useState(false)
  const [wpModalOpen, setWpModalOpen] = useState(false)
  const [wpNewPost, setWpNewPost] = useState({ title: '', content: '', status: 'draft' })
  const [creatingWpPost, setCreatingWpPost] = useState(false)"""

new_wp_states = """  const [wpPosts, setWpPosts] = useState<any[]>([])
  const [loadingWp, setLoadingWp] = useState(false)
  const [wpModalOpen, setWpModalOpen] = useState(false)
  const [wpNewPost, setWpNewPost] = useState<{ title: string; content: string; status: string; scheduledDate: string; imageFile: File | null }>({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })
  const [creatingWpPost, setCreatingWpPost] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)"""

content = content.replace(old_wp_states, new_wp_states)

# Update handleCreateWpPost and add handleEditPost
old_handle_create = """  async function handleCreateWpPost(e: React.FormEvent) {
    e.preventDefault()
    const wp = site?.integracoes_wordpress?.[0]
    if (!wp) return
    setCreatingWpPost(true)
    const res = await createWpPost(wp.site_url, wp.username, wp.app_password, wpNewPost)
    if (res.success) {
      alert('Post criado com sucesso!')
      setWpModalOpen(false)
      setWpNewPost({ title: '', content: '', status: 'draft' })
      loadWpData() // reload posts
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
    const wp = site?.integracoes_wordpress?.[0]
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

# Replace old WP tab in Client view with new WP + Blog tabs
old_wp_tab_ui = """      {/* Tab: WordPress */}
      {activeTab === 'wp' && (
        <div className="space-y-6">
          {hasWp ? (
            <div className="space-y-6">
              {loadingWp ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Activity className="w-8 h-8 animate-spin mb-4" />
                  <p>Carregando posts do blog...</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-500" /> Postagens do Blog
                    </h3>
                    <Button onClick={() => setWpModalOpen(!wpModalOpen)}>
                      {wpModalOpen ? 'Cancelar' : 'Nova Postagem'}
                    </Button>
                  </div>

                  {wpModalOpen && (
                    <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                      <h4 className="font-medium mb-4">Criar Novo Post</h4>
                      <form onSubmit={handleCreateWpPost} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                          <Input 
                            required 
                            value={wpNewPost.title}
                            onChange={(e) => setWpNewPost({...wpNewPost, title: e.target.value})}
                            placeholder="Título da postagem" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                          <textarea 
                            required
                            value={wpNewPost.content}
                            onChange={(e) => setWpNewPost({...wpNewPost, content: e.target.value})}
                            className="w-full min-h-[150px] p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Escreva o conteúdo aqui..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select 
                            value={wpNewPost.status}
                            onChange={(e) => setWpNewPost({...wpNewPost, status: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="draft">Rascunho</option>
                            <option value="publish">Publicado</option>
                          </select>
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" disabled={creatingWpPost}>
                            {creatingWpPost ? 'Salvando...' : 'Salvar Post'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {wpPosts && wpPosts.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {wpPosts.map((post: any) => (
                        <div key={post.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors bg-gray-50">
                          <h4 className="font-semibold text-gray-900 mb-2 truncate">{post.title.rendered || '(Sem título)'}</h4>
                          <div className="flex justify-between items-center text-xs">
                            <Badge variant={post.status === 'publish' ? 'default' : 'secondary'} className="capitalize">
                              {post.status === 'publish' ? 'Publicado' : 'Rascunho'}
                            </Badge>
                            <span className="text-gray-500">{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl text-gray-500">
                      Nenhum post encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Globe className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">WordPress não conectado</h3>
              <p className="text-sm text-gray-600 mb-6">Entre em contato com nossa equipe para habilitar a gestão do Blog neste painel.</p>
            </div>
          )}
        </div>
      )}"""

new_wp_tab_ui = """      {/* Tab: WordPress */}
      {activeTab === 'wp' && (
        <div className="space-y-6">
          {hasWp ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Integração WordPress</h3>
                  <p className="text-xs text-gray-500">O sistema WordPress está conectado e ativo para este projeto.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Acesse a aba <strong className="text-purple-700 font-semibold">Blog (Postagens)</strong> acima para visualizar, criar, agendar ou editar seus artigos.</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Globe className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">WordPress não conectado</h3>
              <p className="text-sm text-gray-600 mb-6">Entre em contato com nossa equipe para habilitar a gestão do Blog neste painel.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Blog */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {hasWp ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-purple-600" /> Postagens do Blog WordPress
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Crie, agende publicações, edite artigos existentes e envie imagens de capa.</p>
                </div>
                <Button onClick={() => { if (wpModalOpen) setEditingPostId(null); setWpModalOpen(!wpModalOpen); }} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {wpModalOpen ? 'Cancelar' : '+ Nova Postagem'}
                </Button>
              </div>

              {wpModalOpen && (
                <div className="mb-8 p-6 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base">{editingPostId ? 'Editar Postagem' : 'Criar ou Agendar Postagem'}</h4>
                  <form onSubmit={handleCreateWpPost} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Título da Postagem</label>
                      <Input 
                        required 
                        value={wpNewPost.title}
                        onChange={(e) => setWpNewPost({...wpNewPost, title: e.target.value})}
                        placeholder="Ex: 5 dicas essenciais de direito imobiliário..." 
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Conteúdo</label>
                      <textarea 
                        required
                        value={wpNewPost.content}
                        onChange={(e) => setWpNewPost({...wpNewPost, content: e.target.value})}
                        className="w-full min-h-[180px] p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-sm"
                        placeholder="Escreva o artigo da postagem aqui..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Status Inicial</label>
                        <select 
                          value={wpNewPost.status}
                          onChange={(e) => setWpNewPost({...wpNewPost, status: e.target.value})}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-sm"
                        >
                          <option value="publish">Publicado Imediatamente</option>
                          <option value="draft">Rascunho</option>
                          <option value="future">Agendado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Programar Data/Hora (Opcional)</label>
                        <input 
                          type="datetime-local"
                          value={wpNewPost.scheduledDate}
                          onChange={(e) => setWpNewPost({
                            ...wpNewPost, 
                            scheduledDate: e.target.value,
                            status: e.target.value ? 'future' : wpNewPost.status
                          })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-sm"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Defina a data futura para agendar a publicação.</p>
                      </div>

                      <div>
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
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={creatingWpPost} className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                        {creatingWpPost ? 'Salvando...' : editingPostId ? 'Salvar Alterações' : wpNewPost.scheduledDate ? 'Agendar Postagem' : 'Publicar Postagem'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {loadingWp ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Activity className="w-6 h-6 animate-spin mr-2" /> Carregando postagens...
                </div>
              ) : wpPosts && wpPosts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {wpPosts.map((post: any) => {
                    const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
                    const isScheduled = post.status === 'future' || new Date(post.date) > new Date()
                    
                    return (
                      <div key={post.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                        {featuredImg ? (
                          <div className="h-44 w-full overflow-hidden bg-gray-100">
                            <img src={featuredImg} alt={post.title.rendered} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-28 w-full bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center text-purple-300">
                            <Globe className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <Badge 
                                variant={post.status === 'publish' ? 'default' : isScheduled ? 'secondary' : 'outline'} 
                                className={
                                  post.status === 'publish' 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' 
                                    : isScheduled
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-none'
                                    : 'bg-gray-100 text-gray-700'
                                }
                              >
                                {post.status === 'publish' ? 'Publicado' : isScheduled ? 'Agendado' : 'Rascunho'}
                              </Badge>
                              <span className="text-xs text-gray-400 font-medium">
                                {new Date(post.date).toLocaleDateString('pt-BR')} às {new Date(post.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title.rendered || '(Sem título)' }} />
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
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
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl text-gray-500">
                  Nenhum post encontrado no blog WordPress.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Globe className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">WordPress não conectado</h3>
              <p className="text-sm text-gray-600 mb-6">Entre em contato com nossa equipe para habilitar a gestão do Blog neste painel.</p>
            </div>
          )}
        </div>
      )}"""

content = content.replace(old_wp_tab_ui, new_wp_tab_ui)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SiteReportTabs.tsx with Blog tab and editing capabilities for Client view!")
