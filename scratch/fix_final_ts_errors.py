import re

def fix_integrations_actions():
    path = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\integrations-actions.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace dummy functions with correct signature
    content = content.replace("export async function fetchCloudflareZones() { return { data: [] } }",
                              "export async function fetchCloudflareZones(): Promise<{ data?: any[]; error?: string }> { return { data: [] } }")
    content = content.replace("export async function saveCloudflareIntegration(siteId: string, formData: FormData) { return { success: true } }",
                              "export async function saveCloudflareIntegration(siteId: string, formData: FormData): Promise<{ success?: boolean; error?: string }> { return { success: true } }")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_site_dashboard_client():
    path = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Make sure lucide icons are imported
    old_lucide = "import { Cloud, Search, Server, Clock, Calendar, Image as ImageIcon, CheckCircle2, Unplug, Globe, User, BarChart3, Activity, ArrowUpRight, Pencil, Zap, Sparkles } from 'lucide-react'"
    if old_lucide not in content:
        content = re.sub(r"import \{[^}]*\} from 'lucide-react'", 
                         "import { Cloud, Search, Server, Clock, Calendar, Image as ImageIcon, CheckCircle2, FileText, Unplug, Globe, User, BarChart3, Activity, ArrowUpRight, Pencil, Zap, Sparkles } from 'lucide-react'", content, count=1)

    # In SiteDashboardClient, replace targetWp with wp
    content = content.replace("const targetWp = wp || site?.integracoes_wordpress?.[0]", "")
    content = content.replace("targetWp", "wp")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_site_report_tabs():
    path = r'c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Make sure lucide icons are imported
    content = re.sub(r"import \{[^}]*\} from 'lucide-react'", 
                     "import { Activity, Search, ArrowUpRight, ShieldCheck, Pencil, FileText, Zap, MessageSquare, Globe, Sparkles, Clock, Calendar, Image as ImageIcon, CheckCircle2 } from 'lucide-react'", content, count=1)

    # In SiteReportTabs, define wp = site?.integracoes_wordpress?.[0]
    content = content.replace("const targetWp = site?.integracoes_wordpress?.[0]", "const wp = site?.integracoes_wordpress?.[0]")
    content = content.replace("targetWp", "wp")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_integrations_actions()
fix_site_dashboard_client()
fix_site_report_tabs()

print("Final TS fixes applied successfully.")
