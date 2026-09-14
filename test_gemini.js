const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/GEMINI_API_KEY="(.*)"/);
if (!keyMatch) { console.log('No key'); process.exit(1); }
const key = keyMatch[1].trim();
const payload = {
  contents: [{role: 'user', parts: [{text: 'Hello'}]}]
};

// Test gemini-3.6-flash
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + key, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).then(r => r.json()).then(d => console.log("gemini-3.6-flash:", JSON.stringify(d, null, 2))).catch(console.error);
