import re

def update_custom_date_picker():
    path = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\components\ui\CustomDateTimePicker.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change popover container z-index and positioning so it floats up or opens cleanly
    content = content.replace(
        'className="absolute right-0 sm:left-0 mt-2 w-80 sm:w-88 bg-white border border-gray-200 rounded-[1.75rem] shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"',
        'className="absolute right-0 sm:left-0 bottom-full mb-2.5 w-80 sm:w-88 bg-white border border-gray-200 rounded-[1.75rem] shadow-2xl p-5 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200"'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("CustomDateTimePicker updated.")

def update_page_files(filepath):
    print(f"Updating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. State additions
    if "const [imagePreviewUrl, setImagePreviewUrl]" not in content:
        content = content.replace(
            "const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null)",
            "const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null)\n  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)\n  const [showSchedulePicker, setShowSchedulePicker] = useState(false)"
        )

    # 2. Reset states in cancel / edit / reset
    content = content.replace(
        "setEditingPostId(null); setCurrentCoverUrl(null)",
        "setEditingPostId(null); setCurrentCoverUrl(null); setImagePreviewUrl(null); setShowSchedulePicker(false)"
    )

    # In handleEditPost, if scheduledDate exists, show schedule picker
    content = content.replace(
        "setCurrentCoverUrl(featuredImg)",
        "setCurrentCoverUrl(featuredImg)\n    setImagePreviewUrl(null)\n    setShowSchedulePicker(!!scheduledDate || post.status === 'future')"
    )

    # 3. Fix Form Modal wrapper overflow-hidden -> overflow-visible
    content = content.replace(
        'className="bg-white border border-gray-200/90 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"',
        'className="bg-white border border-gray-200/90 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 relative overflow-visible animate-in fade-in slide-in-from-top-4 duration-300"'
    )

    # 4. Replace image input and preview section
    old_img_section_pattern = r'\{/\* Imagem de Capa \*/\}[\s\S]*?</div>\s*</div>'
    
    new_img_section = """{/* Imagem de Capa */}
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
                                {imagePreviewUrl ? 'Esta imagem será salva como capa' : 'Envie um novo arquivo para substituir'}
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
                      </div>"""

    content = re.sub(old_img_section_pattern, new_img_section, content, count=1)

    # 5. Conditionally render Date and Time picker only if showSchedulePicker is true!
    old_date_grid_pattern = r'\{/\* Inputs Secundários: Data e Hora & Imagem de Capa \*/\}[\s\S]*?\{/\* Imagem de Capa \*/\}'

    new_date_grid = """{/* Inputs Secundários: Data e Hora (Condicional) & Imagem de Capa */}
                    {showSchedulePicker && (
                      <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200/80 shadow-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
                          placeholder="Clique para agendar data e hora..."
                        />
                        <p className="text-[11px] text-purple-700/80">Escolha o momento exato em que a postagem entrará no ar.</p>
                      </div>
                    )}

                    """

    content = re.sub(old_date_grid_pattern, new_date_grid, content, count=1)

    # 6. Update Agendar Lilac button & handler logic
    old_agendar_btn = r'<button\s+type="button"\s+disabled=\{creatingWpPost\}\s+onClick=\{\(\) => handleCreateWpPostWithAction\(\'schedule\'\)\}\s+className="[^"]*"\s*>\s*<Clock className="w-4 h-4" />\s*Agendar\s*</button>'

    new_agendar_btn = """<button 
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
                        </button>"""

    content = re.sub(old_agendar_btn, new_agendar_btn, content, count=1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated {filepath}")

update_custom_date_picker()
update_page_files(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx')
update_page_files(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx')
