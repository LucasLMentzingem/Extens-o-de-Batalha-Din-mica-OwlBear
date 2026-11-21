import OBR from './vendor/sdk.mjs';
import {chaveParte,chaveEntrada} from './hud-parts.mjs?v=0.8.79';
import {preencherBalaoHabilidade} from './ability-tooltip.mjs?v=0.8.79';
import {atualizarHtmlHud} from './hud-dom.mjs?v=0.8.79';
const ns='aventura-dnd.combate.v1',q=new URL(location.href).searchParams,parte=q.get('parte'),sessaoHud=q.get('sessaoHud'),documentoHud=q.get('documentoHud'),root=document.getElementById('hud');
await new Promise(r=>OBR.onReady(r));
const conexao=await OBR.player.getConnectionId(),entrada=new BroadcastChannel(chaveEntrada(ns,OBR.room.id,conexao)),canal=new BroadcastChannel(chaveParte(ns,OBR.room.id,conexao,parte));
let vista,pressionado=false,assinatura='',dicaAtual;
const enviar=d=>entrada.postMessage({...d,atorHud:vista?.atorId,parteHud:parte,sessaoHud,documentoHud});
const presenca=()=>enviar({presenca:parte});
canal.onmessage=e=>{
  const d=e.data;if(d?.sessaoHud!==sessaoHud||d.documentoHud!==documentoHud)return;
  if(d.verificarPresenca){presenca();return;}
  if(typeof d.html!=='string')return;vista=d;root.inert=d.aguardando===true;root.setAttribute('aria-busy',String(d.aguardando===true));
  if(d.html===assinatura)return;assinatura=d.html;
  ocultarDica();
  const pos={};for(const seletor of ['.grade','.recursos-hud','.categorias-hud','#hud>nav']){const el=root.querySelector(seletor);if(el)pos[seletor]=el.scrollLeft;}
  atualizarHtmlHud(root,d.html);document.body.classList.toggle('sem-nomes-parcial',!d.nomes);
  for(const [seletor,scroll] of Object.entries(pos)){const el=root.querySelector(seletor);if(el)el.scrollLeft=scroll;}
};
root.onclick=e=>{
  const b=e.target.closest('button');if(!b||b.disabled||!vista||vista.aguardando)return;
  const tipo=b.dataset.cmd,id=b.dataset.id;
  if(['filtro','recurso','alternarNomesSkills','pedirMesa','cancelarMesa','confirmarMesa','alternarMesa','avancarTempo'].includes(tipo)){enviar({tipo:'interacaoRodape',comando:tipo,id});return;}
  enviar({tipo,id,pagina:b.dataset.pagina,circuloUsado:b.dataset.circulo?Number(b.dataset.circulo):undefined,modoCusto:b.dataset.modoCusto,
    opcao:tipo==='usar'?id:undefined,itemId:tipo==='usarItem'?id:undefined,grupo:b.dataset.grupo,chave:b.dataset.chave,rev:vista.rev,modo:'normal',ajuste:0});
};
root.onchange=e=>{
  if(vista?.aguardando)return;
  if(e.target.id==='linhas')enviar({tipo:'linhas',valor:e.target.value});
  if(e.target.id==='pvp-mesa')enviar({tipo:'interacaoRodape',comando:'pvpMesa',valor:e.target.checked});
};
root.ondblclick=e=>{if(vista?.aguardando)return;const b=e.target.closest('[data-cmd="ator"]');if(b){e.preventDefault();enviar({tipo:'focar',id:b.dataset.id});}else if(e.target.closest('.retrato')){e.preventDefault();enviar({tipo:'compactar',valor:!vista?.compacto});}};
root.oncontextmenu=e=>{const b=e.target.closest('[data-cmd="usar"]');if(b&&!b.disabled){e.preventDefault();b.click();}};
function ocultarDica(){if(dicaAtual){dicaAtual=null;enviar({tipo:'dicaRodape',html:null});}}
function mostrarDica(e){
  const b=e.target.closest('[data-info]');if(!b){ocultarDica();return;}if(dicaAtual===b.dataset.info)return;dicaAtual=b.dataset.info;
  const div=document.createElement('section');div.className='dica-rodape-card';div.setAttribute('role','tooltip');preencherBalaoHabilidade(div,b,dicaAtual);enviar({tipo:'dicaRodape',html:div.outerHTML});
}
root.onpointerover=mostrarDica;root.onfocusin=mostrarDica;root.onpointerleave=ocultarDica;root.onfocusout=ocultarDica;
const marcar=valor=>{if(pressionado===valor)return;pressionado=valor;enviar({entradaHud:parte,pressionado:valor});};
document.addEventListener('pointerdown',()=>marcar(true),true);document.addEventListener('pointerup',e=>marcar(e.buttons!==0),true);document.addEventListener('pointercancel',()=>marcar(false),true);document.addEventListener('pointermove',e=>{if(!e.buttons)marcar(false);},true);window.addEventListener('blur',()=>{marcar(false);ocultarDica();});
enviar({pedir:true});presenca();const timer=setInterval(presenca,2500);
window.addEventListener('pagehide',()=>{marcar(false);ocultarDica();clearInterval(timer);canal.close();entrada.close();},{once:true});
