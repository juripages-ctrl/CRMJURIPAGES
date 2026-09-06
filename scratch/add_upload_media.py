import os

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\integrations-actions.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

upload_func = """
export async function uploadWpMedia(siteUrl: string, username: string, appPassword: string, formData: FormData) {
  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')
  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Nenhum arquivo de imagem válido enviado.' }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const res = await fetch(`${siteUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Type': file.type || 'image/jpeg',
      },
      body: buffer
    })

    if (!res.ok) {
      const err = await res.json()
      return { error: err.message || 'Falha ao enviar imagem para o WordPress.' }
    }

    const data = await res.json()
    return { success: true, mediaId: data.id, mediaUrl: data.source_url }
  } catch (error) {
    return { error: 'Erro de rede ao enviar mídia.' }
  }
}
"""

if "export async function uploadWpMedia" not in content:
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(upload_func)
    print("Added uploadWpMedia!")
else:
    print("Already exists.")
