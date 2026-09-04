const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function environment() {
 const elements = new Map();
 const element = () => ({value:'',textContent:'',innerHTML:'',style:{},dataset:{},files:[],children:[],get options(){return this.children},
  classList:{add(){},remove(){},contains(){return false},toggle(){}},listeners:{},
  addEventListener(name,fn){this.listeners[name]=fn},appendChild(child){this.children.push(child);return child},
  replaceChildren(...children){this.children=children},add(child){this.children.push(child)},
  querySelectorAll(){return []},querySelector(){return element()},setAttribute(){},getAttribute(){return ''},
  removeAttribute(){},remove(){},focus(){},select(){},scrollIntoView(){},click(){this.listeners.click?.({target:this})}});
 const get = id => {if(!elements.has(id)) elements.set(id,element());return elements.get(id)};
 const data = new Map([['other-app-data','must remain private']]);
 const localStorage = {get length(){return data.size},key(i){return [...data.keys()][i]},getItem(k){return data.get(k)??null},setItem(k,v){data.set(k,String(v))},removeItem(k){data.delete(k)}};
 const document = {getElementById:get,querySelector:get,querySelectorAll(){return []},createElement:element,documentElement:element(),body:element(),addEventListener(){},execCommand(){return true}};
 const context = {document, localStorage, console, Date, setTimeout(){},clearTimeout(){},setInterval(){},Option:function(t,v){this.textContent=t;this.value=v},MutationObserver:class{observe(){}},navigator:{},Blob,URL,confirm:()=>true,matchMedia:()=>({matches:false}),addEventListener(){}};
 context.window=context; context.globalThis=context;
 vm.createContext(context);
 for(const file of ['config/operation.js','assets/js/config.js','assets/js/parser.js','assets/js/shift.js','assets/js/app.js','assets/js/operational-base.js','assets/js/demo.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
 return {context,get,data,run:code=>vm.runInContext(code,context)};
}
test('demo, reports, carrier ticket, namespace and backups',()=>{
 const {get,data,run}=environment();
 get('loadDemoBtn').click();
 assert.equal(run('activeAlerts.length'),2);
 assert.equal(run('normalizations.length'),1);
 assert.equal(run('calculateShiftMetrics().estimatedMinutes'),null);
 const backup=run('createBackupPayload()');
 assert.ok(Object.keys(backup.storage).every(k=>k.startsWith('nocflow_v1_')));
 assert.equal(data.get('other-app-data'),'must remain private');
 assert.throws(()=>run('restoreBackupPayload({schema:"other-backup", storage:{}})'));
 assert.equal(run('restoreBackupPayload(createBackupPayload())'),true);
 get('openShiftReportBtn').click();
 get('generateShiftReportBtn').click();
 assert.match(get('shiftReportPreview').value,/Aurora|Horizonte|Estrela/);
 get('openOperationalBaseBtn').click();
 assert.ok(get('operationalBaseList').children.length>=3);
 run('window.openCarrierTicketGenerator(activeAlerts[0])');
 assert.match(get('carrierTicketPreview').value,/Cliente Demonstração/);
 assert.match(get('carrierTicketPreview').value,/DEMO-LINK-001-1/);
 get('updateSite').value=run('activeAlerts[0].siteLocalidade');
 get('updateSituacaoAtual').value='Em análise pelo time interno';
 get('updateAcoesRealizadas').value='Diagnóstico fictício';
 get('updateProximosPassos').value='Monitorar o serviço.';
 get('addUpdateBtn').click();
 assert.equal(run('activeAlerts[0].isUpdated'),true);
 get('normSite').value=run('activeAlerts[0].siteLocalidade');
 get('normCause').value='Falha de equipamento';
 get('normAction').value='Equipamento substituído';
 get('addNormalizationBtn').click();
 get('decisionConfirmBtn').click();
 assert.equal(run('normalizations.length'),2);
});
