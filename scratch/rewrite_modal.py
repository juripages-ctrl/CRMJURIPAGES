import os

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = "{/* Form Modal / Card */}"
    end_marker = "{/* Grid of Posts */}"

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print(f"Marcadores nao encontrados em {filepath}")
        return

    new_modal = """{/* Modal e Wizard de Criacao de Post */}
                {wpModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-6 relative w-full max-w-4xl my-auto max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                      
                      {/* Botao Fechar */}
                      <button type="button" onClick={() => {setWpModalOpen(false); setWpModalStep(1);}} className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                      </button>

                      {/* Header do Modal */}
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {editingPostId ? <Pencil className="w-6 h-6 text-gray-700" /> : <Sparkles className="w-6 h-6 text-black" />}
                            {editingPostId ? 'Editar Postagem' : 'Nova Postagem'}
                          </h4>
                          
                          {/* Stepper Dots */}
                          <div className="flex items-center gap-2 mt-4">
                             {[1,2,3,4,5].map(s => (
                               <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${s <= wpModalStep ? 'bg-black' : 'bg-gray-200'}`}></div>
                             ))}
                             <span className="text-xs text-gray-500 ml-2 font-medium">Passo {wpModalStep} de 5</span>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleCreateWpPost} className="space-y-6">
                        
                        {/* PASSO 1: Titulo e Conteudo */}
                        {wpModalStep === 1 && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
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

                            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                <span>Conteúdo do Artigo</span>
                              </label>
                              <textarea 
                                required
                                value={wpNewPost.content}
                                onChange={(e) => setWpNewPost({...wpNewPost, content: e.target.value})}
                                className="w-full min-h-[300px] p-4 rounded-xl border border-gray-300 bg-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm leading-relaxed text-gray-900 shadow-xs"
                                placeholder="Escreva o texto do artigo aqui..."
                              />
                            </div>
                          </div>
                        )}

                        {/* PASSO 2: Imagem Destaque */}
                        {wpModalStep === 2 && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                <ImageIcon className="w-5 h-5 text-gray-600" />
                                <span>Imagem de Capa (Destacada)</span>
                              </label>
                              
                              {(imagePreviewUrl || currentCoverUrl) && (
                                <div className="mb-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm relative group space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                      {imagePreviewUrl ? 'Prévia da Imagem Selecionada' : 'Capa Atual em Uso'}
                                    </span>
                                    {imagePreviewUrl && (
                                      <button 
                                        type="button" 
                                        onClick={() => { 
                                          setWpNewPost({ ...wpNewPost, imageFile: null })
                                          setImagePreviewUrl(null) 
                                        }}
                                        className="text-sm text-red-500 hover:underline font-semibold flex items-center gap-1"
                                      >
                                        <X className="w-4 h-4" /> Remover
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div className="w-full bg-gray-100/80 border border-gray-200/60 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[200px] max-h-[400px]">
                                    <img 
                                      src={imagePreviewUrl || currentCoverUrl || ''} 
                                      alt="Prévia Completa da Capa" 
                                      className="w-full max-h-[360px] object-contain rounded-lg shadow-xs" 
                                    />
                                  </div>
                                </div>
                              )}

                              <input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  setWpNewPost({ ...wpNewPost, imageFile: file })
                                  if (file) {
                                    setImagePreviewUrl(URL.createObjectURL(file))
                                  } else {
                                    setImagePreviewUrl(null)
                                  }
                                }}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                        {/* PASSO 3: Categorias */}
                        {wpModalStep === 3 && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Categorias
                              </label>
                              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border rounded-xl bg-white shadow-inner">
                                {wpCategories.map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      const cats = wpNewPost.categories;
                                      setWpNewPost({ ...wpNewPost, categories: cats.includes(cat.id) ? cats.filter(c => c !== cat.id) : [...cats, cat.id] });
                                    }}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${wpNewPost.categories.includes(cat.id) ? 'bg-black text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                                  >
                                    {cat.name}
                                  </button>
                                ))}
                                {wpCategories.length === 0 && <span className="text-sm text-gray-400">Nenhuma categoria encontrada</span>}
                              </div>
                              <div className="flex gap-3">
                                <Input 
                                  placeholder="Nome da Nova Categoria..." 
                                  value={newCategoryName} 
                                  onChange={e => setNewCategoryName(e.target.value)} 
                                  className="text-sm h-11 bg-white border-gray-300 rounded-xl"
                                />
                                <Button 
                                  type="button" 
                                  className="h-11 px-6 text-sm whitespace-nowrap bg-gray-900 text-white hover:bg-black rounded-xl"
                                  disabled={!newCategoryName || isCreatingCategory}
                                  onClick={async () => {
                                    const wpObj = wp || site?.integracoes_wordpress?.[0]
                                    if (!wpObj || !newCategoryName) return
                                    setIsCreatingCategory(true)
                                    const res = await createWpCategory(wpObj.site_url, wpObj.username, wpObj.app_password, newCategoryName)
                                    if (res.success) {
                                      setWpCategories([...wpCategories, res.data])
                                      setWpNewPost({ ...wpNewPost, categories: [...wpNewPost.categories, res.data.id] })
                                      setNewCategoryName('')
                                    } else {
                                      alert('Erro ao criar categoria: ' + res.error)
                                    }
                                    setIsCreatingCategory(false)
                                  }}
                                >
                                  {isCreatingCategory ? 'Criando...' : 'Adicionar'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PASSO 4: Tags */}
                        {wpModalStep === 4 && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Tags
                              </label>
                              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 border rounded-xl bg-white shadow-inner">
                                {wpTags.map(tag => (
                                  <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => {
                                      const tags = wpNewPost.tags;
                                      setWpNewPost({ ...wpNewPost, tags: tags.includes(tag.id) ? tags.filter(t => t !== tag.id) : [...tags, tag.id] });
                                    }}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${wpNewPost.tags.includes(tag.id) ? 'bg-black text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                                  >
                                    {tag.name}
                                  </button>
                                ))}
                                {wpTags.length === 0 && <span className="text-sm text-gray-400">Nenhuma tag encontrada</span>}
                              </div>
                              <div className="flex gap-3">
                                <Input 
                                  placeholder="Nome da Nova Tag..." 
                                  value={newTagName} 
                                  onChange={e => setNewTagName(e.target.value)} 
                                  className="text-sm h-11 bg-white border-gray-300 rounded-xl"
                                />
                                <Button 
                                  type="button" 
                                  className="h-11 px-6 text-sm whitespace-nowrap bg-gray-900 text-white hover:bg-black rounded-xl"
                                  disabled={!newTagName || isCreatingTag}
                                  onClick={async () => {
                                    const wpObj = wp || site?.integracoes_wordpress?.[0]
                                    if (!wpObj || !newTagName) return
                                    setIsCreatingTag(true)
                                    const res = await createWpTag(wpObj.site_url, wpObj.username, wpObj.app_password, newTagName)
                                    if (res.success) {
                                      setWpTags([...wpTags, res.data])
                                      setWpNewPost({ ...wpNewPost, tags: [...wpNewPost.tags, res.data.id] })
                                      setNewTagName('')
                                    } else {
                                      alert('Erro ao criar tag: ' + res.error)
                                    }
                                    setIsCreatingTag(false)
                                  }}
                                >
                                  {isCreatingTag ? 'Criando...' : 'Adicionar'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PASSO 5: Ações de Salvar */}
                        {wpModalStep === 5 && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {showSchedulePicker && (
                              <div className="bg-purple-50/70 p-6 rounded-2xl border border-purple-200/80 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between">
                                  <label className="block text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <span>Data e Hora de Agendamento</span>
                                  </label>
                                  <button 
                                    type="button" 
                                    onClick={() => { setShowSchedulePicker(false); setWpNewPost({ ...wpNewPost, scheduledDate: '' }); }}
                                    className="text-sm font-medium text-purple-600 hover:text-purple-900 bg-white px-3 py-1.5 rounded-lg border border-purple-200"
                                  >
                                    Cancelar Agendamento
                                  </button>
                                </div>
                                <CustomDateTimePicker 
                                  value={wpNewPost.scheduledDate}
                                  onChange={(val) => setWpNewPost({ ...wpNewPost, scheduledDate: val })}
                                  placeholder="Clique para escolher data e hora no calendário..."
                                />
                                <p className="text-xs text-purple-700/80 font-medium">Escolha o momento exato em que a postagem entrará no ar.</p>
                              </div>
                            )}

                            {isLimitReached && (
                              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-sm shadow-sm">
                                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="font-bold block text-amber-900 mb-1">Limite Mensal de Agendamentos Atingido ({scheduledThisMonthCount} de 6)</strong>
                                  <span className="leading-relaxed">Seu Plano Profissional atingiu o limite de 6 postagens agendadas para este mês. Faça upgrade para o Plano Premium para agendar postagens ilimitadas.</span>
                                </div>
                              </div>
                            )}

                            <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col gap-4">
                              <h5 className="font-bold text-gray-900">Como deseja salvar esta postagem?</h5>
                              
                              <button 
                                type="button" 
                                disabled={creatingWpPost}
                                onClick={() => handleCreateWpPostWithAction('draft')}
                                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold px-6 py-4 rounded-xl border-2 border-gray-200 transition-all text-sm flex items-center justify-between"
                              >
                                <span className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-500" /> Salvar como Rascunho</span>
                              </button>

                              <button 
                                type="button" 
                                disabled={creatingWpPost || isLimitReached}
                                onClick={async () => {
                                  if (isLimitReached) {
                                    alert('Limite de 6 agendamentos mensais atingido para o Plano Profissional. Faça upgrade para o Plano Premium!')
                                    return
                                  }
                                  if (!showSchedulePicker) {
                                    setShowSchedulePicker(true)
                                  } else {
                                    handleCreateWpPostWithAction('schedule')
                                  }
                                }}
                                className={`w-full font-bold px-6 py-4 rounded-xl transition-all text-sm flex items-center justify-between ${
                                  isLimitReached 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200' 
                                    : 'bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
                                }`}
                              >
                                <span className="flex items-center gap-3"><Clock className="w-5 h-5 text-purple-500" /> {showSchedulePicker ? 'Confirmar Agendamento' : 'Agendar Postagem'}</span>
                              </button>

                              <button 
                                type="button" 
                                disabled={creatingWpPost}
                                onClick={() => handleCreateWpPostWithAction('publish')}
                                className="w-full bg-black hover:bg-gray-900 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-between"
                              >
                                <span className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-[#DFFF00]" /> {creatingWpPost ? 'Salvando...' : 'Publicar Agora'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Controles do Wizard (Prev / Next) */}
                        <div className="flex justify-between items-center pt-6 mt-8 border-t border-gray-100">
                          {wpModalStep > 1 ? (
                            <button type="button" onClick={() => setWpModalStep(wpModalStep - 1)} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                              Voltar
                            </button>
                          ) : (
                            <button type="button" onClick={() => {setWpModalOpen(false); setWpModalStep(1);}} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                              Cancelar
                            </button>
                          )}
                          
                          {wpModalStep < 5 && (
                            <button type="button" onClick={() => {
                              // Validacoes basicas
                              if (wpModalStep === 1 && !wpNewPost.title) {
                                alert("Preencha o titulo"); return;
                              }
                              setWpModalStep(wpModalStep + 1);
                            }} className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-gray-900 shadow-md hover:scale-105 transition-all">
                              Próximo Passo
                            </button>
                          )}
                        </div>

                      </form>
                    </div>
                  </div>
                )}
                
                {/* Popup de Sucesso Personalizado */}
                {wpSuccessPopup.show && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
                      
                      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                        <div className="w-14 h-14 rounded-full border-[4px] border-blue-500 flex items-center justify-center">
                          <span className="text-blue-500 font-bold text-3xl lowercase font-serif italic">i</span>
                        </div>
                      </div>
                      
                      <h3 className="text-gray-900 font-bold text-2xl mb-2">{wpSuccessPopup.message}</h3>
                      <p className="text-gray-500 text-sm mb-8">Sua postagem foi processada e salva no WordPress.</p>
                      
                      <div className="w-full space-y-4">
                        {wpSuccessPopup.postUrl && (
                          <a href={wpSuccessPopup.postUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#9b3bff] hover:bg-[#8b2bef] text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95">
                            Ver sua postagem <Sparkles className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => setWpSuccessPopup({show: false, postId: null, postUrl: null, message: ''})} className="w-full py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                          Voltar para Blog
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                """

    # Mantendo a formatacao original
    new_content = content[:start_idx] + new_modal + content[end_idx:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

update_file(r'C:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx')
