import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Revert the bad change at the top
bad_block = """        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
          {part}
        </a>
      )
    }
    
  // Calculations for GSC
  const totalClicks = gscData.reduce((acc, curr) => acc + curr.clicks, 0)
  const avgCtr = gscData.length > 0 ? (gscData.reduce((acc, curr) => acc + parseFloat(curr.ctr), 0) / gscData.length).toFixed(2) : 0
  const avgPosition = gscData.length > 0 ? (gscData.reduce((acc, curr) => acc + parseFloat(curr.position), 0) / gscData.length).toFixed(1) : 0
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
"""

good_block = """        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
          {part}
        </a>
      )
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>
  })
}
"""

content = content.replace(bad_block, good_block)

# Now insert the calculations in the correct place, before the MAIN return of the component
# I will use a regex to find the main return.
# The main return is right after the drill-down state or inside the component logic.
# Wait, let's just find the main return (
main_return_pattern = re.compile(r"(\n\s*)(return \(\n\s*<div className=\"w-full flex flex-col gap-6\">\n\s*\{\/\* Date Filter UI \*\/})")
if "Calculations for GSC" not in content:
    calc_logic = """
  // Calculations for GSC
  const totalClicks = gscData.reduce((acc, curr) => acc + (curr.clicks || 0), 0)
  const avgCtr = gscData.length > 0 ? (gscData.reduce((acc, curr) => acc + parseFloat(curr.ctr || 0), 0) / gscData.length).toFixed(2) : 0
  const avgPosition = gscData.length > 0 ? (gscData.reduce((acc, curr) => acc + parseFloat(curr.position || 0), 0) / gscData.length).toFixed(1) : 0
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
"""
    # Replace the main return with calc_logic + main return
    content = main_return_pattern.sub(r"\1" + calc_logic + r"\2", content)


with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Syntax fixed")
