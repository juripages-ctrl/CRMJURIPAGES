import os

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\integrations-actions.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

update_func = """
export async function updateWpPost(siteUrl: string, username: string, appPassword: string, postId: number | string, postData: any) {
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  try {
    const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${postId}`, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
    
    if (!res.ok) {
      const err = await res.json()
      return { error: err.message || 'Falha ao atualizar post' }
    }
    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    return { error: 'Falha de rede ao atualizar post' }
  }
}
"""

if "export async function updateWpPost" not in content:
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(update_func)
    print("Added updateWpPost!")
else:
    print("Already exists.")
