import {hitboxToken} from './target-geometry.mjs?v=0.8.77';
import {visualTokenFicha} from './tokens-fichas.mjs?v=0.8.77';
import {criarSincronizadorTokensReanimados} from './reanimacao-token-sync.mjs?v=0.8.77';
import {criarSincronizadorRecipientes} from './loot-sync.mjs?v=0.8.77';
import {idSelecaoRecipiente,pontosInteracaoRecipiente,chaveSelecaoRecipiente} from './loot-geometry.mjs?v=0.8.77';
import OBR, {buildImage,buildCurve} from './vendor/sdk.mjs';
import {cancelarMovimentoDinamico,novo, atualizarMagias, aplicar, publico, dadoLocal, validar, normalizarComercio, normalizarZonas, aplicarRerrolagemParcial, dadosRerrolaveis,ajustarFacesMinimasRolagem} from './engine.mjs?v=0.8.77';
import {infoTipoDano,relatoriosDaRolagem} from './damage.mjs?v=0.8.77';
import {compactarEstado,compactarFicha} from './catalog.mjs?v=0.8.77';
import {sincronizarCopiasNpc,chaveFichaNpc,chaveBloqueioNpc} from './npc-duplicates.mjs?v=0.8.77';
import {pixelsPorMetro,configurarEscalaCena,migrarEscalaCena} from './scene-scale.mjs?v=0.8.77';
import {consultarComReenvio,receptorDeEstado,fatiarParaBroadcast,deltaDeEstado,aplicarDeltaEstado} from './room-sync.mjs?v=0.8.77';
import {recuperarEstado,excluirFichaIsolada} from './state-recovery.mjs?v=0.8.77';
import {identificarParcelas,destinoDicePublico} from './roll-sources.mjs?v=0.8.77';
import {checkpointDinamico,novoRegistroExecucoes,admitirExecucao,iniciarExecucao,podeIniciarExecucao,avancarExecucao,aplicarResultadoExecucao,validarDependenciasExecucao,encerrarExecucao,cancelarExecucao,resumoExecucao,encerrada} from './executions.mjs?v=0.8.77';
import {rolagemParaUsuario} from './roll-visibility.mjs?v=0.8.77';
import {adquirirControleLocal} from './controller-lock.mjs?v=0.8.77';
export const ns='aventura-dnd.combate.v1';
let seloControle;
const canais={cmd:ns+'/cmd',view:ns+'/view',roll:ns+'/roll-ui',rollReply:ns+'/roll-ui-reply'};
async function enviarEventoRolagem(evento){
  if(seloControle)evento={...evento,cena:seloControle.cena,geracao:seloControle.geracao};
  const texto=JSON.stringify(evento);
  if(new TextEncoder().encode(texto).length<12000)return OBR.broadcast.sendMessage(canais.roll,evento,{destination:'REMOTE'});
  const seq=crypto.randomUUID(),partes=fatiarParaBroadcast(texto);
  for(const [n,{i,parte}] of partes.entries())await OBR.broadcast.sendMessage(canais.roll,{fragmento:true,seq,i,parte,final:n===partes.length-1,cena:seloControle?.cena,geracao:seloControle?.geracao},{destination:'REMOTE'});
}
const chaveCena=ns+'/cena';
async function controlaLocal(eu){const meta=await OBR.scene.getMetadata(),controle=meta[ns+'/controlador'];return eu.role==='GM'&&(!meta[ns+'/mestre']||meta[ns+'/mestre']===eu.id)&&(!controle||controle.connectionId===eu.connectionId);}
async function mensagemDoControlador(e){
 const meta=await OBR.scene.getMetadata(),p=(await OBR.party.getPlayers()).find(p=>p.role==='GM'&&p.connectionId===e.connectionId);
 const controle=meta[ns+'/controlador'];
 return !!p&&(!meta[ns+'/mestre']||meta[ns+'/mestre']===p.id)&&(!controle||controle.connectionId===e.connectionId)&&(!e.data?.geracao||e.data.geracao===controle?.geracao);
}
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
const registrosExecucao=new Map();
const persistir=(key,s)=>{const out=compactarEstado(s);delete out.__execucoes;const registro=registrosExecucao.get(key);if(registro)out.__execucoes=registro;localStorage.setItem(key,JSON.stringify(out));};
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
  const notify=async()=>{
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
function dadoSala(usuario,ch,pedidos,mestreId,presentes=null,contexto={},runtime={}){
  return (formula,meta={})=>new Promise((resolve,reject)=>{
    const pedido=runtime.pedido??crypto.randomUUID();let destino=runtime.snapshot?.destino??(meta.destinoId==='GM'?mestreId:(meta.destinoId??usuario.id));
    if(destino!==mestreId&&presentes&&!presentes.has(destino))destino=mestreId;
    const {destinoId:_destinoOculto,roladorNome,...metaPublica}=meta;
    if(meta.tipo==='ataque')delete metaPublica.cd;
    let encerrado=false,ultimoEvento,etapaVersao=runtime.snapshot?.etapaVersao??0;
    const enviar=async d=>{
      if(encerrado&&d.tipo!=='fechar')return;
      const repeticao=d===ultimoEvento||!ultimoEvento&&d.etapaVersao&&d.tipo===runtime.snapshot?.tipo;
      if(!repeticao)etapaVersao++;
      const respostaPropria=meta.tipo==='salvaguarda';
      const evento={...d,...contexto,etapaVersao,atividadeId:respostaPropria?pedido:contexto.atividadeId,atividadeOrigemId:respostaPropria?contexto.atividadeId:undefined,atorId:respostaPropria?meta.atorRespondenteId??contexto.atorId:contexto.atorId,destino,donoRolagem:roladorNome??usuario.name};
      ultimoEvento=evento;runtime.salvar?.(evento);
      ch.postMessage({rolagemPublica:evento});
      await enviarEventoRolagem(rolagemParaUsuario(evento,{role:'PLAYER'}));
    };
    let fase=runtime.snapshot?.tipo==='resultado'?'resultado':runtime.snapshot?.tipo==='rolando'||runtime.snapshot?.tipo==='indeterminada'?'indeterminada':'ajuste',resultado=runtime.snapshot?.resultado,recursosAtivos=runtime.snapshot?.recursosAtivos??(meta.adicionais??[]).filter(x=>x.automatico||x.preSelecionado).map(x=>x.id),rerrolagensUsadas=runtime.snapshot?.rerrolagensUsadas??[],metaResolucaoAtual={...meta,adicionais:(meta.adicionais??[]).filter(x=>recursosAtivos.includes(x.id))};
    if(fase==='indeterminada')destino=mestreId;
    const timer=setTimeout(()=>{if(runtime.salvar){OBR.notification.show('Há uma resposta pendente há mais de 3 minutos. Abra as Atividades da mesa para assumir ou cancelar.','WARNING').catch(()=>{});}else finalizar(Error('A rolagem não foi confirmada a tempo.'));},180000);
    const passar=destino!==mestreId?setTimeout(()=>{
      if(fase!=='ajuste')return;
      Promise.resolve(enviar({tipo:'fechar',pedido})).catch(console.error);
      destino=mestreId;const p=pedidos.get(pedido);if(p)p.destino=mestreId;
      Promise.resolve(enviar({tipo:'ajuste',pedido,...(Array.isArray(formula)?{formulas:formula}:{formula}),recursosAtivos,rerrolagensUsadas,meta:{...metaPublica,titulo:(metaPublica.titulo??'Rolagem')+' · sem resposta, rolando pelo jogador'}})).catch(console.error);
    },PASSAR_AO_MESTRE_MS):null;
    function finalizar(erro,valor){if(encerrado)return;runtime.concluir?.(erro,valor);encerrado=true;clearTimeout(timer);clearTimeout(passar);pedidos.delete(pedido);Promise.resolve(enviar({tipo:'fechar',pedido})).catch(console.error);erro?reject(erro):resolve(valor);}
    const responder=async(resposta,autor={role:'GM'})=>{
      if(encerrado)return;
      if(resposta.etapaVersao!==etapaVersao)return;
      if(resposta.manual&&autor.role!=='GM')return;
      if(resposta.cancelar&&runtime.cancelar&&!runtime.cancelar(autor))return;
      if(resposta.assumir){destino=mestreId;const p=pedidos.get(pedido);if(p)p.destino=mestreId;await enviar({...ultimoEvento,tipo:fase==='indeterminada'?'indeterminada':fase,assumida:true});return;}
      if(fase==='indeterminada'&&resposta.manual){
        const xs=resposta.manual.totais,extras=(meta.adicionais??[]).filter(x=>recursosAtivos.includes(x.id)),bases=Array.isArray(formula)?formula:[formula],n=meta.combinarAdicionais?bases.length:bases.length+extras.length;
        if(!Array.isArray(xs)||xs.length!==n||xs.some(x=>!Number.isFinite(x)||Math.abs(x)>100000))throw Error('Informe todos os resultados manuais.');
        const natural=resposta.manual.natural;if((bases.length===1&&/d20/i.test(String(bases[0]))&&natural===undefined)||natural!==undefined&&(!Number.isInteger(natural)||natural<1||natural>20))throw Error('Informe a face natural do d20 entre 1 e 20.');
        resultado={total:xs.reduce((a,b)=>a+b,0),natural,formula,resumo:'Resultado manual do mestre',manual:true,resultados:xs.map(total=>({total,manual:true}))};
        if(['dano','dano-lote'].includes(meta.tipo))resultado=identificarParcelas(resultado,formula,extras);
        const relatorios=relatoriosDaRolagem(resultado,{...meta,adicionais:extras});if(relatorios.length)resultado.relatoriosDano=relatorios;
        fase='resultado';await enviar({tipo:'resultado',pedido,resultado,recursosAtivos,rerrolagensUsadas,status:'Resultado manual do mestre',meta:{...metaPublica,adicionaisAtivos:extras.map(x=>x.id)}});return;
      }
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
            const notacao=trocas.map((d,i)=>'1d'+d.lados+'#'+opcao.nome+' · dado '+(i+1)).join(', '),novo=await executarDice({id:destino,name:roladorNome??usuario.name,role:destino===mestreId?'GM':'PLAYER',secreta:meta.secreta===true},notacao);
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
        resultado=notacao?await executarDice({id:destino,name:roladorNome??usuario.name,role:destino===mestreId?'GM':'PLAYER',secreta:meta.secreta===true},notacao):{total:0,grupos:[],resumo:'0'};
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
        if(['dano','dano-lote'].includes(meta.tipo))resultado=identificarParcelas(resultado,Array.isArray(formula)?bases:bases[0],extras);
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
    pedidos.set(pedido,{destino,responder,fechar:()=>finalizar(Error('Rolagem cancelada.')),suspender:()=>{encerrado=true;clearTimeout(timer);clearTimeout(passar);pedidos.delete(pedido);resolve();},reexibir:(remoto=true)=>ultimoEvento&&(remoto?enviar(ultimoEvento):ch.postMessage({rolagemPublica:ultimoEvento}))});
    const inicial=runtime.snapshot?{...runtime.snapshot,tipo:fase==='indeterminada'?'indeterminada':fase,pedido}:{tipo:'ajuste',pedido,...(Array.isArray(formula)?{formulas:formula}:{formula}),recursosAtivos,rerrolagensUsadas,meta:metaPublica};
    Promise.resolve(enviar(inicial)).catch(finalizar);
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
    OBR.broadcast.sendMessage('dice-plus/roll-request',{rollId,playerId:usuario.id,playerName:usuario.name,source:ns,timestamp:Date.now(),diceNotation:formula,rollTarget:destinoDicePublico(usuario),showResults:false},{destination:'ALL'}).catch(e=>finish(e.message));
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
  return (await OBR.scene.items.getItems()).filter(x=>x.type==='IMAGE' && x.layer==='CHARACTER').map(x=>({id:x.id,name:x.name,x:x.position.x,y:x.position.y,visible:x.visible,hitbox:hitboxToken(x)}));
}
const prefixoRecipiente='laarte-recipiente-';
const sincronizarTokensRecipientes=criarSincronizadorRecipientes({items:OBR.scene.items,buildImage,buildCurve,baseUrl:location.href});
const sincronizarTokensReanimados=criarSincronizadorTokensReanimados({items:OBR.scene.items,baseUrl:location.href});
export async function host(){
  await pronto();const eu=await identidade();if(eu.role!=='GM')return;
  if(await OBR.scene.isReady()){const meta=await OBR.scene.getMetadata();if(meta[ns+'/mestre']&&meta[ns+'/mestre']!==eu.id)return;}
  if(!await adquirirControleLocal(ns+'/controlador/'+OBR.room.id))return;
  const geracao=crypto.randomUUID();let cenaControle;
  const ch=local();let fila=Promise.resolve(),timerReacao,cenaCalibrada,timerProps,pausaPropsAte=0,ultimoAvisoProps=0;const pedidos=new Map();
  const respostasExecucao=new Map(),rolagensEmCurso=new Set();let chaveAtiva;
  const avaliadas=new Map();
  let ultimaVistaPublica,filaDeVistas=Promise.resolve();const confirmacoesVista=new Map();
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
    if(chaveAtiva&&chaveAtiva!==key){
      // O diário já está salvo. Encerrar só as janelas/callbacks da cena antiga;
      // voltar a ela restaura o pedido conhecido, sem uma segunda rolagem.
      for(const p of pedidos.values())p.suspender?.();
      rolagensEmCurso.clear();avaliadas.clear();registrosExecucao.delete(chaveAtiva);
      for(const [id,reply] of respostasExecucao){reply({erro:'Jogada pausada na cena anterior. Retorne àquela cena para retomá-la.'});respostasExecucao.delete(id);}
      ultimaVistaPublica=undefined;confirmacoesVista.clear();
    }
    if(cenaControle!==id){
      const anterior=meta[ns+'/controlador'];
      if(anterior&&anterior.connectionId!==eu.connectionId){
        if((await OBR.party.getPlayers()).some(p=>p.connectionId===anterior.connectionId))throw Error('O controlador desta cena ainda está conectado em outra instância.');
        if(!localStorage.getItem(key))throw Error('Importe o backup desta cena antes de assumir o controle em outro navegador.');
      }
      seloControle={cena:key,connectionId:eu.connectionId,geracao};
      await OBR.scene.setMetadata({[ns+'/controlador']:seloControle});cenaControle=id;
    }else if(meta[ns+'/controlador']?.geracao!==geracao)throw Error('Esta geração do controlador foi encerrada. Reabra a extensão.');
    const bruto=localStorage.getItem(key),salvo=JSON.parse(bruto||'null')??novo();
    if(!registrosExecucao.has(key)){
      const r=salvo.__execucoes??novoRegistroExecucoes();if(r.formato!==1)throw Error('Formato de execução incompatível. Exporte o backup antes de continuar.');registrosExecucao.set(key,r);
    }
    delete salvo.__execucoes;chaveAtiva=key;
    const recuperado=recuperarEstado(salvo),s=recuperado.estado;
    if(recuperado.novas.length){
      // Falhar a cópia impede gravar qualquer migração parcial.
      localStorage.setItem(key+'/backup-recuperacao/'+Date.now(),bruto);
      persistir(key,s);
    }
    if(cenaCalibrada!==id){await configurarEscalaCena(OBR.scene.grid);cenaCalibrada=id;}
    if(migrarEscalaCena(s))persistir(key,s);
    return {key,s};
  }
  async function mostrar(s,consulta=false,{remoto=true}={}){
    if(!consulta)clearTimeout(timerReacao);
    if(!consulta&&s.reacaoPendente){
      const id=s.reacaoPendente.id,espera=Math.max(0,s.reacaoPendente.terminaEm-Date.now());
      timerReacao=setTimeout(()=>serial(async()=>{
        const atual=await carregar(),p=atual.s.reacaoPendente;
        if(p?.id===id)await executar({tipo:'resolverReacao',ator:p.reator,opcao:null,rev:atual.s.rev,confirmado:true},eu,()=>{});
      }),espera+80);
    }
    const [players,tokens]=await Promise.all([OBR.party.getPlayers(),getTokens()]);
    ch.postMessage({vista:s,info:{...eu,modo:'sala',players,tokens}});
    if(!remoto)return; // consulta do próprio mestre: a vista local basta
    const v=publico(s);
    // Ocultar atores vinculados a tokens invisíveis também no histórico, que é textual.
    const ocultos=s.atores.filter(a=>a.token&&!tokens.some(t=>t.id===a.token && t.visible));
    if(ocultos.length){
      const ids=new Set(ocultos.map(a=>a.id));const ativo=v.ordem[v.vez];
      v.atores=v.atores.filter(a=>!ids.has(a.id));v.ordem=v.ordem.filter(id=>!ids.has(id));v.vez=v.ordem.indexOf(ativo);v.historico=[];
    }
    const transmitir=async()=>{
      if(ultimaVistaPublica&&v.rev<ultimaVistaPublica.estado.rev)return {seq:ultimaVistaPublica.seq,rev:ultimaVistaPublica.estado.rev};
      const seq=crypto.randomUUID(),completo=JSON.stringify(v);
      const delta=!consulta&&ultimaVistaPublica?{tipo:'delta',seq,baseSeq:ultimaVistaPublica.seq,baseRev:ultimaVistaPublica.estado.rev,rev:v.rev,delta:deltaDeEstado(ultimaVistaPublica.estado,v)}:null;
      const dados=delta&&JSON.stringify(delta).length<completo.length*.75?JSON.stringify(delta):completo;
      const partes=fatiarParaBroadcast(dados);
      for(const [n,{i,parte}] of partes.entries())await OBR.broadcast.sendMessage(canais.view,{seq,cena:chaveAtiva,geracao:seloControle?.geracao,i,final:n===partes.length-1,parte},{destination:'REMOTE'});
      ultimaVistaPublica={seq,estado:v};return {seq,rev:v.rev};
    };
    const envio=filaDeVistas.then(transmitir);filaDeVistas=envio.catch(()=>{ultimaVistaPublica=null;});return envio;
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
    const visualAntes=JSON.stringify(s.atores.map(a=>[a.sobreposicaoFicha?.tokenOriginal,a.restauracaoTokenPendente]));
    if(Date.now()>=pausaPropsAte)await sincronizarTokensReanimados(s);
    if(visualAntes!==JSON.stringify(s.atores.map(a=>[a.sobreposicaoFicha?.tokenOriginal,a.restauracaoTokenPendente])))persistir(key,s);
    return s;
  }
  async function limparVinculoToken(token){
    if(!token||!(await OBR.scene.items.getItems([token])).some(i=>i.id===token))return;
    await OBR.scene.items.updateItems([token],items=>{for(const i of items){if(i.metadata){delete i.metadata[chaveFichaNpc];if(typeof i.metadata[chaveBloqueioNpc]==='boolean')i.locked=i.metadata[chaveBloqueioNpc];delete i.metadata[chaveBloqueioNpc];}}});
  }
  async function descartarDinamica(key,e,motivo){
    const atual=await carregar();if(atual.key!==key)return;
    const limpo=cancelarMovimentoDinamico(atual.s,e.paiDinamico??e.id,motivo);
    if(limpo!==atual.s){persistir(key,limpo);await mostrar(limpo);}
  }
  async function executar(c,u,reply,execucao=null){
    let chaveExecucao;
    try{
      const {key,s}=await carregar();
      chaveExecucao=key;
      if(c.tipo==='sync'){await mostrar(await sincronizarNpcs());await reply({});return;}
      if(c.tipo==='excluirFichaIsolada'){
        const registro=excluirFichaIsolada(s,c.registroId,u,c);
        persistir(key,s);
        const token=registro.original?.token;
        await limparVinculoToken(token);
        await mostrar(s);await reply({});return;
      }
      const tokens=await getTokens(), dpi=await OBR.scene.grid.getDpi(),pixelsMetro=pixelsPorMetro(dpi);
      let propNovo=null;
      if(c.tipo==='criarRecipiente'){
        if(u.role!=='GM')throw Error('Somente o mestre pode colocar baús.');
        if(c.tokenId){
          const [prop]=await OBR.scene.items.getItems([c.tokenId]);if(!prop||prop.type!=='IMAGE'||prop.layer!=='PROP')throw Error('Selecione uma imagem na camada de props.');
          c={...c,posicaoM:{x:prop.position.x/pixelsMetro,y:prop.position.y/pixelsMetro}};
        }else{
          c={...c,tokenId:prefixoRecipiente+crypto.randomUUID()};
          const centro=await OBR.viewport.inverseTransformPoint({x:await OBR.viewport.getWidth()/2,y:await OBR.viewport.getHeight()/2});
          c.posicaoM={x:centro.x/pixelsMetro,y:centro.y/pixelsMetro};propNovo={tokenId:c.tokenId,posicao:{x:centro.x,y:centro.y}};
        }
      }
      if((['abrirSaqueRecipiente','confirmarSaque'].includes(c.tipo)||c.tipo==='usar'&&c.opcao==='saquear'&&c.recipienteId)){
        const ator=s.atores.find(a=>a.id===c.ator),origem=ator?.saqueAberto?.origem;
        const recipiente=c.tipo!=='confirmarSaque'?s.recipientes?.find(r=>r.id===c.recipienteId):origem&&origem.tipo!=='personagem'?s.recipientes?.find(r=>r.id===origem.id):null;
        if(recipiente){
        const props=await OBR.scene.items.getItems([recipiente.tokenId,idSelecaoRecipiente(recipiente)]),prop=props.find(i=>i.id===idSelecaoRecipiente(recipiente))??props[0];
        if(!recipiente||!prop)throw Error('Esta peça não está configurada como recipiente.');
        if(u.role!=='GM'&&props.some(p=>p.visible===false))throw Error('Este recipiente não está visível.');
        recipiente.posicaoM={x:prop.position.x/pixelsMetro,y:prop.position.y/pixelsMetro};
        }
      }
      if(c.tipo==='criarPeca'){
        const a=s.atores.find(x=>x.id===c.ator);
        if(u.role!=='GM'||c.rev!==s.rev||s.fase!=='preparo'||!a||a.token)throw Error('Escolha uma ficha sem vínculo na preparação.');
        const visual=visualTokenFicha(a.ficha),lado=visual.largura;
        const pos=await OBR.viewport.inverseTransformPoint({x:await OBR.viewport.getWidth()/2,y:await OBR.viewport.getHeight()/2});
        const token=buildImage({url:new URL(visual.arquivo,location.href).href,mime:visual.mime,width:visual.largura,height:visual.altura},{dpi:lado,offset:{x:lado/2,y:visual.altura/2}})
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
        if(t){a.x=t.x/pixelsMetro;a.y=t.y/pixelsMetro;if(t.hitbox)a.hitbox=t.hitbox;else delete a.hitbox;}
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
      let next;
      if(execucao){
        const registro=registrosExecucao.get(key);
        if(!iniciarExecucao(registro,execucao,s)){salvarRegistro(key);await anunciarExecucao(execucao,s);return;}
        const passo=await avancarExecucao(registro,execucao);
        salvarRegistro(key);
        if(passo?.pedido){
          await anunciarExecucao(execucao,s);
          for(const r of passo.pedidos??[passo.pedido])abrirPedidoExecucao(key,execucao,r,presentes);
          return;
        }
        if(!passo)return;
        const atual=await carregar();if(atual.key!==key)throw Error('A cena mudou antes de aplicar a execução.');
        for(const a of atual.s.atores){const t=tokens.find(x=>x.id===a.token);if(t){a.x=t.x/pixelsMetro;a.y=t.y/pixelsMetro;if(t.hitbox)a.hitbox=t.hitbox;else delete a.hitbox;}}
        validarDependenciasExecucao(execucao,passo.base,atual.s);next=aplicarResultadoExecucao(passo.base,passo.next,atual.s);
        const etapa=structuredClone(registro),concluida=etapa.lista.find(e=>e.id===execucao.id),din=next.acaoDinamica;
        if(din?.id===execucao.id&&['andando','habilidade'].includes(din.fase))checkpointDinamico(etapa,concluida,next);
        else encerrarExecucao(etapa,concluida,din?.id===execucao.id&&din.fase==='cancelada'?'Cancelada':'Concluída',din?.id===execucao.id&&din.fase==='cancelada'?din.motivo:undefined);
        const documento=compactarEstado(next);documento.__execucoes=etapa;
        localStorage.setItem(key,JSON.stringify(documento)); // mundo e recibo no mesmo ponto de gravação
        const anteriores=new Map(registro.lista.map(e=>[e.id,e]));Object.assign(registro,etapa);
        registro.lista=etapa.lista.map(e=>{const anterior=anteriores.get(e.id);if(!anterior)return e;if(e.id!==execucao.id)return anterior;Object.assign(anterior,e);delete anterior.baseRef;return anterior;});
      }else next=await aplicar(s,{...c,ensaio:false},u,dadoSala(u,ch,pedidos,eu.id,presentes,{atividadeId:c.atividadeId,atorId:c.ator}));
      if(propNovo){
        const lado=500,token=buildImage({url:new URL('./assets/props/bau-madeira-saque-75graus.webp',location.href).href,mime:'image/webp',width:lado,height:lado},{dpi:lado/.9,offset:{x:lado/2,y:lado/2}})
          .id(propNovo.tokenId).name('Baú de madeira').layer('PROP').position(propNovo.posicao).build();
        await OBR.scene.items.addItems([token]);
      }
      if(c.tipo==='vincular'){const a=next.atores.find(x=>x.id===c.ator),t=tokens.find(x=>x.id===a.token);if(t){a.x=t.x/pixelsMetro;a.y=t.y/pixelsMetro;if(t.hitbox)a.hitbox=t.hitbox;else delete a.hitbox;}}
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
      let erroProps;
      try{if(Date.now()>=pausaPropsAte){await sincronizarTokensInvocacao(next,pixelsMetro);await sincronizarTokensRecipientes(next,pixelsMetro);await sincronizarTokensReanimados(next);}}
      catch(e){erroProps=e;}
      persistir(key,next);
      // Uma falha visual do SDK não pode desfazer um ataque já resolvido nem devolver a arma à mão.
      if(erroProps&&!timerProps){
        console.error('Sincronização de peças pendente:',erroProps);
        const rate=JSON.stringify(erroProps).includes('RateLimitHit'),espera=rate?15000:1500;
        pausaPropsAte=Date.now()+espera;
        if(Date.now()-ultimoAvisoProps>60000){ultimoAvisoProps=Date.now();OBR.notification.show('Itens salvos. Sincronizando peças do mapa em segundo plano.','WARNING').catch(()=>{});}
        let tentativas=0;
        const reparar=()=>{timerProps=setTimeout(()=>serial(async()=>{
          try{const {key,s}=await carregar();const dpi=await OBR.scene.grid.getDpi(),px=pixelsPorMetro(dpi);await sincronizarTokensInvocacao(s,px);await sincronizarTokensRecipientes(s,px);await sincronizarTokensReanimados(s);persistir(key,s);await mostrar(s);timerProps=null;pausaPropsAte=0;}
          catch(e){console.error('Peças ainda pendentes:',e);if(++tentativas<5){pausaPropsAte=Date.now()+Math.min(60000,espera*2**tentativas);reparar();}else{timerProps=null;pausaPropsAte=Date.now()+60000;}}
        }),Math.max(0,pausaPropsAte-Date.now()));};reparar();
      }
      if(c.tipo==='remover'){
        const token=s.atores.find(a=>a.id===c.ator)?.token;
        await limparVinculoToken(token);
      }
      const estadoMostrar=['vincular','remover'].includes(c.tipo)?await sincronizarNpcs():next;
      await mostrar(estadoMostrar);
      if(c.atividadeId){
        const alvos=next.atores.filter(a=>tokens.some(t=>t.id===a.token&&t.visible)).map(a=>{
          const antes=s.atores.find(x=>x.id===a.id);return {id:a.id,pvPerdido:Math.max(0,(antes?.pv??a.pv)-a.pv),pvTemporarios:Math.max(0,(antes?.pvTemporarios??0)-(a.pvTemporarios??0))};
        }).filter(a=>a.pvPerdido||a.pvTemporarios);
        const evento={tipo:'atividade-aplicada',atividadeId:c.atividadeId,alvos};ch.postMessage({rolagemPublica:evento});await OBR.broadcast.sendMessage(canais.roll,evento,{destination:'REMOTE'});
      }
      if(execucao)await anunciarExecucao(execucao,next);
      if(!execucao||encerrada(execucao))await reply({});
      if(next.acaoDinamica)serial(()=>bombear());
    }catch(e){
      if(execucao){
        if(chaveExecucao!==chaveAtiva){await reply({erro:'Jogada pausada na cena anterior. Retorne àquela cena para retomá-la.'});return;}
        const registro=registrosExecucao.get(chaveExecucao??chaveAtiva);
        if(execucao.estado==='Concluída'){console.warn('Execução salva; apresentação pendente:',e);await reply({});return;}
        encerrarExecucao(registro,execucao,'Falhou',e.message);salvarRegistro(chaveExecucao??chaveAtiva);
        await descartarDinamica(chaveExecucao??chaveAtiva,execucao,'Jogada interrompida: '+e.message);serial(()=>bombear());
        try{if(chaveExecucao===chaveAtiva)await anunciarExecucao(execucao,(await carregar()).s);}catch{}
      }
      await reply({erro:e.message});
    }
  }
  function salvarRegistro(key){
    if(!registrosExecucao.has(key))throw Error('O registro desta cena está pausado.');
    const salvo=JSON.parse(localStorage.getItem(key)||'null');
    if(!salvo)throw Error('A mesa ainda não foi salva. Sincronize antes de continuar.');
    salvo.__execucoes=registrosExecucao.get(key);localStorage.setItem(key,JSON.stringify(salvo));
  }
  async function anunciarExecucao(e,s){
    const resumo=resumoExecucao(e,s),evento={tipo:'execucao',execucao:resumo};
    ch.postMessage({rolagemPublica:evento});
    const a=s.atores.find(x=>x.id===e.atorId),tokens=await getTokens();
    if(!a||!a.token||tokens.some(t=>t.id===a.token&&t.visible))await enviarEventoRolagem(evento);
  }
  async function anunciarRegistro(s,{remoto=true}={}){
    const registro=registrosExecucao.get(chaveAtiva);if(!registro)return;
    const tokens=await getTokens(),visiveis=new Set(tokens.filter(t=>t.visible).map(t=>t.id));
    const lista=registro.lista.map(e=>resumoExecucao(e,s));
    ch.postMessage({rolagemPublica:{tipo:'lista-execucoes',execucoes:lista}});
    if(remoto)await enviarEventoRolagem({tipo:'lista-execucoes',execucoes:lista.filter(e=>{const a=s.atores.find(x=>x.id===e.atorId);return !a?.token||visiveis.has(a.token);})});
    for(const p of pedidos.values())await p.reexibir?.(remoto);
  }
  function abrirPedidoExecucao(key,e,r,presentes){
    if(r.resultado||rolagensEmCurso.has(r.id)||encerrada(e))return;
    rolagensEmCurso.add(r.id);
    const registro=registrosExecucao.get(key);
    const runtime={pedido:r.id,snapshot:r.snapshot,
      salvar:evento=>{if(evento.tipo==='fechar')return;r.snapshot=structuredClone(evento);if(evento.tipo==='rolando')r.dadosLancados=true;e.estado=evento.tipo==='resultado'?'Resultado disponível':evento.tipo==='indeterminada'?'Resultado desconhecido':evento.tipo==='rolando'?'Em andamento':'Aguardando resposta';e.versao++;registro.versao++;salvarRegistro(key);},
      concluir:(erro,valor)=>{if(!erro&&!encerrada(e)){r.resultado=structuredClone(valor);e.estado='Em andamento';e.versao++;registro.versao++;salvarRegistro(key);}},
      cancelar:autor=>{
        const resultado=cancelarExecucao(registro,e.id,autor);salvarRegistro(key);
        serial(async()=>{if(resultado.terminal)await descartarDinamica(key,e,'Jogada cancelada; habilidade não executada.');const {s}=await carregar();await anunciarExecucao(e,s);if(resultado.terminal){respostasExecucao.get(e.id)?.({erro:e.erro});respostasExecucao.delete(e.id);await bombear();}});
        return resultado.terminal===true;
      }
    };
    const rolar=dadoSala(e.usuario,ch,pedidos,eu.id,presentes,{atividadeId:e.atividadeId,atorId:e.atorId,execucaoId:e.id},runtime);
    rolar(r.formula,{...r.meta,...(e.atividadeOrigemId?{atividadeOrigemId:e.atividadeOrigemId}:{})}).then(()=>serial(async()=>{rolagensEmCurso.delete(r.id);if(key===chaveAtiva&&!encerrada(e))await bombear();}),err=>serial(async()=>{
      rolagensEmCurso.delete(r.id);if(encerrada(e))return;
      encerrarExecucao(registro,e,'Falhou',err.message);salvarRegistro(key);await descartarDinamica(key,e,'Rolagem interrompida: '+err.message);respostasExecucao.get(e.id)?.({erro:err.message});respostasExecucao.delete(e.id);
      if(key===chaveAtiva){await anunciarExecucao(e,(await carregar()).s);await bombear();}
    }));
  }
  async function bombear(){
    if(!await OBR.scene.isReady())return;
    const {key,s}=await carregar(),registro=registrosExecucao.get(key);
    const vivas=new Set(registro.lista.filter(e=>!encerrada(e)).map(e=>e.id));for(const id of avaliadas.keys())if(!vivas.has(id))avaliadas.delete(id);
    for(const e of [...registro.lista]){
      if(encerrada(e))continue;
      if(!e.iniciadaEm&&!podeIniciarExecucao(registro,e)){
        if(e.estado!=='Na fila'){e.estado='Na fila';e.motivo='Aguardando personagem, alvo ou turno de outra execução.';e.versao++;registro.versao++;salvarRegistro(key);await anunciarExecucao(e,s);}
        continue;
      }
      if(e.rebaseDinamico&&(s.movimentoPendente||s.reacaoPendente))continue;
      const assinatura=(e.etapaDinamica??0)+':'+e.rolagens.map(r=>!!r.resultado).join(',');
      if(e.iniciadaEm&&avaliadas.get(e.id)===assinatura)continue;
      const versao=e.versao;
      await executar(e.comando,e.usuario,resposta=>{respostasExecucao.get(e.id)?.(resposta);respostasExecucao.delete(e.id);},e);
      // Respostas podem chegar durante os awaits de publicação. Marcar somente
      // o diário examinado, para não engolir uma confirmação concorrente.
      if(e.iniciadaEm&&!encerrada(e))avaliadas.set(e.id,assinatura);
      if(e.estado==='Na fila'&&e.versao===versao)continue;
    }
  }
  async function encaminhar(c,u,req,reply){
    const {key,s}=await carregar(),registro=registrosExecucao.get(key);
    if(c.tipo==='estadoExecucao'){
      const e=registro.lista.find(x=>x.id===c.execucaoId)??registro.encerramentos?.[c.execucaoId];
      if(!e||u.role!=='GM'&&e.usuario.id!==u.id){await reply({consultaExecucao:c.execucaoId,erro:'Execução não encontrada para este usuário.'});return;}
      await reply({consultaExecucao:e.id,...(encerrada(e)?{erro:e.estado==='Concluída'?undefined:e.erro??e.estado}:{recebida:true})});return;
    }
    if(c.tipo==='cancelarExecucao'){
      const {execucao:e,terminal}=cancelarExecucao(registro,c.execucaoId,u,{confirmado:c.confirmado===true});salvarRegistro(key);
      if(terminal){await descartarDinamica(key,e,'Jogada cancelada; habilidade não executada.');for(const r of e.rolagens)pedidos.get(r.id)?.fechar();respostasExecucao.get(e.id)?.({erro:e.erro});respostasExecucao.delete(e.id);}
      await anunciarExecucao(e,s);await reply({});await bombear();return;
    }
    if(['excluirFichaIsolada','criarPeca','criarRecipiente','vincular'].includes(c.tipo)){await executar(c,u,reply);await bombear();return;}
    const intencao={...c,ensaio:false,atividadeId:c.atividadeId??req};
    const existia=registro.lista.some(e=>e.id===req)||registro.encerramentos?.[req];
    const e=admitirExecucao(registro,intencao,u,req,s);
    if(encerrada(e)){await reply(e.estado==='Concluída'?{}:{erro:e.erro??e.estado});return;}
    if(!existia){try{persistir(key,s);}catch(err){registro.lista=registro.lista.filter(x=>x!==e);registro.versao--;throw err;}}
    respostasExecucao.set(e.id,reply);
    await reply({recebida:true,execucaoId:e.id});await anunciarExecucao(e,s);await bombear();
  }
  // Várias consultas seguidas (reenvios, mais de um jogador entrando) reaproveitam a mesma transmissão
  // da vista em vez de retransmitir a mesa inteira para todos a cada pedido.
  let difusao=null;
  async function responderSync(reply,{remoto=true,destinatarioId,sequenciaRecebida}={}){
    try{
      const {s}=await carregar();
      if(!remoto){await mostrar(s,true,{remoto:false});await anunciarRegistro(s,{remoto:false});serial(()=>bombear());await reply({});return;}
      const d=difusao;
      if(!(d&&d.rev===s.rev&&sequenciaRecebida===d.seq&&confirmacoesVista.get(destinatarioId)?.seq===d.seq&&Date.now()-d.fim<3000)){
        const nova={rev:s.rev,emCurso:true,fim:0};
        nova.promessa=mostrar(s,true).then(v=>{nova.seq=v.seq;return v;}).finally(()=>{nova.emCurso=false;nova.fim=Date.now();});
        difusao=nova;
      }
      await difusao.promessa;await anunciarRegistro(s);serial(()=>bombear());await reply({});
    }
    catch(e){await reply({erro:e.message});}
  }
  const agendar=(c,u,req,reply)=>serial(async()=>{try{await encaminhar(c,u,req,reply);}catch(e){await reply({erro:e.message});}});
  ch.onmessage=e=>{if(e.data.rollReply&&pedidos.has(e.data.rollReply.pedido))Promise.resolve(pedidos.get(e.data.rollReply.pedido).responder(e.data.rollReply,eu)).catch(err=>OBR.notification.show(err.message,'ERROR'));else if(e.data.comando){const reply=r=>ch.postMessage({...r,resposta:e.data.req});if(e.data.comando.tipo==='sync')responderSync(reply,{remoto:false}).catch(console.error);else agendar(e.data.comando,eu,e.data.req,reply);}};
  OBR.broadcast.onMessage(canais.cmd,e=>{
    const receber=async()=>{
    const u=(await OBR.party.getPlayers()).find(x=>x.connectionId===e.connectionId);
    if(!u||!['PLAYER','GM'].includes(u.role))return;
    const reply=r=>OBR.broadcast.sendMessage(ns+'/resposta',{...r,resposta:e.data.req},{destination:'REMOTE'});
    if(e.data.comando?.tipo==='syncAck'){confirmacoesVista.set(u.id,{seq:e.data.comando.seq,rev:e.data.comando.rev});return;}
    if(e.data.comando?.tipo==='sync')await responderSync(reply,{destinatarioId:u.id,sequenciaRecebida:e.data.comando.sequenciaRecebida});
    else agendar(e.data.comando,u,e.data.req,reply);
    };
    receber().catch(console.error);
  });
  OBR.broadcast.onMessage(canais.rollReply,async e=>{
    const p=pedidos.get(e.data?.pedido),jogador=(await OBR.party.getPlayers()).find(x=>x.connectionId===e.connectionId);
    if(p&&(jogador?.id===p.destino||jogador?.role==='GM'))Promise.resolve(p.responder(e.data,jogador)).catch(err=>console.warn('Resposta recusada:',err.message));
  });
  const sync=()=>serial(async()=>{if(await OBR.scene.isReady()){
    const {key,s}=await carregar(),[itens,dpi]=await Promise.all([OBR.scene.items.getItems(),OBR.scene.grid.getDpi()]),pixelsMetro=pixelsPorMetro(dpi);let mudou=false;
    for(const r of s.recipientes??[]){const t=itens.find(i=>i.id===idSelecaoRecipiente(r))??itens.find(i=>i.id===r.tokenId);if(t){const x=t.position.x/pixelsMetro,y=t.position.y/pixelsMetro;if(r.posicaoM.x!==x||r.posicaoM.y!==y){r.posicaoM={x,y};mudou=true;}}}
    if(mudou)persistir(key,s);
    if(Date.now()>=pausaPropsAte)await sincronizarTokensRecipientes(s,pixelsMetro);
    await mostrar(await sincronizarNpcs());await bombear();
  }});
  let assinaturaItens='',sincronizacaoAgendada=false,itensRecipienteNaCena=null;
  OBR.scene.items.onChange(itens=>{
    const chaveRecipiente=ns+'/recipiente';
    const recipientesAtuais=new Map(itens.filter(i=>i.metadata?.[chaveRecipiente]).map(i=>[i.id,i.metadata[chaveRecipiente]]));
    const removidosNaCena=itensRecipienteNaCena===null?[]:[...itensRecipienteNaCena].filter(([id])=>!recipientesAtuais.has(id));
    itensRecipienteNaCena=recipientesAtuais;
    if(removidosNaCena.length){
      assinaturaItens='';
      serial(async()=>{
        if(!await OBR.scene.isReady())return;
        const {key,s}=await carregar(),ids=new Set(removidosNaCena.map(([,id])=>id));
        const excluidos=(s.recipientes??[]).filter(r=>ids.has(r.id));
        if(!excluidos.length)return; // exclusão iniciada pelo próprio sistema já foi persistida
        s.recipientes=s.recipientes.filter(r=>!ids.has(r.id));
        for(const ator of s.atores??[]){
          if(ator.saqueAberto&&ids.has(ator.saqueAberto.origem?.id))delete ator.saqueAberto;
        }
        s.rev=(s.rev??0)+1;
        s.historico.unshift('Recipiente excluído da mesa: '+excluidos.map(r=>r.nome).join(', ')+'. O conteúdo também foi removido permanentemente.');
        const dpi=await OBR.scene.grid.getDpi(),pixelsMetro=pixelsPorMetro(dpi);
        persistir(key,s);
        if(Date.now()>=pausaPropsAte)await sincronizarTokensRecipientes(s,pixelsMetro); // remove a imagem ou hitbox que ainda restou
        await mostrar(await sincronizarNpcs());
      });
      return;
    }
    // A posição de props é lida ao abrir o recipiente e ao carregar a cena;
    // não sincronizar a cada quadro de arraste evita gravações/redesenhos contínuos.
    const assinatura=JSON.stringify(itens.filter(i=>(i.type==='IMAGE'&&i.layer==='CHARACTER')||i.metadata?.[chaveRecipiente]).map(i=>[i.id,i.metadata?.[chaveFichaNpc],i.metadata?.[chaveRecipiente]]).sort((a,b)=>a[0].localeCompare(b[0])));
    if(assinatura===assinaturaItens)return;
    assinaturaItens=assinatura;
    if(sincronizacaoAgendada)return;
    sincronizacaoAgendada=true;
    requestAnimationFrame(()=>serial(async()=>{
      sincronizacaoAgendada=false;
      if(await OBR.scene.isReady()){
        const {key,s}=await carregar(),dpi=await OBR.scene.grid.getDpi(),pixelsMetro=pixelsPorMetro(dpi);let mudou=false;
        for(const r of s.recipientes??[]){const t=itens.find(i=>i.id===idSelecaoRecipiente(r))??itens.find(i=>i.id===r.tokenId);if(t){const x=t.position.x/pixelsMetro,y=t.position.y/pixelsMetro;if(r.posicaoM.x!==x||r.posicaoM.y!==y){r.posicaoM={x,y};mudou=true;}}}
        if(mudou)persistir(key,s);
        if(Date.now()>=pausaPropsAte)await sincronizarTokensRecipientes(s,pixelsMetro);
        await mostrar(await sincronizarNpcs());
      }
    }));
  });
  OBR.party.onChange(sync);OBR.scene.onReadyChange(ready=>{if(ready)sync();else{itensRecipienteNaCena=null;assinaturaItens='';ch.postMessage({vista:novo(),info:{...eu,modo:'sem cena',players:[],tokens:[]}});}});
  const filtro={roles:['GM'],min:1,max:1,every:[{key:'layer',value:'CHARACTER'}]};
  await OBR.contextMenu.remove(ns+'/vinculo').catch(()=>{});
  await OBR.contextMenu.create({id:ns+'/vinculo',icons:[{icon:new URL('./icone.svg',location.href).href,label:'La Arte · vincular ou abrir ficha',filter:filtro}],
    embed:{url:new URL('./contexto.html?v=0.8.77',location.href).href,height:420},
    onClick:async ctx=>{await OBR.player.select([ctx.items[0].id],true);await OBR.action.open();}});
  for(const id of [ns+'/caixa-gm',ns+'/saquear-recipiente'])await OBR.contextMenu.remove(id).catch(()=>{});
  await OBR.contextMenu.create({id:ns+'/caixa-gm',icons:[{icon:new URL('./icone.svg',location.href).href,label:'La Arte · recipiente',filter:{roles:['GM'],min:1,max:1,every:[{key:'layer',value:'PROP'}]}}],embed:{url:new URL('./recipiente.html?v=0.8.77',location.href).href,height:300},onClick:()=>{}});

  sync();
}
export async function sala(onView){
  await pronto();const eu=await identidade();const ch=local(),espera=new Map();
  function receber(d){const id=d.consultaExecucao??d.resposta;if(!id)return;const cb=espera.get(id);if(cb){if(!d.recebida)espera.delete(id);cb(d);}}
  const montarEstado=receptorDeEstado();let ultimaRev=-1,recebeuVista=false,vistaAtual,ultimaSequencia;
  const mestre=mensagemDoControlador;
  let fila=Promise.resolve();
  if(eu.role==='GM')ch.onmessage=e=>{receber(e.data);if(e.data.vista){recebeuVista=true;onView(e.data.vista,e.data.info);}};
  {
    OBR.broadcast.onMessage(ns+'/resposta',async e=>{if(await mestre(e))receber(e.data);});
    OBR.broadcast.onMessage(canais.view,e=>{fila=fila.then(async()=>{
      if(!await mestre(e))return;
      const recebido=montarEstado(e.data);if(!recebido)return;
      const meta=await OBR.scene.getMetadata(),cena=ns+'/'+OBR.room.id+'/'+meta[chaveCena];
      if(e.data.cena&&e.data.cena!==cena)return;
      if(recebido.tipo==='delta'&&(recebido.baseSeq!==ultimaSequencia||recebido.baseRev!==ultimaRev)){notify().catch(console.warn);return;}
      const estado=recebido.tipo==='delta'?aplicarDeltaEstado(vistaAtual,recebido.delta):recebido;
      if(estado&&(estado.rev??0)>=ultimaRev){ultimaRev=estado.rev??0;ultimaSequencia=e.data.seq;vistaAtual=estado;recebeuVista=true;onView(estado,{...eu,modo:'sala',players:[],tokens:[]});await OBR.broadcast.sendMessage(canais.cmd,{comando:{tipo:'syncAck',seq:ultimaSequencia,rev:ultimaRev}},{destination:'REMOTE'});}
    }).catch(console.error);});
  }
  const send=async(comando,req)=>await controlaLocal(eu)?ch.postMessage({comando,req}):OBR.broadcast.sendMessage(canais.cmd,{comando,req},{destination:'REMOTE'});
  const execucoesRecebidas=receptorDeEstado();
  const receberExecucao=d=>{const lista=d.tipo==='lista-execucoes'?d.execucoes:d.tipo==='execucao'?[d.execucao]:[];for(const e of lista??[])if(encerrada(e))receber({resposta:e.id,erro:e.estado==='Concluída'?undefined:e.erro??e.estado});};
  if(eu.role==='GM')ch.addEventListener('message',e=>{if(e.data.rolagemPublica)receberExecucao(e.data.rolagemPublica);});
  OBR.broadcast.onMessage(canais.roll,async e=>{if(!await mestre(e))return;const d=e.data.fragmento?execucoesRecebidas(e.data):e.data;if(d)receberExecucao(d);});
  const enviar=async c=>{
    // O editor usa a ficha expandida (inclui definições e _catalogoV2).
    // Enviar só referências/ajustes evita estourar o limite do SDK ao salvar.
    if(c.ficha?.versaoFormato===1)c={...c,ficha:compactarFicha(c.ficha)};
    const req=crypto.randomUUID();
    if(c.tipo!=='sync')c={...c,emitidaEm:Date.now()};
    return new Promise((resolve,reject)=>{
      let aceito=false,timer,reenvio;
      const limpar=()=>{clearTimeout(timer);clearInterval(reenvio);};
      if(c.tipo==='sync')timer=setTimeout(()=>{espera.delete(req);reject(Error('Sem resposta do controlador da sala. Confira se há um mestre conectado e uma cena aberta.'));},15000);
      else reenvio=setInterval(()=>{if(aceito)Promise.resolve(send({tipo:'estadoExecucao',execucaoId:req},'consulta:'+req)).catch(()=>{});else Promise.resolve(send(c,req)).catch(()=>{});},10000);
      espera.set(req,d=>{if(d.recebida){aceito=true;return;}limpar();if(d.erro){const e=Error(d.erro);e.controladorRespondeu=true;reject(e);}else resolve();});
      Promise.resolve(send(c,req)).catch(e=>{if(c.tipo==='sync'){limpar();espera.delete(req);reject(e);}else OBR.notification.show('Reconectando: verificando o recebimento da jogada.','WARNING').catch(()=>{});});
    });
  };
  let syncEmCurso;
  const notify=()=>syncEmCurso??(syncEmCurso=consultarComReenvio(async()=>{await enviar({tipo:'sync',sequenciaRecebida:ultimaSequencia});if(!recebeuVista)throw Error('Aguardando os dados da mesa.');}).finally(()=>{syncEmCurso=null;}));
  OBR.party.onChange(()=>{notify().catch(console.warn);});
  OBR.scene.onReadyChange(ready=>{ultimaRev=-1;recebeuVista=false;vistaAtual=null;ultimaSequencia=null;if(ready)notify().catch(console.warn);});
  return {notify,enviar,observarSelecao:fn=>OBR.player.onChange(p=>fn(p.selection?.[0])),selecionado:async()=>(await OBR.player.getSelection())?.[0]};
}

export async function interfaceRolagens(onEvent){
  await pronto();const eu=await identidade(),ch=local();
  const montar=receptorDeEstado(),avisados=globalThis[Symbol.for(ns+'/avisos-rolagem')]??(globalThis[Symbol.for(ns+'/avisos-rolagem')]=new Set());
  const versoes=new Map();
  const entregar=d=>{
    if(!d)return;
    if(d.pedido&&Number.isInteger(d.etapaVersao)){versoes.set(d.pedido,d.etapaVersao);if(versoes.size>1024)versoes.delete(versoes.keys().next().value);}
    if(d.tipo==='ajuste'&&d.destino===eu.id&&d.meta?.tipo==='salvaguarda'&&!avisados.has(d.pedido)){avisados.add(d.pedido);if(avisados.size>128)avisados.delete(avisados.values().next().value);OBR.notification.show('Salvaguarda pendente: '+(d.meta.titulo??''),'WARNING').catch(()=>{});}
    if(d.pedido||['atividade-aplicada','execucao','lista-execucoes'].includes(d.tipo))onEvent(d);
  };
  if(eu.role==='GM')ch.addEventListener('message',e=>entregar(e.data?.rolagemPublica));
  OBR.broadcast.onMessage(canais.roll,async e=>{
    const mestre=await mensagemDoControlador(e);
    if(mestre)entregar(e.data?.fragmento?montar(e.data):e.data);
  });
  return async resposta=>{resposta={...resposta,etapaVersao:resposta.etapaVersao??versoes.get(resposta.pedido)};return await controlaLocal(eu)?ch.postMessage({rollReply:resposta}):OBR.broadcast.sendMessage(canais.rollReply,resposta,{destination:'REMOTE'});};
}

