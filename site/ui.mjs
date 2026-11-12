import OBR from './vendor/sdk.mjs';
import {ns,emSala,sala,demo,exemplos} from './bridge.mjs';
import {cabecalhoFicha,biblioteca} from './ficha-view.mjs';
import {atual,validar,publico,multi,incluirAlvo,periciasPadrao,bonusPericia,mod} from './engine.mjs';
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
let tokenSelecionado,solicitacaoFicha,recebido,secao='ficha',alvos=[];
let testePendente;
function view(estado,i){
  if(s?.rev!==estado.rev)alvos=[];
  recebido=estado;s=testar?publico(estado):estado;info=i;

  const id=solicitacaoFicha??s.atores.find(a=>tokenSelecionado&&a.token===tokenSelecionado)?.id;
  if(id){const p=s.atores.find(a=>a.id===id&&(i.role==='GM'||a.dono===i.id));if(p)escolhido=p.id;}
  tokenSelecionado=null;solicitacaoFicha=null;
  render();
}
function render(){
  if(!s)return;
  const gm=info.role==='GM'&&!testar,ativo=atual(s);
  const disponiveis=gm?s.atores:s.atores.filter(x=>x.ficha.tipo==='pj'&&x.dono===(testar?'teste':info.id));
  const a=disponiveis.find(x=>x.id===escolhido)??disponiveis[0];
  if(!gm)secao='ficha';else if(!a)secao='gm';
  const mestre=gm&&secao==='gm';
  escolhido=a?.id;
  const meu=a&&(gm||(a.ficha.tipo==='pj'&&a.dono===(testar?'teste':info.id)));
  $('modo').textContent=info.modo==='ensaio'?'Simulador local · '+(testar?'Jogador':'Mestre'):'Owlbear · '+(gm?'Mestre':'Jogador');
  let h='<nav class="paginas">'+btn('ficha','Ficha do personagem',!mestre?'ativa':'')+(gm?btn('gm','Controle do mestre',mestre?'ativa':''):'')+'</nav>';
  if(info.modo==='ensaio') h+='<div class="linha">'+btn('teste',testar?'Voltar ao mestre':'Testar como jogador')+'</div>';
  if(mestre&&s.fase==='preparo')h+='<section><h2>Preparar encontro</h2><div class="campos">'+btn('exemplo','Carregar Nikki + 2 soldados','primario')+'<label>Importar ficha JSON<input id="arquivo" type="file" accept=".json,application/json"></label>'+btn('iniciar','Iniciar combate')+'</div></section>';
  if(mestre&&s.fase!=='preparo')h+='<section><h2>'+(s.fase==='iniciativa'?'Iniciativa':'Rodada '+s.rodada)+'</h2><div class="ordem">'+(s.ordem.length?s.ordem:s.atores.map(x=>x.id)).map(id=>{const p=s.atores.find(x=>x.id===id);return '<span class="'+(id===ativo?.id?'vez':'')+'">'+esc(p.nome)+' · '+(p.init??'…')+'</span>';}).join('')+'</div>'+(gm&&s.fase==='iniciativa'?btn('npcs','Rolar NPCs pendentes'):'')+'</section>';
  h+='<div class="colunas '+(mestre?'gestao':'folha')+'"><section><h2>'+(mestre?'Participantes':'Personagens')+'</h2>';
  if(!a)h+='<p class="muted">'+(gm?'Importe uma ficha ou carregue o encontro de exemplo.':'Aguardando o mestre vincular uma ficha a você.')+'</p>';
  for(const p of disponiveis)h+='<button class="pessoa" data-ator="'+esc(p.id)+'" aria-pressed="'+(p===a)+'">'+(p.ficha.id==='soldado'?'<img src="fichas/soldado.png" alt="">':'<span class="avatar">'+esc(p.nome[0])+'</span>')+'<span>'+esc(p.nome)+'<br><small>'+esc(p.ficha.tipo.toUpperCase())+' · '+(p.token?'token vinculado':'sem token')+'</small></span></button>';
  h+='</section><section>';
  if(a){
    const f=a.ficha;
    h+=mestre?'<h2>'+esc(a.nome)+'</h2>':cabecalhoFicha(a);
    if(!mestre){
    if(f.pvMaximos)h+='<div class="numeros">'+[['PV',a.pv+' / '+f.pvMaximos],['CA',f.caBase],['Movimento',Number(a.metros.toFixed(2))+' m'],['Ação',a.acao],['Bônus',a.bonus],['Reação',a.reacao]].map(([k,v])=>'<span><small>'+k+'</small><b>'+esc(v)+'</b></span>').join('')+'</div><div class="barra"><i style="width:'+100*a.pv/f.pvMaximos+'%"></i></div>';
    if(f.recursos?.length)h+='<div class="recursos-ficha">'+f.recursos.map(r=>'<div title="'+esc((r.recuperacao??[]).map(x=>x.evento.replaceAll('_',' ')).join(', '))+'"><small>'+esc(r.nome)+'</small><b>'+esc(a.rec[r.id])+' / '+r.maximo+'</b></div>').join('')+'</div>';
    if(a.efeitosAtivos?.length)h+='<p>'+a.efeitosAtivos.map(e=>esc(e.nome)+' · '+e.turnos+' turnos').join(' · ')+'</p>';
    if(s.fase==='iniciativa'&&meu&&a.init===null)h+=btn('iniciativa','Rolar iniciativa','primario');
    if(s.fase==='turnos'&&ativo===a&&meu){
      const ops=(f.opcoes??[]).filter(x=>x.automacao || (gm && !(x.custo??[]).some(y=>y.tipo==='reacao')));
      const o=ops.find(x=>x.id===acao)??ops[0];acao=o?.id;
      h+='<div class="painel"><h3>Turno de '+esc(a.nome)+'</h3><label>Ação ou magia<select id="acao">'+ops.map(x=>opt(x.id,x.nome+(x.automacao?'':' · assistida'),x===o)).join('')+'</select></label>';
      const targets=s.atores.filter(x=>x!==a).concat(a);const target=targets.find(x=>x.id===alvo)??targets[0];alvo=target.id;
      if(multi(o)){
        h+='<div class="campos"><label>Alvo<select id="alvo">'+targets.map(x=>opt(x.id,x.nome,x===target)).join('')+'</select></label>'+btn('marcar','Adicionar alvo')+btn('desfazer','Desfazer')+'</div><p>'+alvos.length+'/'+o.selecao.max+' · '+alvos.map(id=>esc(s.atores.find(x=>x.id===id)?.nome)).join(', ')+'</p>';
      }else if(o?.automacao?.raioM)h+='<div class="campos">'+coord('cx','Centro X',target.x)+coord('cy','Centro Y',target.y)+'</div>';
      else if(['salva','ataque'].includes(o?.automacao?.tipo))h+='<div class="campos"><label>Alvo<select id="alvo">'+targets.map(x=>opt(x.id,x.nome,x===target)).join('')+'</select></label></div>';
      h+='<details><summary>Mapa tático · 1 m por célula</summary><div class="campos"><label>Clique no mapa para<select id="mapModo">'+(o?.automacao?.raioM?opt('centro','Marcar centro da área'):opt('alvo','Escolher alvo'))+opt('mover','Marcar destino de movimento')+'</select></label><small id="medida"></small></div><div class="tabuleiro" id="tabuleiro"></div></details><details><summary>Opções da rolagem</summary><div class="campos"><select id="rolagem"><option>normal</option><option>vantagem</option><option>desvantagem</option></select>'+coord('ajuste','Ajuste ao d20',0)+'</div></details>';
      if(o)h+=btn('usar','Executar','primario');h+='</div><details><summary>Deslocar em metros</summary><div class="campos">'+coord('x','Destino X',a.x)+coord('y','Destino Y',a.y)+btn('mover','Conferir trajeto')+'</div></details>'+btn('passar','Finalizar turno');
    }
    if(meu){
      const saves=Object.keys(f.atributos).map(k=>[k,f.salvaguardas?.[k]??mod(f.atributos[k])]);
      h+='<section class="testes-ficha"><h3>Perícias</h3><div class="grade-testes">'+Object.keys(periciasPadrao).map(k=>{const v=bonusPericia(f,k);return '<button type="button" data-teste="pericias" data-chave="'+esc(k)+'"><span>'+esc(k)+'</span><b>'+(v>=0?'+':'')+v+'</b></button>';}).join('')+'</div><h3>Salvaguardas</h3><p class="muted">Clique aqui ou use o botão direito sobre um atributo.</p><div class="grade-testes salva">'+saves.map(([k,v])=>'<button type="button" data-teste="salvaguardas" data-chave="'+esc(k)+'"><span>'+esc(k.toUpperCase())+'</span><b>'+(v>=0?'+':'')+v+'</b></button>').join('')+'</div></section>';
    }
    h+=biblioteca(a);
    }
    if(mestre){
      h+='<details><summary>Ajustar PV ou recurso</summary><div class="campos"><select id="campo">'+opt('pv','Pontos de vida')+(f.recursos??[]).map(r=>opt(r.id,r.nome)).join('')+'</select>'+coord('delta','Somar ou subtrair',0)+btn('ajustar','Aplicar ajuste')+'</div></details>';
      h+='<details class="panel" '+(s.fase==='preparo'?'open':'')+'><summary>Vínculo e controle</summary><div class="campos">';
      if(info.modo==='ensaio')h+='<small>Token simulado · uma peça por instância</small>';
      else h+='<label>Token de personagem<select id="token">'+opt('','Sem token',!a.token)+info.tokens.map(t=>opt(t.id,t.name||t.id,t.id===a.token)).join('')+'</select></label>'+btn('selecao','Usar seleção do mapa');
      if(f.tipo==='pj')h+='<label>Quem controla<select id="dono">'+opt('','Mestre',!a.dono)+(a.dono&&!info.players.some(p=>p.id===a.dono)?opt(a.dono,'Jogador desconectado',true):'')+info.players.filter(p=>p.role!=='GM').map(p=>opt(p.id,p.name,p.id===a.dono)).join('')+'</select></label>';
      h+=btn('vincular','Salvar vínculo')+(!a.token&&info.modo==='sala'&&s.fase==='preparo'?btn('criarPeca','Criar token desta ficha'):'')+'</div>'+(s.fase==='preparo'?btn('remover','Retirar do encontro'):'')+'</details>';
    }

  }
  h+='</section></div>';if(mestre)h+='<section><h2>Histórico</h2><ol class="historico">'+s.historico.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>';
  if(mestre)h+='<footer>'+(s.fase==='preparo'?btn('curto','Descanso curto')+btn('longo','Descanso longo'):btn('encerrar','Encerrar combate'))+'</footer>';
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
        else if(who&&multi(a.ficha.opcoes.find(o=>o.id===acao))){alvo=who.id;tarefa(()=>executar('marcar'));return;}
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
const dadosExtras=valor=>String(valor??'').split(/[+,\s]+/).map(x=>x.trim()).filter(Boolean);
async function enviar(tipo,extra={}){await api.enviar({tipo,rev:s.rev,ator:escolhido,comoJogador:testar,...extra});}
async function rolarTeste(grupo,chave){
  const a=s.atores.find(x=>x.id===escolhido);if(!a)return;
  const bonus=grupo==='pericias'?bonusPericia(a.ficha,chave):(a.ficha.salvaguardas?.[chave]??mod(a.ficha.atributos[chave]));
  const dlg=$('rolarTeste');$('tituloTeste').textContent=(grupo==='pericias'?'Perícia · ':'Salvaguarda · ')+chave;
  $('bonusTeste').textContent='Bônus da ficha: '+(bonus>=0?'+':'')+bonus;$('modoTeste').value='normal';$('dadosTeste').value='';$('ajusteTeste').value=0;dlg.returnValue='nao';
  const rev=s.rev;const aceitou=await new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});
  if(!aceitou)return;if(s.rev!==rev)throw Error('O encontro mudou antes da rolagem.');
  await enviar('teste',{grupo,chave,modo:$('modoTeste').value,ajuste:num('ajusteTeste'),dadosAjuste:dadosExtras($('dadosTeste').value),confirmado:info.role==='GM'&&!testar&&a.ficha.tipo==='pj'});
}
async function executar(k){
  const a=s.atores.find(x=>x.id===escolhido);
  if(k==='gm'||k==='ficha'){secao=k;return render();}
  if(k==='marcar'||k==='desfazer'){
    if(k==='desfazer')alvos.pop();else alvos=incluirAlvo(alvos,alvo,multi(a.ficha.opcoes.find(o=>o.id===acao)));
    return render();
  }
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
  if(k==='ajustar'){
    const subst=info.role==='GM'&&!testar&&a.ficha.tipo==='pj';
    const extra={confirmado:subst};
    extra.campo=$('campo').value;extra.valor=num('delta');
    const rev=s.rev;
    if(await confirma(subst?'Agir por '+a.nome+' como mestre?':a.nome,'Alteração de saldo: '+extra.valor)){
      if(s.rev!==rev)throw Error('O encontro mudou.');
      await enviar(k,extra);
    }return;
  }
  const o=a.ficha.opcoes.find(x=>x.id===acao);
  let detalhe=k==='usar'?(o.descricao??o.nome):a.nome;
  if(k==='mover')detalhe='Percorrer '+Math.hypot(num('x')-a.x,num('y')-a.y).toFixed(2)+' m.';
  if(k==='usar'&&multi(o)){
    if(alvos.length<o.selecao.min)throw Error('Selecione pelo menos '+o.selecao.min+' alvo(s).');
    detalhe+=' · '+alvos.map(id=>s.atores.find(x=>x.id===id).nome).join(', ');
  }
  const substitui=info.role==='GM'&&!testar&&a.ficha.tipo==='pj';
  const rev=s.rev;
  if(!await confirma(substitui?'Agir por '+a.nome+' como mestre?':({usar:o?.nome,mover:'Executar deslocamento?',iniciativa:'Rolar iniciativa?',passar:'Finalizar turno?'})[k],detalhe))return;
  if(s.rev!==rev)throw Error('O encontro mudou. Confira a ação.');
  const args={confirmado:substitui};
  if(k==='usar')Object.assign(args,{opcao:acao,alvo:multi(o)?undefined:alvo,alvos:multi(o)?[...alvos]:undefined,ponto:{x:num('cx'),y:num('cy')},ajuste:num('ajuste'),modo:$('rolagem').value,assistido:!o.automacao});
  if(k==='mover')Object.assign(args,{x:num('x'),y:num('y')});
  await enviar(k,args);
}
async function tarefa(fn){if(ocupado)return;ocupado=true;aviso('');try{await fn();}catch(e){aviso(e.message);}finally{ocupado=false;}}
$('app').onclick=e=>{const b=e.target.closest('button');if(!b||ocupado)return;if(b.dataset.ator){escolhido=b.dataset.ator;acao=null;alvos=[];return render();}if(b.dataset.teste){return tarefa(()=>rolarTeste(b.dataset.teste,b.dataset.chave));}if(b.dataset.do)tarefa(()=>executar(b.dataset.do));};
$('app').onchange=e=>{if(e.target.id==='acao'){acao=e.target.value;alvos=[];render();}if(e.target.id==='alvo')alvo=e.target.value;
 if(e.target.id==='arquivo'){const f=e.target.files[0];if(f)tarefa(async()=>{const j=validar(JSON.parse((await f.text()).replace(/^\uFEFF/,'')));await enviar('adicionar',{ficha:j});aviso(j.nome+' adicionado. Escolha o token e salve o vínculo.');});}};
$('app').oncontextmenu=e=>{const atributo=e.target.closest('[data-save]');if(atributo){e.preventDefault();return tarefa(()=>rolarTeste('salvaguardas',atributo.dataset.save));}if(e.target.closest('[data-do="usar"]')){e.preventDefault();$('rolagem').closest('details').open=true;$('rolagem').focus();}};
try{api=await (emSala?sala:demo)(view);await api.notify();
 if(emSala){
   const chave=ns+'/abrir-ficha/'+OBR.room.id;
   function pedido(raw){if(!raw)return;const d=JSON.parse(raw);if(Date.now()-d.quando>30000)return;
     secao='ficha';solicitacaoFicha=d.id;if(s)view(recebido,info);localStorage.removeItem(chave);}
   window.addEventListener('storage',e=>{if(e.key===chave)pedido(e.newValue);});pedido(localStorage.getItem(chave));
   let ultimo;
   const selecionar=id=>{if(!id||id===ultimo){ultimo=id;return;}ultimo=id;if(!s){tokenSelecionado=id;return;}const a=s?.atores.find(x=>x.token===id&&(info?.role==='GM'||x.dono===info?.id));if(a){escolhido=a.id;acao=null;alvos=[];render();}};
   api.observarSelecao(selecionar);const id=await api.selecionado();
   selecionar(id);
 }
 if(emSala)setTimeout(()=>{if(!s){aviso('Aguardando o mestre e a cena do Owlbear.');api.notify();}},1800);}catch(e){aviso(e.message);}

window.render_game_to_text=()=>JSON.stringify({coordenadas:'x cresce para a direita; y cresce para baixo; distâncias em metros',fase:s?.fase,rodada:s?.rodada,turno:atual(s??{atores:[],ordem:[]})?.nome,selecionado:s?.atores.find(a=>a.id===escolhido)?.nome,reacao:s?.reacaoPendente?{reator:s.atores.find(a=>a.id===s.reacaoPendente.reator)?.nome,alvo:s.atores.find(a=>a.id===s.reacaoPendente.alvo)?.nome,terminaEm:s.reacaoPendente.terminaEm}:null});
window.advanceTime=()=>{};

