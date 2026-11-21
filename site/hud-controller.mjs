import {planejarMovimentoDinamico} from './dynamic-movement.mjs?v=0.8.80';
import {caixaRodape,medidaRodapeValida} from './hud-dock-layout.mjs?v=0.8.80';
import {caixaEfeitos} from './effect-layout.mjs?v=0.8.80';
import {listarEfeitosHud} from './effect-state.mjs?v=0.8.80';
import {gruposRodape,gruposMesa,partesLeves,chaveParte,chaveEntrada,grupoHudValido,comandoDoAtorHudValido} from './hud-parts.mjs?v=0.8.80';
import {deslocamentoMaximo,temCondicao} from './engine.mjs?v=0.8.80';
import {hitboxToken,centroAlvo,distanciaAoAlvo,raioAlvo} from './target-geometry.mjs?v=0.8.80';
import {AtividadesMesa} from './activity-feed.mjs?v=0.8.80';
import OBR,{buildCurve,buildLine,buildImage} from './vendor/sdk.mjs';
import {METROS_POR_CELULA,pixelsPorMetro} from './scene-scale.mjs?v=0.8.80';
import {ns,pronto,sala,interfaceRolagens} from './bridge.mjs?v=0.8.80';
import {atual,multi,incluirAlvo,destinoDeslocamento,dentroDaArea,oportunidades,opcoesDisponiveis,circulosConjuracao,derivarOpcaoCirculo,planoCustoOpcao,alvosElegiveisDestruidor,ofertaDestruidorDeHordas,metamagiaDuplicada,atoresElegiveisDescanso} from './engine.mjs?v=0.8.80';
import {visibilidadeRolagem} from './roll-visibility.mjs?v=0.8.80';
import {compactarMarcas,marcasPublicasValidas,remetentePodePublicarPrevia} from './action-preview.mjs?v=0.8.80';
import {primeiroContato,terrenoDificilDasZonas,poligonoZona} from './zonas.mjs?v=0.8.80';
import {visualHabilidade,testeVisual,opcaoConsumoItem} from './ability-art.mjs?v=0.8.80';
import {bonusPericia,mod} from './engine.mjs?v=0.8.80';
import {pontoNoRecipiente,idSelecaoRecipiente} from './loot-geometry.mjs?v=0.8.80';
import {abrirJanelaInventario,trocaParaUsuario} from './inventory-popovers.mjs?v=0.8.80';
import {adquirirControleLocal} from './controller-lock.mjs?v=0.8.80';
import {mensagemHudValida} from './hud-protocol.mjs?v=0.8.80';

const tool=ns+'/mirar', mode=tool+'/ponto';
const url=new URL('./hud.html?v=0.8.80',import.meta.url);
const icons=[{icon:new URL('./icone.svg',url).href,label:'Mira e movimento'}];
const canalPrevia=ns+'/action-preview';
export const canalHud=async()=>new BroadcastChannel([ns,'hud',OBR.room.id,await OBR.player.getConnectionId()].join('/'));
const medida=n=>Number(n.toFixed(2)).toLocaleString('pt-BR')+' m';

function circulo(centro,raio,cor){
  const pontos=Array.from({length:80},(_,i)=>({x:raio*Math.cos(i*Math.PI/40),y:raio*Math.sin(i*Math.PI/40)}));
  return buildCurve().position(centro).points(pontos).closed(true).fillColor(cor).fillOpacity(.08)
    .strokeColor(cor).strokeWidth(3).layer('CONTROL').locked(true).disableHit(true).build();
}
function poligono(posicao,pontos,cor){return buildCurve().position(posicao).points(pontos).closed(true).fillColor(cor).fillOpacity(.10).strokeColor(cor).strokeWidth(3).layer('CONTROL').locked(true).disableHit(true).build();}
function marcaArea(rule,origem,ponto,pixelsMetro){
  const area=rule?.area??(rule?.raioM?{forma:'circulo',raioM:rule.raioM}:null);if(!area)return [];
  if(area.forma==='circulo')return [circulo(ponto,area.raioM*pixelsMetro,'#79cfb1')];
  if(area.forma==='quadrado'){const m=area.tamanhoM*pixelsMetro/2;return [poligono(ponto,[{x:-m,y:-m},{x:m,y:-m},{x:m,y:m},{x:-m,y:m}],'#79cfb1')];}
  const dx=ponto.x-origem.x,dy=ponto.y-origem.y,n=Math.hypot(dx,dy)||1,ux=dx/n,uy=dy/n,l=area.comprimentoM*pixelsMetro,w=(area.larguraM??(area.forma==='cone'?area.comprimentoM:1.5))*pixelsMetro/2,fx=ux*l,fy=uy*l,px=-uy*w,py=ux*w;
  return area.forma==='cone'?[poligono(origem,[{x:0,y:0},{x:fx+px,y:fy+py},{x:fx-px,y:fy-py}],'#79cfb1')]:[poligono(origem,[{x:px,y:py},{x:fx+px,y:fy+py},{x:fx-px,y:fy-py},{x:-px,y:-py}],'#79cfb1')];
}
function alvosDaArea(rule,origem,ponto,atores,pos,pixelsMetro,geometria,conjuradorId){
  const origemM={x:origem.x/pixelsMetro,y:origem.y/pixelsMetro},pontoM={x:ponto.x/pixelsMetro,y:ponto.y/pixelsMetro};
  return atores.filter(a=>{
    return !((rule?.excluirConjurador||['cone','linha'].includes(rule?.area?.forma))&&a.id===conjuradorId)&&dentroDaArea(origemM,pontoM,geometria(a),rule);
  });
}
// M05: cada cliente desenha as zonas ativas a partir do estado público (persistem ao recarregar,
// uma única peça por zona). Ficam na camada acima dos tokens e não recebem clique.
const chaveZona=ns+'/zona';
function itensZona(z,pixelsMetro){
  const cor=z.cor??'#5fae5b',g=z.geometria??{},assinatura=JSON.stringify([z.centro,g,cor,pixelsMetro]),meta={[chaveZona]:assinatura};
  const centro={x:z.centro.x*pixelsMetro,y:z.centro.y*pixelsMetro};
  if(g.forma==='circulo'){
    const r=g.raioM*pixelsMetro,pontos=Array.from({length:80},(_,i)=>({x:r*Math.cos(i*Math.PI/40),y:r*Math.sin(i*Math.PI/40)}));
    return buildCurve().id(chaveZona+'/'+z.id).position(centro).points(pontos).closed(true).fillColor(cor).fillOpacity(.18).strokeColor(cor).strokeWidth(3).strokeDash([12,6])
      .layer('ATTACHMENT').locked(true).disableHit(true).name(z.nome??'Área').metadata(meta).build();
  }
  const pol=poligonoZona(z);if(!pol)return null;
  return buildCurve().id(chaveZona+'/'+z.id).position(centro).points(pol.map(p=>({x:p.x*pixelsMetro-centro.x,y:p.y*pixelsMetro-centro.y}))).closed(true).fillColor(cor).fillOpacity(.18).strokeColor(cor).strokeWidth(3).strokeDash([12,6])
    .layer('ATTACHMENT').locked(true).disableHit(true).name(z.nome??'Área').metadata(meta).build();
}
export async function iniciarHud(){
  await pronto();
  const conexao=await OBR.player.getConnectionId(),chaveControle=ns+'/hud-controlador/'+OBR.room.id+'/'+conexao;
  const controles=globalThis[Symbol.for(ns+'/controladores-hud')]??(globalThis[Symbol.for(ns+'/controladores-hud')]=new Set());
  if(controles.has(chaveControle))return false;
  controles.add(chaveControle);
  let liberar;try{liberar=await adquirirControleLocal(chaveControle);}catch(e){controles.delete(chaveControle);throw e;}
  if(!liberar){controles.delete(chaveControle);return false;}
  const sessaoHud=crypto.randomUUID(),limpezas=[],diagnostico=[];let encerrado=false;
  const registrar=(tipo,dados={})=>{diagnostico.push({tipo,quando:Date.now(),...dados});if(diagnostico.length>128)diagnostico.shift();};
  const encerrarHud=()=>{if(encerrado)return;encerrado=true;for(const limpar of limpezas.splice(0))try{limpar?.();}catch{}controles.delete(chaveControle);liberar();};
  globalThis.addEventListener('pagehide',encerrarHud,{once:true});limpezas.push(()=>globalThis.removeEventListener('pagehide',encerrarHud));
  try{
  const bus=await canalHud(),abertos=new Map(),presencas=new Map(),documentos=new Map(),pings=new Map(),ponteiros=new Set();
  let ponteiroMapa=false,layoutAguardandoPonteiro=false;
  limpezas.push(()=>{bus.onmessage=null;bus.close();});
  const chaveDiagnostico=Symbol.for(ns+'/hud-diagnostico');globalThis[chaveDiagnostico]=()=>({sessao:sessaoHud,entrada:{mapa:ponteiroMapa,janelas:[...ponteiros]},eventos:structuredClone(diagnostico)});limpezas.push(()=>{delete globalThis[chaveDiagnostico];});
  const partesHud=['efeitos','dica-efeito','iniciativa','acao','reacao','dados','anuncio-dado','atividades',...partesLeves];
  const popoversAntigos=['barra','ordem'];
  const canaisPartes=new Map(partesLeves.map(p=>[p,new BroadcastChannel(chaveParte(ns,OBR.room.id,conexao,p))]));
  const entradaPartes=new BroadcastChannel(chaveEntrada(ns,OBR.room.id,conexao));
  const cargasPartes=new Map(),enviadasPartes=new Map(),geometriasPartes={};
  let layoutRodape,layoutMesa,layoutEfeitos,dicaRodape,assinaturaMedidores='';
  limpezas.push(()=>{entradaPartes.close();for(const c of canaisPartes.values())c.close();});
  function publicarParte(parte,forcar=false){
    const html=cargasPartes.get(parte),documentoHud=documentos.get(parte);if(!html||!documentoHud||!estado)return;
    const g=geometriasPartes[Object.hasOwn(gruposMesa,parte)?'ordem':'barra'];
    const aguardando=Object.hasOwn(gruposRodape,parte)&&(!g||g.atorId!==atorId||g.linhas!==linhas||g.compacto!==compacto);
    const d={html,documentoHud,sessaoHud,atorId:g?.atorId,aguardando,rev:estado.rev,compacto,nomes:geometriasPartes.barra?.nomes!==false};
    const assinatura=JSON.stringify(d);if(!forcar&&enviadasPartes.get(parte)===assinatura)return;
    enviadasPartes.set(parte,assinatura);canaisPartes.get(parte)?.postMessage(d);
  }
  let estado,eu,api,atorId,pendente,acaoPublica,anterior,pedidoDado,anuncioDado,timerAnuncio,responderDado,dicaEfeito,ocupado=false,linhas=Number(localStorage.getItem(ns+'/linhas'))||3,espacoEfeitos=0;
  let compacto=localStorage.getItem(ns+'/compacto')==='1';
  let movimentoDinamico=localStorage.getItem(ns+'/movimento-dinamico')==='1';
  let marcasAreaMovimento=[],assinaturaAreaMovimento='';
  limpezas.push(()=>{if(marcasAreaMovimento.length)OBR.scene.local.deleteItems(marcasAreaMovimento).catch(()=>{});});
  let saqueAbertoVisual=null,trocaAbertaVisual=null;
  let alturaConteudoAcao=590,layoutEmCurso,layoutPendente=false;
  const medidasRodape=new Map();
  let atividades=new AtividadesMesa({modo:localStorage.getItem(ns+'/atividades-modo')??'painel'});
  const marcasPorAtividade=new Map();
  let pronta=await OBR.scene.isReady(),pixelsMetro=pronta?pixelsPorMetro(await OBR.scene.grid.getDpi()):1;
  let marcas=[],marcasPublicas=[],tokens=[],fila=Promise.resolve(),ferramentaDoTurno;
  const serial=fn=>{if(encerrado)return;fila=fila.then(()=>!encerrado&&fn()).catch(e=>{if(!encerrado)OBR.notification.show(e.message||String(e),'ERROR');});};
  async function sincronizarPecas(){ // M06: peças visuais estáticas (Ilusão Menor), públicas e idempotentes
    if(!pronta)return;
    const chave=ns+'/peca',desejadas=new Map((estado?.pecas??[]).map(p=>{
      const lado=1254,escala=Math.max(.25,(p.tamanhoM??1.5)/METROS_POR_CELULA),assinatura=JSON.stringify([p.posicao,p.tamanhoM,pixelsMetro]);
      return [chave+'/'+p.id,buildImage({url:new URL('./'+(p.imagem??'assets/tokens/invocacao-padrao.png'),url).href,mime:'image/png',width:lado,height:lado},{dpi:lado/escala,offset:{x:lado/2,y:lado/2}})
        .id(chave+'/'+p.id).position({x:p.posicao.x*pixelsMetro,y:p.posicao.y*pixelsMetro}).layer('CHARACTER').locked(true).disableHit(true).name(p.nome??'Ilusão').metadata({[chave]:assinatura}).build()];
    }));
    const existentes=await OBR.scene.local.getItems(i=>i.metadata?.[chave]!==undefined);
    const remover=existentes.filter(i=>!desejadas.has(i.id)||desejadas.get(i.id).metadata[chave]!==i.metadata[chave]).map(i=>i.id);
    if(remover.length)await OBR.scene.local.deleteItems(remover);
    const ficam=new Set(existentes.map(i=>i.id).filter(id=>!remover.includes(id)));
    const novos=[...desejadas.entries()].filter(([id])=>!ficam.has(id)).map(([,item])=>item);
    if(novos.length)await OBR.scene.local.addItems(novos);
  }
  async function sincronizarZonas(){
    if(!pronta)return;
    const desejadas=new Map((estado?.zonas??[]).map(z=>[chaveZona+'/'+z.id,itensZona(z,pixelsMetro)]).filter(([,item])=>item));
    const existentes=await OBR.scene.local.getItems(i=>i.metadata?.[chaveZona]!==undefined);
    const remover=existentes.filter(i=>!desejadas.has(i.id)||desejadas.get(i.id).metadata[chaveZona]!==i.metadata[chaveZona]).map(i=>i.id);
    if(remover.length)await OBR.scene.local.deleteItems(remover);
    const ficam=new Set(existentes.map(i=>i.id).filter(id=>!remover.includes(id)));
    const novos=[...desejadas.entries()].filter(([id])=>!ficam.has(id)).map(([,item])=>item);
    if(novos.length)await OBR.scene.local.addItems(novos);
  }
  const atores=()=>estado?.atores??[];
  const ator=()=>atores().find(a=>a.id===atorId);
  const controla=a=>a&&(eu.role==='GM'||((a.ficha.tipo==='pj'||a.invocacao?.controlavel)&&a.dono===eu.id)); // M06: quem invocou controla a entidade
  // A escolha pertence ao jogador; o mestre assume somente sem dono conectado.
  const escolhaIniciativa=()=>controla(atores().find(a=>a.id===estado?.reacaoPendente?.reator))?null:atores().find(a=>a.reacaoIniciativa&&controla(a)&&(a.dono===eu.id||eu.role==='GM'&&(!a.dono||!(eu.players??[]).some(p=>p.id===a.dono))))?.reacaoIniciativa;
  const token=a=>tokens.find(t=>t.id===a?.token);
  const pos=a=>token(a)?.position??{x:a.x*pixelsMetro,y:a.y*pixelsMetro};
  const geometria=a=>{const p=pos(a),t=token(a);return {x:p.x/pixelsMetro,y:p.y/pixelsMetro,hitbox:t?hitboxToken(t):a.hitbox};};
  const distanciaAlvo=(origem,a)=>distanciaAoAlvo({x:origem.x/pixelsMetro,y:origem.y/pixelsMetro},geometria(a));
  const estadoDaCena=()=>({...estado,atores:atores().map(a=>({...a,...geometria(a)}))});
  async function sincronizarAreaMovimento(){
    const a=ator(),emCurso=estado?.acaoDinamica?.ator===a?.id&&['andando','habilidade'].includes(estado?.acaoDinamica?.fase);
    const mostrar=pronta&&movimentoDinamico&&estado?.fase==='turnos'&&atual(estado)?.id===a?.id&&controla(a)&&a.pv>0&&!pendente&&!ocupado&&!emCurso&&!estado.reacaoPendente&&token(a);
    const centro=mostrar?pos(a):null,raio=mostrar?a.metros*pixelsMetro:0,assinatura=JSON.stringify([mostrar?a.id:null,centro,raio]);
    if(assinatura===assinaturaAreaMovimento)return;
    if(marcasAreaMovimento.length&&pronta)await OBR.scene.local.deleteItems(marcasAreaMovimento);
    marcasAreaMovimento=[];
    if(mostrar){const item=circulo(centro,raio,'#e5c079');item.metadata={...item.metadata,[ns+'/area-movimento-dinamico']:a.id};await OBR.scene.local.addItems([item]);marcasAreaMovimento=[item.id];}
    assinaturaAreaMovimento=assinatura;
  }
  const origemHabilidade=p=>p.cmd.movimentoDinamico&&p.planoMovimento?.possivel?{x:p.planoMovimento.destino.x*pixelsMetro,y:p.planoMovimento.destino.y*pixelsMetro}:p.origem;
  const alvosAreaPrevista=(p,ponto,origem)=>alvosDaArea(p.rule,origem,ponto,atores(),pos,pixelsMetro,a=>a.id===p.cmd.ator?{...geometria(a),x:origem.x/pixelsMetro,y:origem.y/pixelsMetro}:geometria(a),p.cmd.ator);
  const atividadeAtual=()=>atividades.atual(eu?.id);
  const painelAtividades=()=>Boolean(atividadeAtual());
  const acaoVisivel=()=>{
    if(!painelAtividades())return null;
    const atual=atividadeAtual(),a=atual?.acao?atual:atividades.lista.get(atual?.atividadeOrigemId);
    if(a?.id===pendente?.publicId)return pendente;
    return a?.acao?{...a.acao,somenteLeitura:true}:null;
  };
  function atualizarAtividades(){
    if(pendente){pendente.publicId??=crypto.randomUUID();atividades.acao(resumoPendente(pendente),{propria:true});}
    const a=atividadeAtual();acaoPublica=a?.acao&&a.id!==pendente?.publicId?a.acao:null;
    const r=a?.rolagens.filter(r=>!r.fechada).at(-1)??a?.rolagens.filter(r=>r.resultado).at(-1);
    pedidoDado=painelAtividades()&&r?{...r,podeEditar:r.fechada?false:r.podeEditar,tipo:r.fechada?'resultado':r.tipo}:null;
  }
  function custosPrevia(a,o,modo='automatico',entradas){
    const plano=planoCustoOpcao(a,o,modo,entradas);if(!plano)return [];
    return plano.custos.map(c=>{const recurso=c.tipo==='recurso'?a?.ficha?.recursos?.find(r=>r.id===c.id):null,key=c.tipo==='recurso'?c.id:c.tipo;
      return {tipo:c.tipo,id:c.id,quantidade:c.quantidade,nome:recurso?.nome??({acao:'Ação',bonus:'Ação bônus',reacao:'Reação'})[c.tipo]??c.id,saldo:c.tipo==='recurso'?a?.rec?.[key]:a?.[key],maximo:recurso?.maximo??1};});
  }
  function resumoPendente(p,somenteLeitura=false){
    if(!p)return null;
    atualizarPlanoDinamico(p);
    const a=atores().find(x=>x.id===(p.cmd?.ator??p.atorId)),o=p.opcaoPublica??opcoesDisponiveis(a??{}).find(x=>x.id===(p.cmd?.opcao??p.opcao));
    return {id:p.publicId??p.id,atorId:a?.id??p.atorId,titulo:p.titulo,detalhe:p.detalhe,pronto:p.pronto,
      movimentoDinamico:p.cmd?.movimentoDinamico===true,opcao:p.cmd?.opcao??p.opcao,opcaoPublica:o?{...structuredClone(o),visual:visualHabilidade(o,a?.ficha??p.fichaPublica??{})}:null,fichaPublica:{recursos:structuredClone(a?.ficha?.recursos??p.fichaPublica?.recursos??[])},
      lista:p.escolha==='lista'||p.lista,quantidade:p.cmd?.alvos?.length??p.quantidade,min:p.regraLista?.min??p.min,max:p.regraLista?.max??p.max,
      alvos:p.cmd?.alvos??p.alvos??[],parametros:structuredClone(p.cmd?.parametros??p.parametros??{}),composicao:p.composicao?structuredClone(p.composicao):null,compositor:p.compositor?structuredClone(p.compositor):null,
      saldosComposicao:{acao:a?.acao??0,bonus:a?.bonus??0,reacao:a?.reacao??0,...(a?.rec??{})},foraCombate:estado?.fase==='preparo'||a?.emCombate===false,custos:structuredClone(p.custos??custosPrevia(a,o,p.cmd?.modoCusto)),rolagem:p.rolagem,substitui:p.substitui,donoAcao:a?.nome??p.donoAcao,rev:p.rev,somenteLeitura:somenteLeitura||p.somenteLeitura===true};
  }
  function transmitir(){
    if(encerrado)return;
    const p=acaoVisivel();
    const medidoresHud={};
    for(const [parte,base] of [['barra',layoutRodape],['ordem',layoutMesa]])if(base&&documentos.has(parte))medidoresHud[parte]={documentoHud:documentos.get(parte),largura:base.width,altura:base.alturaMax??180};
    const estadoMedidores=Object.fromEntries(Object.entries(geometriasPartes).map(([parte,g])=>[parte,g.estadoLocal]));
    if(estado)bus.postMessage({vista:{sessaoHud,estado,layoutRodape,medidoresHud,estadoMedidores,iconeEfeito:layoutEfeitos?.icone,movimentoDinamico,eu:{id:eu.id,role:eu.role},atorId,linhas,compacto,ocupado,espacoEfeitos,dicaEfeito,reacaoIniciativa:escolhaIniciativa(),
      atividades:{modo:atividades.modo,selecionada:atividadeAtual()?.id,propria:atividades.propria,pendentes:atividades.pendencias(eu.id).length,lista:atividades.vista()},imagens:Object.fromEntries(atores().map(a=>[a.id,token(a)?.image?.url])),pedidoDado,anuncioDado,
      pendente:resumoPendente(p,p===acaoPublica)}});
  }
  async function janela(parte,box){
    if(encerrado)return;
    const id=ns+'/hud/'+parte;
    const antes=abertos.has(parte)?JSON.parse(abertos.get(parte)):null;
    const key=box&&JSON.stringify(box);
    if(antes&&(!box||abertos.get(parte)!==key)&&(ponteiroMapa||ponteiros.size)){layoutAguardandoPonteiro=true;return;}
    if(!box){if(antes){await OBR.popover.close(id).catch(()=>{});abertos.delete(parte);documentos.delete(parte);presencas.delete(parte);pings.delete(parte);registrar('fechar',{parte});}return;}
    if(antes&&Date.now()-(presencas.get(parte)??0)<6500){
      if(abertos.get(parte)===key)return;
      // Mesma posição: redimensiona sem navegar o iframe. Posição nova:
      // atualiza o mesmo ID/URL, conservando o documento e o handshake.
      try{
        if(antes[0]===box[0]&&antes[1]===box[1]&&OBR.popover.setWidth&&OBR.popover.setHeight){
          if(antes[2]!==box[2])await OBR.popover.setWidth(id,box[2]);
          if(antes[3]!==box[3])await OBR.popover.setHeight(id,box[3]);
        }else{
          const pagina=paginaHud(parte,documentos.get(parte));
          await abrirPopover(id,pagina,box);
        }
        abertos.set(parte,key);registrar('atualizar-geometria',{parte});return;
      }catch{registrar('geometria-reabrir',{parte});}
    }
    if(antes&&abertos.get(parte)===key){
      if(document.visibilityState==='hidden'||ponteiroMapa||ponteiros.size)return;
      let existe=false;try{existe=typeof OBR.popover.getWidth==='function'&&(await OBR.popover.getWidth(id))>0;}catch{}
      if(existe){const ping=pings.get(parte);if(!ping){pings.set(parte,Date.now());if(partesLeves.includes(parte))canaisPartes.get(parte).postMessage({verificarPresenca:true,sessaoHud,documentoHud:documentos.get(parte)});else bus.postMessage({verificarPresenca:parte,sessaoHud});return;}if(Date.now()-ping<2000)return;}
    }
    // Uma atualização da extensão pode reiniciar o controlador enquanto o
    // Owlbear ainda conserva o pop-up antigo. Fechar pelo ID torna a abertura
    // idempotente e impede que um pop-up órfão bloqueie toda a HUD.
    await OBR.popover.close(id).catch(()=>{});
    const [,,width,height]=box;
    const documento=crypto.randomUUID(),pagina=paginaHud(parte,documento);
    // O iframe pode pedir os dados antes de open() responder ao controlador.
    documentos.set(parte,documento);
    try{await abrirPopover(id,pagina,box);}catch(e){documentos.delete(parte);abertos.delete(parte);presencas.delete(parte);pings.delete(parte);throw e;}
    abertos.set(parte,key);
    presencas.set(parte,Date.now());pings.delete(parte);registrar('abrir',{parte,documento,width,height});
  }
  function paginaHud(parte,documento){const pagina=partesLeves.includes(parte)?new URL('./hud-part.html?v=0.8.80',url):new URL(url.href);pagina.searchParams.set('parte',parte);pagina.searchParams.set('sessaoHud',sessaoHud);pagina.searchParams.set('documentoHud',documento);return pagina;}
  function abrirPopover(id,pagina,[left,top,width,height]){return OBR.popover.open({id,url:pagina.href,width,height,hidePaper:true,disableClickAway:true,marginThreshold:0,anchorReference:'POSITION',anchorPosition:{left,top},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});}
  async function layout(){
    if(encerrado)return;
    if(layoutEmCurso){layoutPendente=true;return layoutEmCurso;}
    layoutEmCurso=(async()=>{do{layoutPendente=false;await desenharLayout();}while(layoutPendente);})().finally(()=>{layoutEmCurso=null;});
    return layoutEmCurso;
  }
  async function desenharLayout(){
    await sincronizarAreaMovimento();
    atualizarAtividades();
    const ativo=pronta&&estado&&atores().length>0;
    const caixas={};
    if(ativo){
      const [w,h]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]);
      layoutEfeitos=caixaEfeitos({largura:w,altura:h,quantidade:listarEfeitosHud(ator(),atores()).length});
      const temEfeitos=Boolean(layoutEfeitos),faixaEfeitos=0,margemEsquerda=72,gap=10,acaoAtual=acaoVisivel();
      const reservaInferior=layoutEfeitos?Math.max(48,layoutEfeitos.reservaInferior):48;
      espacoEfeitos=0;
      // A janela começa com uma estimativa e converge pela medida do conteúdo.
      // O limite da carta continua preservado, sem reservar a antiga faixa de log.
      const temCompositor=Boolean(acaoAtual?.composicao||acaoAtual?.compositor),gaveta=acaoAtual?.composicao??acaoAtual?.compositor;
      const alturaAcao=Math.min(590,alturaConteudoAcao,h-96),larguraCartao=Math.min(410,Math.max(300,w*.36));
      const margemDireita=75,larguraDisponivel=Math.max(1,w-margemDireita-8);
      const larguraGaveta=temCompositor?(gaveta?.gavetaAberta===false?30:138):0,larguraAcao=Math.min(larguraDisponivel,larguraCartao+larguraGaveta);
      const acaoLadoALado=Boolean(acaoAtual)&&w>=820+larguraGaveta;
      const leftAcao=Math.round(w-margemDireita-larguraAcao);
      const limiteAtividades=w-10;
      const limiteBarra=acaoLadoALado?leftAcao-gap:limiteAtividades;
      const leftBarra=Math.min(margemEsquerda+faixaEfeitos,Math.max(8,w-308));
      const limiteLargura=Math.max(1,Math.min(1120,limiteBarra-leftBarra));
      const medida=medidasRodape.get(atorId+'/'+linhas);
      const dimensoes=caixaRodape({larguraMaxima:limiteLargura,alturaMaxima:Math.max(80,h-reservaInferior-62),linhas,medida});
      const foraDaOrdem=estado.fase==='preparo'||ator()?.emCombate===false;
      if(!foraDaOrdem||eu.role==='GM'){
        const mesaRecolhida=foraDaOrdem&&eu.role==='GM'&&localStorage.getItem('la-arte/mesa-recolhida')==='1';
        const larguraOrdem=Math.min(mesaRecolhida?80:620,w-12);
        const esquerda=mesaRecolhida?Math.max(6,Math.min(w-larguraOrdem-6,w*.8-larguraOrdem/2)):(w-larguraOrdem)/2;
        layoutMesa={x:Math.round(esquerda),y:4,width:larguraOrdem};
      }else{layoutMesa=null;}
      if(ator()&&!ator().saqueAberto){
        const larguraCorpo=compacto?92:dimensoes.largura,alturaBarra=compacto?102:dimensoes.altura;
        const left=leftBarra,top=h-alturaBarra-reservaInferior;
        layoutRodape={x:left,y:top,width:larguraCorpo,height:alturaBarra,alturaMax:Math.max(80,h-reservaInferior-62)};
        if(temEfeitos)caixas.efeitos=[layoutEfeitos.x,layoutEfeitos.y,layoutEfeitos.width,layoutEfeitos.height];
        if(temEfeitos&&dicaEfeito){
          const dw=Math.min(380,w-16),linhasDica=dicaEfeito.split('\n').length,dh=Math.min(190,h-16,Math.max(82,36+linhasDica*22));
          caixas['dica-efeito']=[Math.max(8,Math.min(w-dw-8,layoutEfeitos.x)),Math.max(8,Math.min(top,layoutEfeitos.y)-dh-8),dw,dh];
        }
      }else{layoutRodape=null;}
      if(estado.fase==='iniciativa'&&atores().some(a=>controla(a)&&a.init===null)){
        const pendentes=atores().filter(a=>a.emCombate!==false&&a.init===null&&(eu.role==='GM'||controla(a))),iw=Math.min(eu.role==='GM'?440:340,w-12),ih=Math.min(h-24,eu.role==='GM'?Math.max(148,108+Math.ceil(pendentes.length/2)*43):118);
        caixas.iniciativa=[Math.round((w-iw)/2),Math.round(Math.max(12,(h-ih)*.40)),iw,ih];
      }
      if(acaoAtual){
        const cw=larguraAcao,ch=alturaAcao,left=leftAcao;
        const top=h-ch-48;
        caixas.acao=[Math.round(left),Math.round(Math.max(62,top)),cw,ch];
      }
      // Botão e gaveta ficam acima do rodapé, inclusive ao expandir a barra.
      const baseAtividades=(layoutRodape?.y??h-48)-10;
      if(atividades.modo==='painel'){
        caixas.atividades=[Math.max(8,w-108),Math.max(8,baseAtividades-52),98,52];
      }else{
        const aw=Math.min(440,w-16),ah=Math.max(1,Math.min(420,h-95,baseAtividades-8));
        caixas.atividades=[Math.round((w-aw)/2),Math.round(Math.max(8,Math.min((h-ah)/2,baseAtividades-ah))),aw,ah];
      }
      const rp=estado.reacaoPendente,reator=atores().find(a=>a.id===rp?.reator);
      if((rp&&controla(reator))||escolhaIniciativa())caixas.reacao=[Math.round((w-Math.min(390,w-12))/2),Math.round(Math.max(60,(h-245)/2)),Math.min(390,w-12),245];
      if(pedidoDado){
        const n=pedidoDado.formulas?.length??pedidoDado.resultado?.resultados?.length??1;
        const extraResultado=pedidoDado.tipo==='resultado'&&pedidoDado.meta?.rerrolagens?.length?105:0;
        const extraAjuste=pedidoDado.tipo!=='resultado'&&pedidoDado.meta?.adicionais?.length?210:0;
        const extrasManuais=(pedidoDado.meta?.adicionais??[]).filter(x=>(pedidoDado.recursosAtivos??[]).includes(x.id)).length;
        let ch=Math.min(h-72,pedidoDado.tipo==='indeterminada'?280+(n+extrasManuais)*82:pedidoDado.tipo==='resultado'?230+n*82+extraResultado:190+n*116+extraAjuste);
        const dw=Math.min(470,larguraDisponivel),left=w-margemDireita-dw;
        let top=Math.max(8,Math.min((h-ch)/2,(layoutRodape?.y??h-48)-10-ch));
        if(caixas.acao){
          // Uma coluna à direita: rolagem acima da carta, com espaço rolável
          // dividido entre ambas quando a altura da tela não comporta tudo.
          const espaco=Math.max(2,h-48-62-10);
          if(ch+caixas.acao[3]>espaco){
            ch=Math.min(ch,Math.max(1,Math.floor(espaco*.4)));
            caixas.acao[3]=Math.max(1,espaco-ch);
          }
          caixas.acao[1]=h-48-caixas.acao[3];
          top=caixas.acao[1]-10-ch;
        }
        caixas.dados=[Math.round(left),Math.round(top),dw,ch];
      }
      if(anuncioDado){
        const n=anuncioDado.resultado?.resultados?.length??1,aw=Math.min(340,w-18),ah=Math.min(100+Math.ceil(n/2)*30,h-18);
        caixas['anuncio-dado']=[9,Math.round(Math.max(9,(h-ah)/2)),aw,ah];
      }
    }
    for(const [parte,base] of [['barra',ativo&&layoutRodape],['ordem',ativo&&layoutMesa]]){
      if(base){if(!documentos.has(parte))documentos.set(parte,crypto.randomUUID());}
      else documentos.delete(parte);
    }
    if(ativo){
      for(const [origem,base] of [['barra',layoutRodape],['ordem',layoutMesa]]){
        const g=geometriasPartes[origem];
        if(!base)continue;
        if(!g||g.atorId!==atorId||Math.abs(g.largura-base.width)>2||origem==='barra'&&(g.linhas!==linhas||g.compacto!==compacto)){
          // Mantém o último quadro visível até a nova medida chegar. Os
          // comandos do ator anterior ficam bloqueados no protocolo e na UI.
          for(const parte of Object.keys(origem==='barra'?gruposRodape:gruposMesa)){
            if(origem==='barra'&&compacto&&parte!=='barra-identidade')continue;
            if(abertos.has(parte))caixas[parte]=JSON.parse(abertos.get(parte));
          }
          continue;
        }
        for(const p of g.partes)caixas[p.parte]=[base.x+p.x,base.y+p.y,p.width,p.height];
      }
      if(dicaRodape&&layoutRodape){
        const w=await OBR.viewport.getWidth(),altura=Math.min(230,layoutRodape.y-12);
        if(altura>50)caixas['barra-dica']=[Math.max(8,Math.min(w-348,layoutRodape.x+90)),Math.max(8,layoutRodape.y-altura-8),Math.min(340,w-16),altura];
      }
    }
    const resultados=await Promise.allSettled(partesHud.map(k=>janela(k,caixas[k])));
    const falhas=resultados.flatMap((r,i)=>r.status==='rejected'?[partesHud[i]+': '+(r.reason?.message??r.reason)]:[]);
    if(falhas.length)throw Error('Falha ao abrir a HUD — '+falhas.join(' · '));
    for(const parte of partesLeves)if(caixas[parte])publicarParte(parte);
    const config=JSON.stringify([layoutRodape?.width,layoutRodape?.alturaMax,layoutMesa?.width,layoutEfeitos?.icone,documentos.get('barra'),documentos.get('ordem')]);
    if(config!==assinaturaMedidores){assinaturaMedidores=config;transmitir();}
  }
  async function limparMarcas(){
    const ids=marcas;marcas=[];
    if(ids.length&&pronta)await OBR.scene.local.deleteItems(ids);
  }
  async function limparMarcasPublicas(){
    const ids=marcasPublicas;marcasPublicas=[];
    if(ids.length&&pronta)await OBR.scene.local.deleteItems(ids);
  }
  async function publicarPrevia(items=marcas){
    if(!pendente)return;
    atividades.acao(resumoPendente(pendente),{propria:true});
    const evento={tipo:'atualizar',id:pendente.publicId,atorId:pendente.cmd.ator,pendente:resumoPendente(pendente,true),marcas:compactarMarcas(items)};
    await OBR.broadcast.sendMessage(canalPrevia,evento,{destination:'REMOTE'}).catch(e=>console.warn('Falha ao publicar a prévia da ação.',e));
  }
  async function fecharPreviaPublica(id,atorIdPublico,status){
    if(!id)return;
    await OBR.broadcast.sendMessage(canalPrevia,{tipo:'fechar',id,atorId:atorIdPublico,status},{destination:'REMOTE'}).catch(e=>console.warn('Falha ao fechar a prévia pública.',e));
  }
  async function desenhar(items){
    if(pendente?.cmd.movimentoDinamico){atualizarPlanoDinamico(pendente);const plano=pendente.planoMovimento;if(plano?.possivel&&plano.distancia>1e-8)items=[...(pendente.cmd.tipo==='usar'?[circulo(origemHabilidade(pendente),pendente.raio*pixelsMetro,'#e5c079'),...items.slice(1)]:items),...seta(pendente.origem,{x:plano.destino.x*pixelsMetro,y:plano.destino.y*pixelsMetro}),circulo({x:plano.destino.x*pixelsMetro,y:plano.destino.y*pixelsMetro},.2*pixelsMetro,'#79cfb1')];}
    await limparMarcas();if(items.length){await OBR.scene.local.addItems(items);marcas=items.map(x=>x.id);}
    await publicarPrevia(items);
  }
  function reconstruirMarcas(lista){
    return lista.map(m=>m.tipo==='linha'
      ?buildLine().startPosition(m.inicio).endPosition(m.fim).strokeColor(m.cor).strokeWidth(m.largura).layer('CONTROL').locked(true).disableHit(true).build()
      :buildCurve().position(m.posicao).points(m.pontos).closed(m.fechada).fillColor(m.preenchimento).fillOpacity(m.opacidade)
        .strokeColor(m.cor).strokeWidth(m.largura).layer('CONTROL').locked(true).disableHit(true).build());
  }
  function seta(origem,fim){
    const ang=Math.atan2(fim.y-origem.y,fim.x-origem.x),tam=Math.min(pixelsMetro*.32,Math.hypot(fim.x-origem.x,fim.y-origem.y)*.3);
    const ponta1={x:fim.x-tam*Math.cos(ang-.55),y:fim.y-tam*Math.sin(ang-.55)};
    const ponta2={x:fim.x-tam*Math.cos(ang+.55),y:fim.y-tam*Math.sin(ang+.55)};
    return [[origem,fim],[fim,ponta1],[fim,ponta2]].map(([a,b])=>buildLine().startPosition(a).endPosition(b).strokeColor('#e54848').strokeWidth(5).layer('CONTROL').locked(true).disableHit(true).build());
  }
  function setaAlvo(origem,fim,indice=0,total=1,cor='#e5c079'){
    const dx=fim.x-origem.x,dy=fim.y-origem.y,tamLinha=Math.hypot(dx,dy)||1,offset=(indice-(total-1)/2)*pixelsMetro*.12;
    const ox=-dy/tamLinha*offset,oy=dx/tamLinha*offset,a={x:origem.x+ox,y:origem.y+oy},b={x:fim.x+ox,y:fim.y+oy};
    const ang=Math.atan2(b.y-a.y,b.x-a.x),tam=Math.min(pixelsMetro*.22,tamLinha*.22),p1={x:b.x-tam*Math.cos(ang-.5),y:b.y-tam*Math.sin(ang-.5)},p2={x:b.x-tam*Math.cos(ang+.5),y:b.y-tam*Math.sin(ang+.5)};
    return [[a,b],[b,p1],[b,p2]].map(([x,y])=>buildLine().startPosition(x).endPosition(y).strokeColor(cor).strokeWidth(4).layer('CONTROL').locked(true).disableHit(true).build());
  }
  function setaDeslocamento(origem,fim){
    const ang=Math.atan2(fim.y-origem.y,fim.x-origem.x),tam=Math.min(pixelsMetro*.28,Math.hypot(fim.x-origem.x,fim.y-origem.y)*.3);
    const p1={x:fim.x-tam*Math.cos(ang-.52),y:fim.y-tam*Math.sin(ang-.52)},p2={x:fim.x-tam*Math.cos(ang+.52),y:fim.y-tam*Math.sin(ang+.52)};
    return [[origem,fim],[fim,p1],[fim,p2]].map(([a,b])=>buildLine().startPosition(a).endPosition(b).strokeColor('#ffffff').strokeWidth(5).layer('CONTROL').locked(true).disableHit(true).build());
  }
  function marcasDeslocamento(rule,origem,alvos){
    const regra=rule?.deslocamentoForcado;if(!regra)return [];
    return alvos.flatMap(alvo=>{const inicio=pos(alvo),fim=destinoDeslocamento(origem,inicio,regra.distanciaM*pixelsMetro);return fim?[...setaDeslocamento(inicio,fim),circulo(fim,pixelsMetro*.2,'#ffffff')]:[];});
  }
  // #65 Prévia do Destruidor de Hordas: círculo de 1,5 m no alvo anterior e destaque das criaturas elegíveis.
  function marcasDestruidor(centroId,raioM,elegiveis){
    const centro=atores().find(a=>a.id===centroId);if(!centro)return [];
    return [circulo(pos(centro),raioM*pixelsMetro,'#f2a64e'),...elegiveis.flatMap(ref=>{const alvo=atores().find(a=>a.id===ref.id);return alvo?[circulo(pos(alvo),pixelsMetro*METROS_POR_CELULA*.5,'#ffcf75')]:[];})];
  }
  function marcasDestruidorAvulso(p){
    if(!p.rule?.usarArmaAnterior)return [];
    const oferta=ofertaDestruidorDeHordas(estadoDaCena(),{...ator(),...geometria(ator())},{ignorarAlcance:movimentoDinamico});
    return oferta?marcasDestruidor(oferta.centroAtorId,oferta.raioM,oferta.alvos):[];
  }
  function elegiveisDestruidorNaComposicao(p){
    const modo=p?.composicao?.modos.find(m=>m.id===p.composicao.modoAtivo),anterior=p?.cmd?.composicao?.at(-1),a=ator();
    if(!modo?.destruidorDeHordas||!anterior||!a)return null;
    const def=(opcoesDisponiveis(a).find(o=>o.id===p.cmd.opcao)?.composicao?.modos??[]).find(m=>m.id===anterior.modoId);
    const alvos=alvosElegiveisDestruidor(estadoDaCena(),{...a,...geometria(a)},{alvoOriginalId:anterior.alvoId,alcanceM:def?.automacao?.alcanceM,raioM:modo.destruidorDeHordas.raioM,ignorarAlcance:movimentoDinamico,jaAtacados:p.cmd.composicao.map(x=>x.alvoId)});
    return {centroId:anterior.alvoId,raioM:modo.destruidorDeHordas.raioM,alvos};
  }
  function marcasComposicao(p){
    const hb=elegiveisDestruidorNaComposicao(p),extras=hb?marcasDestruidor(hb.centroId,hb.raioM,hb.alvos):[];
    return [...extras,...marcasInstancias(p)];
  }
  function marcasInstancias(p){
    const instancias=p?.composicao?.instancias??[],contagem={};
    for(const x of instancias)contagem[x.alvoId]=(contagem[x.alvoId]??0)+1;
    const vistos={};
    return instancias.flatMap(x=>{
      const alvo=atores().find(a=>a.id===x.alvoId);if(!alvo)return [];
      const i=vistos[x.alvoId]??0;vistos[x.alvoId]=i+1;
      const modo=p.composicao.modos.find(m=>m.id===x.modoId),cor=modo?.tipo==='cura'?'#67dca0':'#e5c079';
      return [...setaAlvo(p.origem,pos(alvo),i,contagem[x.alvoId],cor),circulo(pos(alvo),pixelsMetro*METROS_POR_CELULA*.46,cor)];
    });
  }
  async function atualizarPreviaAdicionais(){
    if(!pendente)return;
    const extras=(pedidoDado?.meta?.adicionais??[]).filter(x=>(pedidoDado?.recursosAtivos??[]).includes(x.id)&&x.previsualizacaoArea),items=[...(pendente.marcasBase??[])];
    for(const extra of extras){
      const area=extra.previsualizacaoArea,centro=atores().find(a=>a.id===area.centroAtorId);if(!centro)continue;
      items.push(circulo(pos(centro),area.raioM*pixelsMetro,'#f2a64e'));
      for(const ref of area.alvos??[]){const alvo=atores().find(a=>a.id===ref.id);if(alvo)items.push(circulo(pos(alvo),pixelsMetro*METROS_POR_CELULA*.5,'#ffcf75'));}
    }
    await desenhar(items);
  }
  async function cancelar(status='Cancelada'){
    const publicId=pendente?.publicId,atorIdPublico=pendente?.cmd?.ator;pendente=null;atividades.concluir(publicId,status);await limparMarcas();await fecharPreviaPublica(publicId,atorIdPublico,status);
    if(!(movimentoDinamico&&estado?.fase==='turnos')&&anterior&&anterior!==tool&&await OBR.tool.getActiveTool()===tool)await OBR.tool.activateTool(anterior);
    anterior=null;
  }
  function atualizarPlanoDinamico(p){
    if(!p?.cmd?.movimentoDinamico||p.rolagem)return;
    const c=p.cmd,a=ator();if(!a||c.tipo==='mover'&&!Number.isFinite(c.x)||c.tipo==='usar'&&!c.alvo&&!c.alvos?.length&&!c.ponto){p.planoMovimento=null;p.custos=(p.custos??[]).filter(x=>x.tipo!=='movimento');return;}
    const cena=estadoDaCena(),geo=cena.atores.find(x=>x.id===a.id),o=p.opcaoPublica;
    const plano=planejarMovimentoDinamico(cena,geo,c,o,{levantar:temCondicao(a,'caido')?deslocamentoMaximo(a)/2:0});p.planoMovimento=plano;
    p.custos=[...(p.custos??[]).filter(x=>x.tipo!=='movimento'),{tipo:'movimento',nome:'Movimento (m)',quantidade:Number((plano.custo??0).toFixed(2)),saldo:Number(a.metros.toFixed(2)),maximo:deslocamentoMaximo(a)}];
    p.pronto=plano.possivel&&(p.escolha!=='lista'||(c.alvos?.length??0)>=(p.composicao?.quantidadeMinima??p.regraLista?.min??1));
    if(!plano.possivel){p.detalhe=plano.motivo;}
    else if(plano.distancia>1e-8){
      const contato=primeiroContato(cena.zonas,geo,plano.destino,geo),ameacas=geo.desengajado?[]:oportunidades(cena,geo,plano.destino);
      p.detalhe=p.detalhe.replace(/ · Movimento:.*$/,'')+' · Movimento: '+medida(plano.custo)+(contato?' · atravessa '+contato.zona.nome:'')+(ameacas.length?' · oportunidade: '+ameacas.map(x=>cena.atores.find(a=>a.id===x.reator)?.nome).join(', '):'');
    }
  }
  function conferirPlanoDinamico(p,cmd){
    if(!p.cmd.movimentoDinamico)return;
    const cena=estadoDaCena(),a=cena.atores.find(x=>x.id===cmd.ator);
    const plano=planejarMovimentoDinamico(cena,a,cmd,p.opcaoPublica,{levantar:temCondicao(a,'caido')?deslocamentoMaximo(a)/2:0});
    if(!plano.possivel)throw Error(plano.motivo);
  }
  async function preparar(d){
    const a=ator();
    if(!controla(a))return;
    await cancelar();
    const base=opcoesDisponiveis(a).find(o=>o.id===d.opcao),circulos=circulosConjuracao(a,base),circuloUsado=d.circuloUsado??(circulos[0]??base?.circuloBase),duplicadaDisponivel=Boolean(base&&metamagiaDuplicada(a,base)),magiaDuplicada=duplicadaDisponivel&&d.magiaDuplicada===true;
    const ilusaoDisponivel=Boolean(base?.automacao?.ilusao),ilusaoCausaDano=ilusaoDisponivel&&d.ilusaoCausaDano===true; // Força Fantasmagórica
    let o=base?derivarOpcaoCirculo(a,base,circuloUsado,{magiaDuplicada}):base,rule=o?.automacao;
    if(o?.gatilho==='rolar_iniciativa')throw Error('Use esta habilidade somente na janela de Iniciativa.');
    if(a.reacaoIniciativa)throw Error('Resolva a escolha de Iniciativa antes de agir.');
    const oferta=rule?.usarArmaAnterior?ofertaDestruidorDeHordas(estadoDaCena(),{...a,...geometria(a)},{ignorarAlcance:movimentoDinamico}):null;
    if(rule?.usarArmaAnterior){
      if(!oferta)throw Error('Faça antes um ataque com arma e confira o limite de Destruidor de Hordas.');
      const anterior=a.eventosTurno.ataques.at(-1),arma=opcoesDisponiveis(a).find(x=>x.id===anterior.opcao);
      rule={...structuredClone(arma.automacao),usarArmaAnterior:true};
      o={...o,automacao:rule};
    }
    const reacao=o?.custo?.some(c=>c.tipo==='reacao');
    if(d.tipo==='usar'&&!o)return;
    const foraCombate=d.tipo==='usar'&&(estado.fase==='preparo'||a.emCombate===false);
    if(d.tipo!=='iniciativa'&&!reacao&&!foraCombate&&atual(estado)?.id!==a.id)return;
    const cmd={...(movimentoDinamico&&!foraCombate&&!reacao&&d.tipo==='usar'||d.dinamico?{movimentoDinamico:true}:{}),tipo:reacao?'reagir':d.tipo,ator:a.id,rev:estado.rev,opcao:base?.id,assistido:!rule,modoCusto:d.modoCusto??'automatico',...(circulos.length?{circuloUsado}: {}),...(magiaDuplicada?{magiaDuplicada:true}:{}),...(ilusaoCausaDano?{ilusaoCausaDano:true}:{})};
    let escolha=null;
    if(d.tipo==='mover'||rule?.tipo==='teleporte')escolha='destino';
    if(['invocar','peca'].includes(rule?.tipo))escolha='area'; // M06: escolher o ponto onde a entidade/peça aparece
    else if(['ataque','salva','efeito','cura','pv_temporario','estabilizar','conceder_dado','saque','prototipo'].includes(rule?.tipo))escolha=(rule.raioM||rule.area)?(rule.origemArea==='conjurador'&&!['cone','linha'].includes(rule.area?.forma)?null:'area'):'alvo';
    if(rule?.pessoal)escolha=null;
    if(multi(o)){escolha='lista';cmd.alvos=[];}
    if(o?.composicao){escolha='lista';cmd.alvos=[];cmd.composicao=[];}
    const titulo=o?.nome??({passar:'Finalizar turno',mover:'Mover',iniciativa:'Rolar iniciativa'})[d.tipo];
    pendente={publicId:crypto.randomUUID(),cmd,opcaoPublica:o,regraLista:multi(o),rev:estado.rev,escolha,rule,titulo,pronto:!escolha,rolagem:false,custos:custosPrevia(a,o,cmd.modoCusto),
      substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:rule?.tempoSegundos?'Conjuração de '+(rule.tempoSegundos/60)+' min: selecione o corpo/beneficiários e inicie; depois avance o tempo ou mantenha a ação nos turnos.':reacao?'Conferir gatilho e gastar a reação.':o&&!rule?'Efeito assistido pelo mestre.':a.nome};
    if(circulos.length>1||duplicadaDisponivel||ilusaoDisponivel)pendente.compositor={gavetaAberta:true,circulos,circuloAtivo:circuloUsado,...(duplicadaDisponivel?{duplicadaDisponivel:true,magiaDuplicada}:{}),...(ilusaoDisponivel?{ilusaoDisponivel:true,ilusaoCausaDano}:{})};
    if(o?.composicao)pendente.composicao={gavetaAberta:true,custosPorModo:o.composicao.custosPorModo,modoPadrao:o.composicao.modoPadrao,modoAtivo:o.composicao.modoPadrao,quantidadeMinima:o.composicao.quantidadeMinima,quantidadeMaxima:o.composicao.quantidadeMaxima,modos:structuredClone(o.composicao.modos.map(m=>({id:m.id,nome:m.nome,visual:visualHabilidade({...m,categoria:o.categoria,origem:o.origem,origemTipo:o.origemTipo},a.ficha),descricao:m.descricao,tipo:m.tipo,custo:structuredClone(m.custo??[]),ateOrdem:m.ateOrdem,limitePorUso:m.limitePorUso,ordem:m.ordem,requerModoAnterior:m.requerModoAnterior,umaVezPorTurno:m.umaVezPorTurno,destruidorDeHordas:m.destruidorDeHordas}))),instancias:[]};

    if(escolha){
      pixelsMetro=pixelsPorMetro(await OBR.scene.grid.getDpi());
      const origem=pos(a),alcanceComposicao=Math.max(0,...(o?.composicao?.modos??[]).map(m=>Number(m.automacao?.alcanceM)||0)),raio=escolha==='destino'?(d.tipo==='mover'?a.metros:rule.alcanceM):(o?.composicao?alcanceComposicao:rule.alcanceM);
      pendente.origem=origem;pendente.raio=raio;
      const direcional=['cone','linha'].includes(rule?.area?.forma);
      pendente.detalhe=(direcional?'Aponte e clique para travar '+(rule.area.forma==='cone'?'o cone':'a linha'):{destino:'Marque o destino no mapa',area:'Marque o centro da área',alvo:'Clique no token do alvo'}[escolha])+' · '+medida(raio);
      if(escolha==='lista')pendente.detalhe='Selecione no mapa · 0/'+(o.composicao?.quantidadeMaxima??o.selecao.max);
      anterior=await OBR.tool.getActiveTool();
      await OBR.tool.activateTool(tool);await OBR.tool.activateMode(tool,mode);
      if(oferta){pendente.detalhe=oferta.alvos.length?'Alvos elegíveis: '+oferta.alvos.map(x=>x.nome).join(', '):'Nenhuma criatura elegível a '+medida(oferta.raioM)+' do alvo anterior.';pendente.marcasBase=[circulo(origem,raio*pixelsMetro,'#e5c079'),...marcasDestruidor(oferta.centroAtorId,oferta.raioM,oferta.alvos)];}
      await desenhar(pendente.marcasBase??[circulo(origem,raio*pixelsMetro,'#e5c079')]);
    }else await publicarPrevia([]);
  }
  async function atualizarLista(p){
    const ids=p.cmd.alvos;
    if(p.composicao){
      const o=opcoesDisponiveis(ator()).find(o=>o.id===p.cmd.opcao);p.custos=custosPrevia(ator(),o,p.cmd.modoCusto,p.cmd.composicao);
      p.composicao.instancias=(p.cmd.composicao??[]).map((x,i)=>{const modo=p.composicao.modos.find(m=>m.id===x.modoId),alvo=atores().find(a=>a.id===x.alvoId);return {...x,ordem:i+1,modoNome:modo?.nome??x.modoId,alvoNome:alvo?.nome??'Alvo'};});
      p.pronto=p.composicao.instancias.length>=p.composicao.quantidadeMinima;
      p.detalhe='Componha a habilidade · '+p.composicao.instancias.length+'/'+p.composicao.quantidadeMaxima+(p.composicao.instancias.length?' · '+p.composicao.instancias.map(x=>x.ordem+'. '+x.modoNome+' → '+x.alvoNome).join(' · '):'');
      const items=[circulo(p.origem,p.raio*pixelsMetro,'#e5c079'),...marcasComposicao(p)];p.marcasBase=items;
      await desenhar(items);await layout();transmitir();return;
    }
    const unicos=[...new Set(ids)].map(id=>atores().find(a=>a.id===id));
    p.pronto=ids.length>=p.regraLista.min;p.detalhe='Selecione no mapa · '+ids.length+'/'+p.regraLista.max+(ids.length?' · '+unicos.map(a=>a.nome+' ×'+ids.filter(id=>id===a.id).length).join(', '):'');
    const contagem=Object.fromEntries(unicos.map(a=>[a.id,ids.filter(id=>id===a.id).length])),vistos={};
    const trajetorias=ids.flatMap(id=>{const alvo=atores().find(a=>a.id===id),i=vistos[id]??0;vistos[id]=i+1;return setaAlvo(p.origem,pos(alvo),i,contagem[id]);});
    const items=[circulo(p.origem,p.raio*pixelsMetro,'#e5c079'),...unicos.map(a=>circulo(pos(a),pixelsMetro*METROS_POR_CELULA*.5,'#79cfb1')),...trajetorias,...marcasDeslocamento(p.rule,p.origem,unicos)];p.marcasBase=items;await desenhar(items);
    await layout();transmitir();
  }
  async function sincronizarTokens(items){
    if(!estado)return;
    const assinatura=t=>JSON.stringify([t.position,hitboxToken(t)]);
    const ids=new Set([...atores().map(a=>a.token),...(estado.recipientes??[]).flatMap(r=>[r.tokenId,idSelecaoRecipiente(r)])].filter(Boolean)),antes=new Map(tokens.map(t=>[t.id,assinatura(t)]));
    const proximos=items.filter(t=>ids.has(t.id)),mudou=proximos.some(t=>{return antes.get(t.id)!==assinatura(t);});
    tokens=proximos;if(!mudou)return;
    const p=pendente,a=ator();
    if(!p?.escolha||!a){transmitir();return;}
    p.origem=pos(a);atualizarPlanoDinamico(p);
    if(p.escolha==='lista'){await atualizarLista(p);return;}
    if(p.escolha==='destino'){
      p.pronto=false;delete p.cmd.x;delete p.cmd.y;delete p.ponto;
      p.detalhe='Marque o destino no mapa · '+medida(p.raio);
      await desenhar([circulo(p.origem,p.raio*pixelsMetro,'#e5c079')]);transmitir();return;
    }
    const alvoSelecionado=p.cmd.alvo?atores().find(x=>x.id===p.cmd.alvo):null;
    let ponto=alvoSelecionado?pos(alvoSelecionado):p.ponto;
    if(!ponto){await desenhar([circulo(p.origem,p.raio*pixelsMetro,'#e5c079'),...marcasDestruidorAvulso(p)]);transmitir();return;}
    const distancia=alvoSelecionado?distanciaAlvo(p.origem,alvoSelecionado):Math.hypot(ponto.x-p.origem.x,ponto.y-p.origem.y)/pixelsMetro,temArea=Boolean(p.rule?.raioM||p.rule?.area);
    p.pronto=distancia<=p.raio+1e-8;
    const alvosDeslocados=p.cmd.alvo?[alvoSelecionado].filter(Boolean):temArea?alvosAreaPrevista(p,ponto,origemHabilidade(p)):[];
    const direcional=['cone','linha'].includes(p.rule?.area?.forma),origemVetor=temArea?(direcional?origemHabilidade(p):ponto):p.origem;
    const marcas=[circulo(p.origem,p.raio*pixelsMetro,'#e5c079'),...marcasDestruidorAvulso(p),...(temArea?marcaArea(p.rule,origemHabilidade(p),ponto,pixelsMetro):[circulo(ponto,.43*METROS_POR_CELULA*pixelsMetro,'#79cfb1')]),...marcasDeslocamento(p.rule,origemVetor,alvosDeslocados)];
    if(p.cmd.alvo)marcas.push(...setaAlvo(p.origem,ponto));
    p.marcasBase=marcas;await desenhar(marcas);
    const alvo=p.cmd.alvo?atores().find(x=>x.id===p.cmd.alvo):null;
    p.ponto=ponto;p.detalhe=(alvo?alvo.nome+' · ':'')+medida(distancia)+(p.pronto?'':' · fora do alcance');
    await layout();transmitir();
  }
  async function escolher(evento){
    if(atividades.pausada||atividadeAtual()?.id!==pendente?.publicId)return;
    const p=pendente;if(!p?.escolha||ocupado)return;
    let ponto=evento.pointerPosition;
    if(p.rule?.tipo==='saque'){
      const r=(estado.recipientes??[]).find(r=>{
        const imagem=tokens.find(t=>t.id===r.tokenId),hit=tokens.find(t=>t.id===idSelecaoRecipiente(r));
        return Boolean(imagem||hit)&&imagem?.visible!==false&&hit?.visible!==false&&(evento.target?.id===r.tokenId||evento.target?.id===idSelecaoRecipiente(r)||pontoNoRecipiente(ponto,r,pixelsMetro,imagem,hit));
      });
      if(r){
        if(r.trancado)throw Error('O recipiente está trancado.');
        const t=tokens.find(t=>t.id===idSelecaoRecipiente(r))??tokens.find(t=>t.id===r.tokenId),centro=t?.position??{x:r.posicaoM.x*pixelsMetro,y:r.posicaoM.y*pixelsMetro};
        const d=Math.hypot(centro.x-p.origem.x,centro.y-p.origem.y)/pixelsMetro;
        if(d>1.5+1e-8)throw Error('O recipiente está a mais de 1,5 m.');
        delete p.cmd.alvo;p.cmd.recipienteId=r.id;p.cmd.tokenId=r.tokenId;p.pronto=true;p.detalhe=r.nome+' · '+medida(d);p.ponto=centro;
        await desenhar([circulo(p.origem,p.raio*pixelsMetro,'#e5c079'),circulo(centro,pixelsMetro/2,'#79cfb1')]);await layout();transmitir();return;
      }
      delete p.cmd.recipienteId;delete p.cmd.tokenId;
    }
    let alvo;
    if(p.escolha==='alvo'||p.escolha==='lista'){
      alvo=atores().find(a=>a.token===evento.target?.id);
      if(!alvo)alvo=atores().filter(a=>token(a)).sort((a,b)=>dist(a)-dist(b)).find(a=>dist(a)<=raioAlvo(geometria(a))*pixelsMetro+1e-8);
      function dist(a){const c=centroAlvo(geometria(a));return Math.hypot(c.x*pixelsMetro-ponto.x,c.y*pixelsMetro-ponto.y);}
      if(!alvo)throw Error('Clique em um participante visível.');ponto=pos(alvo);
    }
    if(p.rule?.usarArmaAnterior){
      const oferta=ofertaDestruidorDeHordas(estadoDaCena(),{...ator(),...geometria(ator())},{ignorarAlcance:movimentoDinamico});
      if(!oferta?.alvos.some(x=>x.id===alvo?.id))throw Error('Destruidor de Hordas: escolha uma criatura destacada e ainda não atacada neste turno.');
    }
    const d=alvo?distanciaAlvo(p.origem,alvo):Math.hypot(ponto.x-p.origem.x,ponto.y-p.origem.y)/pixelsMetro;
    if(d>p.raio+1e-8&&(!p.cmd.movimentoDinamico||p.escolha==='destino')){
      if(p.cmd.movimentoDinamico&&p.escolha==='destino'){delete p.cmd.x;delete p.cmd.y;delete p.ponto;await desenhar([circulo(p.origem,p.raio*pixelsMetro,'#e5c079')]);}
      p.pronto=false;await layout();transmitir();throw Error('Fora do alcance. Escolha outro ponto.');
    }
    if(p.escolha==='lista'){
      if(p.composicao){
        const modo=p.composicao.modos.find(m=>m.id===p.composicao.modoAtivo),def=(opcoesDisponiveis(ator()).find(o=>o.id===p.cmd.opcao)?.composicao?.modos??[]).find(m=>m.id===modo?.id);
        if(!modo||!def)throw Error('Escolha um modo válido na Gaveta de Composição.');
        if(!p.cmd.movimentoDinamico&&d>(def.automacao?.alcanceM??p.raio)+1e-8)throw Error(modo.nome+' está fora do alcance.');
        const usados=(p.cmd.composicao??[]).filter(x=>x.modoId===modo.id).length;
        if(modo.limitePorUso&&usados>=modo.limitePorUso)throw Error('O limite de '+modo.nome+' foi atingido.');
        const indice=(p.cmd.composicao?.length??0)+1,anterior=p.cmd.composicao?.at(-1);
        if(modo.ateOrdem&&indice>modo.ateOrdem)throw Error(modo.nome+' só pode substituir um dos golpes iniciais.');
        if(modo.ordem&&modo.ordem!==indice)throw Error(modo.nome+' deve ocupar a etapa '+modo.ordem+'.');
        if(modo.requerModoAnterior&&anterior?.modoId!==modo.requerModoAnterior)throw Error(modo.nome+' exige a etapa anterior da composição.');
        if((p.cmd.composicao?.length??0)>=p.composicao.quantidadeMaxima)throw Error('Composição completa. Desfaça uma escolha para trocar o alvo.');
        if(modo.destruidorDeHordas){const hb=elegiveisDestruidorNaComposicao(p);if(!hb)throw Error(modo.nome+' exige um ataque com arma na etapa anterior.');if(!hb.alvos.some(x=>x.id===alvo.id))throw Error(modo.nome+': escolha uma criatura destacada, a até '+medida(hb.raioM)+' do alvo anterior e ainda não atacada.');}
        const opcao=opcoesDisponiveis(ator()).find(o=>o.id===p.cmd.opcao),plano=planoCustoOpcao(ator(),opcao,p.cmd.modoCusto,[...p.cmd.composicao,{modoId:modo.id,alvoId:alvo.id}]);
        const fora=estado.fase==='preparo'||ator().emCombate===false;
        if(plano?.custos.some(c=>c.tipo==='recurso'?(ator().rec?.[c.id]??0)<c.quantidade:!fora&&(ator()[c.tipo]??0)<c.quantidade))throw Error('Saldo insuficiente para adicionar '+modo.nome+'.');
        conferirPlanoDinamico(p,{...p.cmd,composicao:[...p.cmd.composicao,{modoId:modo.id,alvoId:alvo.id}]});
        p.cmd.alvos.push(alvo.id);p.cmd.composicao.push({modoId:modo.id,alvoId:alvo.id});
        const proximaOrdem=p.cmd.composicao.length+1,proximo=p.composicao.modos.find(m=>(!m.ordem||m.ordem===proximaOrdem)&&(!m.ateOrdem||proximaOrdem<=m.ateOrdem)&&(!m.requerModoAnterior||m.requerModoAnterior===modo.id)&&(!m.limitePorUso||(p.cmd.composicao??[]).filter(x=>x.modoId===m.id).length<m.limitePorUso));
        if(proximo)p.composicao.modoAtivo=proximo.id;
        await atualizarLista(p);return;
      }
      const novosAlvos=incluirAlvo(p.cmd.alvos,alvo.id,p.regraLista);conferirPlanoDinamico(p,{...p.cmd,alvos:novosAlvos});p.cmd.alvos=novosAlvos;
      await atualizarLista(p);return;
    }
    const celula={x:ponto.x/pixelsMetro,y:ponto.y/pixelsMetro};
    conferirPlanoDinamico(p,{...p.cmd,...(alvo?{alvo:alvo.id}:{}),...(p.escolha==='area'?{ponto:celula}:{}),...(p.escolha==='destino'?celula:{})});
    if(alvo)p.cmd.alvo=alvo.id;
    if(p.escolha==='area')p.cmd.ponto=celula;
    if(p.escolha==='destino')Object.assign(p.cmd,celula);
    atualizarPlanoDinamico(p);
    const temArea=Boolean(p.rule?.raioM||p.rule?.area),afetados=temArea?alvosAreaPrevista(p,ponto,origemHabilidade(p)):alvo?[alvo]:[];
    const direcional=['cone','linha'].includes(p.rule?.area?.forma),origemVetor=temArea?(direcional?origemHabilidade(p):ponto):p.origem;
    const items=[circulo(p.origem,p.raio*pixelsMetro,'#e5c079'),...marcasDestruidorAvulso(p),...(temArea?marcaArea(p.rule,origemHabilidade(p),ponto,pixelsMetro):[circulo(ponto,.43*METROS_POR_CELULA*pixelsMetro,'#79cfb1')]),...marcasDeslocamento(p.rule,origemVetor,afetados)];
    if(alvo)items.push(...setaAlvo(p.origem,ponto));
    let contatoZona=null,terrenoZona=0;
    if(p.escolha==='destino'){
      const origemM={x:p.origem.x/pixelsMetro,y:p.origem.y/pixelsMetro},destinoM={x:ponto.x/pixelsMetro,y:ponto.y/pixelsMetro};
      contatoZona=primeiroContato(estado?.zonas,origemM,destinoM,ator());terrenoZona=terrenoDificilDasZonas(estado?.zonas,origemM,destinoM,ator());
      const linha=(a,b,cor)=>buildLine().startPosition(a).endPosition(b).strokeColor(cor).strokeWidth(4).layer('CONTROL').disableHit(true).build();
      if(contatoZona){const corte={x:contatoZona.ponto.x*pixelsMetro,y:contatoZona.ponto.y*pixelsMetro};items.push(linha(p.origem,corte,'#f2d398'),linha(corte,ponto,'#e54848'));}
      else items.push(linha(p.origem,ponto,'#f2d398'));
    }
    await desenhar(items);
    const forma=p.rule?.area?.forma??(p.rule?.raioM?'círculo':'');p.ponto=ponto;p.pronto=true;p.detalhe=(alvo?alvo.nome+' · ':'')+medida(d)+(temArea?' · '+forma+(['cone','linha'].includes(forma)?' travado':'')+' · '+(afetados.map(a=>a.nome).join(', ')||'área vazia'):'')+(p.rule?.deslocamentoForcado?' · seta branca: destino do alvo':'')+(contatoZona?' · entra em '+contatoZona.zona.nome+(terrenoZona?' (terreno difícil: +'+medida(terrenoZona)+')':''):'');
    if(p.escolha==='destino'&&!ator().desengajado){
      const ameacas=oportunidades(estadoDaCena(),{...ator(),...geometria(ator())},celula)
        .map(x=>({ator:atores().find(a=>a.id===x.reator),ponto:{x:x.ponto.x*pixelsMetro,y:x.ponto.y*pixelsMetro},t:x.t})).filter(x=>token(x.ator));
      if(ameacas.length){
        ameacas.sort((a,b)=>a.t-b.t);p.detalhe+=' · Reação antes de confirmar: '+ameacas.map(x=>x.ator.nome).join(', ');
        for(const x of ameacas)items.push(...seta(pos(x.ator),x.ponto));
      }
    }
    p.marcasBase=items;await desenhar(items);
    await layout();transmitir();
  }
  async function atualizar(s,i){
    if(!pronta||encerrado)return;
    const novoTurno=atual(s)?.id!==atual(estado??{ordem:[],atores:[]})?.id;
    // Em preparacao o HUD tambem e a central de uso livre. Uma atualizacao da
    // sala com a mesma revisao nao pode fechar a selecao recem-aberta.
    if(pendente&&!pendente.rolagem){pendente.rev=s.rev;pendente.cmd.rev=s.rev;}
    estado=s;eu=i;
    for(const a of atividades.lista.values())if(a.atorId&&!s.atores.some(x=>x.id===a.atorId)){atividades.lista.delete(a.id);const ids=marcasPorAtividade.get(a.id)??[];if(ids.length)await OBR.scene.local.deleteItems(ids);marcasPorAtividade.delete(a.id);}
    pixelsMetro=pixelsPorMetro(await OBR.scene.grid.getDpi());
    await sincronizarZonas().catch(e=>console.error('Zonas:',e));
    await sincronizarPecas().catch(e=>console.error('Peças:',e));
    if(acaoPublica&&!atores().some(a=>a.id===acaoPublica.atorId)){acaoPublica=null;await limparMarcasPublicas();}
    const ativo=atual(s);
    if(!controla(ator())||novoTurno)atorId=(controla(ativo)?ativo:atores().find(controla))?.id;
    if(novoTurno||s.fase==='preparo'){
      const selecionada=await OBR.tool.getActiveTool();
      if(s.fase==='turnos'&&controla(ativo)&&selecionada==='rodeo.owlbear.tools/move'){
        ferramentaDoTurno=selecionada;await OBR.tool.activateTool(tool);
      }else if(ferramentaDoTurno&&(!controla(ativo)||s.fase!=='turnos')){
        if(selecionada===tool)await OBR.tool.activateTool(ferramentaDoTurno);
        ferramentaDoTurno=null;
      }
    }
    tokens=await OBR.scene.items.getItems([...atores().map(a=>a.token),...(estado.recipientes??[]).flatMap(r=>[r.tokenId,idSelecaoRecipiente(r)])].filter(Boolean));
    // O background permanece vivo mesmo quando o painel da ficha está fechado.
    const saque=atores().find(a=>a.saqueAberto&&controla(a));
    if(saque&&saque.saqueAberto.id!==saqueAbertoVisual){
      try{
        localStorage.setItem(ns+'/abrir-ficha/'+OBR.room.id,JSON.stringify({id:saque.id,quando:Date.now(),pagina:'inventario'}));
        await OBR.action.open();if(await abrirJanelaInventario('saque',saque.id,saque.saqueAberto.id))saqueAbertoVisual=saque.saqueAberto.id;
      }catch(e){console.warn('Abrir saque:',e);await OBR.notification.show('Não foi possível abrir o saque: '+e.message,'ERROR');}
    }else if(!saque)saqueAbertoVisual=null;
    const oferta=trocaParaUsuario(s,i,atorId);
    if(oferta&&oferta.troca.id+'/'+oferta.ator.id!==trocaAbertaVisual){
      try{if(await abrirJanelaInventario('troca',oferta.ator.id,oferta.troca.id))trocaAbertaVisual=oferta.troca.id+'/'+oferta.ator.id;}
      catch(e){console.warn('Abrir troca:',e);await OBR.notification.show('Não foi possível abrir a troca: '+e.message,'ERROR');}
    }else if(!oferta&&trocaAbertaVisual){await OBR.popover.close(ns+'/troca').catch(()=>{});trocaAbertaVisual=null;}
    await layout();transmitir();
  }
  async function mensagem(d){
    if(d.presenca){if(!documentos.has(d.presenca)||d.documentoHud!==documentos.get(d.presenca))return;presencas.set(d.presenca,Date.now());pings.delete(d.presenca);if(partesLeves.includes(d.presenca))publicarParte(d.presenca,true);if(d.presenca==='barra'&&typeof d.compacto==='boolean'&&d.compacto!==compacto)transmitir();return;}
    if(d.entradaHud){if(!documentos.has(d.entradaHud)||d.documentoHud!==documentos.get(d.entradaHud))return;if(d.pressionado)ponteiros.add(d.entradaHud);else{ponteiros.delete(d.entradaHud);retomarLayout();}return;}
    if(d.tipo==='restaurarJanelas'){ponteiros.clear();ponteiroMapa=false;layoutAguardandoPonteiro=false;registrar('recuperacao-manual');await Promise.all([...partesHud,...popoversAntigos].map(parte=>OBR.popover.close(ns+'/hud/'+parte).catch(()=>{})));abertos.clear();documentos.clear();presencas.clear();pings.clear();await layout();transmitir();return;}
    if(d.tipo==='cancelarExecucao'){
      await api.enviar({tipo:d.tipo,execucaoId:d.id,confirmado:d.confirmado===true,rev:estado.rev});return;
    }
    if(d.tipo==='assumirPedido'&&eu.role==='GM'){await responderDado({pedido:d.id,assumir:true});return;}
    if(d.tipo==='resultadoManual'&&eu.role==='GM'){
      await responderDado({pedido:d.pedido,etapaVersao:d.etapaVersao,manual:{totais:d.totais,natural:d.natural}});return;
    }
    if(d.tipo==='rascunhoDado'){
      if(pedidoDado?.pedido!==d.pedido||pedidoDado.podeEditar===false)return;
      pedidoDado.rascunho={formula:d.formula,formulas:d.formulas};atividades.dado(pedidoDado);return;
    }
    if(['alternarAtividades','selecionarAtividade','fecharAtividade','recolherAtividades'].includes(d.tipo)){
      if(d.tipo==='fecharAtividade')atividades.fecharVisual();else if(d.tipo==='recolherAtividades')atividades.recolherBarra();else if(d.tipo==='alternarAtividades')atividades.alternar();else atividades.selecionar(d.id,d.abrir===true);
      localStorage.setItem(ns+'/atividades-modo',atividades.modo);await layout();transmitir();return;
    }
    if(d.pedir){if(d.parteHud)publicarParte(d.parteHud,true);else transmitir();return;}
    if(d.tipo==='partesHud'){
      const origem=d.origem;
      if(d.documentoHud!==documentos.get(origem)||d.rev!==estado?.rev||d.atorId!==atorId||origem==='barra'&&(d.linhas!==linhas||d.compacto!==compacto))return;
      const base=origem==='barra'?layoutRodape:layoutMesa;
      if(!base||Math.abs(d.largura-base.width)>2||d.partes.some(p=>!grupoHudValido(p,origem,d.largura,d.altura))||new Set(d.partes.map(p=>p.parte)).size!==d.partes.length)return;
      geometriasPartes[origem]=d;
      for(const p of Object.keys(origem==='barra'?gruposRodape:gruposMesa))cargasPartes.delete(p);
      for(const p of d.partes)cargasPartes.set(p.parte,p.html);
      await layout();return;
    }
    if(d.tipo==='interacaoRodape'){
      const origem=d.parteHud?.startsWith('mesa-')?'ordem':'barra';
      bus.postMessage({interacaoRodapeConfirmada:{...d,origem},sessaoHud});return;
    }
    if(d.tipo==='dicaRodape'){
      if(d.html){dicaRodape=d.html;cargasPartes.set('barra-dica',d.html);}else{dicaRodape=null;cargasPartes.delete('barra-dica');}
      await layout();return;
    }
    if(d.tipo==='reposicionarMesa'&&eu.role==='GM'){await layout();return;}
    if(d.tipo==='alturaAcao'){
      const altura=Number(d.altura);
      if(Number.isFinite(altura)&&altura>=100&&altura<=590&&Math.abs(altura-alturaConteudoAcao)>4){
        alturaConteudoAcao=altura;
        await layout();
      }
      return;
    }
    if(d.tipo==='dimensoesBarra'){
      if(compacto||d.documentoHud!==documentos.get('barra')||!medidaRodapeValida(d,{atorId,linhas,rev:estado?.rev}))return;
      const chave=d.atorId+'/'+d.linhas,antes=medidasRodape.get(chave);
      medidasRodape.set(chave,{atorId:d.atorId,linhas:d.linhas,larguraIdeal:d.larguraIdeal,altura:d.altura});
      if(medidasRodape.size>128)medidasRodape.delete(medidasRodape.keys().next().value);
      if(!antes||antes.atorId!==d.atorId||antes.linhas!==d.linhas||Math.abs(antes.larguraIdeal-d.larguraIdeal)>2||Math.abs(antes.altura-d.altura)>2){await layout();transmitir();}
      return;
    }
    if(d.tipo==='dicaEfeito'){
      dicaEfeito=typeof d.info==='string'&&d.info.trim()?d.info:null;await layout();transmitir();return;
    }
    if(d.etapaVersao!==undefined&&pedidoDado&&d.etapaVersao!==pedidoDado.etapaVersao)return;
    const comandosDado=['alternarAdicional','rolarDado','rerrolarDado','continuarDado','cancelarDado'];
    if(comandosDado.includes(d.tipo)&&(pedidoDado?.podeEditar===false||d.pedido&&d.pedido!==pedidoDado?.pedido))return;
    if(d.tipo==='alternarAdicional'&&pedidoDado?.tipo==='ajuste'){
      const dados=pedidoDado.meta?.adicionais??[],validos=new Set(dados.map(x=>x.id));if(!validos.has(d.id)||dados.find(x=>x.id===d.id)?.automatico)return;
      const selecionados=new Set(pedidoDado.recursosAtivos??[]);
      if(selecionados.has(d.id))selecionados.delete(d.id);
      else{
        const grupo=dados.find(opcao=>opcao.id===d.id)?.grupoExclusivo;
        if(grupo)for(const opcao of dados)if(opcao.grupoExclusivo===grupo)selecionados.delete(opcao.id);
        selecionados.add(d.id);
      }
      pedidoDado={...pedidoDado,recursosAtivos:[...selecionados]};atividades.dado(pedidoDado);await atualizarPreviaAdicionais();transmitir();
    }else if(d.tipo==='rolarDado'&&pedidoDado?.tipo==='ajuste'){
      const pedido=pedidoDado.pedido;pedidoDado={...pedidoDado,tipo:'rolando'};atividades.dado(pedidoDado);transmitir();
      const resposta={pedido};
      if(Array.isArray(d.formulas)&&d.formulas.length)resposta.formulas=d.formulas.map(x=>String(x||'').replace(/\s+/g,''));
      else resposta.formula=String(d.formula||'').replace(/\s+/g,'');
      resposta.recursosAtivos=Array.isArray(d.recursosAtivos)?d.recursosAtivos:[];
      await responderDado({...resposta,etapaVersao:d.etapaVersao});
    }else if(d.tipo==='rerrolarDado'&&pedidoDado?.tipo==='resultado'&&d.rerrolagem){
      const pedido=pedidoDado.pedido;pedidoDado={...pedidoDado,tipo:'rolando'};transmitir();await responderDado({pedido,etapaVersao:d.etapaVersao,rerrolar:true,rerrolagem:d.rerrolagem,...(Array.isArray(d.dados)?{dados:d.dados}:{})});
    }else if(d.tipo==='continuarDado'&&pedidoDado?.tipo==='resultado'){
      const pedido=pedidoDado.pedido;pedidoDado=null;transmitir();await responderDado({pedido,etapaVersao:d.etapaVersao,continuar:true});
    }else if(d.tipo==='cancelarDado'&&pedidoDado){
      const pedido=pedidoDado.pedido;pedidoDado=null;transmitir();await responderDado({pedido,etapaVersao:d.etapaVersao,cancelar:true});
    }else{
      if(!estado||!pronta||ocupado&&d.tipo!=='resolverReacao')return;
      if(d.rev!==undefined&&d.rev!==estado.rev)return;
      if(d.tipo==='alternarMovimentoDinamico'){movimentoDinamico=!movimentoDinamico;localStorage.setItem(ns+'/movimento-dinamico',movimentoDinamico?'1':'0');if(movimentoDinamico)await OBR.tool.activateTool(tool);}
    else if(d.tipo==='linhas'){linhas=Math.max(1,Math.min(5,Number(d.valor)||3));localStorage.setItem(ns+'/linhas',linhas);}
    else if(d.tipo==='compactar'){compacto=typeof d.valor==='boolean'?d.valor:!compacto;localStorage.setItem(ns+'/compacto',compacto?'1':'0');registrar('modo-barra',{compacto});}
    else if(d.tipo==='focar'){
      const a=atores().find(x=>x.id===d.id),peca=token(a);if(!a||!peca||peca.visible===false)return;
      const p=pos(a);
      const [w,h,escala]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight(),OBR.viewport.getScale()]);
      const zoom=Math.max(escala,1.35);await OBR.viewport.animateTo({scale:zoom,position:{x:w/2-p.x*zoom,y:h/2-p.y*zoom}});return;
    }
    else if(d.tipo==='ficha'){
      compacto=true;localStorage.setItem(ns+'/compacto','1');
      await layout();transmitir();
      localStorage.setItem(ns+'/abrir-ficha/'+OBR.room.id,JSON.stringify({id:atorId,quando:Date.now(),pagina:['personagem','inventario','habilidades'].includes(d.pagina)?d.pagina:'personagem'}));
      if(ator()?.token)await OBR.player.select([ator().token],true);
      await OBR.action.open();bus.postMessage({abrirFicha:atorId});return;
    }
    else if(d.tipo==='ator'){if(!atores().some(a=>a.id===d.id&&controla(a)))return;await cancelar();atorId=d.id;}
    else if(d.tipo==='alternarGavetaComposicao'&&(pendente?.composicao||pendente?.compositor)){
      const gaveta=pendente.composicao??pendente.compositor,gavetaAberta=gaveta.gavetaAberta!==false;
      if(pendente.composicao)pendente.composicao.gavetaAberta=!gavetaAberta;
      if(pendente.compositor)pendente.compositor.gavetaAberta=!gavetaAberta;
    }
    else if(d.tipo==='parametroPrototipo'&&pendente&&!pendente.rolagem){
      const campo=pendente.rule?.escolhas?.find(e=>e.id===d.id);if(!campo?.valores.some(v=>v.id===d.valor))return;
      (pendente.cmd.parametros??={})[d.id]=d.valor;await publicarPrevia();transmitir();
    }
    else if(d.tipo==='alterarCirculo'&&pendente?.compositor){
      const circulo=Number(d.valor);if(pendente.rolagem||!pendente.compositor.circulos.includes(circulo))return;
      await preparar({tipo:'usar',opcao:pendente.cmd.opcao,modoCusto:pendente.cmd.modoCusto,circuloUsado:circulo,magiaDuplicada:pendente.cmd.magiaDuplicada===true,ilusaoCausaDano:pendente.cmd.ilusaoCausaDano===true});
    }
    else if(d.tipo==='alternarMagiaDuplicada'&&pendente?.compositor?.duplicadaDisponivel){
      if(pendente.rolagem)return;
      await preparar({tipo:'usar',opcao:pendente.cmd.opcao,modoCusto:pendente.cmd.modoCusto,circuloUsado:pendente.cmd.circuloUsado,magiaDuplicada:pendente.cmd.magiaDuplicada!==true,ilusaoCausaDano:pendente.cmd.ilusaoCausaDano===true});
    }
    else if(d.tipo==='alternarIlusaoDano'&&pendente?.compositor?.ilusaoDisponivel){
      if(pendente.rolagem)return;
      await preparar({tipo:'usar',opcao:pendente.cmd.opcao,modoCusto:pendente.cmd.modoCusto,circuloUsado:pendente.cmd.circuloUsado,magiaDuplicada:pendente.cmd.magiaDuplicada===true,ilusaoCausaDano:pendente.cmd.ilusaoCausaDano!==true});
    }
    else if(d.tipo==='selecionarModoComposicao'&&pendente?.composicao){
      const modo=pendente.composicao.modos.find(m=>m.id===d.id);if(!modo)return;
      const usados=pendente.cmd.composicao.filter(x=>x.modoId===modo.id).length;if(modo.limitePorUso&&usados>=modo.limitePorUso)return;
      const indice=pendente.cmd.composicao.length+1,anterior=pendente.cmd.composicao.at(-1);
      if(modo.ateOrdem&&indice>modo.ateOrdem)return;
      if(modo.ordem&&modo.ordem!==indice)return;
      if(modo.requerModoAnterior&&anterior?.modoId!==modo.requerModoAnterior)return;
      pendente.composicao.modoAtivo=modo.id;
      if(!pendente.cmd.composicao.length){const o=opcoesDisponiveis(ator()).find(o=>o.id===pendente.cmd.opcao);pendente.custos=custosPrevia(ator(),o,pendente.cmd.modoCusto,[{modoId:modo.id}]);}
      if(modo.destruidorDeHordas||pendente.marcasBase){const items=[circulo(pendente.origem,pendente.raio*pixelsMetro,'#e5c079'),...marcasComposicao(pendente)];pendente.marcasBase=items;await desenhar(items);}
    }
    else if(d.tipo==='desfazer'&&pendente?.escolha==='lista'){
      pendente.cmd.alvos.pop();if(pendente.composicao){pendente.cmd.composicao.pop();const indice=pendente.cmd.composicao.length+1,anterior=pendente.cmd.composicao.at(-1),proximo=pendente.composicao.modos.find(m=>(!m.ordem||m.ordem===indice)&&(!m.ateOrdem||indice<=m.ateOrdem)&&(!m.requerModoAnterior||m.requerModoAnterior===anterior?.modoId));if(proximo)pendente.composicao.modoAtivo=proximo.id;}await atualizarLista(pendente);
    }
    else if(d.tipo==='concluir'&&pendente?.escolha==='lista'){
      if(pendente.cmd.alvos.length<(pendente.composicao?.quantidadeMinima??pendente.regraLista?.min??1))return;
      pendente.pronto=true;
    }
    else if(d.tipo==='cancelar')await cancelar();
    else if(d.tipo==='confirmar'){
      if(!pendente?.pronto||pendente.rev!==estado.rev||d.rev!==estado.rev)return;
      const cmd={...pendente.cmd,parametros:{...pendente.cmd.parametros,...d.parametros},atividadeId:pendente.publicId,confirmado:true,modo:d.modo,ajuste:d.ajuste??0,dadosAjuste:d.dadosAjuste??[]},atividadeConfirmada=pendente.publicId;
      pendente.rolagem=true;ocupado=true;await publicarPrevia();await layout();transmitir();
      let terminou=false;
      try{
        await api.enviar(cmd);terminou=true;
        if(cmd.opcao==='saquear'){
          compacto=true;localStorage.setItem(ns+'/compacto','1');
          localStorage.setItem(ns+'/abrir-ficha/'+OBR.room.id,JSON.stringify({id:cmd.ator,quando:Date.now(),pagina:'inventario'}));
          await OBR.action.open();
        }
      }finally{ocupado=false;if(pendente?.publicId===atividadeConfirmada){const estadoFinal=atividades.lista.get(atividadeConfirmada)?.execucao?.estado;await cancelar(terminou?'Concluída':estadoFinal==='Cancelada'?'Cancelada':'Erro');}}
    }else if(d.tipo==='responderIniciativa'){
      const rp=escolhaIniciativa(),reator=atores().find(a=>a.id===rp?.reator);
      if(!rp||!controla(reator)||d.pendenciaId!==rp.id)return;
      ocupado=true;transmitir();
      try{await api.enviar({tipo:'responderIniciativa',ator:reator.id,pendenciaId:rp.id,opcao:d.id||null,rev:estado.rev,
        confirmado:eu.role==='GM'&&reator.ficha.tipo==='pj',atividadeId:crypto.randomUUID()});}finally{ocupado=false;}
    }else if(d.tipo==='resolverReacao'){
      const rp=estado.reacaoPendente,reator=atores().find(a=>a.id===rp?.reator);
      if(!rp||!controla(reator))return;
      const ocupadoAnterior=ocupado;
      ocupado=true;transmitir();
      try{await api.enviar({tipo:'resolverReacao',ator:reator.id,opcao:d.opcao||null,rev:estado.rev,
        confirmado:eu.role==='GM'&&reator.ficha.tipo==='pj',modo:d.modo||'normal',ajuste:d.ajuste??0,dadosAjuste:d.dadosAjuste??[]});}finally{ocupado=ocupadoAnterior;}
    }else if(d.tipo==='teste'){
      if(d.ator){if(!atores().some(a=>a.id===d.ator&&controla(a)))return;atorId=d.ator;}
      const a=ator(),grupo=d.grupo,chave=d.chave;
      if(!controla(a)||!['pericias','salvaguardas'].includes(grupo)||typeof chave!=='string')return;
      const bonus=grupo==='pericias'?bonusPericia(a,chave):a.ficha.salvaguardas?.[chave]??mod(a.ficha.atributos[chave]);
      await cancelar();pendente={cmd:{tipo:'teste',ator:a.id,rev:estado.rev,grupo,chave},rev:estado.rev,
        opcaoPublica:{...testeVisual(grupo,chave,bonus),categoria:'teste',descricao:'Rolagem rápida de '+a.nome+'. Bônus atual: '+(bonus>=0?'+':'')+bonus+'. Não consome ações.'},custos:[],
        escolha:null,titulo:(grupo==='pericias'?'Perícia · ':'Salvaguarda · ')+chave,pronto:true,rolagem:false,
        substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:'Rolagem rápida de '+a.nome+' · não consome ações.'};
    }else if(d.tipo==='encerrarConcentracao'){
      const a=ator();if(!controla(a)||!a.concentracaoAtiva)return;
      ocupado=true;transmitir();try{await api.enviar({tipo:'encerrarConcentracao',ator:a.id,rev:estado.rev,confirmado:eu.role==='GM'&&a.ficha.tipo==='pj'});}finally{ocupado=false;}
    }else if(d.tipo==='usarItem'){
      const a=ator(),item=a?.ficha.inventario?.itens.find(i=>i.id===d.itemId&&i.tipo==='consumivel'&&i.quantidade>0);if(!controla(a)||!item)return;
      await cancelar();const opcao=opcaoConsumoItem(item);
      pendente={publicId:crypto.randomUUID(),cmd:{tipo:'inventario',ator:a.id,operacao:'usar',itemId:item.id,rev:estado.rev},opcaoPublica:opcao,rev:estado.rev,escolha:null,titulo:item.nome,pronto:true,rolagem:false,custos:custosPrevia(a,opcao),substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:'Usar item · '+a.nome};
      await publicarPrevia();
    }else if(['iniciar','encerrar','avancarTempo','descanso'].includes(d.tipo)){
      if(eu.role!=='GM'||d.rev!==estado.rev)return;
      ocupado=true;transmitir();
      try{
        const atores=d.tipo==='descanso'?atoresElegiveisDescanso(estado).map(x=>x.id):undefined;
        await api.enviar({tipo:d.tipo,rev:d.rev,pvp:d.pvp===true,passo:d.passo,periodo:d.periodo,atores});
      }finally{ocupado=false;}
    }else if(d.tipo==='iniciativas'||d.tipo==='npcs'){
      if(eu.role!=='GM'||estado.fase!=='iniciativa')return;
      const ids=d.tipo==='npcs'?atores().filter(a=>a.emCombate!==false&&a.ficha.tipo==='npc'&&a.init===null).map(a=>a.id):[...new Set(d.atores??[])];
      if(!ids.length||!ids.every(id=>atores().some(a=>a.id===id&&a.emCombate!==false&&a.init===null)))return;
      ocupado=true;transmitir();
      try{await api.enviar({tipo:'iniciativas',atores:ids,rev:estado.rev});}finally{ocupado=false;}
    }else if(['usar','mover','passar','iniciativa'].includes(d.tipo)){
      if(d.ator){if(!atores().some(a=>a.id===d.ator&&controla(a)))return;atorId=d.ator;}
      await preparar(d);
    }
    }
    await layout();transmitir();
  }
  bus.onmessage=e=>{
    const d=e.data;if(encerrado||!mensagemHudValida(d,sessaoHud))return;
    if(d.parteHud&&(!partesLeves.includes(d.parteHud)||d.documentoHud!==documentos.get(d.parteHud)))return;
    if(!comandoDoAtorHudValido(d,atorId))return;
    const imediato=d.presenca||d.entradaHud||['partesHud','dimensoesBarra','interacaoRodape','dicaRodape','resolverReacao','restaurarJanelas','cancelarExecucao','assumirPedido','resultadoManual','rascunhoDado','alternarAtividades','selecionarAtividade','fecharAtividade','recolherAtividades'].includes(d.tipo)||d.pedir===true||['dicaEfeito','alternarAdicional','rolarDado','rerrolarDado','continuarDado','cancelarDado'].includes(d.tipo);
    const executar=async()=>{try{await mensagem(e.data);}catch(err){transmitir();OBR.notification.show(err.message||String(err),'ERROR');}};
    if(imediato)executar();else serial(executar);
  };
  entradaPartes.onmessage=e=>bus.onmessage?.(e);
  let filaPrevias=Promise.resolve();
  const serialPrevia=fn=>{filaPrevias=filaPrevias.then(fn).catch(console.error);};
  limpezas.push(OBR.broadcast.onMessage(canalPrevia,e=>serialPrevia(async()=>{
    if(encerrado)return;
    const d=e.data??{};
    if(d.tipo==='solicitar'){if(pendente)await publicarPrevia();return;}
    const participantes=await OBR.party.getPlayers(),remetente=participantes.find(p=>p.connectionId===e.connectionId),a=atores().find(x=>x.id===d.atorId);
    if(!remetente||!a)return;
    if(!remetentePodePublicarPrevia(remetente,a))return;
    if(d.tipo==='fechar'){
      const a=atividades.lista.get(d.id);if(!a||a.remetenteId!==remetente.id)return;
      atividades.concluir(d.id,d.status??(a.acao?.rolagem?'Concluída':'Cancelada'));
      const ids=marcasPorAtividade.get(d.id)??[];if(ids.length)await OBR.scene.local.deleteItems(ids);marcasPorAtividade.delete(d.id);
      await layout();transmitir();return;
    }
    if(d.tipo!=='atualizar'||!d.id||!d.pendente||!marcasPublicasValidas(d.marcas))return;
    const anteriores=marcasPorAtividade.get(d.id)??[];
    if(anteriores.length)await OBR.scene.local.deleteItems(anteriores);
    const items=reconstruirMarcas(d.marcas);
    if(items.length)await OBR.scene.local.addItems(items);
    marcasPorAtividade.set(d.id,items.map(x=>x.id));
    atividades.acao({...d.pendente,id:d.id,atorId:a.id,somenteLeitura:true},{remetenteId:remetente.id});
    await layout();transmitir();
  })));
  function retomarLayout(){if(!ponteiroMapa&&!ponteiros.size&&layoutAguardandoPonteiro){layoutAguardandoPonteiro=false;serial(async()=>{await layout();transmitir();});}}
  function fimPonteiro(){ponteiroMapa=false;retomarLayout();}
  function interromperMira(motivo,verificarFerramenta=false){

    fimPonteiro();registrar('interromper-mira',{motivo});
    serial(async()=>{if(verificarFerramenta&&await OBR.tool.getActiveTool()===tool)return;if(pendente&&!pendente.rolagem){await cancelar();await layout();transmitir();}});
  }
  // O Owlbear preserva ferramentas registradas enquanto a sala continua
  // aberta. Ao atualizar a extensão, tentar criar o mesmo ID novamente lança
  // erro e interrompe o controlador antes de ele abrir rodapé e carrossel.
  // Remover e recriar torna a inicialização segura após deploy ou F5.
  try{
    await OBR.tool.remove(tool).catch(()=>{});
    await OBR.tool.removeMode(mode).catch(()=>{});
    await OBR.tool.createMode({id:mode,icons:[{...icons[0],filter:{activeTools:[tool]}}],cursors:[{cursor:'crosshair'}],
      onToolDown:()=>{ponteiroMapa=true;},onToolUp:fimPonteiro,
      onToolClick:(_,e)=>{
        if(!pendente&&movimentoDinamico&&estado?.fase==='turnos'&&atual(estado)?.id===atorId&&controla(ator())&&!ocupado){serial(async()=>{if(!pendente)await preparar({tipo:'mover',dinamico:true});await escolher(e);});return false;}
        if(!pendente||atividades.pausada)return true;serial(()=>escolher(e));return false;},
      onToolDragStart:(_,e)=>{
        ponteiroMapa=true;
        const a=estado&&atual(estado);
        if(!pendente&&a&&controla(a)&&a.token===e.target?.id)serial(async()=>{atorId=a.id;await preparar({tipo:'mover'});transmitir();});
      },
      onToolDragEnd:(_,e)=>{fimPonteiro();serial(()=>escolher(e));},
      onToolDragCancel:()=>interromperMira('arrasto-cancelado'),onDeactivate:()=>interromperMira('modo-desativado',true),
      onKeyDown:(_,e)=>{if(e.code==='Escape')interromperMira('escape');}});
    await OBR.tool.create({id:tool,icons,defaultMode:mode});
    if(OBR.tool.onToolChange)limpezas.push(OBR.tool.onToolChange(id=>{registrar('ferramenta',{id});if(id!==tool)interromperMira('troca-de-ferramenta',true);}));
  }catch(e){
    console.warn('Ferramenta de mira indisponível; a HUD continuará ativa.',e);
    Promise.resolve(OBR.notification.show('A HUD foi recuperada, mas a ferramenta de mira precisa recarregar a sala.','WARNING')).catch(()=>{});
  }
  let filaVistas=Promise.resolve();
  api=await sala((s,i)=>{if(!encerrado)filaVistas=filaVistas.then(()=>atualizar(s,i)).catch(e=>console.warn('Atualizar mesa:',e));});
  responderDado=await interfaceRolagens(async d=>{
    if(encerrado)return;
    if(d.tipo==='execucao'||d.tipo==='lista-execucoes'){
      for(const e of d.tipo==='execucao'?[d.execucao]:d.execucoes){atividades.execucao(e);if(e.donoId===eu?.id&&!['Concluída','Cancelada','Falhou'].includes(e.estado)&&!atividades.propria){atividades.propria=e.atividadeId;atividades.atenderFila=false;}}
      await layout();transmitir();return;
    }
    if(d.tipo==='atividade-aplicada'){
      const a=atividades.lista.get(d.atividadeId);if(a){const alvos=d.alvos.filter(x=>atores().some(a=>a.id===x.id));a.aplicacao={alvos,total:alvos.reduce((n,x)=>n+x.pvPerdido,0)};await layout();transmitir();}return;
    }
    if(d.atorId&&!atores().some(a=>a.id===d.atorId))return;
    const vista=visibilidadeRolagem(d,eu);
    if(vista.tipo==='fechar'){
      atividades.fecharDado(vista.pedido);
      if(pedidoDado?.pedido===vista.pedido)pedidoDado=null;
      if(anuncioDado?.pedido===vista.pedido)anuncioDado=null;
    }else if(vista.tipo==='pedido'){
      if(vista.pedido.destino===eu.id&&!atividades.lista.get(vista.pedido.atividadeId??'rolagem:'+vista.pedido.pedido)?.rolagens.some(r=>r.pedido===vista.pedido.pedido))atividades.pausada=false;
      atividades.dado(vista.pedido);
      pedidoDado=vista.pedido.tipo==='erro'?{...pedidoDado,...vista.pedido,tipo:'ajuste',erro:vista.pedido.mensagem}:vista.pedido;
    }else if(vista.tipo==='anuncio'){
      atividades.dado(vista.anuncio);
      anuncioDado=vista.anuncio;clearTimeout(timerAnuncio);
      timerAnuncio=setTimeout(()=>serial(async()=>{if(anuncioDado?.pedido===vista.anuncio.pedido){anuncioDado=null;await layout();transmitir();}}),6500);
    }
    await layout();transmitir();
  });
  limpezas.push(OBR.scene.onReadyChange(r=>serial(async()=>{
    ponteiros.clear();ponteiroMapa=false;layoutAguardandoPonteiro=false;
    pronta=r;atividades=new AtividadesMesa({modo:atividades.modo});marcasPorAtividade.clear();medidasRodape.clear();estado=null;tokens=[];pendente=null;acaoPublica=null;pedidoDado=null;anuncioDado=null;clearTimeout(timerAnuncio);anterior=null;marcas=[];marcasPublicas=[];
    await layout();
    if(ferramentaDoTurno&&await OBR.tool.getActiveTool()===tool)await OBR.tool.activateTool(ferramentaDoTurno);
    ferramentaDoTurno=null;
    if(r)await api.notify();
  })));
  limpezas.push(OBR.player.onChange(p=>{const a=atores().find(x=>x.token===p.selection?.[0]);if(a&&controla(a)&&!pendente&&a.id!==atorId)serial(()=>mensagem({tipo:'ator',id:a.id}));}));
  limpezas.push(OBR.scene.grid.onChange(grid=>serial(async()=>{
    const proxima=pixelsPorMetro(grid.dpi);
    if(proxima===pixelsMetro)return;
    await cancelar();pixelsMetro=proxima;
    await sincronizarZonas();await sincronizarPecas();
    await layout();transmitir();
  })));
  if(typeof OBR.scene.items.onChange==='function'){
    let quadro=0,ultimos;
    limpezas.push(OBR.scene.items.onChange(items=>{ultimos=items;if(quadro)return;quadro=requestAnimationFrame(()=>{quadro=0;const lote=ultimos;serial(()=>sincronizarTokens(lote));});}));
    limpezas.push(()=>cancelAnimationFrame(quadro));
  }
  // Remove instâncias que possam ter sobrevivido ao recarregamento do
  // background antes da primeira sincronização com o encontro.
  await Promise.all([...partesHud,...popoversAntigos].map(parte=>OBR.popover.close(ns+'/hud/'+parte).catch(()=>{})));
  let verificando=false;
  // O layout tem sua própria fila; não deve esperar a execução que aguarda dados.
  const timerSaude=setInterval(async()=>{if(verificando||encerrado||document.visibilityState==='hidden')return;verificando=true;try{if(pronta&&!estado)await api.notify();else if(abertos.size)await layout();}catch(e){console.warn('Aguardando conexão com o mestre:',e.message);}finally{verificando=false;}},1200);
  const aoRedimensionar=()=>{if(estado&&!encerrado)layout().catch(e=>console.warn('Redimensionar HUD:',e.message));};
  window.addEventListener('resize',aoRedimensionar);limpezas.push(()=>window.removeEventListener('resize',aoRedimensionar));
  limpezas.push(()=>{clearInterval(timerSaude);clearTimeout(timerAnuncio);});
  // A recuperação deve continuar instalada mesmo quando o mestre chega depois.
  api.notify().then(()=>OBR.broadcast.sendMessage(canalPrevia,{tipo:'solicitar'},{destination:'REMOTE'})).catch(e=>console.warn('Aguardando conexão com o mestre:',e.message));
  registrar('iniciar',{conexao});return {encerrar:encerrarHud};
  }catch(e){encerrarHud();throw e;}
}

