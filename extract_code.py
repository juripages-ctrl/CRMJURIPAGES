import json

out_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\scratch_recovered.txt"
final_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\old_site_report_tabs.txt"

oldest_content = ""
max_length = 0

with open(out_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            # Find steps where I read the file or got its content
            if "content" in data:
                content = data["content"]
                if "SiteReportTabs.tsx" in content and "function SiteReportTabs" in content:
                    if len(content) > max_length:
                        max_length = len(content)
                        oldest_content = content
        except Exception:
            pass

with open(final_path, "w", encoding="utf-8") as f:
    f.write(oldest_content)
print("Extracted", max_length, "characters")
