import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Adicionar estados para o Wizard e Popup de sucesso
    if 'const [wpModalStep' not in content:
        states = """
  const [wpModalStep, setWpModalStep] = useState(1)
  const [wpSuccessPopup, setWpSuccessPopup] = useState<{show: boolean, postId: number | null, postUrl: string | null, message: string}>({show: false, postId: null, postUrl: null, message: ''})
"""
        content = re.sub(
            r'(const \[wpModalOpen, setWpModalOpen\] = useState\(false\))',
            r'\1' + states,
            content
        )

    # 2. Resetar o step quando fechar
    content = re.sub(
        r'setWpModalOpen\(\!wpModalOpen\);',
        r'setWpModalOpen(!wpModalOpen); setWpModalStep(1);',
        content
    )
    content = re.sub(
        r'setWpModalOpen\(false\);',
        r'setWpModalOpen(false); setWpModalStep(1);',
        content
    )
    content = re.sub(
        r'setWpModalOpen\(true\)',
        r'setWpModalOpen(true); setWpModalStep(1);',
        content
    )

    # 3. Alterar comportamento de salvar post para mostrar popup de sucesso
    if 'setWpSuccessPopup' not in content[content.find('const handleCreateWpPostWithAction'):]:
        # Substituir os alertas de sucesso por setWpSuccessPopup
        content = re.sub(
            r'await showAlert\(\'Postagem (salva|agendada|criada) com sucesso.*?\', \'success\'\).*?setWpModalOpen\(false\)',
            r"setWpSuccessPopup({ show: true, postId: res.data.id, postUrl: res.data.link, message: 'Post atualizado com sucesso!' })\n        setWpModalOpen(false)\n        setWpModalStep(1)",
            content,
            flags=re.DOTALL
        )

    # 4. Modificar o Modal Open e transformá-lo num Stepper + Modal Backdrop
    # Procurar onde ele inicia: {wpModalOpen && ( ... )}
    if 'fixed inset-0 z-[100]' not in content:
        modal_regex = r'\{wpModalOpen && \(\s*<div className="bg-white border border-gray-200/90 rounded-\[2\.5rem\].*?>.*?<form onSubmit=\{handleCreateWpPost\} className="space-y-6">'
        
        stepper_header = """{wpModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 relative w-full max-w-4xl my-auto max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                      <button type="button" onClick={() => {setWpModalOpen(false); setWpModalStep(1);}} className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {editingPostId ? <Pencil className="w-6 h-6 text-gray-700" /> : <Sparkles className="w-6 h-6 text-black" />}
                            {editingPostId ? 'Editar Postagem' : 'Nova Postagem'}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                             {[1,2,3,4,5].map(s => (
                               <div key={s} className={`h-1.5 w-12 rounded-full ${s <= wpModalStep ? 'bg-black' : 'bg-gray-200'}`}></div>
                             ))}
                             <span className="text-xs text-gray-500 ml-2 font-medium">Passo {wpModalStep} de 5</span>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleCreateWpPost} className="space-y-6">"""

        content = re.sub(modal_regex, stepper_header, content, flags=re.DOTALL)

        # Agora precisamos encapsular os campos em passos.
        # Passo 1: Titulo e Conteudo
        content = content.replace(
            '{/* Campo Título */}',
            '{wpModalStep === 1 && (\n                        <div className="space-y-6 animate-in fade-in duration-300">\n                      {/* Campo Título */}'
        )
        content = content.replace(
            '{/* Imagem de Capa (Com Prévia Instantânea Completa) */}',
            '</div>\n                      )}\n\n                      {wpModalStep === 2 && (\n                        <div className="space-y-6 animate-in fade-in duration-300">\n                      {/* Imagem de Capa (Com Prévia Instantânea Completa) */}'
        )
        content = content.replace(
            '{/* Categorias e Tags */}',
            '</div>\n                      )}\n\n                      {wpModalStep === 3 && (\n                        <div className="space-y-6 animate-in fade-in duration-300">\n                      {/* Categorias */}'
        )
        content = content.replace(
            '<div className="space-y-3">\n                          <label className="text-sm font-semibold text-gray-700">Tags</label>',
            '</div>\n                      )}\n\n                      {wpModalStep === 4 && (\n                        <div className="space-y-6 animate-in fade-in duration-300">\n                      <div className="space-y-3">\n                          <label className="text-sm font-semibold text-gray-700">Tags</label>'
        )
        
        # Encontrar o fechamento da div grid do categorias e tags
        content = content.replace(
            '</div>\n\n                      {/* Data e Hora de Agendamento (Condicional) */}',
            '</div>\n                      </div>\n                      )}\n\n                      {wpModalStep === 5 && (\n                        <div className="space-y-6 animate-in fade-in duration-300">\n                      {/* Data e Hora de Agendamento (Condicional) */}'
        )

        # Botões de Ação
        # Remover os botões antigos e colocar os do stepper
        botoes_regex = r'\{/\* Botões de Ação \*/\}.*?</form>'
        
        stepper_footer = """{/* Botões de Ação do Wizard */}
                      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                        {wpModalStep > 1 ? (
                          <button type="button" onClick={() => setWpModalStep(wpModalStep - 1)} className="px-6 py-3 rounded-full text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                            Voltar
                          </button>
                        ) : (
                          <button type="button" onClick={() => {setWpModalOpen(false); setWpModalStep(1);}} className="px-6 py-3 rounded-full text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors">
                            Cancelar
                          </button>
                        )}
                        
                        {wpModalStep < 5 ? (
                          <button type="button" onClick={() => setWpModalStep(wpModalStep + 1)} className="px-8 py-3 rounded-full text-sm font-bold text-white bg-black hover:bg-gray-900 shadow-lg hover:scale-105 transition-all">
                            Próximo Passo
                          </button>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <button type="button" disabled={creatingWpPost} onClick={() => handleCreateWpPostWithAction('draft')} className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-full border border-gray-300/80 transition-all text-sm flex items-center justify-center gap-2">
                              <FileText className="w-4 h-4 text-gray-600" /> Rascunho
                            </button>
                            <button type="button" disabled={creatingWpPost || isLimitReached} onClick={async () => { if (isLimitReached) return; if (!showSchedulePicker) { setShowSchedulePicker(true); } else { handleCreateWpPostWithAction('schedule'); } }} className={`w-full sm:w-auto font-bold px-6 py-3.5 rounded-full shadow-lg transition-all text-sm flex items-center justify-center gap-2 ${isLimitReached ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                              <Clock className="w-4 h-4 text-white" /> {showSchedulePicker ? 'Confirmar' : 'Agendar'}
                            </button>
                            <button type="button" disabled={creatingWpPost} onClick={() => handleCreateWpPostWithAction('publish')} className="w-full sm:w-auto bg-[#DFFF00] hover:bg-[#cbf000] text-black font-bold px-7 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                              <Sparkles className="w-4 h-4 text-black" /> {creatingWpPost ? 'Salvando...' : 'Publicar'}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {wpModalStep === 5 && (</div>)}
                    </form>
                  </div>
                </div>
                )}"""
        
        content = re.sub(botoes_regex, stepper_footer, content, flags=re.DOTALL)

    # 5. Adicionar o Popup de Sucesso após o modal
    if 'wpSuccessPopup.show' not in content:
        success_popup = """
                {/* Popup de Sucesso Personalizado */}
                {wpSuccessPopup.show && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-10 w-full max-w-md flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
                      <button onClick={() => setWpSuccessPopup({show: false, postId: null, postUrl: null, message: ''})} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                        <div className="w-12 h-12 rounded-full border-[3px] border-blue-500 flex items-center justify-center">
                          <span className="text-blue-500 font-bold text-2xl lowercase font-serif">i</span>
                        </div>
                      </div>
                      
                      <h3 className="text-gray-700 font-medium text-lg mb-8">{wpSuccessPopup.message}</h3>
                      
                      <div className="w-full space-y-3">
                        {wpSuccessPopup.postUrl && (
                          <a href={wpSuccessPopup.postUrl} target="_blank" rel="noopener noreferrer" className="w-full block bg-[#9b3bff] hover:bg-[#8b2bef] text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95">
                            Ver sua postagem
                          </a>
                        )}
                        <button onClick={() => setWpSuccessPopup({show: false, postId: null, postUrl: null, message: ''})} className="w-full py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors">
                          Voltar para Blog
                        </button>
                      </div>
                    </div>
                  </div>
                )}
"""
        # Inserir após o Modal Principal
        content = re.sub(
            r'(</form>\s*</div>\s*</div>\s*)\)}',
            r'\1)}\n' + success_popup,
            content
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


# Executar para ambos os arquivos
update_file(r'C:\\Espaço de Trabalho\\JuriPages\\Projetos\\CRM - SITE\\src\\app\\dashboard\\sites\\[id]\\SiteDashboardClient.tsx')
update_file(r'C:\\Espaço de Trabalho\\JuriPages\\Projetos\\CRM - SITE\\src\\app\\dashboard\\meus-sites\\[id]\\SiteReportTabs.tsx')

print("Modificações aplicadas com sucesso.")
