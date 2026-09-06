def clean_file(filepath, end_marker):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the end_marker which is the last closing brace of the component
    idx = content.rfind(end_marker)
    if idx != -1:
        # Check if there is duplicate code appended after idx
        duplicate_idx = content.find("{/* Tab: SEO", idx)
        if duplicate_idx != -1:
            print(f"Found duplicate at {duplicate_idx} in {filepath}, trimming...")
            content = content[:duplicate_idx].rstrip() + "\n    </div>\n  )\n}\n"
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Cleaned {filepath}")
        else:
            print(f"No duplicate SEO tab found after marker in {filepath}")

clean_file(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx', 'export function SiteReportTabs')
clean_file(r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx', 'export function SiteDashboardClient')
