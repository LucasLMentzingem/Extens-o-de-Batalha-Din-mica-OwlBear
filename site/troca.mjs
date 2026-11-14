import {ns,emSala,sala,demo} from './bridge.mjs?v=0.8.7';
import {saldoMoedasPo} from './engine.mjs?v=0.8.7';

const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=new URLSearchParams(location.search);let trocaId=params.get('troca'),atorId=params.get('ator'),s,info,api,ocupado=false,encerrada=false;
const fmt=n=>(Number(n)||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2});
function fechar(){if(emSala)return OBR.popover.close(ns+'/troca').catch(()=>{});parent.postMessage({fecharTroca:true},'*');}
const troca=()=>s?.comercio?.trocas?.find(t=>t.id===trocaId);
const ator=id=>s?.atores?.find(a=>a.id===id);
function podeControlar(a){return info?.role==='GM'||a?.ficha?.tipo==='pj'&&a.dono===info?.id;}
function iniciais(nome){return String(nome??'?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();}
function escolherLado(t){
  const participantes=[t.solicitante,t.destinatario].map(ator).filter(Boolean),atual=participantes.find(a=>a.id===atorId&&podeControlar(a));
  atorId=atual?.id??participantes.find(podeControlar)?.id??null;
}
function cardOferta(entrada,dono,propria,status){
  const item=dono.ficha.inventario?.itens.find(i=>i.id===entrada.itemId),nome=item?.nome??'Item indisponível';
  return '<button type="button" class="item-oferta" data-remover-item="'+esc(entrada.itemId)+'" '+(!propria||status!=='ofertas'?'disabled':'')+' title="'+esc(propria&&status==='ofertas'?'Clique com o botão direito ou aqui para retirar da oferta':item?.descricao??nome)+'"><b>'+esc(iniciais(nome))+'</b><span>'+esc(nome)+'</span><em>'+entrada.quantidade+'</em></button>';
}
function blocoOferta(t,id,propria){
  const dono=ator(id),oferta=t.ofertas?.[id]??{itens:[],poPc:0},cards=oferta.itens.map(x=>cardOferta(x,dono,propria,t.status)).join('');
  return '<section class="oferta-troca '+(propria?'propria':'')+'"><header><div><small>'+(propria?'SUA OFERTA':'OFERTA RECEBIDA')+'</small><h2>'+esc(dono?.nome??'Personagem')+'</h2></div><em>◉ '+fmt(oferta.poPc/100)+' PO</em></header><div class="grade-oferta">'+(cards||'<p class="vazia-oferta">Nenhum item oferecido.</p>')+'</div></section>';
}
function statusConfirmacao(t,id){const nome=ator(id)?.nome??'Personagem';return '<div><span>'+esc(nome)+'</span><b class="'+(t.confirmacaoItens?.[id]?'confirmado':'')+'">Itens '+(t.confirmacaoItens?.[id]?'confirmados':'pendentes')+'</b><b class="'+(t.confirmacaoFinal?.[id]?'confirmado':'')+'">Troca '+(t.confirmacaoFinal?.[id]?'confirmada':'pendente')+'</b></div>';}
function render(){
  const root=$('troca'),t=troca();
  if(!s){root.innerHTML='<p class="estado-troca">Aguardando o encontro.</p>';return;}
  if(s.fase!=='preparo'){root.innerHTML='<div class="estado-troca"><h2>Trocas bloqueadas</h2><p>O combate começou e a negociação foi cancelada.</p><button data-fechar>Fechar</button></div>';return;}
  if(!t){root.innerHTML='<div class="estado-troca"><h2>Troca encerrada</h2><p>A negociação foi concluída, recusada ou cancelada.</p><button data-fechar>Fechar</button></div>';if(!encerrada){encerrada=true;setTimeout(fechar,1400);}return;}
  escolherLado(t);const eu=ator(atorId);if(!eu){root.innerHTML='<p class="estado-troca">Você não controla um personagem desta troca.</p>';return;}
  const ids=[t.solicitante,t.destinatario],outroId=ids.find(id=>id!==atorId),outro=ator(outroId),etapa=t.status==='solicitada'?'Solicitação':t.status==='ofertas'?'1 · Confirmar itens':'2 · Confirmar troca';
  const seletor=info.role==='GM'?'<label class="seletor-lado">Agir por<select id="ladoAtor">'+ids.map(id=>'<option value="'+esc(id)+'" '+(id===atorId?'selected':'')+'>'+esc(ator(id)?.nome)+'</option>').join('')+'</select></label>':'';
  let corpo='<header class="cabecalho-troca"><div><small>TROCA ENTRE PERSONAGENS</small><h1>'+esc(eu.nome)+' ↔ '+esc(outro?.nome)+'</h1><p>Combate iniciado cancela esta negociação.</p></div><span class="etapa-troca">'+etapa+'</span></header>'+seletor;
  if(t.status==='solicitada'){
    const destinatario=atorId===t.destinatario;
    corpo+='<section class="pedido-troca"><h2>'+esc(ator(t.solicitante)?.nome)+' solicitou uma troca</h2><p>'+(destinatario?'Aceite para montar as duas ofertas.':'Aguardando '+esc(ator(t.destinatario)?.nome)+' responder.')+'</p><footer>'+(destinatario?'<button data-responder="false">Recusar</button><button class="primario" data-responder="true">Aceitar</button>':'')+'<button data-cancelar>Cancelar solicitação</button></footer></section>';
  }else{
    corpo+=blocoOferta(t,outroId,false)+blocoOferta(t,atorId,true)+'<p class="ajuda-troca">Para acrescentar itens, volte ao inventário da ficha e clique com o botão direito no item. Itens equipados não podem ser oferecidos. Alterar qualquer oferta reinicia a primeira confirmação.</p><div class="confirmacoes">'+ids.map(id=>statusConfirmacao(t,id)).join('')+'</div><div class="acoes-troca"><button class="cancelar" data-cancelar>Cancelar troca</button>'+(t.status==='ofertas'?'<button data-oferecer-po>Oferecer PO</button><button class="primario" data-confirmar-itens '+(t.confirmacaoItens?.[atorId]?'disabled':'')+'>Confirmar meus itens</button>':'<button class="primario" data-confirmar-final '+(t.confirmacaoFinal?.[atorId]?'disabled':'')+'>Confirmar troca final</button>')+'</div>';
  }
  root.innerHTML=corpo;
}
async function enviar(tipo,extra={}){const t=troca();if(!t||!atorId)throw Error('Troca indisponível.');const a=ator(atorId);await api.enviar({tipo,rev:s.rev,ator:atorId,trocaId:t.id,confirmado:info.role==='GM'&&a.ficha.tipo==='pj',...extra});}
async function tarefa(fn){if(ocupado)return;ocupado=true;$('aviso').textContent='';try{await fn();}catch(e){$('aviso').textContent=e.message;}finally{ocupado=false;}}
async function oferecerPo(){const t=troca(),atual=t.ofertas?.[atorId]?.poPc??0,dlg=$('poDialog');$('poQuantidade').max=String(saldoMoedasPo(ator(atorId)));$('poQuantidade').value=String(atual/100);dlg.returnValue='nao';const ok=await new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});if(ok)await enviar('definirPoTroca',{quantidadePc:Math.round(Number($('poQuantidade').value)*100)});}
function view(estado,dados){s=estado;info=dados;if(!trocaId){const candidato=estado.comercio?.trocas?.find(t=>[t.solicitante,t.destinatario].some(id=>podeControlar(ator(id))));trocaId=candidato?.id;}render();}
$('troca').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-fechar'))return fechar();if(b.dataset.responder)return tarefa(()=>enviar('responderTroca',{aceitar:b.dataset.responder==='true'}));if(b.hasAttribute('data-cancelar'))return tarefa(()=>enviar('cancelarTroca'));if(b.hasAttribute('data-oferecer-po'))return tarefa(oferecerPo);if(b.hasAttribute('data-confirmar-itens'))return tarefa(()=>enviar('confirmarItensTroca'));if(b.hasAttribute('data-confirmar-final'))return tarefa(()=>enviar('confirmarTroca'));if(b.dataset.removerItem)return tarefa(()=>enviar('removerOfertaTroca',{itemId:b.dataset.removerItem}));};
$('troca').oncontextmenu=e=>{const b=e.target.closest('[data-remover-item]');if(b&&!b.disabled){e.preventDefault();tarefa(()=>enviar('removerOfertaTroca',{itemId:b.dataset.removerItem}));}};
$('troca').onchange=e=>{if(e.target.id==='ladoAtor'){atorId=e.target.value;render();}};
try{api=await (emSala?sala:demo)(view);await api.notify();}catch(e){$('troca').innerHTML='<div class="estado-troca">'+esc(e.message)+'</div>';}
