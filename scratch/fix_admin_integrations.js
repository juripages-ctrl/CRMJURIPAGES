const fs = require('fs');
const path = require('path');

const file = path.resolve('c:/Espaço de Trabalho/JuriPages/Projetos/CRM - SITE/src/app/dashboard/sites/[id]/SiteDashboardClient.tsx');
let content = fs.readFileSync(file, 'utf8');

// The blocks in Integrações Técnicas are marked with comments. We can remove them.
content = content.replace(/\{\/\* Google Tag Manager Status Card \*\/\}[\s\S]*?(?=\{\/\* Hosting Integration Card \*\/\}|\{\/\* Tab: Historico \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');
content = content.replace(/\{\/\* Cloudflare Integration Card \*\/\}[\s\S]*?(?=\{\/\* Hosting Integration Card \*\/\}|\{\/\* Tab: Historico \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');
content = content.replace(/\{\/\* GA4 Status Card \*\/\}[\s\S]*?(?=\{\/\* Hosting Integration Card \*\/\}|\{\/\* Tab: Historico \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');
content = content.replace(/\{\/\* Clarity Integration Card \*\/\}[\s\S]*?(?=\{\/\* Hosting Integration Card \*\/\}|\{\/\* Tab: Historico \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SiteDashboardClient.tsx integration cards!');
