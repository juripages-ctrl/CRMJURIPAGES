import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function fixDomains() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: sites } = await supabase.from('sites').select('*').like('dominio', 'sc-domain:%')

  if (sites && sites.length > 0) {
    for (const site of sites) {
      const newDomain = site.dominio.replace('sc-domain:', '')
      const newNome = site.nome.replace('sc-domain:', '')
      console.log(`Fixing ${site.dominio} to ${newDomain}`)
      await supabase.from('sites').update({ dominio: newDomain, nome: newNome }).eq('id', site.id)
    }
    console.log("Fixed all domains.")
  } else {
    console.log("No domains to fix.")
  }
}

fixDomains()
