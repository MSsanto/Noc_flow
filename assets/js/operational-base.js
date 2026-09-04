
(function initOperationalBaseValidation(){
    const EMBEDDED_BASE_PAYLOAD = window.NOCFLOW_CONFIG.base;
    const OPERATIONAL_BASE_OVERRIDE_KEY = 'nocflow_v1_OperationalBaseOverride';
    function readOperationalBasePayload() {
        try {
            const saved = JSON.parse(localStorage.getItem(OPERATIONAL_BASE_OVERRIDE_KEY) || 'null');
            if (saved && Array.isArray(saved.records) && saved.records.length) return saved;
        } catch (error) {
            console.warn('Base operacional local inválida; usando base embarcada.', error);
        }
        return EMBEDDED_BASE_PAYLOAD;
    }
    let CURRENT_BASE_PAYLOAD = readOperationalBasePayload();
    let BASE = CURRENT_BASE_PAYLOAD.records || [];
    let byIbm = new Map();
    function rebuildBaseIndex() {
        byIbm = new Map(BASE.filter(x => x.ibm).map(x => [String(x.ibm).replace(/\D/g,''), x]));
    }
    rebuildBaseIndex();

    const normalize = (value) => String(value || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .toLowerCase().replace(/[’'`]/g,'').replace(/\s+/g,' ').trim();

    const digits = (value) => String(value || '').replace(/\D/g,'');
    function formatCnpj(value) {
        const d = digits(value);
        return d.length === 14 ? `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}` : (value || 'Não informado');
    }
    function formatPhone(value) {
        const d = digits(value);
        if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
        if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
        return String(value || 'Não informado');
    }
    function storeSearchText(store) {
        return normalize([store.unidade, store.ibm, store.cnpj, store.centroCusto, store.bandeira, store.endereco].join(' '));
    }
    function extractIbm(site) {
        const text = String(site || '');
        const match = text.match(/(?:SP\\?[_-]|_)(\d{6,8})(?:\D|$)/i) || text.match(/\b(10\d{5})\b/);
        return match ? match[1] : '';
    }
    function extractStoreName(site) {
        return String(site || '')
            
            .replace(/\s*-\s*SP\\?[_-]?\d{6,8}.*$/i,'')
            .replace(/\s*-\s*SP\s*$/i,'')
            .trim();
    }
    function findStoreForAlert(alert) {
        const ibm = extractIbm(alert && alert.siteLocalidade);
        if (ibm && byIbm.has(ibm)) return byIbm.get(ibm);
        const name = normalize(extractStoreName(alert && alert.siteLocalidade));
        if (!name) return null;
        let exact = BASE.find(store => normalize(store.unidade) === name);
        if (exact) return exact;
        const candidates = BASE.filter(store => normalize(store.unidade).includes(name) || name.includes(normalize(store.unidade)));
        return candidates.length === 1 ? candidates[0] : null;
    }
    function validValue(value) {
        const v = normalize(value);
        return v && !['n/a','#n/a','na','null','undefined'].includes(v);
    }
    function getLink(store, wan) {
        const link = store && store.links ? store.links[wan] : null;
        return link || {operadora:'',designacao:'',velocidade:''};
    }
    function availableWans(store) {
        return ['WAN 1','WAN 2'].filter(wan => {
            const l=getLink(store,wan);
            return validValue(l.operadora) || validValue(l.designacao);
        });
    }
    function preferredWan(alert, store) {
        const status=String(alert && alert.wanStatus || '');
        if (status === 'WAN 1' || status === 'WAN 2') return status;
        const avail=availableWans(store);
        return avail[0] || 'WAN 1';
    }
    function generatedCarrierText(store, wan, internalTicket) {
        const link=getLink(store,wan);
        return [
            `**Solicitação de Abertura de Chamado – ${store.unidade}**`,
            '',
            'Prezados,',
            '',
            `Solicito abertura de chamado para a unidade **${store.unidade}**, conforme dados abaixo:`,
            '',
            `Razão Social: ${window.NOCFLOW_CONFIG.client.legalName}`,
            '',
            `CNPJ: ${formatCnpj(store.cnpj)}`,
            '',
            `Endereço: ${store.endereco || 'Não informado'}`,
            '',
            `**Operadora:** ${link.operadora || 'Não informado'}`,
            '',
            `**Designação:** ${link.designacao || 'Não informado'}`,
            '',
            `Telefone da Unidade: ${formatPhone(store.telefone)}`,
            '',
            `Chamado interno: ${internalTicket || ''}`,
            '',
            `Telefone NOC: ${window.NOCFLOW_CONFIG.contacts.noc}`,
            '',
            'Sintomas: LINK INDISPONÍVEL'
        ].join('\n');
    }

    const baseModal=document.getElementById('operationalBaseModal');
    const baseSearch=document.getElementById('operationalBaseSearch');
    const baseBrand=document.getElementById('operationalBaseBrand');
    const baseList=document.getElementById('operationalBaseList');
    const baseDetail=document.getElementById('operationalBaseDetail');
    const ticketModal=document.getElementById('carrierTicketModal');
    const ticketStoreName=document.getElementById('ticketStoreName');
    const ticketStoreIbm=document.getElementById('ticketStoreIbm');
    const ticketWan=document.getElementById('ticketWan');
    const ticketOperator=document.getElementById('ticketOperator');
    const ticketDesignation=document.getElementById('ticketDesignation');
    const ticketInternal=document.getElementById('ticketInternal');
    const ticketSpeed=document.getElementById('ticketSpeed');
    const ticketPreview=document.getElementById('carrierTicketPreview');
    const ticketSubtitle=document.getElementById('carrierTicketSubtitle');
    let selectedStore=null;
    let selectedAlert=null;

    const baseMeta=document.getElementById('operationalBaseMeta');
    const baseFileInput=document.getElementById('operationalBaseFileInput');
    function refreshBaseMetadata() {
        document.getElementById('baseOperationalCount').textContent=BASE.length;
        const stamp = CURRENT_BASE_PAYLOAD.importedAt || CURRENT_BASE_PAYLOAD.generatedAt || '';
        const when = stamp ? new Date(stamp).toLocaleString('pt-BR') : 'snapshot embarcado';
        const source = CURRENT_BASE_PAYLOAD.sourceFile || CURRENT_BASE_PAYLOAD.source || 'Base operacional';
        baseMeta.textContent = `${BASE.length} registros · ${source} · ${when}`;
    }
    function refreshBaseBrands() {
        const selected=baseBrand.value;
        baseBrand.innerHTML='<option value="">Todas as bandeiras</option>';
        [...new Set(BASE.map(x=>x.bandeira).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(brand=>{
            const option=document.createElement('option'); option.value=brand; option.textContent=brand; baseBrand.appendChild(option);
        });
        if ([...baseBrand.options].some(o=>o.value===selected)) baseBrand.value=selected;
    }
    refreshBaseMetadata();
    refreshBaseBrands();

    function parseDelimitedText(text) {
        const firstLine=(String(text||'').split(/\r?\n/).find(line=>line.trim())||'');
        const semis=(firstLine.match(/;/g)||[]).length, commas=(firstLine.match(/,/g)||[]).length;
        const delimiter=semis>=commas?';':',';
        const rows=[]; let row=[], field='', quoted=false;
        const input=String(text||'').replace(/^\uFEFF/,'');
        for (let i=0;i<input.length;i++) {
            const ch=input[i];
            if (quoted) {
                if (ch==='"' && input[i+1]==='"') { field+='"'; i++; }
                else if (ch==='"') quoted=false;
                else field+=ch;
            } else {
                if (ch==='"') quoted=true;
                else if (ch===delimiter) { row.push(field); field=''; }
                else if (ch==='\n') { row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
                else field+=ch;
            }
        }
        if (field.length || row.length) { row.push(field.replace(/\r$/,'')); rows.push(row); }
        return rows.filter(r=>r.some(v=>String(v).trim()));
    }
    function normalizedHeader(value) {
        return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'');
    }
    function cleanCell(value) { return String(value == null ? '' : value).trim(); }
    function recordsFromCsv(text) {
        const rows=parseDelimitedText(text);
        if (rows.length<2) throw new Error('CSV sem linhas suficientes.');
        const headers=rows[0].map(normalizedHeader);
        const indexOf=(...names)=>{ for (const name of names) { const i=headers.indexOf(normalizedHeader(name)); if (i>=0) return i; } return -1; };
        const idx={
            ibm:indexOf('ID','ID da unidade','IBM'), centroCusto:indexOf('CENTRO DE CUSTO'), bandeira:indexOf('BANDEIRA'), cnpj:indexOf('CNPJ'),
            unidade:indexOf('UNIDADE','UNIDADES'), telefone:indexOf('TELEFONE'), endereco:indexOf('ENDEREÇO','ENDERECO'),
            d1:indexOf('DESIGNAÇÃO LINK 1','DESIGNACAO LINK 1'), o1:indexOf('OPERADORA LINK 1'), v1:indexOf('VELOCIDADE LINK 1'),
            d2:indexOf('DESIGNAÇÃO LINK 2','DESIGNACAO LINK 2'), o2:indexOf('OPERADORA LINK 2'), v2:indexOf('VELOCIDADE LINK 2')
        };
        if (idx.unidade<0) throw new Error('Coluna UNIDADE não encontrada. Use o formato documentado de importação.');
        return rows.slice(1).map(r=>({
            ibm:idx.ibm>=0?cleanCell(r[idx.ibm]):'', centroCusto:idx.centroCusto>=0?cleanCell(r[idx.centroCusto]):'', bandeira:idx.bandeira>=0?cleanCell(r[idx.bandeira]):'',
            cnpj:idx.cnpj>=0?cleanCell(r[idx.cnpj]):'', unidade:cleanCell(r[idx.unidade]), telefone:idx.telefone>=0?cleanCell(r[idx.telefone]):'', endereco:idx.endereco>=0?cleanCell(r[idx.endereco]):'',
            links:{
                'WAN 1':{designacao:idx.d1>=0?cleanCell(r[idx.d1]):'', operadora:idx.o1>=0?cleanCell(r[idx.o1]):'', velocidade:idx.v1>=0?cleanCell(r[idx.v1]):''},
                'WAN 2':{designacao:idx.d2>=0?cleanCell(r[idx.d2]):'', operadora:idx.o2>=0?cleanCell(r[idx.o2]):'', velocidade:idx.v2>=0?cleanCell(r[idx.v2]):''}
            }
        })).filter(x=>x.unidade);
    }
    function sanitizeImportedRecords(records) {
        return (Array.isArray(records)?records:[]).map(item=>({
            ibm:cleanCell(item.ibm), centroCusto:cleanCell(item.centroCusto), bandeira:cleanCell(item.bandeira), cnpj:cleanCell(item.cnpj), unidade:cleanCell(item.unidade), telefone:cleanCell(item.telefone), endereco:cleanCell(item.endereco),
            links:{
                'WAN 1':{designacao:cleanCell(item.links&&item.links['WAN 1']&&item.links['WAN 1'].designacao),operadora:cleanCell(item.links&&item.links['WAN 1']&&item.links['WAN 1'].operadora),velocidade:cleanCell(item.links&&item.links['WAN 1']&&item.links['WAN 1'].velocidade)},
                'WAN 2':{designacao:cleanCell(item.links&&item.links['WAN 2']&&item.links['WAN 2'].designacao),operadora:cleanCell(item.links&&item.links['WAN 2']&&item.links['WAN 2'].operadora),velocidade:cleanCell(item.links&&item.links['WAN 2']&&item.links['WAN 2'].velocidade)}
            }
        })).filter(x=>x.unidade);
    }
    function applyOperationalBase(payload, persist=true) {
        const records=sanitizeImportedRecords(payload&&payload.records);
        if (!records.length) throw new Error('Nenhum registro válido encontrado.');
        CURRENT_BASE_PAYLOAD={...payload,records,recordCount:records.length};
        BASE=records; rebuildBaseIndex();
        if (persist) localStorage.setItem(OPERATIONAL_BASE_OVERRIDE_KEY,JSON.stringify(CURRENT_BASE_PAYLOAD));
        selectedStore=null; baseDetail.innerHTML='<div class="base-detail-empty">Selecione uma unidade para visualizar os dados dos links.</div>';
        refreshBaseBrands(); refreshBaseMetadata(); renderBaseResults();
        if (typeof renderAlerts==='function') renderAlerts();
    }
    async function importOperationalBaseFile(file) {
        if (!file) return;
        const text=await file.text();
        let records, source=file.name;
        if (/\.json$/i.test(file.name) || file.type==='application/json') {
            const parsed=JSON.parse(text); records=Array.isArray(parsed)?parsed:parsed.records;
        } else {
            records=recordsFromCsv(text);
        }
        applyOperationalBase({source,sourceFile:file.name,importedAt:new Date().toISOString(),environment:'DEMOUCAO',records},true);
        showModal('Base operacional atualizada',`${BASE.length} registros foram carregados localmente. Apenas campos operacionais permitidos foram importados localmente.`);
    }

    function renderBaseResults() {
        const term=normalize(baseSearch.value);
        const brand=baseBrand.value;
        let rows=BASE.filter(store => (!brand || store.bandeira === brand) && (!term || storeSearchText(store).includes(term)));
        if (!term) rows=rows.slice(0,40); else rows=rows.slice(0,60);
        baseList.innerHTML='';
        if (!rows.length) {
            baseList.innerHTML='<div style="padding:18px;color:var(--muted);font-size:11px;text-align:center">Nenhuma unidade encontrada.</div>';
            return;
        }
        rows.forEach(store=>{
            const btn=document.createElement('button');
            btn.type='button'; btn.className='base-result-item';
            if (selectedStore && selectedStore.ibm === store.ibm) btn.classList.add('active');
            btn.innerHTML=`<strong>${escapeHtml(store.unidade)}</strong><span>ID da unidade ${escapeHtml(store.ibm || '—')} · ${escapeHtml(store.bandeira || '—')} · ${escapeHtml(store.centroCusto || '—')}</span>`;
            btn.addEventListener('click',()=>{ selectedStore=store; renderBaseResults(); renderStoreDetail(store); });
            baseList.appendChild(btn);
        });
    }
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
    }
    function linkCard(store, wan) {
        const link=getLink(store,wan);
        const disabled=!(validValue(link.operadora)||validValue(link.designacao));
        return `<div class="base-link-card">
            <h4>${wan}</h4>
            <div class="base-link-row"><strong>Operadora:</strong> ${escapeHtml(link.operadora || 'Não informado')}</div>
            <div class="base-link-row"><strong>Designação:</strong> ${escapeHtml(link.designacao || 'Não informado')}</div>
            <div class="base-link-row"><strong>Velocidade:</strong> ${escapeHtml(link.velocidade || 'Não informado')}</div>
            <button type="button" data-generate-wan="${wan}" ${disabled?'disabled style="opacity:.45;cursor:not-allowed"':''}>Gerar abertura ${wan}</button>
        </div>`;
    }
    function renderStoreDetail(store) {
        baseDetail.innerHTML=`<div class="base-store-head">
            <div><h3>${escapeHtml(store.unidade)}</h3><small>${escapeHtml(store.bandeira || 'Bandeira não informada')}</small></div>
            <div style="text-align:right"><div style="font-size:9px;color:var(--muted);text-transform:uppercase;font-weight:800">ID da unidade</div><strong style="font-size:13px">${escapeHtml(store.ibm || '—')}</strong></div>
        </div>
        <div class="base-grid">
            <div class="base-kv"><label>CNPJ</label><div>${escapeHtml(formatCnpj(store.cnpj))}</div></div>
            <div class="base-kv"><label>Telefone</label><div>${escapeHtml(formatPhone(store.telefone))}</div></div>
            <div class="base-kv"><label>Centro de custo</label><div>${escapeHtml(store.centroCusto || 'Não informado')}</div></div>
            <div class="base-kv"><label>Bandeira</label><div>${escapeHtml(store.bandeira || 'Não informado')}</div></div>
            <div class="base-kv base-address"><label>Endereço</label><div>${escapeHtml(store.endereco || 'Não informado')}</div></div>
        </div>
        <div class="base-links">${linkCard(store,'WAN 1')}${linkCard(store,'WAN 2')}</div>`;
        baseDetail.querySelectorAll('[data-generate-wan]').forEach(btn=>btn.addEventListener('click',()=>openTicket(store,btn.dataset.generateWan,null)));
    }
    function openBase(prefill='') {
        baseModal.classList.remove('hidden');
        if (prefill) baseSearch.value=prefill;
        renderBaseResults();
        setTimeout(()=>baseSearch.focus(),100);
    }
    function closeBase(){ baseModal.classList.add('hidden'); }
    function closeTicket(){ ticketModal.classList.add('hidden'); }

    function refreshTicket() {
        if (!selectedStore) return;
        const wan=ticketWan.value || 'WAN 1';
        const link=getLink(selectedStore,wan);
        ticketOperator.value=link.operadora || 'Não informado';
        ticketDesignation.value=link.designacao || 'Não informado';
        ticketSpeed.value=link.velocidade || 'Não informado';
        ticketPreview.value=generatedCarrierText(selectedStore,wan,ticketInternal.value.trim());
        ticketSubtitle.textContent=`${selectedStore.unidade} · ${wan} · dados carregados automaticamente da Base Operacional`;
    }
    function openTicket(store, wan, alert) {
        selectedStore=store; selectedAlert=alert || null;
        ticketStoreName.value=store.unidade; ticketStoreIbm.value=store.ibm || '';
        const wans=availableWans(store);
        ticketWan.innerHTML='';
        (wans.length?wans:['WAN 1','WAN 2']).forEach(item=>{
            const op=document.createElement('option'); op.value=item; op.textContent=item; ticketWan.appendChild(op);
        });
        ticketWan.value=(wans.includes(wan)?wan:(wans[0]||wan||'WAN 1'));
        ticketInternal.value=(alert && (alert.itsm || alert.numeroChamado)) || '';
        refreshTicket();
        baseModal.classList.add('hidden');
        ticketModal.classList.remove('hidden');
    }
    window.openCarrierTicketGenerator=function(alert){
        const store=findStoreForAlert(alert);
        if (!store) {
            openBase(extractStoreName(alert && alert.siteLocalidade));
            showModal('Base operacional','Não encontrei uma correspondência única automática. A consulta foi aberta para você selecionar a unidade.');
            return;
        }
        openTicket(store,preferredWan(alert,store),alert);
    };

    function decorateAlertCards() {
        if (typeof activeAlerts === 'undefined' || typeof initialAlertsContainer === 'undefined') return;
        const items=activeAlerts.filter(alert=>!alert.isUpdated).slice();
        if (typeof sortAlertsArray === 'function') sortAlertsArray(items,currentInitialAlertSortCriteria);
        const cards=[...initialAlertsContainer.querySelectorAll('.alert-card')];
        cards.forEach((card,index)=>{
            if (card.dataset.baseOperationalDecorated === '1') return;
            const alert=items[index]; if (!alert) return;
            const store=findStoreForAlert(alert);
            const strip=document.createElement('div');
            strip.className='base-enrichment'+(store?'':' base-enrichment-miss');
            if (store) {
                const wan=preferredWan(alert,store), link=getLink(store,wan);
                strip.innerHTML=`<div class="base-enrichment-main"><div class="base-enrichment-label">▦ Base Operacional vinculada</div>
                    <div class="base-enrichment-title">${escapeHtml(store.unidade)} · ID da unidade ${escapeHtml(store.ibm || '—')}</div>
                    <div class="base-enrichment-meta">${escapeHtml(wan)} · ${escapeHtml(link.operadora || 'Operadora não informada')} · ${escapeHtml(link.designacao || 'Designação não informada')}</div></div>`;
            } else {
                strip.innerHTML=`<div class="base-enrichment-main"><div class="base-enrichment-label">Base não vinculada automaticamente</div>
                    <div class="base-enrichment-title">Selecione a unidade para consultar circuito e operadora</div></div>`;
            }
            const btn=document.createElement('button');
            btn.type='button'; btn.textContent=store?'📡 Gerar chamado operadora':'🔎 Consultar base';
            btn.addEventListener('click',()=>store?openTicket(store,preferredWan(alert,store),alert):openBase(extractStoreName(alert.siteLocalidade)));
            strip.appendChild(btn);
            const actions=card.querySelector('.mt-3');
            card.insertBefore(strip,actions || null);
            card.dataset.baseOperationalDecorated='1';
        });
    }

    const currentRenderAlerts=renderAlerts;
    renderAlerts=function(){ currentRenderAlerts(); decorateAlertCards(); };
    decorateAlertCards();

    document.getElementById('openOperationalBaseBtn').addEventListener('click',()=>openBase());
    document.getElementById('closeOperationalBaseBtn').addEventListener('click',closeBase);
    document.getElementById('closeCarrierTicketBtn').addEventListener('click',closeTicket);
    document.getElementById('backToOperationalBaseBtn').addEventListener('click',()=>{ closeTicket(); openBase(selectedStore ? selectedStore.unidade : ''); });
    baseSearch.addEventListener('input',renderBaseResults);
    baseBrand.addEventListener('change',renderBaseResults);
    ticketWan.addEventListener('change',refreshTicket);
    ticketInternal.addEventListener('input',refreshTicket);
    document.getElementById('copyCarrierTicketBtn').addEventListener('click',()=>copyToClipboard(ticketPreview.value,ticketModal));
    document.getElementById('importOperationalBaseBtn').addEventListener('click',()=>baseFileInput.click());
    baseFileInput.addEventListener('change',async()=>{
        try { await importOperationalBaseFile(baseFileInput.files && baseFileInput.files[0]); }
        catch (error) { console.error(error); showModal('Falha ao atualizar base',error.message || 'Arquivo inválido.'); }
        finally { baseFileInput.value=''; }
    });
    document.getElementById('resetOperationalBaseBtn').addEventListener('click',()=>{
        localStorage.removeItem(OPERATIONAL_BASE_OVERRIDE_KEY);
        CURRENT_BASE_PAYLOAD=EMBEDDED_BASE_PAYLOAD; BASE=EMBEDDED_BASE_PAYLOAD.records||[]; rebuildBaseIndex();
        selectedStore=null; refreshBaseBrands(); refreshBaseMetadata(); renderBaseResults(); if(typeof renderAlerts==='function')renderAlerts();
        showModal('Base restaurada',`A base fictícia embarcada foi restaurada (${BASE.length} registros).`);
    });
    baseModal.addEventListener('click',e=>{if(e.target===baseModal)closeBase();});
    ticketModal.addEventListener('click',e=>{if(e.target===ticketModal)closeTicket();});

    renderBaseResults();
})();
