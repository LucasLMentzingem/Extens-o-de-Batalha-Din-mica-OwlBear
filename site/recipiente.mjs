import OBR from './vendor/sdk.mjs';
import {ns,pronto,sala} from './bridge.mjs?v=0.8.43';
import {itensCatalogo} from './catalog.mjs?v=0.8.43';
import {pixelsPorMetro} from './scene-scale.mjs?v=0.8.43';
const root=document.querySelector('#painel'),aviso=document.querySelector('#aviso'),tokenId=new URLSearchParams(location.search).get('tokenId');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let s,info,api,ocupado=false;const numero=n=>Number(n).toLocaleString('pt-BR');
const recipientes=()=>s?.recipientes??[];
const recipiente=()=>recipientes().find(r=>r.tokenId===tokenId);
const atoresElegiveis=()=>{const xs=(s?.atores??[]).filter(a=>a.pv>0);return info?.role==='GM'?xs:xs.filter(a=>(a.ficha.tipo==='pj'&&a.dono===info.id)||(a.invocacao?.controlavel&&a.dono===info.id));};
const catalogo=itensCatalogo().filter(i=>i.definicao?.tipo!=='moeda');
function option(value,label,sel=false){return '<option value="'+esc(value)+'" '+(sel?'selected':'')+'>'+esc(label)+'</option>';}
function render(){
 const r=recipiente(),gm=info?.role==='GM',atores=atoresElegiveis(),aperto=r?.ocupados??r?.itens?.length??0;
 const picker=atores.length?'<label>Personagem<select id="ator">'+atores.map((a,i)=>option(a.id,a.nome+(a.dono?' · jogador':' · mestre'),i===0)).join('')+'</select></label>':'<p>Nenhum personagem consciente sob seu controle está carregado.</p>';
 if(!r){root.innerHTML='<header><h1>Baú e loot</h1></header><p>Esta imagem ainda não tem um inventário vinculado.</p>'+(gm?'<section><label>Nome<input id="nome" value="Baú de madeira" maxlength="80"></label><label>Espaços<input id="slots" type="number" min="1" max="200" value="12"></label><button id="vincular" class="primario">Configurar imagem como baú</button><button id="criar">Criar baú no centro da cena</button></section>':'<p>Peça ao mestre para configurar esta peça como caixa.</p>');return;}
 root.innerHTML='<header><h1>'+esc(r.nome)+'</h1><span class="status">'+aperto+' / '+r.capacidadeSlots+' espaços</span></header>'+
  (gm?'<section><h2>Configurar baú</h2><label>Nome<input id="nome" value="'+esc(r.nome)+'" maxlength="80"></label><div class="linha"><label>Espaços<input id="slots" type="number" min="'+aperto+'" max="200" value="'+r.capacidadeSlots+'"></label><label class="interruptor"><input id="trancado" type="checkbox" '+(r.trancado?'checked':'')+'><span>Trancado</span></label><button id="salvar" class="primario">Salvar</button></div></section><section><h2>Adicionar conteúdo</h2><label>Item<select id="item">'+catalogo.map(i=>option(i.id,i.definicao.nome)).join('')+'</select></label><div class="linha"><label>Quantidade<input id="quantidade" type="number" min="1" max="9999" value="1"></label><button id="adicionarItem">Adicionar item</button></div><div class="linha"><label>PO<input id="po" type="number" min="1" max="9999999" value="1"></label><button id="adicionarPo">Adicionar PO</button></div><p>'+r.itens.map(i=>esc(i.quantidade+'× '+i.nome)).join(' · ')+'</p></section>':'')+
  '<section><h2>Saquear</h2><p>Alcance máximo: 1,5 m'+(s.fase==='turnos'?' · custa 1 ação no seu turno':'')+'.</p>'+picker+'<button id="saquear" class="primario" '+(!atores.length||r.trancado&&!gm?'disabled':'')+'>Abrir inventário</button></section>';
}
async function enviar(tipo,extra={}){if(ocupado)return;ocupado=true;try{await api.enviar({tipo,ator:document.querySelector('#ator')?.value,tokenId,recipienteId:recipiente()?.id,rev:s.rev,...extra});return true;}catch(e){aviso.textContent=e.message;return false;}finally{ocupado=false;}}
async function enviarEAvisar(tipo,extra,texto){if(await enviar(tipo,extra))aviso.textContent=texto;}
root.onclick=async e=>{const b=e.target.closest('button');if(!b||ocupado)return;
 if(b.id==='vincular')return enviarEAvisar('criarRecipiente',{tipoRecipiente:'caixa',tokenId,nome:document.querySelector('#nome').value,capacidadeSlots:Number(document.querySelector('#slots').value)},'Baú vinculado.');
 if(b.id==='criar')return enviarEAvisar('criarRecipiente',{tipoRecipiente:'caixa',nome:document.querySelector('#nome').value,capacidadeSlots:Number(document.querySelector('#slots').value)},'Baú criado no centro da cena.');
 if(b.id==='salvar')return enviarEAvisar('configurarRecipiente',{nome:document.querySelector('#nome').value,capacidadeSlots:Number(document.querySelector('#slots').value),trancado:document.querySelector('#trancado').checked},'Configuração salva.');
 if(b.id==='adicionarItem')return enviarEAvisar('recipienteAdicionarItem',{itemRef:document.querySelector('#item').value,quantidade:Number(document.querySelector('#quantidade').value)},'Item adicionado.');
 if(b.id==='adicionarPo')return enviarEAvisar('recipienteAdicionarPo',{quantidade:Number(document.querySelector('#po').value)},'PO adicionadas.');
 if(b.id==='saquear'){
   const actor=document.querySelector('#ator').value,ok=await enviar('abrirSaqueRecipiente',{ator:actor,recipienteId:recipiente().id,tokenId,confirmado:info.role==='GM'});
   if(ok){const url=new URL('./saque.html?v=0.8.43',location.href);url.searchParams.set('ator',actor);await OBR.popover.close(ns+'/recipiente').catch(()=>{});await OBR.popover.open({id:ns+'/saque',url:url.href,width:560,height:Math.min(680,(await OBR.viewport.getHeight())-32),hidePaper:true,disableClickAway:true,marginThreshold:0,anchorReference:'POSITION',anchorPosition:{left:Math.max(8,(await OBR.viewport.getWidth())-580),top:16},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});}
 }
};
await pronto();api=await sala((estado,dados)=>{s=estado;info=dados;render();});await api.notify();
