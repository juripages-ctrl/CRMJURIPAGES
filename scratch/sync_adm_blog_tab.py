import os

# 1. Read SiteReportTabs.tsx
report_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx"
with open(report_path, "r", encoding="utf-8") as f:
    report_content = f.read()

blog_start = "      {/* Tab: Blog */}"
idx_start = report_content.find(blog_start)

# Find the end of activeTab === 'blog' in SiteReportTabs
# In SiteReportTabs, activeTab === 'blog' ends right before the closing </div> of the component
idx_end = report_content.rfind("    </div>\n  )")

blog_block = report_content[idx_start:idx_end].strip()

# 2. Read SiteDashboardClient.tsx
client_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx"
with open(client_path, "r", encoding="utf-8") as f:
    client_content = f.read()

# Make sure wp prop is renamed to propsWp or we alias wp inside component
if "wp: propsWp" not in client_content:
    client_content = client_content.replace(
        "gtm, wp, hosting",
        "gtm, wp: propsWp, hosting"
    )

idx_c_start = client_content.find("      {/* Tab: Blog */}")
idx_c_end = client_content.find("      {/* Tab: Speed */}")

if idx_c_start != -1 and idx_c_end != -1:
    # Adapt blog_block
    adapted_block = blog_block.replace(
        "const wp = site?.integracoes_wordpress?.[0]",
        "const wp = propsWp || site?.integracoes_wordpress?.[0]"
    ).replace(
        "const hasWp = site?.integracoes_wordpress && site.integracoes_wordpress.length > 0",
        "const hasWp = !!propsWp || (site?.integracoes_wordpress && site.integracoes_wordpress.length > 0)"
    )

    client_content = client_content[:idx_c_start] + adapted_block + "\n\n      " + client_content[idx_c_end:]

    with open(client_path, "w", encoding="utf-8") as f:
        f.write(client_content)
    print("Successfully updated SiteDashboardClient.tsx Blog tab!")
