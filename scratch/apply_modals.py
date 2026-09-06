import re
import os

files = [
    r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx",
    r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"
]

state_injection = """
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    type: 'alert' | 'confirm' | 'success' | 'error'
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
  }>({ isOpen: false, type: 'alert', message: '' })

  const showAlert = (message: string, type: 'alert' | 'success' | 'error' = 'alert', title?: string) => {
    return new Promise<void>((resolve) => {
      setDialogState({
        isOpen: true,
        type,
        title,
        message,
        confirmText: 'Voltar para Blog',
        onConfirm: () => {
          setDialogState(s => ({ ...s, isOpen: false }))
          resolve()
        }
      })
    })
  }

  const showConfirm = (message: string, title = 'Confirmação') => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm: () => {
          setDialogState(s => ({ ...s, isOpen: false }))
          resolve(true)
        }
      })
    })
  }
"""

modal_injection = """
      <GlobalDialog
        {...dialogState}
        onClose={() => setDialogState(s => ({ ...s, isOpen: false }))}
      />
"""

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add import if not exists
    if "GlobalDialog" not in content:
        content = re.sub(
            r'(import .*? from "react")',
            r'\1\nimport { GlobalDialog } from "@/components/ui/GlobalDialog"',
            content,
            count=1
        )

    # 2. Add state inside the component
    if "const [dialogState" not in content:
        # find the first useState and insert after it
        content = re.sub(
            r'(const \[.*?\] = useState.*?\n)',
            r'\1' + state_injection,
            content,
            count=1
        )

    # 3. Add the modal at the end of the return statement
    if "<GlobalDialog" not in content:
        content = re.sub(
            r'(</main>|</div>\s*)$',
            modal_injection + r'\n\1',
            content,
            count=1,
            flags=re.MULTILINE
        )

    # 4. Replace confirm
    # if (!confirm(...)) return
    def replace_confirm(m):
        indent = m.group(1)
        msg = m.group(2)
        return f"{indent}const confirmed = await showConfirm({msg})\n{indent}if (!confirmed) return"

    content = re.sub(
        r'([ \t]*)if \(!confirm\((.*?)\)\) return',
        replace_confirm,
        content
    )
    
    # 5. Replace alert
    def replace_alert(m):
        indent = m.group(1)
        msg = m.group(2)
        
        # Determine type based on content
        msg_lower = msg.lower()
        if "sucesso" in msg_lower:
            dtype = "'success'"
        elif "erro" in msg_lower or "falha" in msg_lower or "limite" in msg_lower:
            dtype = "'error'"
        else:
            dtype = "'alert'"
            
        return f"{indent}await showAlert({msg}, {dtype})"

    # Only replace alerts that are solitary or part of a simple block, avoiding inline if(res.error) alert() if it breaks block without braces.
    # We will just replace `alert(...)` with `await showAlert(..., type)`. If it's inline, it might need braces, but let's see.
    # Actually, `if (res.error) alert(res.error)` -> `if (res.error) await showAlert(res.error, 'error')` is valid TS!
    content = re.sub(
        r'([ \t]*)alert\((.*?)\)',
        replace_alert,
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Patch applied to both files!")
