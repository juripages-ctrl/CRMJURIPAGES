import os

def fix_date_logic(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    old_payload_block = """    const postPayload: any = {
      title: wpNewPost.title,
      content: wpNewPost.content,
      status: wpNewPost.scheduledDate ? 'future' : wpNewPost.status
    }

    if (wpNewPost.scheduledDate) {
      const d = new Date(wpNewPost.scheduledDate)
      postPayload.date = d.toISOString()
    }"""

    new_payload_block = """    const targetDate = wpNewPost.scheduledDate ? new Date(wpNewPost.scheduledDate) : null
    const isFutureDate = targetDate ? targetDate.getTime() > (Date.now() + 60000) : false

    let finalStatus = wpNewPost.status
    if (isFutureDate) {
      finalStatus = 'future'
    } else if (finalStatus === 'future') {
      finalStatus = 'publish'
    }

    const postPayload: any = {
      title: wpNewPost.title,
      content: wpNewPost.content,
      status: finalStatus
    }

    if (wpNewPost.scheduledDate) {
      const formattedLocalDate = wpNewPost.scheduledDate.length === 16 ? `${wpNewPost.scheduledDate}:00` : wpNewPost.scheduledDate
      postPayload.date = formattedLocalDate
      
      const gmtDate = new Date(wpNewPost.scheduledDate)
      if (!isNaN(gmtDate.getTime())) {
        postPayload.date_gmt = gmtDate.toISOString()
      }
    }"""

    if old_payload_block in content:
        content = content.replace(old_payload_block, new_payload_block)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully fixed date logic in {filepath}")
    else:
        print(f"Could not find target block in {filepath}")

fix_date_logic(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\sites\[id]\SiteDashboardClient.tsx")
fix_date_logic(r"c:\Espaço de Trabalho\JuriPages\Projetos\CRM - SITE\src\app\dashboard\meus-sites\[id]\SiteReportTabs.tsx")
