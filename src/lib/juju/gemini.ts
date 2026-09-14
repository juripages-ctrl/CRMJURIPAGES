// src/lib/juju/gemini.ts

export type Role = 'user' | 'model' | 'system';

export interface ChatMessage {
  role: Role;
  text: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

export async function chatWithJuju(
  messages: ChatMessage[],
  systemInstruction?: string,
  responseSchema?: any // Para forçar JSON estruturado (ex: extração de nicho)
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { text: '', error: 'Chave da API do Gemini (GEMINI_API_KEY) não configurada no servidor.' };
  }

  // Modelo oficial principal
  const modelos = ['gemini-3.6-flash'];
  
  // Converter formato interno para formato do Gemini
  const contents: GeminiContent[] = messages
    .filter((msg) => msg.role !== 'system') // System passa separado no v1beta
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature: 0.7, // Criatividade controlada
    }
  };

  // Se houver prompt de sistema (Juju Persona + Área do Direito)
  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  // Se houver um schema exigido (ex: extrair JSON do nicho jurídico)
  if (responseSchema) {
    payload.generationConfig.responseMimeType = 'application/json';
    payload.generationConfig.responseSchema = responseSchema;
  }

  let lastError = 'Nenhum erro registrado';

  for (const model of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          return { text: '', error: 'Ops! O limite da cota gratuita da Inteligência Artificial foi atingido ou você está fazendo requisições muito rápido. Por favor, aguarde alguns minutos ou atualize seu plano.' };
        }

        // Se for erro de demanda (503)
        if (res.status === 503) {
          console.warn(`Modelo ${model} indisponível (${res.status}), tentando o próximo...`);
          lastError = data.error?.message || `Erro ${res.status}`;
          continue; 
        }
        console.error(`Erro na API Gemini (${model}):`, data);
        return { text: '', error: 'Ops, tive um problema ao processar seu pedido. Meu sistema de IA pode estar passando por atualizações. Tente novamente em alguns segundos!' };
      }

      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text: outputText };
      
    } catch (error: any) {
      console.error(`Falha na rede com modelo ${model}:`, error);
      // Continua para o próximo modelo em caso de falha de timeout/rede
      lastError = error.message;
    }
  }

  return { text: '', error: `Ops, tive um problema ao tentar processar seu pedido. Meu sistema de IA pode estar em manutenção. Tente novamente em alguns segundos! (Log: ${lastError})` };
}
