const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

let url = ''
let key = ''

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = line.split('=')[1].trim().replace(/['"]/g, '')
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    key = line.split('=')[1].trim().replace(/['"]/g, '')
  }
})

if (!key) {
  envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      key = line.split('=')[1].trim().replace(/['"]/g, '')
    }
  })
}

async function checkRenata() {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(url, key)

  const { data: cliente } = await supabase.from('clientes').select('*, sites(*), assinaturas(*, planos(*))').ilike('nome', '%Renata%')
  console.log('Cliente Renata:', JSON.stringify(cliente, null, 2))
}

checkRenata()
