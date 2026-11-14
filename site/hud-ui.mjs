import {detalhes} from './ficha-view.mjs?v=0.7.29';
import {periciasPadrao,bonusPericia,mod,pvMaximosAtuais,deslocamentoMaximo,ordenarOpcoesRodape,opcaoPorId} from './engine.mjs?v=0.7.29';
import {defesaAplica,infoTipoDano,normalizarDefesaDano} from './damage.mjs?v=0.7.29';
import {pronto} from './bridge.mjs?v=0.7.29';
import {canalHud} from './hud-controller.mjs?v=0.7.29';
const parte=new URL(location.href).searchParams.get('parte'),root=document.querySelector('#hud');
document.body.className=parte;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(cmd,label,attrs='')=>'<button type="button" data-cmd="'+cmd+'" '+attrs+'>'+label+'</button>';
const curto=o=>{const nome=o.nome.replace(/^(Truque|\dº)\s*\|\s*/,'');return o.varianteArremessoDe||o.automacao?.arremesso?nome.split(/\s*[|—]\s*/)[0]:nome.split(/\s*[|·—]\s*/)[0];};
const grupo=o=>o.origemItem||o.categoria==='item'?'Itens':o.custo?.some(c=>c.tipo==='reacao')?'Reações':o.custo?.some(c=>c.tipo==='bonus')?'Bônus':o.categoria==='magia'?'Magias':'Ações';
const normalizar=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rotuloOperacao=o=>({resistencia:'× 1/2',imunidade:'0',vulnerabilidade:'× 2',reducao_fixa:'− dano',reducao_dado:'− dado',multiplicador:'ajuste',limiar:'limiar'}[o]??o);
function etiquetasDefesas(alvo,parcelas){
  const defesas=(alvo?.defesas??[]).map(normalizarDefesaDano).filter(d=>parcelas.some(p=>defesaAplica(d,p)));
  return defesas.length?'<div class="defesas-instancia">'+defesas.map(d=>'<span>'+esc(d.nome)+' · '+esc(rotuloOperacao(d.operacao))+'</span>').join('')+'</div>':'';
}
function painelDefesas(m,extras=[]){
  const alvos=m.alvosDano??(m.alvoDano?[m.alvoDano]:[]);if(m.ocultarDefesas||!alvos.some(a=>a.defesas?.length))return '';
  const parcelas=[...(m.parcelasDano??[{tipo:m.tipoDano,tags:[]}]),...extras.map(x=>({tipo:x.elemento,tags:x.tags??[]}))];
  const linhas=alvos.flatMap(alvo=>alvo.defesas.map(normalizarDefesaDano).filter(d=>parcelas.some(p=>defesaAplica(d,p))).map(d=>({alvo:alvo.nome,d})));
  return linhas.length?'<div class="defesas-dano"><small>Defesas relevantes '+(alvos.length>1?'por alvo':'do alvo')+'</small><div>'+linhas.map(({alvo,d})=>'<span><b>'+(alvos.length>1?esc(alvo)+' · ':'')+esc(d.nome)+'</b><i>'+esc(rotuloOperacao(d.operacao))+'</i></span>').join('')+'</div></div>':'';
}
function resultadoDano(relatorios){
  if(!relatorios?.length)return '';
  return '<div class="relatorios-dano">'+relatorios.map(r=>'<article><header><strong>'+esc(r.alvoNome||'Alvo')+'</strong><b>'+esc(r.pvPerdido)+' PV perdidos</b></header>'+r.parcelas.map(p=>{const t=infoTipoDano(p.tipo),passos=p.passos?.map(x=>x.defesa?.nome+' '+x.antes+'→'+x.depois).join(' · ');return '<div class="parcela-dano" style="--tipo-dano:'+t.cor+'"><span>'+esc(t.simbolo)+' '+esc(t.nome)+'</span><output>'+esc(p.rolado)+' → '+esc(p.final)+'</output>'+(passos?'<small>'+esc(passos)+'</small>':'')+'</div>';}).join('')+'<footer><span>Dano recebido <b>'+esc(r.danoRecebido)+'</b></span>'+(r.absorvidoPorPvTemporario?'<span>PV temporários <b>−'+esc(r.absorvidoPorPvTemporario)+'</b></span>':'')+'<span>PV '+esc(r.pvAntes)+' → '+esc(r.pvDepois)+'</span>'+(r.excesso?'<span>Excesso <b>'+esc(r.excesso)+'</b></span>':'')+'</footer></article>').join('')+'</div>';
}
const comuns=['golpe desarmado','agarrar','derrubar','empurrar','desengajar','disparada','esquivar','ajudar','esconder-se','preparar','procurar','estudar','influenciar','utilizar','usar magia','ataque de oportunidade'];
const nomeClasse=f=>{const id=f.classes?.[0]?.nome??f.classes?.[0]?.id??'Classe';return ({guardiao:'Guardião',guerreiro:'Guerreiro',bardo:'Bardo',monge:'Monge',feiticeiro:'Feiticeiro',bruxo:'Bruxo'})[normalizar(id)]??id.replace(/(^|-)(\w)/g,(_,s,l)=>(s?' ':'')+l.toUpperCase());};
function categoriaHud(o){
  if(o.filtroHud)return o.filtroHud;
  const texto=normalizar(o.nome+' '+(o.origem??''));
  if(o.geradaPorItem&&o.automacao?.tipo==='ataque')return 'Comum';
  if(o.origemItem||o.categoria==='item'||/item|equipamento|consumivel/.test(normalizar(o.origem)))return 'Itens';
  if(comuns.some(n=>texto.startsWith(n))||o.categoria!=='magia'&&o.automacao?.tipo==='ataque')return 'Comum';
  return 'Classe';
}
let v,filtro='Comum',recursoAtivo=null,bus,ultimoPedido=null,adicionaisAtivos=new Set(),rerrolagemAtiva=null,iniciativaAberta=false,iniciativasSelecionadas=new Set();
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
  const resumo=e=>{const m=e.modificadores??{},mods=Object.entries(m).map(([k,n])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'deslocamento'}[k]??k)+' '+(n>=0?'+':'')+n),restante=e.duracao?.restante??e.turnos;return [e.nome,e.descricao,...mods,restante!=null?restante+' turno(s)':e.removeEm==='descanso_longo'?'Até o descanso longo':e.removeEm==='descanso_curto'?'Até o descanso curto':e.tipo==='concentracao'?'Termina ao perder ou encerrar a concentração':'Duração especial'].filter(Boolean).join('\n');};
  const lista=[...(a.efeitosAtivos??[])];if(a.concentracaoAtiva)lista.unshift({nome:a.concentracaoAtiva.nome,tipo:'concentracao',descricao:'Concentração ativa'});
  return lista.length?'<div class="efeitos-hud" aria-label="Buffs, condições e concentração">'+lista.map(e=>'<span class="efeito-hud '+esc(e.tipo??'efeito')+'" tabindex="0" data-info="'+esc(resumo(e))+'"><b>'+(e.tipo==='condicao'?'⚠':e.tipo==='concentracao'?'◉':'✦')+'</b><small>'+esc(e.nome)+'</small></span>').join('')+'</div>':'';
}
function cartaoAcao(o,f){
  if(!o)return '';
  const r=o.automacao??{},s=o.selecao,custos=(o.custo??[]).map(c=>c.quantidade+' '+(c.tipo==='recurso'?(f.recursos?.find(x=>x.id===c.id)?.nome??c.id):({acao:'ação',bonus:'ação bônus',reacao:'reação'})[c.tipo])).join(' + ');
  const linha=(nome,valor)=>valor?'<div><dt>'+esc(nome)+'</dt><dd>'+esc(valor)+'</dd></div>':'';
  const uso=custos||'Sem custo',alcance=r.arremesso?r.alcanceNormalM+'/'+r.alcanceM+' m':r.alcanceM!=null?r.alcanceM+' m':'—';
  const resistencia=r.cd?(r.atributos??[r.atributo]).map(x=>x.toUpperCase()).join(' ou ')+' · CD '+r.cd:r.tipo==='ataque'?'Ataque '+(r.bonus>=0?'+':'')+r.bonus:'—';
  const efeito=(o.descricao??'').replace(/\n+/g,' · ');
  const area=r.raioM?r.raioM+' m de raio':r.area?.forma==='circulo'?r.area.raioM+' m de raio':r.area?.forma==='quadrado'?r.area.tamanhoM+' m × '+r.area.tamanhoM+' m':r.area?.forma==='cone'?'cone de '+r.area.comprimentoM+' m':r.area?.forma==='linha'?'linha de '+r.area.comprimentoM+' m × '+(r.area.larguraM??1.5)+' m':'';
  return '<section class="carta-acao"><header><h2>'+esc(o.nome)+'</h2><small>'+esc([o.categoria,o.circuloBase!=null?(o.circuloBase?o.circuloBase+'º círculo':'Truque'):'',o.origem].filter(Boolean).join(' · '))+'</small></header><dl>'+linha('Uso',uso)+linha('Alcance',alcance)+linha('Área',area)+linha(r.tipo==='ataque'?'Ataque':'Resistência',resistencia)+linha('Dano',r.dano?[r.dano,r.elemento].filter(Boolean).join(' '):'')+linha('Deslocamento',r.deslocamentoForcado?'Empurra '+r.deslocamentoForcado.distanciaM+' m para longe da origem':'')+linha('Alvos',s?.max?('de '+s.min+' a '+s.max+(s.repetirAlvo?' · pode repetir':' · distintos')):'')+linha('Efeito',efeito)+'</dl></section>';
}
function render(){
  if(!v)return;
  const {estado:s,eu,ocupado,pendente:p}=v;
  if(v.pedidoDado?.pedido!==ultimoPedido){ultimoPedido=v.pedidoDado?.pedido??null;rerrolagemAtiva=null;}
  adicionaisAtivos=new Set(v.pedidoDado?.recursosAtivos??[]);
  const ativo=s.ordem[s.vez],a=s.atores.find(a=>a.id===v.atorId),gm=eu.role==='GM';
  const meus=s.atores.filter(x=>gm||x.dono===eu.id);
  const iniciativasPendentes=s.atores.filter(x=>x.emCombate!==false&&x.init===null);
  if(s.fase==='iniciativa'&&!iniciativaAberta){iniciativaAberta=true;if(gm)iniciativasSelecionadas=new Set(iniciativasPendentes.map(x=>x.id));}
  if(s.fase!=='iniciativa'){iniciativaAberta=false;iniciativasSelecionadas.clear();}
  const idsPendentes=new Set(iniciativasPendentes.map(x=>x.id));
  iniciativasSelecionadas=new Set([...iniciativasSelecionadas].filter(id=>idsPendentes.has(id)));
  let html='';
  if(parte==='ordem'){
    const ordem=s.fase==='iniciativa'?s.atores.filter(x=>x.emCombate!==false).map(x=>x.id):s.vez<0?s.ordem:[...s.ordem.slice(s.vez),...s.ordem.slice(0,s.vez)];
    html='<nav><strong>'+(s.rodada?'Rodada '+s.rodada:'Iniciativa')+'</strong>'+ordem.map(id=>{
      const x=s.atores.find(a=>a.id===id);if(!x)return '';
      return btn('ator','<i>'+retrato(x)+'</i><span>'+esc(x.nome)+'<small>'+esc(x.init??'…')+'</small></span>',
        'data-id="'+esc(id)+'" class="ord '+(id===ativo?'atual ':'')+(meus.includes(x)?'':'observador')+'"');
    }).join('')+'</nav>';
  }else if(parte==='iniciativa'){
    if(gm){
      const marcadas=iniciativasPendentes.filter(x=>iniciativasSelecionadas.has(x.id));
      html='<section class="prompt iniciativa-lote"><header><div><strong>Iniciativas</strong><small>Escolha jogadores e NPCs</small></div><span>'+marcadas.length+'/'+iniciativasPendentes.length+'</span></header><div class="lista-iniciativas">'+iniciativasPendentes.map(x=>btn('selecionarIniciativa','<b>'+(iniciativasSelecionadas.has(x.id)?'✓':'')+'</b><span>'+esc(x.nome)+'<small>'+(x.ficha.tipo==='pj'?'JOGADOR':'NPC')+'</small></span>','data-id="'+esc(x.id)+'" aria-pressed="'+iniciativasSelecionadas.has(x.id)+'"')).join('')+'</div><footer>'+btn('selecionarTodasIniciativas','Selecionar todas')+btn('limparIniciativas','Limpar')+btn('iniciativas','Rolar selecionados · '+marcadas.length,'class="ouro" '+(marcadas.length?'':'disabled'))+'</footer></section>';
    }else{
      const propria=iniciativasPendentes.find(x=>x.ficha.tipo==='pj'&&x.dono===eu.id);
      html='<section class="prompt iniciativa-jogador"><strong>Iniciativa</strong>'+(propria?'<small>'+esc(propria.nome)+'</small>'+btn('iniciativa','Rolar iniciativa','data-id="'+esc(propria.id)+'" class="ouro"'):'<small>Aguardando a iniciativa da sua ficha vinculada.</small>')+'</section>';
    }
  }else if(parte==='acao'&&p&&a){
    const o=opcaoPorId(a,p.opcao);
    const executar=p.lista?btn('confirmar','Executar seleção','class="ouro" '+(p.pronto?'':'disabled')):(p.pronto?btn('confirmar',p.substitui?'Executar pelo jogador':'Executar','class="ouro"'):'');
    const desfazer=p.lista?btn('desfazer','Desfazer',p.quantidade?'':'disabled'):'';
    html='<section class="painel-acao">'+cartaoAcao(o,a.ficha)+'<div class="selecao-acao"><strong>'+esc(p.detalhe)+'</strong><div>'+desfazer+executar+btn('cancelar','Cancelar')+'</div></div></section>';
  }else if(parte==='reacao'&&s.reacaoPendente){
    const rp=s.reacaoPendente,reator=s.atores.find(x=>x.id===rp.reator),alvo=s.atores.find(x=>x.id===rp.alvo);
    const opcoes=(reator?.ficha.opcoes??[]).filter(o=>rp.opcoes.includes(o.id));
    const restante=Math.max(0,Math.ceil((rp.terminaEm-Date.now())/1000));
    const descricao=rp.descricao??((alvo?.nome??'O alvo')+' está deixando seu alcance corpo a corpo.');
    html='<section class="prompt reacao"><strong>Reação de '+esc(reator?.nome)+'</strong><small>'+esc(descricao)+'</small><b class="timer">'+restante+' s</b><small>Ao escolher a reação, a janela de ajuste será aberta antes de cada rolagem.</small><div class="escolhas-reacao">'+btn('resolverReacao','Não fazer nada','data-id=""')+opcoes.map(o=>btn('resolverReacao',esc(curto(o)),'data-id="'+esc(o.id)+'" class="ouro" data-info="'+esc(detalhes(o,reator.ficha))+'"')).join('')+'</div></section>';
  }else if(parte==='dados'&&v.pedidoDado){
    const d=v.pedidoDado,m=d.meta??{};
    if(d.tipo==='resultado'){
      const r=d.resultado,classe=/crític/i.test(d.status)?'critico':/falha/i.test(d.status)?'falha':'acerto';
      const lote=r.resultados?.length?r.resultados:null,extras=(m.adicionaisAtivos??[]).map(id=>m.adicionais?.find(x=>x.id===id)).filter(Boolean);
      const conteudo=lote?'<div class="resultados-lote">'+lote.map((x,i)=>{const info=m.instancias?.[i]??(i===0?{titulo:'Dano base',alvo:m.alvo,critico:m.critico}:extras[i-1]??{}),iniciativa=m.tipo==='iniciativa_lote';return '<article class="'+(!iniciativa&&i?'dano-extra':'')+'"><strong>'+esc(info.titulo||info.nome||'Instância '+(i+1))+(info.alvo?' · '+esc(info.alvo):'')+'</strong><output>'+esc(x.resumo||x.total)+'</output><b>'+esc(x.total)+' '+esc(m.unidadeResultado??'de dano')+(info.critico?' · crítico':'')+'</b></article>';}).join('')+'</div>':'<output>'+esc(r.resumo||r.total)+'</output>';
      const rerrolagens=(m.rerrolagens??[]).filter(x=>!(d.rerrolagensUsadas??[]).includes(x.id));
      const painelRerrolagem=rerrolagens.length?'<div class="recursos-rolagem rerrolagens"><small>Recursos de rerrolagem</small><div>'+rerrolagens.map(x=>btn('escolherRerrolagem',esc(x.nome),'data-id="'+esc(x.id)+'" aria-pressed="'+(rerrolagemAtiva===x.id)+'" data-info="'+esc(x.descricao||x.nome)+'"')).join('')+'</div>'+(rerrolagemAtiva?btn('rerrolarDado','Rerrolar','class="ouro"'):'')+'</div>':'';
      const relatorio=resultadoDano(r.relatoriosDano);
      html='<section class="prompt rolagem resultado-dado"><strong>'+esc(m.titulo||'Resultado da rolagem')+'</strong><small>'+esc([m.alvo&&'Alvo: '+m.alvo,m.cd&&'CD '+m.cd].filter(Boolean).join(' · '))+'</small>'+conteudo+relatorio+(d.status?'<b class="estado '+classe+'">'+esc(d.status)+'</b>':'')+painelRerrolagem+'<div>'+btn('continuarDado','Continuar','class="ouro"')+'</div></section>';
    }else{
      const formulas=d.formulas?.map((x,i)=>document.querySelector('[data-formula-lote="'+i+'"]')?.value||x);
      if(formulas){
        const campos=formulas.map((valor,i)=>{const info=m.instancias?.[i]??{},modo=modoFormula(valor),rotulo=m.rotuloInstancia??'Seta',botaoModo=(id,label)=>btn('modoDadoLote',label,'data-index="'+i+'" data-modo="'+id+'" aria-pressed="'+(modo===id)+'"'),defesas=m.ocultarDefesas?'':etiquetasDefesas(m.alvosDano?.[i],[m.parcelasDano?.[i]??{tipo:info.tipoDano,tags:[]}]);return '<article class="ajuste-seta"><header><strong>'+esc(info.titulo||rotulo+' '+(i+1))+'</strong><small>'+esc(info.alvo||'')+(info.critico?' · crítico':'')+'</small></header><div class="modos-d20" role="group" aria-label="Modo de '+esc(rotulo.toLowerCase())+' '+(i+1)+'">'+botaoModo('normal','Normal')+botaoModo('vantagem','Vantagem')+botaoModo('desvantagem','Desvantagem')+'</div><label>Comando do Dice+<input data-formula-lote="'+i+'" value="'+esc(valor)+'" autocomplete="off" spellcheck="false"></label>'+defesas+'</article>';}).join('');
        html='<section class="prompt rolagem rolagem-lote"><strong>'+esc(m.titulo||'Ajustar rolagens')+'</strong><small>'+esc(m.descricaoLote??'Revise cada seta. O Dice+ lançará todas juntas.')+'</small><div class="ajustes-lote">'+campos+'</div>'+(d.erro?'<b class="erro">'+esc(d.erro)+'</b>':'')+(d.tipo==='rolando'?'<p>Rolando todos os dados juntos…</p>':'<div class="acoes-rolagem">'+btn('cancelarDado','Cancelar')+btn('rolarDado','Rolar dados','class="ouro"')+'</div>')+'</section>';
      }else{
        const valor=document.querySelector('#formulaDado')?.value||d.formula||'',temD20=/^(?:1d20|2d20k[hl]1)/i.test(valor),modo=modoFormula(valor),botaoModo=(id,label)=>btn('modoDado',label,'data-modo="'+id+'" aria-pressed="'+(modo===id)+'"');
        const adicionais=m.adicionais??[],selecionados=adicionais.filter(x=>adicionaisAtivos.has(x.id));
        const painelAdicionais=adicionais.length?'<div class="recursos-rolagem adicionais"><small>'+esc(m.rotuloAdicionais??'Habilidades disponíveis após o acerto')+'</small><div>'+adicionais.map(x=>btn('alternarAdicional',esc(x.nome),'data-id="'+esc(x.id)+'" aria-pressed="'+adicionaisAtivos.has(x.id)+'" '+(x.automatico?'disabled ':'')+'data-info="'+esc((x.automatico?'Aplicação automática.\n':'')+(x.descricao||x.nome))+'"')).join('')+'</div>'+(selecionados.length?'<div class="dados-bloqueados">'+selecionados.map(x=>'<span><b>'+esc(x.formula)+'</b> · '+esc(x.nome)+'</span>').join('')+'</div>':'')+'</div>':'';
        const painelDefesa=painelDefesas(m,selecionados);
        html='<section class="prompt rolagem"><strong>'+esc(m.titulo||'Ajustar rolagem')+'</strong><small>'+esc([m.alvo&&'Alvo: '+m.alvo,m.cd&&'CD '+m.cd,m.critico&&'Crítico: dado adicional já aplicado'].filter(Boolean).join(' · '))+'</small>'+(temD20?'<div class="modos-d20" role="group" aria-label="Modo do d20">'+botaoModo('normal','Normal')+botaoModo('vantagem','Vantagem')+botaoModo('desvantagem','Desvantagem')+'</div>':'')+'<label>Comando do Dice+<input id="formulaDado" value="'+esc(valor)+'" autocomplete="off" spellcheck="false"></label>'+painelAdicionais+painelDefesa+(d.erro?'<b class="erro">'+esc(d.erro)+'</b>':'')+(d.tipo==='rolando'?'<p>Rolando todos os dados juntos…</p>':'<div>'+btn('cancelarDado','Cancelar')+btn('rolarDado','Rolar dados','class="ouro"')+'</div>')+'</section>';
      }
    }
  }else if(parte==='dica-efeito'&&v.dicaEfeito){
    html='<section class="dica-efeito-card" role="tooltip">'+esc(v.dicaEfeito)+'</section>';
  }else if(parte==='efeitos'&&a){
    html='<section class="efeitos-only">'+efeitosHud(a)+'</section>';
  }else if(parte==='barra'&&a){
    const pvMax=pvMaximosAtuais(a);
    const reserva='style="--efeitos-reserva:0px"';
    if(v.compacto){html='<section class="dock compacta" '+reserva+'><div class="dock-corpo"><aside><div class="retrato" title="Clique duas vezes para expandir">'+retrato(a)+'</div><div class="pv"><i style="width:'+Math.max(0,Math.min(100,100*a.pv/pvMax))+'%"></i></div><b>'+a.pv+' / '+pvMax+' PV</b></aside></div></section>';root.innerHTML=html;return;}
    const turno=ativo===a.id;
    const ops=ordenarOpcoesRodape(a);
    const foraCombate=s.fase==='preparo',pericias=!recursoAtivo&&filtro==='Perícias',salvas=!recursoAtivo&&filtro==='Salva guarda',passivas=!recursoAtivo&&filtro==='Passivas';
    const recursosFicha=a.ficha.recursos??[],idsRecursos=new Set(['acao','bonus','reacao',...recursosFicha.map(r=>'recurso:'+r.id)]);
    if(recursoAtivo&&!idsRecursos.has(recursoAtivo))recursoAtivo=null;
    const usaRecurso=o=>!recursoAtivo||(o.custo??[]).some(c=>recursoAtivo.startsWith('recurso:')?c.tipo==='recurso'&&c.id===recursoAtivo.slice(8):c.tipo===recursoAtivo);
    const disp=ops.filter(o=>usaRecurso(o)&&(recursoAtivo||categoriaHud(o)===filtro));
    const recuperacao=r=>(r.recuperacao??[]).map(x=>x.evento.replaceAll('_',' ')).join(', ')||'Recuperação especial';
    const recursos=[
      {id:'acao',nome:'Ação',simbolo:'●',atual:foraCombate?'∞':a.acao,maximo:1,descricao:'Seu recurso principal no combate. Recarga: uma vez por turno.'},
      {id:'bonus',nome:'Ação Bônus',simbolo:'▲',atual:foraCombate?'∞':a.bonus,maximo:1,descricao:'Seu recurso secundário no combate. Recarga: uma vez por turno.'},
      {id:'reacao',nome:'Reação',simbolo:'✦',atual:foraCombate?'∞':a.reacao,maximo:1,descricao:'Usada por gatilhos fora do seu turno. Recarga: no início do turno.'},
      ...recursosFicha.map(r=>({id:'recurso:'+r.id,nome:r.nome,simbolo:'◆',atual:a.rec[r.id],maximo:r.maximo,descricao:'Recurso renovável. Recarga: '+recuperacao(r)+'.'}))
    ];
    const botoesRecursos=recursos.map(r=>btn('recurso','<b>'+r.simbolo+'</b><small>'+esc(r.atual)+(r.maximo>1?'/'+r.maximo:'')+'</small>','data-id="'+esc(r.id)+'" class="recurso-hud '+(Number(r.atual)===0?'zerado ':'')+'" aria-label="'+esc(r.nome)+'" aria-pressed="'+(recursoAtivo===r.id)+'" data-info="'+esc(r.nome+'\n'+r.descricao)+'"')).join('');
    const consumiveis=(a.ficha.inventario?.itens??[]).filter(i=>i.tipo==='consumivel'&&i.quantidade>0);
    const renderOpcao=o=>{
        const livre=s.fase==='preparo';
        const custoIndisponivel=(o.custo??[]).some(c=>c.tipo==='recurso'?a.rec[c.id]<c.quantidade:!livre&&a[c.tipo]<c.quantidade);
        const req=o.requisitosUso??{},ataques=a.eventosTurno?.ataques??[],acertos=a.eventosTurno?.acertos??[];
        const requisitoIndisponivel=!livre&&((req.aposAtaque&&!ataques.length)||(req.aposAcerto&&!acertos.length)||(req.umaVezPorTurno&&a.usosTurno?.[req.umaVezPorTurno]));
        const bloqueio=(grupo(o)!=='Reações'&&!turno&&!livre)?'Aguarde seu turno':a.pv<=0?'Personagem a 0 PV':
          custoIndisponivel?'Recurso insuficiente':
          requisitoIndisponivel?'Requisito de turno ainda não cumprido':
          !o.automacao&&!gm&&grupo(o)!=='Reações'?'Resolução pelo mestre':'';
        const posAcerto=v.pedidoDado?.meta?.adicionais?.some(x=>x.id===o.id),selecionado=adicionaisAtivos.has(o.id);
        return btn('usar',esc(curto(o)+(o.nome.includes('duas mãos')?' · 2 mãos':'')),'data-id="'+esc(o.id)+'" class="'+(posAcerto?'pos-acerto ':'')+(selecionado?'selecionado':'')+'" '+(bloqueio||ocupado?'disabled ':'')+'data-info="'+esc([bloqueio,detalhes(o,a.ficha)].filter(Boolean).join('\n'))+'"');
      };
    const itensGrade=filtro==='Itens'&&!recursoAtivo?consumiveis.map(i=>btn('usarItem',esc(i.nome+' ×'+i.quantidade),'data-id="'+esc(i.id)+'" '+(!foraCombate&&(!turno||a.acao<1)?'disabled ':'')+'data-info="Consumível&#10;'+esc(i.descricao??'')+'&#10;Em combate custa 1 ação."')).join(''):'';
    const conteudoGrade=pericias?Object.keys(periciasPadrao).map(nome=>{const bonus=bonusPericia(a.ficha,nome);return btn('teste',esc(nome+' '+(bonus>=0?'+':'')+bonus),'data-grupo="pericias" data-chave="'+esc(nome)+'" data-info="Perícia · '+esc(nome)+'&#10;Bônus da ficha: '+(bonus>=0?'+':'')+bonus+'&#10;Pode ser rolada fora do turno."');}).join(''):
      salvas?Object.keys(a.ficha.atributos).map(chave=>{const bonus=a.ficha.salvaguardas?.[chave]??mod(a.ficha.atributos[chave]);return btn('teste',esc(chave.toUpperCase()+' '+(bonus>=0?'+':'')+bonus),'data-grupo="salvaguardas" data-chave="'+esc(chave)+'" data-info="Salvaguarda de '+esc(chave.toUpperCase())+'&#10;Bônus da ficha: '+(bonus>=0?'+':'')+bonus+'&#10;Pode ser rolada fora do turno."');}).join(''):
      passivas?(a.ficha.passivas??[]).map(x=>btn('passiva',esc(curto(x)),'disabled data-info="'+esc((x.nome??'Passiva')+'\n'+(x.descricao??''))+'"')).join(''):itensGrade+disp.map(renderOpcao).join('');
    const filtros=[['Comum','Comum'],['Classe',nomeClasse(a.ficha)],['Itens','Itens'],['Passivas','Passivas']].map(([id,label])=>btn('filtro',esc(label),'data-id="'+id+'" aria-pressed="'+(!recursoAtivo&&filtro===id)+'"')).join('')+btn('filtro','Personalizado','data-id="Personalizado" disabled title="Disponível em uma etapa futura"');
    const maxMov=Math.max(.01,deslocamentoMaximo(a)),movPct=Math.max(0,Math.min(100,100*a.metros/maxMov));
    html='<section class="dock" '+reserva+'><div class="dock-corpo"><aside><div class="retrato">'+retrato(a)+'</div><div class="pv"><i style="width:'+Math.max(0,Math.min(100,100*a.pv/pvMax))+'%"></i></div><b>'+a.pv+' / '+pvMax+' PV'+(a.pvTemporarios?' · +'+a.pvTemporarios+' temp.':'')+'</b>'+(a.pv<=0?'<small>'+esc(a.estadoVida??'inconsciente')+' · '+(a.salvaguardasMorte?.sucessos??0)+'✓ '+(a.salvaguardasMorte?.falhas??0)+'✕</small>':'')+'</aside><article><header><strong>'+esc(a.nome)+'</strong>'+btn('ficha','Ficha')+'</header>'+
      '<div class="topo-hud"><div class="recursos-hud">'+botoesRecursos+'</div><div class="ferramentas-hud"><label>Linhas <select id="linhas">'+[1,2,3,4,5].map(n=>'<option '+(n===v.linhas?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+btn('filtro','Perícias','data-id="Perícias" aria-pressed="'+(filtro==='Perícias')+'"')+btn('filtro','Salva guarda','data-id="Salva guarda" aria-pressed="'+(filtro==='Salva guarda')+'"')+'</div></div>'+
      '<div class="centro-hud"><div class="grade" style="--linhas:'+v.linhas+'">'+(conteudoGrade||'<span class="vazio-grade">Nenhuma habilidade neste filtro.</span>')+'</div><div class="movimento-hud"><div class="barra-movimento"><i style="height:'+movPct+'%"></i></div>'+(p?'<small>Ação aberta</small>':a.pv===0&&a.estadoVida==='inconsciente'&&turno?btn('salvaguardaMorte','Morte'):btn('mover','Mover',turno&&a.pv>0?'':'disabled'))+'<b>'+Number(a.metros.toFixed(2))+' m</b></div></div>'+
      '<div class="filtros-hud">'+filtros+(a.concentracaoAtiva?btn('encerrarConcentracao','Encerrar concentração','data-info="Encerra '+esc(a.concentracaoAtiva.nome)+' e todos os efeitos vinculados."'):'')+btn('passar','Finalizar turno','class="ouro" '+(turno?'':'disabled'))+'</div>'+(!p&&s.historico.length?'<small class="resultado" title="'+esc(s.historico[0])+'">'+esc(s.historico[0])+'</small>':'')+'</article></div></section>';
  }
  const scroll=root.querySelector('.grade')?.scrollLeft??0;
  ocultarDica();root.innerHTML=html;
  if(root.querySelector('.grade'))root.querySelector('.grade').scrollLeft=scroll;
}
const dica=document.createElement('div');dica.className='dica-skill';dica.hidden=true;dica.setAttribute('role','tooltip');document.body.append(dica);
let dicaEfeitoAtual=null;
function ocultarDica(){
  dica.hidden=true;
  if(parte==='efeitos'&&dicaEfeitoAtual){dicaEfeitoAtual=null;bus?.postMessage({tipo:'dicaEfeito',info:null});}
}
function mostrarDica(e){
  const b=e.target.closest('[data-info]');if(!b){ocultarDica();return;}
  if(parte==='efeitos'){
    if(dicaEfeitoAtual!==b.dataset.info){dicaEfeitoAtual=b.dataset.info;bus?.postMessage({tipo:'dicaEfeito',info:dicaEfeitoAtual});}
    return;
  }
  dica.textContent=b.dataset.info;dica.hidden=false;
  const caixa=b.getBoundingClientRect();
  dica.style.left=(caixa.left>innerWidth/2?4:Math.max(4,innerWidth-dica.offsetWidth-4))+'px';
}
root.onpointerover=mostrarDica;root.onfocusin=mostrarDica;root.onpointerleave=ocultarDica;root.onfocusout=ocultarDica;
root.onclick=e=>{
  const b=e.target.closest('button');if(!b||b.disabled||!v)return;
  const tipo=b.dataset.cmd,id=b.dataset.id,controleDado=['modoDado','modoDadoLote','alternarAdicional','escolherRerrolagem','rerrolarDado','rolarDado','continuarDado','cancelarDado'].includes(tipo);
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
  if(tipo==='alternarAdicional'){bus.postMessage({tipo:'alternarAdicional',id});return;}
  if(tipo==='escolherRerrolagem'){rerrolagemAtiva=rerrolagemAtiva===id?null:id;render();return;}
  if(tipo==='rerrolarDado'){if(!rerrolagemAtiva)return;bus.postMessage({tipo,rerrolagem:rerrolagemAtiva});rerrolagemAtiva=null;return;}
  if(tipo==='filtro'){filtro=id;recursoAtivo=null;render();return;}
  if(tipo==='recurso'){recursoAtivo=recursoAtivo===id?null:id;if(recursoAtivo)filtro='Comum';render();return;}
  if(tipo==='selecionarIniciativa'){iniciativasSelecionadas.has(id)?iniciativasSelecionadas.delete(id):iniciativasSelecionadas.add(id);render();return;}
  if(tipo==='selecionarTodasIniciativas'){iniciativasSelecionadas=new Set(v.estado.atores.filter(x=>x.emCombate!==false&&x.init===null).map(x=>x.id));render();return;}
  if(tipo==='limparIniciativas'){iniciativasSelecionadas.clear();render();return;}
  const reacao=tipo==='resolverReacao';
  bus.postMessage({tipo,id,formula:document.querySelector('#formulaDado')?.value,formulas:[...document.querySelectorAll('[data-formula-lote]')].map(x=>x.value),recursosAtivos:[...adicionaisAtivos],atores:tipo==='iniciativas'?[...iniciativasSelecionadas]:undefined,ator:tipo==='iniciativa'?id:undefined,opcao:tipo==='usar'?id:reacao?id:undefined,itemId:tipo==='usarItem'?id:undefined,grupo:b.dataset.grupo,chave:b.dataset.chave,
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
const assinaturaEfeitos=vista=>{
  const ator=vista?.estado?.atores?.find(x=>x.id===vista.atorId);
  return JSON.stringify([vista?.atorId,ator?.efeitosAtivos??[],ator?.concentracaoAtiva??null]);
};
await pronto();bus=await canalHud();bus.onmessage=e=>{if(e.data.vista){const proxima=e.data.vista;if(parte==='efeitos'&&v&&assinaturaEfeitos(v)===assinaturaEfeitos(proxima)){v=proxima;return;}v=proxima;render();}};bus.postMessage({pedir:true});
if(parte==='reacao')setInterval(()=>{const p=v?.estado.reacaoPendente,t=document.querySelector('.timer');if(p&&t)t.textContent=Math.max(0,Math.ceil((p.terminaEm-Date.now())/1000))+' s';},250);

