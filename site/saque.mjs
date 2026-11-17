import OBR from './vendor/sdk.mjs';
import {ns,emSala,sala,demo} from './bridge.mjs?v=0.8.43';
import {itensSaque,pesoInventario,capacidadeCargaAtual,quantidadeMoedaValida} from './engine.mjs?v=0.8.43';
import {resumoItem} from './ficha-view.mjs?v=0.8.43';
import {arteItem,criarExameItem} from './item-art.mjs?v=0.8.43';
const root=document.querySelector('#saque'),aviso=document.querySelector('#aviso');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const atorId=new URLSearchParams(location.search).get('ator'),exameItem=criarExameItem();
let s,info,api,ocupado=false,sessaoId,equiparItemId=null;const quantidades=new Map(),depositos=new Map();
const ator=()=>s?.atores.find(a=>a.id===atorId),numero=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:2});
const sessao=()=>ator()?.saqueAberto;
const itensOrigem=()=>itensSaque(s,ator());
const itensProprios=()=>ator()?.ficha.inventario?.itens??[];
async function fechar(){if(emSala)await OBR.popover.close(ns+'/saque');else parent.postMessage({fecharSaque:true},'*');}
function peso(i,q){return i.tipo==='moeda'&&(i.moeda??'po')==='po'?0:(Number(i.pesoKg)||0)*q;}
function carga(){
 const a=ator(),entrada=itensOrigem().reduce((n,i)=>n+peso(i,quantidades.get(i.id)??0),0),saida=itensProprios().reduce((n,i)=>n+peso(i,depositos.get(i.id)??0),0);
 return {atual:pesoInventario(a),entrada,saida,final:pesoInventario(a)+entrada-saida,maximo:capacidadeCargaAtual(a)};
}
function atualizarResumo(){
 const {atual,entrada,saida,final,maximo}=carga(),excesso=final>maximo+1e-8;
 document.querySelector('#pesoSaque').textContent=numero(atual)+' + '+numero(entrada)+' − '+numero(saida)+' = '+numero(final)+' / '+numero(maximo)+' kg';
 document.querySelector('#pesoSaque').className=excesso?'excesso':'';document.querySelector('progress').value=Math.max(0,final);
 document.querySelector('#confirmarSaque').disabled=ocupado||excesso||(!quantidades.size&&!depositos.size)||Boolean(root.querySelector('input:invalid'));
}
function cartao(item,q,source,actor){
 const atuais=actor?.ficha?.inventario?.itens??[],slots=item.duasMaos?['mao_forte','mao_fraca']:item.slotEquipamento==='acessorio'?['acessorio_1','acessorio_2']:[item.slotEquipamento],equivalentes=item.tipo==='equipamento'?atuais.filter(x=>x.equipado&&slots.includes(x.equipadoSlot)):[];
 const comparacao=equivalentes.length?'<small class="comparacao-loot">Com você: '+equivalentes.map(x=>esc(x.nome)).join(' / ')+'</small>':'';
 const podeEquipar=source==='origem'&&item.tipo==='equipamento',acaoEquipar=podeEquipar?'<button type="button" class="equipar-loot" data-equipar="'+esc(item.id)+'">'+(equiparItemId===item.id?'Será equipado':'Pegar e equipar')+'</button>':'';
 return '<article class="entrada-saque '+(q?'selecionada':'')+'"><button data-item="'+esc(item.id)+'" data-fonte="'+source+'" title="'+esc(resumoItem(item,actor?.ficha))+'" aria-pressed="'+Boolean(q)+'">'+arteItem(item)+'<span>'+esc(item.nome)+'</span><small>'+esc(item.equipado?'Equipado':'Inventário')+' · '+numero(item.quantidade)+'</small>'+comparacao+'</button>'+acaoEquipar+'<input aria-label="Quantidade de '+esc(item.nome)+'" data-quantidade="'+esc(item.id)+'" data-fonte="'+source+'" type="number" min="0" max="'+item.quantidade+'" step="'+(item.tipo==='moeda'?'0.01':'1')+'" value="'+q+'"></article>';
}
function render(){
 const a=ator(),g=sessao();
 if(!g){root.innerHTML='<p>Saque encerrado.</p>';fechar();return;}
 if(sessaoId!==g.id){quantidades.clear();depositos.clear();equiparItemId=null;sessaoId=g.id;}
 const entradas=itensOrigem();for(const [id,q] of quantidades){const i=entradas.find(x=>x.id===id);if(!i)quantidades.delete(id);else quantidades.set(id,Math.min(q,i.quantidade));}
 const eTitulo=g.nome??s.atores.find(x=>x.id===g.alvoId)?.nome??'Pertences',caixa=g.origem?.tipo==='caixa',podeDepositar=caixa,recipiente=s.recipientes?.find(x=>x.id===g.origem?.id),vazios=caixa?Math.max(0,(recipiente?.capacidadeSlots??entradas.length)-entradas.length):0;
 root.innerHTML='<h2>'+esc(eTitulo)+'</h2><p class="muted">Selecione os itens que vai levar. '+(caixa?'Clique em itens da sua mochila para selecionar; botão direito deposita na caixa.':'')+'</p><h3>Itens disponíveis</h3><section class="grade-saque">'+entradas.map(i=>cartao(i,quantidades.get(i.id)??0,'origem',a)).join('')+Array.from({length:vazios},()=>'<article class="entrada-saque vaga"><span>Espaço vazio</span></article>').join('')+'</section>'+
  (podeDepositar?'<h3>Seu inventário · botão direito para depositar</h3><section class="grade-saque">'+itensProprios().map(i=>cartao(i,depositos.get(i.id)??0,'proprio',a)).join('')+'</section>':'')+
  '<section class="resumo-saque"><strong id="pesoSaque"></strong><progress max="'+capacidadeCargaAtual(a)+'"></progress><footer><button id="cancelarSaque">Cancelar</button><button id="confirmarSaque" class="primario">'+(podeDepositar?'Confirmar transferências':'Confirmar saque')+'</button></footer></section>';
 atualizarResumo();
}
root.addEventListener('input',e=>{
 const id=e.target.dataset.quantidade;if(!id)return;const fonte=e.target.dataset.fonte,lista=fonte==='proprio'?itensProprios():itensOrigem(),item=lista.find(i=>i.id===id),q=Number(e.target.value),map=fonte==='proprio'?depositos:quantidades;
 if(!item||!Number.isFinite(q)||q<0||q>item.quantidade||!(item.tipo==='moeda'?quantidadeMoedaValida(q):Number.isInteger(q))||fonte==='proprio'&&item.equipado){e.target.setCustomValidity('Quantidade inválida para essa transferência.');atualizarResumo();return;}
 e.target.setCustomValidity('');q?map.set(id,q):map.delete(id);if(equiparItemId===id&&q!==item.quantidade)equiparItemId=null;const direto=e.target.closest('article').querySelector('.equipar-loot');if(direto)direto.textContent=equiparItemId===id?'Será equipado':'Pegar e equipar';e.target.closest('article').classList.toggle('selecionada',q>0);atualizarResumo();
});
root.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-item]');if(!b)return;const lista=b.dataset.fonte==='proprio'?itensProprios():itensOrigem(),item=lista.find(i=>i.id===b.dataset.item);if(!item)return;e.preventDefault();if(b.dataset.fonte==='proprio'&&sessao()?.origem?.tipo==='caixa'&&!item.equipado){depositos.has(item.id)?depositos.delete(item.id):depositos.set(item.id,item.quantidade);render();}else exameItem.abrir(item);});
root.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||ocupado)return;
 if(b.dataset.equipar){const item=itensOrigem().find(i=>i.id===b.dataset.equipar);if(!item)return;equiparItemId=equiparItemId===item.id?null:item.id;if(equiparItemId)quantidades.set(item.id,item.quantidade);else quantidades.delete(item.id);render();return;}
 if(b.dataset.item){const id=b.dataset.item,source=b.dataset.fonte,list=source==='proprio'?itensProprios():itensOrigem(),item=list.find(i=>i.id===id),map=source==='proprio'?depositos:quantidades;if(!item||source==='proprio'&&item.equipado)return;if(map.has(id)){map.delete(id);if(equiparItemId===id)equiparItemId=null;}else map.set(id,item.quantidade);render();return;}
 if(!['confirmarSaque','cancelarSaque'].includes(b.id))return;
 ocupado=true;atualizarResumo();
 try{await api.enviar({tipo:b.id,ator:atorId,rev:s.rev,saqueId:sessaoId,itens:[...quantidades].map(([itemId,quantidade])=>({itemId,quantidade})),depositos:[...depositos].map(([itemId,quantidade])=>({itemId,quantidade})),equiparItemId,confirmado:info.role==='GM'});}
 catch(err){aviso.textContent=err.message;}
 finally{ocupado=false;if(ator()?.saqueAberto)atualizarResumo();}
});
api=await (emSala?sala:demo)((estado,dados)=>{s=estado;info=dados;render();});await api.notify();
