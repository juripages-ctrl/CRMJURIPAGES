const fs = require('fs');
const path = require('path');

const file = path.resolve('c:/Espaço de Trabalho/JuriPages/Projetos/CRM - SITE/src/app/dashboard/sites/[id]/SiteDashboardClient.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix activeTab state Type
content = content.replace(
  /useState<'geral' \| 'integracoes' \| 'seo' \| 'rede' \| 'aquisicao' \| 'ux' \| 'rastreamento' \| 'speed'>/g,
  `useState<'geral' | 'integracoes' | 'seo' | 'speed'>`
);

// 2. Remove the navigation buttons
content = content.replace(/<button[^>]*onClick=\{[^}]*setActiveTab\('rede'\)[^>]*>[\s\S]*?<\/button>/g, '');
content = content.replace(/<button[^>]*onClick=\{[^}]*setActiveTab\('aquisicao'\)[^>]*>[\s\S]*?<\/button>/g, '');
content = content.replace(/<button[^>]*onClick=\{[^}]*setActiveTab\('ux'\)[^>]*>[\s\S]*?<\/button>/g, '');
content = content.replace(/<button[^>]*onClick=\{[^}]*setActiveTab\('rastreamento'\)[^>]*>[\s\S]*?<\/button>/g, '');

// 3. Remove the blocks for Rede, Aquisicao, UX, Rastreamento
content = content.replace(/\{\/\* Tab: Rede \*\/\}[\s\S]*?(?=\{\/\* Tab: Aquisição \*\/\}|\{\/\* Tab: UX \*\/\}|\{\/\* SPEED INSIGHTS \*\/\}|\{\/\* Tab: Rastreamento \*\/\}|\{\/\* Integrações Técnicas \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');
content = content.replace(/\{\/\* Tab: Aquisição \*\/\}[\s\S]*?(?=\{\/\* Tab: Rede \*\/\}|\{\/\* Tab: UX \*\/\}|\{\/\* SPEED INSIGHTS \*\/\}|\{\/\* Tab: Rastreamento \*\/\}|\{\/\* Integrações Técnicas \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');
content = content.replace(/\{\/\* Tab: UX \*\/\}[\s\S]*?(?=\{\/\* Tab: Rede \*\/\}|\{\/\* Tab: Aquisição \*\/\}|\{\/\* SPEED INSIGHTS \*\/\}|\{\/\* Tab: Rastreamento \*\/\}|\{\/\* Integrações Técnicas \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');
content = content.replace(/\{\/\* Tab: Rastreamento \*\/\}[\s\S]*?(?=\{\/\* Tab: Rede \*\/\}|\{\/\* Tab: Aquisição \*\/\}|\{\/\* Tab: UX \*\/\}|\{\/\* SPEED INSIGHTS \*\/\}|\{\/\* Integrações Técnicas \*\/\}|\{\/\* Tab: SEO \*\/\}|\{\/\* Tab: Speed \*\/\}|export default)/, '');

// 4. Remove variables like isClarityConnected, isGa4Connected from file content if they exist in state/JSX
content = content.replace(/const isCfConnected = [^\n]*\n/g, '');
content = content.replace(/const isGa4Connected = [^\n]*\n/g, '');
content = content.replace(/const isClarityConnected = [^\n]*\n/g, '');
content = content.replace(/const isGtmConnected = [^\n]*\n/g, '');

// 5. Remove states
content = content.replace(/const \[cfData, setCfData\] = useState<any>\(null\);\n/g, '');
content = content.replace(/const \[ga4Data, setGa4Data\] = useState<any\[\]>\(\[\]\);\n/g, '');
content = content.replace(/const \[clarityMetrics, setClarityMetrics\] = useState<any>\(null\);\n/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed SiteDashboardClient.tsx tabs!');
