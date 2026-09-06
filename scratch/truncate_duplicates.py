with open(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_srt = "".join(lines[:1269])
with open(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx', 'w', encoding='utf-8') as f:
    f.write(clean_srt)
print("Truncated SiteReportTabs.tsx at line 1269")

with open(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx', 'r', encoding='utf-8') as f:
    lines_sdc = f.readlines()

clean_sdc = "".join(lines_sdc[:1471])
with open(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx', 'w', encoding='utf-8') as f:
    f.write(clean_sdc)
print("Truncated SiteDashboardClient.tsx at line 1471")
