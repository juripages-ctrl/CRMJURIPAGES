// src/lib/juju/theme.ts

export const JUJU_THEME = {
  colors: {
    // Design System Enterprise Analytics — preto grafite, cinza neutro, accent lima
    primary: '#111827', // Grafite escuro (gray-900)
    secondary: '#111827', // Grafite escuro para ícones e destaques
    background: '#F3F4F6', // Fundo claro global (gray-100)
    text: '#111827', // Texto principal
    accent: '#DFFF00', // Verde lima — accent de destaque
    bubbleAgent: '#FFFFFF', // Balão da Juju — branco limpo
    bubbleUser: '#111827', // Balão do usuário — grafite escuro
  },
  avatar: {
    // Configurações do ícone/avatar que vai aparecer no chat
    type: 'icon', // Pode ser 'image' no futuro se desenharem um mascote
    iconName: 'Bot', // Ícone da biblioteca Lucide-react
    fallbackText: 'JJ',
    alt: 'Juju - Assistente de IA'
  }
};
