import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\integrations-actions.ts", "r", encoding="utf-8") as f:
    content = f.read()

new_action = """
export async function checkGtmTagOnUrl(url: string, containerId: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const html = await res.text()
    const hasTag = html.includes(containerId)
    return { success: true, hasTag, status: res.status }
  } catch (err) {
    return { error: 'Falha ao acessar a URL', hasTag: false }
  }
}
"""

if "checkGtmTagOnUrl" not in content:
    content += new_action
    with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\integrations-actions.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Action added")
else:
    print("Action already exists")
