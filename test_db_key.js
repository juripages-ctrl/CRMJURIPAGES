require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: config } = await supabase.from('configuracoes_agencia').select('pagespeed_api_key').eq('id', 1).single();
  console.log('Saved Key:', config?.pagespeed_api_key);
  console.log('Length:', config?.pagespeed_api_key?.length);
  
  if (config?.pagespeed_api_key) {
    const key = config.pagespeed_api_key.trim();
    const url = 'https://drdotrabalhador.com.br';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES&key=${key}`;
    
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if(data.error) {
        console.log('API Request Error:', data.error.message);
      } else {
        console.log('API Request Success! Score:', data.lighthouseResult.categories.performance.score);
      }
    } catch(e) {
      console.log('Fetch error:', e.message);
    }
  }
}
run();
