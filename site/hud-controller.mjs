import OBR,{buildCurve,buildLine} from './vendor/sdk.mjs';
import {ns,pronto,sala} from './bridge.mjs';
import {atual,multi,incluirAlvo} from './engine.mjs';

const tool=ns+'/mirar', mode=tool+'/ponto';
const url=new URL('./hud.html',import.meta.url);
const icons=[{icon:new URL('./icone.svg',url).href,label:'Mira e movimento'}];
export const canalHud=async()=>new BroadcastChannel([ns,'hud',OBR.room.id,await OBR.player.getConnectionId()].join('/'));
const medida=n=>Number(n.toFixed(2)).toLocaleString('pt-BR')+' m';

function circulo(centro,raio,cor){
  const pontos=Array.from({length:80},(_,i)=>({x:raio*Math.cos(i*Math.PI/40),y:raio*Math.sin(i*Math.PI/40)}));
  return buildCurve().position(centro).points(pontos).closed(true).fillColor(cor).fillOpacity(.08)
    .strokeColor(cor).strokeWidth(3).layer('DRAWING').locked(true).disableHit(true).build();
}
export async function iniciarHud(){
  await pronto();
  const bus=await canalHud(),abertos=new Map();
  let estado,eu,api,atorId,pendente,anterior,ocupado=false,linhas=Number(localStorage.getItem(ns+'/linhas'))||3;
  let compacto=localStorage.getItem(ns+'/compacto')==='1';
  let dpi=1,marcas=[],tokens=[],pronta=await OBR.scene.isReady(),fila=Promise.resolve(),ferramentaDoTurno;
  const serial=fn=>{fila=fila.then(fn).catch(e=>OBR.notification.show(e.message||String(e),'ERROR'));};
  const atores=()=>estado?.atores??[];
  const ator=()=>atores().find(a=>a.id===atorId);
  const controla=a=>a&&(eu.role==='GM'||(a.ficha.tipo==='pj'&&a.dono===eu.id));
  const token=a=>tokens.find(t=>t.id===a?.token);
  const pos=a=>token(a)?.position??{x:a.x*dpi,y:a.y*dpi};
  function transmitir(){
    if(estado)bus.postMessage({vista:{estado,eu:{id:eu.id,role:eu.role},atorId,linhas,compacto,ocupado,
      imagens:Object.fromEntries(atores().map(a=>[a.id,token(a)?.image?.url])),
      pendente:pendente&&{titulo:pendente.titulo,detalhe:pendente.detalhe,pronto:pendente.pronto,
        lista:pendente.escolha==='lista',quantidade:pendente.cmd.alvos?.length,min:pendente.regraLista?.min,rolagem:pendente.rolagem,substitui:pendente.substitui,rev:pendente.rev}}});
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
      const largura=Math.min(800,w-14),altura=Math.min(124+linhas*54,Math.floor(h*.55));
      if(estado.fase!=='preparo')caixas.ordem=[Math.round((w-Math.min(620,w-100))/2),4,Math.min(620,w-100),55];
      if(ator())caixas.barra=compacto?[Math.round((w-92)/2),h-150,92,102]:[Math.round((w-largura)/2),h-altura-48,largura,altura];
      if(estado.fase==='iniciativa'&&atores().some(a=>controla(a)&&a.init===null))caixas.iniciativa=[Math.round((w-Math.min(320,w-12))/2),Math.round(h*.40),Math.min(320,w-12),108];
      if(pendente?.pronto){
        const cw=Math.min(360,w-12),ch=pendente.rolagem?205:118;
        const ponto=pendente.ponto?await OBR.viewport.transformPoint(pendente.ponto):{x:w/2,y:h/2};
        caixas.confirmar=[Math.round(Math.max(6,Math.min(w-cw-6,ponto.x-cw/2))),Math.round(Math.max(58,Math.min(h-ch-5,ponto.y-ch-14))),cw,ch];
      }
      const rp=estado.reacaoPendente,reator=atores().find(a=>a.id===rp?.reator);
      if(rp&&controla(reator))caixas.reacao=[Math.round((w-Math.min(390,w-12))/2),Math.round(Math.max(60,(h-245)/2)),Math.min(390,w-12),245];
    }
    for(const k of ['ordem','barra','iniciativa','confirmar','reacao'])await janela(k,caixas[k]);
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
    return [[origem,fim],[fim,ponta1],[fim,ponta2]].map(([a,b])=>buildLine().startPosition(a).endPosition(b).strokeColor('#e54848').strokeWidth(5).layer('DRAWING').locked(true).disableHit(true).build());
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
    const o=a.ficha.opcoes.find(o=>o.id===d.opcao),rule=o?.automacao;
    const reacao=o?.custo?.some(c=>c.tipo==='reacao');
    if(d.tipo==='usar'&&!o)return;
    if(d.tipo!=='iniciativa'&&!reacao&&atual(estado)?.id!==a.id)return;
    const cmd={tipo:reacao?'reagir':d.tipo,ator:a.id,rev:estado.rev,opcao:o?.id,assistido:!rule};
    let escolha=null;
    if(d.tipo==='mover')escolha='destino';
    if(rule?.tipo==='ataque'||rule?.tipo==='salva')escolha=rule.raioM?'area':'alvo';
    if(multi(o)){escolha='lista';cmd.alvos=[];}
    const titulo=o?.nome??({passar:'Finalizar turno',mover:'Mover',iniciativa:'Rolar iniciativa'})[d.tipo];
    pendente={cmd,regraLista:multi(o),rev:estado.rev,escolha,rule,titulo,pronto:!escolha,rolagem:['ataque','salva'].includes(rule?.tipo),
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
    p.pronto=false;p.detalhe=ids.length+'/'+p.regraLista.max+' · '+(unicos.map(a=>a.nome+' ×'+ids.filter(id=>id===a.id).length).join(', ')||'Selecione no mapa');
    await desenhar([circulo(p.origem,p.raio*dpi,'#e5c079'),...unicos.map(a=>circulo(pos(a),dpi*.5,'#79cfb1'))]);
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
    const raio=p.rule?.raioM;
    const items=[circulo(p.origem,p.raio*dpi,'#e5c079'),circulo(ponto,(raio||.43)*dpi,'#79cfb1')];
    if(p.escolha==='destino')items.push(buildLine().startPosition(p.origem).endPosition(ponto).strokeColor('#f2d398').strokeWidth(4).layer('DRAWING').disableHit(true).build());
    await desenhar(items);
    const afetados=raio?atores().filter(a=>Math.hypot(pos(a).x-ponto.x,pos(a).y-ponto.y)<=raio*dpi).map(a=>a.nome):[];
    p.ponto=ponto;p.pronto=true;p.detalhe=(alvo?alvo.nome+' · ':'')+medida(d)+(raio?' · raio '+medida(raio)+' · '+(afetados.join(', ')||'área vazia'):'');
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
    if(pendente&&(pendente.rev!==s.rev||s.fase==='preparo'))await cancelar();
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
        escolha:null,titulo:(grupo==='pericias'?'Perícia · ':'Salvaguarda · ')+chave,pronto:true,rolagem:true,
        substitui:eu.role==='GM'&&a.ficha.tipo==='pj',detalhe:'Rolagem rápida de '+a.nome+' · não consome ações.'};
    }else if(d.tipo==='npcs'){
      if(eu.role!=='GM'||estado.fase!=='iniciativa')return;
      // Each acknowledgment follows its snapshot; let the view queue settle between NPCs.
      ocupado=true;transmitir();
      try{let rev=estado.rev;for(const a of atores().filter(a=>a.emCombate!==false&&a.ficha.tipo==='npc'&&a.init===null)){await api.enviar({tipo:'iniciativa',ator:a.id,rev});rev++;}}finally{ocupado=false;}
    }else if(['usar','mover','passar','iniciativa'].includes(d.tipo)){
      if(d.ator){if(!atores().some(a=>a.id===d.ator&&controla(a)))return;atorId=d.ator;}
      await preparar(d);
    }
    await layout();transmitir();
  }
  bus.onmessage=e=>serial(async()=>{try{await mensagem(e.data);}catch(err){transmitir();throw err;}});
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
  OBR.scene.onReadyChange(r=>serial(async()=>{
    pronta=r;estado=null;tokens=[];pendente=null;anterior=null;marcas=[];
    await layout();
    if(ferramentaDoTurno&&await OBR.tool.getActiveTool()===tool)await OBR.tool.activateTool(ferramentaDoTurno);
    ferramentaDoTurno=null;
    if(r)await api.notify();
  }));
  OBR.player.onChange(p=>{const a=atores().find(x=>x.token===p.selection?.[0]);if(a&&controla(a)&&!pendente&&a.id!==atorId)serial(()=>mensagem({tipo:'ator',id:a.id}));});
  await api.notify();
  let verificando=false;
  setInterval(()=>{if(verificando)return;verificando=true;serial(async()=>{try{if(pronta&&!estado)await api.notify();else if(abertos.size)await layout();}finally{verificando=false;}});},1200);
}

