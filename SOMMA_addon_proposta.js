/* ============================================================
   SOMMA · Add-on "Proposta Comercial" para o Painel Patrimonial
   Como usar: copie este arquivo para a mesma pasta do painel e
   adicione, logo antes do fim do corpo da pagina, uma tag script
   com src="SOMMA_addon_proposta.js".
   O add-on injeta o botão na barra e lê os dados já carregados
   na tela (RAW, ENT, FX) para compor a apresentação.
   ============================================================ */
(function(){
  if(window.__SOMMA_PROPOSTA__)return; window.__SOMMA_PROPOSTA__=1;

  const nf=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
  const brl=v=>'R$ '+nf.format(Math.round(v||0));
  const pctf=v=>(v||0).toLocaleString('pt-BR',{maximumFractionDigits:1});
  const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function parseNum(s){if(typeof s==='number')return s;return parseFloat((s||'').toString().replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||0;}
  const $=id=>document.getElementById(id);
  const q=sel=>document.querySelector(sel);

  const SVC={
    planejamento:{nome:'Planejamento Patrimonial e Sucessório',icon:'shield-check',
      desc:'Revisão e estruturação do planejamento patrimonial e sucessório da família — organização de holdings, estruturas no Brasil e no exterior, governança familiar e eficiência tributária.'},
    investimentos:{nome:'Gestão e Consultoria de Investimentos',icon:'trending-up',
      desc:'Gestão e consultoria da carteira de investimentos onshore e offshore, com consolidação global e acompanhamento tributário — no banco de preferência da família, sem amarras.'},
    imobiliaria:{nome:'Gestão e Controladoria Imobiliária',icon:'building-2',
      desc:'O patrimônio imobiliário tratado como carteira de investimentos: mapeamento, precificação, estratégia por imóvel e controladoria contínua, executados pela Lidderar.'},
    contas:{nome:'Controladoria de Contas das Holdings',icon:'wallet',soCompleto:true,
      desc:'Controladoria financeira das holdings não operacionais: contas a pagar e receber, fluxo de caixa, tesouraria, mútuos e doações. Disponível apenas no modelo completo de Multi-Family Office.'}
  };
  const ORDER=['planejamento','investimentos','imobiliaria','contas'];

  /* ---------- estilos do modal ---------- */
  const css=`
.prx-modal{position:fixed;inset:0;z-index:200;background:rgba(28,41,49,.5);backdrop-filter:blur(3px);display:none;align-items:flex-start;justify-content:center;padding:30px 16px;overflow:auto}
.prx-modal.on{display:flex}
.prx-card{background:#fff;border:1px solid #e6e4dd;border-radius:0 16px 0 16px;width:100%;max-width:720px;box-shadow:0 6px 24px rgba(28,41,49,.18);overflow:hidden;font-family:'Inter',-apple-system,sans-serif}
.prx-head{display:flex;align-items:flex-start;justify-content:space-between;padding:22px 26px 16px;border-bottom:1px solid #e6e4dd;background:linear-gradient(160deg,#fff,#f7f9fa)}
.prx-eyebrow{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8a979d;font-weight:500;margin-bottom:6px}
.prx-head h3{font-size:20px;font-weight:300;color:#1c2931;letter-spacing:-.01em}
.prx-x{background:transparent;border:none;color:#8a979d;cursor:pointer;font-size:24px;line-height:1;padding:0 4px}
.prx-x:hover{color:#2c424d}
.prx-cap{margin:14px 26px 0;background:linear-gradient(160deg,#2c424d,#1c2931);color:#fff;border-radius:0 10px 0 10px;padding:12px 16px;font-size:12.5px;line-height:1.5}
.prx-cap b{color:#c2a878}
.prx-cap.empty{background:#f4f3ee;color:#5a6b73}
.prx-body{padding:6px 26px 4px;max-height:58vh;overflow:auto}
.prx-sec{padding:16px 0;border-bottom:1px solid #e6e4dd}
.prx-sec:last-child{border-bottom:none}
.prx-t{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:#a98f5f;font-weight:600;margin-bottom:12px;display:flex;gap:10px;align-items:center}
.prx-t .inl{font-size:10.5px;text-transform:none;letter-spacing:.02em;color:#8a979d;font-weight:400}
.prx-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.prx-f{display:flex;flex-direction:column;gap:6px}
.prx-f span{font-size:11.5px;color:#5a6b73}
.prx-f input,.prx-f select,.prx-area{background:#fbfbf9;border:1px solid #e6e4dd;border-radius:0 6px 0 6px;padding:10px 12px;font-size:13.5px;font-family:inherit;color:#1c2931}
.prx-f input:focus,.prx-f select:focus,.prx-area:focus{outline:none;border-color:#486878}
.prx-area{width:100%;resize:vertical}
.prx-radio-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.prx-radio{flex:1 1 230px;display:flex;gap:10px;align-items:flex-start;border:1px solid #e6e4dd;border-radius:0 6px 0 6px;padding:12px 14px;cursor:pointer}
.prx-radio:hover{border-color:#486878}
.prx-radio input{margin-top:3px;accent-color:#486878}
.prx-radio b{font-size:13px;color:#1c2931;font-weight:600;display:block}
.prx-radio small{font-size:11px;color:#8a979d}
.prx-serv{display:flex;flex-direction:column;gap:8px}
.prx-item{display:flex;gap:11px;align-items:flex-start;border:1px solid #e6e4dd;border-radius:0 6px 0 6px;padding:11px 13px;cursor:pointer}
.prx-item.lock{background:#f4f3ee;cursor:default}
.prx-item.dis{opacity:.55;cursor:not-allowed}
.prx-item input{margin-top:3px;accent-color:#486878}
.prx-ic{width:30px;height:30px;border-radius:0 6px 0 6px;background:#2c424d;color:#fff;display:flex;align-items:center;justify-content:center;flex:none}
.prx-ic svg{width:15px;height:15px}
.prx-tt{font-size:12.5px;font-weight:600;color:#1c2931}
.prx-dd{font-size:11px;color:#5a6b73;margin-top:2px;line-height:1.4}
.prx-badge{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:#a98f5f;font-weight:600;margin-left:6px}
.prx-fee{margin-top:12px;background:linear-gradient(160deg,#2c424d,#1c2931);color:#fff;border-radius:0 10px 0 10px;padding:15px 18px;font-size:13px;line-height:1.6;display:none}
.prx-fee.on{display:block}
.prx-fee b{color:#c2a878}
.prx-fee .big{font-size:22px;font-weight:300;margin-top:4px}
.prx-foot{display:flex;justify-content:flex-end;gap:12px;padding:16px 26px;border-top:1px solid #e6e4dd;background:#fbfbf9}
.prx-btn{border:1px solid #e6e4dd;background:#fff;color:#1c2931;padding:11px 18px;border-radius:0 6px 0 6px;font-size:13px;font-family:inherit;cursor:pointer;display:inline-flex;gap:8px;align-items:center}
.prx-btn:hover{border-color:#486878;color:#2c424d}
.prx-btn.pri{background:#2c424d;border-color:#2c424d;color:#fff}
.prx-btn.pri:hover{background:#1c2931}
.prx-btn svg{width:16px;height:16px}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* ---------- modal ---------- */
  const modalHTML=`
<div class="prx-modal" id="prx_modal">
  <div class="prx-card">
    <div class="prx-head">
      <div><div class="prx-eyebrow">SOMMA Multi-Family Office</div><h3>Gerar proposta comercial</h3></div>
      <button class="prx-x" id="prx_close" title="Fechar">&times;</button>
    </div>
    <div class="prx-cap" id="prx_cap"></div>
    <div class="prx-body">
      <div class="prx-sec">
        <div class="prx-t">Cliente</div>
        <div class="prx-grid">
          <label class="prx-f"><span>Nome do cliente / família</span><input id="prx_cliente" type="text" placeholder="Ex.: Família ..."></label>
          <label class="prx-f"><span>Data da proposta</span><input id="prx_data" type="date"></label>
        </div>
      </div>
      <div class="prx-sec">
        <div class="prx-t">Executivo responsável</div>
        <div class="prx-grid">
          <label class="prx-f"><span>Nome</span><input id="prx_execNome" type="text" placeholder="Seu nome"></label>
          <label class="prx-f"><span>Cargo</span><input id="prx_execCargo" type="text" placeholder="Ex.: Executivo Comercial · MFO"></label>
          <label class="prx-f"><span>Telefone</span><input id="prx_execTel" type="text" placeholder="(48) 9 9999-9999"></label>
          <label class="prx-f"><span>E-mail (opcional)</span><input id="prx_execEmail" type="text" placeholder="nome@sommainvestimentos.com.br"></label>
        </div>
      </div>
      <div class="prx-sec">
        <div class="prx-t">Escopo da proposta</div>
        <div class="prx-radio-row">
          <label class="prx-radio"><input type="radio" name="prx_escopo" value="completo" checked><span><b>Multi-Family Office — modelo completo</b><small>Todos os serviços, com controladoria de contas inclusa</small></span></label>
          <label class="prx-radio"><input type="radio" name="prx_escopo" value="avulso"><span><b>Serviços avulsos</b><small>Selecione os serviços desejados</small></span></label>
        </div>
        <div class="prx-serv" id="prx_serv"></div>
      </div>
      <div class="prx-sec">
        <div class="prx-t">Modelo de cobrança <span class="inl">cobrança anual, faturada mensalmente</span></div>
        <div class="prx-radio-row">
          <label class="prx-radio"><input type="radio" name="prx_cobr" value="pct" checked><span><b>% sobre o patrimônio</b></span></label>
          <label class="prx-radio"><input type="radio" name="prx_cobr" value="rs"><span><b>Valor financeiro (R$)</b></span></label>
        </div>
        <div id="prx_cobrPct" class="prx-grid">
          <label class="prx-f"><span>Percentual ao ano (%)</span><input id="prx_pct" type="number" step="0.01" placeholder="Ex.: 0,80"></label>
          <label class="prx-f"><span>Patrimônio base (R$)</span><input id="prx_base" type="text" placeholder="—"></label>
        </div>
        <div id="prx_cobrRs" class="prx-grid" style="display:none">
          <label class="prx-f"><span>Honorário (R$)</span><input id="prx_rs" type="number" step="1000" placeholder="Ex.: 480000"></label>
          <label class="prx-f"><span>Periodicidade informada</span><select id="prx_rsPer"><option value="ano">por ano</option><option value="mes">por mês</option></select></label>
        </div>
        <div class="prx-fee" id="prx_feeBox"></div>
      </div>
      <div class="prx-sec">
        <div class="prx-t">Observações (opcional)</div>
        <textarea id="prx_obs" class="prx-area" rows="2" placeholder="Notas que aparecerão na proposta..."></textarea>
      </div>
    </div>
    <div class="prx-foot">
      <button class="prx-btn" id="prx_cancel">Cancelar</button>
      <button class="prx-btn pri" id="prx_gen"><i data-lucide="file-signature"></i>Gerar apresentação</button>
    </div>
  </div>
</div>`;
  const holder=document.createElement('div');holder.innerHTML=modalHTML.trim();document.body.appendChild(holder.firstChild);

  /* ---------- captura dos dados do painel ---------- */
  function capture(){
    if(typeof RAW==='undefined'||!Array.isArray(RAW)||!RAW.length)return null;
    const fx=(typeof FX!=='undefined'&&FX>0)?FX:5.4;
    const vBRL=r=>(r.moeda==='USD'?(r.valor||0)*fx:(r.valor||0));
    let total=0;const byG={},byL={};const inst=new Set();
    RAW.forEach(r=>{const v=vBRL(r);total+=v;byG[r.grupo]=(byG[r.grupo]||0)+v;byL[r.liq]=(byL[r.liq]||0)+v;if(r.inst&&r.inst!=='—')inst.add(r.inst);});
    const usd=RAW.filter(r=>r.moeda==='USD').reduce((s,r)=>s+vBRL(r),0);
    const exp=RAW.filter(r=>r.moeda==='USD'||r.exp==='Sim').reduce((s,r)=>s+vBRL(r),0);
    const liqShort=RAW.filter(r=>r.liq==='Imediata'||r.liq==='Curto').reduce((s,r)=>s+vBRL(r),0);
    const iliq=byL['Ilíquido']||0;
    const entVal={};RAW.forEach(r=>{entVal[r.entidade]=(entVal[r.entidade]||0)+vBRL(r);});
    let ents=[],root='';
    if(typeof ENT!=='undefined'&&ENT.length){const r0=ENT.find(e=>!e.controlador)||ENT[0];root=r0?r0.entidade:'';
      ents=ENT.map(e=>({nome:e.entidade,tipo:e.tipo,val:entVal[e.entidade]||0,controlador:e.controlador}));}
    const top=RAW.map(r=>({nome:r.produto,grupo:r.grupo,val:vBRL(r)})).sort((a,b)=>b.val-a.val).slice(0,5);
    const cliente=root||((RAW[0]&&RAW[0].titular)||'');
    return {fx,total,byG,byL,usd,exp,liqShort,iliq,nInst:inst.size,nEnt:(typeof ENT!=='undefined'?ENT.length:0),ents,root,top,cliente,nAtivos:RAW.length};
  }
  let SNAP=null;

  /* ---------- escopo / serviços ---------- */
  function escopo(){return q('input[name=prx_escopo]:checked').value;}
  function renderServ(){
    const e=escopo(),host=$('prx_serv');let h='';
    ORDER.forEach(k=>{const s=SVC[k];
      if(e==='completo'){h+=`<div class="prx-item lock"><span class="prx-ic"><i data-lucide="${s.icon}"></i></span><div><div class="prx-tt">${s.nome}<span class="prx-badge">incluso</span></div><div class="prx-dd">${s.desc}</div></div></div>`;}
      else if(s.soCompleto){h+=`<div class="prx-item dis"><span class="prx-ic"><i data-lucide="${s.icon}"></i></span><div><div class="prx-tt">${s.nome}<span class="prx-badge">só no modelo completo</span></div><div class="prx-dd">Não comercializado separadamente.</div></div></div>`;}
      else{h+=`<label class="prx-item"><input type="checkbox" class="prx-chk" value="${k}" checked><span class="prx-ic"><i data-lucide="${s.icon}"></i></span><div><div class="prx-tt">${s.nome}</div><div class="prx-dd">${s.desc}</div></div></label>`;}
    });
    host.innerHTML=h;if(window.lucide)lucide.createIcons();
  }

  /* ---------- cobrança ---------- */
  function cobr(){return q('input[name=prx_cobr]:checked').value;}
  function toggleCobr(){$('prx_cobrPct').style.display=cobr()==='pct'?'grid':'none';$('prx_cobrRs').style.display=cobr()==='rs'?'grid':'none';updateFee();}
  function computeFee(){
    if(cobr()==='pct'){const p=parseFloat(($('prx_pct').value||'').replace(',','.'))||0;const base=parseNum($('prx_base').value);const anual=base*p/100;return{anual,mensal:anual/12,p,base,modo:'pct'};}
    const v=parseNum($('prx_rs').value),per=$('prx_rsPer').value;const anual=per==='mes'?v*12:v;return{anual,mensal:anual/12,modo:'rs'};
  }
  function updateFee(){
    const f=computeFee(),box=$('prx_feeBox');
    if(!f.anual||f.anual<=0){box.classList.remove('on');box.innerHTML='';return;}
    box.classList.add('on');let l='';
    if(f.modo==='pct')l=`<div>Honorário de <b>${(f.p).toLocaleString('pt-BR',{maximumFractionDigits:2})}% ao ano</b> sobre ${brl(f.base)}</div>`;
    box.innerHTML=l+`<div class="big">${brl(f.anual)}<span style="font-size:13px"> /ano</span></div><div>faturado mensalmente · <b>${brl(f.mensal)}/mês</b></div>`;
  }

  /* ---------- abrir / preencher ---------- */
  function prefill(){
    if(!$('prx_data').value)$('prx_data').value=new Date().toISOString().slice(0,10);
    SNAP=capture();
    const cap=$('prx_cap');
    if(SNAP){
      cap.className='prx-cap';
      cap.innerHTML=`Dados capturados do painel: <b>${brl(SNAP.total)}</b> · ${SNAP.nAtivos} ativos · ${SNAP.nEnt||0} entidades · ${SNAP.nInst} instituições. Estes números compõem a apresentação.`;
      if(!$('prx_cliente').value&&SNAP.cliente)$('prx_cliente').value=SNAP.cliente;
      if(!$('prx_base').dataset.touched)$('prx_base').value=nf.format(Math.round(SNAP.total));
    }else{
      cap.className='prx-cap empty';
      cap.innerHTML='Nenhuma planilha carregada no painel. Você pode gerar mesmo assim e informar o patrimônio base manualmente.';
    }
    renderServ();updateFee();if(window.lucide)lucide.createIcons();
  }
  function openModal(){prefill();$('prx_modal').classList.add('on');}
  function closeModal(){$('prx_modal').classList.remove('on');}

  /* ---------- listeners ---------- */
  document.querySelectorAll('input[name=prx_escopo]').forEach(r=>r.addEventListener('change',renderServ));
  document.querySelectorAll('input[name=prx_cobr]').forEach(r=>r.addEventListener('change',toggleCobr));
  ['prx_pct','prx_rs','prx_rsPer'].forEach(id=>{$(id).addEventListener('input',updateFee);$(id).addEventListener('change',updateFee);});
  $('prx_base').addEventListener('input',()=>{$('prx_base').dataset.touched='1';updateFee();});
  $('prx_close').addEventListener('click',closeModal);
  $('prx_cancel').addEventListener('click',closeModal);
  $('prx_modal').addEventListener('click',e=>{if(e.target===$('prx_modal'))closeModal();});

  $('prx_gen').addEventListener('click',()=>{
    const cli=$('prx_cliente').value.trim();
    if(!cli){alert('Informe o nome do cliente.');$('prx_cliente').focus();return;}
    let servicos=[];
    if(escopo()==='completo')servicos=['planejamento','investimentos','imobiliaria','contas'];
    else servicos=[...document.querySelectorAll('.prx-chk:checked')].map(c=>c.value);
    if(!servicos.length){alert('Selecione ao menos um serviço.');return;}
    const cfg={cliente:cli,data:$('prx_data').value,execNome:$('prx_execNome').value.trim(),execCargo:$('prx_execCargo').value.trim(),
      execTel:$('prx_execTel').value.trim(),execEmail:$('prx_execEmail').value.trim(),escopo:escopo(),servicos,fee:computeFee(),obs:$('prx_obs').value.trim()};
    const w=window.open('','_blank');
    if(!w){alert('Não foi possível abrir a apresentação. Verifique se o navegador bloqueou pop-ups.');return;}
    w.document.open();w.document.write(buildProposta(cfg,SNAP));w.document.close();
    closeModal();
  });

  /* ---------- botão na barra ---------- */
  function addButton(){
    const tools=q('.bar-tools');if(!tools||$('prx_btn'))return;
    const b=document.createElement('button');b.className='btn primary';b.id='prx_btn';
    b.innerHTML='<i data-lucide="file-signature"></i>Proposta comercial';
    b.addEventListener('click',openModal);tools.appendChild(b);
    if(window.lucide)lucide.createIcons();
  }
  addButton();

  /* ================= GERAÇÃO DA APRESENTAÇÃO ================= */
  function buildProposta(cfg,snap){
    const LOGO_S=(q('.brand-logo')||{}).src||'';
    const LOGO_W=(q('.hero-logo')||{}).src||LOGO_S;
    const dataFmt=cfg.data?new Date(cfg.data+'T00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}):'';
    const incl=cfg.servicos.map(k=>SVC[k]);
    let _n=0;const nn=()=>String(++_n).padStart(2,'0');
    const I={
      'shield-check':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
      'trending-up':'<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
      'building-2':'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M2 22h20"/><path d="M10 6h4M10 10h4M10 14h4"/>',
      'wallet':'<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M16 13h3"/>',
      'cpu':'<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
      'lock':'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
      'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      'star':'<path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/>',
      'layers':'<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>'
    };
    const ic=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${I[n]||''}</svg>`;
    const f=cfg.fee;let feeBig,feeLines='';
    if(f&&f.anual>0){feeBig=brl(f.anual)+' <span class="u">/ano</span>';
      feeLines+= f.modo==='pct'?`<p>Honorário de gestão de <b>${(f.p).toLocaleString('pt-BR',{maximumFractionDigits:2})}% ao ano</b> sobre o patrimônio sob gestão — base de <b>${brl(f.base)}</b>.</p>`:`<p>Honorário fixo de gestão.</p>`;
      feeLines+=`<p>Cobrança anual, faturada mensalmente em parcelas de <b>${brl(f.mensal)}</b>.</p>`;
    }else{feeBig='Sob proposta';feeLines='<p>Modelo de honorários a definir conforme o escopo final.</p>';}
    const execLines=[cfg.execNome?`<div class="ex-n">${esc(cfg.execNome)}</div>`:'',cfg.execCargo?`<div class="ex-c">${esc(cfg.execCargo)}</div>`:'',(cfg.execTel||cfg.execEmail)?`<div class="ex-x">${[cfg.execTel,cfg.execEmail].filter(Boolean).map(esc).join(' &middot; ')}</div>`:'',dataFmt?`<div class="ex-d">${dataFmt}</div>`:''].join('');
    const escTitle=cfg.escopo==='completo'?'Multi-Family Office — Modelo Completo':'Serviços selecionados';
    const escIntro=cfg.escopo==='completo'?'Cobertura integral, coordenada por uma única casa — o CFO profissional da sua família. Cada frente opera de forma integrada, sob uma visão consolidada do patrimônio.':'Serviços contratados de forma modular, com a mesma profundidade e independência do modelo completo.';
    const svcCards=incl.map(s=>`<div class="svc"><span class="svc-ic">${ic(s.icon)}</span><div><div class="svc-t">${s.nome}</div><div class="svc-d">${s.desc}</div></div></div>`).join('');
    const inclList=incl.map(s=>`<li>${s.nome}</li>`).join('');
    const steps=[['Diagnóstico patrimonial completo','Levantamento de todos os ativos e passivos — empresas, participações, imóveis, aplicações, dívidas, seguros e estruturas no Brasil e no exterior — e da dinâmica familiar.'],['Desenho da arquitetura patrimonial','Organização em blocos (negócios, imobiliário, liquidez, proteção, sucessão e governança) e estruturação de holdings e acordos com assessores jurídicos e tributários.'],['Implementação da gestão 360º','Controladoria patrimonial com consolidação e relatórios periódicos, alinhamento com especialistas e organização dos fluxos de caixa.'],['Acompanhamento contínuo','Reuniões periódicas, relatórios integrados e revisão de riscos, liquidez e sucessão — com ajustes a cada mudança relevante no patrimônio ou na família.']];
    const stepsHtml=steps.map((s,i)=>`<div class="step"><div class="st-n">${i+1}</div><div class="st-t">${s[0]}</div><div class="st-d">${s[1]}</div></div>`).join('');
    const diffs=[['cpu','Tecnologia própria','Sistemas próprios, dashboards automatizados e unificação das informações patrimoniais.'],['building-2','Gestão imobiliária','Imóveis tratados como carteira de investimentos, via Lidderar — diferencial raro no mercado.'],['lock','Segurança da informação','Gestão de senhas criptografada e controle de arquivos em rede própria.'],['users','Rede exclusiva','Acesso a especialistas de mercado e a clientes com negócios complementares.'],['star','Experiências privadas','Eventos, viagens de estudo e conteúdos estratégicos.'],['layers','Hub de negócios','Diversificação de serviços e produtos financeiros com uma única gestora.']];
    const diffsHtml=diffs.map(d=>`<div class="diff"><div class="d-ic">${ic(d[0])}</div><div class="d-t">${d[1]}</div><div class="d-d">${d[2]}</div></div>`).join('');
    const pros=['Maior eficiência tributária com coordenação entre pessoa física, empresas e estrutura familiar','Decisões baseadas em dados, relatórios e políticas — não em percepções','Redução de riscos de conflito por meio de governança clara','Alocação inteligente de capital entre negócios, imóveis, liquidez e proteção'];
    const cons=['Ineficiência tributária e societária por decisões desalinhadas entre PF, empresas e família','Decisões emocionais em momentos de crise ou conflito familiar','Paralisia ou disputa entre herdeiros por falta de clareza e processos','Oportunidades perdidas pela falta de visão consolidada de caixa e alocação'];
    const prosHtml=pros.map(x=>`<li>${x}</li>`).join('');
    const consHtml=cons.map(x=>`<li>${x}</li>`).join('');
    const obsHtml=cfg.obs?`<div class="obs"><b>Observações:</b> ${esc(cfg.obs)}</div>`:'';
    const ph=(label,no)=>`<div class="ph"><img src="${LOGO_S}" class="logo-s" alt="SOMMA"><span class="ph-l">${label}</span><span class="ph-n">${no}</span></div>`;

    let diagPage='';
    if(snap&&snap.total>0){
      const t=snap.total,GC={'Investimentos':'#486878','Imóveis':'#7a6a86','Participações Societárias':'#a98f5f','Veículos':'#9a6a5c','Exterior':'#5b8a86','Outros':'#8a979d'};
      const ordG=['Investimentos','Imóveis','Participações Societárias','Veículos','Exterior','Outros'];
      const gs=ordG.filter(g=>(snap.byG[g]||0)>0).map(g=>({g,v:snap.byG[g]}));const mg=Math.max.apply(null,gs.map(x=>x.v).concat([1]));
      const bars=gs.map(x=>`<div class="dg-row"><div class="dg-top"><span>${x.g}</span><span>${brl(x.v)} · ${pctf(x.v/t*100)}%</span></div><div class="dg-track"><div class="dg-fill" style="width:${x.v/mg*100}%;background:${GC[x.g]||'#8a979d'}"></div></div></div>`).join('');
      diagPage=`<section class="page">
  ${ph('Retrato do patrimônio',nn())}
  <h2 class="s">O patrimônio de ${esc(cfg.cliente)}, hoje</h2>
  <div class="diag">
    <div class="diag-l">
      <div class="diag-l-lab">Patrimônio consolidado</div>
      <div class="diag-total">${brl(snap.total)}</div>
      <div class="diag-stats"><div><b>${snap.nAtivos}</b> ativos mapeados</div><div><b>${snap.nEnt||'—'}</b> entidades${snap.root?` sob ${esc(snap.root)}`:''}</div><div><b>${snap.nInst}</b> instituições de custódia</div></div>
      <div class="diag-chips">
        <div class="chip"><span>Liquidez até 1 ano</span><b>${pctf(snap.liqShort/t*100)}%</b></div>
        <div class="chip"><span>Ilíquido</span><b>${pctf(snap.iliq/t*100)}%</b></div>
        <div class="chip"><span>Denominado em dólar</span><b>${pctf(snap.usd/t*100)}%</b></div>
        <div class="chip"><span>Exposição cambial</span><b>${pctf(snap.exp/t*100)}%</b></div>
      </div>
    </div>
    <div class="diag-r"><div class="diag-r-t">Composição por grupo patrimonial</div>${bars}</div>
  </div>
  <p class="diag-note">Retrato extraído do mapeamento patrimonial consolidado em reais (câmbio R$ ${snap.fx.toLocaleString('pt-BR',{minimumFractionDigits:2})}/US$). É justamente esta visão única — onshore e offshore, líquido e ilíquido — que a SOMMA mantém atualizada e sob gestão coordenada.</p>
</section>`;
    }

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SOMMA · Proposta Comercial — ${esc(cfg.cliente)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--slate:#486878;--slate-800:#2c424d;--slate-900:#1c2931;--paper:#fbfbf9;--paper-2:#f4f3ee;--rule:#e6e4dd;--rule-2:#d8d6cd;--champ:#c2a878;--champ-d:#a98f5f;--ink:#1c2931;--ink-2:#5a6b73;--ink-3:#8a979d;--r-diag:0 10px 0 10px;--r-diag-lg:0 16px 0 16px;}
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Inter',-apple-system,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.toolbar{position:sticky;top:0;z-index:10;background:#1c2931;color:#fff;display:flex;align-items:center;gap:16px;padding:12px 22px;font-size:12.5px}
.toolbar img{height:22px}.toolbar .sp{margin-left:auto}
.toolbar button{background:#fff;color:#1c2931;border:none;padding:9px 18px;border-radius:0 6px 0 6px;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer}
.page{width:297mm;height:210mm;box-sizing:border-box;overflow:hidden;page-break-after:always;position:relative;padding:17mm 19mm;background:var(--paper)}
.page:last-child{page-break-after:auto}
.page.dark{background:linear-gradient(135deg,#1c2931,#2c424d 62%,#24373f);color:#fff}
.accent{position:absolute;right:19mm;top:30mm;width:14px;height:14px;background:var(--champ);border-radius:0 4px 0 4px}
.kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--champ-d);font-weight:600}
.kicker.champ{color:var(--champ)}
h2.s{font-size:30px;font-weight:300;letter-spacing:-.01em;color:var(--slate-900);margin:6px 0 18px;max-width:82%}
h2.s.w{color:#fff}
.ph{display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--rule-2);padding-bottom:11px;margin-bottom:22px}
.ph .logo-s{height:24px}
.ph .ph-l{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-3);font-weight:500}
.ph .ph-n{margin-left:auto;font-size:11px;letter-spacing:.18em;color:var(--champ-d);font-weight:600}
.intro-p{font-size:14.5px;line-height:1.7;color:var(--ink-2);max-width:92%}
.cover{display:flex;flex-direction:column}
.cover .logo-w{height:34px;width:auto;align-self:flex-start}
.cover .cv-main{margin-top:auto}
.cover h1{font-size:54px;font-weight:300;letter-spacing:-.02em;line-height:1.02;margin-top:6px;color:#fff}
.cover .lead{font-size:15px;color:rgba(255,255,255,.74);margin-top:16px;max-width:62%;line-height:1.6}
.cover .for{margin-top:26px;font-size:13px;color:rgba(255,255,255,.6);line-height:1.5}
.cover .for strong{display:block;font-size:22px;color:#fff;font-weight:500;margin-top:3px;letter-spacing:-.01em}
.cover .cv-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.14)}
.cover .tag{font-size:14px;font-style:italic;color:var(--champ);max-width:54%;line-height:1.5}
.cover .exec{text-align:right;font-size:12px;color:rgba(255,255,255,.7);line-height:1.55}
.cover .exec .ex-n{font-size:14px;color:#fff;font-weight:600}
.cover .exec .ex-c{color:var(--champ)}
.cover .exec .ex-d{margin-top:8px;font-size:11px;letter-spacing:.04em;color:rgba(255,255,255,.5)}
.creds{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin:24px 0 22px}
.cred{border-top:2px solid var(--champ);padding-top:14px}
.cred .cn{font-size:42px;font-weight:300;letter-spacing:-.02em;color:var(--slate-900);line-height:1}
.cred .cn span{font-size:18px;color:var(--champ-d)}
.cred .cl{font-size:12px;color:var(--ink-2);margin-top:8px}
.selos{font-size:12px;color:var(--ink-3);letter-spacing:.02em;border-top:1px solid var(--rule);padding-top:16px;line-height:1.7}
.team{font-size:12.5px;color:var(--ink-2);margin-top:14px}.team b{color:var(--slate-800)}
.indep{display:grid;grid-template-columns:1.1fr 1fr;gap:34px;margin-top:8px}
.indep p{font-size:14px;line-height:1.7;color:rgba(255,255,255,.82);margin-bottom:16px}
.indep .ind-list{list-style:none;display:flex;flex-direction:column;gap:14px}
.indep .ind-list li{font-size:13.5px;line-height:1.5;color:rgba(255,255,255,.9);padding-left:20px;position:relative}
.indep .ind-list li:before{content:"";position:absolute;left:0;top:7px;width:9px;height:9px;background:var(--champ);border-radius:0 3px 0 3px}
.indep .ind-list b{color:#fff;font-weight:600}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:6px}
.cmp{border:1px solid var(--rule);border-radius:var(--r-diag-lg);padding:24px 26px}
.cmp-pro{background:linear-gradient(160deg,#fff,#f7f9fa);border-color:var(--rule-2)}
.cmp-con{background:var(--paper-2)}
.cmp-h{font-size:13px;font-weight:600;letter-spacing:.02em;margin-bottom:16px}
.cmp-pro .cmp-h{color:var(--slate-800)}.cmp-con .cmp-h{color:var(--ink-3)}
.cmp ul{list-style:none;display:flex;flex-direction:column;gap:13px}
.cmp li{font-size:13px;line-height:1.5;padding-left:22px;position:relative;color:var(--ink-2)}
.cmp-pro li{color:var(--ink)}
.cmp-pro li:before{content:"";position:absolute;left:2px;top:4px;width:9px;height:5px;border:2px solid var(--champ);border-top:none;border-right:none;transform:rotate(-45deg)}
.cmp-con li:before{content:"—";position:absolute;left:0;top:0;color:var(--ink-3)}
.svc-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:6px}
.svc{display:flex;gap:14px;border:1px solid var(--rule);border-radius:var(--r-diag);padding:18px 20px;background:#fff}
.svc .svc-ic{width:40px;height:40px;border-radius:0 8px 0 8px;background:var(--slate-800);color:#fff;display:flex;align-items:center;justify-content:center;flex:none}
.svc .svc-ic svg{width:20px;height:20px}
.svc .svc-t{font-size:14px;font-weight:600;color:var(--slate-900)}
.svc .svc-d{font-size:12px;color:var(--ink-2);margin-top:5px;line-height:1.5}
.obs{margin-top:18px;font-size:12.5px;color:var(--ink-2);border-left:3px solid var(--champ);padding:4px 0 4px 14px;line-height:1.6}
.obs b{color:var(--slate-800)}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:8px}
.step .st-n{width:34px;height:34px;border-radius:0 8px 0 8px;background:var(--champ);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600;margin-bottom:14px}
.step .st-t{font-size:14px;font-weight:600;color:var(--slate-900);line-height:1.25;margin-bottom:10px;min-height:42px}
.step .st-d{font-size:11.5px;color:var(--ink-2);line-height:1.55}
.diffs{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 24px;margin-top:10px}
.diff .d-ic{width:38px;height:38px;border-radius:0 8px 0 8px;background:rgba(194,168,120,.16);border:1px solid rgba(194,168,120,.4);color:var(--champ);display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.diff .d-ic svg{width:19px;height:19px}
.diff .d-t{font-size:14px;font-weight:600;color:#fff;margin-bottom:6px}
.diff .d-d{font-size:12px;color:rgba(255,255,255,.72);line-height:1.55}
.fee-wrap{display:grid;grid-template-columns:1.4fr 1fr;gap:22px;margin-top:6px;align-items:stretch}
.fee-box{background:linear-gradient(160deg,#1c2931,#2c424d);color:#fff;border-radius:var(--r-diag-lg);padding:30px 32px;display:flex;flex-direction:column;justify-content:center}
.fee-box .fee-l{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.55);font-weight:500}
.fee-box .fee-big{font-size:44px;font-weight:300;letter-spacing:-.02em;margin:10px 0 14px;line-height:1}
.fee-box .fee-big .u{font-size:18px;color:var(--champ)}
.fee-box p{font-size:13px;line-height:1.6;color:rgba(255,255,255,.82);margin-top:6px}
.fee-box p b{color:var(--champ)}
.fee-side{border:1px solid var(--rule);border-radius:var(--r-diag-lg);padding:24px 26px;background:#fff}
.fee-side .fs-t{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--champ-d);font-weight:600;margin-bottom:14px}
.fee-side ul{list-style:none;display:flex;flex-direction:column;gap:11px}
.fee-side li{font-size:13px;color:var(--ink);padding-left:18px;position:relative;line-height:1.4}
.fee-side li:before{content:"";position:absolute;left:0;top:6px;width:8px;height:8px;background:var(--slate);border-radius:0 2px 0 2px}
.fine{font-size:10.5px;color:var(--ink-3);margin-top:20px;line-height:1.6;border-top:1px solid var(--rule);padding-top:14px}
.diag{display:grid;grid-template-columns:.85fr 1.15fr;gap:30px;margin-top:6px;align-items:start}
.diag-l-lab{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--champ-d);font-weight:600}
.diag-total{font-size:44px;font-weight:300;letter-spacing:-.02em;color:var(--slate-900);line-height:1;margin:8px 0 18px}
.diag-stats{display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--ink-2)}
.diag-stats b{color:var(--slate-900);font-weight:600}
.diag-chips{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
.chip{border:1px solid var(--rule);border-radius:0 8px 0 8px;padding:11px 13px}
.chip span{display:block;font-size:10.5px;color:var(--ink-3);letter-spacing:.04em}
.chip b{font-size:18px;font-weight:300;color:var(--slate-800)}
.diag-r-t{font-size:13px;font-weight:600;color:var(--slate-900);margin-bottom:14px}
.dg-row{margin-bottom:12px}
.dg-top{display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;color:var(--ink-2)}
.dg-top span:first-child{color:var(--slate-900)}
.dg-track{height:8px;background:var(--paper-2);border-radius:4px;overflow:hidden}
.dg-fill{height:100%;border-radius:4px}
.diag-note{font-size:11.5px;color:var(--ink-3);margin-top:20px;line-height:1.6;border-top:1px solid var(--rule);padding-top:14px}
.close{display:flex;flex-direction:column}
.close .logo-w{height:30px;align-self:flex-start}
.close h2.big{font-size:42px;font-weight:300;line-height:1.1;margin-top:auto;max-width:78%;letter-spacing:-.01em;color:#fff}
.close .close-grid{display:grid;grid-template-columns:1fr 1fr;gap:34px;margin-top:34px;padding-top:26px;border-top:1px solid rgba(255,255,255,.16)}
.close .cg .cg-t{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--champ);font-weight:600;margin-bottom:12px}
.close .cg div{font-size:13px;color:rgba(255,255,255,.82);line-height:1.7}
.close .cg .cg-n{font-size:16px;color:#fff;font-weight:600}
.close .cg .cg-c{color:var(--champ)}
.close .cg .cg-off{margin-top:10px;font-size:11.5px;color:rgba(255,255,255,.55)}
@media screen{body{background:#39464f;padding:22px 0}.page{margin:0 auto 20px;box-shadow:0 12px 44px rgba(0,0,0,.4)}}
@media print{@page{size:A4 landscape;margin:0}body{background:#fff;padding:0}.toolbar{display:none}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="toolbar"><img src="${LOGO_W}" alt="SOMMA"><span>Proposta comercial &middot; ${esc(cfg.cliente)}</span><span class="sp"></span><button onclick="window.print()">Imprimir / Salvar como PDF</button></div>
<section class="page dark cover">
  <img class="logo-w" src="${LOGO_W}" alt="SOMMA Multi-Family Office">
  <div class="cv-main">
    <div class="kicker champ">Proposta Comercial</div>
    <h1>Multi-Family Office</h1>
    <p class="lead">Gestão patrimonial 360º, coordenada por uma casa independente, para a proteção, a perpetuação e a multiplicação do seu patrimônio.</p>
    <div class="for">Preparada para<strong>${esc(cfg.cliente)}</strong></div>
  </div>
  <div class="cv-foot"><div class="tag">"Confiar em quem transforma oportunidade em decisão segura."</div><div class="exec">${execLines}</div></div>
</section>
<section class="page">
  ${ph('Quem somos',nn())}
  <h2 class="s">O CFO profissional da sua família</h2>
  <p class="intro-p">A SOMMA é um Multi-Family Office independente com mais de duas décadas de história, atuando como guardião da estrutura patrimonial de famílias empresárias, herdeiros e investidores de alto patrimônio no Brasil. Cobrimos, de forma coordenada, todas as áreas que competem a um patrimônio familiar — investimentos, planejamento patrimonial e sucessório, controladoria de contas e gestão imobiliária.</p>
  <div class="creds">
    <div class="cred"><div class="cn">23<span>+</span></div><div class="cl">anos de mercado</div></div>
    <div class="cred"><div class="cn"><span>+R$ </span>18<span> bi</span></div><div class="cl">sob gestão</div></div>
    <div class="cred"><div class="cn">80<span>+</span></div><div class="cl">profissionais</div></div>
    <div class="cred"><div class="cn">35<span>+</span></div><div class="cl">famílias atendidas</div></div>
  </div>
  <div class="selos">PRI Signatory &middot; ANBIMA Gestão de Patrimônio &middot; ANBIMA Gestão de Recursos &middot; Florianópolis &middot; Jaraguá do Sul &middot; Chapecó &middot; São Paulo</div>
  <div class="team">Liderança: <b>Wilson Souza</b> (CEO, CGA) &middot; <b>Rodrigo Costa</b> (Diretor, CFP®) &middot; <b>Felipe Faraco</b> (Diretor)</div>
</section>
${diagPage}
<section class="page dark">
  <span class="accent"></span>
  <div class="kicker champ">Independência</div>
  <h2 class="s w">Uma casa independente e agnóstica, sem conflito de interesse.</h2>
  <div class="indep">
    <div><p>Não somos ligados a nenhum banco. A plataforma — escolhida por você — é apenas o canal por onde gerimos os recursos, sem qualquer limitação ou dependência.</p><p>Isso elimina o conflito de interesse típico do modelo bancário: nossa recomendação responde exclusivamente aos objetivos da sua família, e não às metas de distribuição de uma instituição.</p></div>
    <ul class="ind-list"><li>Atuação <b>bank-agnostic</b>: gerimos seu patrimônio onde ele estiver.</li><li>Remuneração alinhada à família, não a produtos de prateleira.</li><li>Consolidação global — uma visão única de tudo, onshore e offshore.</li><li>Decisões técnicas, baseadas em dados e governança.</li></ul>
  </div>
</section>
<section class="page">
  ${ph('Por que um Multi-Family Office',nn())}
  <h2 class="s">O que muda com a gestão coordenada</h2>
  <div class="compare"><div class="cmp cmp-pro"><div class="cmp-h">Com a SOMMA Multi-Family Office</div><ul>${prosHtml}</ul></div><div class="cmp cmp-con"><div class="cmp-h">Modelo tradicional, fragmentado</div><ul>${consHtml}</ul></div></div>
</section>
<section class="page">
  ${ph('Escopo da proposta',nn())}
  <h2 class="s">${escTitle}</h2>
  <p class="intro-p" style="margin-bottom:20px">${escIntro}</p>
  <div class="svc-cards">${svcCards}</div>
  ${obsHtml}
</section>
<section class="page">
  ${ph('Como trabalhamos',nn())}
  <h2 class="s">Um método claro, execução disciplinada</h2>
  <div class="steps">${stepsHtml}</div>
</section>
<section class="page dark">
  <span class="accent"></span>
  <div class="kicker champ">Diferenciais SOMMA</div>
  <h2 class="s w">O que nos torna diferentes</h2>
  <div class="diffs">${diffsHtml}</div>
</section>
<section class="page">
  ${ph('Investimento',nn())}
  <h2 class="s">Modelo de honorários</h2>
  <div class="fee-wrap"><div class="fee-box"><div class="fee-l">Honorário de gestão</div><div class="fee-big">${feeBig}</div>${feeLines}</div><div class="fee-side"><div class="fs-t">O que está incluído</div><ul>${inclList}</ul></div></div>
  <p class="fine">Proposta referente aos serviços de Multi-Family Office descritos. Não constitui recomendação de investimento, avaliação fiscal ou contábil. Valores e escopo sujeitos a confirmação. Documento informativo e confidencial, destinado exclusivamente a ${esc(cfg.cliente)}.</p>
</section>
<section class="page dark close">
  <img class="logo-w" src="${LOGO_W}" alt="SOMMA Multi-Family Office">
  <h2 class="s w big">Transforme suas oportunidades em decisões seguras.</h2>
  <div class="close-grid">
    <div class="cg"><div class="cg-t">Seu contato na SOMMA</div>${cfg.execNome?`<div class="cg-n">${esc(cfg.execNome)}</div>`:''}${cfg.execCargo?`<div class="cg-c">${esc(cfg.execCargo)}</div>`:''}${cfg.execTel?`<div>${esc(cfg.execTel)}</div>`:''}${cfg.execEmail?`<div>${esc(cfg.execEmail)}</div>`:''}</div>
    <div class="cg"><div class="cg-t">SOMMA Multi-Family Office</div><div>www.sommainvestimentos.com.br</div><div>contato@sommainvestimentos.com.br</div><div class="cg-off">Florianópolis &middot; Jaraguá do Sul &middot; Chapecó &middot; São Paulo</div></div>
  </div>
</section>
</body></html>`;
  }
})();
