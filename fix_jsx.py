import re

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the JSX ternary true branch to include <> and </>
# Find: {hasGsc ? (\n            <div className="bg-gradient-to-br from-white to-[#F6F6F6]
target_start = '          {hasGsc ? (\n            <div className="bg-gradient-to-br from-white to-[#F6F6F6]'
replacement_start = '          {hasGsc ? (\n            <>\n              <div className="bg-gradient-to-br from-white to-[#F6F6F6]'

content = content.replace(target_start, replacement_start)

target_end = """              </div>
            )}
          ) : ("""

replacement_end = """              </div>
            )}
            </>
          ) : ("""

content = content.replace(target_end, replacement_end)

with open(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("JSX fixed")
