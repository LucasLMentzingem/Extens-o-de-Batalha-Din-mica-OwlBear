import {celulaInventario} from './inventory-cell.mjs?v=0.8.69';
import OBR from './vendor/sdk.mjs';
import {ns,emSala,sala,demo} from './bridge.mjs?v=0.8.69';
import {itensSaque,pesoInventario,capacidadeCargaAtual,quantidadeMoedaValida} from './engine.mjs?v=0.8.69';
import {resumoItem} from './ficha-view.mjs?v=0.8.69';
import {arteItem,criarExameItem} from './item-art.mjs?v=0.8.69';
const menu=document.createElement('dialog');menu.id='menu';document.body.append(menu);
const root=document.querySelector('#saque'),aviso=document.querySelector('#aviso');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const atorId=new URLSearchParams(location.search).get('ator'),exameItem=criarExameItem();
let s,info,api,ocupado=false,sessaoId,equiparItemId=null,equiparSlot=null;const quantidades=new Map(),depositos=new Map();
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
 const slots=item.duasMaos?['mao_forte','mao_fraca']:item.slotEquipamento==='acessorio'?['acessorio_1','acessorio_2']:[item.slotEquipamento];
 const comparados=(actor?.ficha?.inventario?.itens??[]).filter(i=>i.equipado&&i.id!==item.id&&slots.includes(i.equipadoSlot));
 const descricao=resumoItem(item,actor?.ficha)+comparados.map(i=>'\n\nEQUIPADO NO MESMO SLOT\n'+resumoItem(i,actor?.ficha)).join('');
 return celulaInventario(item,{atributos:'data-item="'+esc(item.id)+'" data-fonte="'+source+'" aria-pressed="'+Boolean(q)+'"',descricao,selecionada:q>0});
}
function detalhesSelecao(){
 const entradas=[...quantidades].map(([id,q])=>({i:itensOrigem().find(i=>i.id===id),q,fonte:'origem'})).concat([...depositos].map(([id,q])=>({i:itensProprios().find(i=>i.id===id),q,fonte:'proprio'})));
 return entradas.filter(x=>x.i).map(({i,q,fonte})=>'<article class="detalhe-transferencia"><strong>'+esc(i.nome)+'</strong><label>Quantidade<input aria-label="Quantidade de '+esc(i.nome)+'" data-quantidade="'+esc(i.id)+'" data-fonte="'+fonte+'" type="number" min="0" max="'+i.quantidade+'" step="'+(i.tipo==='moeda'?'0.01':'1')+'" value="'+q+'"></label>'+(fonte==='origem'&&i.tipo==='equipamento'?'<button class="equipar-loot" data-equipar="'+esc(i.id)+'">'+(equiparItemId===i.id?'Será equipado':'Pegar e equipar')+'</button>':'')+'</article>').join('');
}
function render(){
 const a=ator(),g=sessao();
 if(!g){root.innerHTML='<p>Saque encerrado.</p>';fechar();return;}
 if(sessaoId!==g.id){quantidades.clear();depositos.clear();equiparItemId=null;equiparSlot=null;sessaoId=g.id;}
 const entradas=itensOrigem();for(const [id,q] of quantidades){const i=entradas.find(x=>x.id===id);if(!i)quantidades.delete(id);else quantidades.set(id,Math.min(q,i.quantidade));}
 const eTitulo=g.nome??s.atores.find(x=>x.id===g.alvoId)?.nome??'Pertences',caixa=g.origem?.tipo==='caixa',podeDepositar=caixa,recipiente=s.recipientes?.find(x=>x.id===g.origem?.id),vazios=Math.max(0,(caixa?recipiente?.capacidadeSlots??entradas.length:g.origem?.tipo==='chao'?1:Math.max(25,Math.ceil(entradas.length/5)*5))-entradas.length);
 root.innerHTML='<h2>'+esc(eTitulo)+'</h2><p class="muted">Selecione os itens que vai levar. '+(caixa?'Para depositar, use o botão direito nos itens da ficha do personagem.':'')+'</p><h3>Itens disponíveis</h3><section class="grade-inventario grade-saque">'+entradas.map(i=>cartao(i,quantidades.get(i.id)??0,'origem',a)).join('')+Array.from({length:vazios},()=>celulaInventario(null)).join('')+'</section>'+

  '<section class="selecao-transferencia">'+detalhesSelecao()+'</section><section class="resumo-saque"><strong id="pesoSaque"></strong><progress max="'+capacidadeCargaAtual(a)+'"></progress><footer><button id="cancelarSaque">Cancelar</button><button id="confirmarSaque" class="primario">'+'Confirmar saque'+'</button></footer></section>';
 atualizarResumo();
}
root.addEventListener('input',e=>{
 const id=e.target.dataset.quantidade;if(!id)return;const fonte=e.target.dataset.fonte,lista=fonte==='proprio'?itensProprios():itensOrigem(),item=lista.find(i=>i.id===id),q=Number(e.target.value),map=fonte==='proprio'?depositos:quantidades;
 if(!item||!Number.isFinite(q)||q<0||q>item.quantidade||!(item.tipo==='moeda'?quantidadeMoedaValida(q):Number.isInteger(q))||fonte==='proprio'&&item.equipado){e.target.setCustomValidity('Quantidade inválida para essa transferência.');atualizarResumo();return;}
 e.target.setCustomValidity('');q?map.set(id,q):map.delete(id);if(equiparItemId===id&&q!==1)equiparItemId=null;const direto=e.target.closest('article')?.querySelector('.equipar-loot');if(direto)direto.textContent=equiparItemId===id?'Será equipado':'Pegar e equipar';root.querySelector('[data-item="'+CSS.escape(id)+'"]')?.classList.toggle('selecionada',q>0);atualizarResumo();
});
root.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-item]');if(!b)return;const lista=b.dataset.fonte==='proprio'?itensProprios():itensOrigem(),item=lista.find(i=>i.id===b.dataset.item);if(!item)return;e.preventDefault();if(b.dataset.fonte==='proprio'&&sessao()?.origem?.tipo==='caixa'&&!item.equipado){depositos.has(item.id)?depositos.delete(item.id):depositos.set(item.id,item.quantidade);render();}else {
 menu.innerHTML='<h2>'+esc(item.nome)+'</h2>'+arteItem(item)+'<footer><button data-exame>Examinar</button><button data-fechar>Fechar</button></footer>';
 if(item.tipo==='equipamento'){
 const slots=item.slotEquipamento==='mao_forte'&&!item.duasMaos?['mao_forte','mao_fraca']:item.slotEquipamento==='acessorio'?['acessorio_1','acessorio_2']:[item.slotEquipamento];
 for(const slot of slots){const b=document.createElement('button');b.textContent='Pegar e equipar · '+({mao_forte:'mão forte',mao_fraca:'mão fraca',acessorio_1:'acessório I',acessorio_2:'acessório II'}[slot]??slot);b.onclick=()=>{if(ocupado)return;quantidades.clear();depositos.clear();equiparItemId=item.id;equiparSlot=slot;quantidades.set(item.id,1);menu.close();render();root.querySelector('#confirmarSaque').click();};menu.querySelector('footer').prepend(b);}
 }
 menu.querySelector('[data-exame]').onclick=()=>{menu.close();exameItem.abrir(item)};menu.querySelector('[data-fechar]').onclick=()=>menu.close();menu.showModal();
 }});
root.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||ocupado)return;
 if(b.dataset.equipar){const item=itensOrigem().find(i=>i.id===b.dataset.equipar);if(!item)return;equiparItemId=equiparItemId===item.id?null:item.id;if(equiparItemId){equiparSlot=item.slotEquipamento;quantidades.set(item.id,1);}else quantidades.delete(item.id);render();if(equiparItemId)root.querySelector('#confirmarSaque').click();return;}
 if(b.dataset.item){const id=b.dataset.item,source=b.dataset.fonte,list=source==='proprio'?itensProprios():itensOrigem(),item=list.find(i=>i.id===id),map=source==='proprio'?depositos:quantidades;if(!item||source==='proprio'&&item.equipado)return;if(map.has(id)){map.delete(id);if(equiparItemId===id)equiparItemId=null;}else map.set(id,item.quantidade);render();return;}
 if(!['confirmarSaque','cancelarSaque'].includes(b.id))return;
 ocupado=true;atualizarResumo();
 try{await api.enviar({tipo:b.id,ator:atorId,rev:s.rev,saqueId:sessaoId,itens:[...quantidades].map(([itemId,quantidade])=>({itemId,quantidade})),depositos:[...depositos].map(([itemId,quantidade])=>({itemId,quantidade})),equiparItemId,equiparSlot,confirmado:info.role==='GM'});quantidades.clear();depositos.clear();equiparItemId=null;equiparSlot=null;aviso.textContent='';if(ator()?.saqueAberto)render();}
 catch(err){aviso.textContent=err.message;}
 finally{ocupado=false;if(ator()?.saqueAberto)atualizarResumo();}
});
const dica=document.createElement('div');dica.className='dica-livro';dica.hidden=true;document.body.append(dica);
root.addEventListener('pointerover',e=>{const b=e.target.closest('[data-info]');if(!b)return;dica.textContent=b.dataset.info;dica.hidden=false;dica.style.left='8px';dica.style.top=Math.min(innerHeight-dica.offsetHeight-8,Math.max(8,b.getBoundingClientRect().bottom+6))+'px';});
root.addEventListener('pointerleave',()=>{dica.hidden=true;});root.addEventListener('click',()=>{dica.hidden=true;});
api=await (emSala?sala:demo)((estado,dados)=>{s=estado;info=dados;render();});await api.notify();
