import re

def update_site_dashboard_client():
    filepath = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add import for getBlogPlanPermissions and icons
    if "getBlogPlanPermissions" not in content:
        content = content.replace(
            "import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker'",
            "import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker'\nimport { getBlogPlanPermissions } from '@/utils/plan-permissions'\nimport { Lock, ShieldAlert, AlertTriangle } from 'lucide-react'"
        )

    # 2. Add count check in handleCreateWpPostWithAction
    old_schedule_check = """if (action === 'schedule' && !wpNewPost.scheduledDate) {
      alert('Por favor, selecione a data e hora no calendário para agendar a publicação.')
      return
    }"""

    new_schedule_check = """if (action === 'schedule') {
      if (!wpNewPost.scheduledDate) {
        alert('Por favor, selecione a data e hora no calendário para agendar a publicação.')
        return
      }

      const permissions = getBlogPlanPermissions(site)
      if (permissions.tier === 'profissional') {
        const currM = new Date().getMonth()
        const currY = new Date().getFullYear()
        const countThisMonth = wpPosts.filter((p: any) => {
          if (!p.date) return false
          const isSched = p.status === 'future' || new Date(p.date) > new Date()
          if (!isSched) return false
          const d = new Date(p.date)
          return d.getMonth() === currM && d.getFullYear() === currY
        }).length

        if (countThisMonth >= 6) {
          alert('Limite mensal de 6 agendamentos atingido para o Plano Profissional! Faça upgrade para o Plano Premium para agendar postagens ilimitadas.')
          return
        }
      }
    }"""

    content = content.replace(old_schedule_check, new_schedule_check)

    # 3. Replace the Blog Tab block in SiteDashboardClient.tsx
    tab_blog_start = content.find("{/* Tab: Blog */}")
    tab_speed_start = content.find("{/* SPEED INSIGHTS */}")

    blog_block_end = content.find("activeTab === 'speed'", tab_blog_start)
    if blog_block_end != -1:
      blog_block_end = content.rfind("}", 0, blog_block_end)

    new_blog_tab_jsx = """{/* Tab: Blog */}
      {activeTab === 'blog' && (
        <div className="space-y-8">
          {(() => {
            const permissions = getBlogPlanPermissions(site)
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()

            const scheduledThisMonthCount = wpPosts.filter((p: any) => {
              if (!p.date) return false
              const isSched = p.status === 'future' || new Date(p.date) > new Date()
              if (!isSched) return false
              const d = new Date(p.date)
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear
            }).length

            const isProfissional = permissions.tier === 'profissional'
            const isLimitReached = isProfissional && scheduledThisMonthCount >= 6

            if (!permissions.hasBlogAccess) {
              if (permissions.reason === 'payment_pending') {
                return (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-[2.5rem] p-10 md:p-12 text-center max-w-2xl mx-auto shadow-sm">
                    <ShieldAlert className="w-14 h-14 text-amber-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Acesso Temporariamente Suspenso</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Este cliente possui uma pendência ou atraso no pagamento do plano. O gerenciamento e agendamento de postagens do Blog estão bloqueados temporariamente.
                    </p>
                    <Button onClick={() => setActiveTab('geral')} className="bg-black text-white rounded-full px-6 py-3">
                      Ver Status Geral / Financeiro
                    </Button>
                  </div>
                )
              }

              return (
                <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-10 md:p-12 text-center max-w-2xl mx-auto shadow-xl relative overflow-hidden border border-white/10">
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#DFFF00]/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-md">
                      <Lock className="w-8 h-8 text-[#DFFF00]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      Blog Indisponível no {permissions.label}
                    </h3>
                    <p className="text-sm text-gray-300 mb-8 leading-relaxed max-w-md mx-auto">
                      O gerenciamento e agendamento de postagens no WordPress é exclusivo dos planos <strong className="text-white">Profissional</strong> (até 6 posts/mês) e <strong className="text-white">Premium</strong> (ilimitado).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                        <span className="text-xs font-semibold text-[#DFFF00] uppercase">Plano Profissional</span>
                        <p className="text-sm font-bold text-white mt-1">Até 6 posts agendados / mês</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                        <span className="text-xs font-semibold text-[#DFFF00] uppercase">Plano Premium</span>
                        <p className="text-sm font-bold text-white mt-1">Agendamentos Ilimitados</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div className="space-y-8">
                {/* Enterprise Hero Banner */}
                <div className="bg-gradient-to-br from-gray-900 via-black to-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/10">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#DFFF00]/15 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/10">
                          <Sparkles className="w-3.5 h-3.5 text-[#DFFF00]" /> Gestão de Conteúdo & Marketing
                        </div>

                        {/* Plan & Schedule Counter Badge */}
                        {permissions.tier === 'profissional' ? (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isLimitReached ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                          }`}>
                            <Calendar className="w-3.5 h-3.5" /> Agendamentos este mês: {scheduledThisMonthCount} de 6
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFFF00]/20 text-[#DFFF00] text-xs font-bold border border-[#DFFF00]/30">
                            <Sparkles className="w-3.5 h-3.5" /> Agendamentos Ilimitados ({permissions.label})
                          </div>
                        )}
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

                      {/* Imagem de Capa (Com Prévia Instantânea Completa) */}
                      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-gray-600" />
                          <span>Imagem de Capa (Destacada)</span>
                        </label>
                        
                        {(imagePreviewUrl || currentCoverUrl) && (
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
                            
                            <div className="w-full bg-gray-100/80 border border-gray-200/60 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[160px] max-h-[300px]">
                              <img 
                                src={imagePreviewUrl || currentCoverUrl || ''} 
                                alt="Prévia Completa da Capa" 
                                className="w-full max-h-[280px] object-contain rounded-lg shadow-xs" 
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
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                        />
                      </div>

                      {/* Data e Hora de Agendamento (Condicional) */}
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

                      {/* Warning Banner if Limit Reached for Profissional Plan */}
                      {isLimitReached && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div>
                            <strong className="font-bold block text-amber-900">Limite Mensal de Agendamentos Atingido ({scheduledThisMonthCount} de 6)</strong>
                            <span>Este plano (Profissional) atingiu o limite de 6 postagens agendadas para este mês.</span>
                          </div>
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
                            disabled={creatingWpPost || isLimitReached}
                            onClick={() => {
                              if (isLimitReached) {
                                alert('Limite de 6 agendamentos mensais atingido para o Plano Profissional.')
                                return
                              }
                              if (!showSchedulePicker) {
                                setShowSchedulePicker(true)
                              } else {
                                handleCreateWpPostWithAction('schedule')
                              }
                            }}
                            className={`w-full sm:w-auto font-bold px-6 py-3.5 rounded-full shadow-lg transition-all text-sm flex items-center justify-center gap-2 ${
                              isLimitReached 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-none shadow-none' 
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 active:scale-95'
                            }`}
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

                            <div className="absolute top-4 left-4">
                              <Badge 
                                className={
                                  post.status === 'publish' 
                                    ? 'bg-emerald-500 text-white font-bold rounded-full px-3 py-1 text-[11px] shadow-md border-none flex items-center gap-1.5' 
                                    : isScheduled
                                    ? 'bg-blue-600 text-white font-bold rounded-full px-3 py-1 text-[11px] shadow-md border-none flex items-center gap-1.5'
                                    : 'bg-gray-900/80 backdrop-blur-md text-white font-bold rounded-full px-3 py-1 text-[11px] border-none flex items-center gap-1.5'
                                }
                              >
                                {post.status === 'publish' ? (
                                  <><CheckCircle2 className="w-3 h-3 text-white" /> Publicado</>
                                ) : isScheduled ? (
                                  <><Clock className="w-3 h-3 text-white" /> Agendado</>
                                ) : (
                                  <><FileText className="w-3 h-3 text-amber-300" /> Rascunho</>
                                )}
                              </Badge>
                            </div>
                          </div>

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
            )
          })()}
        </div>
      )}"""

    if tab_blog_start != -1 and blog_block_end != -1:
      content = content[:tab_blog_start] + new_blog_tab_jsx + "\n\n      " + content[blog_block_end:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath} with plan permissions gating & counter.")

update_site_dashboard_client()
