'use client';

import { useState, useEffect, Suspense } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import JujuChat from '@/components/blog/JujuChat';
import { getWordPressSites } from '@/app/dashboard/blog/juju-actions';
import { useSearchParams } from 'next/navigation';

function RoteirosContent() {
  const searchParams = useSearchParams();
  const initialSiteId = searchParams.get('siteId');
  
  const [siteId, setSiteId] = useState<string | null>(initialSiteId);
  const [modo, setModo] = useState<'selecionar_site' | 'ia'>(initialSiteId ? 'ia' : 'selecionar_site');
  const [sitesWp, setSitesWp] = useState<any[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);

  useEffect(() => {
    async function fetchSites() {
      setIsLoadingSites(true);
      const sites = await getWordPressSites();
      setSitesWp(sites);
      setIsLoadingSites(false);
    }
    fetchSites();
  }, []);

  if (modo === 'ia') {
    return (
      <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {siteId ? (
          <JujuChat 
            siteId={siteId} 
            siteName={sitesWp.find(s => s.id === siteId)?.nome || ''} 
            onBack={() => setModo('selecionar_site')} 
          />
        ) : (
          <div className="p-8 max-w-5xl mx-auto">
            <div className="bg-[#F2F2F2] p-8 rounded-[2rem] border border-[#EFEFEF] text-center">
              <p className="text-gray-500">Nenhum site selecionado.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-[26px] font-medium tracking-tight text-gray-900 mb-2">Em qual site vamos publicar?</h2>
        <p className="text-gray-500 text-sm font-medium">A Juju precisa que você escolha um site que já tenha a integração com o WordPress ativa.</p>
      </div>
      
      {isLoadingSites ? (
        <div className="flex flex-col items-center justify-center p-10 mt-10">
          <Loader2 className="w-8 h-8 animate-spin text-[#111827] mb-4" />
          <p className="text-gray-500 font-medium">Buscando seus sites...</p>
        </div>
      ) : sitesWp.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-8 rounded-[2rem] text-center text-sm font-medium">
          Nenhum site com WordPress conectado foi encontrado. Conecte seu blog WordPress nas configurações do site primeiro.
        </div>
      ) : (
        <div className="grid gap-4 mt-8">
          {sitesWp.map(site => (
            <button
              key={site.id}
              onClick={() => { setSiteId(site.id); setModo('ia'); }}
              className="flex items-center p-5 bg-white border border-[#EFEFEF] rounded-[2rem] hover:border-[#111827] hover:shadow-md transition-all text-left group shadow-[0_2px_10px_-7px_rgba(17,24,39,0.10)]"
            >
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] group-hover:bg-[#DFFF00] flex items-center justify-center mr-4 transition-colors">
                <Globe className="w-6 h-6 text-gray-400 group-hover:text-[#111827] transition-colors" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg tracking-tight group-hover:text-[#111827] transition-colors">{site.nome}</h3>
                <p className="text-sm text-gray-500">{site.dominio}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoteirosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando Juju...</div>}>
      <RoteirosContent />
    </Suspense>
  );
}
