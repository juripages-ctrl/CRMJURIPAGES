with open(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_lines = lines[:1173]
with open(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print("Trimmed SiteDashboardClient.tsx cleanly to line 1173")
