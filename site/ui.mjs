import {celulaInventario} from './inventory-cell.mjs?v=0.8.45';
import OBR from './vendor/sdk.mjs';
import {ns,emSala,sala,demo,conteudoConfigurado} from './bridge.mjs?v=0.8.45';
import {fichaEditavel,biblioteca} from './ficha-view.mjs?v=0.8.45';
import {atual,validar,publico,multi,incluirAlvo,periciasPadrao,bonusPericia,mod,caAtual,pvMaximosAtuais,opcoesDisponiveis,opcaoPorId,lojasAtivas,precoVendaPc,saldoMoedasPo,trocaDoAtor,avancosMesa} from './engine.mjs?v=0.8.45';
import {itensCatalogo,lojasCatalogo} from './catalog.mjs?v=0.8.45';
import {catalogoAberto,chaveCatalogo,limparCatalogo} from './loja-presenca.mjs?v=0.8.45';
import {lerPastaFichas} from './importar-pasta-fichas.mjs?v=0.8.45';
import {METROS_POR_CELULA} from './scene-scale.mjs?v=0.8.45';
import {arteItem,criarExameItem} from './item-art.mjs?v=0.8.45';
import {preencherBalaoHabilidade} from './ability-art.mjs?v=0.8.45';
const $=id=>document.getElementById(id);
const exameItem=criarExameItem();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const opt=(id,n,sel)=>'<option value="'+esc(id)+'" '+(sel?'selected':'')+'>'+esc(n)+'</option>';
const btn=(id,n,cls='')=>'<button data-do="'+id+'" class="'+cls+'">'+n+'</button>';
let s,info,api,escolhido,acao,alvo,ocupado=false,testar=false,catalogo;
const aviso=t=>{$('aviso').textContent=t;};
function confirma(t,d,comPvp=false){
  const dlg=$('confirmar');$('pergunta').textContent=t;$('detalhe').textContent=d;dlg.returnValue='nao';
  $('opcao-pvp').hidden=!comPvp;$('pvp-inicio').checked=false;
  return new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});
}
let tokenSelecionado,solicitacaoFicha,recebido,secao='ficha',alvos=[],npcsAbertos=false,bausAbertos=false,recipienteSelecionadoId=null,paginaRecipiente='ficha',paginaFicha='personagem',paginaLivro='classe',itemContexto=null,itemContextoSlot=null,habilidadeContexto=null,lojaLocalAtor=null,trocaLocalId=null,trocaLocalAtor=null,trocaSolicitadaPor=null,abrindoTroca=false;
let lojaDaVenda=null;
let gruposFichas=[];
const gruposAbertos=new Set();
function renderGruposFichas(){
  const grupos = [...gruposFichas, ...(s.gruposFichas??[])];
  return '<div class="grupos-fichas">'+grupos.map(g=>'<details data-grupo-lista="'+esc(g.id)+'" '+(gruposAbertos.has(g.id)?'open':'')+'><summary>'+esc(g.nome)+' <small>'+g.fichas.length+' fichas</small></summary><div class="linha-grupo">'+
    '<button type="button" data-adicionar-grupo="'+esc(g.id)+'" class="primario">Adicionar grupo inteiro</button></div><div class="lista-grupo">'+g.fichas.map((f,indice)=>'<div><span>'+esc(f.nome)+'</span><button type="button" data-grupo-origem="'+esc(g.id)+'" data-adicionar-unidade="'+indice+'">Adicionar unidade</button></div>').join('')+'</div></details>').join('')+'</div>';
}
async function adicionarDoGrupo(grupoId,indice){
  const importado=s.gruposFichas?.find(g=>g.id===grupoId);
  if(importado){
    await enviar('adicionarGrupo',{grupoId,indice});
    aviso((indice===undefined?importado.fichas.length:1)+' ficha(s) adicionada(s). Vincule os tokens e jogadores desejados.');
    return;
  }
  const grupo=gruposFichas.find(g=>g.id===grupoId);
  if(!grupo)throw Error('Grupo indisponível.');
  const registros=indice===undefined?grupo.fichas:[grupo.fichas[indice]];
  const fichas=await Promise.all(registros.map(async f=>{
    const r=await fetch('./fichas/'+encodeURIComponent(f.id)+'.json');
    if(!r.ok)throw Error('Falha ao carregar '+f.nome);
    return validar(await r.json());
  }));
  await enviar('adicionarGrupo',{fichas});
  aviso(fichas.length+' ficha(s) adicionada(s). Vincule os tokens e jogadores desejados.');
}
let saqueVisualId=null;
async function sincronizarSaqueVisual(){
  const a=s?.atores.find(x=>x.id===escolhido),saque=a?.saqueAberto;
  const pode=a&&(info.role==='GM'||a.dono===info.id);
  if(!saque||!pode){
    if(saqueVisualId&&emSala)await OBR.popover.close(ns+'/saque').catch(()=>{});
    document.querySelector('#saque-local')?.remove();saqueVisualId=null;return;
  }
  if(saqueVisualId===saque.id)return;
  saqueVisualId=saque.id;
  const url=new URL('./saque.html?v=0.8.45',location.href);url.searchParams.set('ator',a.id);
  if(emSala){
    const largura=await OBR.viewport.getWidth(),altura=await OBR.viewport.getHeight(),w=Math.min(560,largura-16);
    await OBR.popover.open({id:ns+'/saque',url:url.href,width:w,height:Math.min(720,altura-32),hidePaper:true,disableClickAway:true,marginThreshold:0,anchorReference:'POSITION',anchorPosition:{left:Math.max(8,largura-w-12),top:16},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});
  }else{
    const painel=document.createElement('aside');painel.id='saque-local';painel.className='loja-local';
    const frame=document.createElement('iframe');frame.src=url.href;frame.title='Saquear';painel.append(frame);document.body.append(painel);
  }
}
function lojaSelecionada(atorId){
  const catalogo=catalogoAberto(atorId);
  return s?.fase==='preparo'&&catalogo?lojasAtivas(s).find(x=>x.id===catalogo.lojaId):null;
}
addEventListener('storage',e=>{
  if(e.key===chaveCatalogo&&lojaSelecionada(escolhido)?.id!==lojaDaVenda){
    document.querySelectorAll('[data-item-acao="vender"]').forEach(b=>b.remove());
    lojaDaVenda=null;
  }
});
const dicaLivro=document.createElement('div');dicaLivro.className='dica-livro';dicaLivro.hidden=true;dicaLivro.setAttribute('role','tooltip');document.body.append(dicaLivro);
let testePendente;
function view(estado,i){
  $('recuperacao').hidden=true;
  if(s?.rev!==estado.rev)alvos=[];
  recebido=estado;s=testar?publico(estado):estado;info=i;

  if(estado.fase!=='preparo'){
    limparCatalogo();
    lojaLocalAtor=null;trocaLocalId=null;trocaLocalAtor=null;
    if(emSala){OBR.popover.close(ns+'/loja').catch(()=>{});OBR.popover.close(ns+'/troca').catch(()=>{});}
  }

  const id=solicitacaoFicha??s.atores.find(a=>tokenSelecionado&&a.token===tokenSelecionado)?.id;
  if(id){const p=s.atores.find(a=>a.id===id&&(i.role==='GM'||a.dono===i.id));if(p)escolhido=p.id;}
  solicitacaoFicha=null;
  const a=s.atores.find(x=>x.id===escolhido)??s.atores.find(x=>x.saqueAberto&&(i.role==='GM'||x.dono===i.id));
  if(a?.saqueAberto&&saqueVisualId!==a.saqueAberto.id){escolhido=a.id;secao='ficha';paginaFicha='inventario';}
  render();
  queueMicrotask(()=>sincronizarSaqueVisual().catch(e=>aviso(e.message)));
  queueMicrotask(()=>sincronizarTrocaVisual().catch(e=>aviso(e.message)));
}
const jogadoresOnline=()=>info.players.filter(p=>p.role!=='GM');
function opcoesDono(a,id='dono-vinculo-'+a.id){
  if(a.ficha.tipo!=='pj')return '<span class="vinculo-mestre">Controlado pelo mestre</span>';
  return '<label>Jogador online<select id="'+esc(id)+'">'+opt('','Mestre',!a.dono)+(a.dono&&!jogadoresOnline().some(p=>p.id===a.dono)?opt(a.dono,'Jogador desconectado',true):'')+jogadoresOnline().map(p=>opt(p.id,p.name,p.id===a.dono)).join('')+'</select></label>';
}
function tokensDisponiveis(a){
  return info.tokens.filter(t=>!s.atores.some(x=>x!==a&&x.token===t.id));
}
function renderControleFichasMestre(){
  const tokenAtual=info.tokens.find(t=>t.id===tokenSelecionado),atorDoToken=s.atores.find(a=>a.token===tokenAtual?.id);
  const candidatasToken=tokenAtual?s.atores.filter(a=>!a.token||a===atorDoToken):[];
  const fichaToken=candidatasToken.find(a=>a.id===escolhido)??atorDoToken??candidatasToken[0];
  const resumoToken=tokenAtual?'<div class="token-selecionado"><div><small>TOKEN SELECIONADO NO MAPA</small><h3>'+esc(tokenAtual.name||tokenAtual.id)+'</h3><p>'+(atorDoToken?'Vinculado atualmente a '+esc(atorDoToken.nome)+'.':'Ainda não possui ficha vinculada.')+'</p></div>'+(candidatasToken.length?'<label>Ficha<select id="ficha-token-selecionado">'+candidatasToken.map(a=>opt(a.id,a.nome,a===fichaToken)).join('')+'</select></label>'+opcoesDono(fichaToken,'dono-token-selecionado')+'<button type="button" class="primario" data-vincular-selecionado>Vincular ao token selecionado</button>':'<p class="muted">Todas as fichas carregadas já possuem token.</p>')+'</div>':'<div class="token-selecionado vazio"><div><small>TOKEN SELECIONADO NO MAPA</small><h3>Nenhum token selecionado</h3><p>Selecione uma peça da camada Personagem para configurá-la aqui.</p></div></div>';
  const linhas=s.atores.map(a=>{
    const tokens=tokensDisponiveis(a),tokenAusente=a.token&&!info.tokens.some(t=>t.id===a.token);
    const seletor='<label>Token<select id="token-vinculo-'+esc(a.id)+'">'+opt('','Sem token',!a.token)+(tokenAusente?opt(a.token,'Token indisponível',true):'')+tokens.map(t=>opt(t.id,t.name||t.id,t.id===a.token)).join('')+'</select></label>';
    return '<article class="linha-vinculo '+(a.id===escolhido?'selecionada':'')+'"><div><strong>'+esc(a.nome)+'</strong><small>'+(a.ficha.tipo==='pj'?'PERSONAGEM':'NPC')+' · '+(a.token?'token vinculado':'sem token')+'</small></div>'+seletor+opcoesDono(a)+'<div class="acoes-vinculo"><button type="button" data-usar-selecao-vinculo="'+esc(a.id)+'">Usar seleção</button><button type="button" class="primario" data-salvar-vinculo="'+esc(a.id)+'">Salvar vínculo</button><button type="button" data-ver-ficha="'+esc(a.id)+'">Abrir ficha</button><button type="button" class="perigo" data-excluir-ficha="'+esc(a.id)+'" '+(s.fase==='preparo'?'':'disabled title="Pare o combate para excluir a ficha"')+'>Excluir ficha</button></div></article>';
  }).join('');
  // #12 Durante o combate o mestre também pode adicionar reforços (entram com iniciativa rolada).
  const importar='<div class="importar-fichas">'+renderGruposFichas()+'<div class="campos"><label>Adicionar ficha JSON<input id="arquivo" type="file" accept=".json,application/json"></label><label>Importar pasta como grupo<input id="pasta-fichas" type="file" webkitdirectory multiple accept=".json,application/json"></label></div><p class="muted">O nome da pasta será o nome do grupo. Até 50 fichas JSON, incluindo subpastas.</p>'+(s.fase==='preparo'?'':'<p class="muted">Reforços rolam iniciativa ao entrar no combate.</p>')+'</div>';
  const recuperacao=(s.quarentenaFichas??[]).length?'<section class="fichas-recuperacao"><h3>Fichas em recuperação</h3><p>Estas fichas não passaram na validação. Seus originais foram preservados; exporte antes de corrigir e importar novamente.</p>'+s.quarentenaFichas.map(r=>'<article class="linha-vinculo"><div><strong>'+esc(r.nome)+'</strong><p>'+esc(r.erro)+'</p></div><button data-exportar-isolada="'+esc(r.id)+'">Baixar original</button><button class="perigo" data-excluir-isolada="'+esc(r.id)+'">Excluir ficha isolada</button></article>').join('')+'</section>':'';
  return '<section class="controle-fichas-mestre"><div class="titulo-controle"><div><small>PAINEL EXCLUSIVO DO MESTRE</small><h2>Controle de fichas</h2><p>Importe fichas e vincule cada uma a um token e, quando for PJ, a um jogador online.</p></div></div>'+recuperacao+importar+resumoToken+'<div class="lista-vinculos">'+(linhas||'<p class="estado-vazio">Nenhuma ficha carregada.</p>')+'</div></section>';
}
function renderFichaRecipiente(r){
 if(!r)return '';const gm=info.role==='GM',slots=r.itens?.length??r.ocupados??0;
 const abas='<nav class="paginas">'+btn('recipiente-pagina-ficha','Ficha',paginaRecipiente==='ficha'?'ativa':'')+btn('recipiente-pagina-inventario','Inventário',paginaRecipiente==='inventario'?'ativa':'')+'</nav>';
 if(paginaRecipiente==='inventario')return '<section class="ficha-recipiente"><h3>'+esc(r.nome)+'</h3>'+abas+'<p>'+slots+' / '+r.capacidadeSlots+' espaços</p>'+'<div class="grade-inventario grade-recipiente">'+Array.from({length:r.capacidadeSlots},(_,n)=>{const i=r.itens?.[n];return i?'<article class="entrada-recipiente">'+celulaInventario(i,{atributos:'data-item-recipiente="'+esc(i.id)+'"'})+'<button data-excluir-item-recipiente="'+esc(i.id)+'">Excluir</button></article>':celulaInventario(null);}).join('')+'</div>'+'<label>Item<select id="recipiente-item">'+itensCatalogo().filter(i=>i.definicao?.tipo!=='moeda').map(i=>opt(i.id,i.definicao.nome)).join('')+'</select></label><div class="campos"><label>Quantidade<input id="recipiente-quantidade" type="number" min="1" value="1"></label>'+btn('recipiente-adicionar-item','Adicionar item')+'</div><div class="campos"><label>PO<input id="recipiente-po" type="number" min="1" value="1"></label>'+btn('recipiente-adicionar-po','Adicionar PO')+'</div></section>';
 return '<section class="ficha-recipiente"><h3>'+esc(r.nome)+'</h3>'+abas+'<label>Nome<input id="recipiente-nome" value="'+esc(r.nome)+'" maxlength="80"></label><div class="campos"><label>Slots<input id="recipiente-slots" type="number" min="'+slots+'" max="200" value="'+r.capacidadeSlots+'"></label><label class="interruptor"><input id="recipiente-trancado" type="checkbox" '+(r.trancado?'checked':'')+'><span>Trancado</span></label></div><p>'+slots+' / '+r.capacidadeSlots+' ocupados</p>'+btn('recipiente-salvar','Salvar alterações','primario')+'</section>';
}
function renderControleLojas(){
  const lojas=lojasCatalogo();
  return '<section class="controle-lojas"><div class="titulo-controle"><div><small>PAINEL EXCLUSIVO DO MESTRE</small><h2>Lojas</h2><p>Ative lojas fora de combate e defina um desconto entre 1% e 30%.</p></div></div><div class="lista-lojas">'+lojas.map(loja=>{
    const estado=s.comercio?.lojas?.[loja.id]??{ativa:false,descontoPct:loja.descontoMinimoPct??1},fechada=s.fase!=='preparo';
    return '<article class="linha-loja '+(estado.ativa?'ativa':'')+'"><div><strong>'+esc(loja.nome)+'</strong><small>'+loja.itens.length+' itens · '+esc(loja.descricao??'')+'</small></div><label>Desconto<input type="number" min="'+(loja.descontoMinimoPct??1)+'" max="'+(loja.descontoMaximoPct??30)+'" value="'+estado.descontoPct+'" data-loja-desconto="'+esc(loja.id)+'" '+(fechada?'disabled':'')+'></label><label class="interruptor"><input type="checkbox" data-loja-ativa="'+esc(loja.id)+'" '+(estado.ativa?'checked':'')+' '+(fechada?'disabled':'')+'><span>'+(estado.ativa?'Ativa':'Fechada')+'</span></label><button type="button" class="primario" data-loja-salvar="'+esc(loja.id)+'" '+(fechada?'disabled':'')+'>Salvar</button></article>';
  }).join('')+'</div>'+(s.fase==='preparo'?'':'<p class="muted">As lojas ficam fechadas durante o combate.</p>')+'</section>';
}
function render(){
  if(!s)return;
  const gm=info.role==='GM'&&!testar,ativo=atual(s);
  const disponiveis=gm?s.atores.filter(x=>x.ficha.tipo==='pj').concat(s.atores.filter(x=>x.ficha.tipo==='npc')):s.atores.filter(x=>x.ficha.tipo==='pj');
  const a=disponiveis.find(x=>x.id===escolhido)??disponiveis[0];
  if(!gm&&secao==='gm')secao='ficha';else if(gm&&!a&&!s.recipientes?.length&&secao==='ficha')secao='gm';
  const mestre=gm&&secao==='gm';
  const catalogando=secao==='catalogo';
  escolhido=a?.id;
  const meu=a&&(gm||(a.ficha.tipo==='pj'&&a.dono===(testar?'teste':info.id)));
  $('modo').textContent=info.modo==='ensaio'?'Simulador local · '+(testar?'Jogador':'Mestre'):'Owlbear · '+(gm?'Mestre':'Jogador');
  let h='<nav class="paginas">'+btn('ficha','Controle de fichas',!mestre&&!catalogando?'ativa':'')+(gm?btn('gm','Controle do mestre',mestre?'ativa':''):'')+btn('catalogo','Conteúdo configurado',catalogando?'ativa':'')+'</nav>';
  if(info.modo==='ensaio') h+='<div class="linha">'+btn('teste',testar?'Voltar ao mestre':'Testar como jogador')+'</div>';
  if(catalogando){h+=renderCatalogo();$('app').innerHTML=h;return;}
  if(mestre){
    const emCombate=s.atores.filter(x=>x.emCombate!==false);
    h+='<section class="controle-mestre"><div class="titulo-controle"><div><small>PAINEL EXCLUSIVO DO MESTRE</small><h2>Controle do combate</h2><p>'+(s.fase==='preparo'?'Combate parado':s.fase==='iniciativa'?'Aguardando iniciativas':'Rodada '+s.rodada+' · turno de '+esc(ativo?.nome??'—'))+'</p></div><div>'+(s.fase==='preparo'?btn('iniciar','Iniciar combate','primario'):btn('encerrar','Parar combate','perigo'))+'</div></div>';
    if(s.fase!=='preparo'){
      h+='<div class="ordem">'+(s.ordem.length?s.ordem:emCombate.map(x=>x.id)).map((id,i)=>{const p=s.atores.find(x=>x.id===id);return '<span class="'+(id===ativo?.id?'vez':'')+'">'+(s.fase==='turnos'&&i>0?'<button type="button" data-subir="'+esc(id)+'" title="Subir na ordem (empate)">▲</button> ':'')+esc(p.nome)+' · '+(p.init??'…')+'</span>';}).join('')+'</div>';
      if(s.fase==='iniciativa'){
        const pendentes=emCombate.filter(x=>x.init===null);
        h+='<div class="iniciativas-mestre"><strong>Rolagem conjunta</strong><p>Marque jogadores e NPCs para lançar um d20 por ficha simultaneamente.</p><div>'+pendentes.map(p=>'<label><input type="checkbox" data-iniciativa-id="'+esc(p.id)+'" checked><span>'+esc(p.nome)+'</span><small>'+(p.ficha.tipo==='pj'?'Jogador':'NPC')+'</small></label>').join('')+'</div>'+btn('iniciativas','Rolar iniciativas selecionadas','primario')+'</div>';
      }
    }
    h+='<div class="lista-combate"><div class="linha-combate cabecalho-lista"><span>Participante</span><span>Tipo</span><span>Iniciativa</span><span>Estado</span><span>Controles</span></div>'+s.atores.map(p=>'<div class="linha-combate '+(p.emCombate===false?'fora-combate':'')+'"><strong>'+esc(p.nome)+'</strong><span class="etiqueta '+p.ficha.tipo+'">'+(p.ficha.tipo==='pj'?'Jogador':'NPC')+'</span><span>'+(p.init??'—')+'</span><span>'+(p.emCombate===false?'Fora do combate':p.pv<=0?'Inconsciente':'Em combate · '+p.pv+'/'+pvMaximosAtuais(p)+' PV')+'</span><span class="acoes-linha"><button data-configurar-vinculo="'+esc(p.id)+'">Configurar</button><button data-ver-ficha="'+esc(p.id)+'">Ver ficha</button><button data-combate="'+esc(p.id)+'">'+(p.emCombate===false?'Adicionar':'Retirar')+'</button></span></div>').join('')+'</div>';
    if(!s.atores.length)h+='<p class="estado-vazio">Nenhuma ficha carregada. Importe um JSON para preparar o encontro.</p>';
    h+='</section>'+renderControleFichasMestre()+renderControleLojas()+'<section class="atalhos-mestre"><h3>Caixas e loot</h3><p>Cria um baú de 12 espaços no centro da visão atual do mestre.</p>'+btn('criarRecipiente','Criar baú','primario')+'</section>'+(s.fase==='preparo'?'<section class="atalhos-mestre"><h3>Ferramentas da mesa</h3><div class="campos">'+avancosMesa.map(([id,nome])=>btn('tempo-'+id,nome)).join('')+btn('curto','Descanso curto')+btn('longo','Descanso longo')+btn('amanhecer','Registrar amanhecer')+'</div></section>':'')+'<section><h3>Histórico</h3><ol class="historico">'+s.historico.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>';
    $('app').innerHTML=h;return;
  }
  h+='<div class="colunas '+(mestre?'gestao':'folha')+'"><section><h2>'+(mestre?'Participantes':'Personagens')+'</h2>';
  if(!a)h+='<p class="muted">'+(gm?'Adicione fichas pelos grupos no Controle do mestre ou importe um JSON.':'Aguardando o mestre vincular uma ficha a você.')+'</p>';
  const jogadores=disponiveis.filter(p=>p.ficha.tipo==='pj'),npcs=disponiveis.filter(p=>p.ficha.tipo==='npc');
  const pessoa=p=>'<button class="pessoa" data-ator="'+esc(p.id)+'" aria-pressed="'+(p===a)+'">'+(p.ficha.id==='soldado'?'<img src="fichas/soldado.png" alt="">':'<span class="avatar">'+esc(p.nome[0])+'</span>')+'<span>'+esc(p.nome)+'<br><small>'+(p.ficha.tipo==='pj'?'JOGADOR':'NPC')+' · '+(p.token?'token vinculado':'sem token')+'</small></span></button>';
  h+=jogadores.map(pessoa).join('');
  if(gm&&npcs.length)h+='<div class="grupo-npcs"><button class="titulo-grupo" data-do="npcs-toggle" aria-expanded="'+npcsAbertos+'"><span>NPCs carregados</span><b>'+(npcsAbertos?'−':'+')+'</b></button>'+(npcsAbertos?'<div>'+npcs.map(pessoa).join('')+'</div>':'')+'</div>';
  if(gm)h+='<div class="grupo-npcs"><button class="titulo-grupo" data-do="baus-toggle" aria-expanded="'+bausAbertos+'"><span>Baús e recipientes ('+(s.recipientes??[]).filter(r=>r.tipo==='caixa').length+')</span><b>'+(bausAbertos?'−':'+')+'</b></button>'+(bausAbertos?'<div>'+((s.recipientes??[]).filter(r=>r.tipo==='caixa').map(r=>'<button class="pessoa" data-recipiente="'+esc(r.id)+'" aria-pressed="'+(r.id===recipienteSelecionadoId)+'"><span class="avatar">▦</span><span>'+esc(r.nome)+'<br><small>'+(r.itens?.length??r.ocupados??0)+' / '+r.capacidadeSlots+' espaços · '+(r.trancado?'trancado':'destrancado')+'</small></span></button>').join('')||'<p class="muted">Nenhum baú na cena.</p>')+'</div>':'')+'</div>';
  h+='</section><section>';
  const caixaSelecionada=gm&&s.recipientes?.find(r=>r.id===recipienteSelecionadoId);
  if(caixaSelecionada)h+=renderFichaRecipiente(caixaSelecionada);
  else if(a){
    const f=a.ficha;
    h+=painelEscolhasDescanso(a,gm);
    h+=fichaEditavel(a,meu,paginaFicha,paginaLivro,s.fase==='preparo'?lojasAtivas(s):[],gm,s.fase==='preparo',Boolean(trocaDoAtor(s,a.id)));
    if(!mestre){
    if(f.pvMaximos)h+='<div class="numeros">'+[['PV',a.pv+' / '+pvMaximosAtuais(a)],['CA',caAtual(a)],['Movimento',Number(a.metros.toFixed(2))+' m'],['Ação',a.acao],['Bônus',a.bonus],['Reação',a.reacao]].map(([k,v])=>'<span><small>'+k+'</small><b>'+esc(v)+'</b></span>').join('')+'</div><div class="barra"><i style="width:'+100*a.pv/pvMaximosAtuais(a)+'%"></i></div>';
    if(f.recursos?.length)h+='<div class="recursos-ficha">'+f.recursos.map(r=>'<div title="'+esc((r.recuperacao??[]).map(x=>x.evento.replaceAll('_',' ')).join(', '))+'"><small>'+esc(r.nome)+'</small><b>'+esc(a.rec[r.id])+' / '+r.maximo+'</b></div>').join('')+'</div>';
    if(s.fase==='iniciativa'&&meu&&a.init===null)h+=btn('iniciativa','Rolar iniciativa','primario');
    if(s.fase==='turnos'&&ativo===a&&meu){
      const ops=opcoesDisponiveis(a).filter(x=>!x.ocultarListas&&(x.automacao || (gm && !(x.custo??[]).some(y=>y.tipo==='reacao'))));
      const o=ops.find(x=>x.id===acao)??ops[0];acao=o?.id;
      h+='<div class="painel"><h3>Turno de '+esc(a.nome)+'</h3><label>Ação ou magia<select id="acao">'+ops.map(x=>opt(x.id,x.nome+(x.automacao?'':' · assistida'),x===o)).join('')+'</select></label>';
      const targets=s.atores.filter(x=>x!==a).concat(a);const target=targets.find(x=>x.id===alvo)??targets[0];alvo=target.id;
      if(multi(o)){
        h+='<div class="campos"><label>Alvo<select id="alvo">'+targets.map(x=>opt(x.id,x.nome,x===target)).join('')+'</select></label>'+btn('marcar','Adicionar alvo')+btn('desfazer','Desfazer')+'</div><p>'+alvos.length+'/'+o.selecao.max+' · '+alvos.map(id=>esc(s.atores.find(x=>x.id===id)?.nome)).join(', ')+'</p>';
      }else if(o?.automacao?.raioM)h+='<div class="campos">'+coord('cx','Centro X',target.x)+coord('cy','Centro Y',target.y)+'</div>';
      else if(['salva','ataque','efeito'].includes(o?.automacao?.tipo))h+='<div class="campos"><label>Alvo<select id="alvo">'+targets.map(x=>opt(x.id,x.nome,x===target)).join('')+'</select></label></div>';
      h+='<details><summary>Mapa tático · 1,5 m por célula</summary><div class="campos"><label>Clique no mapa para<select id="mapModo">'+(o?.automacao?.raioM?opt('centro','Marcar centro da área'):opt('alvo','Escolher alvo'))+opt('mover','Marcar destino de movimento')+'</select></label><small id="medida"></small></div><div class="tabuleiro" id="tabuleiro"></div></details><details><summary>Opções da rolagem</summary><div class="campos"><select id="rolagem"><option>normal</option><option>vantagem</option><option>desvantagem</option></select>'+coord('ajuste','Ajuste ao d20',0)+'</div></details>';
      if(o)h+=btn('usar','Executar','primario');h+='</div><details><summary>Deslocar em metros</summary><div class="campos">'+coord('x','Destino X',a.x)+coord('y','Destino Y',a.y)+btn('mover','Conferir trajeto')+'</div></details>'+btn('passar','Finalizar turno');
    }
    if(meu){
      const saves=Object.keys(f.atributos).map(k=>[k,f.salvaguardas?.[k]??mod(f.atributos[k])]);
      h+='<section class="testes-ficha"><h3>Perícias</h3><div class="grade-testes">'+Object.keys(periciasPadrao).map(k=>{const v=bonusPericia(a,k);return '<button type="button" data-teste="pericias" data-chave="'+esc(k)+'"><span>'+esc(k)+'</span><b>'+(v>=0?'+':'')+v+'</b></button>';}).join('')+'</div><h3>Salvaguardas</h3><p class="muted">Clique aqui ou use o botão direito sobre um atributo.</p><div class="grade-testes salva">'+saves.map(([k,v])=>'<button type="button" data-teste="salvaguardas" data-chave="'+esc(k)+'"><span>'+esc(k.toUpperCase())+'</span><b>'+(v>=0?'+':'')+v+'</b></button>').join('')+'</div></section>';
    }
    h+=biblioteca(a);
    }
    if(gm){
      h+='<details><summary>Ajustar PV ou recurso</summary><div class="campos"><select id="campo">'+opt('pv','Pontos de vida')+(f.recursos??[]).map(r=>opt(r.id,r.nome)).join('')+'</select>'+coord('delta','Somar ou subtrair',0)+btn('ajustar','Aplicar ajuste')+'</div></details>';
      h+='<details class="panel" '+(s.fase==='preparo'?'open':'')+'><summary>Vínculo e controle</summary><div class="campos">';
      if(info.modo==='ensaio')h+='<small>Token simulado · uma peça por instância</small>';
      else h+='<label>Token de personagem<select id="token">'+opt('','Sem token',!a.token)+info.tokens.map(t=>opt(t.id,t.name||t.id,t.id===a.token)).join('')+'</select></label>'+btn('selecao','Usar seleção do mapa');
      if(f.tipo==='pj')h+='<label>Quem controla<select id="dono">'+opt('','Mestre',!a.dono)+(a.dono&&!info.players.some(p=>p.id===a.dono)?opt(a.dono,'Jogador desconectado',true):'')+info.players.filter(p=>p.role!=='GM').map(p=>opt(p.id,p.name,p.id===a.dono)).join('')+'</select></label>';
      h+=btn('vincular','Salvar vínculo')+(!a.token&&info.modo==='sala'&&s.fase==='preparo'?btn('criarPeca','Criar token desta ficha'):'')+'</div>'+(s.fase==='preparo'?btn('remover','Retirar do encontro'):'')+'</details>';
    }

  }
  h+='</section></div>'+(lojaLocalAtor&&info.modo==='ensaio'?'<aside class="loja-local"><iframe title="Lojas ativas" src="loja.html?local=1&ator='+encodeURIComponent(lojaLocalAtor)+'"></iframe><button type="button" data-fechar-loja-local>Fechar loja</button></aside>':'')+(trocaLocalId&&info.modo==='ensaio'?'<aside class="troca-local"><iframe title="Troca entre personagens" src="troca.html?local=1&troca='+encodeURIComponent(trocaLocalId)+'&ator='+encodeURIComponent(trocaLocalAtor??'')+'"></iframe></aside>':'');if(mestre)h+='<section><h2>Histórico</h2><ol class="historico">'+s.historico.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>';
  $('app').innerHTML=h;
  if($('tabuleiro')){
    const rule=opcaoPorId(a,acao)?.automacao;
    const board=$('tabuleiro');
    for(let j=-4;j<=4;j++)for(let i=-6;i<=6;i++){
      const x=(Math.round(a.x/METROS_POR_CELULA)+i)*METROS_POR_CELULA,y=(Math.round(a.y/METROS_POR_CELULA)+j)*METROS_POR_CELULA;
      const tile=document.createElement('button');
      const occupants=s.atores.filter(p=>Math.round(p.x/METROS_POR_CELULA)===x/METROS_POR_CELULA&&Math.round(p.y/METROS_POR_CELULA)===y/METROS_POR_CELULA);
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
        else if(who&&multi(opcaoPorId(a,acao))){alvo=who.id;tarefa(()=>executar('marcar'));return;}
        else if(who&&$('alvo')){alvo=who.id;$('alvo').value=alvo;}
        for(const t of board.children)t.classList.remove('marcada');
        tile.classList.add('marcada');
        $('medida').textContent=(who?who.nome+' · ':'')+Math.hypot(x-a.x,y-a.y).toFixed(2)+' m';
      };
      board.append(tile);
    }
  }
}
function renderCatalogo(){
  if(!catalogo)return '<section><h2>Conteúdo configurado</h2><p class="muted">Carregando catálogo…</p></section>';
  const lista=xs=>'<div class="lista-catalogo">'+xs.map(x=>'<div><span>'+esc(x.nome)+'</span><small>'+esc(x.status)+'</small></div>').join('')+'</div>';
  const grupos=(titulo,xs,rotulo='habilidades')=>'<section class="grupo-catalogo"><h2>'+esc(titulo)+'</h2>'+xs.map(x=>'<details><summary><span>'+esc(x.nome)+(x.nivelMax?' · até o nível '+x.nivelMax:'')+'</span><b>'+x[rotulo].length+'</b></summary>'+lista(x[rotulo])+'</details>').join('')+'</section>';
  const eq=catalogo.sistemaEquipamentos,linhasEq=eq?[{nome:'Alcance máximo',status:eq.alcanceMaximoM+' m'},{nome:'Ataques visíveis',status:eq.ataquesVisiveis},{nome:'Cálculo de armas',status:eq.calculoArmas},{nome:'Dano de armas',status:eq.danoArmas},{nome:'Portabilidade',status:eq.portabilidade},{nome:'Armaduras',status:eq.classesArmadura.join(', ')},{nome:'Propriedades',status:eq.propriedadesArmas.join(', ')}]:[];
  return '<section class="cabecalho-catalogo"><small>VISÃO DO SISTEMA</small><h2>Conteúdo configurado</h2><p>Esta página é gerada do catálogo central e das concessões das fichas. As seções começam retraídas e distinguem automações de resoluções assistidas pelo mestre.</p></section>'+
    grupos('Classes',catalogo.classes)+grupos('Raças',catalogo.racas)+
    '<section class="grupo-catalogo"><h2>Bibliotecas</h2>'+(eq?'<details><summary><span>Sistema de equipamentos</span><b>'+linhasEq.length+'</b></summary>'+lista(linhasEq)+'</details>':'')+'<details><summary><span>Ações e habilidades comuns</span><b>'+catalogo.comuns.length+'</b></summary>'+lista(catalogo.comuns)+'</details><details><summary><span>Itens registrados</span><b>'+catalogo.itens.length+'</b></summary>'+lista(catalogo.itens)+'</details><details><summary><span>Módulos do motor</span><b>'+catalogo.modulos.length+'</b></summary>'+lista(catalogo.modulos)+'</details></section>';
}
function coord(id,label,value){return '<label>'+label+'<input type="number" step="any" class="curto" id="'+id+'" value="'+Number(value)+'"></label>';}
const num=id=>Number($(id)?.value??0);
const dadosExtras=valor=>String(valor??'').split(/[+,\s]+/).map(x=>x.trim()).filter(Boolean);
// #56 #62 M03: escolha pós-descanso. O dono confirma; o mestre confirma por fichas sem dono ou com dono desconectado.
function painelEscolhasDescanso(a,gm){
  const pend=a?.escolhasDescanso??[];if(!pend.length)return '';
  const online=new Set((info.players??[]).map(p=>p.id)),dono=testar?'teste':info.id,podeEscolher=a.dono===dono||(gm&&!testar&&(!a.dono||!online.has(a.dono)));
  return '<section class="escolhas-descanso"><strong>Escolha após o descanso</strong>'+pend.map(e=>'<div><span>'+esc(e.nome)+' · descanso '+esc(e.periodo)+'</span><div>'+e.opcoes.map(o=>'<button data-escolha-descanso="'+esc(e.id)+'" data-opcao-descanso="'+esc(o.id)+'" aria-pressed="'+(e.atualId===o.id)+'" '+(podeEscolher?'':'disabled')+'>'+esc(o.nome)+(e.atualId===o.id?' (atual)':'')+'</button>').join('')+'</div>'+(podeEscolher?'':'<small>'+(gm?'Aguardando o jogador dono da ficha.':'O mestre confirma por fichas sem jogador online.')+'</small>')+'</div>').join('')+'</section>';
}
async function enviar(tipo,extra={}){await api.enviar({tipo,rev:s.rev,ator:escolhido,comoJogador:testar,...extra});}
async function usarSelecaoNoVinculo(atorId){
  const id=await api.selecionado();
  if(!info.tokens.some(t=>t.id===id))throw Error('Selecione um token da camada Personagem.');
  const ocupadoPor=s.atores.find(a=>a.id!==atorId&&a.token===id);if(ocupadoPor)throw Error('Este token já está vinculado a '+ocupadoPor.nome+'.');
  tokenSelecionado=id;const campo=$('token-vinculo-'+atorId);if(campo)campo.value=id;
}
async function salvarVinculoAtor(atorId,{token,dono}={}){
  const a=s.atores.find(x=>x.id===atorId);if(!a)throw Error('Ficha não encontrada.');
  const tokenFinal=token??$('token-vinculo-'+atorId)?.value??a.token??'';
  const donoFinal=a.ficha.tipo==='pj'?(dono??$('dono-vinculo-'+atorId)?.value??a.dono??''):'';
  await api.enviar({tipo:'vincular',rev:s.rev,ator:a.id,token:tokenFinal,dono:donoFinal,comoJogador:false});
  escolhido=a.id;tokenSelecionado=tokenFinal||tokenSelecionado;aviso('Vínculo de '+a.nome+' atualizado.');
}
function lerFicha(a){
  const form=$('formFicha'),valor=n=>form.elements.namedItem(n)?.value??'',numero=n=>Number(valor(n));
  let f;
  try{f=JSON.parse($('fichaJson').value);}catch{throw Error('O JSON do editor avançado não é válido.');}
  f.nome=valor('nome').trim();f.especie=valor('especie').trim();f.proficiencia=numero('proficiencia');
  f.classes=(f.classes??[]).map((c,i)=>{
    const controle=form.elements.namedItem('classe-id-'+i);if(!controle)return c;
    const nome=controle.value.trim(),id=nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||c.id;
    return {...c,id,nome,nivel:numero('classe-nivel-'+i)};
  });
  f.atributos=Object.fromEntries(['for','des','con','int','sab','car'].map(k=>[k,numero('atributo-'+k)]));
  f.salvaguardas=Object.fromEntries(['for','des','con','int','sab','car'].map(k=>[k,numero('salva-'+k)]));
  f.pericias=Object.fromEntries(Object.keys(periciasPadrao).map(k=>[k,numero('pericia-'+k)]));
  f.pvMaximos=numero('pv-max');f.caBase=numero('ca');f.deslocamentosM={...(f.deslocamentosM??{}),andar:numero('deslocamento')};
  f.sentidos=valor('sentidos').trim();f.idiomas=valor('idiomas').trim();f.anotacoes=valor('anotacoes').trim();
  const rec={};
  for(const linha of form.querySelectorAll('[data-recurso]')){
    const id=linha.dataset.recurso,r=f.recursos.find(x=>x.id===id);if(!r)continue;
    r.nome=linha.querySelector('[name="recurso-nome"]').value.trim();r.maximo=Number(linha.querySelector('[name="recurso-max"]').value);r.saldoInicial=Math.min(r.saldoInicial,r.maximo);
    rec[id]=Number(linha.querySelector('[name="recurso-atual"]').value);
  }
  return {ficha:validar(f),pv:numero('pv-atual'),rec};
}
async function salvarFicha(){
  const a=s.atores.find(x=>x.id===escolhido);if(!a)return;
  const gm=info.role==='GM'&&!testar,pode=gm||(a.ficha.tipo==='pj'&&a.dono===(testar?'teste':info.id));
  if(!pode)throw Error('Somente o mestre ou o dono da ficha pode alterá-la.');
  const dados=lerFicha(a);await enviar('atualizarFicha',{...dados,confirmado:gm&&a.ficha.tipo==='pj'});aviso('Alterações salvas.');
}
async function abrirAdicionarItemMestre(){
  if(info.role!=='GM'||testar)throw Error('Somente o mestre pode adicionar itens.');
  const itens=itensCatalogo().filter(x=>x.definicao?.tipo!=='moeda').sort((a,b)=>a.definicao.nome.localeCompare(b.definicao.nome,'pt-BR'));
  $('gmItemRef').innerHTML=itens.map(x=>opt(x.id,x.definicao.nome)).join('');$('gmItemQuantidade').value=1;
  const dlg=$('gmAdicionarItem');dlg.returnValue='nao';
  const aceitou=await new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});
  if(!aceitou)return;
  const itemRef=$('gmItemRef').value,quantidade=Number($('gmItemQuantidade').value);
  await enviar('gmAdicionarItem',{itemRef,quantidade});aviso('Item adicionado ao inventário.');
}
async function abrirAdicionarPoMestre(){
  if(info.role!=='GM'||testar)throw Error('Somente o mestre pode adicionar PO.');
  $('gmPoQuantidade').value=1;const dlg=$('gmAdicionarPo');dlg.returnValue='nao';
  const aceitou=await new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});
  if(!aceitou)return;
  await enviar('gmAdicionarPo',{quantidade:Number($('gmPoQuantidade').value)});aviso('PO adicionadas ao inventário.');
}
async function alterarItem(operacao,slot){
  const a=s.atores.find(x=>x.id===escolhido);if(!a||!itemContexto)return;
  const item=a.ficha.inventario?.itens.find(x=>x.id===itemContexto);if(!item)return;
  const gm=info.role==='GM'&&!testar,confirmado=gm&&a.ficha.tipo==='pj';
  if(operacao==='excluir')return excluirItemMestre(a,item);
  if(operacao==='soltar'){
    await enviar('soltarItem',{itemId:item.id,quantidade:Number(slot)||1,confirmado});
    itemContexto=null;itemContextoSlot=null;$('itemMenu').close();aviso(item.nome+' largado no chão.');return;
  }
  if(operacao==='oferecer-troca')return oferecerItemNaTroca(item,false);
  if(operacao==='oferecer-po-troca')return oferecerItemNaTroca(item,true);
  if(operacao==='vender'){
    const loja=lojaSelecionada(a.id);
    if(!loja||loja.id!==lojaDaVenda)throw Error('Abra o catálogo da loja e selecione novamente o item para vender.');
    await enviar('vender',{lojaId:loja.id,itemId:itemContexto,quantidade:Number(slot)||1,confirmado});
  }else await enviar('inventario',{operacao,itemId:itemContexto,slot,confirmado});
  itemContexto=null;itemContextoSlot=null;$('itemMenu').close();aviso(operacao==='usar'?'Consumível usado.':'Equipamento atualizado.');
}
async function excluirItemMestre(ator,item){
  if(info.role!=='GM'||testar)throw Error('Somente o mestre pode excluir itens.');
  const rev=s.rev,quantidade=Number(item.quantidade).toLocaleString('pt-BR',{maximumFractionDigits:2});
  itemContexto=null;itemContextoSlot=null;$('itemMenu').close();
  const descricao=quantidade+'× '+item.nome+' do inventário de '+ator.nome+'. A pilha inteira será removida.';
  if(!await confirma('Excluir '+item.nome+'?',descricao))return;
  if(!await confirma('Confirmar exclusão definitiva?',descricao))return;
  await enviar('gmExcluirItem',{ator:ator.id,itemId:item.id,rev,confirmado:true,confirmacaoFinal:true});
  aviso(item.nome+' excluído do inventário de '+ator.nome+'.');
}
async function abrirLojas(atorId){
  if(s.fase!=='preparo'||!lojasAtivas(s).length)throw Error('Nenhuma loja está aberta.');
  limparCatalogo();
  if(info.modo==='ensaio'){lojaLocalAtor=atorId;return render();}
  localStorage.setItem(ns+'/loja-ator/'+OBR.room.id,atorId);
  const [largura,altura]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]),w=Math.min(640,Math.max(440,largura*.42)),h=Math.min(760,Math.max(520,altura-32)),id=ns+'/loja';
  await OBR.popover.close(id).catch(()=>{});
  await OBR.popover.open({id,url:new URL('./loja.html?v=0.8.45',location.href).href,width:w,height:h,hidePaper:true,disableClickAway:true,marginThreshold:0,anchorReference:'POSITION',anchorPosition:{left:Math.max(8,largura-w-16),top:16},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});
}
function controlaTroca(a){const role=testar?'PLAYER':info.role,id=testar?'teste':info.id;return role==='GM'||a?.ficha.tipo==='pj'&&a.dono===id;}
async function abrirTroca(trocaId,atorId){
  if(!trocaId||!atorId||s.fase!=='preparo')return;
  trocaLocalId=trocaId;trocaLocalAtor=atorId;
  if(info.modo==='ensaio'){render();return;}
  if(abrindoTroca)return;abrindoTroca=true;
  try{
    const [largura,altura]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]),w=Math.min(680,Math.max(460,largura*.44)),h=Math.min(820,Math.max(560,altura-32)),id=ns+'/troca';
    await OBR.popover.close(id).catch(()=>{});
    const url=new URL('./troca.html?v=0.8.45',location.href);url.searchParams.set('troca',trocaId);url.searchParams.set('ator',atorId);
    await OBR.popover.open({id,url:url.href,width:w,height:h,hidePaper:true,disableClickAway:true,marginThreshold:0,anchorReference:'POSITION',anchorPosition:{left:Math.max(8,largura-w-16),top:16},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});
  }finally{abrindoTroca=false;}
}
async function sincronizarTrocaVisual(){
  if(!s||s.fase!=='preparo')return;
  let t=s.comercio?.trocas?.find(x=>x.id===trocaLocalId),atorId=trocaLocalAtor;
  if(t&&!t.solicitante&&!t.destinatario)t=null;
  if(!t){
    const role=testar?'PLAYER':info.role,id=testar?'teste':info.id,online=new Set((info.players??[]).map(p=>p.id));
    for(const candidata of s.comercio?.trocas??[]){
      const participantes=[candidata.solicitante,candidata.destinatario].map(x=>s.atores.find(a=>a.id===x)).filter(Boolean);
      let controlado=role==='PLAYER'?participantes.find(a=>a.dono===id):participantes.find(a=>a.id===trocaSolicitadaPor)??(candidata.status==='solicitada'?participantes.find(a=>a.id===candidata.destinatario&&(!a.dono||!online.has(a.dono))):null);
      if(controlado){t=candidata;atorId=controlado.id;break;}
    }
  }
  if(!t){
    if(trocaLocalId&&emSala)await OBR.popover.close(ns+'/troca').catch(()=>{});
    trocaLocalId=null;trocaLocalAtor=null;trocaSolicitadaPor=null;return;
  }
  if(t.id!==trocaLocalId||atorId!==trocaLocalAtor)await abrirTroca(t.id,atorId);
}
async function iniciarOuAbrirTroca(){
  const a=s.atores.find(x=>x.id===escolhido);if(!a||!controlaTroca(a))throw Error('Você não controla esta ficha.');
  if(s.fase!=='preparo')throw Error('Trocas ficam bloqueadas durante o combate.');
  const ativa=trocaDoAtor(s,a.id);if(ativa)return abrirTroca(ativa.id,a.id);
  const alvos=s.atores.filter(x=>x!==a&&x.ficha.tipo==='pj'&&!trocaDoAtor(s,x.id));if(!alvos.length)throw Error('Não há outro personagem disponível para trocar.');
  $('trocaDestino').innerHTML=alvos.map(x=>opt(x.id,x.nome)).join('');const dlg=$('solicitarTroca');dlg.returnValue='nao';
  const aceitou=await new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});if(!aceitou)return;
  trocaSolicitadaPor=a.id;await enviar('solicitarTroca',{destino:$('trocaDestino').value,confirmado:info.role==='GM'&&!testar&&a.ficha.tipo==='pj'});
  const criada=trocaDoAtor(s,a.id);if(criada)await abrirTroca(criada.id,a.id);
}
async function oferecerItemNaTroca(item,moeda=false){
  const a=s.atores.find(x=>x.id===escolhido),t=trocaDoAtor(s,a?.id);if(!a||!t||t.status!=='ofertas')throw Error('Aceite a solicitação antes de montar a oferta.');
  if(item.equipado)throw Error('Desequipe o item antes de oferecê-lo.');
  const maximo=moeda?saldoMoedasPo(a):Math.floor(item.quantidade??1),dlg=$('quantidadeTroca');$('quantidadeTrocaTitulo').textContent=moeda?'Oferecer PO':'Oferecer '+item.nome;$('quantidadeTrocaDetalhe').textContent='Disponível: '+maximo+(moeda?' PO':' unidade(s)')+'. Alterar a oferta reinicia as confirmações.';$('trocaQuantidade').min=moeda?'0':'1';$('trocaQuantidade').max=String(maximo);$('trocaQuantidade').step=moeda?'0.01':'1';$('trocaQuantidade').value=moeda?'0':String(Math.min(1,maximo));dlg.returnValue='nao';
  const aceitou=await new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});if(!aceitou)return;
  const quantidade=Number($('trocaQuantidade').value),confirmado=info.role==='GM'&&!testar&&a.ficha.tipo==='pj';
  if(moeda)await enviar('definirPoTroca',{trocaId:t.id,quantidadePc:Math.round(quantidade*100),confirmado});else await enviar('oferecerTroca',{trocaId:t.id,itemId:item.id,quantidade,confirmado});
  itemContexto=null;itemContextoSlot=null;$('itemMenu').close();aviso('Oferta de troca atualizada.');
}
async function alterarHabilidade(operacao){
  const a=s.atores.find(x=>x.id===escolhido);if(!a||!habilidadeContexto)return;
  const gm=info.role==='GM'&&!testar,confirmado=gm&&a.ficha.tipo==='pj';
  await enviar('livro',{operacao,habilidadeId:habilidadeContexto,confirmado});
  habilidadeContexto=null;$('habilidadeMenu').close();aviso('Livro de Habilidades atualizado.');
}
async function rolarTeste(grupo,chave){
  const a=s.atores.find(x=>x.id===escolhido);if(!a)return;
  const bonus=grupo==='pericias'?bonusPericia(a,chave):(a.ficha.salvaguardas?.[chave]??mod(a.ficha.atributos[chave]));
  const dlg=$('rolarTeste');$('tituloTeste').textContent=(grupo==='pericias'?'Perícia · ':'Salvaguarda · ')+chave;
  $('bonusTeste').textContent='Bônus da ficha: '+(bonus>=0?'+':'')+bonus;$('modoTeste').value='normal';$('dadosTeste').value='';$('ajusteTeste').value=0;dlg.returnValue='nao';
  const rev=s.rev;const aceitou=await new Promise(resolve=>{dlg.addEventListener('close',()=>resolve(dlg.returnValue==='sim'),{once:true});dlg.showModal();});
  if(!aceitou)return;if(s.rev!==rev)throw Error('O encontro mudou antes da rolagem.');
  await enviar('teste',{grupo,chave,modo:$('modoTeste').value,ajuste:num('ajusteTeste'),dadosAjuste:dadosExtras($('dadosTeste').value),confirmado:info.role==='GM'&&!testar&&a.ficha.tipo==='pj'});
}
async function executar(k){
  const a=s.atores.find(x=>x.id===escolhido);
  if(k==='gm'||k==='ficha'||k==='catalogo'){secao=k;return render();}
  if(k==='npcs-toggle'){npcsAbertos=!npcsAbertos;return render();}
  if(k==='baus-toggle'){bausAbertos=!bausAbertos;return render();}
  if(k==='recipiente-pagina-ficha'||k==='recipiente-pagina-inventario'){paginaRecipiente=k.endsWith('inventario')?'inventario':'ficha';return render();}
  if(k==='recipiente-salvar'){const r=s.recipientes.find(x=>x.id===recipienteSelecionadoId);if(!r)return;return enviar('configurarRecipiente',{recipienteId:r.id,nome:$('recipiente-nome').value,capacidadeSlots:Number($('recipiente-slots').value),trancado:$('recipiente-trancado').checked});}
  if(k==='recipiente-adicionar-item')return enviar('recipienteAdicionarItem',{recipienteId:recipienteSelecionadoId,itemRef:$('recipiente-item').value,quantidade:Number($('recipiente-quantidade').value)});
  if(k==='recipiente-adicionar-po')return enviar('recipienteAdicionarPo',{recipienteId:recipienteSelecionadoId,quantidade:Number($('recipiente-po').value)});
  if(k==='marcar'||k==='desfazer'){
    if(k==='desfazer')alvos.pop();else alvos=incluirAlvo(alvos,alvo,multi(opcaoPorId(a,acao)));
    return render();
  }
  if(k==='teste'){testar=!testar;return view(recebido,info);}
  if(k==='selecao'){const id=await api.selecionado();if(!info.tokens.some(t=>t.id===id))throw Error('Selecione um token da camada Personagem.');$('token').value=id;return;}
  if(k==='vincular')return enviar(k,{token:$('token')?.value??('sim-'+a.id),dono:$('dono')?.value});
  if(k==='iniciativas'||k==='npcs'){
    const atores=k==='npcs'?s.atores.filter(x=>x.emCombate!==false&&x.ficha.tipo==='npc'&&x.init===null).map(x=>x.id):[...document.querySelectorAll('[data-iniciativa-id]:checked')].map(x=>x.dataset.iniciativaId);
    if(!atores.length)throw Error('Selecione ao menos uma ficha.');
    await enviar('iniciativas',{atores});return;
  }
  if(['curto','longo'].includes(k)){const atores=s.atores.filter(x=>x.ficha.tipo==='pj'&&x.emCombate!==false).map(x=>x.id);if(await confirma('Executar descanso '+k+'?','Aplica a recuperação só aos jogadores marcados como no encontro ('+atores.length+').'))await enviar('descanso',{periodo:k,atores});return;}
  if(k==='amanhecer'){if(await confirma('Registrar o amanhecer?','Recupera os usos dos itens cuja recarga acontece ao amanhecer, inclusive itens guardados e vendidos.'))await enviar('amanhecer');return;}
  if(k.startsWith('tempo-'))return enviar('avancarTempo',{passo:k.slice(6)});
  if(k==='encerrar'){
    const rev=s.rev;
    if(await confirma('Parar combate?','Os turnos serão encerrados.')&&await confirma('Confirmar encerramento?','A mesa voltará à preparação.'))await enviar(k,{rev});
    return;
  }
  if(k==='remover'){if(await confirma('Retirar participante?',a?.nome??''))await enviar(k);return;}
  if(k==='iniciar'){
    const rev=s.rev;
    if(await confirma('Iniciar combate?','Os participantes vão rolar iniciativa.',true))await enviar(k,{rev,pvp:$('pvp-inicio').checked});
    return;
  }
  if(k==='criarPeca')return enviar(k);
  if(k==='criarRecipiente')return enviar(k,{tipoRecipiente:'caixa',nome:'Baú',capacidadeSlots:12});
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
  const o=opcaoPorId(a,acao);
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
$('app').onclick=e=>{const b=e.target.closest('button');if(!b||ocupado)return;
 if(b.dataset.adicionarGrupo)return tarefa(()=>adicionarDoGrupo(b.dataset.adicionarGrupo));
 if(b.hasAttribute('data-adicionar-unidade'))return tarefa(()=>adicionarDoGrupo(b.dataset.grupoOrigem,Number(b.dataset.adicionarUnidade)));
 if(b.dataset.escolhaDescanso)return tarefa(()=>enviar('escolherAposDescanso',{escolhaId:b.dataset.escolhaDescanso,opcaoId:b.dataset.opcaoDescanso,confirmado:info.role==='GM'&&!testar}));
 if(b.dataset.fichaAba){paginaFicha=b.dataset.fichaAba;return render();}
 if(b.dataset.livroAba){paginaLivro=b.dataset.livroAba;return render();}
 if(b.hasAttribute('data-abrir-lojas'))return tarefa(()=>abrirLojas(escolhido));
 if(b.hasAttribute('data-iniciar-troca'))return tarefa(iniciarOuAbrirTroca);
 if(b.hasAttribute('data-gm-adicionar-item'))return tarefa(abrirAdicionarItemMestre);
 if(b.hasAttribute('data-gm-adicionar-po'))return tarefa(abrirAdicionarPoMestre);
 if(b.hasAttribute('data-fechar-loja-local')){limparCatalogo();lojaLocalAtor=null;return render();}
 if(b.dataset.lojaSalvar)return tarefa(()=>enviar('configurarLoja',{lojaId:b.dataset.lojaSalvar,ativa:document.querySelector('[data-loja-ativa="'+CSS.escape(b.dataset.lojaSalvar)+'"]')?.checked??false,descontoPct:Number(document.querySelector('[data-loja-desconto="'+CSS.escape(b.dataset.lojaSalvar)+'"]')?.value)}));
 if(b.dataset.configurarVinculo){escolhido=b.dataset.configurarVinculo;const p=s.atores.find(x=>x.id===escolhido);if(p?.token)tokenSelecionado=p.token;render();return document.querySelector('.controle-fichas-mestre')?.scrollIntoView({behavior:'smooth'});}
 if(b.dataset.usarSelecaoVinculo)return tarefa(()=>usarSelecaoNoVinculo(b.dataset.usarSelecaoVinculo));
 if(b.dataset.salvarVinculo)return tarefa(()=>salvarVinculoAtor(b.dataset.salvarVinculo));
 if(b.dataset.excluirFicha)return tarefa(async()=>{const id=b.dataset.excluirFicha,p=s.atores.find(x=>x.id===id);if(!p)return;if(!await confirma('Excluir '+p.nome+' do encontro?','A ficha será retirada do encontro, mas o arquivo JSON original continuará disponível.'))return;escolhido=id;await enviar('remover');if(escolhido===id)escolhido=null;aviso(p.nome+' foi excluído do encontro.');});
 if(b.dataset.exportarIsolada){const r=s.quarentenaFichas?.find(x=>x.id===b.dataset.exportarIsolada);if(!r||info.role!=='GM')return;const url=URL.createObjectURL(new Blob([JSON.stringify(r.original,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='ficha-em-recuperacao-'+r.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
 if(b.dataset.excluirIsolada)return tarefa(async()=>{if(info.role!=='GM')throw Error('Somente o mestre.');const r=s.quarentenaFichas?.find(x=>x.id===b.dataset.excluirIsolada);if(!r)return;if(!await confirma('Excluir '+r.nome+' da recuperação?','O registro isolado será removido. O backup automático da mesa será preservado.'))return;if(!await confirma('Confirmar exclusão da ficha isolada?','Esta ação não apaga o token manual do mapa.'))return;await enviar('excluirFichaIsolada',{registroId:r.id,confirmado:true,confirmacaoFinal:true});});
 if(b.hasAttribute('data-vincular-selecionado'))return tarefa(async()=>{const id=$('ficha-token-selecionado')?.value,token=info.tokens.find(t=>t.id===tokenSelecionado);if(!id||!token)throw Error('Selecione um token e uma ficha.');await salvarVinculoAtor(id,{token:token.id,dono:$('dono-token-selecionado')?.value});});
 if(b.dataset.verFicha){recipienteSelecionadoId=null;escolhido=b.dataset.verFicha;secao='ficha';npcsAbertos=true;acao=null;alvos=[];return render();}
 if(b.dataset.combate){escolhido=b.dataset.combate;return tarefa(async()=>{const p=s.atores.find(x=>x.id===escolhido);if(await confirma((p.emCombate===false?'Adicionar ':'Retirar ')+p.nome+'?',p.emCombate===false?'A ficha entrará na lista de combate.':'A ficha e o token continuarão vinculados.'))await enviar('alternarCombate');});}
 if(b.dataset.excluirItemRecipiente)return tarefa(async()=>{const r=s.recipientes.find(x=>x.id===recipienteSelecionadoId);if(!r||!await confirma('Excluir item?','O item será removido do recipiente.')||!await confirma('Confirmar exclusão?','Esta alteração não pode ser desfeita.'))return;await enviar('recipienteExcluirItem',{recipienteId:r.id,itemId:b.dataset.excluirItemRecipiente,confirmado:true,confirmacaoFinal:true});});
 if(b.dataset.recipiente){recipienteSelecionadoId=b.dataset.recipiente;paginaRecipiente='ficha';return render();}
 if(b.dataset.ator){recipienteSelecionadoId=null;escolhido=b.dataset.ator;acao=null;alvos=[];return render();}if(b.dataset.teste){return tarefa(()=>rolarTeste(b.dataset.teste,b.dataset.chave));}if(b.dataset.subir){const ordem=[...s.ordem],i=ordem.indexOf(b.dataset.subir);if(i>0){[ordem[i-1],ordem[i]]=[ordem[i],ordem[i-1]];return tarefa(()=>enviar('ordenarIniciativa',{ordem}));}return;}if(b.dataset.do)tarefa(()=>executar(b.dataset.do));};
$('app').onsubmit=e=>{if(e.target.id==='formFicha'){e.preventDefault();tarefa(salvarFicha);}};
$('app').onchange=e=>{if(e.target.id==='acao'){acao=e.target.value;alvos=[];render();}if(e.target.id==='alvo')alvo=e.target.value;
 if(e.target.id==='ficha-token-selecionado'){escolhido=e.target.value;render();}
 if(e.target.id==='pasta-fichas'){
   const campo=e.target,arquivos=Array.from(campo.files??[]);
   if(arquivos.length)tarefa(async()=>{
     try{
       const grupo=await lerPastaFichas(arquivos);
       await enviar('salvarGrupoFichas',grupo);
       aviso('Grupo '+grupo.nome+' salvo com '+grupo.fichas.length+' ficha(s). Abra a lista para adicionar ao encontro.');
     }finally{campo.value='';}
   });
 }
 if(e.target.id==='arquivo'){const f=e.target.files[0];if(f)tarefa(async()=>{const j=validar(JSON.parse((await f.text()).replace(/^\uFEFF/,'')));await enviar('adicionar',{ficha:j});aviso(j.nome+' adicionado. Escolha o token e salve o vínculo.');});}};
$('app').oncontextmenu=e=>{
 const ba=e.target.closest('[data-item-recipiente]');if(ba){e.preventDefault();const item=s.recipientes?.find(r=>r.id===recipienteSelecionadoId)?.itens?.find(i=>i.id===ba.dataset.itemRecipiente);if(item)exameItem.abrir(item);return;}

 const habilidade=e.target.closest('[data-habilidade-id]');
 if(habilidade){
   e.preventDefault();const a=s.atores.find(x=>x.id===escolhido),gm=info.role==='GM'&&!testar,pode=gm||(a?.ficha.tipo==='pj'&&a.dono===(testar?'teste':info.id));if(!pode)return;
   const o=a.ficha.opcoes.find(x=>x.id===habilidade.dataset.habilidadeId),passiva=a.ficha.passivas?.find(x=>x.id===habilidade.dataset.habilidadeId),h=o??passiva;if(!h)return;habilidadeContexto=h.id;
   $('habilidadeMenuTitulo').textContent=h.nome;$('habilidadeMenuDescricao').textContent=h.descricao||'Sem descrição adicional.';
   let acoes='<button type="button" data-habilidade-fechar>Cancelar</button>';
   const prep=a.ficha.preparacao??{preparadas:[],semprePreparadas:[],vagas:0},preparada=prep.preparadas.includes(h.id),sempre=prep.semprePreparadas.includes(h.id);
   if(o?.categoria==='magia'&&(o.circuloBase??0)>0&&!o.varianteDe&&!sempre)acoes+='<button type="button" data-habilidade-acao="'+(preparada?'despreparar':'preparar')+'" class="primario">'+(preparada?'Despreparar':'Preparar')+'</button>';
   else if(passiva||o?.custo?.some(c=>c.tipo==='reacao'))acoes+='<button type="button" data-habilidade-acao="'+(h.ativa===false?'ativar':'desativar')+'" class="primario">'+(h.ativa===false?'Ativar':'Desativar')+'</button>';
   else acoes+='<small>Esta habilidade não possui configuração contextual.</small>';
   if(s.fase!=='preparo')acoes='<button type="button" data-habilidade-fechar>Fechar</button><small>Prepare magias e altere passivas somente fora de combate.</small>';
   $('habilidadeMenuAcoes').innerHTML=acoes;$('habilidadeMenuEstado').textContent=s.fase==='preparo'?'Alterações permitidas fora de combate.':'Configuração travada durante o combate.';$('habilidadeMenu').showModal();return;
 }
 const item=e.target.closest('[data-item-id]');
 if(item){
   e.preventDefault();const a=s.atores.find(x=>x.id===escolhido),gm=info.role==='GM'&&!testar,pode=gm||(a?.ficha.tipo==='pj'&&a.dono===(testar?'teste':info.id));if(!pode)return;
   const i=a.ficha.inventario?.itens.find(x=>x.id===item.dataset.itemId);if(!i)return;itemContexto=i.id;itemContextoSlot=item.dataset.itemSlot??null;
   $('itemMenuTitulo').textContent=i.nome;$('itemMenuArte').innerHTML=arteItem(i,'item-arte-menu');$('itemMenuDescricao').textContent=i.descricao||'Sem descrição adicional.';
   let acoes='<button type="button" data-item-fechar>Cancelar</button><button type="button" data-item-examinar>Examinar 500×500</button>';
   if(i.tipo==='equipamento'&&i.equipado)acoes+='<button type="button" data-item-acao="desequipar" class="primario">Desequipar</button>';
   else if(i.tipo==='equipamento'&&i.slotEquipamento==='acessorio')acoes+='<button type="button" data-item-acao="equipar" data-item-slot="acessorio_1" class="primario">Equipar no acessório I</button><button type="button" data-item-acao="equipar" data-item-slot="acessorio_2" class="primario">Equipar no acessório II</button>';
   else if(i.tipo==='equipamento'&&i.slotEquipamento==='mao_forte'&&(i.duasMaos||/arco longo|espada grande/i.test(i.nome)))acoes+='<button type="button" data-item-acao="equipar" data-item-slot="mao_forte" class="primario">Equipar nas duas mãos</button>';
   else if(i.tipo==='equipamento'&&i.slotEquipamento==='mao_forte')acoes+='<button type="button" data-item-acao="equipar" data-item-slot="mao_forte" class="primario">Equipar na mão forte</button><button type="button" data-item-acao="equipar" data-item-slot="mao_fraca" class="primario">Equipar na mão fraca</button>';
   else if(i.tipo==='equipamento')acoes+='<button type="button" data-item-acao="equipar" class="primario">Equipar</button>';
   else if(i.tipo==='consumivel')acoes+='<button type="button" data-item-acao="usar" class="primario">Usar</button>';
   else acoes+='<small>Este item não possui uma ação contextual.</small>';
   const loja=lojaSelecionada(a.id);lojaDaVenda=loja?.id??null;
   if(s.fase==='preparo'&&loja&&i.tipo!=='moeda'&&i.negociavel!==false&&!i.equipado){const unitario=precoVendaPc(i),q=Math.floor(i.quantidade??1);acoes+='<button type="button" data-item-acao="vender" data-item-slot="1">Vender 1 por '+(unitario/100).toLocaleString('pt-BR',{maximumFractionDigits:2})+' PO</button>';if(q>1)acoes+='<button type="button" data-item-acao="vender" data-item-slot="'+q+'">Vender '+q+' por '+(unitario*q/100).toLocaleString('pt-BR',{maximumFractionDigits:2})+' PO</button>';}
   const troca=trocaDoAtor(s,a.id);
   if(s.fase==='preparo'&&troca?.status==='ofertas'&&!i.equipado&&i.negociavel!==false){
     if(i.tipo==='moeda')acoes+='<button type="button" data-item-acao="oferecer-po-troca">Oferecer PO na troca</button>';
     else acoes+='<button type="button" data-item-acao="oferecer-troca">Oferecer na troca</button>';
   }
   if(!i.equipado||s.fase!=='turnos'||a.bonus>0){const q=Math.max(1,Number(i.quantidade)||1);acoes+='<button type="button" data-item-acao="soltar" data-item-slot="1">Largar no chão'+(q>1?' · 1':'')+'</button>'+(q>1?'<button type="button" data-item-acao="soltar" data-item-slot="'+q+'">Largar toda a pilha ('+q+')</button>':'');}
   if(gm)acoes+='<button type="button" data-item-acao="excluir" class="perigo">Excluir item</button>';
   $('itemMenuAcoes').innerHTML=acoes;$('itemMenuCusto').textContent=s.fase==='turnos'?(i.tipo==='consumivel'?'Usar consome 1 ação. Equipar em espaço vazio é grátis; substituir ou desequipar consome 1 ação bônus.':i.equipado?'Desequipar consome 1 ação bônus.':'Equipar em espaço vazio é grátis; substituir equipamento consome 1 ação bônus.'):'Fora de combate não há custo de ação.';$('itemMenu').showModal();return;
 }
 const atributo=e.target.closest('[data-save]');if(atributo){e.preventDefault();return tarefa(()=>rolarTeste('salvaguardas',atributo.dataset.save));}if(e.target.closest('[data-do="usar"]')){e.preventDefault();$('rolagem').closest('details').open=true;$('rolagem').focus();}};
$('app').onpointerover=e=>{const alvo=e.target.closest('[data-info]');if(!alvo)return;preencherBalaoHabilidade(dicaLivro,alvo,alvo.dataset.info);dicaLivro.hidden=false;const r=alvo.getBoundingClientRect(),w=Math.min(360,innerWidth-16);dicaLivro.style.width=w+'px';const direita=r.right+8,esquerda=r.left-w-8;dicaLivro.style.left=Math.max(8,Math.min(innerWidth-w-8,direita+w<=innerWidth?direita:esquerda))+'px';dicaLivro.style.top=Math.max(8,Math.min(innerHeight-dicaLivro.offsetHeight-8,r.top))+'px';};
$('app').onpointerout=e=>{const alvo=e.target.closest('[data-info]');if(alvo&&!alvo.contains(e.relatedTarget))dicaLivro.hidden=true;};
$('itemMenu').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-item-fechar'))return $('itemMenu').close();if(b.hasAttribute('data-item-examinar')){const a=s.atores.find(x=>x.id===escolhido),i=a?.ficha.inventario?.itens.find(x=>x.id===itemContexto);$('itemMenu').close();if(i)exameItem.abrir(i);return;}if(b.dataset.itemAcao)tarefa(()=>alterarItem(b.dataset.itemAcao,b.dataset.itemSlot));};
$('habilidadeMenu').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-habilidade-fechar'))return $('habilidadeMenu').close();if(b.dataset.habilidadeAcao)tarefa(()=>alterarHabilidade(b.dataset.habilidadeAcao));};
window.addEventListener('message',e=>{if(e.data?.fecharLoja){limparCatalogo();lojaLocalAtor=null;render();}if(e.data?.fecharTroca){trocaLocalId=null;trocaLocalAtor=null;render();}});
function falhaConexao(e){
  $('erroConexao').textContent=e?.message??String(e);
  $('recuperacao').hidden=false;
  $('modo').textContent='Falha na conexão';
}
$('reconectar').onclick=async()=>{
  $('reconectar').disabled=true;
  try{if(api)await api.notify();location.reload();}
  catch(e){falhaConexao(e);}
  finally{$('reconectar').disabled=false;}
};
$('backupMesa').onclick=async()=>{
  try{
    const prefixo=ns+'/'+(emSala?OBR.room.id+'/':'ensaio');
    const registros=Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith(prefixo)).map(k=>[k,localStorage.getItem(k)]));
    if(!Object.keys(registros).length){$('statusBackup').textContent='Nenhum encontro salvo neste navegador para esta sala.';return;}
    const dados={formato:'backup-local-la-arte',exportadoEm:new Date().toISOString(),registros};
    const url=URL.createObjectURL(new Blob([JSON.stringify(dados,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='backup-la-arte-'+Date.now()+'.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('statusBackup').textContent='Backup exportado.';
  }catch(e){$('statusBackup').textContent=e.message;}
};
$('app').addEventListener('toggle',e=>{
 const id=e.target.dataset?.grupoLista;
 if(id)e.target.open?gruposAbertos.add(id):gruposAbertos.delete(id);
},true);
try{
 const grupos=await fetch('./grupos-fichas.json?v=0.8.45');
 if(!grupos.ok)throw Error('Falha ao carregar os grupos de fichas.');
 gruposFichas=(await grupos.json()).grupos;
 catalogo=await conteudoConfigurado();api=await (emSala?sala:demo)(view);api.notify().catch(falhaConexao);
 if(emSala){
   const chave=ns+'/abrir-ficha/'+OBR.room.id;
   function pedido(raw){if(!raw)return;const d=JSON.parse(raw);if(Date.now()-d.quando>30000)return;
     secao='ficha';solicitacaoFicha=d.id;if(d.pagina)paginaFicha=d.pagina;if(s)view(recebido,info);localStorage.removeItem(chave);}
   window.addEventListener('storage',e=>{if(e.key===chave)pedido(e.newValue);});pedido(localStorage.getItem(chave));
   let ultimo;
   const selecionar=id=>{tokenSelecionado=id||null;if(!id||id===ultimo){ultimo=id;return;}ultimo=id;if(!s)return;const a=s?.atores.find(x=>x.token===id&&(info?.role==='GM'||x.dono===info?.id));if(a){escolhido=a.id;acao=null;alvos=[];}if(info?.role==='GM'&&secao==='gm'||a)render();};
   api.observarSelecao(selecionar);const id=await api.selecionado();
   selecionar(id);
 }
 if(emSala)setTimeout(()=>{if(!s){aviso('Aguardando o mestre e a cena do Owlbear.');api.notify().catch(falhaConexao);}},1800);}catch(e){aviso(e.message);falhaConexao(e);}

window.render_game_to_text=()=>JSON.stringify({coordenadas:'x cresce para a direita; y cresce para baixo; distâncias em metros',fase:s?.fase,rodada:s?.rodada,turno:atual(s??{atores:[],ordem:[]})?.nome,selecionado:s?.atores.find(a=>a.id===escolhido)?.nome,reacao:s?.reacaoPendente?{reator:s.atores.find(a=>a.id===s.reacaoPendente.reator)?.nome,alvo:s.atores.find(a=>a.id===s.reacaoPendente.alvo)?.nome,terminaEm:s.reacaoPendente.terminaEm}:null});
window.advanceTime=()=>{};

