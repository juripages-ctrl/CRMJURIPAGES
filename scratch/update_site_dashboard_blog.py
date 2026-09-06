import os
import re

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "fetchWpHistory, fetchWpWordfenceData",
    "fetchWpHistory, fetchWpWordfenceData, uploadWpMedia"
)

# 2. Update TabTypes definition
content = content.replace(
    "export type TabTypes = 'geral' | 'historico' | 'seo' | 'wp' | 'rede' | 'aquisicao' | 'ux' | 'rastreamento' | 'integracoes'",
    "export type TabTypes = 'geral' | 'historico' | 'seo' | 'wp' | 'blog' | 'speed' | 'integracoes'"
)

# 3. Add Blog tab button in UI after WordPress button
old_wp_button = """        <button 
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'wp' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('wp')}
        >
          WordPress
        </button>"""

new_wp_button = """        <button 
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'wp' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('wp')}
        >
          WordPress (Sistema & Segurança)
        </button>
        <button 
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'blog' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('blog')}
        >
          Blog (Postagens)
        </button>"""

content = content.replace(old_wp_button, new_wp_button)

# 4. Update tab watcher in useEffect
content = content.replace(
    "if (activeTab === 'wp' && wp) {",
    "if (['wp', 'blog'].includes(activeTab) && wp) {"
)

# 5. Update wpNewPost state
old_state = "const [wpNewPost, setWpNewPost] = useState({ title: '', content: '', status: 'draft' })"
new_state = "const [wpNewPost, setWpNewPost] = useState<{ title: string; content: string; status: string; scheduledDate: string; imageFile: File | null }>({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null })"
content = content.replace(old_state, new_state)

# 6. Update handleCreateWpPost function
old_create_fn = """  async function handleCreateWpPost(e: React.FormEvent) {
    e.preventDefault()
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

new_create_fn = """  async function handleCreateWpPost(e: React.FormEvent) {
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

content = content.replace(old_create_fn, new_create_fn)

# 7. Remove Gestão de Blog from activeTab === 'wp' block and create activeTab === 'blog' block
blog_section_pattern = r'\{\/\* Gestão de Blog \*\}[\s\S]*?(?=\s*<\/>\s*\}\s*<\/div>\s*\)\s*:\s*\()'

# Let's locate where activeTab === 'wp' ends and construct the clean replacement
new_blog_tab_content = """      {/* Tab: Blog */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {wp ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-purple-600" /> Postagens do Blog WordPress
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Crie, agende publicações e envie imagens de capa diretamente para o site do cliente.</p>
                </div>
                <Button onClick={() => setWpModalOpen(!wpModalOpen)} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {wpModalOpen ? 'Cancelar' : '+ Nova Postagem'}
                </Button>
              </div>

              {wpModalOpen && (
                <div className="mb-8 p-6 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base">Criar ou Agendar Postagem</h4>
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
                        {creatingWpPost ? 'Publicando...' : wpNewPost.scheduledDate ? 'Agendar Postagem' : 'Publicar Postagem'}
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
                          
                          {post.link && (
                            <a 
                              href={post.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="mt-4 text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                            >
                              Ver post no site <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
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
              <p className="text-sm text-gray-600 mb-6">Para criar e agendar postagens no blog do seu cliente, conecte a integração do WordPress nas configurações.</p>
              <Button onClick={() => setActiveTab('integracoes')}>Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}"""

# Replace Gestão de Blog block in activeTab === 'wp' with nothing
gestao_blog_start = "                  {/* Gestão de Blog */}"
gestao_blog_end = "                  </div>\n                </>\n              )}\n            </div>\n          ) :"

if gestao_blog_start in content:
    idx_start = content.find(gestao_blog_start)
    idx_end = content.find(gestao_blog_end, idx_start)
    if idx_start != -1 and idx_end != -1:
        content = content[:idx_start] + content[idx_end:]

# Now insert activeTab === 'blog' block before SPEED INSIGHTS
speed_tab_marker = "      {/* SPEED INSIGHTS */}"
if speed_tab_marker in content:
    content = content.replace(speed_tab_marker, new_blog_tab_content + "\n\n" + speed_tab_marker)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SiteDashboardClient.tsx with separate Blog tab, scheduling & cover image support!")
