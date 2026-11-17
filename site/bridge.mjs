import OBR, {buildImage} from './vendor/sdk.mjs';
import {novo, atualizarMagias, aplicar, publico, dadoLocal, validar, normalizarComercio, normalizarZonas, aplicarRerrolagemParcial, dadosRerrolaveis,ajustarFacesMinimasRolagem} from './engine.mjs?v=0.8.39';
import {infoTipoDano,relatoriosDaRolagem} from './damage.mjs?v=0.8.39';
import {compactarEstado} from './catalog.mjs?v=0.8.39';
import {sincronizarCopiasNpc,chaveFichaNpc,chaveBloqueioNpc} from './npc-duplicates.mjs?v=0.8.39';
import {pixelsPorMetro,configurarEscalaCena,migrarEscalaCena} from './scene-scale.mjs?v=0.8.39';
export const ns='aventura-dnd.combate.v1';
const canais={cmd:ns+'/cmd',view:ns+'/view',roll:ns+'/roll-ui',rollReply:ns+'/roll-ui-reply'};
const chaveCena=ns+'/cena';
export const emSala=OBR.isAvailable;
export const pronto=()=>new Promise(resolve=>OBR.onReady(resolve));
const local=()=>new BroadcastChannel(ns+'/'+OBR.room.id);
const hidratar=s=>{
  normalizarComercio(s);normalizarZonas(s);
  for(const a of s.atores??[]){
    try{a.ficha=validar(a.ficha);atualizarMagias(a.ficha);}
    catch(e){throw Error('Falha ao carregar '+(a.nome??a.ficha?.nome??a.id)+': '+e.message);}
  }
  return s;
};
const persistir=(key,s)=>localStorage.setItem(key,JSON.stringify(compactarEstado(s)));
export async function exemplos(){
  return Promise.all(['nikki','soldado'].map(async k=>{
    const r=await fetch('./fichas/'+k+'.json');if(!r.ok)throw Error('Falha ao carregar '+k);return r.json();
  }));
}
export async function grupoJogadores(){
  const ids=['dragoberto','draven-thorne','hannah-montana','loteria','nikki','skimi','zurich'];
  return Promise.all(ids.map(async k=>{
    const r=await fetch('./fichas/'+k+'.json');if(!r.ok)throw Error('Falha ao carregar '+k);return r.json();
  }));
}
export async function conteudoConfigurado(){
  const r=await fetch('./conteudo-configurado.json');if(!r.ok)throw Error('Falha ao carregar o catálogo configurado.');return r.json();
}
export async function demo(onView){
  const key=ns+'/ensaio';
  let s=hidratar(JSON.parse(localStorage.getItem(key)||'null')??novo()),timerReacao;const sync=new BroadcastChannel(ns+'/ensaio-sync');
  const info={id:'mestre',role:'GM',players:[{id:'teste',name:'Jogador de teste'}],tokens:[],modo:'ensaio'};
  const notify=()=>{
    clearTimeout(timerReacao);s.atores.forEach(a=>atualizarMagias(a.ficha));onView(s,info);
    if(s.reacaoPendente){const id=s.reacaoPendente.id;timerReacao=setTimeout(async()=>{
      if(s.reacaoPendente?.id!==id)return;const p=s.reacaoPendente;
      s=await aplicar(s,{tipo:'resolverReacao',ator:p.reator,opcao:null,rev:s.rev,confirmado:true},{role:'GM',id:'mestre'},dadoLocal);
      persistir(key,s);notify();
    },Math.max(0,s.reacaoPendente.terminaEm-Date.now())+80);}
  };
  sync.onmessage=()=>{s=hidratar(JSON.parse(localStorage.getItem(key)||'null')??novo());notify();};
  return {notify,async enviar(c){
    const role=c.comoJogador?'PLAYER':'GM';
    const next=await aplicar(s,c,{role,id:role==='GM'?'mestre':'teste'},dadoLocal);
    persistir(key,next);s=next;notify();sync.postMessage({rev:s.rev});
  }};
}
async function identidade(){
  const [id,role,connectionId,name]=await Promise.all([OBR.player.getId(),OBR.player.getRole(),OBR.player.getConnectionId(),OBR.player.getName()]);
  return {id,role,connectionId,name};
}
function extrairResultado(result){
  const grupo=result.groups?.find(g=>g.diceType==='d20');
  const natural=grupo?.dice?.find(d=>d.kept!==false)?.value;
  const segmentos=String(result.rollSummary??'').split(/\s*\|\s*/).filter(Boolean);
  const resultados=segmentos.length>1?segmentos.map((resumo,i)=>{const m=/=\s*(-?\d+(?:[,.]\d+)?)\s*$/.exec(resumo),g=result.groups?.[i],n=g?.dice?.find(d=>d.kept!==false)?.value;return {total:m?Number(m[1].replace(',','.')):g?.total,natural:Number.isFinite(n)?n:null,resumo,grupos:g?[g]:[]};}):null;
  return {total:result.totalValue,natural:Number.isFinite(natural)?natural:null,formula:result.diceNotation,resumo:result.rollSummary,grupos:result.groups??[],resultados};
}
// #24 Jogador ausente não trava a mesa: quem não está na sala tem a rolagem enviada direto ao mestre,
// e uma janela sem resposta por 40 s passa para o mestre em vez de cancelar a jogada.
const PASSAR_AO_MESTRE_MS=40000;
function dadoSala(usuario,ch,pedidos,mestreId,presentes=null){
  return (formula,meta={})=>new Promise((resolve,reject)=>{
    const pedido=crypto.randomUUID();let destino=meta.destinoId==='GM'?mestreId:(meta.destinoId??usuario.id);
    if(destino!==mestreId&&presentes&&!presentes.has(destino))destino=mestreId;
    const {destinoId:_destinoOculto,roladorNome,...metaPublica}=meta;
    if(meta.tipo==='ataque')delete metaPublica.cd;
    const enviar=async d=>{
      const evento={...d,destino,donoRolagem:roladorNome??usuario.name};
      ch.postMessage({rolagemPublica:evento});
      await OBR.broadcast.sendMessage(canais.roll,evento,{destination:'REMOTE'});
    };
    let fase='ajuste',resultado,recursosAtivos=(meta.adicionais??[]).filter(x=>x.automatico||x.preSelecionado).map(x=>x.id),rerrolagensUsadas=[],metaResolucaoAtual=meta;
    const timer=setTimeout(()=>finalizar(Error('A rolagem não foi confirmada a tempo.')),180000);
    const passar=destino!==mestreId?setTimeout(()=>{
      if(fase!=='ajuste')return;
      Promise.resolve(enviar({tipo:'fechar',pedido})).catch(console.error);
      destino=mestreId;const p=pedidos.get(pedido);if(p)p.destino=mestreId;
      Promise.resolve(enviar({tipo:'ajuste',pedido,...(Array.isArray(formula)?{formulas:formula}:{formula}),recursosAtivos,rerrolagensUsadas,meta:{...metaPublica,titulo:(metaPublica.titulo??'Rolagem')+' · sem resposta, rolando pelo jogador'}})).catch(console.error);
    },PASSAR_AO_MESTRE_MS):null;
    function finalizar(erro,valor){clearTimeout(timer);clearTimeout(passar);pedidos.delete(pedido);Promise.resolve(enviar({tipo:'fechar',pedido})).catch(console.error);erro?reject(erro):resolve(valor);}
    const responder=async resposta=>{
      if(resposta.cancelar)return finalizar(Error('Rolagem cancelada.'));
      if(fase==='resultado'&&resposta.continuar)return finalizar(null,{...resultado,recursosAtivos,rerrolagensUsadas});
      if(fase==='resultado'&&resposta.rerrolar){
        const opcao=meta.rerrolagens?.find(r=>r.id===resposta.rerrolagem);
        if(!opcao||rerrolagensUsadas.includes(opcao.id))return;
        // #60 Rerrolagem parcial (Magia Potencializada): rola só os dados escolhidos no Dice+ e substitui os valores.
        if(opcao.modo==='dados'){
          const escolhidos=Array.isArray(resposta.dados)?resposta.dados:[],disponiveis=dadosRerrolaveis(resultado);
          const trocas=escolhidos.map(x=>disponiveis.find(d=>d.grupo===x.grupo&&d.indice===x.indice)).filter(Boolean);
          const chaves=new Set(trocas.map(d=>d.grupo+':'+d.indice));
          if(!trocas.length||trocas.length!==escolhidos.length||trocas.length>(opcao.limiteDados??3)||chaves.size!==trocas.length||trocas.some(d=>!d.lados)){
            await enviar({tipo:'resultado',pedido,resultado,status:'Escolha dados distintos, respeitando o limite de '+(opcao.limiteDados??3)+'.',recursosAtivos,rerrolagensUsadas,meta:{...metaPublica,adicionaisAtivos:(metaResolucaoAtual?.adicionais??[]).map(x=>x.id)}});
            return;
          }
          fase='rolando';
          try{
            await enviar({tipo:'rolando',pedido,...(Array.isArray(formula)?{formulas:formula}:{formula}),recursosAtivos,rerrolagensUsadas,meta:metaPublica});
            const notacao=trocas.map((d,i)=>'1d'+d.lados+'#'+opcao.nome+' · dado '+(i+1)).join(', '),novo=await executarDice({id:destino,name:roladorNome??usuario.name},notacao);
            const valores=(novo.grupos?.length?novo.grupos.map(g=>g.dice?.find(x=>x.kept!==false)?.value):(novo.resultados??[novo]).map(x=>x.total)).slice(0,trocas.length);
            if(valores.length!==trocas.length||valores.some(v=>!Number.isInteger(v)))throw Error('O Dice+ não devolveu todos os dados rerrolados.');
            resultado=aplicarRerrolagemParcial(resultado,trocas.map((d,i)=>({grupo:d.grupo,indice:d.indice,valor:valores[i]})),opcao.limiteDados??3);
            ajustarFacesMinimasRolagem(resultado,meta.facesMinimasDano);const relatorios=relatoriosDaRolagem(resultado,metaResolucaoAtual);
            if(relatorios.length){resultado={...resultado,relatoriosDano:relatorios};if(resultado.resultados?.length)resultado.resultados=resultado.resultados.map((x,i)=>({...x,relatorioDano:relatorios[i]}));}
            rerrolagensUsadas.push(opcao.id);fase='resultado';
            await enviar({tipo:'resultado',pedido,resultado,status:metaResolucaoAtual?.tipo==='dano'?'Dano total':'',recursosAtivos,rerrolagensUsadas,meta:{...metaPublica,adicionaisAtivos:(metaResolucaoAtual?.adicionais??[]).map(x=>x.id)}});
          }catch(e){fase='resultado';await enviar({tipo:'resultado',pedido,resultado,status:'Rerrolagem falhou: '+e.message,recursosAtivos,rerrolagensUsadas,meta:metaPublica});}
          return;
        }
        rerrolagensUsadas.push(opcao.id);fase='ajuste';
        await enviar({tipo:'ajuste',pedido,destino,...(Array.isArray(formula)?{formulas:formula}:{formula}),recursosAtivos,rerrolagensUsadas,meta:metaPublica});return;
      }
      const bases=Array.isArray(resposta.formulas)?resposta.formulas:typeof resposta.formula==='string'?[resposta.formula]:[];
      recursosAtivos=Array.isArray(resposta.recursosAtivos)?resposta.recursosAtivos:[];
      const extras=(meta.adicionais??[]).filter(x=>recursosAtivos.includes(x.id));
      if(new Set(recursosAtivos).size!==recursosAtivos.length||recursosAtivos.some(id=>!extras.some(x=>x.id===id)))return;
      const expressoesSelecionadas=bases.length===1&&extras.length?(meta.combinarAdicionais?[bases[0]+extras.map(x=>'+'+x.formula).join('')]:[bases[0],...extras.map(x=>x.formula)]):bases;
      const rolarDuas=meta.modificadorDano?.tipo==='rolar_duas_escolher_maior'&&expressoesSelecionadas.length>0&&!Array.isArray(formula);
      const expressoes=rolarDuas?[expressoesSelecionadas[0],expressoesSelecionadas[0],...expressoesSelecionadas.slice(1)]:expressoesSelecionadas;
      if(fase!=='ajuste'||!expressoes.length)return;
      fase='rolando';
      try{
        const grupos=extras.map(extra=>extra.grupoExclusivo).filter(Boolean);
        if(new Set(grupos).size!==grupos.length)throw Error('Só é permitido usar uma manobra por ataque.');
        await enviar({tipo:'rolando',pedido,...(Array.isArray(formula)?{formulas:bases}:{formula:bases[0]}),recursosAtivos,rerrolagensUsadas,meta:metaPublica});
        for(const expressao of expressoes.filter(f=>!/^[-+]?\d+$/.test(f))){const validacao=await validarNotacao(expressao);if(!validacao.valid){fase='ajuste';await enviar({tipo:'erro',pedido,...(Array.isArray(formula)?{formulas:bases}:{formula:bases[0]}),recursosAtivos,rerrolagensUsadas,meta:metaPublica,mensagem:validacao.error||'Expressão inválida.'});return;}}
        const parcelasBase=meta.tipo==='dano-lote'?(meta.parcelasDano??[]):[(meta.parcelasDano?.[0]??{tipo:meta.tipoDano}),...extras.map(x=>({tipo:x.elemento,tags:x.tags}))];
        const parcelasSelecionadas=rolarDuas?[parcelasBase[0],parcelasBase[0],...parcelasBase.slice(1)]:parcelasBase;
        const expressoesDice=['dano','dano-lote'].includes(meta.tipo)?expressoes.map((f,i)=>{const modelo=infoTipoDano(parcelasSelecionadas[i]?.tipo).modelo;return f.replace(/(\d+d(?:4|6|8|10|12|20))(?!\{)/gi,'$1{'+modelo+'}');}):expressoes;
        const tituloInstancia=i=>rolarDuas?(i<2?(meta.modificadorDano?.nome??'Dano da arma')+' · rolagem '+(i+1):extras[i-2]?.nome??'Instância '+(i+1)):(meta.instancias?.[i]?.titulo??(i===0?'Dano base':extras[i-1]?.nome??'Instância '+(i+1)));
        // Parcelas fixas mantêm seu tipo de dano e não viram dados fictícios.
        const indicesRolados=expressoesDice.map((f,i)=>i).filter(i=>!/^[-+]?\d+$/.test(expressoesDice[i]));
        const expressoesRoladas=indicesRolados.map(i=>expressoesDice[i]);
        const notacao=expressoesRoladas.length>1?indicesRolados.map(i=>expressoesDice[i]+'#'+tituloInstancia(i)).join(', '):expressoesRoladas[0];
        resultado=notacao?await executarDice({id:destino,name:roladorNome??usuario.name},notacao):{total:0,grupos:[],resumo:'0'};
        if(indicesRolados.length!==expressoesDice.length){
          const rolados=resultado.resultados??[resultado];let indice=0;
          const partes=expressoesDice.map(f=>/^[-+]?\d+$/.test(f)?{total:Number(f),formula:f,resumo:f,grupos:[]}:rolados[indice++]);
          if(partes.some(p=>!p))throw Error('O Dice+ não devolveu todas as parcelas da rolagem.');
          resultado={...resultado,total:partes.reduce((n,p)=>n+p.total,0),resultados:partes,resumo:partes.map(p=>p.resumo??String(p.total)).join(' + ')};
        }
        if(!rolarDuas&&resultado.grupos?.length)resultado.mapaGrupos=indicesRolados.flatMap(i=>Array.from({length:(String(expressoesDice[i]).match(/\d*d\d+/gi)??[]).length},()=>i));
        if(rolarDuas){
          const alternativas=(resultado.resultados??[]).slice(0,2);
          for(const alternativa of alternativas)ajustarFacesMinimasRolagem(alternativa,meta.facesMinimasDano);
          const melhor=alternativas[0]?.total>=alternativas[1]?.total?alternativas[0]:alternativas[1],restantes=(resultado.resultados??[]).slice(2);
          if(!melhor)throw Error('O Dice+ não devolveu as duas rolagens de '+meta.modificadorDano.nome+'.');
          resultado={...resultado,...melhor,total:melhor.total+restantes.reduce((n,x)=>n+x.total,0),resultados:[melhor,...restantes],alternativasDano:alternativas,modificadorDano:meta.modificadorDano,resumo:melhor.resumo};
        }
        if(Array.isArray(formula)&&expressoes.length===1&&!resultado.resultados)resultado={...resultado,resultados:[{total:resultado.total,natural:resultado.natural,formula:resultado.formula,resumo:resultado.resumo,grupos:resultado.grupos}]};
        const metaResolucao={...meta,adicionais:extras};metaResolucaoAtual=metaResolucao;
        ajustarFacesMinimasRolagem(resultado,meta.facesMinimasDano);
        const relatoriosDano=relatoriosDaRolagem(resultado,metaResolucao);
        if(relatoriosDano.length){
          resultado={...resultado,relatoriosDano};
          if(resultado.resultados?.length)resultado.resultados=resultado.resultados.map((x,i)=>({...x,relatorioDano:relatoriosDano[i]}));
        }
        const status=meta.tipo==='ataque'?(resultado.natural===1?'Falha crítica':resultado.natural===20?'Acerto crítico':resultado.total>=meta.cd?'Acerto':'Falha'):
          meta.atributo==='morte'&&resultado.natural===20?'Recuperou 1 PV':
          meta.atributo==='morte'&&resultado.natural===1?'Duas falhas':
          ['salvaguarda','teste'].includes(meta.tipo)&&Number.isFinite(meta.cd)?(resultado.total>=meta.cd?'Sucesso':'Falha'):meta.tipo==='dano'?'Dano total':meta.tipo==='dano-lote'?'Danos resolvidos':meta.tipo==='iniciativa_lote'?'Iniciativas roladas':meta.tipo==='iniciativa'?'Iniciativa':'';
        fase='resultado';await enviar({tipo:'resultado',pedido,resultado,status,recursosAtivos,rerrolagensUsadas,meta:{...metaPublica,adicionaisAtivos:extras.map(x=>x.id)}});
      }catch(e){fase='ajuste';await enviar({tipo:'erro',pedido,...(Array.isArray(formula)?{formulas:bases}:{formula:bases[0]}),recursosAtivos,rerrolagensUsadas,meta:metaPublica,mensagem:e.message});}
    };
    pedidos.set(pedido,{destino,responder});
    Promise.resolve(enviar({tipo:'ajuste',pedido,...(Array.isArray(formula)?{formulas:formula}:{formula}),recursosAtivos,rerrolagensUsadas,meta:metaPublica})).catch(finalizar);
  });
}
function validarNotacao(notation){
  return new Promise(resolve=>{
    const requestId=crypto.randomUUID();let encerrado=false;
    const done=v=>{if(encerrado)return;encerrado=true;clearTimeout(timer);off();resolve(v);};
    const off=OBR.broadcast.onMessage('dice-plus/validate-notation',e=>{if(e.data?.requestId===requestId&&'valid'in e.data)done({valid:e.data.valid,error:e.data.error?.message});});
    const timer=setTimeout(()=>done({valid:false,error:'Dice+ não respondeu à validação.'}),1800);
    OBR.broadcast.sendMessage('dice-plus/validate-notation',{requestId,notation,timestamp:Date.now()},{destination:'ALL'}).catch(e=>done({valid:false,error:e.message}));
  });
}
function executarDice(usuario,formula){
  return new Promise((resolve,reject)=>{
    const rollId=crypto.randomUUID();
    const finish=(err,result)=>{clearTimeout(timer);off();offErr();err?reject(Error(err)):resolve(extrairResultado(result));};
    const off=OBR.broadcast.onMessage(ns+'/roll-result',e=>{
      if(e.data?.rollId===rollId && Number.isFinite(e.data.result?.totalValue))finish('',e.data.result);
    });
    const offErr=OBR.broadcast.onMessage(ns+'/roll-error',e=>{if(e.data?.rollId===rollId)finish('Dice+ recusou a rolagem.');});
    const timer=setTimeout(()=>finish('Dice+ não respondeu. Confira a extensão antes de tentar novamente.'),20000);
    OBR.broadcast.sendMessage('dice-plus/roll-request',{rollId,playerId:usuario.id,playerName:usuario.name,source:ns,timestamp:Date.now(),diceNotation:formula,rollTarget:'dm',showResults:false},{destination:'ALL'}).catch(e=>finish(e.message));
  });
}
// M06 (#45): o mestre cria o token de cada entidade invocada (id fixo, sem duplicar) e apaga o de quem acabou.
const prefixoInvocacao='laarte-invocacao-';
async function sincronizarTokensInvocacao(s,pixelsMetro){
  const itens=await OBR.scene.items.getItems(i=>String(i.id).startsWith(prefixoInvocacao));
  const lado=1254,novos=[];
  for(const a of s.atores.filter(x=>x.invocacao&&!x.token)){
    const id=prefixoInvocacao+a.id;a.token=id;
    if(itens.some(i=>i.id===id))continue;
    const escala=a.ficha.tamanho==='miudo'?.5:1;
    novos.push(buildImage({url:new URL('./'+(a.invocacao.imagem??'assets/tokens/invocacao-padrao.png'),location.href).href,mime:'image/png',width:lado,height:lado},{dpi:lado/escala,offset:{x:lado/2,y:lado/2}})
      .id(id).name(a.nome).layer('CHARACTER').position({x:a.x*pixelsMetro,y:a.y*pixelsMetro}).build());
  }
  if(novos.length)await OBR.scene.items.addItems(novos);
  const orfaos=itens.filter(i=>!s.atores.some(a=>a.token===i.id)).map(i=>i.id);
  if(orfaos.length)await OBR.scene.items.deleteItems(orfaos);
}
async function getTokens(){
  return (await OBR.scene.items.getItems()).filter(x=>x.type==='IMAGE' && x.layer==='CHARACTER').map(x=>({id:x.id,name:x.name,x:x.position.x,y:x.position.y,visible:x.visible}));
}
export async function host(){
  await pronto();const eu=await identidade();if(eu.role!=='GM')return;
  const ch=local();let fila=Promise.resolve(),timerReacao,cenaCalibrada;const pedidos=new Map();
  const serial=fn=>{fila=fila.then(fn).catch(e=>console.error(e));};
  async function carregar(){
    if(!await OBR.scene.isReady())throw Error('Abra uma cena primeiro.');
    const meta=await OBR.scene.getMetadata();
    const autoridade=ns+'/mestre';
    if(meta[autoridade]&&meta[autoridade]!==eu.id)throw Error('O encontro pertence ao mestre que o preparou.');
    let id=meta[chaveCena];
    if(!id||!meta[autoridade]){
      const gms=[eu,...await OBR.party.getPlayers()].filter(p=>p.role==='GM').map(p=>p.id).sort();
      if(!meta[autoridade]&&gms[0]!==eu.id)throw Error('Outro mestre conectado conduz a preparação.');
      id=id||crypto.randomUUID();await OBR.scene.setMetadata({[chaveCena]:id,[autoridade]:eu.id});
    }
    const key=ns+'/'+OBR.room.id+'/'+id;
    const s=hidratar(JSON.parse(localStorage.getItem(key)||'null')??novo());
    if(cenaCalibrada!==id){await configurarEscalaCena(OBR.scene.grid);cenaCalibrada=id;}
    if(migrarEscalaCena(s))persistir(key,s);
    return {key,s};
  }
  async function mostrar(s){
    clearTimeout(timerReacao);
    if(s.reacaoPendente){
      const id=s.reacaoPendente.id,espera=Math.max(0,s.reacaoPendente.terminaEm-Date.now());
      timerReacao=setTimeout(()=>serial(async()=>{
        const atual=await carregar(),p=atual.s.reacaoPendente;
        if(p?.id===id)await executar({tipo:'resolverReacao',ator:p.reator,opcao:null,rev:atual.s.rev,confirmado:true},eu,()=>{});
      }),espera+80);
    }
    const [players,tokens]=await Promise.all([OBR.party.getPlayers(),getTokens()]);
    ch.postMessage({vista:s,info:{...eu,modo:'sala',players,tokens}});
    const v=publico(s);
    // Ocultar atores vinculados a tokens invisíveis também no histórico, que é textual.
    const ocultos=s.atores.filter(a=>a.token&&!tokens.some(t=>t.id===a.token && t.visible));
    if(ocultos.length){
      const ids=new Set(ocultos.map(a=>a.id));const ativo=v.ordem[v.vez];
      v.atores=v.atores.filter(a=>!ids.has(a.id));v.ordem=v.ordem.filter(id=>!ids.has(id));v.vez=v.ordem.indexOf(ativo);v.historico=[];
    }
    const dados=JSON.stringify(v), seq=crypto.randomUUID();
    for(let i=0;i<dados.length;i+=7000)await OBR.broadcast.sendMessage(canais.view,{seq,i,final:i+7000>=dados.length,parte:dados.slice(i,i+7000)},{destination:'REMOTE'});
  }
  async function sincronizarNpcs(){
    const {key,s}=await carregar();
    const [itens,dpi]=await Promise.all([OBR.scene.items.getItems(),OBR.scene.grid.getDpi()]);
    const {novos,alteracoes}=sincronizarCopiasNpc(s,itens,pixelsPorMetro(dpi));
    if(novos.length){
      s.historico.unshift(novos.length+' cópia(s) de NPC vinculada(s) automaticamente.');
      persistir(key,s);
    }
    if(alteracoes.length){
      const porToken=new Map(alteracoes.map(a=>[a.tokenId,a]));
      await OBR.scene.items.updateItems([...porToken.keys()],items=>{
        for(const item of items){
          const ajuste=porToken.get(item.id);
          item.metadata??={};
          if(ajuste.marcador)item.metadata[chaveFichaNpc]=ajuste.marcador;
          else delete item.metadata[chaveFichaNpc];
          if(ajuste.nome)item.name=ajuste.nome;
          if(ajuste.liberar!==undefined){item.locked=ajuste.liberar;delete item.metadata[chaveBloqueioNpc];}
        }
      });
    }
    return s;
  }
  async function executar(c,u,reply){
    try{
      const {key,s}=await carregar();
      if(c.tipo==='sync'){await mostrar(await sincronizarNpcs());await reply({});return;}
      const tokens=await getTokens(), dpi=await OBR.scene.grid.getDpi(),pixelsMetro=pixelsPorMetro(dpi);
      if(c.tipo==='criarPeca'){
        const a=s.atores.find(x=>x.id===c.ator);
        if(u.role!=='GM'||c.rev!==s.rev||s.fase!=='preparo'||!a||a.token)throw Error('Escolha uma ficha sem vínculo na preparação.');
        const guarda=a.ficha.id==='soldado',lado=guarda?1254:64;
        const asset=guarda?'./fichas/soldado.png':'./icone.svg';
        const pos=await OBR.viewport.inverseTransformPoint({x:await OBR.viewport.getWidth()/2,y:await OBR.viewport.getHeight()/2});
        const token=buildImage({url:new URL(asset,location.href).href,mime:guarda?'image/png':'image/svg+xml',width:lado,height:lado},{dpi:lado,offset:{x:lado/2,y:lado/2}})
          .name(a.nome).layer('CHARACTER').position({x:Math.round(pos.x/dpi+s.atores.indexOf(a))*dpi,y:Math.round(pos.y/dpi)*dpi}).build();
        await OBR.scene.items.addItems([token]);
        a.token=token.id;a.x=token.position.x/pixelsMetro;a.y=token.position.y/pixelsMetro;s.rev++;
        persistir(key,s);await mostrar(await sincronizarNpcs());await reply({});return;
      }
      if(c.tipo==='iniciar' && s.atores.filter(a=>a.emCombate!==false).some(a=>!tokens.some(t=>t.id===a.token)))throw Error('Antes de iniciar, crie ou vincule um token para cada participante do combate.');
      if(c.tipo==='vincular' && s.fase!=='preparo' && s.atores.find(a=>a.id===c.ator)?.token!==c.token)throw Error('Troque a peça na preparação. O controlador pode ser alterado em combate.');
      if(c.tipo==='vincular'){
        if(c.token&&!tokens.some(t=>t.id===c.token))throw Error('Token ausente da camada Personagem.');
        if(c.dono&&!(await OBR.party.getPlayers()).some(p=>p.id===c.dono&&p.role==='PLAYER'))throw Error('Jogador desconectado.');
      }
      for(const a of s.atores){
        const t=tokens.find(t=>t.id===a.token);
        if(t){a.x=t.x/pixelsMetro;a.y=t.y/pixelsMetro;}
      }
      if(c.tipo==='usar'||c.tipo==='mover'){
        const ator=s.atores.find(a=>a.id===c.ator);
        if(!tokens.some(t=>t.id===ator?.token))throw Error('Vincule o personagem a um token da cena.');
        if(c.alvos!==undefined&&(!Array.isArray(c.alvos)||!c.alvos.every(id=>{
          const p=s.atores.find(x=>x.id===id);
          return p&&tokens.some(t=>t.id===p.token&&(u.role==='GM'||t.visible));
        })))throw Error('Um dos alvos está indisponível.');
        const alvo=s.atores.find(a=>a.id===c.alvo);
        if(alvo&&!tokens.some(t=>t.id===alvo.token&&(u.role==='GM'||t.visible)))throw Error('Alvo indisponível.');
      }
      const faseAntes=s.fase;
      const presentes=new Set([eu.id,...(await OBR.party.getPlayers()).map(p=>p.id)]);
      const next=await aplicar(s,{...c,ensaio:false},u,dadoSala(u,ch,pedidos,eu.id,presentes));
      if(c.tipo==='vincular'){const a=next.atores.find(x=>x.id===c.ator),t=tokens.find(x=>x.id===a.token);if(t){a.x=t.x/pixelsMetro;a.y=t.y/pixelsMetro;}}
      if(c.tipo==='iniciar'||c.tipo==='encerrar'){
        const ids=next.atores.filter(a=>a.token&&(c.tipo==='encerrar'||a.emCombate!==false)).map(a=>a.token);
        if(ids.length)await OBR.scene.items.updateItems(ids,items=>{
          for(const item of items){
            const k=ns+'/bloqueio-anterior';
            if(c.tipo==='iniciar'){if(!(k in item.metadata))item.metadata[k]=item.locked;item.locked=true;}
            else if(k in item.metadata){item.locked=Boolean(item.metadata[k]);delete item.metadata[k];}
          }
        });
      }
      if(c.tipo==='alternarCombate'&&faseAntes!=='preparo'){
        const a=next.atores.find(x=>x.id===c.ator);
        if(a?.token)await OBR.scene.items.updateItems([a.token],items=>{for(const item of items){
          const k=ns+'/bloqueio-anterior';
          if(a.emCombate!==false){if(!(k in item.metadata))item.metadata[k]=item.locked;item.locked=true;}
          else if(k in item.metadata){item.locked=Boolean(item.metadata[k]);delete item.metadata[k];}
        }});
      }
      const movidos=next.atores.filter(a=>{const antes=s.atores.find(x=>x.id===a.id);return a.token&&antes&&(a.x!==antes.x||a.y!==antes.y);});
      if(movidos.length)await OBR.scene.items.updateItems(movidos.map(a=>a.token),items=>{for(const t of items){const a=movidos.find(x=>x.token===t.id);if(a)t.position={x:a.x*pixelsMetro,y:a.y*pixelsMetro};}});
      await sincronizarTokensInvocacao(next,pixelsMetro); // M06
      persistir(key,next);
      const estadoMostrar=['vincular','remover'].includes(c.tipo)?await sincronizarNpcs():next;
      await mostrar(estadoMostrar);await reply({});
    }catch(e){await reply({erro:e.message});}
  }
  ch.onmessage=e=>{if(e.data.rollReply&&pedidos.has(e.data.rollReply.pedido))pedidos.get(e.data.rollReply.pedido).responder(e.data.rollReply);else if(e.data.comando)serial(()=>executar(e.data.comando,eu,r=>ch.postMessage({...r,resposta:e.data.req})));};
  OBR.broadcast.onMessage(canais.cmd,e=>serial(async()=>{
    const u=(await OBR.party.getPlayers()).find(x=>x.connectionId===e.connectionId);
    if(!u||u.role!=='PLAYER')return;
    await executar(e.data.comando,u,r=>OBR.broadcast.sendMessage(ns+'/resposta',{...r,resposta:e.data.req},{destination:'REMOTE'}));
  }));
  OBR.broadcast.onMessage(canais.rollReply,async e=>{
    const p=pedidos.get(e.data?.pedido),jogador=(await OBR.party.getPlayers()).find(x=>x.connectionId===e.connectionId);
    if(p&&jogador?.id===p.destino)p.responder(e.data);
  });
  const sync=()=>serial(async()=>{if(await OBR.scene.isReady())await mostrar(await sincronizarNpcs());});
  let assinaturaItens='',sincronizacaoAgendada=false;
  OBR.scene.items.onChange(itens=>{
    const assinatura=JSON.stringify(itens.filter(i=>i.type==='IMAGE'&&i.layer==='CHARACTER').map(i=>[i.id,i.metadata?.[chaveFichaNpc]]).sort((a,b)=>a[0].localeCompare(b[0])));
    if(assinatura===assinaturaItens)return;
    assinaturaItens=assinatura;
    if(sincronizacaoAgendada)return;
    sincronizacaoAgendada=true;
    requestAnimationFrame(()=>serial(async()=>{
      sincronizacaoAgendada=false;
      if(await OBR.scene.isReady())await mostrar(await sincronizarNpcs());
    }));
  });
  OBR.party.onChange(sync);OBR.scene.onReadyChange(ready=>{if(ready)sync();else ch.postMessage({vista:novo(),info:{...eu,modo:'sem cena',players:[],tokens:[]}});});
  const filtro={roles:['GM'],min:1,max:1,every:[{key:'layer',value:'CHARACTER'}]};
  await OBR.contextMenu.remove(ns+'/vinculo').catch(()=>{});
  await OBR.contextMenu.create({id:ns+'/vinculo',icons:[{icon:new URL('./icone.svg',location.href).href,label:'La Arte · vincular ou abrir ficha',filter:filtro}],
    embed:{url:new URL('./contexto.html?v=0.8.39',location.href).href,height:420},
    onClick:async ctx=>{await OBR.player.select([ctx.items[0].id],true);await OBR.action.open();}});
  sync();
}
export async function sala(onView){
  await pronto();const eu=await identidade();const ch=local(),espera=new Map();
  function receber(d){if(!d.resposta)return;const cb=espera.get(d.resposta);if(cb){espera.delete(d.resposta);cb(d.erro);}}
  let pacote;
  const mestre=async e=>(await OBR.party.getPlayers()).some(p=>p.role==='GM'&&p.connectionId===e.connectionId);
  let fila=Promise.resolve();
  if(eu.role==='GM')ch.onmessage=e=>{receber(e.data);if(e.data.vista)onView(e.data.vista,e.data.info);};
  else{
    OBR.broadcast.onMessage(ns+'/resposta',async e=>{if(await mestre(e))receber(e.data);});
    OBR.broadcast.onMessage(canais.view,e=>{fila=fila.then(async()=>{
      if(!await mestre(e))return;
      const {seq,i,final,parte}=e.data;
      if(i===0)pacote={seq,texto:''};
      if(pacote?.seq!==seq||pacote.texto.length!==i)return;
      pacote.texto+=parte;
      if(final){onView(JSON.parse(pacote.texto),{...eu,modo:'sala',players:[],tokens:[]});pacote=null;}
    }).catch(console.error);});
  }
  const send=(comando,req)=>eu.role==='GM'?ch.postMessage({comando,req}):OBR.broadcast.sendMessage(canais.cmd,{comando,req},{destination:'REMOTE'});
  const enviar=async c=>{
    const req=crypto.randomUUID();
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{espera.delete(req);reject(Error(c.tipo==='sync'?'Sem resposta do controlador da sala. Confira se há um mestre conectado e uma cena aberta.':'Sem confirmação do mestre. Atualize antes de repetir.'));},c.tipo==='sync'?10000:60000);
      espera.set(req,err=>{clearTimeout(timer);err?reject(Error(err)):resolve();});
      Promise.resolve(send(c,req)).catch(e=>{clearTimeout(timer);espera.delete(req);reject(e);});
    });
  };
  return {notify:()=>enviar({tipo:'sync'}),enviar,observarSelecao:fn=>OBR.player.onChange(p=>fn(p.selection?.[0])),selecionado:async()=>(await OBR.player.getSelection())?.[0]};
}

export async function interfaceRolagens(onEvent){
  await pronto();const eu=await identidade(),ch=local();
  if(eu.role==='GM')ch.addEventListener('message',e=>{const d=e.data?.rolagemPublica;if(d?.pedido)onEvent(d);});
  else OBR.broadcast.onMessage(canais.roll,async e=>{
    const mestre=(await OBR.party.getPlayers()).some(p=>p.role==='GM'&&p.connectionId===e.connectionId);
    if(mestre&&e.data?.pedido){
      // #24 Aviso para o jogador quando uma salvaguarda chega para ele.
      if(e.data.tipo==='ajuste'&&e.data.destino===eu.id&&e.data.meta?.tipo==='salvaguarda')Promise.resolve(OBR.notification.show('Salvaguarda para você: '+(e.data.meta.titulo??''),'WARNING')).catch(()=>{});
      onEvent(e.data);
    }
  });
  return resposta=>eu.role==='GM'?ch.postMessage({rollReply:resposta}):OBR.broadcast.sendMessage(canais.rollReply,resposta,{destination:'REMOTE'});
}

