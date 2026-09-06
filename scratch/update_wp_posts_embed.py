import os

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\integrations-actions.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure fetchWpPosts uses _embed=true so featured media is returned
content = content.replace(
    "/wp-json/wp/v2/posts?status=publish,future,draft&per_page=20",
    "/wp-json/wp/v2/posts?status=publish,future,draft&per_page=20&_embed=true"
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated fetchWpPosts with _embed=true!")
