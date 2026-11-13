import {detalhes} from './ficha-view.mjs';
import {periciasPadrao,bonusPericia,mod,pvMaximosAtuais} from './engine.mjs';
import {pronto} from './bridge.mjs';
import {canalHud} from './hud-controller.mjs';
const parte=new URL(location.href).searchParams.get('parte'),root=document.querySelector('#hud');
document.body.className=parte;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(cmd,label,attrs='')=>'<button type="button" data-cmd="'+cmd+'" '+attrs+'>'+label+'</button>';
const curto=o=>{const nome=o.nome.replace(/^(Truque|\dº)\s*\|\s*/,'');return o.varianteArremessoDe?nome.split(/\s*[|—]\s*/)[0]:nome.split(/\s*[|·—]\s*/)[0];};
const grupo=o=>o.custo?.some(c=>c.tipo==='reacao')?'Reações':o.custo?.some(c=>c.tipo==='bonus')?'Bônus':o.categoria==='magia'?'Magias':'Ações';
let v,aba='Ações',bus;
const dadosExtras=valor=>String(valor??'').split(/[+,\s]+/).map(x=>x.trim()).filter(Boolean);
const modoFormula=valor=>/^2d\d+kh1/i.test(valor)?'vantagem':/^2d\d+kl1/i.test(valor)?'desvantagem':'normal';
function ajustarModo(valor,modo){
  const m=/^(?:1d(\d+)|2d(\d+)k[hl]1)/i.exec(valor);if(!m)return valor;
  const lados=m[1]??m[2],prefixo=modo==='vantagem'?'2d'+lados+'kh1':modo==='desvantagem'?'2d'+lados+'kl1':'1d'+lados;
  return valor.replace(m[0],prefixo);
}
function retrato(a){
  const src=v.imagens[a.id];
  return src?'<img alt="" src="'+esc(src)+'">':'<b>'+esc(a.nome.slice(0,1))+'</b>';
}
function efeitosHud(a){
  const resumo=e=>{const m=e.modificadores??{},mods=Object.entries(m).map(([k,n])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'deslocamento'}[k]??k)+' '+(n>=0?'+':'')+n);return [e.nome,e.descricao,...mods,e.turnos!=null?e.turnos+' turno(s)':e.removeEm==='descanso_longo'?'Até o descanso longo':e.removeEm==='descanso_curto'?'Até o descanso curto':'Duração especial'].filter(Boolean).join('\n');};
  const lista=a.efeitosAtivos??[];return lista.length?'<div class="efeitos-hud" aria-label="Buffs e condições ativas">'+lista.map(e=>'<span class="efeito-hud '+esc(e.tipo??'efeito')+'" tabindex="0" data-info="'+esc(resumo(e))+'"><b>'+(e.tipo==='condicao'?'⚠':'✦')+'</b><small>'+esc(e.nome)+'</small></span>').join('')+'</div>':'';
}
function cartaoAcao(o,f){
  if(!o)return '';
  const r=o.automacao??{},s=o.selecao,custos=(o.custo??[]).map(c=>c.quantidade+' '+(c.tipo==='recurso'?(f.recursos?.find(x=>x.id===c.id)?.nome??c.id):({acao:'ação',bonus:'ação bônus',reacao:'reação'})[c.tipo])).join(' + ');
  const linha=(nome,valor)=>valor?'<div><dt>'+esc(nome)+'</dt><dd>'+esc(valor)+'</dd></div>':'';
  const uso=custos||'Sem custo',alcance=r.arremesso?r.alcanceNormalM+'/'+r.alcanceM+' m':r.alcanceM!=null?r.alcanceM+' m':'—';
  const resistencia=r.cd?r.atributo.toUpperCase()+' · CD '+r.cd:r.tipo==='ataque'?'Ataque '+(r.bonus>=0?'+':'')+r.bonus:'—';
  const efeito=(o.descricao??'').replace(/\n+/g,' · ');
  return '<section class="carta-acao"><header><h2>'+esc(o.nome)+'</h2><small>'+esc([o.categoria,o.circuloBase!=null?(o.circuloBase?o.circuloBase+'º círculo':'Truque'):'',o.origem].filter(Boolean).join(' · '))+'</small></header><dl>'+linha('Uso',uso)+linha('Alcance',alcance)+linha('Área',r.raioM?r.raioM+' m de raio':'')+linha(r.tipo==='ataque'?'Ataque':'Resistência',resistencia)+linha('Dano',r.dano?[r.dano,r.elemento].filter(Boolean).join(' '):'')+linha('Alvos',s?.max?('de '+s.min+' a '+s.max+(s.repetirAlvo?' · pode repetir':' · distintos')):'')+linha('Efeito',efeito)+'</dl></section>';
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
  }else if(parte==='acao'&&p&&a){
    const o=a.ficha.opcoes.find(x=>x.id===p.opcao);
    const executar=p.lista?btn('confirmar','Executar seleção','class="ouro" '+(p.pronto?'':'disabled')):(p.pronto?btn('confirmar',p.substitui?'Executar pelo jogador':'Executar','class="ouro"'):'');
    const desfazer=p.lista?btn('desfazer','Desfazer',p.quantidade?'':'disabled'):'';
    html='<section class="painel-acao">'+cartaoAcao(o,a.ficha)+'<div class="selecao-acao"><strong>'+esc(p.detalhe)+'</strong><div>'+desfazer+executar+btn('cancelar','Cancelar')+'</div></div></section>';
  }else if(parte==='reacao'&&s.reacaoPendente){
    const rp=s.reacaoPendente,reator=s.atores.find(x=>x.id===rp.reator),alvo=s.atores.find(x=>x.id===rp.alvo);
    const opcoes=(reator?.ficha.opcoes??[]).filter(o=>rp.opcoes.includes(o.id));
    const restante=Math.max(0,Math.ceil((rp.terminaEm-Date.now())/1000));
    html='<section class="prompt reacao"><strong>Reação de '+esc(reator?.nome)+'</strong><small>'+esc(alvo?.nome)+' está deixando seu alcance corpo a corpo.</small><b class="timer">'+restante+' s</b><small>Ao escolher a reação, a janela de ajuste será aberta antes de cada rolagem.</small><div class="escolhas-reacao">'+btn('resolverReacao','Não fazer nada','data-id=""')+opcoes.map(o=>btn('resolverReacao',esc(curto(o)),'data-id="'+esc(o.id)+'" class="ouro"')).join('')+'</div></section>';
  }else if(parte==='dados'&&v.pedidoDado){
    const d=v.pedidoDado,m=d.meta??{};
    if(d.tipo==='resultado'){
      const r=d.resultado,classe=/crític/i.test(d.status)?'critico':/falha/i.test(d.status)?'falha':'acerto';
      const lote=r.resultados?.length?r.resultados:null;
      const conteudo=lote?'<div class="resultados-lote">'+lote.map((x,i)=>{const info=m.instancias?.[i]??{};return '<article><strong>'+esc(info.titulo||'Seta '+(i+1))+(info.alvo?' · '+esc(info.alvo):'')+'</strong><output>'+esc(x.resumo||x.total)+'</output><b>'+esc(x.total)+' de dano'+(info.critico?' · crítico':'')+'</b></article>';}).join('')+'</div>':'<output>'+esc(r.resumo||r.total)+'</output>';
      html='<section class="prompt rolagem resultado-dado"><strong>'+esc(m.titulo||'Resultado da rolagem')+'</strong><small>'+esc([m.alvo&&'Alvo: '+m.alvo,m.cd&&'CD '+m.cd].filter(Boolean).join(' · '))+'</small>'+conteudo+(d.status?'<b class="estado '+classe+'">'+esc(d.status)+'</b>':'')+'<div>'+btn('continuarDado','Continuar','class="ouro"')+'</div></section>';
    }else{
      const formulas=d.formulas?.map((x,i)=>document.querySelector('[data-formula-lote="'+i+'"]')?.value||x);
      if(formulas){
        const campos=formulas.map((valor,i)=>{const info=m.instancias?.[i]??{},modo=modoFormula(valor),botaoModo=(id,label)=>btn('modoDadoLote',label,'data-index="'+i+'" data-modo="'+id+'" aria-pressed="'+(modo===id)+'"');return '<article class="ajuste-seta"><header><strong>'+esc(info.titulo||'Seta '+(i+1))+'</strong><small>'+esc(info.alvo||'')+(info.critico?' · crítico':'')+'</small></header><div class="modos-d20" role="group" aria-label="Modo da seta '+(i+1)+'">'+botaoModo('normal','Normal')+botaoModo('vantagem','Vantagem')+botaoModo('desvantagem','Desvantagem')+'</div><label>Comando do Dice+<input data-formula-lote="'+i+'" value="'+esc(valor)+'" autocomplete="off" spellcheck="false"></label></article>';}).join('');
        html='<section class="prompt rolagem rolagem-lote"><strong>'+esc(m.titulo||'Ajustar rolagens')+'</strong><small>Revise cada seta. O Dice+ lançará todas juntas.</small><div class="ajustes-lote">'+campos+'</div>'+(d.erro?'<b class="erro">'+esc(d.erro)+'</b>':'')+(d.tipo==='rolando'?'<p>Rolando todos os dados juntos…</p>':'<div class="acoes-rolagem">'+btn('cancelarDado','Cancelar')+btn('rolarDado','Rolar dados','class="ouro"')+'</div>')+'</section>';
      }else{
        const valor=document.querySelector('#formulaDado')?.value||d.formula||'',temD20=/^(?:1d20|2d20k[hl]1)/i.test(valor),modo=modoFormula(valor),botaoModo=(id,label)=>btn('modoDado',label,'data-modo="'+id+'" aria-pressed="'+(modo===id)+'"');
        html='<section class="prompt rolagem"><strong>'+esc(m.titulo||'Ajustar rolagem')+'</strong><small>'+esc([m.alvo&&'Alvo: '+m.alvo,m.cd&&'CD '+m.cd,m.critico&&'Crítico: dado adicional já aplicado'].filter(Boolean).join(' · '))+'</small>'+(temD20?'<div class="modos-d20" role="group" aria-label="Modo do d20">'+botaoModo('normal','Normal')+botaoModo('vantagem','Vantagem')+botaoModo('desvantagem','Desvantagem')+'</div>':'')+'<label>Comando do Dice+<input id="formulaDado" value="'+esc(valor)+'" autocomplete="off" spellcheck="false"></label>'+(d.erro?'<b class="erro">'+esc(d.erro)+'</b>':'')+(d.tipo==='rolando'?'<p>Rolando todos os dados juntos…</p>':'<div>'+btn('cancelarDado','Cancelar')+btn('rolarDado','Rolar dados','class="ouro"')+'</div>')+'</section>';
      }
    }
  }else if(parte==='barra'&&a){
    const pvMax=pvMaximosAtuais(a),efeitos=efeitosHud(a);
    const reserva='style="--efeitos-reserva:'+Number(v.espacoEfeitos??0)+'px"';
    if(v.compacto){html='<section class="dock compacta" '+reserva+'>'+efeitos+'<div class="dock-corpo"><aside><div class="retrato" title="Clique duas vezes para expandir">'+retrato(a)+'</div><div class="pv"><i style="width:'+Math.max(0,Math.min(100,100*a.pv/pvMax))+'%"></i></div><b>'+a.pv+' / '+pvMax+' PV</b></aside></div></section>';root.innerHTML=html;return;}
    const turno=ativo===a.id;
    const ops=a.ficha.opcoes??[];
    const disp=ops.filter(o=>grupo(o)===aba),pericias=aba==='Perícias',salvas=aba==='Salva guarda';
    const recurso=(a.ficha.recursos??[]).map(r=>'<span title="'+esc(r.nome)+'">'+esc(r.nome)+' <b>'+esc(a.rec[r.id])+'/'+r.maximo+'</b></span>').join('');
    html='<section class="dock" '+reserva+'>'+efeitos+'<div class="dock-corpo"><aside><div class="retrato">'+retrato(a)+'</div><div class="pv"><i style="width:'+Math.max(0,Math.min(100,100*a.pv/pvMax))+'%"></i></div><b>'+a.pv+' / '+pvMax+' PV</b></aside><article><header><strong>'+esc(a.nome)+'</strong><span>'+a.acao+' ação · '+a.bonus+' bônus · '+a.reacao+' reação · '+Number(a.metros.toFixed(2))+' m</span>'+btn('ficha','Ficha')+'</header>'+
      '<div class="rec">'+recurso+'</div><div class="abas">'+['Ações','Bônus','Magias','Reações'].map(g=>btn('aba',g,'data-id="'+g+'" aria-pressed="'+(aba===g)+'"')).join('')+
      '<label>Linhas <select id="linhas">'+[1,2,3,4,5].map(n=>'<option '+(n===v.linhas?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+['Perícias','Salva guarda'].map(g=>btn('aba',g,'data-id="'+g+'" aria-pressed="'+(aba===g)+'"')).join('')+'</div>'+
      '<div class="grade" style="--linhas:'+v.linhas+'">'+(pericias?Object.keys(periciasPadrao).map(nome=>{const bonus=bonusPericia(a.ficha,nome);return btn('teste',esc(nome+' '+(bonus>=0?'+':'')+bonus),'data-grupo="pericias" data-chave="'+esc(nome)+'" data-info="Perícia · '+esc(nome)+'&#10;Bônus da ficha: '+(bonus>=0?'+':'')+bonus+'&#10;Pode ser rolada fora do turno."');}).join(''):salvas?Object.keys(a.ficha.atributos).map(chave=>{const bonus=a.ficha.salvaguardas?.[chave]??mod(a.ficha.atributos[chave]);return btn('teste',esc(chave.toUpperCase()+' '+(bonus>=0?'+':'')+bonus),'data-grupo="salvaguardas" data-chave="'+esc(chave)+'" data-info="Salvaguarda de '+esc(chave.toUpperCase())+'&#10;Bônus da ficha: '+(bonus>=0?'+':'')+bonus+'&#10;Pode ser rolada fora do turno."');}).join(''):disp.map(o=>{
        const livre=s.fase==='preparo';
        const bloqueio=(grupo(o)!=='Reações'&&!turno&&!livre)?'Aguarde seu turno':a.pv<=0?'Personagem a 0 PV':
          (o.custo??[]).some(c=>(c.tipo==='recurso'?a.rec[c.id]:a[c.tipo])<c.quantidade)?'Recurso insuficiente':
          !o.automacao&&!gm&&grupo(o)!=='Reações'?'Resolução pelo mestre':'';
        return btn('usar',esc(curto(o)+(o.nome.includes('duas mãos')?' · 2 mãos':'')),'data-id="'+esc(o.id)+'" '+(bloqueio||ocupado?'disabled ':'')+'data-info="'+esc([bloqueio,detalhes(o,a.ficha)].filter(Boolean).join('\n'))+'"');
      }).join(''))+'</div><footer>'+(p?'<small>Ação aberta no painel de execução.</small>':btn('mover','Mover',turno&&a.pv>0?'':'disabled'))+
      (!p&&s.historico.length?'<small class="resultado" title="'+esc(s.historico[0])+'">'+esc(s.historico[0])+'</small>':'')+btn('passar','Finalizar turno','class="ouro" '+(turno?'':'disabled'))+'</footer></article></div></section>';
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
  const b=e.target.closest('button');if(!b||b.disabled||!v)return;
  const tipo=b.dataset.cmd,id=b.dataset.id,controleDado=['modoDado','modoDadoLote','rolarDado','continuarDado','cancelarDado'].includes(tipo);
  if(v.ocupado&&!controleDado)return;
  if(tipo==='modoDado'){
    const campo=document.querySelector('#formulaDado');if(!campo)return;
    const prefixo=b.dataset.modo==='vantagem'?'2d20kh1':b.dataset.modo==='desvantagem'?'2d20kl1':'1d20';
    campo.value=campo.value.replace(/^(?:1d20|2d20k[hl]1)/i,prefixo);
    document.querySelectorAll('[data-cmd="modoDado"]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));campo.focus();return;
  }
  if(tipo==='modoDadoLote'){
    const indice=b.dataset.index,campo=document.querySelector('[data-formula-lote="'+indice+'"]');if(!campo)return;
    campo.value=ajustarModo(campo.value,b.dataset.modo);
    document.querySelectorAll('[data-cmd="modoDadoLote"][data-index="'+indice+'"]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));campo.focus();return;
  }
  if(tipo==='aba'){aba=id;render();return;}
  const reacao=tipo==='resolverReacao';
  bus.postMessage({tipo,id,formula:document.querySelector('#formulaDado')?.value,formulas:[...document.querySelectorAll('[data-formula-lote]')].map(x=>x.value),ator:tipo==='iniciativa'?id:undefined,opcao:tipo==='usar'?id:reacao?id:undefined,grupo:b.dataset.grupo,chave:b.dataset.chave,
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

