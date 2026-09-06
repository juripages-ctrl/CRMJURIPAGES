const fs = require('fs')
const path = require('path')

// Read .env.local
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

async function inspect() {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(url, key)

  const { data: sites, error } = await supabase
    .from('sites')
    .select('*, clientes(*, assinaturas(*, planos(*)))')
    .ilike('dominio', '%drdotrabalhador%')

  console.log('Error:', error)
  console.log('Sites found:', JSON.stringify(sites, null, 2))
}

inspect()
