import os

filepath = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\integrations-actions.ts"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

cut_index = -1
for i, line in enumerate(lines):
    if "body: JSON.stringify(postData)" in line:
        cut_index = i
        break

if cut_index != -1:
    new_lines = lines[:cut_index + 1]
    new_lines.append("    })\n")
    new_lines.append("    \n")
    new_lines.append("    if (!res.ok) {\n")
    new_lines.append("      const err = await res.json()\n")
    new_lines.append("      return { error: err.message || 'Falha ao criar post' }\n")
    new_lines.append("    }\n")
    new_lines.append("    const data = await res.json()\n")
    new_lines.append("    return { success: true, data }\n")
    new_lines.append("  } catch (error) {\n")
    new_lines.append("    return { error: 'Falha de rede ao criar post' }\n")
    new_lines.append("  }\n")
    new_lines.append("}\n\n")

    new_lines.append("export async function fetchWpHistory(siteUrl: string, username: string, appPassword: string) {\n")
    new_lines.append("  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')\n")
    new_lines.append("  try {\n")
    new_lines.append("    const res = await fetch(`${siteUrl}/wp-json/simple-history/v1/events?per_page=20`, {\n")
    new_lines.append("      headers: { 'Authorization': authHeader },\n")
    new_lines.append("      cache: 'no-store'\n")
    new_lines.append("    })\n")
    new_lines.append("    if (!res.ok) return { error: 'Simple History não encontrado ou erro na API', status: res.status }\n")
    new_lines.append("    const data = await res.json()\n")
    new_lines.append("    return { success: true, data }\n")
    new_lines.append("  } catch (error) {\n")
    new_lines.append("    return { error: 'Falha de rede ao buscar histórico' }\n")
    new_lines.append("  }\n")
    new_lines.append("}\n\n")

    new_lines.append("export async function fetchWpWordfenceData(siteUrl: string, username: string, appPassword: string) {\n")
    new_lines.append("  const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64')\n")
    new_lines.append("  try {\n")
    new_lines.append("    const res = await fetch(`${siteUrl}/wp-json/crm-api/v1/wordfence`, {\n")
    new_lines.append("      headers: { 'Authorization': authHeader },\n")
    new_lines.append("      cache: 'no-store'\n")
    new_lines.append("    })\n")
    new_lines.append("    if (!res.ok) return { error: 'Wordfence endpoint não encontrado ou erro na API', status: res.status }\n")
    new_lines.append("    const data = await res.json()\n")
    new_lines.append("    return { success: true, data }\n")
    new_lines.append("  } catch (error) {\n")
    new_lines.append("    return { error: 'Falha de rede ao buscar Wordfence' }\n")
    new_lines.append("  }\n")
    new_lines.append("}\n")

    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Fixed!")
else:
    print("Could not find cut point.")
