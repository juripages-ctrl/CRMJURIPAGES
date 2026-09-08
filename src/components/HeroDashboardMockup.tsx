import React from "react";

export const HeroDashboardMockup = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#F3F4F6", fontFamily: "Inter, system-ui, sans-serif", color: "#111827", display: "flex", textAlign: "left", WebkitFontSmoothing: "antialiased", minHeight: "800px" }}>
      {/* Sidebar */}
      <aside style={{ boxSizing: "border-box", width: "80px", flex: "none", height: "100%", background: "rgba(255,255,255,.5)", backdropFilter: "blur(14px)", borderRight: "1px solid rgba(255,255,255,.4)", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0" }}>
        <div style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px" }}>
          <img src="/assets/imagem/Novo%20Projeto.webp" alt="Logo" style={{ width: "44px", height: "44px", objectFit: "contain" }} />
        </div>
        <nav style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <button title="Início" style={{ width: "44px", height: "44px", border: "0", borderRadius: "999px", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "transform .15s" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
          <button title="Site" style={{ width: "40px", height: "40px", border: "0", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background .15s" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </button>
          <button title="Mensagens" style={{ width: "40px", height: "40px", border: "0", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background .15s" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <button title="Pagamentos" style={{ width: "40px", height: "40px", border: "0", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background .15s" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </button>
        </nav>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <button title="Sair" style={{ width: "40px", height: "40px", border: "0", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
          <div style={{ width: "40px", height: "40px", borderRadius: "999px", overflow: "hidden", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <img src="/assets/imagem/perfis/01.enc" alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
        <header style={{ flex: "none", display: "flex", alignItems: "center", gap: "16px", padding: "26px 34px 18px" }}>
          <div style={{ flex: "1", minWidth: "0" }}>
            <p style={{ margin: "0", fontSize: "11.5px", fontWeight: "600", letterSpacing: ".09em", textTransform: "uppercase", color: "#9CA3AF" }}>SILVA & ASSOCIADOS</p>
            <h1 style={{ margin: "2px 0 0", fontSize: "30px", fontWeight: "500", letterSpacing: "-.032em" }}>Visão Geral</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", height: "44px", padding: "0 18px", background: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.6)", borderRadius: "999px", width: "300px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" /></svg>
            <input value="" readOnly placeholder="Buscar projeto, domínio ou cliente..." style={{ flex: "1", border: "0", outline: "0", background: "transparent", fontFamily: "inherit", fontSize: "14px", minWidth: "0" }} />
          </div>
          <button style={{ position: "relative", width: "44px", height: "44px", flex: "none", border: "1px solid rgba(255,255,255,.6)", borderRadius: "999px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.7" strokeLinecap="round"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9z" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></svg>
            <span style={{ position: "absolute", top: "9px", right: "10px", width: "8px", height: "8px", borderRadius: "999px", background: "#6214d1", border: "1.5px solid #fff" }}></span>
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", padding: "0 20px", border: "0", borderRadius: "999px", background: "#111827", color: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 12px 24px -14px rgba(17,24,39,.8)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DFFF00" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <span>Novo projeto</span>
          </button>
        </header>

        <div className="dk-scroll" style={{ flex: "1", overflowY: "hidden", padding: "6px 34px 34px", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "22px" }}>
              <div style={{ boxSizing: "border-box", position: "relative", overflow: "hidden", background: "linear-gradient(180deg,#fff,#F1F2F4)", border: "1px solid rgba(255,255,255,.6)", borderRadius: "40px", padding: "34px", minHeight: "230px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "260px", height: "260px", borderRadius: "999px", background: "rgba(219,234,254,.6)", filter: "blur(56px)" }}></div>
                <div style={{ position: "absolute", bottom: "-60px", left: "-50px", width: "260px", height: "260px", borderRadius: "999px", background: "rgba(223,255,0,.28)", filter: "blur(56px)" }}></div>
                <h2 style={{ position: "relative", margin: "0", fontSize: "38px", fontWeight: "500", letterSpacing: "-.038em", lineHeight: "1.1" }}>Olá Ana,<br />aqui está a sua rede.</h2>
                <div style={{ position: "relative" }}>
                  <p style={{ margin: "0 0 3px", fontSize: "15px", color: "#6B7280" }}>Cliques orgânicos · 30 dias</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                    <span style={{ fontSize: "40px", fontWeight: "600", letterSpacing: "-.04em" }}>1.284</span>
                    <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#166534", background: "#DCFCE7", padding: "4px 11px", borderRadius: "999px" }}>+12,5%</span>
                  </div>
                </div>
              </div>
              <div style={{ position: "relative", overflow: "hidden", background: "#DFFF00", borderRadius: "40px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "230px", height: "230px", border: "1px solid rgba(0,0,0,.06)", borderRadius: "999px" }}></div>
                <div style={{ position: "absolute", right: "-22px", top: "-22px", width: "230px", height: "230px", border: "1px solid rgba(0,0,0,.06)", borderRadius: "999px" }}></div>
                <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "16px", fontWeight: "500", color: "rgba(0,0,0,.7)" }}>Site no ar</span>
                  <div style={{ width: "42px", height: "42px", flex: "none", borderRadius: "999px", background: "rgba(255,255,255,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8 12.4l2.6 2.6L16 9.6" /></svg>
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "54px", fontWeight: "500", letterSpacing: "-.045em", color: "#000", lineHeight: "1" }}>1</p>
                  <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "500", color: "rgba(0,0,0,.5)" }}>silvaadvocacia.com.br · SSL válido</p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "22px", alignItems: "start" }}>
              <div style={{ boxSizing: "border-box", background: "#F2F2F2", border: "1px solid rgba(255,255,255,.6)", borderRadius: "40px", padding: "24px", height: "520px", display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 16px", padding: "0 8px", fontSize: "17px", fontWeight: "500", color: "#6B7280" }}>Selecione um projeto</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "44px", margin: "0 8px 16px", padding: "0 16px", background: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.5)", borderRadius: "999px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.9" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" /></svg>
                  <input value="" readOnly placeholder="Buscar projeto..." style={{ flex: "1", border: "0", outline: "0", background: "transparent", fontFamily: "inherit", fontSize: "13.5px", minWidth: "0" }} />
                </div>
                <div className="dk-scroll" style={{ flex: "1", overflowY: "hidden", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "6px" }}>
                  <button style={{ width: "100%", textAlign: "left", border: "1px solid #111827", borderRadius: "22px", background: "#111827", color: "#fff", padding: "16px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(17,24,39,0.2)", transition: "transform .15s" }}>
                    <p style={{ margin: "0", fontSize: "15px", fontWeight: "500", letterSpacing: "-.01em" }}>Silva & Associados</p>
                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>silvaadvocacia.com.br</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "11px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#DFFF00" }}></span>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.8)" }}>No ar</span>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "14px", padding: "7px 13px", borderRadius: "12px", background: "#fff", color: "#111827", fontSize: "12px", fontWeight: "600" }}>
                      <span>Gerenciar site</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.6" strokeLinecap="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
                    </span>
                  </button>
                  <button style={{ width: "100%", textAlign: "left", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "22px", background: "#fff", color: "#111827", padding: "16px", cursor: "pointer", fontFamily: "inherit", transition: "transform .15s" }}>
                    <p style={{ margin: "0", fontSize: "15px", fontWeight: "500", letterSpacing: "-.01em" }}>Mendes Tributário</p>
                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6B7280" }}>mendestributario.com.br</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "11px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#DFFF00" }}></span>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280" }}>No ar</span>
                    </div>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", textAlign: "left" }}>
                  <div style={{ background: "#EAEAEA", border: "1px solid rgba(255,255,255,.6)", borderRadius: "32px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#6B7280" }}>Impressões</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#111827", background: "#fff", padding: "3px 8px", borderRadius: "999px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>+6,1%</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "28px", fontWeight: "600", letterSpacing: "-.035em" }}>42,9k</p>
                  </div>
                  <div style={{ background: "#EAEAEA", border: "1px solid rgba(255,255,255,.6)", borderRadius: "32px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#6B7280" }}>CTR</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#111827", background: "#fff", padding: "3px 8px", borderRadius: "999px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>+0,4pp</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "28px", fontWeight: "600", letterSpacing: "-.035em" }}>3,0%</p>
                  </div>
                  <div style={{ background: "#EAEAEA", border: "1px solid rgba(255,255,255,.6)", borderRadius: "32px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#6B7280" }}>Posição média</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#111827", background: "#fff", padding: "3px 8px", borderRadius: "999px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>melhor</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "28px", fontWeight: "600", letterSpacing: "-.035em" }}>8,4</p>
                  </div>
                  <div style={{ background: "#EAEAEA", border: "1px solid rgba(255,255,255,.6)", borderRadius: "32px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#6B7280" }}>Indexadas</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#111827", background: "#fff", padding: "3px 8px", borderRadius: "999px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>+3</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "28px", fontWeight: "600", letterSpacing: "-.035em" }}>38</p>
                  </div>
                </div>

                <div style={{ background: "#fff", border: "1px solid #EFEFEF", borderRadius: "40px", padding: "28px 30px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "500", letterSpacing: "-.025em" }}>Cliques orgânicos</p>
                      <p style={{ margin: "0", fontSize: "13.5px", color: "#9CA3AF" }}>Search Console - silvaadvocacia.com.br</p>
                    </div>
                    <div style={{ background: "#F3F4F6", borderRadius: "999px", padding: "4px", display: "flex", gap: "4px" }}>
                      <button style={{ height: "34px", padding: "0 18px", border: "0", borderRadius: "999px", background: "transparent", color: "#6B7280", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Hoje</button>
                      <button style={{ height: "34px", padding: "0 18px", border: "0", borderRadius: "999px", background: "transparent", color: "#6B7280", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>7 dias</button>
                      <button style={{ height: "34px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#111827", color: "#fff", fontFamily: "inherit", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 8px rgba(17,24,39,0.3)" }}>30 dias</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "10px", height: "220px" }}>
                    {[
                      { h: 60, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 80, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 40, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 95, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 120, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 70, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 150, bg: "#111827", cap: "#374151", lw: "700", lc: "#111827", tip: "1232 cliques" },
                      { h: 110, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 90, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" },
                      { h: 130, bg: "#E5E7EB", cap: "#D1D5DB", lw: "500", lc: "#9CA3AF", tip: "" }
                    ].map((b, i) => (
                      <div key={i} style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "pointer", position: "relative" }}>
                        {b.tip && <span style={{ position: "absolute", top: "-26px", display: "block", background: "#111827", color: "#fff", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "999px", whiteSpace: "nowrap" }}>{b.tip}</span>}
                        <div style={{ width: "100%", height: b.h + "px", borderRadius: "6px 6px 0 0", background: b.bg, borderTop: "1px solid rgba(255,255,255,.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "9px" }}>
                          <div style={{ width: "50%", height: "4px", borderRadius: "999px", background: b.cap }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
