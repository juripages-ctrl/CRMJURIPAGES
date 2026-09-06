const key1 = 'AIzaSyAoIfOS53g_OVlEyMtnDqb4pr4OKbGgXw8';
const key2 = 'AIzaSyAoIfOS53g_OVIEyMtnDqb4pr4OKbGgXw8';
const url = 'https://drdotrabalhador.com.br';

async function testKey(key, name) {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${key}`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    if(data.error) {
      console.log(name, 'Error:', data.error.message);
    } else {
      console.log(name, 'Success! Score:', data.lighthouseResult.categories.performance.score);
    }
  } catch(e) {
    console.log(name, 'Fetch error:', e.message);
  }
}

async function run() {
  await testKey(key1, 'Key 1 (l lowercase)');
  await testKey(key2, 'Key 2 (I uppercase)');
  await testKey('', 'No Key');
}

run();
