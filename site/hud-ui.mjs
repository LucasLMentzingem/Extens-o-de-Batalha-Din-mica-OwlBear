import {pronto} from './bridge.mjs';
import {canalHud} from './hud-controller.mjs';
const parte=new URL(location.href).searchParams.get('parte'),root=document.querySelector('#hud');
document.body.className=parte;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(cmd,label,attrs='')=>'<button type="button" data-cmd="'+cmd+'" '+attrs+'>'+label+'</button>';
const curto=o=>o.nome.replace(/^(Truque|\dº)\s*\|\s*/,'').split(/\s*[|·—]\s*/)[0];
const grupo=o=>o.custo?.some(c=>c.tipo==='reacao')?'Reações':o.custo?.some(c=>c.tipo==='bonus')?'Bônus':o.categoria==='magia'?'Magias':'Ações';
let v,aba='Ações',bus;
function retrato(a){
  const src=v.imagens[a.id];
  return src?'<img alt="" src="'+esc(src)+'">':'<b>'+esc(a.nome.slice(0,1))+'</b>';
}
function render(){
  if(!v)return;
  const {estado:s,eu,ocupado,pendente:p}=v;
  const ativo=s.ordem[s.vez],a=s.atores.find(a=>a.id===v.atorId),gm=eu.role==='GM';
  const meus=s.atores.filter(x=>gm||x.dono===eu.id);
  let html='';
  if(parte==='ordem'){
    const ordem=s.fase==='iniciativa'?s.atores.map(x=>x.id):s.vez<0?s.ordem:[...s.ordem.slice(s.vez),...s.ordem.slice(0,s.vez)];
    html='<nav><strong>'+(s.rodada?'Rodada '+s.rodada:'Iniciativa')+'</strong>'+ordem.map(id=>{
      const x=s.atores.find(a=>a.id===id);if(!x)return '';
      return btn('ator','<i>'+retrato(x)+'</i><span>'+esc(x.nome)+'<small>'+esc(x.init??'…')+'</small></span>',
        'data-id="'+esc(id)+'" class="ord '+(id===ativo?'atual':'')+'" '+(meus.includes(x)?'':'disabled'));
    }).join('')+'</nav>';
  }else if(parte==='iniciativa'){
    html='<section class="prompt"><strong>Iniciativa</strong><div>'+meus.filter(x=>x.init===null&&x.ficha.tipo==='pj').map(x=>btn('iniciativa','Rolar · '+esc(x.nome),'data-id="'+esc(x.id)+'"')).join('')+
      (gm&&s.atores.some(x=>x.ficha.tipo==='npc'&&x.init===null)?btn('npcs','Rolar NPCs pendentes'):'')+'</div></section>';
  }else if(parte==='confirmar'&&p){
    const mesmo=root.dataset.titulo===p.titulo&&root.dataset.rev===String(p.rev);
    const modo=mesmo?document.querySelector('#modo')?.value:'normal',ajuste=mesmo?document.querySelector('#ajuste')?.value:0;
    root.dataset.titulo=p.titulo;root.dataset.rev=p.rev;
    html='<section class="prompt"><strong>'+esc(p.titulo)+'</strong><small>'+esc(p.detalhe)+'</small>'+
      (p.rolagem?'<div><select id="modo" aria-label="Modo do d20">'+['normal','vantagem','desvantagem'].map(m=>'<option '+(m===modo?'selected':'')+'>'+m+'</option>').join('')+'</select><input id="ajuste" aria-label="Ajuste do d20" type="number" min="-20" max="20" value="'+esc(ajuste||0)+'"></div>':'')+
      '<div>'+btn('cancelar','Cancelar')+btn('confirmar',p.substitui?'Executar pelo jogador':'Executar','class="ouro"')+'</div></section>';
  }else if(parte==='barra'&&a){
    const turno=ativo===a.id;
    const ops=a.ficha.opcoes??[];
    const disp=ops.filter(o=>grupo(o)===aba);
    const recurso=(a.ficha.recursos??[]).map(r=>'<span title="'+esc(r.nome)+'">'+esc(r.nome)+' <b>'+esc(a.rec[r.id])+'/'+r.maximo+'</b></span>').join('');
    html='<section class="dock"><aside><div class="retrato">'+retrato(a)+'</div><div class="pv"><i style="width:'+Math.max(0,Math.min(100,100*a.pv/a.ficha.pvMaximos))+'%"></i></div><b>'+a.pv+' / '+a.ficha.pvMaximos+' PV</b></aside><article><header><strong>'+esc(a.nome)+'</strong><span>'+a.acao+' ação · '+a.bonus+' bônus · '+a.reacao+' reação · '+Number(a.metros.toFixed(2))+' m</span>'+btn('ficha','Ficha')+'</header>'+
      '<div class="rec">'+recurso+'</div><div class="abas">'+['Ações','Bônus','Magias','Reações'].map(g=>btn('aba',g,'data-id="'+g+'" aria-pressed="'+(aba===g)+'"')).join('')+
      '<label>Linhas <select id="linhas">'+[3,4,5].map(n=>'<option '+(n===v.linhas?'selected':'')+'>'+n+'</option>').join('')+'</select></label></div>'+
      '<div class="grade" style="--linhas:'+v.linhas+'">'+disp.map(o=>{
        const bloqueio=(grupo(o)!=='Reações'&&!turno)?'Aguarde seu turno':a.pv<=0?'Personagem a 0 PV':
          (o.custo??[]).some(c=>(c.tipo==='recurso'?a.rec[c.id]:a[c.tipo])<c.quantidade)?'Recurso insuficiente':
          !o.automacao&&!gm&&grupo(o)!=='Reações'?'Resolução pelo mestre':'';
        return btn('usar',esc(curto(o)+(o.nome.includes('duas mãos')?' · 2 mãos':'')),'data-id="'+esc(o.id)+'" '+(bloqueio||ocupado?'disabled ':'')+'title="'+esc(bloqueio||o.nome+' · '+(o.descricao??''))+'"');
      }).join('')+'</div><footer>'+(p?'<small>'+esc(p.detalhe)+'</small>'+btn('cancelar','Cancelar'):btn('mover','Mover',turno&&a.pv>0?'':'disabled'))+
      (!p&&s.historico.length?'<small class="resultado" title="'+esc(s.historico[0])+'">'+esc(s.historico[0])+'</small>':'')+btn('passar','Finalizar turno','class="ouro" '+(turno?'':'disabled'))+'</footer></article></section>';
  }
  const scroll=root.querySelector('.grade')?.scrollLeft??0;
  root.innerHTML=html;
  if(root.querySelector('.grade'))root.querySelector('.grade').scrollLeft=scroll;
}
root.onclick=e=>{
  const b=e.target.closest('button');if(!b||b.disabled||!v||v.ocupado)return;
  const tipo=b.dataset.cmd,id=b.dataset.id;
  if(tipo==='aba'){aba=id;render();return;}
  bus.postMessage({tipo,id,ator:tipo==='iniciativa'?id:undefined,opcao:tipo==='usar'?id:undefined,
    rev:v.estado.rev,modo:document.querySelector('#modo')?.value||'normal',ajuste:Number(document.querySelector('#ajuste')?.value||0)});
};
root.onchange=e=>{if(e.target.id==='linhas')bus.postMessage({tipo:'linhas',valor:e.target.value});};
root.oncontextmenu=e=>{const b=e.target.closest('[data-cmd="usar"]');if(b&&!b.disabled){e.preventDefault();b.click();}};
await pronto();bus=await canalHud();bus.onmessage=e=>{if(e.data.vista){v=e.data.vista;render();}};bus.postMessage({pedir:true});

