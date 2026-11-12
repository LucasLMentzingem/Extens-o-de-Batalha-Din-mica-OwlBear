import {emSala,sala,demo,exemplos} from './bridge.mjs';
import {atual,validar,publico} from './engine.mjs';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const opt=(id,n,sel)=>'<option value="'+esc(id)+'" '+(sel?'selected':'')+'>'+esc(n)+'</option>';
const btn=(id,n,cls='')=>'<button data-do="'+id+'" class="'+cls+'">'+n+'</button>';
let s,info,api,escolhido,acao,alvo,ocupado=false,testar=false;
const aviso=t=>{$('aviso').textContent=t;};
function confirma(t,d){
  const dlg=$('confirmar');$('pergunta').textContent=t;$('detalhe').textContent=d;dlg.returnValue='nao';
  return new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});
}
let recebido;
function view(estado,i){
  const antes=s&&atual(s)?.id;
  recebido=estado;s=testar?publico(estado):estado;info=i;
  const vez=atual(s);
  if(vez&&vez.id!==antes){escolhido=vez.id;acao=null;alvo=null;}
  render();
}
function render(){
  if(!s)return;
  const gm=info.role==='GM'&&!testar,ativo=atual(s),a=s.atores.find(x=>x.id===escolhido)??ativo??s.atores[0];
  escolhido=a?.id;
  const meu=a&&(gm||(a.ficha.tipo==='pj'&&a.dono===(testar?'teste':info.id)));
  $('modo').textContent=info.modo==='ensaio'?'Simulador local · '+(testar?'Jogador':'Mestre'):'Owlbear · '+(gm?'Mestre':'Jogador');
  let h='';
  if(info.modo==='ensaio') h+='<div class="linha">'+btn('teste',testar?'Voltar ao mestre':'Testar como jogador')+'</div>';
  if(gm&&s.fase==='preparo')h+='<section><h2>Preparar encontro</h2><div class="campos">'+btn('exemplo','Carregar Nikki + 2 soldados','primario')+'<label>Importar ficha JSON<input id="arquivo" type="file" accept=".json,application/json"></label>'+btn('iniciar','Iniciar combate')+'</div></section>';
  if(s.fase!=='preparo')h+='<section><h2>'+(s.fase==='iniciativa'?'Iniciativa':'Rodada '+s.rodada)+'</h2><div class="ordem">'+(s.ordem.length?s.ordem:s.atores.map(x=>x.id)).map(id=>{const p=s.atores.find(x=>x.id===id);return '<span class="'+(id===ativo?.id?'vez':'')+'">'+esc(p.nome)+' · '+(p.init??'…')+'</span>';}).join('')+'</div>'+(gm&&s.fase==='iniciativa'?btn('npcs','Rolar NPCs pendentes'):'')+'</section>';
  h+='<div class="colunas"><section><h2>Participantes</h2>';
  if(!a)h+='<p class="muted">Importe uma ficha ou carregue o encontro de exemplo.</p>';
  for(const p of s.atores)h+='<button class="pessoa" data-ator="'+esc(p.id)+'" aria-pressed="'+(p===a)+'">'+(p.ficha.id==='soldado'?'<img src="fichas/soldado.png" alt="">':'<span class="avatar">'+esc(p.nome[0])+'</span>')+'<span>'+esc(p.nome)+'<br><small>'+esc(p.ficha.tipo.toUpperCase())+' · '+(p.token?'token vinculado':'sem token')+'</small></span></button>';
  h+='</section><section>';
  if(a){
    const f=a.ficha;
    h+='<h2>'+esc(a.nome)+'</h2>';
    if(f.pvMaximos)h+='<div class="numeros">'+[['PV',a.pv+' / '+f.pvMaximos],['CA',f.caBase],['Movimento',Number(a.metros.toFixed(2))+' m'],['Ação',a.acao],['Bônus',a.bonus],['Reação',a.reacao]].map(([k,v])=>'<span><small>'+k+'</small><b>'+esc(v)+'</b></span>').join('')+'</div><div class="barra"><i style="width:'+100*a.pv/f.pvMaximos+'%"></i></div>';
    if(f.recursos?.length)h+='<p class="muted">'+f.recursos.map(r=>esc(r.nome)+' '+esc(a.rec[r.id])+'/'+r.maximo).join(' · ')+'</p>';
    if(a.efeitosAtivos?.length)h+='<p>'+a.efeitosAtivos.map(e=>esc(e.nome)+' · '+e.turnos+' turnos').join(' · ')+'</p>';
    if(s.fase==='iniciativa'&&meu&&a.init===null)h+=btn('iniciativa','Rolar iniciativa','primario');
    if(s.fase==='turnos'&&ativo===a&&meu){
      const ops=(f.opcoes??[]).filter(x=>x.automacao || (gm && !(x.custo??[]).some(y=>y.tipo==='reacao')));
      const o=ops.find(x=>x.id===acao)??ops[0];acao=o?.id;
      h+='<div class="painel"><h3>Turno de '+esc(a.nome)+'</h3><label>Ação ou magia<select id="acao">'+ops.map(x=>opt(x.id,x.nome+(x.automacao?'':' · assistida'),x===o)).join('')+'</select></label>';
      const targets=s.atores.filter(x=>x!==a).concat(a);const target=targets.find(x=>x.id===alvo)??targets[0];alvo=target.id;
      if(o?.automacao?.raioM)h+='<div class="campos">'+coord('cx','Centro X',target.x)+coord('cy','Centro Y',target.y)+'</div>';
      else if(['salva','ataque'].includes(o?.automacao?.tipo))h+='<div class="campos"><label>Alvo<select id="alvo">'+targets.map(x=>opt(x.id,x.nome,x===target)).join('')+'</select></label></div>';
      h+='<details open><summary>Mapa tático · 1 m por célula</summary><div class="campos"><label>Clique no mapa para<select id="mapModo">'+(o?.automacao?.raioM?opt('centro','Marcar centro da área'):opt('alvo','Escolher alvo'))+opt('mover','Marcar destino de movimento')+'</select></label><small id="medida"></small></div><div class="tabuleiro" id="tabuleiro"></div></details><details><summary>Opções da rolagem</summary><div class="campos"><select id="rolagem"><option>normal</option><option>vantagem</option><option>desvantagem</option></select>'+coord('ajuste','Ajuste ao d20',0)+'</div></details>';
      if(o)h+=btn('usar','Executar','primario');h+='</div><details><summary>Deslocar em metros</summary><div class="campos">'+coord('x','Destino X',a.x)+coord('y','Destino Y',a.y)+btn('mover','Conferir trajeto')+'</div></details>'+btn('passar','Finalizar turno');
    }
    if(meu&&f.salvaguardas){
      const testes=['pericias','salvaguardas'].flatMap(g=>Object.entries(f[g]??{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>opt(g+'|'+k,(g==='pericias'?'Perícia · ':'Salvaguarda · ')+k+' ('+(v>=0?'+':'')+v+')')));
      h+='<details><summary>Testes rápidos</summary><div class="campos"><select id="testeNome">'+testes.join('')+'</select><select id="testeModo"><option>normal</option><option>vantagem</option><option>desvantagem</option></select>'+coord('testeAjuste','Ajuste',0)+btn('testeRapido','Rolar teste')+'</div></details>';
    }
    const reactions=f.opcoes?.filter(o=>o.custo?.some(c=>c.tipo==='reacao'))??[];
    if(s.fase==='turnos'&&meu&&reactions.length)h+='<details><summary>Reações · '+a.reacao+' disponível</summary><p>Confira o gatilho com o mestre. O sistema desconta o custo e a mesa aplica o efeito.</p><select id="reacao">'+reactions.map(o=>opt(o.id,o.nome)).join('')+'</select>'+btn('reagir','Usar reação')+'</details>';
    if(gm){
      h+='<details><summary>Ajustar PV ou recurso</summary><div class="campos"><select id="campo">'+opt('pv','Pontos de vida')+(f.recursos??[]).map(r=>opt(r.id,r.nome)).join('')+'</select>'+coord('delta','Somar ou subtrair',0)+btn('ajustar','Aplicar ajuste')+'</div></details>';
      h+='<details class="panel" '+(s.fase==='preparo'?'open':'')+'><summary>Vínculo e controle</summary><div class="campos">';
      if(info.modo==='ensaio')h+='<small>Token simulado · uma peça por instância</small>';
      else h+='<label>Token de personagem<select id="token">'+opt('','Sem token',!a.token)+info.tokens.map(t=>opt(t.id,t.name||t.id,t.id===a.token)).join('')+'</select></label>'+btn('selecao','Usar seleção do mapa');
      if(f.tipo==='pj')h+='<label>Quem controla<select id="dono">'+opt('','Mestre',!a.dono)+(a.dono&&!info.players.some(p=>p.id===a.dono)?opt(a.dono,'Jogador desconectado',true):'')+info.players.filter(p=>p.role!=='GM').map(p=>opt(p.id,p.name,p.id===a.dono)).join('')+'</select></label>';
      h+=btn('vincular','Salvar vínculo')+(!a.token&&info.modo==='sala'&&s.fase==='preparo'?btn('criarPeca','Criar token desta ficha'):'')+'</div>'+(s.fase==='preparo'?btn('remover','Retirar do encontro'):'')+'</details>';
    }
    if(f.opcoes?.length)h+='<details><summary>Consultar ficha e regras assistidas</summary>'+[...f.opcoes,...(f.passivas??[]),...(f.notas??[])].map(o=>'<p><strong>'+esc(o.nome)+'</strong><br>'+esc(o.descricao)+'</p>').join('')+'</details>';
  }
  h+='</section></div><section><h2>Histórico</h2><ol class="historico">'+s.historico.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>';
  if(gm)h+='<footer>'+(s.fase==='preparo'?btn('curto','Descanso curto')+btn('longo','Descanso longo'):btn('encerrar','Encerrar combate'))+'</footer>';
  $('app').innerHTML=h;
  if($('tabuleiro')){
    const rule=a.ficha.opcoes.find(o=>o.id===acao)?.automacao;
    const board=$('tabuleiro');
    for(let j=-4;j<=4;j++)for(let i=-6;i<=6;i++){
      const x=Math.round(a.x)+i,y=Math.round(a.y)+j;
      const tile=document.createElement('button');
      const occupants=s.atores.filter(p=>Math.round(p.x)===x&&Math.round(p.y)===y);
      const who=occupants[0];
      tile.title=x+', '+y+' m'+(who?' · '+occupants.map(p=>p.nome).join(', '):'');
      tile.setAttribute('aria-label',tile.title);
      if(rule?.alcanceM && Math.hypot(x-a.x,y-a.y)<=rule.alcanceM)tile.classList.add('alcance');
      if(who){
        tile.textContent=who===a?'◆':String(s.atores.indexOf(who)+1);
        tile.classList.add(who.ficha.tipo);
      }
      tile.onclick=()=>{
        const tipo=$('mapModo').value;
        if(tipo==='mover'){
          $('x').value=x;$('y').value=y;$('x').closest('details').open=true;
        }else if(tipo==='centro'){$('cx').value=x;$('cy').value=y;}
        else if(who&&$('alvo')){alvo=who.id;$('alvo').value=alvo;}
        for(const t of board.children)t.classList.remove('marcada');
        tile.classList.add('marcada');
        $('medida').textContent=(who?who.nome+' · ':'')+Math.hypot(x-a.x,y-a.y).toFixed(2)+' m';
      };
      board.append(tile);
    }
  }
}
function coord(id,label,value){return '<label>'+label+'<input type="number" step="any" class="curto" id="'+id+'" value="'+Number(value)+'"></label>';}
const num=id=>Number($(id)?.value??0);
async function enviar(tipo,extra={}){await api.enviar({tipo,rev:s.rev,ator:escolhido,comoJogador:testar,...extra});}
async function executar(k){
  const a=s.atores.find(x=>x.id===escolhido);
  if(k==='teste'){testar=!testar;return view(recebido,info);}
  if(k==='exemplo'){
    return enviar('exemplo',{fichas:await exemplos(),ensaio:info.modo==='ensaio'});
  }
  if(k==='selecao'){const id=await api.selecionado();if(!info.tokens.some(t=>t.id===id))throw Error('Selecione um token da camada Personagem.');$('token').value=id;return;}
  if(k==='vincular')return enviar(k,{token:$('token')?.value??('sim-'+a.id),dono:$('dono')?.value});
  if(k==='npcs'){for(const p of s.atores.filter(x=>x.ficha.tipo==='npc'&&x.init===null))await enviar('iniciativa',{ator:p.id});return;}
  if(['curto','longo'].includes(k)){if(await confirma('Executar descanso '+k+'?','Aplica a recuperação aos jogadores do encontro.'))await enviar('descanso',{periodo:k});return;}
  if(['encerrar','remover'].includes(k)){if(await confirma(k==='encerrar'?'Encerrar combate?':'Retirar participante?',a?.nome??''))await enviar(k);return;}
  if(['iniciar','criarPeca'].includes(k))return enviar(k);
  if(['testeRapido','reagir','ajustar'].includes(k)){
    const subst=info.role==='GM'&&!testar&&a.ficha.tipo==='pj';
    const extra={confirmado:subst};
    if(k==='testeRapido'){[extra.grupo,extra.chave]=$('testeNome').value.split('|');extra.modo=$('testeModo').value;extra.ajuste=num('testeAjuste');}
    if(k==='reagir')extra.opcao=$('reacao').value;
    if(k==='ajustar'){extra.campo=$('campo').value;extra.valor=num('delta');}
    const rev=s.rev;
    if(await confirma(subst?'Agir por '+a.nome+' como mestre?':a.nome,k==='reagir'?'Confirmar gatilho e gastar a reação?':k==='ajustar'?'Alteração de saldo: '+extra.valor:extra.chave)){
      if(s.rev!==rev)throw Error('O encontro mudou.');
      await enviar(k==='testeRapido'?'teste':k,extra);
    }return;
  }
  const o=a.ficha.opcoes.find(x=>x.id===acao);
  let detalhe=k==='usar'?(o.descricao??o.nome):a.nome;
  if(k==='mover')detalhe='Percorrer '+Math.hypot(num('x')-a.x,num('y')-a.y).toFixed(2)+' m.';
  const substitui=info.role==='GM'&&!testar&&a.ficha.tipo==='pj';
  const rev=s.rev;
  if(!await confirma(substitui?'Agir por '+a.nome+' como mestre?':({usar:o?.nome,mover:'Executar deslocamento?',iniciativa:'Rolar iniciativa?',passar:'Finalizar turno?'})[k],detalhe))return;
  if(s.rev!==rev)throw Error('O encontro mudou. Confira a ação.');
  const args={confirmado:substitui};
  if(k==='usar')Object.assign(args,{opcao:acao,alvo,ponto:{x:num('cx'),y:num('cy')},ajuste:num('ajuste'),modo:$('rolagem').value,assistido:!o.automacao});
  if(k==='mover')Object.assign(args,{x:num('x'),y:num('y')});
  await enviar(k,args);
}
async function tarefa(fn){if(ocupado)return;ocupado=true;aviso('');try{await fn();}catch(e){aviso(e.message);}finally{ocupado=false;}}
$('app').onclick=e=>{const b=e.target.closest('button');if(!b||ocupado)return;if(b.dataset.ator){escolhido=b.dataset.ator;acao=null;return render();}if(b.dataset.do)tarefa(()=>executar(b.dataset.do));};
$('app').onchange=e=>{if(e.target.id==='acao'){acao=e.target.value;render();}if(e.target.id==='alvo')alvo=e.target.value;
 if(e.target.id==='arquivo'){const f=e.target.files[0];if(f)tarefa(async()=>{const j=validar(JSON.parse((await f.text()).replace(/^\uFEFF/,'')));await enviar('adicionar',{ficha:j});aviso(j.nome+' adicionado. Escolha o token e salve o vínculo.');});}};
$('app').oncontextmenu=e=>{if(e.target.closest('[data-do="usar"]')){e.preventDefault();$('rolagem').closest('details').open=true;$('rolagem').focus();}};
try{api=await (emSala?sala:demo)(view);await api.notify();if(emSala)setTimeout(()=>{if(!s){aviso('Aguardando o mestre e a cena do Owlbear.');api.notify();}},1800);}catch(e){aviso(e.message);}

