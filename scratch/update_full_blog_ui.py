import os
import re

def process_file(filepath):
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    if "import { CustomDateTimePicker }" not in content:
        content = content.replace("import { Button }", "import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker'\nimport { Button }")

    # Ensure lucide icons are present
    needed_icons = ['Clock', 'Calendar', 'Image as ImageIcon', 'CheckCircle2']
    for icon in needed_icons:
        icon_name = icon.split(' as ')[0]
        if icon_name not in content:
            content = content.replace("import { Activity,", f"import {{ {icon}, Activity,")

    # 2. Remove emojis
    content = content.replace("'✏️ Editar Postagem' : '🚀 Criar ou Agendar Nova Postagem'", "'Editar Postagem' : 'Criar ou Agendar Nova Postagem'")
    content = content.replace("✏️ Editar Postagem", "Editar Postagem")
    content = content.replace("🚀 Criar ou Agendar Nova Postagem", "Criar ou Agendar Nova Postagem")

    # 3. Update handleCreateWpPost logic
    old_handle_pattern = r"async function handleCreateWpPost\(e: React\.FormEvent\)\s*\{[\s\S]*?setCreatingWpPost\(false\)\s*\}"

    new_handle_code = """async function handleCreateWpPostWithAction(targetAction?: 'publish' | 'schedule' | 'draft') {
    const wp = (typeof site !== 'undefined' && site?.integracoes_wordpress?.[0]) || (typeof wp !== 'undefined' ? wp : null)
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

    content = re.sub(old_handle_pattern, new_handle_code, content, count=1)

    # 4. Replace Form Modal JSX
    form_pattern = r"\{/\* Form Modal / Card \*/\}[\s\S]*?\{/\* Grid of Posts \*/\}"

    new_form_jsx = """{/* Form Modal / Card */}
              {wpModalOpen && (
                <div className="bg-white border border-gray-200/90 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {editingPostId ? <Pencil className="w-5 h-5 text-gray-700" /> : <Sparkles className="w-5 h-5 text-black" />}
                        {editingPostId ? 'Editar Postagem' : 'Criar ou Agendar Nova Postagem'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Preencha os campos abaixo para atualizar ou publicar no seu blog WordPress.</p>
                    </div>
                    {editingPostId && (
                      <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                        Editando ID #{editingPostId}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleCreateWpPost} className="space-y-6">
                    {/* Campo Título */}
                    <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                      <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Título do Artigo</span>
                      </label>
                      <Input 
                        required 
                        value={wpNewPost.title}
                        onChange={(e) => setWpNewPost({...wpNewPost, title: e.target.value})}
                        placeholder="Ex: Como proteger seu patrimônio com planejamento imobiliário..." 
                        className="bg-white border-gray-300 focus:border-black focus:ring-1 focus:ring-black text-base py-3.5 px-4 rounded-xl shadow-xs font-medium text-gray-900"
                      />
                    </div>

                    {/* Campo Conteúdo */}
                    <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                      <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Conteúdo do Artigo</span>
                      </label>
                      <textarea 
                        required
                        value={wpNewPost.content}
                        onChange={(e) => setWpNewPost({...wpNewPost, content: e.target.value})}
                        className="w-full min-h-[240px] p-4 rounded-xl border border-gray-300 bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm leading-relaxed text-gray-900 shadow-xs"
                        placeholder="Escreva o texto do artigo aqui..."
                      />
                    </div>

                    {/* Inputs Secundários: Data e Hora & Imagem de Capa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Data e Hora com Calendário Personalizado */}
                      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>Data e Hora de Publicação (Agendamento)</span>
                        </label>
                        <CustomDateTimePicker 
                          value={wpNewPost.scheduledDate}
                          onChange={(val) => setWpNewPost({ ...wpNewPost, scheduledDate: val })}
                          placeholder="Clique para agendar data e hora..."
                        />
                        <p className="text-[11px] text-gray-400">Deixe em branco se desejar publicar imediatamente ou salvar como rascunho.</p>
                      </div>

                      {/* Imagem de Capa */}
                      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                          <span>Imagem de Capa (Destacada)</span>
                        </label>
                        {currentCoverUrl && (
                          <div className="mb-2 flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-xs">
                            <img src={currentCoverUrl} alt="Capa Atual" className="w-12 h-12 object-cover rounded-lg" />
                            <div>
                              <p className="text-xs font-bold text-gray-800">Capa atual em uso</p>
                              <p className="text-[10px] text-gray-400">Envie um novo arquivo para substituir</p>
                            </div>
                          </div>
                        )}
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => setWpNewPost({
                            ...wpNewPost, 
                            imageFile: e.target.files?.[0] || null 
                          })}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                      <button 
                        type="button" 
                        onClick={() => { setEditingPostId(null); setCurrentCoverUrl(null); setWpModalOpen(false); }}
                        className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>

                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {/* Botão Rascunho */}
                        <button 
                          type="button" 
                          disabled={creatingWpPost}
                          onClick={() => handleCreateWpPostWithAction('draft')}
                          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-full border border-gray-300/80 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-gray-600" />
                          Salvar Rascunho
                        </button>

                        {/* Botão Agendar */}
                        <button 
                          type="button" 
                          disabled={creatingWpPost}
                          onClick={() => handleCreateWpPostWithAction('schedule')}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-full shadow-md transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Agendar
                        </button>

                        {/* Botão Publicar Agora */}
                        <button 
                          type="button" 
                          disabled={creatingWpPost}
                          onClick={() => handleCreateWpPostWithAction('publish')}
                          className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white font-bold px-7 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-[#DFFF00]" />
                          {creatingWpPost ? 'Salvando...' : 'Publicar Agora'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Grid of Posts */}"""

    content = re.sub(form_pattern, new_form_jsx, content, count=1)

    # 5. Replace badges in grid of posts (emojis -> lucide icons)
    content = content.replace("{post.status === 'publish' ? '● Publicado' : isScheduled ? '⏰ Agendado' : '📝 Rascunho'}",
                              "{post.status === 'publish' ? (<><CheckCircle2 className=\"w-3 h-3 text-white mr-1 inline\" /> Publicado</>) : isScheduled ? (<><Clock className=\"w-3 h-3 text-white mr-1 inline\" /> Agendado</>) : (<><FileText className=\"w-3 h-3 text-amber-300 mr-1 inline\" /> Rascunho</>)}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Completed processing {filepath}.")

process_file(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx')
process_file(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx')
