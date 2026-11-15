import OBR from './vendor/sdk.mjs';
import {ns,emSala,sala,demo} from './bridge.mjs?v=0.8.31';
import {itensSaque,pesoInventario,capacidadeCargaAtual,quantidadeMoedaValida} from './engine.mjs?v=0.8.31';
import {resumoItem} from './ficha-view.mjs?v=0.8.31';
const root=document.querySelector('#saque'),aviso=document.querySelector('#aviso');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const atorId=new URLSearchParams(location.search).get('ator');
let s,info,api,ocupado=false,sessaoId;
const quantidades=new Map();
const ator=()=>s?.atores.find(a=>a.id===atorId);
const numero=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:2});
async function fechar(){
 if(emSala)await OBR.popover.close(ns+'/saque');
 else parent.postMessage({fecharSaque:true},'*');
}
function carga(){
 const a=ator(),itens=itensSaque(s,a);
 const extra=itens.reduce((peso,i)=>peso+(i.tipo==='moeda'&&(i.moeda??'po')==='po'?0:i.pesoKg)*(quantidades.get(i.id)??0),0);
 return {atual:pesoInventario(a),extra,maximo:capacidadeCargaAtual(a)};
}
function atualizarResumo(){
 const {atual,extra,maximo}=carga(),excesso=atual+extra>maximo+1e-8;
 document.querySelector('#pesoSaque').textContent=numero(atual)+' + '+numero(extra)+' / '+numero(maximo)+' kg';
 document.querySelector('#pesoSaque').className=excesso?'excesso':'';
 document.querySelector('progress').value=atual+extra;
 document.querySelector('#confirmarSaque').disabled=ocupado||excesso||!quantidades.size||Boolean(root.querySelector('input:invalid'));
}
function render(){
 const a=ator();
 if(!a?.saqueAberto){root.innerHTML='<p>Saque encerrado.</p>';fechar();return;}
 if(sessaoId!==a.saqueAberto.id){quantidades.clear();sessaoId=a.saqueAberto.id;}
 const itens=itensSaque(s,a),alvo=s.atores.find(x=>x.id===a.saqueAberto.alvoId);
 for(const [id,q] of quantidades){const item=itens.find(i=>i.id===id);if(!item)quantidades.delete(id);else quantidades.set(id,Math.min(q,item.quantidade));}
 root.innerHTML='<h2>'+esc(alvo?.nome??a.saqueAberto.alvoNome??'Pertences')+'</h2><section class="grade-saque">'+itens.map(i=>{
  const q=quantidades.get(i.id)??0;
  return '<article class="entrada-saque '+(q?'selecionada':'')+'"><button data-item="'+esc(i.id)+'" title="'+esc(resumoItem(i,a.ficha))+'" aria-pressed="'+Boolean(q)+'">'+esc(i.nome)+'<small>'+esc(i.equipado?'Equipado':'Inventário')+' · '+numero(i.quantidade)+'</small></button><input aria-label="Quantidade de '+esc(i.nome)+'" data-quantidade="'+esc(i.id)+'" type="number" min="0" max="'+i.quantidade+'" step="'+(i.tipo==='moeda'?'0.01':'1')+'" value="'+q+'"></article>';
 }).join('')+'</section><section class="resumo-saque"><strong id="pesoSaque"></strong><progress max="'+capacidadeCargaAtual(a)+'"></progress><footer><button id="cancelarSaque">Cancelar</button><button id="confirmarSaque" class="primario">Confirmar saque</button></footer></section>';
 atualizarResumo();
}
root.addEventListener('input',e=>{
 const id=e.target.dataset.quantidade;if(!id)return;
 const item=itensSaque(s,ator()).find(i=>i.id===id),q=Number(e.target.value);
 if(!item||!Number.isFinite(q)||q<0||q>item.quantidade||!(item.tipo==='moeda'?quantidadeMoedaValida(q):Number.isInteger(q))){e.target.setCustomValidity('Quantidade inválida');atualizarResumo();return;}
 e.target.setCustomValidity('');q?quantidades.set(id,q):quantidades.delete(id);
 e.target.closest('article').classList.toggle('selecionada',q>0);
 atualizarResumo();
});
root.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||ocupado)return;
 if(b.dataset.item){const id=b.dataset.item,item=itensSaque(s,ator()).find(i=>i.id===id);quantidades.has(id)?quantidades.delete(id):quantidades.set(id,item.quantidade);render();return;}
 if(!['confirmarSaque','cancelarSaque'].includes(b.id))return;
 ocupado=true;atualizarResumo();
 try{
  await api.enviar({tipo:b.id,ator:atorId,rev:s.rev,saqueId:sessaoId,itens:[...quantidades].map(([itemId,quantidade])=>({itemId,quantidade})),confirmado:info.role==='GM'});
 }catch(err){aviso.textContent=err.message;}
 finally{ocupado=false;if(ator()?.saqueAberto)atualizarResumo();}
});
api=await (emSala?sala:demo)((estado,dados)=>{s=estado;info=dados;render();});
await api.notify();
