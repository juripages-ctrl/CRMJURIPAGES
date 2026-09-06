import re

def fix_file_jsx(filepath):
    print(f"Fixing JSX in {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find from {/* Form Modal / Card */} to {/* Grid of Posts */} and replace with perfectly structured JSX
    form_start = content.find('{/* Form Modal / Card */}')
    form_end = content.find('{/* Grid of Posts */}')

    if form_start != -1 and form_end != -1:
        clean_form_jsx = """{/* Form Modal / Card */}
              {wpModalOpen && (
                <div className="bg-white border border-gray-200/90 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 relative overflow-visible animate-in fade-in slide-in-from-top-4 duration-300">
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

                    {/* Imagem de Capa (Com Prévia Instantânea) */}
                    <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                      <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                        <span>Imagem de Capa (Destacada)</span>
                      </label>
                      
                      {(imagePreviewUrl || currentCoverUrl) && (
                        <div className="mb-3 flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm relative group">
                          <img 
                            src={imagePreviewUrl || currentCoverUrl || ''} 
                            alt="Prévia da Capa" 
                            className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-xs flex-shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {imagePreviewUrl ? 'Nova Imagem Selecionada' : 'Capa Atual em Uso'}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {imagePreviewUrl ? 'Esta imagem será salva como capa' : 'Envie um novo arquivo abaixo para substituir'}
                            </p>
                          </div>
                          {imagePreviewUrl && (
                            <button 
                              type="button" 
                              onClick={() => { 
                                setWpNewPost({ ...wpNewPost, imageFile: null })
                                setImagePreviewUrl(null) 
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Remover imagem"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
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
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                      />
                    </div>

                    {/* Data e Hora de Agendamento (Apenas se showSchedulePicker = true) */}
                    {showSchedulePicker && (
                      <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200/80 shadow-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>Data e Hora de Agendamento</span>
                          </label>
                          <button 
                            type="button" 
                            onClick={() => { setShowSchedulePicker(false); setWpNewPost({ ...wpNewPost, scheduledDate: '' }); }}
                            className="text-xs font-medium text-purple-600 hover:text-purple-900"
                          >
                            Cancelar Agendamento
                          </button>
                        </div>
                        <CustomDateTimePicker 
                          value={wpNewPost.scheduledDate}
                          onChange={(val) => setWpNewPost({ ...wpNewPost, scheduledDate: val })}
                          placeholder="Clique para escolher data e hora no calendário..."
                        />
                        <p className="text-[11px] text-purple-700/80">Escolha o momento exato em que a postagem entrará no ar.</p>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                      <button 
                        type="button" 
                        onClick={() => { setEditingPostId(null); setCurrentCoverUrl(null); setImagePreviewUrl(null); setShowSchedulePicker(false); setWpModalOpen(false); }}
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

                        {/* Botão Agendar (LILÁS) */}
                        <button 
                          type="button" 
                          disabled={creatingWpPost}
                          onClick={() => {
                            if (!showSchedulePicker) {
                              setShowSchedulePicker(true)
                            } else {
                              handleCreateWpPostWithAction('schedule')
                            }
                          }}
                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3.5 rounded-full shadow-lg shadow-purple-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-white" />
                          {showSchedulePicker ? 'Confirmar Agendamento' : 'Agendar'}
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
              )
              
              """

        new_content = content[:form_start] + clean_form_jsx + content[form_end:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned form JSX in {filepath}")

fix_file_jsx(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx')
fix_file_jsx(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx')
