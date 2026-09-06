def update_time_picker():
    path = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\components\ui\CustomDateTimePicker.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    target_start = content.find('{/* Time Picker Bar */}')
    target_end = content.find('{/* Action Footer */}')

    if target_start != -1 and target_end != -1:
        new_time_section = """{/* Time Picker Bar */}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Horário:</span>
              </div>

              {/* Editable Inputs for Hours and Minutes + Quick Select */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded-xl">
                {/* Hours Editable Input */}
                <input
                  type="text"
                  maxLength={2}
                  value={hours}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\\D/g, '')
                    if (val.length > 2) val = val.slice(0, 2)
                    if (val && parseInt(val, 10) > 23) val = '23'
                    handleTimeChange(val, minutes)
                  }}
                  onBlur={() => {
                    const pad = (n: string) => n.padStart(2, '0')
                    handleTimeChange(pad(hours || '00'), minutes)
                  }}
                  className="w-7 text-center bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black py-1"
                  placeholder="12"
                  title="Digite a hora (00-23)"
                />
                <span className="text-gray-400 font-bold">:</span>
                {/* Minutes Editable Input */}
                <input
                  type="text"
                  maxLength={2}
                  value={minutes}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\\D/g, '')
                    if (val.length > 2) val = val.slice(0, 2)
                    if (val && parseInt(val, 10) > 59) val = '59'
                    handleTimeChange(hours, val)
                  }}
                  onBlur={() => {
                    const pad = (n: string) => n.padStart(2, '0')
                    handleTimeChange(hours, pad(minutes || '00'))
                  }}
                  className="w-7 text-center bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black py-1"
                  placeholder="00"
                  title="Digite os minutos (00-59)"
                />

                {/* Optional Quick Selector */}
                <select
                  value={hours + ':' + minutes}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [h, m] = e.target.value.split(':')
                      handleTimeChange(h, m)
                    }
                  }}
                  className="bg-transparent text-[11px] font-medium text-gray-500 outline-none cursor-pointer border-l border-gray-200 pl-1.5 ml-1"
                >
                  <option value="">Opções...</option>
                  <option value="08:00">08:00 (Manhã)</option>
                  <option value="09:00">09:00 (Manhã)</option>
                  <option value="10:00">10:00 (Manhã)</option>
                  <option value="12:00">12:00 (Meio-dia)</option>
                  <option value="14:00">14:00 (Tarde)</option>
                  <option value="16:00">16:00 (Tarde)</option>
                  <option value="18:00">18:00 (Noite)</option>
                  <option value="20:00">20:00 (Noite)</option>
                </select>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-right">Digite as horas e minutos diretamente ou escolha na lista.</p>
          </div>

          """
        new_content = content[:target_start] + new_time_section + content[target_end:]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("CustomDateTimePicker updated with editable inputs.")

def update_preview_uncropped(filepath):
    print(f"Updating preview in {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target_start = content.find('{(imagePreviewUrl || currentCoverUrl) && (')
    if target_start != -1:
        new_preview = """{(imagePreviewUrl || currentCoverUrl) && (
                        <div className="mb-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm relative group space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              {imagePreviewUrl ? 'Prévia da Imagem Selecionada (Completa)' : 'Capa Atual em Uso'}
                            </span>
                            {imagePreviewUrl && (
                              <button 
                                type="button" 
                                onClick={() => { 
                                  setWpNewPost({ ...wpNewPost, imageFile: null })
                                  setImagePreviewUrl(null) 
                                }}
                                className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Remover
                              </button>
                            )}
                          </div>
                          
                          {/* Full Uncropped Image Preview */}
                          <div className="w-full bg-gray-100/80 border border-gray-200/60 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[160px] max-h-[300px]">
                            <img 
                              src={imagePreviewUrl || currentCoverUrl || ''} 
                              alt="Prévia Completa da Capa" 
                              className="w-full max-h-[280px] object-contain rounded-lg shadow-xs" 
                            />
                          </div>
                        </div>
                      )}"""

        file_input_pos = content.find('<input', target_start)
        if file_input_pos != -1:
            content = content[:target_start] + new_preview + "\n\n                      " + content[file_input_pos:]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated preview in {filepath}")

update_time_picker()
update_preview_uncropped(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx')
update_preview_uncropped(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx')
