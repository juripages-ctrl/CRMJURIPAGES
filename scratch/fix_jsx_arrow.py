import os

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("<ArrowUpRight, Pencil", "<ArrowUpRight")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed JSX ArrowUpRight tags!")
