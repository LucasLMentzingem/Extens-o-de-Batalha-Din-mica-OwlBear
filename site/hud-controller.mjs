import OBR,{buildCurve,buildLine} from './vendor/sdk.mjs';
import {ns,pronto,sala,interfaceRolagens} from './bridge.mjs';
import {atual,multi,incluirAlvo,destinoDeslocamento,dentroDaArea,opcoesDisponiveis} from './engine.mjs';

const tool=ns+'/mirar', mode=tool+'/ponto';
const url=new URL('./hud.html',import.meta.url);
const icons=[{icon:new URL('./icone.svg',url).href,label:'Mira e movimento'}];
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
  return atores.filter(a=>{const p=pos(a);return dentroDaArea(origemM,pontoM,{x:p.x/dpi,y:p.y/dpi},rule);});
}
export async function iniciarHud(){
  await pronto();
  const bus=await canalHud(),abertos=new Map();
  let estado,eu,api,atorId,pendente,anterior,pedidoDado,responderDado,ocupado=false,linhas=Number(localStorage.getItem(ns+'/linhas'))||3,espacoEfeitos=0;
  let compacto=localStorage.getItem(ns+'/compacto')==='1';
  let dpi=1,marcas=[],tokens=[],pronta=await OBR.scene.isReady(),fila=Promise.resolve(),ferramentaDoTurno;
  const serial=fn=>{fila=fila.then(fn).catch(e=>OBR.notification.show(e.message||String(e),'ERROR'));};
  const atores=()=>estado?.atores??[];
  const ator=()=>atores().find(a=>a.id===atorId);
  const controla=a=>a&&(eu.role==='GM'||(a.ficha.tipo==='pj'&&a.dono===eu.id));
  const token=a=>tokens.find(t=>t.id===a?.token);
  const pos=a=>token(a)?.position??{x:a.x*dpi,y:a.y*dpi};
  function transmitir(){
    if(estado)bus.postMessage({vista:{estado,eu:{id:eu.id,role:eu.role},atorId,linhas,compacto,ocupado,espacoEfeitos,
      imagens:Object.fromEntries(atores().map(a=>[a.id,token(a)?.image?.url])),pedidoDado,
      pendente:pendente&&{titulo:pendente.titulo,detalhe:pendente.detalhe,pronto:pendente.pronto,
        opcao:pendente.cmd.opcao,lista:pendente.escolha==='lista',quantidade:pendente.cmd.alvos?.length,min:pendente.regraLista?.min,max:pendente.regraLista?.max,
        alvos:pendente.cmd.alvos??[],rolagem:pendente.rolagem,substitui:pendente.substitui,rev:pendente.rev}}});
  }
  async function janela(parte,box){
    const id=ns+'/hud/'+parte;
    if(!box){if(abertos.has(parte)){await OBR.popover.close(id);abertos.delete(parte);}return;}
    const key=JSON.stringify(box);
    if(abertos.get(parte)===key)return;
    if(abertos.has(parte))await OBR.popover.close(id);
    const [left,top,width,height]=box;
    await OBR.popover.open({id,url:url.href+'?parte='+parte,width,height,hidePaper:true,disableClickAway:true,marginThreshold:0,
      anchorReference:'POSITION',anchorPosition:{left,top},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});
    abertos.set(parte,key);
  }
  async function layout(){
    const ativo=pronta&&estado&&atores().length>0;
    const caixas={};
    if(ativo){
      const [w,h]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]);
      const temEfeitos=(ator()?.efeitosAtivos?.length??0)>0||Boolean(ator()?.concentracaoAtiva);
      espacoEfeitos=temEfeitos?Math.min(128,Math.max(88,Math.floor(w*.22))):0;
      const largura=Math.max(260,Math.min(800,w-14-espacoEfeitos)),altura=Math.min(124+linhas*54,Math.floor(h*.55));
      if(estado.fase!=='preparo')caixas.ordem=[Math.round((w-Math.min(620,w-100))/2),4,Math.min(620,w-100),55];
      if(ator()){
        const larguraCorpo=compacto?92:largura,total=larguraCorpo+espacoEfeitos,alturaBarra=compacto?Math.max(102,temEfeitos?164:102):altura;
        caixas.barra=[Math.round((w-total)/2),h-alturaBarra-48,total,alturaBarra];
      }
      if(estado.fase==='iniciativa'&&atores().some(a=>controla(a)&&a.init===null))caixas.iniciativa=[Math.round((w-Math.min(320,w-12))/2),Math.round(h*.40),Math.min(320,w-12),108];
      if(pendente){
        const cw=Math.min(410,w-12),ch=Math.min(480,h-72),left=Math.min(w-cw-10,Math.max(10,w*.75-cw/2));
        caixas.acao=[Math.round(left),Math.round(Math.max(62,(h-ch)/2)),cw,ch];
      }
      const rp=estado.reacaoPendente,reator=atores().find(a=>a.id===rp?.reator);
      if(rp&&controla(reator))caixas.reacao=[Math.round((w-Math.min(390,w-12))/2),Math.round(Math.max(60,(h-245)/2)),Math.min(390,w-12),245];
      if(pedidoDado){
        const n=pedidoDado.formulas?.length??pedidoDado.resultado?.resultados?.length??1;
        const extraResultado=pedidoDado.tipo==='resultado'&&pedidoDado.meta?.rerrolagens?.length?105:0;
        const extraAjuste=pedidoDado.tipo!=='resultado'&&pedidoDado.meta?.adicionais?.length?115:0;
        const ch=Math.min(h-72,pedidoDado.tipo==='resultado'?190+n*82+extraResultado:160+n*116+extraAjuste);
        caixas.dados=[Math.round((w-Math.min(470,w-12))/2),Math.round(Math.max(62,(h-ch)/2)),Math.min(470,w-12),ch];
      }
    }
    for(const k of ['ordem','barra','iniciativa','acao','reacao','dados'])await janela(k,caixas[k]);
  }
  async function limparMarcas(){
    const ids=marcas;marcas=[];
    if(ids.length&&pronta)await OBR.scene.local.deleteItems(ids);
  }
  async function desenhar(items){
    await limparMarcas();if(items.length){await OBR.scene.local.addItems(items);marcas=items.map(x=>x.id);}
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
    pendente=null;await limparMarcas();
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
    const cmd={tipo:reacao?'reagir':d.tipo,ator:a.id,rev:estado.rev,opcao:o?.id,assistido:!rule};
    let escolha=null;
    if(d.tipo==='mover')escolha='destino';
    if(['ataque','salva','efeito','cura','pv_temporario','estabilizar','conceder_dado'].includes(rule?.tipo))escolha=(rule.raioM||rule.area)?(rule.origemArea==='conjurador'&&!['cone','linha'].includes(rule.area?.forma)?null:'area'):'alvo';
    if(multi(o)){escolha='lista';cmd.alvos=[];}
    const titulo=o?.nome??({passar:'Finalizar turno',mover:'Mover',iniciativa:'Rolar iniciativa'})[d.tipo];
    pendente={cmd,regraLista:multi(o),rev:estado.rev,escolha,rule,titulo,pronto:!escolha,rolagem:false,
      substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:reacao?'Conferir gatilho e gastar a reação.':o&&!rule?'Efeito assistido pelo mestre.':a.nome};
    if(escolha){
      dpi=await OBR.scene.grid.getDpi();
      const origem=pos(a),raio=escolha==='destino'?a.metros:rule.alcanceM;
      pendente.origem=origem;pendente.raio=raio;
      pendente.detalhe={destino:'Marque o destino no mapa',area:'Marque o centro da área',alvo:'Clique no token do alvo'}[escolha]+' · '+medida(raio);
      if(escolha==='lista')pendente.detalhe='Selecione no mapa · 0/'+o.selecao.max;
      anterior=await OBR.tool.getActiveTool();
      await OBR.tool.activateTool(tool);await OBR.tool.activateMode(tool,mode);
      await desenhar([circulo(origem,raio*dpi,'#e5c079')]);
    }
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
    const forma=p.rule?.area?.forma??(p.rule?.raioM?'círculo':'');p.ponto=ponto;p.pronto=true;p.detalhe=(alvo?alvo.nome+' · ':'')+medida(d)+(temArea?' · '+forma+' · '+(afetados.map(a=>a.nome).join(', ')||'área vazia'):'')+(p.rule?.deslocamentoForcado?' · seta branca: destino do alvo':'');
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
      await cancelar();ocupado=true;await layout();transmitir();
      try{await api.enviar(cmd);}finally{ocupado=false;}
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
    }else if(d.tipo==='npcs'){
      if(eu.role!=='GM'||estado.fase!=='iniciativa')return;
      // Each acknowledgment follows its snapshot; let the view queue settle between NPCs.
      ocupado=true;transmitir();
      try{let rev=estado.rev;for(const a of atores().filter(a=>a.emCombate!==false&&a.ficha.tipo==='npc'&&a.init===null)){await api.enviar({tipo:'iniciativa',ator:a.id,rev});rev++;}}finally{ocupado=false;}
    }else if(['usar','mover','passar','iniciativa'].includes(d.tipo)){
      if(d.ator){if(!atores().some(a=>a.id===d.ator&&controla(a)))return;atorId=d.ator;}
      await preparar(d);
    }
    }
    await layout();transmitir();
  }
  bus.onmessage=e=>{
    const imediato=e.data?.pedir===true||['alternarAdicional','rolarDado','rerrolarDado','continuarDado','cancelarDado'].includes(e.data?.tipo);
    const executar=async()=>{try{await mensagem(e.data);}catch(err){transmitir();OBR.notification.show(err.message||String(err),'ERROR');}};
    if(imediato)executar();else serial(executar);
  };
  await OBR.tool.createMode({id:mode,icons:[{...icons[0],filter:{activeTools:[tool]}}],cursors:[{cursor:'crosshair'}],
    onToolClick:(_,e)=>{if(!pendente)return true;serial(()=>escolher(e));return false;},
    onToolDragStart:(_,e)=>{
      const a=estado&&atual(estado);
      if(!pendente&&a&&controla(a)&&a.token===e.target?.id)serial(async()=>{atorId=a.id;await preparar({tipo:'mover'});transmitir();});
    },
    onToolDragEnd:(_,e)=>serial(()=>escolher(e)),
    onKeyDown:(_,e)=>{if(e.code==='Escape')serial(()=>mensagem({tipo:'cancelar'}));}});
  await OBR.tool.create({id:tool,icons,defaultMode:mode});
  api=await sala((s,i)=>serial(()=>atualizar(s,i)));
  responderDado=await interfaceRolagens(async d=>{
    if(d.tipo==='erro')pedidoDado={...pedidoDado,tipo:'ajuste',erro:d.mensagem};
    else pedidoDado=d;
    await layout();transmitir();
  });
  OBR.scene.onReadyChange(r=>serial(async()=>{
    pronta=r;estado=null;tokens=[];pendente=null;pedidoDado=null;anterior=null;marcas=[];
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
  await api.notify();
  let verificando=false;
  setInterval(()=>{if(verificando)return;verificando=true;serial(async()=>{try{if(pronta&&!estado)await api.notify();else if(abertos.size)await layout();}finally{verificando=false;}});},1200);
}

