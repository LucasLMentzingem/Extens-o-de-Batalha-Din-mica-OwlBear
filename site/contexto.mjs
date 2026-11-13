import OBR from './vendor/sdk.mjs';
import {ns,pronto,sala} from './bridge.mjs';
import {pvMaximosAtuais} from './engine.mjs';

const root=document.querySelector('#contexto');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let estado,info,api,tokenId,ocupado=false;
const ator=()=>estado?.atores.find(a=>a.token===tokenId);

function recurso(id,nome,atual,maximo,maximoBase=maximo){
  return '<section class="recurso" data-recurso="'+esc(id)+'" data-bonus="'+(maximo-maximoBase)+'"><header><b>'+esc(nome)+'</b><span>'+atual+' / '+maximo+'</span></header><input type="range" min="0" max="'+maximo+'" value="'+atual+'" aria-label="'+esc(nome)+'"><div class="valores"><label>Atual<input class="atual" type="number" min="0" max="'+maximo+'" value="'+atual+'"></label><label>Máximo base<input class="maximo" type="number" min="1" max="9999" value="'+maximoBase+'"></label></div><button class="salvar" data-acao="salvar">Salvar recurso</button></section>';
}
function render(){
  const a=ator();
  if(!a){root.innerHTML='<h1>La Arte · personagem</h1><p class="muted">Este token ainda não está vinculado a uma ficha da extensão.</p><button data-acao="abrir">Abrir extensão para vincular</button>';return;}
  const f=a.ficha,lista=[recurso('pv','Pontos de vida',a.pv,pvMaximosAtuais(a),f.pvMaximos),...(f.recursos??[]).map(r=>recurso(r.id,r.nome,a.rec[r.id],r.maximo))];
  root.innerHTML='<h1>La Arte · '+esc(a.nome)+'</h1><div class="acoes"><button class="combate" data-acao="combate">'+(a.emCombate===false?'Colocar no combate':'Retirar do combate')+'</button><button data-acao="ficha">Ver ficha</button><button data-acao="abrir">Abrir extensão</button></div><div class="recursos">'+lista.join('')+'</div>';
}
async function enviar(tipo,extra={}){if(ocupado)return;const a=ator();if(!a)return;ocupado=true;try{await api.enviar({tipo,ator:a.id,rev:estado.rev,...extra});}catch(e){root.insertAdjacentHTML('afterbegin','<p class="erro">'+esc(e.message)+'</p>');}finally{ocupado=false;}}
root.onclick=e=>{const b=e.target.closest('[data-acao]');if(!b||ocupado)return;const acao=b.dataset.acao,a=ator();
  if(acao==='abrir'){OBR.action.open();return;}
  if(acao==='ficha'&&a){localStorage.setItem(ns+'/abrir-ficha/'+OBR.room.id,JSON.stringify({id:a.id,quando:Date.now()}));OBR.player.select([a.token],true);OBR.action.open();return;}
  if(acao==='combate'){enviar('alternarCombate');return;}
  if(acao==='salvar'){const box=b.closest('[data-recurso]');enviar('definirRecurso',{campo:box.dataset.recurso,atual:Number(box.querySelector('.atual').value),maximo:Number(box.querySelector('.maximo').value)});}
};
root.oninput=e=>{const box=e.target.closest('[data-recurso]');if(!box)return;const range=box.querySelector('[type=range]'),atual=box.querySelector('.atual'),maximo=box.querySelector('.maximo');
  if(e.target===range)atual.value=range.value;
  if(e.target===atual)range.value=atual.value;
  if(e.target===maximo){const total=Number(maximo.value)+Number(box.dataset.bonus||0);range.max=total;atual.max=total;}
};

await pronto();tokenId=(await OBR.player.getSelection())?.[0];api=await sala((s,i)=>{estado=s;info=i;render();});
OBR.player.onChange(p=>{tokenId=p.selection?.[0];render();});await api.notify();
