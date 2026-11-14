import OBR from './vendor/sdk.mjs';
import {ns,emSala,sala,demo} from './bridge.mjs?v=0.8.5';
import {lojasAtivas,recomprasDaLoja,precoCompraPc,saldoMoedasPo,pesoInventario} from './engine.mjs?v=0.8.5';
import {resolverLoja,resolverInstanciaItem} from './catalog.mjs?v=0.8.5';
import {resumoItem} from './ficha-view.mjs?v=0.8.5';

const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let s,info,api,atorId,lojaId,aba='loja',selecionado=null,ocupado=false;
const fmt=pc=>(pc/100).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2})+' PO';
const iniciais=n=>String(n).split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
function ator(){return s?.atores?.find(a=>a.id===atorId);}
function fechar(){if(emSala)return OBR.popover.close(ns+'/loja').catch(()=>{});parent.postMessage({fecharLoja:true},'*');}
function comparar(item,a){
  if(item.tipo!=='equipamento')return '';
  const equipado=a.ficha.inventario.itens.find(i=>i.equipado&&(i.equipadoSlot===item.slotEquipamento||i.slotEquipamento===item.slotEquipamento));
  return equipado?'COMPARAR COM EQUIPADO\n'+resumoItem(equipado,a.ficha):'Nenhum item equivalente equipado.';
}
function cartao(item,preco,id,classe=''){
  return '<button type="button" class="item-loja '+esc(classe)+'" data-item="'+esc(id)+'"><b>'+esc(iniciais(item.nome))+'</b><span>'+esc(item.nome)+'</span><em>'+esc(fmt(preco))+'</em></button>';
}
function render(){
  const root=$('loja'),a=ator(),ativas=s?lojasAtivas(s):[];
  if(!s||!a){root.innerHTML='<div class="estado-loja">Aguardando a ficha vinculada.</div>';return;}
  if(s.fase!=='preparo'||!ativas.length){root.innerHTML='<div class="estado-loja"><h2>Lojas fechadas</h2><p>As lojas não funcionam durante o combate ou quando o mestre as desativa.</p><button id="fechar">Fechar</button></div>';$('fechar').onclick=fechar;return;}
  if(!ativas.some(x=>x.id===lojaId))lojaId=ativas[0].id;
  const resumo=ativas.find(x=>x.id===lojaId),loja=resolverLoja(lojaId),estado=s.comercio.lojas[lojaId],recompras=recomprasDaLoja(s,lojaId,a.id);
  const seletor=ativas.length>1?'<select id="seletorLoja">'+ativas.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===lojaId?'selected':'')+'>'+esc(x.nome)+'</option>').join('')+'</select>':'<h1>'+esc(resumo.nome)+'</h1>';
  const conteudo=aba==='loja'?loja.itens.map(i=>cartao(i,precoCompraPc(i,estado.descontoPct),i.catalogoRef,i.raridade)).join(''):recompras.map(r=>{const i=resolverInstanciaItem(r.instancia);return cartao(i,r.precoPc,r.id,i.raridade);}).join('');
  root.innerHTML='<header class="cabecalho-loja"><div><small>LOJA ATIVA</small>'+seletor+'<p>'+esc(resumo.descricao??'')+' · desconto de '+estado.descontoPct+'%</p><small>Carga: '+pesoInventario(a).toLocaleString('pt-BR',{maximumFractionDigits:2})+' / '+a.ficha.inventario.capacidadeCargaKg+' kg</small></div><span class="saldo-loja">◉ '+saldoMoedasPo(a).toLocaleString('pt-BR',{maximumFractionDigits:2})+' PO</span></header><nav class="abas-loja"><button data-aba="loja" aria-pressed="'+(aba==='loja')+'">Loja</button><button data-aba="recompras" aria-pressed="'+(aba==='recompras')+'">Comprar itens de volta ('+recompras.length+')</button><button data-fechar>Fechar</button></nav><section class="grade-loja">'+(conteudo||'<p class="estado-loja">Nenhum item nesta página.</p>')+'</section>';
  $('seletorLoja')?.addEventListener('change',e=>{lojaId=e.target.value;render();});
}
function abrirMenu(id){
  const a=ator(),loja=resolverLoja(lojaId),estado=s.comercio.lojas[lojaId];let item,preco,tipo;
  if(aba==='loja'){item=loja.itens.find(i=>i.catalogoRef===id);preco=precoCompraPc(item,estado.descontoPct);tipo='comprar';}
  else{const r=recomprasDaLoja(s,lojaId,a.id).find(x=>x.id===id);if(!r)return;item=resolverInstanciaItem(r.instancia);preco=r.precoPc;tipo='recomprar';}
  selecionado={id,tipo,item,preco};$('menuTitulo').textContent=item.nome;$('menuDescricao').textContent=resumoItem(item,a.ficha);$('menuComparacao').textContent=comparar(item,a);$('menuAcoes').innerHTML='<button data-cancelar>Cancelar</button><button class="primario" data-confirmar>'+(tipo==='comprar'?'Comprar':'Recomprar')+' por '+fmt(preco)+'</button>';$('menu').showModal();
}
async function confirmar(){
  if(!selecionado||ocupado)return;ocupado=true;$('aviso').textContent='Processando…';
  try{const a=ator(),confirmado=info.role==='GM'&&a.ficha.tipo==='pj';await api.enviar(selecionado.tipo==='comprar'?{tipo:'comprar',rev:s.rev,ator:a.id,lojaId,itemRef:selecionado.id,quantidade:1,confirmado}:{tipo:'recomprar',rev:s.rev,ator:a.id,lojaId,recompraId:selecionado.id,confirmado});$('menu').close();$('aviso').textContent='Transação concluída.';}catch(e){$('aviso').textContent=e.message;}finally{ocupado=false;}
}
function view(estado,dados){s=estado;info=dados;const params=new URLSearchParams(location.search),pedido=params.get('ator')||(emSala?localStorage.getItem(ns+'/loja-ator/'+OBR.room.id):null);if(pedido&&estado.atores.some(a=>a.id===pedido&&(dados.role==='GM'||a.dono===dados.id)))atorId=pedido;if(!atorId){const visiveis=estado.atores.filter(a=>dados.role==='GM'||a.dono===dados.id);atorId=visiveis[0]?.id;}render();}

$('loja').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.aba){aba=b.dataset.aba;return render();}if(b.hasAttribute('data-fechar'))return fechar();if(b.dataset.item)return abrirMenu(b.dataset.item);};
$('loja').oncontextmenu=e=>{const b=e.target.closest('[data-item]');if(b){e.preventDefault();abrirMenu(b.dataset.item);}};
$('menu').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-cancelar'))$('menu').close();if(b.hasAttribute('data-confirmar'))confirmar();};
try{api=await (emSala?sala:demo)(view);await api.notify();}catch(e){$('loja').innerHTML='<div class="estado-loja">'+esc(e.message)+'</div>';}
