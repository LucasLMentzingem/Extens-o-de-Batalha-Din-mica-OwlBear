import {detalhes} from './ficha-view.mjs';
import {periciasPadrao,bonusPericia,mod} from './engine.mjs';
import {pronto} from './bridge.mjs';
import {canalHud} from './hud-controller.mjs';
const parte=new URL(location.href).searchParams.get('parte'),root=document.querySelector('#hud');
document.body.className=parte;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(cmd,label,attrs='')=>'<button type="button" data-cmd="'+cmd+'" '+attrs+'>'+label+'</button>';
const curto=o=>o.nome.replace(/^(Truque|\dº)\s*\|\s*/,'').split(/\s*[|·—]\s*/)[0];
const grupo=o=>o.custo?.some(c=>c.tipo==='reacao')?'Reações':o.custo?.some(c=>c.tipo==='bonus')?'Bônus':o.categoria==='magia'?'Magias':'Ações';
let v,aba='Ações',bus;
const dadosExtras=valor=>String(valor??'').split(/[+,\s]+/).map(x=>x.trim()).filter(Boolean);
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
    const ordem=s.fase==='iniciativa'?s.atores.filter(x=>x.emCombate!==false).map(x=>x.id):s.vez<0?s.ordem:[...s.ordem.slice(s.vez),...s.ordem.slice(0,s.vez)];
    html='<nav><strong>'+(s.rodada?'Rodada '+s.rodada:'Iniciativa')+'</strong>'+ordem.map(id=>{
      const x=s.atores.find(a=>a.id===id);if(!x)return '';
      return btn('ator','<i>'+retrato(x)+'</i><span>'+esc(x.nome)+'<small>'+esc(x.init??'…')+'</small></span>',
        'data-id="'+esc(id)+'" class="ord '+(id===ativo?'atual ':'')+(meus.includes(x)?'':'observador')+'"');
    }).join('')+'</nav>';
  }else if(parte==='iniciativa'){
    html='<section class="prompt"><strong>Iniciativa</strong><div>'+meus.filter(x=>x.emCombate!==false&&x.init===null&&x.ficha.tipo==='pj').map(x=>btn('iniciativa','Rolar · '+esc(x.nome),'data-id="'+esc(x.id)+'"')).join('')+
      (gm&&s.atores.some(x=>x.emCombate!==false&&x.ficha.tipo==='npc'&&x.init===null)?btn('npcs','Rolar NPCs pendentes'):'')+'</div></section>';
  }else if(parte==='confirmar'&&p){
    const mesmo=root.dataset.titulo===p.titulo&&root.dataset.rev===String(p.rev);
    const modo=mesmo?document.querySelector('#modo')?.value:'normal',ajuste=mesmo?document.querySelector('#ajuste')?.value:0;
    root.dataset.titulo=p.titulo;root.dataset.rev=p.rev;
    const dados=mesmo?document.querySelector('#dadosAjuste')?.value:'';
    html='<section class="prompt"><strong>'+esc(p.titulo)+'</strong><small>'+esc(p.detalhe)+'</small>'+
      (p.rolagem?'<div class="ajustes"><label>d20<select id="modo" aria-label="Modo do d20">'+['normal','vantagem','desvantagem'].map(m=>'<option '+(m===modo?'selected':'')+'>'+m+'</option>').join('')+'</select></label><label>Dados extras<input id="dadosAjuste" aria-label="Dados extras" placeholder="1d4 + 1d6" value="'+esc(dados)+'"></label><label>+ / −<input id="ajuste" aria-label="Ajuste do d20" type="number" min="-20" max="20" value="'+esc(ajuste||0)+'"></label></div>':'')+
      '<div>'+btn('cancelar','Cancelar')+btn('confirmar',p.substitui?'Executar pelo jogador':'Executar','class="ouro"')+'</div></section>';
  }else if(parte==='reacao'&&s.reacaoPendente){
    const rp=s.reacaoPendente,reator=s.atores.find(x=>x.id===rp.reator),alvo=s.atores.find(x=>x.id===rp.alvo);
    const opcoes=(reator?.ficha.opcoes??[]).filter(o=>rp.opcoes.includes(o.id));
    const restante=Math.max(0,Math.ceil((rp.terminaEm-Date.now())/1000));
    const modo=document.querySelector('#modoReacao')?.value||'normal',ajuste=document.querySelector('#ajusteReacao')?.value||0,dados=document.querySelector('#dadosReacao')?.value||'';
    html='<section class="prompt reacao"><strong>Reação de '+esc(reator?.nome)+'</strong><small>'+esc(alvo?.nome)+' está deixando seu alcance corpo a corpo.</small><b class="timer">'+restante+' s</b><div class="ajustes"><label>d20<select id="modoReacao">'+['normal','vantagem','desvantagem'].map(m=>'<option '+(m===modo?'selected':'')+'>'+m+'</option>').join('')+'</select></label><label>Dados extras<input id="dadosReacao" placeholder="1d4 + 1d6" value="'+esc(dados)+'"></label><label>+ / −<input id="ajusteReacao" type="number" min="-20" max="20" value="'+esc(ajuste)+'"></label></div><div class="escolhas-reacao">'+btn('resolverReacao','Não fazer nada','data-id=""')+opcoes.map(o=>btn('resolverReacao',esc(curto(o)),'data-id="'+esc(o.id)+'" class="ouro"')).join('')+'</div></section>';
  }else if(parte==='barra'&&a){
    if(v.compacto){html='<section class="dock compacta"><aside><div class="retrato" title="Clique duas vezes para expandir">'+retrato(a)+'</div><div class="pv"><i style="width:'+Math.max(0,Math.min(100,100*a.pv/a.ficha.pvMaximos))+'%"></i></div><b>'+a.pv+' / '+a.ficha.pvMaximos+' PV</b></aside></section>';root.innerHTML=html;return;}
    const turno=ativo===a.id;
    const ops=a.ficha.opcoes??[];
    const disp=ops.filter(o=>grupo(o)===aba),pericias=aba==='Perícias',salvas=aba==='Salva guarda';
    const recurso=(a.ficha.recursos??[]).map(r=>'<span title="'+esc(r.nome)+'">'+esc(r.nome)+' <b>'+esc(a.rec[r.id])+'/'+r.maximo+'</b></span>').join('');
    html='<section class="dock"><aside><div class="retrato">'+retrato(a)+'</div><div class="pv"><i style="width:'+Math.max(0,Math.min(100,100*a.pv/a.ficha.pvMaximos))+'%"></i></div><b>'+a.pv+' / '+a.ficha.pvMaximos+' PV</b></aside><article><header><strong>'+esc(a.nome)+'</strong><span>'+a.acao+' ação · '+a.bonus+' bônus · '+a.reacao+' reação · '+Number(a.metros.toFixed(2))+' m</span>'+btn('ficha','Ficha')+'</header>'+
      '<div class="rec">'+recurso+'</div><div class="abas">'+['Ações','Bônus','Magias','Reações'].map(g=>btn('aba',g,'data-id="'+g+'" aria-pressed="'+(aba===g)+'"')).join('')+
      '<label>Linhas <select id="linhas">'+[1,2,3,4,5].map(n=>'<option '+(n===v.linhas?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+['Perícias','Salva guarda'].map(g=>btn('aba',g,'data-id="'+g+'" aria-pressed="'+(aba===g)+'"')).join('')+'</div>'+
      '<div class="grade" style="--linhas:'+v.linhas+'">'+(pericias?Object.keys(periciasPadrao).map(nome=>{const bonus=bonusPericia(a.ficha,nome);return btn('teste',esc(nome+' '+(bonus>=0?'+':'')+bonus),'data-grupo="pericias" data-chave="'+esc(nome)+'" data-info="Perícia · '+esc(nome)+'&#10;Bônus da ficha: '+(bonus>=0?'+':'')+bonus+'&#10;Pode ser rolada fora do turno."');}).join(''):salvas?Object.keys(a.ficha.atributos).map(chave=>{const bonus=a.ficha.salvaguardas?.[chave]??mod(a.ficha.atributos[chave]);return btn('teste',esc(chave.toUpperCase()+' '+(bonus>=0?'+':'')+bonus),'data-grupo="salvaguardas" data-chave="'+esc(chave)+'" data-info="Salvaguarda de '+esc(chave.toUpperCase())+'&#10;Bônus da ficha: '+(bonus>=0?'+':'')+bonus+'&#10;Pode ser rolada fora do turno."');}).join(''):disp.map(o=>{
        const bloqueio=(grupo(o)!=='Reações'&&!turno)?'Aguarde seu turno':a.pv<=0?'Personagem a 0 PV':
          (o.custo??[]).some(c=>(c.tipo==='recurso'?a.rec[c.id]:a[c.tipo])<c.quantidade)?'Recurso insuficiente':
          !o.automacao&&!gm&&grupo(o)!=='Reações'?'Resolução pelo mestre':'';
        return btn('usar',esc(curto(o)+(o.nome.includes('duas mãos')?' · 2 mãos':'')),'data-id="'+esc(o.id)+'" '+(bloqueio||ocupado?'disabled ':'')+'data-info="'+esc([bloqueio,detalhes(o,a.ficha)].filter(Boolean).join('\n'))+'"');
      }).join(''))+'</div><footer>'+(p?'<small>'+esc(p.detalhe)+'</small>'+(p.lista?btn('desfazer','Desfazer',p.quantidade?'':'disabled')+btn('concluir','Concluir seleção',p.quantidade>=p.min?'':'disabled'):'')+btn('cancelar','Cancelar'):btn('mover','Mover',turno&&a.pv>0?'':'disabled'))+
      (!p&&s.historico.length?'<small class="resultado" title="'+esc(s.historico[0])+'">'+esc(s.historico[0])+'</small>':'')+btn('passar','Finalizar turno','class="ouro" '+(turno?'':'disabled'))+'</footer></article></section>';
  }
  const scroll=root.querySelector('.grade')?.scrollLeft??0;
  ocultarDica();root.innerHTML=html;
  if(root.querySelector('.grade'))root.querySelector('.grade').scrollLeft=scroll;
}
const dica=document.createElement('div');dica.className='dica-skill';dica.hidden=true;dica.setAttribute('role','tooltip');document.body.append(dica);
function ocultarDica(){dica.hidden=true;}
function mostrarDica(e){
  const b=e.target.closest('[data-info]');if(!b){ocultarDica();return;}
  dica.textContent=b.dataset.info;dica.hidden=false;
  const caixa=b.getBoundingClientRect();
  dica.style.left=(caixa.left>innerWidth/2?4:Math.max(4,innerWidth-dica.offsetWidth-4))+'px';
}
root.onpointerover=mostrarDica;root.onfocusin=mostrarDica;root.onpointerleave=ocultarDica;root.onfocusout=ocultarDica;
root.onclick=e=>{
  const b=e.target.closest('button');if(!b||b.disabled||!v||v.ocupado)return;
  const tipo=b.dataset.cmd,id=b.dataset.id;
  if(tipo==='aba'){aba=id;render();return;}
  const reacao=tipo==='resolverReacao';
  bus.postMessage({tipo,id,ator:tipo==='iniciativa'?id:undefined,opcao:tipo==='usar'?id:reacao?id:undefined,grupo:b.dataset.grupo,chave:b.dataset.chave,
    rev:v.estado.rev,modo:document.querySelector(reacao?'#modoReacao':'#modo')?.value||'normal',
    ajuste:Number(document.querySelector(reacao?'#ajusteReacao':'#ajuste')?.value||0),
    dadosAjuste:dadosExtras(document.querySelector(reacao?'#dadosReacao':'#dadosAjuste')?.value)});
};
root.onchange=e=>{if(e.target.id==='linhas')bus.postMessage({tipo:'linhas',valor:e.target.value});};
root.oncontextmenu=e=>{const b=e.target.closest('[data-cmd="usar"]');if(b&&!b.disabled){e.preventDefault();b.click();}};
root.ondblclick=e=>{
  const ordem=e.target.closest('[data-cmd="ator"]');if(ordem){e.preventDefault();bus.postMessage({tipo:'focar',id:ordem.dataset.id});return;}
  if(e.target.closest('.retrato')){e.preventDefault();bus.postMessage({tipo:'compactar'});}
};
await pronto();bus=await canalHud();bus.onmessage=e=>{if(e.data.vista){v=e.data.vista;render();}};bus.postMessage({pedir:true});
if(parte==='reacao')setInterval(()=>{const p=v?.estado.reacaoPendente,t=document.querySelector('.timer');if(p&&t)t.textContent=Math.max(0,Math.ceil((p.terminaEm-Date.now())/1000))+' s';},250);

