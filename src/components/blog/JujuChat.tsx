'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles, Image as ImageIcon, FileText, AlertTriangle, Plus, Check } from 'lucide-react';
import { processarMensagemJuju, iniciarConversaJuju, createCategoryOrTagAction, getRoteiroByIdAction, publicarNoWordPress } from '@/app/dashboard/blog/juju-actions';
import RoteiroPreviewPanel from '@/components/blog/RoteiroPreviewPanel';
import { CheckCircle2 } from 'lucide-react';
import { JUJU_THEME } from '@/lib/juju/theme';

import { ArrowLeft } from 'lucide-react'; // Lembrete de adicionar ArrowLeft aos imports

export default function JujuChat({ siteId, siteName, onBack }: { siteId: string; siteName?: string; onBack?: () => void }) {
  const [messages, setMessages] = useState<{ role: string; text: string; optionsType?: string; options?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [roteiroFinalizadoId, setRoteiroFinalizadoId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isCreatingOption, setIsCreatingOption] = useState<'category' | 'tag' | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [creatingOptionStatus, setCreatingOptionStatus] = useState(false);
  const [roteiroPreviewData, setRoteiroPreviewData] = useState<any>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function startChat() {
      try {
        setIsLoading(true);
        setErrorDetails(null);
        const { conversa } = await iniciarConversaJuju(siteId);
        setConversaId(conversa.id);
        setMessages(conversa.historico_mensagens);
        if (conversa.contexto_coletado?.fase >= 6) {
          setRoteiroFinalizadoId(conversa.roteiro_id);
        }
      } catch (err: any) {
        setMessages([{ role: 'model', text: 'Ocorreu um erro ao inicializar a conversa. Tente novamente mais tarde.' }]);
        setErrorDetails(err.message || String(err));
      } finally {
        setIsLoading(false);
      }
    }
    startChat();
  }, [siteId]);

  const handleCreateOption = async (type: 'category' | 'tag', msgIdx: number) => {
    if (!newOptionName.trim()) return;
    setCreatingOptionStatus(true);
    const res = await createCategoryOrTagAction(siteId, type, newOptionName);
    
    if (res.success && 'data' in res && res.data) {
      const data = res.data as { id: number, name?: string, nome?: string };
      const newOpt = { id: data.id, nome: data.name || data.nome || newOptionName };
      
      const newMsgs = [...messages];
      if (newMsgs[msgIdx].options) {
        newMsgs[msgIdx].options = [...newMsgs[msgIdx].options, newOpt];
      }
      setMessages(newMsgs);
      setIsCreatingOption(null);
      setNewOptionName('');
      
      if (type === 'category') {
        handleSend(newOpt.nome, { categoriaId: newOpt.id });
      } else {
        setSelectedTags(prev => [...prev, newOpt.id]);
      }
    } else {
      alert("Erro ao criar: " + res.error);
    }
    setCreatingOptionStatus(false);
  };

  const handleSend = async (text: string = input, dadosExtras?: any, hidden: boolean = false) => {
    if ((!text.trim() && !hidden) || !conversaId || isLoading) return;

    if (!hidden) {
      const userMessage = { role: 'user', text };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    
    setIsLoading(true);
    setErrorDetails(null);

    try {
      const { historico, roteiroId, contexto } = await processarMensagemJuju(conversaId, siteId, text, { ...dadosExtras, hidden });
      setMessages(historico);
      if (contexto?.fase >= 6 && roteiroId) {
        setRoteiroFinalizadoId(roteiroId);
      }
    } catch (err: any) {
      if (!hidden) {
        setMessages(prev => [...prev, { role: 'model', text: 'Houve um problema de conexão. Por favor, tente de novo.' }]);
      }
      setErrorDetails(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0 || isLoading) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'model' && lastMsg.optionsType === 'loading_content') {
      handleSend('Iniciando...', { acao: 'gerar_conteudo' }, true);
    }
  }, [messages, isLoading]);

  const handleOpenPreview = async () => {
    if (!roteiroFinalizadoId) return;
    try {
      setIsLoading(true);
      const data = await getRoteiroByIdAction(roteiroFinalizadoId);
      if (data) {
        setRoteiroPreviewData({
          id: data.id,
          titulo: data.titulo || '',
          conteudo: data.conteudo || '',
          imagemUrl: data.imagem_url,
          site_id: data.site_id,
          categoria_wp_id: data.categoria_wp_id
        });
        setShowPreviewPanel(true);
      }
    } catch (e: any) {
      alert("Erro ao carregar roteiro: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (dados: any) => {
    if (!roteiroPreviewData) return;
    try {
      setIsPublishing(true);
      await publicarNoWordPress(roteiroPreviewData.id, dados);
      setShowPreviewPanel(false);
      setShowSuccessPopup(true);
    } catch (err: any) {
      alert(`Erro ao publicar: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] w-full relative bg-transparent">
      
      {/* Header / Botão Voltar (Estilo notificação app) */}
      <div className="w-full max-w-3xl mx-auto px-4 py-4 sticky top-0 z-30 flex items-center justify-between">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Escolher outro site
          </button>
        )}
      </div>

      {/* Area de Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 scroll-smooth w-full max-w-3xl mx-auto flex flex-col">
        
        {/* Welcome Screen / Empty State centralizado */}
        {messages.length === 0 && !isLoading && !errorDetails && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 pb-20">
            <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center mb-6 shadow-lg shadow-black/10">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-gray-900 mb-4">Vamos criar seu post, converse com a Juju</h1>
            {siteName && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm">
                <span className="text-gray-500">Site selecionado:</span>
                <span className="font-semibold text-gray-900">{siteName}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6 pt-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-black text-white'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div 
                className={`max-w-[85%] whitespace-pre-wrap text-base
                  ${msg.role === 'user' ? 'px-5 py-3.5 rounded-[1.5rem] rounded-tr-sm bg-[#F3F4F6] text-gray-900' : 'text-gray-900 py-1 leading-relaxed'}
                `}
              >
                {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
                  part.startsWith('http') ? (
                    <img key={i} src={part} alt="Imagem sugerida pela Juju" className="rounded-xl my-4 w-full max-w-sm object-cover border border-[#EFEFEF] shadow-sm" />
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}

                {/* Renderização das opções interativas APENAS para a última mensagem */}
                {msg.options && msg.role === 'model' && idx === messages.length - 1 && !isLoading && (
                  <div className="mt-5 flex flex-col gap-3">
                    {isCreatingOption ? (
                       <div className="flex gap-2 items-center bg-white p-2.5 rounded-full border border-gray-200 shadow-sm max-w-md">
                         <input 
                           type="text" 
                           autoFocus
                           value={newOptionName} 
                           onChange={e => setNewOptionName(e.target.value)}
                           className="flex-1 text-sm bg-transparent outline-none px-3 text-gray-900"
                           placeholder={isCreatingOption === 'category' ? "Nome da nova categoria..." : "Nome da nova tag..."}
                         />
                         <button 
                           onClick={() => setIsCreatingOption(null)}
                           className="text-xs text-gray-500 hover:text-gray-900 px-2 font-medium"
                         >
                           Cancelar
                         </button>
                         <button 
                           disabled={creatingOptionStatus || !newOptionName.trim()}
                           onClick={() => handleCreateOption(isCreatingOption, idx)}
                           className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50 transition-colors hover:bg-gray-800"
                         >
                           {creatingOptionStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                         </button>
                       </div>
                    ) : (
                       <>
                         <div className="flex flex-wrap gap-2">
                           {msg.options.map((opt: any) => {
                             const isSelected = selectedTags.includes(opt.id);
                             return (
                               <button
                                 key={opt.id}
                                 onClick={() => {
                                   if (msg.optionsType === 'category') {
                                     handleSend(opt.nome, { categoriaId: opt.id });
                                   } else if (msg.optionsType === 'author') {
                                     handleSend(opt.nome, { autorId: opt.id });
                                   } else if (msg.optionsType === 'tags') {
                                     setSelectedTags(prev => 
                                       prev.includes(opt.id) ? prev.filter(id => id !== opt.id) : [...prev, opt.id]
                                     );
                                   }
                                 }}
                                 className={`px-4 py-2 text-sm font-medium rounded-full border transition-all shadow-sm ${
                                   msg.optionsType === 'tags' && isSelected
                                     ? 'bg-black text-white border-black'
                                     : 'bg-white text-gray-700 border-gray-200 hover:border-black hover:bg-gray-50'
                                 }`}
                               >
                                 {opt.nome}
                               </button>
                             );
                           })}
                           
                           {(msg.optionsType === 'category' || msg.optionsType === 'tags') && (
                             <button
                               onClick={() => setIsCreatingOption(msg.optionsType === 'category' ? 'category' : 'tag')}
                               className="px-4 py-2 text-sm font-medium rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-black hover:text-gray-900 transition-all flex items-center gap-1.5"
                             >
                               <Plus className="w-3.5 h-3.5" /> Outra
                             </button>
                           )}
                         </div>

                         {msg.optionsType === 'tags' && (
                           <button
                             onClick={() => {
                               const nomes = selectedTags.map(id => msg.options?.find((o:any) => o.id === id)?.nome).join(', ');
                               handleSend(selectedTags.length > 0 ? nomes : 'Nenhuma tag', { tagsIds: selectedTags });
                             }}
                             className="mt-3 max-w-xs bg-black hover:bg-gray-900 text-white font-medium py-2.5 rounded-full text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                           >
                             <Check className="w-4 h-4" /> Confirmar Tags Selecionadas ({selectedTags.length})
                           </button>
                         )}
                       </>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-black text-white mt-1">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-gray-900 py-1 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-gray-500 text-sm">Juju está escrevendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {errorDetails && (
        <div className="bg-red-50 border-y border-red-200 p-4 max-h-32 overflow-y-auto w-full max-w-3xl mx-auto shadow-inner z-10 mb-4 rounded-xl">
          <div className="flex items-start gap-2 text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold mb-1">Detalhe Técnico do Erro (Copie e me envie):</p>
              <pre className="text-[10px] font-mono whitespace-pre-wrap">{errorDetails}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Input de Mensagem Flutuante (Estilo ChatGPT) */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6]/90 to-transparent pt-10 pb-6 px-4 z-20">
        <div className="max-w-3xl mx-auto w-full">
          {roteiroFinalizadoId ? (
            <div className="p-5 bg-white border border-gray-200 flex items-center justify-between rounded-2xl shadow-lg">
              <div>
                <h3 className="font-medium text-gray-900 tracking-tight">Seu artigo está pronto! 🎉</h3>
                <p className="text-sm text-gray-500">O roteiro foi gerado e salvo com sucesso.</p>
              </div>
              <button
                onClick={handleOpenPreview}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Revisar e Publicar
              </button>
            </div>
          ) : (
            <div className="flex gap-2 items-center bg-white rounded-full shadow-lg border border-gray-200/60 pl-6 pr-2 py-2">
              <input
                type="text"
                className="flex-1 bg-transparent border-0 text-gray-900 text-[15px] focus:outline-none placeholder:text-gray-400 py-2"
                placeholder="Escreva o tema do seu blog..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading || (!conversaId && !errorDetails)}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim() || (!conversaId && !errorDetails)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:bg-black transition-all shadow-sm bg-black hover:bg-gray-800"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer do Editor do Artigo */}
      {showPreviewPanel && roteiroPreviewData && (
        <RoteiroPreviewPanel 
          isOpen={true} 
          onClose={() => setShowPreviewPanel(false)} 
          roteiro={roteiroPreviewData}
          editMode={false}
          onPublish={handlePublish}
        />
      )}

      {/* Loading de Publicação */}
      {isPublishing && (
        <div className="fixed inset-0 z-[60] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-800 font-medium">Publicando no WordPress...</span>
          </div>
        </div>
      )}

      {/* Popup de Sucesso na Publicação */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Sucesso!</h3>
            <p className="text-sm text-slate-600 mb-8 px-2">O post foi publicado com sucesso e a imagem destacada já foi definida no WordPress.</p>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => {
                  setShowSuccessPopup(false);
                  window.location.href = `/dashboard/sites/${siteId}?tab=blog`;
                }} 
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Ir para Aba de Blog
              </button>
              <button 
                onClick={() => {
                  setShowSuccessPopup(false);
                  onBack?.();
                }} 
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Voltar para Galeria
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
