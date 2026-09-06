import os

files_to_fix = [
    r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx",
    r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"
]

for target_file in files_to_fix:
    with open(target_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    in_use_effect = False
    
    for i, line in enumerate(lines):
        if "useEffect(() => {" in line:
            in_use_effect = True
        
        if "}, [" in line and in_use_effect:
            in_use_effect = False

        if "loadWpData()" in line and not in_use_effect:
            if "function loadWpData" not in line:
                lines[i] = line.replace("loadWpData()", "loadWpData(true)")
                
    with open(target_file, 'w', encoding='utf-8') as f:
        f.writelines(lines)

print("Fix applied successfully!")
