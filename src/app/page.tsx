"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { HeroDashboardMockup } from "@/components/HeroDashboardMockup"
import { FeatureCarouselSection } from "@/components/FeatureCarouselSection"

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
)

export default function JuriPagesAppLanding() {
  const [period, setPeriod] = useState<"mensal" | "semestral" | "anual">("mensal")

  const heroImageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!heroImageRef.current) return
      
      const scrollY = window.scrollY
      const maxScroll = 400
      const progress = Math.min(scrollY / maxScroll, 1)
      
      // Starts tilted: rotateX(15deg) rotateY(-5deg) scale(0.95)
      // Ends straight: rotateX(0) rotateY(0) scale(1)
      const rotateX = 15 - (15 * progress)
      const rotateY = -5 - (-5 * progress)
      const scale = 0.95 + (0.05 * progress)
      
      heroImageRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // initial call
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const periodLabels = {
    mensal: "/mês",
    semestral: "/6 meses",
    anual: "/ano"
  }

  const prices = {
    essencial: { mensal: "120", semestral: "650", anual: "1150" },
    profissional: { mensal: "220", semestral: "1180", anual: "2100" },
    premium: { mensal: "350", semestral: "1890", anual: "3360" }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

        .page-container {
            background-color: #f8fafc;
            font-family: 'Inter', sans-serif;
            color: #334155;
            overflow-x: hidden;
        }

        .hero {
            padding-top: 180px;
            padding-bottom: 60px;
            text-align: center;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: relative;
        }

        .hero h1 {
            font-family: 'Bricolage Grotesque', sans-serif;
            font-size: 72px;
            font-weight: 400;
            color: #0f172a;
            line-height: 1.1;
            margin-bottom: 0px;
            letter-spacing: -0.02em;
        }

        @media (max-width: 768px) {
            .hero h1 { font-size: 46px; }
        }

        .hero h1 em {
            color: #8b5cf6;
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-weight: 400;
        }

        .hero-subtitle {
            font-size: 18px;
            color: #64748b;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
            font-weight: 400;
        }

        .services-watermark {
            position: absolute;
            font-weight: 400;
            color: #8b5cf6;
            white-space: nowrap;
            pointer-events: none;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0.05;
            font-family: 'Playfair Display', serif;
            font-style: italic;
            text-transform: lowercase;
        }

        .pricing-toggle-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 50px;
        }
        
        .pricing-toggle {
            background-color: #f1f5f9;
            border-radius: 40px;
            display: inline-flex;
            padding: 6px;
        }
        
        .toggle-btn {
            background: transparent;
            border: none;
            color: #64748b;
            font-family: 'DM Sans', sans-serif;
            font-weight: 600;
            font-size: 15px;
            padding: 10px 25px;
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .toggle-btn:not(.active):hover {
            color: #8b5cf6;
            background-color: rgba(139, 92, 246, 0.05);
        }
        
        .toggle-btn.active {
            background: #fff;
            color: #8b5cf6;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
            border: 2px solid #8b5cf6;
        }

        .planos-section {
            padding: 40px 20px 80px;
            background-color: #ffffff;
        }
        
        .planos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .plano-card {
            background: #fff;
            border-radius: 24px;
            padding: 40px 32px;
            border: 1px solid rgba(139, 92, 246, 0.1);
            display: flex;
            flex-direction: column;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .plano-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 30px rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.3);
        }
        
        .plano-card.destaque {
            border: 2px solid #8b5cf6;
        }
        
        .plano-badge {
            position: absolute;
            top: -16px;
            right: 32px;
            background: #2563eb;
            color: #fff;
            padding: 6px 18px;
            border-radius: 20px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .plano-title {
            font-family: 'Bricolage Grotesque', sans-serif;
            font-size: 24px;
            font-weight: 400;
            color: #0f172a;
            margin-bottom: 20px;
        }
        
        .plano-price {
            font-family: 'Bricolage Grotesque', sans-serif;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 20px;
            display: flex;
            align-items: baseline;
            gap: 4px;
        }
        
        .plano-price .currency {
            font-size: 18px;
            color: #64748b;
            font-weight: 500;
        }
        
        .plano-price .price-value {
            font-size: 48px;
            line-height: 1;
            transition: opacity 0.2s ease;
        }
        
        .plano-price .period {
            font-size: 16px;
            color: #64748b;
            font-weight: 500;
            font-family: 'DM Sans', sans-serif;
            transition: opacity 0.2s ease;
        }

        .site-limit {
            background: #f8fafc;
            padding: 12px;
            border-radius: 12px;
            text-align: center;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: #334155;
            margin-bottom: 30px;
            border: 1px solid rgba(139, 92, 246, 0.1);
        }

        .plano-features {
            list-style: none;
            padding: 0;
            margin: 0 0 40px 0;
            flex-grow: 1;
        }
        
        .plano-features li {
            margin-bottom: 16px;
            color: #475569;
            font-family: 'Inter', sans-serif;
            font-size: 15px;
            line-height: 1.5;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .plano-features li strong {
            color: #0f172a;
            font-weight: 600;
        }
        
        .plano-features li svg {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            color: #8b5cf6; 
        }

        .btn-plano-outline {
            background: transparent;
            color: #0f172a;
            border: 1px solid rgba(139, 92, 246, 0.3);
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px 32px;
            border-radius: 100px;
            font-family: 'DM Sans', sans-serif;
            font-weight: 700;
            font-size: 15px;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .btn-plano-outline:hover {
            background: rgba(139, 92, 246, 0.05);
            border-color: #8b5cf6;
            color: #8b5cf6;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 16px 32px;
            border-radius: 100px;
            background: linear-gradient(135deg, #7c3aed, #8b5cf6);
            color: #fff;
            font-family: 'DM Sans', sans-serif;
            font-weight: 700;
            font-size: 15px;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2);
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 25px rgba(139, 92, 246, 0.3);
            background: linear-gradient(135deg, #6d28d9, #7c3aed);
        }

        .btn-hero-planos {
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: auto; 
            padding: 16px 40px; 
            font-size: 16px; 
            border-radius: 100px; 
            text-decoration: none; 
            background: linear-gradient(135deg, #7c3aed, #8b5cf6); 
            color: #fff; 
            font-family: 'DM Sans', sans-serif;
            font-weight: 700;
            box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3); 
            transition: all 0.3s ease; 
            gap: 10px;
        }

        .btn-hero-planos:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 25px rgba(139, 92, 246, 0.4); 
            background: linear-gradient(135deg, #6d28d9, #7c3aed); 
        }

        .service-card {
            background: #fff;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            border: 1px solid rgba(139, 92, 246, 0.1);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .service-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 30px rgba(139, 92, 246, 0.1);
            border-color: rgba(139, 92, 246, 0.3);
        }

        .service-icon {
            width: 56px;
            height: 56px;
            background: rgba(139, 92, 246, 0.1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8b5cf6;
        }

        .service-icon svg {
            width: 28px;
            height: 28px;
        }

        .service-card h3 {
            font-family: 'Bricolage Grotesque', sans-serif;
            font-size: 22px;
            font-weight: 400;
            color: #0f172a;
        }

        .service-card p {
            font-size: 15px;
            color: #64748b;
            line-height: 1.6;
        }

        .section-tag {
            display: inline-block;
            background: rgba(139, 92, 246, 0.1);
            color: #8b5cf6;
            padding: 6px 16px;
            border-radius: 100px;
            font-family: 'DM Sans', sans-serif;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
        }

        @media (max-width: 768px) {
            .hero h1 { font-size: 46px; }
            .pricing-toggle { flex-direction: column; width: 100%; border-radius: 20px; }
            .toggle-btn { width: 100%; margin-bottom: 5px; }
            .services-grid { gap: 20px; }
            .hero { padding-top: 140px; padding-bottom: 40px; }
            .planos-grid { gap: 20px; }
        }

        @keyframes infinite-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
            animation: infinite-scroll 40s linear infinite;
        }

        @keyframes sweep {
            0% { transform: translateX(-100%) skewX(-15deg); }
            15% { transform: translateX(300%) skewX(-15deg); }
            100% { transform: translateX(300%) skewX(-15deg); }
        }
        .animate-sweep {
            animation: sweep 7s infinite;
        }
        .bg-grid-pattern {
            background-image: 
                linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 50px 50px;
        }
      `}} />

      <div className="page-container">
        {/* Navbar Sticky */}
        <nav className="sticky top-0 z-50 bg-[#f8fafc]/80 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-8 py-4">
          <div className="max-w-[1200px] mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center">
              <Image src="/assets/imagem/juripages.webp" alt="JuriPages" width={180} height={40} className="h-8 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-6">
              {/* WhatsApp somente no Navbar */}
              <a href="https://wa.me/559184921464" target="_blank" rel="noreferrer" className="text-gray-500 text-sm font-medium hidden sm:flex items-center gap-1.5 group hover:text-[#25D366] transition-colors">
                <span>Falar com o suporte</span>
                <WhatsAppIcon className="w-5 h-5 hidden group-hover:block text-[#25D366]" />
              </a>
              <Link href="/login" className="px-6 h-10 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all text-sm font-bold shadow-[0_4px_10px_rgba(139,92,246,0.2)] hover:-translate-y-0.5">
                Entrar
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="hero relative" style={{ paddingBottom: 0, minHeight: '100vh', background: 'transparent' }}>
          {/* 3D Spline Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <iframe 
              src="https://my.spline.design/herolightcopy-HWuYMA6IdNGk0VGuyvrItNGB" 
              frameBorder="0" 
              width="100%" 
              height="100%" 
              id="aura-spline"
              style={{ pointerEvents: 'none' }}
            ></iframe>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 relative z-10 pt-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
              <div className="w-full lg:w-[45%] text-left">
                <h1 className="relative z-10 m-0 lg:translate-y-3">
                  Toda a gestão do seu
                  <span className="font-['Playfair_Display'] text-[#8b5cf6] font-normal italic"> site jurídico em um só lugar</span>
                </h1>
              </div>

              <div className="w-full lg:w-[50%] flex flex-col text-left lg:text-right">
                <p className="hero-subtitle relative z-10 !mb-[30px] mx-0 w-full lg:ml-auto">
                  Acompanhe o desempenho do seu site, acesse relatórios de SEO e gerencie seu plano de suporte de forma centralizada e intuitiva com o aplicativo exclusivo da JuriPages.
                </p>

                <div className="flex flex-col xl:flex-row items-center gap-4 relative z-10 lg:justify-end">
                  <Link href="/login" className="btn-hero-planos m-0 shrink-0">
                    Começar Agora
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                  </Link>
                  <div className="flex items-center shrink-0">
                    <div className="flex -space-x-3">
                      <img src="/assets/imagem/perfis/01.enc" alt="Advogado" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                      <img src="/assets/imagem/perfis/02.enc" alt="Advogado" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                      <img src="/assets/imagem/perfis/03.enc" alt="Advogado" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                      <img src="/assets/imagem/perfis/04.enc" alt="Advogado" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-500 font-['Inter']">+ de mil advogados atendidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[95%] md:w-[90%] mx-auto pb-10 perspective-1200">
            <div 
              ref={heroImageRef}
              className="w-full relative rounded-xl md:rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden transform-gpu will-change-transform" 
              style={{ 
                transform: 'perspective(1200px) rotateX(15deg) rotateY(-5deg) scale(0.95)',
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* DESKTOP */}
              <div className="hidden md:block w-full" style={{ aspectRatio: '1920/1080' }}>
                <HeroDashboardMockup />
              </div>

              {/* MOBILE */}
              <div className="block md:hidden w-full">
                <Image 
                  src="/assets/imagem/hero-mobile.png" 
                  alt="Painel JuriPages Mobile" 
                  width={600} 
                  height={1200} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>
          </div>
        </section>



        {/* SERVIÇOS DE SUPORTE */}
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 text-center">
            <span className="section-tag">Nossa Entrega</span>
            <h2 className="font-['Bricolage_Grotesque'] text-4xl md:text-5xl font-normal text-slate-900 mb-6 max-w-[800px] mx-auto leading-tight">
              <em className="text-[#8b5cf6] font-['Playfair_Display'] italic font-normal">Suporte técnico completo</em> após a entrega do seu projeto.
            </h2>
            <p className="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed">
              Nosso compromisso não termina quando o seu site vai ao ar. Com o nosso plano de suporte, você conta com uma infraestrutura robusta e uma equipe dedicada para manter a sua presença digital sempre atualizada e segura, sem que você precise lidar com questões técnicas.
            </p>
          </div>
        </section>


        {/* ESTRATÉGIA */}
        <FeatureCarouselSection
          watermarkText="estratégia"
          titlePlain="Transformamos"
          titleHighlighted="dados em estratégias"
          description="Monitoramos acessos, cliques e comportamento do usuário, transformando esses dados em relatórios estratégicos e ajustes contínuos que aumentam a captação de clientes."
          slides={[
            { image: "/assets/imagem/Planilha-de-teses-validadas-1536x864.webp", text: "Métricas e estratégias validadas" },
            { image: "/assets/imagem/clarity.gif", text: "Gravação de tela dos usuários" },
            { image: "/assets/imagem/google-search-console.webp", text: "Análise de performance no Google" }
          ]}
          reverse={false}
        />

        {/* SEGURANÇA */}
        <FeatureCarouselSection
          watermarkText="segurança"
          titlePlain="Otimizações de"
          titleHighlighted="segurança e backups"
          description="Proteção contra quedas, backups regulares e suporte dedicado para garantir que seu site jurídico esteja sempre no ar e seguro."
          slides={[
            { image: "/assets/imagem/Planilha-de-teses-validadas-1536x864.webp", text: "Otimizações de segurança" },
            { image: "/assets/imagem/clarity.gif", text: "Backups automatizados" },
            { image: "/assets/imagem/google-search-console.webp", text: "Suporte contra quedas" }
          ]}
          reverse={true}
        />

        {/* COMUNICAÇÃO */}
        <FeatureCarouselSection
          watermarkText="contato"
          titlePlain="Contato com a equipe"
          titleHighlighted="pelo WhatsApp"
          description="Fale diretamente com nossa equipe de suporte via WhatsApp e agende reuniões estratégicas para acompanhar a evolução do seu projeto."
          slides={[
            { image: "/assets/imagem/Planilha-de-teses-validadas-1536x864.webp", text: "Atendimento direto" },
            { image: "/assets/imagem/clarity.gif", text: "Reuniões agendadas" },
            { image: "/assets/imagem/google-search-console.webp", text: "Acompanhamento estratégico" }
          ]}
          reverse={false}
        />

        {/* BLOG */}
        <FeatureCarouselSection
          watermarkText="blog"
          titlePlain="Funcionalidade de"
          titleHighlighted="postagem no blog e agendamento"
          description="Funcionalidade completa para gerenciamento do seu blog jurídico, permitindo criar, editar e agendar postagens com facilidade."
          slides={[
            { image: "/assets/imagem/Planilha-de-teses-validadas-1536x864.webp", text: "Criação de artigos" },
            { image: "/assets/imagem/clarity.gif", text: "Agendamento de postagens" },
            { image: "/assets/imagem/google-search-console.webp", text: "Gestão de conteúdo" }
          ]}
          reverse={true}
        />

        {/* RESPONSÁVEL POR +1000 SITES */}
        <section className="relative w-full bg-white min-h-[40vh] flex flex-col items-center justify-center overflow-hidden py-[50px]">
          
          {/* Animação de Reflexo */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 bottom-0 left-0 w-[60%] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-2xl animate-sweep"></div>
          </div>
          

          
          {/* Carrossel de Vantagens Infinito */}
          <div className="w-full mt-24 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            <div className="flex w-max animate-infinite-scroll gap-6 py-4 px-3 hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-6">
                  {/* Card 1 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Controle da rede</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Visualize o status de todos os seus projetos online em tempo real. Saiba exatamente o que está ativo, pausado ou em desenvolvimento.
                    </p>
                  </div>
                  {/* Card 2 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Relatórios de performance</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Entenda como o seu site está se saindo no Google. Acesse gráficos claros e simplificados de cliques e impressões diretamente do Search Console.
                    </p>
                  </div>
                  {/* Card 3 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Comunicação direta</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Receba comunicados oficiais, notas técnicas da nossa equipe e atualizações importantes sobre o andamento do seu projeto através de um feed exclusivo.
                    </p>
                  </div>
                  {/* Card 4 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Alertas dinâmicos</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Fique por dentro de avisos de SEO, status da sua hospedagem e andamento de manutenções com um sistema de notificações inteligente.
                    </p>
                  </div>
                  {/* Card 5 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Suporte Contra Queda</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Monitoramento contínuo. Se o seu site sofrer instabilidade, somos notificados na hora para reestabelecer o acesso rapidamente.
                    </p>
                  </div>
                  {/* Card 6 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Otimização do SEO</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Ajustes para manter seu site rápido e bem posicionado.
                    </p>
                  </div>
                  {/* Card 7 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Backups de Segurança</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Cópias de segurança frequentes para proteger todos os seus dados.
                    </p>
                  </div>
                  {/* Card 8 */}
                  <div className="w-[350px] h-full shrink-0 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.06)] flex flex-col relative overflow-hidden group hover:border-[#8b5cf6]/30 transition-colors hover:shadow-[0_8px_30px_-6px_rgba(139,92,246,0.12)]">
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] shadow-sm flex items-center justify-center mb-6 text-[#8b5cf6] border border-slate-100 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                    </div>
                    <h3 className="text-xl font-['Bricolage_Grotesque'] text-slate-900 mb-2">Agende Postagens</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Escreva e programe publicações diretamente pela plataforma. Mantenha seu site sempre vivo com conteúdo novo sem esforço.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <span className="section-tag">Vantagens</span>
                <h2 className="font-['Bricolage_Grotesque'] text-3xl md:text-4xl font-normal text-slate-900 mb-6">
                  Tudo isso você tem acesso no seu <em className="text-[#8b5cf6] font-['Playfair_Display'] italic font-normal">painel do cliente</em>.
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center shrink-0 border border-gray-100">
                      <svg className="w-5 h-5 text-[#8b5cf6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                    </div>
                    <div>
                      <h4 className="font-['Bricolage_Grotesque'] text-xl font-normal text-slate-900">Foco no seu escritório.</h4>
                      <p className="text-slate-500 mt-1">Deixe a parte técnica conosco. Evite navegar por plataformas complexas de hospedagem e foca no atendimento aos seus clientes.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center shrink-0 border border-gray-100">
                      <svg className="w-5 h-5 text-[#8b5cf6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <div>
                      <h4 className="font-['Bricolage_Grotesque'] text-xl font-normal text-slate-900">Proteção e segurança.</h4>
                      <p className="text-slate-500 mt-1">Mantenha as credenciais das suas ferramentas protegidas, acessando apenas o que é relevante para o acompanhamento dos resultados.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center shrink-0 border border-gray-100">
                      <svg className="w-5 h-5 text-[#8b5cf6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <div>
                      <h4 className="font-['Bricolage_Grotesque'] text-xl font-normal text-slate-900">Visão clara de resultados.</h4>
                      <p className="text-slate-500 mt-1">Acompanhe o crescimento da sua visibilidade online com relatórios limpos, sem excesso de jargões técnicos.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-center items-center py-6">
                {/* Mobile Frame Wrapper */}
                <div className="w-[280px] md:w-[300px] p-2 bg-[#111827] rounded-[44px] shadow-[0_30px_60px_-20px_rgba(17,24,39,0.5),0_0_0_2px_rgba(17,24,39,0.9)] relative pointer-events-none select-none overflow-hidden group">
                  <div className="relative w-full aspect-[375/812] rounded-[36px] overflow-hidden bg-[#F3F4F6] flex flex-col">
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[22px] rounded-full bg-[#111827] z-[90]"></div>
                    
                    {/* Screen Content */}
                    {/* Top Bar */}
                    <div className="h-11 flex items-center justify-between px-6 text-[10px] font-semibold tracking-tight text-slate-900 z-10 shrink-0">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <svg width="14" height="10" viewBox="0 0 17 11" fill="none"><rect x="0" y="7" width="3" height="4" rx="1" fill="#111827"></rect><rect x="4.5" y="5" width="3" height="6" rx="1" fill="#111827"></rect><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="#111827"></rect><rect x="13.5" y="0" width="3" height="11" rx="1" fill="#111827"></rect></svg>
                        <svg width="18" height="10" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="19" height="11" rx="3.5" stroke="#111827" strokeOpacity=".4"></rect><rect x="2" y="2" width="14" height="8" rx="2" fill="#111827"></rect><path d="M21 4v4a2.5 2.5 0 0 0 0-4z" fill="#111827" fillOpacity=".5"></path></svg>
                      </div>
                    </div>
                    
                    {/* Header Action */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/70 backdrop-blur-md border-b border-white/90 shrink-0">
                      <div className="flex-1 min-w-0 flex items-center justify-start py-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/novo-projeto.webp" alt="JuriPages" className="h-6 w-auto object-contain" />
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="flex-1 px-4 py-3 flex flex-col gap-3 overflow-hidden pb-8">
                      {/* Welcome Card */}
                      <div className="relative overflow-hidden bg-gradient-to-b from-white to-[#F1F2F4] border border-white/70 rounded-[24px] p-4 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.14)] shrink-0 text-left">
                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-100/70 blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#DFFF00]/40 blur-2xl"></div>
                        <div className="relative">
                          <h1 className="text-lg font-medium tracking-tight leading-tight mb-3">Bom dia,<br/>Ana Silva</h1>
                          <p className="text-[11px] text-slate-500 mb-0.5">Métrica de visibilidade</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-semibold tracking-tight">1.450</span>
                            <span className="text-[9px] font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">+12%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lime Card */}
                      <div className="relative overflow-hidden bg-[#DFFF00] rounded-[24px] p-4 shrink-0 text-left">
                        <div className="absolute -right-6 -top-6 w-32 h-32 border border-black/5 rounded-full"></div>
                        <div className="relative flex items-start justify-between">
                          <span className="text-xs font-medium text-black/70">Sites no ar</span>
                          <div className="w-7 h-7 rounded-full bg-white/40 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M8 12.4l2.6 2.6L16 9.6"></path></svg>
                          </div>
                        </div>
                        <div className="relative mt-5">
                          <p className="text-3xl font-medium tracking-tight text-black mb-0">3</p>
                          <p className="text-[10px] font-medium text-black/50">Projetos ativos</p>
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-2 gap-3 shrink-0">
                        <div className="bg-[#EAEAEA] border border-white/60 rounded-[20px] p-3 text-left">
                          <div className="text-[10px] font-medium text-slate-500 mb-2">Acessos 30d</div>
                          <p className="text-base font-semibold tracking-tight">1.240</p>
                        </div>
                        <div className="bg-[#EAEAEA] border border-white/60 rounded-[20px] p-3 text-left">
                          <div className="text-[10px] font-medium text-slate-500 mb-2">Leads</div>
                          <p className="text-base font-semibold tracking-tight">48</p>
                        </div>
                      </div>
                      
                      {/* Fake Chart Area */}
                      <div className="bg-white border border-gray-100 rounded-[24px] p-4 shrink-0 h-[100px] flex flex-col justify-end gap-1 items-end relative overflow-hidden">
                        <div className="absolute top-3 left-4 text-xs font-medium text-slate-900">Desempenho</div>
                        <div className="w-full flex items-end justify-between h-[50px] px-2">
                           <div className="w-4 h-[30%] bg-[#f4f0fa] rounded-t-sm"></div>
                           <div className="w-4 h-[50%] bg-[#f4f0fa] rounded-t-sm"></div>
                           <div className="w-4 h-[70%] bg-[#f4f0fa] rounded-t-sm"></div>
                           <div className="w-4 h-[40%] bg-[#f4f0fa] rounded-t-sm"></div>
                           <div className="w-4 h-[90%] bg-[#6214d1] rounded-t-sm"></div>
                           <div className="w-4 h-[60%] bg-[#f4f0fa] rounded-t-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </section>

        {/* Espaço reservado (seção movida para cima) */}

        {/* PLANOS DE SUPORTE */}
        <section id="planos" className="planos-section">
          <div className="text-center mb-[50px] relative">
            <div className="services-watermark text-[80px] md:text-[160px] -top-12 font-['Inter'] font-normal italic">planos</div>
            <h2 className="font-['Bricolage_Grotesque'] text-4xl md:text-5xl font-normal text-slate-900 mb-4 relative z-10">
              Planos de Suporte e <em className="text-[#8b5cf6] font-['Playfair_Display'] italic font-normal">Manutenção</em>
            </h2>
            <p className="text-slate-500 max-w-[600px] mx-auto mb-[30px] leading-relaxed">
              Proposta de manutenção, segurança e crescimento contínuo do site. Escolha o melhor pacote para você.
            </p>

            <div className="pricing-toggle-wrapper">
              <div className="pricing-toggle">
                <button onClick={() => setPeriod("mensal")} className={`toggle-btn ${period === "mensal" ? "active" : ""}`}>Mensal</button>
                <button onClick={() => setPeriod("semestral")} className={`toggle-btn ${period === "semestral" ? "active" : ""}`}>Semestral (-10%)</button>
                <button onClick={() => setPeriod("anual")} className={`toggle-btn ${period === "anual" ? "active" : ""}`}>Anual (-20%)</button>
              </div>
            </div>
          </div>

          <div className="services-grid">
            {/* Plano Essencial */}
            <div className="plano-card items-start text-left">
              <h3 className="plano-title">Essencial</h3>

              <div className="plano-price">
                <span className="currency">R$</span>
                <span className="price-value">{prices.essencial[period]}</span>
                <span className="period">{periodLabels[period]}</span>
              </div>

              <div className="site-limit w-full">Até 1 Site</div>

              <ul className="plano-features">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Atualizações mensais:</strong> o site é atualizado uma vez por mês</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Backup semanal:</strong> cópia de segurança feita toda semana</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Suporte em horário comercial:</strong> resposta em até 24h</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Segurança básica:</strong> certificado SSL e atualizações de segurança</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Checagem no Google:</strong> verificação mensal nas buscas</span></li>
              </ul>

              <Link href="/login" className="btn-plano-outline">Começar Agora</Link>
            </div>

            {/* Plano Profissional */}
            <div className="plano-card destaque items-start text-left">
              <div className="plano-badge bg-[#8b5cf6]">Mais Popular</div>
              <h3 className="plano-title">Profissional</h3>

              <div className="plano-price">
                <span className="currency">R$</span>
                <span className="price-value">{prices.profissional[period]}</span>
                <span className="period">{periodLabels[period]}</span>
              </div>

              <div className="site-limit w-full">Até 3 Sites</div>

              <ul className="plano-features">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Atualização de conteúdo:</strong> a cada 15 dias no site</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Backup diário:</strong> cópia de segurança todos os dias</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Suporte 7 dias por semana:</strong> resposta em até 6 horas</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Segurança avançada:</strong> firewall (WAF), monitoramento de malware</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>SEO básico:</strong> ajustes pra ajudar nas buscas</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Atualização de blog:</strong> até 6 textos por mês</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Hospedagem e Domínio:</strong> gratuitos a partir da anual.</span></li>
              </ul>

              <Link href="/login" className="btn-primary">Começar Agora</Link>
            </div>

            {/* Plano Premium */}
            <div className="plano-card items-start text-left">
              <h3 className="plano-title">Premium</h3>

              <div className="plano-price">
                <span className="currency">R$</span>
                <span className="price-value">{prices.premium[period]}</span>
                <span className="period">{periodLabels[period]}</span>
              </div>

              <div className="site-limit w-full">Até 12 Sites</div>

              <ul className="plano-features">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Atualização de conteúdo:</strong> toda semana, prioridade máxima</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Backup diário duplo:</strong> guardado em dois lugares</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Monitoramento 24h:</strong> correção imediata se o site cair</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Segurança avançada:</strong> WAF de alta capacidade</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Otimização para campanhas:</strong> ajustes em landing pages</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>SEO contínuo:</strong> acompanhamento e relatórios</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg><span><strong>Blog e Páginas:</strong> até 12 publicações e 4 páginas/mês</span></li>
              </ul>

              <Link href="/login" className="btn-plano-outline">Começar Agora</Link>
            </div>
          </div>
        </section>


        {/* CTA FINAL / DUVIDA */}
        <section className="px-5 pb-20 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
              <div className="absolute -top-1/2 -left-[10%] w-[60%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2)_0%,transparent_70%)] pointer-events-none rotate-12"></div>

              <h2 className="font-['Bricolage_Grotesque'] text-3xl md:text-[38px] text-white font-normal mb-5 relative z-10">
                Está em dúvida sobre qual o<br />plano ideal para seu site?
              </h2>

              <p className="font-['Inter'] text-slate-300 max-w-[700px] mx-auto mb-10 leading-[1.6] relative z-10">
                Sem problemas! Vamos agendar um bate-papo rápido para entender suas necessidades, analisar a estrutura do seu site e te propor o melhor plano de manutenção para o seu momento atual, ou você pode começar agora mesmo.
              </p>

              <Link href="/login" className="btn-primary w-auto inline-flex relative z-10 mx-auto border border-[#8b5cf6]/60">
                Começar Agora
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#f5f3ff] py-6 border-t border-[#a78bfa]">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap justify-between items-center gap-5">
            <div>
              <Image src="/assets/imagem/juripages.webp" alt="JuriPages" width={150} height={40} className="h-10 w-auto" />
            </div>
            <p className="text-[#8b5cf6] font-['DM_Sans'] text-sm m-0 text-right">
              © 2026 JuriPages - Sites para Advogados. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
