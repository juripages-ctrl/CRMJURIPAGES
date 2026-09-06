import os

# Python script to fix WP post scheduling and add post deletion to SiteReportTabs.tsx & SiteDashboardClient.tsx

def apply_fixes(file_path, is_client_dashboard=False):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Imports: Ensure deleteWpPost and Trash2 are imported
    if "deleteWpPost" not in content:
        content = content.replace("updateWpPost", "updateWpPost, deleteWpPost")

    if "Trash2" not in content:
        content = content.replace("import { Activity,", "import { Activity, Trash2,")

    # 2. Add deletingPostId state if missing
    if "deletingPostId" not in content:
        content = content.replace(
            "const [creatingWpPost, setCreatingWpPost] = useState(false)",
            "const [creatingWpPost, setCreatingWpPost] = useState(false)\n  const [deletingPostId, setDeletingPostId] = useState<number | null>(null)"
        )

    # 3. Add handleDeletePost function if missing
    if "async function handleDeletePost" not in content:
        handle_delete_fn = """  async function handleDeletePost(postId: number) {
    const wpObj = """ + ("""(propsWp || site?.integracoes_wordpress?.[0])""" if is_client_dashboard else """site?.integracoes_wordpress?.[0]""") + """
    if (!wpObj) return
    if (!confirm('Deseja realmente excluir esta postagem? Esta ação não pode ser desfeita.')) return

    setDeletingPostId(postId)
    const res = await deleteWpPost(wpObj.site_url, wpObj.username, wpObj.app_password, postId)
    if (res.success) {
      alert('Postagem excluída com sucesso!')
      loadWpData()
    } else {
      alert('Erro ao excluir postagem: ' + res.error)
    }
    setDeletingPostId(null)
  }\n\n"""
        content = content.replace("  async function handleCreateWpPostWithAction", handle_delete_fn + "  async function handleCreateWpPostWithAction")

    # 4. Fix scheduling date logic inside handleCreateWpPostWithAction
    old_sched_block = """    if (action === 'schedule' && wpNewPost.scheduledDate) {
      const formattedLocalDate = wpNewPost.scheduledDate.length === 16 ? `${wpNewPost.scheduledDate}:00` : wpNewPost.scheduledDate
      postPayload.date = formattedLocalDate
      
      const gmtDate = new Date(wpNewPost.scheduledDate)
      if (!isNaN(gmtDate.getTime())) {
        postPayload.date_gmt = gmtDate.toISOString()
      }
    }"""

    new_sched_block = """    if (action === 'schedule' && wpNewPost.scheduledDate) {
      const formattedLocalDate = wpNewPost.scheduledDate.length === 16 ? `${wpNewPost.scheduledDate}:00` : wpNewPost.scheduledDate
      postPayload.status = 'future'
      postPayload.date = formattedLocalDate
      delete postPayload.date_gmt
    }"""

    if old_sched_block in content:
        content = content.replace(old_sched_block, new_sched_block)

    # 5. Add Delete button on Post Cards in JSX
    old_card_actions = """                          {post.link && (
                            <a 
                              href={post.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="mt-4 text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                            >
                              Ver post no site <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}"""

    new_card_actions = """                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditPost(post)}
                              className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </button>

                            {post.link && (
                              <a 
                                href={post.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                              >
                                Ver <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              type="button"
                              disabled={deletingPostId === post.id}
                              onClick={() => handleDeletePost(post.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> {deletingPostId === post.id ? 'Excluindo...' : 'Excluir'}
                            </button>
                          </div>"""

    if old_card_actions in content:
        content = content.replace(old_card_actions, new_card_actions)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Applied scheduling fix & delete button to {file_path}")

report_file = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"
client_file = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx"

apply_fixes(report_file, is_client_dashboard=False)
apply_fixes(client_file, is_client_dashboard=True)
