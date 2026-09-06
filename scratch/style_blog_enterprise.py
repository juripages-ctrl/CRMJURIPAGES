import os

def upgrade_blog_style(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Define the new ultra-sleek enterprise Blog tab UI
    new_blog_ui = """      {/* Tab: Blog */}
      {activeTab === 'blog' && (
        <div className="space-y-8">
          {(typeof hasWp !== 'undefined' ? hasWp : wp) ? (
            <div className="space-y-8">
              {/* Enterprise Hero Banner */}
              <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
                {/* Decorative Ambient Orbs */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#DFFF00]/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 backdrop-blur-md border border-white/10">
                      <Sparkles className="w-3.5 h-3.5 text-[#DFFF00]" /> Gestão de Conteúdo & Marketing
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                      Blog & Publicações
                    </h3>
                    <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                      Crie artigos de alto engajamento, agende publicações estratégicas e gerencie a imagem destacada do seu site WordPress em tempo real.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => { if (wpModalOpen) setEditingPostId(null); setWpModalOpen(!wpModalOpen); }} 
                    className="bg-[#DFFF00] hover:bg-[#cbf000] text-black font-bold px-6 py-3.5 rounded-full shadow-lg shadow-[#DFFF00]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    {wpModalOpen ? 'Fechar Formulário' : '+ Nova Postagem'}
                  </button>
                </div>
              </div>

              {/* Form Modal / Card */}
              {wpModalOpen && (
                <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {editingPostId ? '✏️ Editar Postagem' : '🚀 Criar ou Agendar Nova Postagem'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Preencha os campos abaixo para atualizar ou publicar no seu blog WordPress.</p>
                    </div>
                    {editingPostId && (
                      <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full border border-amber-200">
                        Editando ID #{editingPostId}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleCreateWpPost} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Título do Artigo</label>
                      <Input 
                        required 
                        value={wpNewPost.title}
                        onChange={(e) => setWpNewPost({...wpNewPost, title: e.target.value})}
                        placeholder="Ex: Como proteger seu patrimônio com planejamento imobiliário..." 
                        className="bg-gray-50/50 border-gray-200 focus:bg-white text-base py-3 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Conteúdo do Artigo</label>
                      <textarea 
                        required
                        value={wpNewPost.content}
                        onChange={(e) => setWpNewPost({...wpNewPost, content: e.target.value})}
                        className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm leading-relaxed"
                        placeholder="Escreva o texto do artigo aqui..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Status da Publicação</label>
                        <select 
                          value={wpNewPost.status}
                          onChange={(e) => setWpNewPost({...wpNewPost, status: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm font-medium"
                        >
                          <option value="publish">Publicado Imediatamente</option>
                          <option value="draft">Rascunho</option>
                          <option value="future">Agendado</option>
                        </select>
                      </div>

                      <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Data e Hora de Publicação</label>
                        <input 
                          type="datetime-local"
                          value={wpNewPost.scheduledDate}
                          onChange={(e) => setWpNewPost({
                            ...wpNewPost, 
                            scheduledDate: e.target.value,
                            status: e.target.value ? 'future' : wpNewPost.status
                          })}
                          className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm font-medium"
                        />
                        <p className="text-[11px] text-gray-400 mt-1.5">Ajuste o horário exato de exibição no site.</p>
                      </div>

                      <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Imagem de Capa (Destacada)</label>
                        {currentCoverUrl && (
                          <div className="mb-3 flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200">
                            <img src={currentCoverUrl} alt="Capa Atual" className="w-10 h-10 object-cover rounded-lg" />
                            <span className="text-[11px] text-gray-500 font-medium">Capa atual em uso.</span>
                          </div>
                        )}
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => setWpNewPost({
                            ...wpNewPost, 
                            imageFile: e.target.files?.[0] || null 
                          })}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button 
                        type="button" 
                        onClick={() => { setEditingPostId(null); setCurrentCoverUrl(null); setWpModalOpen(false); }}
                        className="px-6 py-3 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={creatingWpPost} 
                        className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-sm"
                      >
                        {creatingWpPost ? 'Salvando no WordPress...' : editingPostId ? 'Salvar Alterações' : wpNewPost.scheduledDate ? 'Agendar Publicação' : 'Publicar Artigo'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Grid of Posts */}
              {loadingWp ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <Activity className="w-8 h-8 animate-spin text-black mb-3" />
                  <p className="text-sm font-medium text-gray-500">Sincronizando artigos do WordPress...</p>
                </div>
              ) : wpPosts && wpPosts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {wpPosts.map((post: any) => {
                    const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
                    const isScheduled = post.status === 'future' || new Date(post.date) > new Date()
                    
                    return (
                      <div key={post.id} className="bg-white border border-gray-200/80 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col hover:-translate-y-1">
                        {/* Cover Image Container */}
                        <div className="h-52 w-full overflow-hidden relative bg-gray-100">
                          {featuredImg ? (
                            <img 
                              src={featuredImg} 
                              alt={post.title.rendered} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                              <Globe className="w-10 h-10 opacity-30 mb-1" />
                              <span className="text-xs font-medium text-gray-400">Sem Imagem de Capa</span>
                            </div>
                          )}

                          {/* Status Badge Positioned on Image */}
                          <div className="absolute top-4 left-4">
                            <Badge 
                              className={
                                post.status === 'publish' 
                                  ? 'bg-emerald-500 text-white font-bold rounded-full px-3 py-1 text-[11px] shadow-md border-none' 
                                  : isScheduled
                                  ? 'bg-blue-600 text-white font-bold rounded-full px-3 py-1 text-[11px] shadow-md border-none'
                                  : 'bg-gray-900/80 backdrop-blur-md text-white font-bold rounded-full px-3 py-1 text-[11px] border-none'
                              }
                            >
                              {post.status === 'publish' ? '● Publicado' : isScheduled ? '⏰ Agendado' : '📝 Rascunho'}
                            </Badge>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-medium text-gray-400 mb-2">
                              {new Date(post.date).toLocaleDateString('pt-BR')} às {new Date(post.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <h4 
                              className="font-bold text-gray-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-black transition-colors" 
                              dangerouslySetInnerHTML={{ __html: post.title.rendered || '(Sem título)' }} 
                            />
                          </div>
                          
                          {/* Card Footer Actions */}
                          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#DFFF00]" /> Editar
                            </button>
                            {post.link && (
                              <a 
                                href={post.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full border border-gray-200 transition-all"
                              >
                                Ver no site <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Nenhum artigo publicado ainda</h4>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Clique no botão abaixo para criar a primeira postagem do seu blog WordPress.</p>
                  <button 
                    onClick={() => setWpModalOpen(true)}
                    className="bg-black text-white font-semibold rounded-full px-6 py-3 text-sm shadow-md hover:bg-gray-800 transition-all"
                  >
                    + Criar Primeira Postagem
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-[2.5rem] p-12 max-w-2xl mx-auto text-center shadow-sm">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">WordPress não conectado</h3>
              <p className="text-sm text-gray-500 mb-6">Para poder publicar, agendar e editar artigos do seu Blog, conecte a API do WordPress nas integrações.</p>
              <Button onClick={() => setActiveTab('integracoes')} className="bg-black text-white rounded-full px-6 py-3">Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}"""

    # Locate `{/* Tab: Blog */}` up to end of blog block and replace
    blog_start = "{/* Tab: Blog */}"
    if blog_start in content:
        idx_start = content.find(blog_start)
        # Find next tab comment or end of tab condition
        idx_end_marker = content.find("{/* SPEED INSIGHTS */}", idx_start)
        if idx_end_marker == -1:
            idx_end_marker = content.find("    </div>\n  )\n}", idx_start)
            if idx_end_marker == -1:
                idx_end_marker = content.rfind("</div>")

        if idx_start != -1 and idx_end_marker != -1:
            content = content[:idx_start] + new_blog_ui + "\n\n" + content[idx_end_marker:]
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Successfully upgraded Blog style in {filepath}")
        else:
            print(f"Could not locate boundaries in {filepath}")
    else:
        print(f"Could not find Blog tab in {filepath}")

upgrade_blog_style(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx")
upgrade_blog_style(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx")
