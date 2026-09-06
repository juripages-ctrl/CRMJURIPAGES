import json

transcript_path = r"c:\Users\User\.gemini\antigravity-ide\brain\b9cb7a31-a6b1-4d26-aaf9-bd5e561e978a\.system_generated\logs\transcript.jsonl"
out_path = r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\scratch_recovered.txt"

with open(transcript_path, "r", encoding="utf-8") as f, open(out_path, "w", encoding="utf-8") as out:
    for line in f:
        if "SiteReportTabs.tsx" in line:
            out.write(line + "\n")
print("Done")
