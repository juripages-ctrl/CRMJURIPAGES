import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testGSC() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: config } = await supabase.from('configuracoes_agencia').select('gsc_refresh_token').eq('id', 1).single()
  
  if (!config || !config.gsc_refresh_token) {
    console.log("No refresh token found in database.")
    return
  }
  
  console.log("Refresh token found. Exchanging for access token...")

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    console.log("Missing Google Client ID or Secret in environment.")
    return
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: config.gsc_refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  
  const tokenData = await tokenRes.json()
  
  if (tokenData.error) {
    console.log("Error refreshing token:", tokenData)
    return
  }

  const accessToken = tokenData.access_token
  console.log("Access token received. Fetching sites...")

  const sitesRes = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })
  
  const sitesData = await sitesRes.json()
  console.log("GSC Sites response:")
  console.log(JSON.stringify(sitesData, null, 2))
}

testGSC()
