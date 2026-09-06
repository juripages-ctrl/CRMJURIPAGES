import re

wp_and_blog_tabs = """
      {/* Tab: WordPress */}
      {activeTab === 'wp' && (
        <div className="space-y-6">
          {wp ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Integração WordPress Conectada</h3>
                  <p className="text-xs text-gray-500">O sistema WordPress está ativo para este projeto.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Acesse a aba <strong className="text-purple-700 font-semibold">Blog (Postagens)</strong> acima para criar, agendar ou gerenciar artigos do site.</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center">
              <Globe className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">WordPress não conectado</h3>
              <p className="text-sm text-gray-600 mb-6">Conecte a integração do WordPress nas configurações deste site para habilitar a gestão do Blog.</p>
              <Button onClick={() => setActiveTab('integracoes')}>Ir para Integrações</Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Blog */}
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

                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Imagem de Capa (Destacada)</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => setWpNewPost({
                          ...wpNewPost, 
                          imageFile: e.target.files?.[0] || null 
                        })}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                      />
                      {wpNewPost.imageFile && (
                        <div className="relative mt-2 p-2 bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center max-w-md">
                          <img 
                            src={URL.createObjectURL(wpNewPost.imageFile)} 
                            alt="Prévia da imagem de capa" 
                            className="max-h-64 w-full object-contain rounded-lg shadow-sm"
                          />
                          <button 
                            type="button" 
                            onClick={() => setWpNewPost({ ...wpNewPost, imageFile: null })}
                            className="mt-2 text-xs font-bold text-red-600 hover:underline"
                          >
                            Remover imagem
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action Selector: Publish vs Schedule */}
                    <div className="pt-2 space-y-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setWpNewPost({ ...wpNewPost, status: 'publish', scheduledDate: '' })}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                            wpNewPost.status === 'publish' && !wpNewPost.scheduledDate
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Publicar Agora
                        </button>
                        <button
                          type="button"
                          onClick={() => setWpNewPost({ ...wpNewPost, status: 'future', scheduledDate: wpNewPost.scheduledDate || new Date(Date.now() + 86400000).toISOString().slice(0, 16) })}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                            wpNewPost.status === 'future' || wpNewPost.scheduledDate
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Agendar Publicação
                        </button>
                      </div>

                      {(wpNewPost.status === 'future' || wpNewPost.scheduledDate) && (
                        <div className="p-4 bg-purple-100/60 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in duration-200 max-w-md">
                          <label className="block text-xs font-bold text-purple-900">Escolha a Data e Hora de Publicação</label>
                          <input 
                            type="datetime-local"
                            value={wpNewPost.scheduledDate}
                            onChange={(e) => setWpNewPost({
                              ...wpNewPost, 
                              scheduledDate: e.target.value,
                              status: 'future'
                            })}
                            className="w-full p-2.5 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-xs font-medium text-gray-900"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-purple-100">
                      <Button 
                        type="submit" 
                        disabled={creatingWpPost} 
                        className={`px-8 py-3 text-sm font-bold rounded-full ${
                          wpNewPost.scheduledDate ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        {creatingWpPost ? 'Processando...' : wpNewPost.scheduledDate ? 'Agendar Postagem' : 'Publicar Agora'}
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
      )}
"""

def restore_wp_and_blog():
    filepath = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    marker = "{/* Tab: Speed */}"
    if marker in content:
        content = content.replace(marker, wp_and_blog_tabs.strip() + "\n\n      " + marker)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully restored WordPress and Blog tabs in SiteDashboardClient.tsx")

restore_wp_and_blog()
