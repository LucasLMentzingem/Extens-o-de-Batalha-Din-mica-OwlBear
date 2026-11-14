import OBR,{buildCurve,buildLine} from './vendor/sdk.mjs';
import {ns,pronto,sala,interfaceRolagens} from './bridge.mjs?v=0.8.4';
import {atual,multi,incluirAlvo,destinoDeslocamento,dentroDaArea,opcoesDisponiveis} from './engine.mjs?v=0.8.4';
import {visibilidadeRolagem} from './roll-visibility.mjs?v=0.8.4';
import {compactarMarcas,marcasPublicasValidas,remetentePodePublicarPrevia} from './action-preview.mjs?v=0.8.4';

const tool=ns+'/mirar', mode=tool+'/ponto';
const url=new URL('./hud.html?v=0.8.4',import.meta.url);
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
function marcaArea(rule,origem,ponto,dpi){
  const area=rule?.area??(rule?.raioM?{forma:'circulo',raioM:rule.raioM}:null);if(!area)return [];
  if(area.forma==='circulo')return [circulo(ponto,area.raioM*dpi,'#79cfb1')];
  if(area.forma==='quadrado'){const m=area.tamanhoM*dpi/2;return [poligono(ponto,[{x:-m,y:-m},{x:m,y:-m},{x:m,y:m},{x:-m,y:m}],'#79cfb1')];}
  const dx=ponto.x-origem.x,dy=ponto.y-origem.y,n=Math.hypot(dx,dy)||1,ux=dx/n,uy=dy/n,l=area.comprimentoM*dpi,w=(area.larguraM??(area.forma==='cone'?area.comprimentoM:1.5))*dpi/2,fx=ux*l,fy=uy*l,px=-uy*w,py=ux*w;
  return area.forma==='cone'?[poligono(origem,[{x:0,y:0},{x:fx+px,y:fy+py},{x:fx-px,y:fy-py}],'#79cfb1')]:[poligono(origem,[{x:px,y:py},{x:fx+px,y:fy+py},{x:fx-px,y:fy-py},{x:-px,y:-py}],'#79cfb1')];
}
function alvosDaArea(rule,origem,ponto,atores,pos,dpi){
  const origemM={x:origem.x/dpi,y:origem.y/dpi},pontoM={x:ponto.x/dpi,y:ponto.y/dpi};
  return atores.filter(a=>{
    const p=pos(a),mesmoPonto=Math.hypot(p.x-origem.x,p.y-origem.y)<=1e-8;
    return !(rule?.excluirConjurador&&mesmoPonto)&&dentroDaArea(origemM,pontoM,{x:p.x/dpi,y:p.y/dpi},rule);
  });
}
export async function iniciarHud(){
  await pronto();
  const bus=await canalHud(),abertos=new Map();
  const partesHud=['ordem','barra','efeitos','dica-efeito','iniciativa','acao','reacao','dados','anuncio-dado'];
  let estado,eu,api,atorId,pendente,acaoPublica,anterior,pedidoDado,anuncioDado,timerAnuncio,responderDado,dicaEfeito,ocupado=false,linhas=Number(localStorage.getItem(ns+'/linhas'))||3,espacoEfeitos=0;
  let compacto=localStorage.getItem(ns+'/compacto')==='1';
  let dpi=1,marcas=[],marcasPublicas=[],tokens=[],pronta=await OBR.scene.isReady(),fila=Promise.resolve(),ferramentaDoTurno;
  const serial=fn=>{fila=fila.then(fn).catch(e=>OBR.notification.show(e.message||String(e),'ERROR'));};
  const atores=()=>estado?.atores??[];
  const ator=()=>atores().find(a=>a.id===atorId);
  const controla=a=>a&&(eu.role==='GM'||(a.ficha.tipo==='pj'&&a.dono===eu.id));
  const token=a=>tokens.find(t=>t.id===a?.token);
  const pos=a=>token(a)?.position??{x:a.x*dpi,y:a.y*dpi};
  const acaoVisivel=()=>pendente??acaoPublica;
  function resumoPendente(p,somenteLeitura=false){
    if(!p)return null;
    const a=atores().find(x=>x.id===(p.cmd?.ator??p.atorId)),o=p.opcaoPublica??opcoesDisponiveis(a??{}).find(x=>x.id===(p.cmd?.opcao??p.opcao));
    return {id:p.publicId??p.id,atorId:a?.id??p.atorId,titulo:p.titulo,detalhe:p.detalhe,pronto:p.pronto,
      opcao:p.cmd?.opcao??p.opcao,opcaoPublica:o?structuredClone(o):null,fichaPublica:{recursos:structuredClone(a?.ficha?.recursos??p.fichaPublica?.recursos??[])},
      lista:p.escolha==='lista'||p.lista,quantidade:p.cmd?.alvos?.length??p.quantidade,min:p.regraLista?.min??p.min,max:p.regraLista?.max??p.max,
      alvos:p.cmd?.alvos??p.alvos??[],rolagem:p.rolagem,substitui:p.substitui,donoAcao:a?.nome??p.donoAcao,rev:p.rev,somenteLeitura};
  }
  function transmitir(){
    const p=acaoVisivel();
    if(estado)bus.postMessage({vista:{estado,eu:{id:eu.id,role:eu.role},atorId,linhas,compacto,ocupado,espacoEfeitos,dicaEfeito,
      imagens:Object.fromEntries(atores().map(a=>[a.id,token(a)?.image?.url])),pedidoDado,anuncioDado,
      pendente:resumoPendente(p,p===acaoPublica)}});
  }
  async function janela(parte,box){
    const id=ns+'/hud/'+parte;
    if(!box){if(abertos.has(parte)){await OBR.popover.close(id).catch(()=>{});abertos.delete(parte);}return;}
    const key=JSON.stringify(box);
    if(abertos.get(parte)===key)return;
    // Uma atualização da extensão pode reiniciar o controlador enquanto o
    // Owlbear ainda conserva o pop-up antigo. Fechar pelo ID torna a abertura
    // idempotente e impede que um pop-up órfão bloqueie toda a HUD.
    await OBR.popover.close(id).catch(()=>{});
    const [left,top,width,height]=box;
    const pagina=new URL(url.href);pagina.searchParams.set('parte',parte);
    await OBR.popover.open({id,url:pagina.href,width,height,hidePaper:true,disableClickAway:true,marginThreshold:0,
      anchorReference:'POSITION',anchorPosition:{left,top},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});
    abertos.set(parte,key);
  }
  async function layout(){
    const ativo=pronta&&estado&&atores().length>0;
    const caixas={};
    if(ativo){
      const [w,h]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]);
      const temEfeitos=(ator()?.efeitosAtivos?.length??0)>0||Boolean(ator()?.concentracaoAtiva);
      const faixaEfeitos=temEfeitos?118:0,margemEsquerda=72,gap=10,acaoAtual=acaoVisivel();
      espacoEfeitos=0;
      // Uma única linha ainda precisa acomodar cabeçalho, recursos, filtros,
      // histórico e a barra de rolagem sem comprimir os ícones da grade.
      const altura=Math.min(176+linhas*54,Math.floor(h*.65)),alturaAcao=Math.min(176+3*54,h-96),larguraAcao=Math.min(410,Math.max(300,w*.36));
      const acaoLadoALado=Boolean(acaoAtual)&&w>=820;
      const leftAcao=Math.round(Math.max(margemEsquerda,w-larguraAcao-10));
      const limiteBarra=acaoLadoALado?leftAcao-gap:w-10;
      const leftBarra=margemEsquerda+faixaEfeitos,largura=Math.max(300,Math.min(1120,limiteBarra-leftBarra));
      if(estado.fase!=='preparo')caixas.ordem=[Math.round((w-Math.min(620,w-100))/2),4,Math.min(620,w-100),55];
      if(ator()){
        const larguraCorpo=compacto?92:largura,total=larguraCorpo+faixaEfeitos,alturaBarra=compacto?102:altura;
        const left=leftBarra,top=h-alturaBarra-48;
        caixas.barra=[left,top,larguraCorpo,alturaBarra];
        if(temEfeitos)caixas.efeitos=[left-faixaEfeitos,Math.round(top+(alturaBarra-Math.min(164,alturaBarra))/2),112,Math.min(164,alturaBarra)];
        if(temEfeitos&&dicaEfeito){
          const dw=Math.min(380,w-16),linhasDica=dicaEfeito.split('\n').length,dh=Math.min(190,h-16,Math.max(82,36+linhasDica*22));
          caixas['dica-efeito']=[Math.max(8,Math.min(w-dw-8,left)),Math.max(8,top-dh-8),dw,dh];
        }
      }
      if(estado.fase==='iniciativa'&&atores().some(a=>controla(a)&&a.init===null)){
        const pendentes=atores().filter(a=>a.emCombate!==false&&a.init===null&&(eu.role==='GM'||controla(a))),iw=Math.min(eu.role==='GM'?440:340,w-12),ih=Math.min(h-24,eu.role==='GM'?Math.max(148,108+Math.ceil(pendentes.length/2)*43):118);
        caixas.iniciativa=[Math.round((w-iw)/2),Math.round(Math.max(12,(h-ih)*.40)),iw,ih];
      }
      if(acaoAtual){
        const cw=Math.min(larguraAcao,w-12),ch=alturaAcao,left=acaoLadoALado?leftAcao:Math.min(w-cw-10,Math.max(10,w*.75-cw/2));
        const top=acaoLadoALado?h-ch-48:h-ch-(ator()?(compacto?102:altura)+58:48);
        caixas.acao=[Math.round(left),Math.round(Math.max(62,top)),cw,ch];
      }
      const rp=estado.reacaoPendente,reator=atores().find(a=>a.id===rp?.reator);
      if(rp&&controla(reator))caixas.reacao=[Math.round((w-Math.min(390,w-12))/2),Math.round(Math.max(60,(h-245)/2)),Math.min(390,w-12),245];
      if(pedidoDado){
        const n=pedidoDado.formulas?.length??pedidoDado.resultado?.resultados?.length??1;
        const extraResultado=pedidoDado.tipo==='resultado'&&pedidoDado.meta?.rerrolagens?.length?105:0;
        const extraAjuste=pedidoDado.tipo!=='resultado'&&pedidoDado.meta?.adicionais?.length?115:0;
        const ch=Math.min(h-72,pedidoDado.tipo==='resultado'?190+n*82+extraResultado:160+n*116+extraAjuste);
        const dw=Math.min(470,w-12),centroX=caixas.acao?caixas.acao[0]+caixas.acao[2]/2:w*.75;
        const left=Math.max(6,Math.min(w-dw-6,centroX-dw/2)),top=caixas.acao?Math.max(6,caixas.acao[1]-ch-10):Math.max(62,(h-ch)/2);
        caixas.dados=[Math.round(left),Math.round(top),dw,ch];
      }
      if(anuncioDado){
        const n=anuncioDado.resultado?.resultados?.length??1,aw=Math.min(340,w-18),ah=Math.min(100+Math.ceil(n/2)*30,h-18);
        caixas['anuncio-dado']=[9,Math.round(Math.max(9,(h-ah)/2)),aw,ah];
      }
    }
    const resultados=await Promise.allSettled(partesHud.map(k=>janela(k,caixas[k])));
    const falhas=resultados.flatMap((r,i)=>r.status==='rejected'?[partesHud[i]+': '+(r.reason?.message??r.reason)]:[]);
    if(falhas.length)throw Error('Falha ao abrir a HUD — '+falhas.join(' · '));
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
    const evento={tipo:'atualizar',id:pendente.publicId,atorId:pendente.cmd.ator,pendente:resumoPendente(pendente,true),marcas:compactarMarcas(items)};
    await OBR.broadcast.sendMessage(canalPrevia,evento,{destination:'REMOTE'}).catch(e=>console.warn('Falha ao publicar a prévia da ação.',e));
  }
  async function fecharPreviaPublica(id,atorIdPublico){
    if(!id)return;
    await OBR.broadcast.sendMessage(canalPrevia,{tipo:'fechar',id,atorId:atorIdPublico},{destination:'REMOTE'}).catch(e=>console.warn('Falha ao fechar a prévia pública.',e));
  }
  async function desenhar(items){
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
    const ang=Math.atan2(fim.y-origem.y,fim.x-origem.x),tam=Math.min(dpi*.32,Math.hypot(fim.x-origem.x,fim.y-origem.y)*.3);
    const ponta1={x:fim.x-tam*Math.cos(ang-.55),y:fim.y-tam*Math.sin(ang-.55)};
    const ponta2={x:fim.x-tam*Math.cos(ang+.55),y:fim.y-tam*Math.sin(ang+.55)};
    return [[origem,fim],[fim,ponta1],[fim,ponta2]].map(([a,b])=>buildLine().startPosition(a).endPosition(b).strokeColor('#e54848').strokeWidth(5).layer('CONTROL').locked(true).disableHit(true).build());
  }
  function setaAlvo(origem,fim,indice=0,total=1){
    const dx=fim.x-origem.x,dy=fim.y-origem.y,tamLinha=Math.hypot(dx,dy)||1,offset=(indice-(total-1)/2)*dpi*.12;
    const ox=-dy/tamLinha*offset,oy=dx/tamLinha*offset,a={x:origem.x+ox,y:origem.y+oy},b={x:fim.x+ox,y:fim.y+oy};
    const ang=Math.atan2(b.y-a.y,b.x-a.x),tam=Math.min(dpi*.22,tamLinha*.22),p1={x:b.x-tam*Math.cos(ang-.5),y:b.y-tam*Math.sin(ang-.5)},p2={x:b.x-tam*Math.cos(ang+.5),y:b.y-tam*Math.sin(ang+.5)};
    return [[a,b],[b,p1],[b,p2]].map(([x,y])=>buildLine().startPosition(x).endPosition(y).strokeColor('#e5c079').strokeWidth(4).layer('CONTROL').locked(true).disableHit(true).build());
  }
  function setaDeslocamento(origem,fim){
    const ang=Math.atan2(fim.y-origem.y,fim.x-origem.x),tam=Math.min(dpi*.28,Math.hypot(fim.x-origem.x,fim.y-origem.y)*.3);
    const p1={x:fim.x-tam*Math.cos(ang-.52),y:fim.y-tam*Math.sin(ang-.52)},p2={x:fim.x-tam*Math.cos(ang+.52),y:fim.y-tam*Math.sin(ang+.52)};
    return [[origem,fim],[fim,p1],[fim,p2]].map(([a,b])=>buildLine().startPosition(a).endPosition(b).strokeColor('#ffffff').strokeWidth(5).layer('CONTROL').locked(true).disableHit(true).build());
  }
  function marcasDeslocamento(rule,origem,alvos){
    const regra=rule?.deslocamentoForcado;if(!regra)return [];
    return alvos.flatMap(alvo=>{const inicio=pos(alvo),fim=destinoDeslocamento(origem,inicio,regra.distanciaM*dpi);return fim?[...setaDeslocamento(inicio,fim),circulo(fim,dpi*.2,'#ffffff')]:[];});
  }
  async function cancelar(){
    const publicId=pendente?.publicId,atorIdPublico=pendente?.cmd?.ator;pendente=null;await limparMarcas();await fecharPreviaPublica(publicId,atorIdPublico);
    if(anterior&&anterior!==tool&&await OBR.tool.getActiveTool()===tool)await OBR.tool.activateTool(anterior);
    anterior=null;
  }
  async function preparar(d){
    const a=ator();
    if(!controla(a))return;
    await cancelar();
    const o=opcoesDisponiveis(a).find(o=>o.id===d.opcao),rule=o?.automacao;
    const reacao=o?.custo?.some(c=>c.tipo==='reacao');
    if(d.tipo==='usar'&&!o)return;
    const foraCombate=d.tipo==='usar'&&estado.fase==='preparo';
    if(d.tipo!=='iniciativa'&&!reacao&&!foraCombate&&atual(estado)?.id!==a.id)return;
    const cmd={tipo:reacao?'reagir':d.tipo,ator:a.id,rev:estado.rev,opcao:o?.id,assistido:!rule,modoCusto:d.modoCusto??'automatico'};
    let escolha=null;
    if(d.tipo==='mover'||rule?.tipo==='teleporte')escolha='destino';
    if(['ataque','salva','efeito','cura','pv_temporario','estabilizar','conceder_dado'].includes(rule?.tipo))escolha=(rule.raioM||rule.area)?(rule.origemArea==='conjurador'&&!['cone','linha'].includes(rule.area?.forma)?null:'area'):'alvo';
    if(multi(o)){escolha='lista';cmd.alvos=[];}
    const titulo=o?.nome??({passar:'Finalizar turno',mover:'Mover',iniciativa:'Rolar iniciativa'})[d.tipo];
    pendente={publicId:crypto.randomUUID(),cmd,regraLista:multi(o),rev:estado.rev,escolha,rule,titulo,pronto:!escolha,rolagem:false,
      substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:reacao?'Conferir gatilho e gastar a reação.':o&&!rule?'Efeito assistido pelo mestre.':a.nome};
    if(escolha){
      dpi=await OBR.scene.grid.getDpi();
      const origem=pos(a),raio=escolha==='destino'?(d.tipo==='mover'?a.metros:rule.alcanceM):rule.alcanceM;
      pendente.origem=origem;pendente.raio=raio;
      const direcional=['cone','linha'].includes(rule?.area?.forma);
      pendente.detalhe=(direcional?'Aponte e clique para travar '+(rule.area.forma==='cone'?'o cone':'a linha'):{destino:'Marque o destino no mapa',area:'Marque o centro da área',alvo:'Clique no token do alvo'}[escolha])+' · '+medida(raio);
      if(escolha==='lista')pendente.detalhe='Selecione no mapa · 0/'+o.selecao.max;
      anterior=await OBR.tool.getActiveTool();
      await OBR.tool.activateTool(tool);await OBR.tool.activateMode(tool,mode);
      await desenhar([circulo(origem,raio*dpi,'#e5c079')]);
    }else await publicarPrevia([]);
  }
  async function atualizarLista(p){
    const ids=p.cmd.alvos;
    const unicos=[...new Set(ids)].map(id=>atores().find(a=>a.id===id));
    p.pronto=ids.length>=p.regraLista.min;p.detalhe='Selecione no mapa · '+ids.length+'/'+p.regraLista.max+(ids.length?' · '+unicos.map(a=>a.nome+' ×'+ids.filter(id=>id===a.id).length).join(', '):'');
    const contagem=Object.fromEntries(unicos.map(a=>[a.id,ids.filter(id=>id===a.id).length])),vistos={};
    const trajetorias=ids.flatMap(id=>{const alvo=atores().find(a=>a.id===id),i=vistos[id]??0;vistos[id]=i+1;return setaAlvo(p.origem,pos(alvo),i,contagem[id]);});
    await desenhar([circulo(p.origem,p.raio*dpi,'#e5c079'),...unicos.map(a=>circulo(pos(a),dpi*.5,'#79cfb1')),...trajetorias,...marcasDeslocamento(p.rule,p.origem,unicos)]);
    await layout();transmitir();
  }
  async function sincronizarTokens(items){
    if(!estado)return;
    const ids=new Set(atores().map(a=>a.token).filter(Boolean)),antes=new Map(tokens.map(t=>[t.id,t.position]));
    const proximos=items.filter(t=>ids.has(t.id)),mudou=proximos.some(t=>{const p=antes.get(t.id);return !p||p.x!==t.position.x||p.y!==t.position.y;});
    tokens=proximos;if(!mudou)return;
    const p=pendente,a=ator();
    if(!p?.escolha||!a){transmitir();return;}
    p.origem=pos(a);
    if(p.escolha==='lista'){await atualizarLista(p);return;}
    if(p.escolha==='destino'){
      p.pronto=false;delete p.cmd.x;delete p.cmd.y;delete p.ponto;
      p.detalhe='Marque o destino no mapa · '+medida(p.raio);
      await desenhar([circulo(p.origem,p.raio*dpi,'#e5c079')]);transmitir();return;
    }
    const alvoSelecionado=p.cmd.alvo?atores().find(x=>x.id===p.cmd.alvo):null;
    let ponto=alvoSelecionado?pos(alvoSelecionado):p.ponto;
    if(!ponto){await desenhar([circulo(p.origem,p.raio*dpi,'#e5c079')]);transmitir();return;}
    const distancia=Math.hypot(ponto.x-p.origem.x,ponto.y-p.origem.y)/dpi,temArea=Boolean(p.rule?.raioM||p.rule?.area);
    p.pronto=distancia<=p.raio+1e-8;
    const alvosDeslocados=p.cmd.alvo?[alvoSelecionado].filter(Boolean):temArea?alvosDaArea(p.rule,p.origem,ponto,atores(),pos,dpi):[];
    const direcional=['cone','linha'].includes(p.rule?.area?.forma),origemVetor=temArea?(direcional?p.origem:ponto):p.origem;
    const marcas=[circulo(p.origem,p.raio*dpi,'#e5c079'),...(temArea?marcaArea(p.rule,p.origem,ponto,dpi):[circulo(ponto,.43*dpi,'#79cfb1')]),...marcasDeslocamento(p.rule,origemVetor,alvosDeslocados)];
    if(p.cmd.alvo)marcas.push(...setaAlvo(p.origem,ponto));
    await desenhar(marcas);
    const alvo=p.cmd.alvo?atores().find(x=>x.id===p.cmd.alvo):null;
    p.ponto=ponto;p.detalhe=(alvo?alvo.nome+' · ':'')+medida(distancia)+(p.pronto?'':' · fora do alcance');
    await layout();transmitir();
  }
  async function escolher(evento){
    const p=pendente;if(!p?.escolha||ocupado)return;
    let ponto=evento.pointerPosition;
    let alvo;
    if(p.escolha==='alvo'||p.escolha==='lista'){
      alvo=atores().find(a=>a.token===evento.target?.id);
      if(!alvo)alvo=atores().filter(a=>token(a)).sort((a,b)=>dist(a)-dist(b)).find(a=>dist(a)<=dpi*.65);
      function dist(a){const c=pos(a);return Math.hypot(c.x-ponto.x,c.y-ponto.y);}
      if(!alvo)throw Error('Clique em um participante visível.');ponto=pos(alvo);
    }
    const d=Math.hypot(ponto.x-p.origem.x,ponto.y-p.origem.y)/dpi;
    if(d>p.raio+1e-8){
      p.pronto=false;await layout();transmitir();throw Error('Fora do alcance. Escolha outro ponto.');
    }
    if(p.escolha==='lista'){
      p.cmd.alvos=incluirAlvo(p.cmd.alvos,alvo.id,p.regraLista);
      await atualizarLista(p);return;
    }
    const celula={x:ponto.x/dpi,y:ponto.y/dpi};
    if(alvo)p.cmd.alvo=alvo.id;
    if(p.escolha==='area')p.cmd.ponto=celula;
    if(p.escolha==='destino')Object.assign(p.cmd,celula);
    const temArea=Boolean(p.rule?.raioM||p.rule?.area),afetados=temArea?alvosDaArea(p.rule,p.origem,ponto,atores(),pos,dpi):alvo?[alvo]:[];
    const direcional=['cone','linha'].includes(p.rule?.area?.forma),origemVetor=temArea?(direcional?p.origem:ponto):p.origem;
    const items=[circulo(p.origem,p.raio*dpi,'#e5c079'),...(temArea?marcaArea(p.rule,p.origem,ponto,dpi):[circulo(ponto,.43*dpi,'#79cfb1')]),...marcasDeslocamento(p.rule,origemVetor,afetados)];
    if(alvo)items.push(...setaAlvo(p.origem,ponto));
    if(p.escolha==='destino')items.push(buildLine().startPosition(p.origem).endPosition(ponto).strokeColor('#f2d398').strokeWidth(4).layer('CONTROL').disableHit(true).build());
    await desenhar(items);
    const forma=p.rule?.area?.forma??(p.rule?.raioM?'círculo':'');p.ponto=ponto;p.pronto=true;p.detalhe=(alvo?alvo.nome+' · ':'')+medida(d)+(temArea?' · '+forma+(['cone','linha'].includes(forma)?' travado':'')+' · '+(afetados.map(a=>a.nome).join(', ')||'área vazia'):'')+(p.rule?.deslocamentoForcado?' · seta branca: destino do alvo':'');
    if(p.escolha==='destino'&&!ator().desengajado){
      const ameacas=atores().flatMap(outro=>{
        const lado=a=>a.ficha.lado??a.ficha.tipo;
        if(lado(outro)===lado(ator())||outro.pv===0||outro.reacao<=0||!token(outro))return [];
        const centro=pos(outro), alcance=outro.ficha.alcanceCorpoACorpoM??1.5;
        const r=alcance*dpi,dx=ponto.x-p.origem.x,dy=ponto.y-p.origem.y,px=p.origem.x-centro.x,py=p.origem.y-centro.y;
        if(Math.hypot(px,py)>r+1e-8||Math.hypot(ponto.x-centro.x,ponto.y-centro.y)<=r+1e-8)return [];
        const aa=dx*dx+dy*dy,bb=2*(px*dx+py*dy),cc=px*px+py*py-r*r,delta=bb*bb-4*aa*cc;
        if(aa<=0||delta<0)return [];
        const t=(-bb+Math.sqrt(delta))/(2*aa),saida={x:p.origem.x+dx*t,y:p.origem.y+dy*t};
        return [{ator:outro,ponto:saida,t}];
      });
      if(ameacas.length){
        ameacas.sort((a,b)=>a.t-b.t);p.detalhe+=' · Reação antes de confirmar: '+ameacas.map(x=>x.ator.nome).join(', ');
        for(const x of ameacas)items.push(...seta(pos(x.ator),x.ponto));
      }
    }
    await desenhar(items);
    await layout();transmitir();
  }
  async function atualizar(s,i){
    if(!pronta)return;
    const novoTurno=atual(s)?.id!==atual(estado??{ordem:[],atores:[]})?.id;
    // Em preparacao o HUD tambem e a central de uso livre. Uma atualizacao da
    // sala com a mesma revisao nao pode fechar a selecao recem-aberta.
    if(pendente&&pendente.rev!==s.rev)await cancelar();
    estado=s;eu=i;
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
    if(atores().length)tokens=await OBR.scene.items.getItems(atores().map(a=>a.token).filter(Boolean));
    await layout();transmitir();
  }
  async function mensagem(d){
    if(d.pedir){transmitir();return;}
    if(d.tipo==='dicaEfeito'){
      dicaEfeito=typeof d.info==='string'&&d.info.trim()?d.info:null;await layout();transmitir();return;
    }
    const comandosDado=['alternarAdicional','rolarDado','rerrolarDado','continuarDado','cancelarDado'];
    if(comandosDado.includes(d.tipo)&&pedidoDado?.podeEditar===false)return;
    if(d.tipo==='alternarAdicional'&&pedidoDado?.tipo==='ajuste'){
      const dados=pedidoDado.meta?.adicionais??[],validos=new Set(dados.map(x=>x.id));if(!validos.has(d.id)||dados.find(x=>x.id===d.id)?.automatico)return;
      const selecionados=new Set(pedidoDado.recursosAtivos??[]);selecionados.has(d.id)?selecionados.delete(d.id):selecionados.add(d.id);pedidoDado={...pedidoDado,recursosAtivos:[...selecionados]};transmitir();
    }else if(d.tipo==='rolarDado'&&pedidoDado?.tipo==='ajuste'){
      const pedido=pedidoDado.pedido;pedidoDado={...pedidoDado,tipo:'rolando'};transmitir();
      const resposta={pedido};
      if(Array.isArray(d.formulas)&&d.formulas.length)resposta.formulas=d.formulas.map(x=>String(x||'').replace(/\s+/g,''));
      else resposta.formula=String(d.formula||'').replace(/\s+/g,'');
      resposta.recursosAtivos=Array.isArray(d.recursosAtivos)?d.recursosAtivos:[];
      await responderDado(resposta);
    }else if(d.tipo==='rerrolarDado'&&pedidoDado?.tipo==='resultado'&&d.rerrolagem){
      const pedido=pedidoDado.pedido;pedidoDado={...pedidoDado,tipo:'rolando'};transmitir();await responderDado({pedido,rerrolar:true,rerrolagem:d.rerrolagem});
    }else if(d.tipo==='continuarDado'&&pedidoDado?.tipo==='resultado'){
      const pedido=pedidoDado.pedido;pedidoDado=null;transmitir();await responderDado({pedido,continuar:true});
    }else if(d.tipo==='cancelarDado'&&pedidoDado){
      const pedido=pedidoDado.pedido;pedidoDado=null;transmitir();await responderDado({pedido,cancelar:true});
    }else{
      if(!estado||!pronta||ocupado)return;
      if(d.rev!==undefined&&d.rev!==estado.rev)return;
      if(d.tipo==='linhas'){linhas=Math.max(1,Math.min(5,Number(d.valor)||3));localStorage.setItem(ns+'/linhas',linhas);}
    else if(d.tipo==='compactar'){compacto=!compacto;localStorage.setItem(ns+'/compacto',compacto?'1':'0');}
    else if(d.tipo==='focar'){
      const a=atores().find(x=>x.id===d.id),p=pos(a);if(!a||!token(a))return;
      const [w,h,escala]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight(),OBR.viewport.getScale()]);
      const zoom=Math.max(escala,1.35);await OBR.viewport.animateTo({scale:zoom,position:{x:w/2-p.x*zoom,y:h/2-p.y*zoom}});return;
    }
    else if(d.tipo==='ficha'){localStorage.setItem(ns+'/abrir-ficha/'+OBR.room.id,JSON.stringify({id:atorId,quando:Date.now()}));if(ator()?.token)await OBR.player.select([ator().token],true);await OBR.action.open();bus.postMessage({abrirFicha:atorId});return;}
    else if(d.tipo==='ator'){if(!atores().some(a=>a.id===d.id&&controla(a)))return;await cancelar();atorId=d.id;}
    else if(d.tipo==='desfazer'&&pendente?.escolha==='lista'){
      pendente.cmd.alvos.pop();await atualizarLista(pendente);
    }
    else if(d.tipo==='concluir'&&pendente?.escolha==='lista'){
      if(pendente.cmd.alvos.length<pendente.regraLista.min)return;
      pendente.pronto=true;
    }
    else if(d.tipo==='cancelar')await cancelar();
    else if(d.tipo==='confirmar'){
      if(!pendente?.pronto||pendente.rev!==estado.rev||d.rev!==estado.rev)return;
      const cmd={...pendente.cmd,confirmado:true,modo:d.modo,ajuste:d.ajuste??0,dadosAjuste:d.dadosAjuste??[]};
      pendente.rolagem=true;ocupado=true;await publicarPrevia();await layout();transmitir();
      try{await api.enviar(cmd);}finally{ocupado=false;if(pendente)await cancelar();}
    }else if(d.tipo==='resolverReacao'){
      const rp=estado.reacaoPendente,reator=atores().find(a=>a.id===rp?.reator);
      if(!rp||!controla(reator))return;
      ocupado=true;transmitir();
      try{await api.enviar({tipo:'resolverReacao',ator:reator.id,opcao:d.opcao||null,rev:estado.rev,
        confirmado:eu.role==='GM'&&reator.ficha.tipo==='pj',modo:d.modo||'normal',ajuste:d.ajuste??0,dadosAjuste:d.dadosAjuste??[]});}finally{ocupado=false;}
    }else if(d.tipo==='teste'){
      if(d.ator){if(!atores().some(a=>a.id===d.ator&&controla(a)))return;atorId=d.ator;}
      const a=ator(),grupo=d.grupo,chave=d.chave;
      if(!controla(a)||!['pericias','salvaguardas'].includes(grupo)||typeof chave!=='string')return;
      await cancelar();pendente={cmd:{tipo:'teste',ator:a.id,rev:estado.rev,grupo,chave},rev:estado.rev,
        escolha:null,titulo:(grupo==='pericias'?'Perícia · ':'Salvaguarda · ')+chave,pronto:true,rolagem:false,
        substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:'Rolagem rápida de '+a.nome+' · não consome ações.'};
    }else if(d.tipo==='encerrarConcentracao'){
      const a=ator();if(!controla(a)||!a.concentracaoAtiva)return;
      ocupado=true;transmitir();try{await api.enviar({tipo:'encerrarConcentracao',ator:a.id,rev:estado.rev,confirmado:eu.role==='GM'&&a.ficha.tipo==='pj'});}finally{ocupado=false;}
    }else if(d.tipo==='salvaguardaMorte'){
      const a=ator();if(!controla(a)||a.pv!==0||a.estadoVida!=='inconsciente'||estado.ordem[estado.vez]!==a.id)return;
      await cancelar();pendente={cmd:{tipo:'salvaguardaMorte',ator:a.id,rev:estado.rev},rev:estado.rev,escolha:null,titulo:'Salvaguarda contra a morte · '+a.nome,pronto:true,rolagem:false,substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:'10 ou mais: sucesso · 1 natural: duas falhas · 20 natural: recupera 1 PV.'};
    }else if(d.tipo==='usarItem'){
      const a=ator(),item=a?.ficha.inventario?.itens.find(i=>i.id===d.itemId&&i.tipo==='consumivel'&&i.quantidade>0);if(!controla(a)||!item)return;
      ocupado=true;transmitir();try{await api.enviar({tipo:'inventario',ator:a.id,operacao:'usar',itemId:item.id,rev:estado.rev,confirmado:eu.role==='GM'&&a.ficha.tipo==='pj'});}finally{ocupado=false;}
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
    const imediato=e.data?.pedir===true||['dicaEfeito','alternarAdicional','rolarDado','rerrolarDado','continuarDado','cancelarDado'].includes(e.data?.tipo);
    const executar=async()=>{try{await mensagem(e.data);}catch(err){transmitir();OBR.notification.show(err.message||String(err),'ERROR');}};
    if(imediato)executar();else serial(executar);
  };
  OBR.broadcast.onMessage(canalPrevia,e=>serial(async()=>{
    const d=e.data??{};
    if(d.tipo==='solicitar'){if(pendente)await publicarPrevia();return;}
    const participantes=await OBR.party.getPlayers(),remetente=participantes.find(p=>p.connectionId===e.connectionId),a=atores().find(x=>x.id===d.atorId);
    if(!remetente||!a)return;
    if(!remetentePodePublicarPrevia(remetente,a))return;
    if(d.tipo==='fechar'){
      if(acaoPublica?.id!==d.id||acaoPublica.remetenteId!==remetente.id)return;
      acaoPublica=null;await limparMarcasPublicas();await layout();transmitir();return;
    }
    if(d.tipo!=='atualizar'||!d.id||!d.pendente||!marcasPublicasValidas(d.marcas))return;
    await limparMarcasPublicas();
    const items=reconstruirMarcas(d.marcas);
    if(items.length){await OBR.scene.local.addItems(items);marcasPublicas=items.map(x=>x.id);}
    acaoPublica={...d.pendente,id:d.id,atorId:a.id,remetenteId:remetente.id,somenteLeitura:true};
    await layout();transmitir();
  }));
  // O Owlbear preserva ferramentas registradas enquanto a sala continua
  // aberta. Ao atualizar a extensão, tentar criar o mesmo ID novamente lança
  // erro e interrompe o controlador antes de ele abrir rodapé e carrossel.
  // Remover e recriar torna a inicialização segura após deploy ou F5.
  try{
    await OBR.tool.remove(tool).catch(()=>{});
    await OBR.tool.removeMode(mode).catch(()=>{});
    await OBR.tool.createMode({id:mode,icons:[{...icons[0],filter:{activeTools:[tool]}}],cursors:[{cursor:'crosshair'}],
      onToolClick:(_,e)=>{if(!pendente)return true;serial(()=>escolher(e));return false;},
      onToolDragStart:(_,e)=>{
        const a=estado&&atual(estado);
        if(!pendente&&a&&controla(a)&&a.token===e.target?.id)serial(async()=>{atorId=a.id;await preparar({tipo:'mover'});transmitir();});
      },
      onToolDragEnd:(_,e)=>serial(()=>escolher(e)),
      onKeyDown:(_,e)=>{if(e.code==='Escape')serial(()=>mensagem({tipo:'cancelar'}));}});
    await OBR.tool.create({id:tool,icons,defaultMode:mode});
  }catch(e){
    console.warn('Ferramenta de mira indisponível; a HUD continuará ativa.',e);
    Promise.resolve(OBR.notification.show('A HUD foi recuperada, mas a ferramenta de mira precisa recarregar a sala.','WARNING')).catch(()=>{});
  }
  api=await sala((s,i)=>serial(()=>atualizar(s,i)));
  responderDado=await interfaceRolagens(async d=>{
    const vista=visibilidadeRolagem(d,eu);
    if(vista.tipo==='fechar'){
      if(pedidoDado?.pedido===vista.pedido)pedidoDado=null;
      if(anuncioDado?.pedido===vista.pedido)anuncioDado=null;
    }else if(vista.tipo==='pedido'){
      pedidoDado=vista.pedido.tipo==='erro'?{...pedidoDado,...vista.pedido,tipo:'ajuste',erro:vista.pedido.mensagem}:vista.pedido;
    }else if(vista.tipo==='anuncio'){
      anuncioDado=vista.anuncio;clearTimeout(timerAnuncio);
      timerAnuncio=setTimeout(()=>serial(async()=>{if(anuncioDado?.pedido===vista.anuncio.pedido){anuncioDado=null;await layout();transmitir();}}),6500);
    }
    await layout();transmitir();
  });
  OBR.scene.onReadyChange(r=>serial(async()=>{
    pronta=r;estado=null;tokens=[];pendente=null;acaoPublica=null;pedidoDado=null;anuncioDado=null;clearTimeout(timerAnuncio);anterior=null;marcas=[];marcasPublicas=[];
    await layout();
    if(ferramentaDoTurno&&await OBR.tool.getActiveTool()===tool)await OBR.tool.activateTool(ferramentaDoTurno);
    ferramentaDoTurno=null;
    if(r)await api.notify();
  }));
  OBR.player.onChange(p=>{const a=atores().find(x=>x.token===p.selection?.[0]);if(a&&controla(a)&&!pendente&&a.id!==atorId)serial(()=>mensagem({tipo:'ator',id:a.id}));});
  if(typeof OBR.scene.items.onChange==='function'){
    let quadro=0,ultimos;
    OBR.scene.items.onChange(items=>{ultimos=items;if(quadro)return;quadro=requestAnimationFrame(()=>{quadro=0;const lote=ultimos;serial(()=>sincronizarTokens(lote));});});
  }
  // Remove instâncias que possam ter sobrevivido ao recarregamento do
  // background antes da primeira sincronização com o encontro.
  await Promise.all(partesHud.map(parte=>OBR.popover.close(ns+'/hud/'+parte).catch(()=>{})));
  await api.notify();
  await OBR.broadcast.sendMessage(canalPrevia,{tipo:'solicitar'},{destination:'REMOTE'}).catch(()=>{});
  let verificando=false;
  setInterval(()=>{if(verificando)return;verificando=true;serial(async()=>{try{if(pronta&&!estado)await api.notify();else if(abertos.size)await layout();}finally{verificando=false;}});},1200);
}

