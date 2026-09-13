import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update imports
    if 'fetchWpCategories' not in content:
        content = re.sub(
            r'(uploadWpMedia, updateWpPost, deleteWpPost)',
            r'\1, fetchWpCategories, fetchWpTags, createWpCategory, createWpTag',
            content
        )

    # 2. Add states for categories and tags
    if 'const [wpCategories' not in content:
        states_block = """  const [wpCategories, setWpCategories] = useState<any[]>([])
  const [wpTags, setWpTags] = useState<any[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  """
        content = re.sub(
            r'(const \[loadingWp, setLoadingWp\] = useState\(false\))',
            r'\1\n' + states_block,
            content
        )

    # 3. Update wpNewPost state definition
    if 'categories: number[]' not in content:
        content = re.sub(
            r'const \[wpNewPost, setWpNewPost\] = useState<\{ title: string; content: string; status: string; scheduledDate: string; imageFile: File \| null \}>\(\{ title: \'\', content: \'\', status: \'publish\', scheduledDate: \'\', imageFile: null \}\)',
            r"const [wpNewPost, setWpNewPost] = useState<{ title: string; content: string; status: string; scheduledDate: string; imageFile: File | null; categories: number[]; tags: number[] }>({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null, categories: [], tags: [] })",
            content
        )

    # 4. Update loadWpData
    if 'fetchWpCategories' not in content[content.find('async function loadWpData'):]:
        load_wp_data_injection = """
    const catRes = await fetchWpCategories(site.id, wp.site_url, wp.username, wp.app_password, forceRefresh)
    if (catRes.success) setWpCategories(catRes.data)

    const tagRes = await fetchWpTags(site.id, wp.site_url, wp.username, wp.app_password, forceRefresh)
    if (tagRes.success) setWpTags(tagRes.data)
"""
        content = re.sub(
            r'(const wfRes = await fetchWpWordfenceData.*?setLoadingWp\(false\))',
            r'\1' + load_wp_data_injection,
            content,
            flags=re.DOTALL
        )

    # 5. Update handleEditPost
    if 'categories: post.categories' not in content:
        content = re.sub(
            r'scheduledDate,\n\s*imageFile: null\n\s*\}\)',
            r"scheduledDate,\n      imageFile: null,\n      categories: post.categories || [],\n      tags: post.tags || []\n    })",
            content
        )

    # 6. Remove HTML injection in handleCreateWpPostWithAction
    if 'let finalContent = wpNewPost.content || \'\'' in content:
        # We find the block that embeds the featured image and replace it with just: let finalContent = wpNewPost.content || ''
        content = re.sub(
            r'// Embed Featured Image into post content body.*?}\n\n',
            r'',
            content,
            flags=re.DOTALL
        )

    # 7. Add categories and tags to postPayload
    if 'postPayload.categories = wpNewPost.categories' not in content:
        content = re.sub(
            r'(const postPayload: any = \{.*?\n\s*status: finalStatus\n\s*\})',
            r'\1\n\n    if (wpNewPost.categories.length > 0) postPayload.categories = wpNewPost.categories\n    if (wpNewPost.tags.length > 0) postPayload.tags = wpNewPost.tags',
            content,
            flags=re.DOTALL
        )

    # 8. Reset state on success
    content = re.sub(
        r"setWpNewPost\(\{ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null \}\)",
        r"setWpNewPost({ title: '', content: '', status: 'publish', scheduledDate: '', imageFile: null, categories: [], tags: [] })",
        content
    )

    # 9. Add UI for categories and tags inside the modal
    # We find where the image upload is and add it below
    if 'Categorias' not in content[content.find('<!-- Modal Form -->'):] and 'Categorias' not in content:
        ui_injection = """
                      {/* Categorias e Tags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-700">Categorias</label>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                            {wpCategories.map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  const cats = wpNewPost.categories;
                                  setWpNewPost({ ...wpNewPost, categories: cats.includes(cat.id) ? cats.filter(c => c !== cat.id) : [...cats, cat.id] });
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${wpNewPost.categories.includes(cat.id) ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-100'}`}
                              >
                                {cat.name}
                              </button>
                            ))}
                            {wpCategories.length === 0 && <span className="text-xs text-gray-400">Nenhuma categoria encontrada</span>}
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Nova Categoria..." 
                              value={newCategoryName} 
                              onChange={e => setNewCategoryName(e.target.value)} 
                              className="text-xs h-8"
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              className="h-8 text-xs whitespace-nowrap"
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
                              {isCreatingCategory ? '...' : 'Adicionar'}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-gray-700">Tags</label>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                            {wpTags.map(tag => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  const tags = wpNewPost.tags;
                                  setWpNewPost({ ...wpNewPost, tags: tags.includes(tag.id) ? tags.filter(t => t !== tag.id) : [...tags, tag.id] });
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${wpNewPost.tags.includes(tag.id) ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-100'}`}
                              >
                                {tag.name}
                              </button>
                            ))}
                            {wpTags.length === 0 && <span className="text-xs text-gray-400">Nenhuma tag encontrada</span>}
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Nova Tag..." 
                              value={newTagName} 
                              onChange={e => setNewTagName(e.target.value)} 
                              className="text-xs h-8"
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              className="h-8 text-xs whitespace-nowrap"
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
                              {isCreatingTag ? '...' : 'Adicionar'}
                            </Button>
                          </div>
                        </div>
                      </div>
"""
        # Find the image picker and inject below it
        content = re.sub(
            r'(<label className="block text-sm font-semibold text-gray-700 mb-2">\s*Imagem de Capa.*?</div>\s*</div>)',
            r'\1\n' + ui_injection,
            content,
            flags=re.DOTALL
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


# Update agency client
update_file(r'C:\\Espaço de Trabalho\\JuriPages\\Projetos\\CRM - SITE\\src\\app\\dashboard\\sites\\[id]\\SiteDashboardClient.tsx')

# Update user client
update_file(r'C:\\Espaço de Trabalho\\JuriPages\\Projetos\\CRM - SITE\\src\\app\\dashboard\\meus-sites\\[id]\\SiteReportTabs.tsx')

print("Update complete")
