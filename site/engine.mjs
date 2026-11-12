export const atributos = ['for','des','con','int','sab','car'];
export const periciasPadrao = {
  'Acrobacia':'des','Adestrar Animais':'sab','Arcanismo':'int','Atletismo':'for',
  'Atuação':'car','Enganação':'car','Furtividade':'des','História':'int',
  'Intimidação':'car','Intuição':'sab','Investigação':'int','Medicina':'sab',
  'Natureza':'int','Percepção':'sab','Persuasão':'car','Prestidigitação':'des',
  'Religião':'int','Sobrevivência':'sab'
};
export function exigir(ok, msg) { if (!ok) throw new Error(msg); }
const inteiro = (n,min,max) => Number.isInteger(n) && n >= min && n <= max;
const idOK = id => typeof id === 'string' && /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(id) && !Object.hasOwn(Object.prototype,id);
const nomeOK = nome => typeof nome === 'string' && nome.trim().length > 0;
function lista(xs, label) {
  exigir(Array.isArray(xs) && xs.every(x => x && idOK(x.id)) && new Set(xs.map(x=>x.id)).size===xs.length, label+' contém IDs inválidos ou repetidos.');
}
export function atualizarMagias(f){
  for(const o of f.opcoes??[]){
    if(typeof o.nome==='string'&&o.custo?.some(c=>c.tipo==='reacao')&&o.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes('ataque de oportunidade'))o.gatilho='sair_alcance';
    if(o.categoria!=='magia'||o.automacao||typeof o.nome!=='string')continue;
    const nome=o.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().split('|').pop().split('·')[0].trim();
    const circulo=o.circuloBase??1;
    if(nome==='misseis magicos'){
      o.automacao={tipo:'projeteis',alcanceM:36,dano:'1d4+1',elemento:'energetico'};
      o.selecao={tipo:'alvos',min:2+circulo,max:2+circulo,repetirAlvo:true};
    }
    if(nome==='bencao'){
      o.automacao={tipo:'bencao',alcanceM:9};
      o.selecao={tipo:'alvos',min:1,max:2+circulo,repetirAlvo:false};
    }
  }
  // Expor círculos superiores como opções com o custo e o número de alvos correspondentes.
  for(const o of [...(f.opcoes??[])]){
    if(!['projeteis','bencao'].includes(o.automacao?.tipo)||o.varianteDe||!o.selecao)continue;
    const base=o.circuloBase??1;
    if(!o.custo?.some(c=>c.id==='espaco-'+base))continue;
    for(let n=base+1;n<=5;n++){
      const id=o.id+'-c'+n;
      if(!f.recursos?.some(r=>r.id==='espaco-'+n)||f.opcoes.some(x=>x.id===id))continue;
      const v=structuredClone(o);v.id=id;v.varianteDe=o.id;v.circuloBase=n;
      v.nome=o.nome.replace(/^\dº\s*\|\s*/,'').split(' · ')[0]+' ('+n+'º círculo)';
      v.custo.find(c=>c.id==='espaco-'+base).id='espaco-'+n;
      v.selecao.max+=n-base;if(v.selecao.repetirAlvo)v.selecao.min+=n-base;
      f.opcoes.push(v);
    }
  }
}
export const multi=o=>o?.selecao?.tipo==='alvos'&&(o.selecao.max>1||['projeteis','bencao'].includes(o.automacao?.tipo))?o.selecao:null;
export function incluirAlvo(lista,id,regra){
  if(!regra.repetirAlvo&&lista.includes(id))return lista.filter(x=>x!==id);
  exigir(lista.length<regra.max,'Seleção completa. Desfaça uma escolha para trocar o alvo.');
  return [...lista,id];
}
export function validar(f) {
  exigir(f?.versaoFormato===1 && idOK(f.id) && nomeOK(f.nome) && ['pj','npc'].includes(f.tipo),'Informe versaoFormato 1, id, nome e tipo pj/npc.');
  exigir(Array.isArray(f.classes) && f.classes.every(c=>idOK(c.id)&&inteiro(c.nivel,1,10)) && inteiro(f.classes.reduce((n,c)=>n+c.nivel,0),1,10),'A soma dos níveis deve estar entre 1 e 10.');
  exigir(atributos.every(k=>inteiro(f.atributos?.[k],1,30)) && inteiro(f.pvMaximos,1,9999) && inteiro(f.caBase,0,99) && Number.isFinite(f.deslocamentosM?.andar) && f.deslocamentosM.andar>=0,'Verifique atributos, PV, CA e deslocamento.');
  exigir(Array.isArray(f.opcoes)&&Array.isArray(f.recursos),'Opções e recursos devem ser listas.');
  f=structuredClone(f);atualizarMagias(f);
  lista(f.recursos,'Recursos'); lista(f.opcoes,'Opções');
  for(const r of f.recursos) exigir(nomeOK(r.nome)&&inteiro(r.maximo,0,9999)&&inteiro(r.saldoInicial,0,r.maximo),'Saldo inválido em '+r.id);
  for(const o of f.opcoes) {
    exigir(nomeOK(o.nome),'Opção sem nome.');
    for(const c of o.custo??[]) exigir(['acao','bonus','reacao','recurso'].includes(c.tipo) && inteiro(c.quantidade,1,999) && (c.tipo!=='recurso'||f.recursos.some(r=>r.id===c.id)), 'Custo inválido em '+o.id);
    const a=o.automacao;
    if(!a) continue;
    exigir(['ataque','salva','disparada','desengajar','efeito_conjuracao','projeteis','bencao'].includes(a.tipo), 'Automação desconhecida em '+o.id);
    if(multi(o)||['projeteis','bencao'].includes(a.tipo)){
      const r=o.selecao;
      exigir(r?.tipo==='alvos'&&inteiro(r.max,1,64)&&inteiro(r.min,1,r.max)&&typeof r.repetirAlvo==='boolean'&&Number.isFinite(a.alcanceM)&&a.alcanceM>=0,'Seleção de alvos inválida em '+o.id);
      if(a.tipo==='projeteis')exigir(/^\d{1,2}d(?:4|6|8|10|12)(?:[+-]\d{1,2})?$/.test(a.dano),'Dano por projétil inválido.');
    }
    if(a.tipo==='efeito_conjuracao')exigir(inteiro(a.turnos,1,100)&&idOK(a.origem)&&inteiro(a.bonusCD,0,10),'Duração, origem ou bônus de CD inválido.');
    if(['ataque','salva'].includes(a.tipo)) {
      exigir(Number.isFinite(a.alcanceM)&&a.alcanceM>=0 && /^(?:[1-9]|[1-9][0-9])d(?:4|6|8|10|12)(?:[+-]\d{1,2})?$/.test(a.dano),'Dano ou alcance inválido em '+o.id);
      exigir(a.tipo==='ataque'?inteiro(a.bonus,-20,40):atributos.includes(a.atributo)&&inteiro(a.cd,1,40),'Ataque/CD inválido em '+o.id);
      if(a.raioM!==undefined) exigir(a.tipo==='salva'&&Number.isFinite(a.raioM)&&a.raioM>0,'Área inválida.');
    }
  }
  if(f.preparacao){
    const p=f.preparacao,magias=new Set(f.opcoes.filter(o=>o.categoria==='magia').map(o=>o.id));
    exigir(inteiro(p.vagas,0,150)&&Array.isArray(p.preparadas)&&Array.isArray(p.semprePreparadas)&&p.preparadas.length<=p.vagas&&[...p.preparadas,...p.semprePreparadas].every(id=>magias.has(id)),'Preparação contém vagas ou magias inválidas.');
  }
  for(const [k,n] of Object.entries(f.salvaguardas??{}))exigir(atributos.includes(k)&&inteiro(n,-30,50),'Salvaguarda inválida.');
  for(const n of Object.values(f.pericias??{}))exigir(inteiro(n,-30,50),'Bônus de perícia inválido.');
  for(const k of ['equipamentos','notas','passivas','condicoes','efeitos','resistencias','imunidades','vulnerabilidades'])if(f[k]!==undefined)exigir(Array.isArray(f[k]),'Esperada uma lista em '+k);
  const out=structuredClone(f);
  const nivel=out.classes.reduce((n,c)=>n+c.nivel,0);
  for(const o of out.opcoes){
    // Somente traduzir a sequência inteira quando todas as etapas são conhecidas.
    if(o.automacao||o.etapas?.length!==2)continue;
    const [hit,dmg]=o.etapas, parcela=dmg.parcelas?.[0];
    if(hit.tipo!=='ataque_contra_ca'||!atributos.includes(hit.atributo)||dmg.tipo!=='dano'||dmg.quando!=='acerto'||dmg.parcelas?.length!==1||o.selecao?.tipo!=='alvos'||o.selecao.max!==1)continue;
    const escala=[...(parcela.escalaPorNivelTotal??[])].filter(x=>x.nivel<=nivel).sort((a,b)=>b.nivel-a.nivel);
    const dano=escala[0]?.dados??parcela.dados;
    if(!/^[1-9]\d?d(4|6|8|10|12)([+-]\d{1,2})?$/.test(dano)||!Number.isFinite(o.selecao.alcanceM))continue;
    const bonus=mod(out.atributos[hit.atributo])+(hit.somarProficiencia?(out.proficiencia??(2+Math.floor((nivel-1)/4))):0);
    o.automacao={tipo:'ataque',bonus,dano,elemento:parcela.tipo,alcanceM:o.selecao.alcanceM};
  }
  return out;
}
export const novo = () => ({rev:0,fase:'preparo',rodada:0,vez:0,atores:[],ordem:[],historico:[]});
export function adicionar(s,f,nome=f.nome) {
  const ficha=validar(f);
  const a={id:crypto.randomUUID(),nome,ficha,token:null,dono:null,pv:f.pvMaximos,rec:Object.fromEntries(f.recursos.map(r=>[r.id,r.saldoInicial])),x:s.atores.length,y:0,init:null,acao:1,bonus:1,reacao:1,metros:f.deslocamentosM.andar};
  s.atores.push(a); return a;
}
export const atual = s=>s.atores.find(a=>a.id===s.ordem[s.vez]);
export const mod = n=>Math.floor((n-10)/2);
export const bonusPericia=(f,nome)=>Number.isInteger(f.pericias?.[nome])?f.pericias[nome]:mod(f.atributos[periciasPadrao[nome]]);
const distancia=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const lado=a=>a.ficha.lado??a.ficha.tipo;
function pontoSaida(origem,destino,centro,raio){
  const vx=destino.x-origem.x,vy=destino.y-origem.y,px=origem.x-centro.x,py=origem.y-centro.y;
  const aa=vx*vx+vy*vy,bb=2*(px*vx+py*vy),cc=px*px+py*py-raio*raio;
  const delta=bb*bb-4*aa*cc;
  if(aa<=0||delta<0)return null;
  const t=(-bb+Math.sqrt(delta))/(2*aa);
  return t>=0&&t<=1?{x:origem.x+vx*t,y:origem.y+vy*t,t}:null;
}
export function oportunidades(s,movente,destino){
  return s.atores.flatMap(reator=>{
    const alcance=reator.ficha.alcanceCorpoACorpoM??1.5;
    const opcoes=(reator.ficha.opcoes??[]).filter(o=>o.gatilho==='sair_alcance'&&o.custo?.some(c=>c.tipo==='reacao'));
    if(reator===movente||lado(reator)===lado(movente)||reator.pv<=0||reator.reacao<=0||!opcoes.length)return [];
    if(distancia(reator,movente)>alcance+1e-8||distancia(reator,destino)<=alcance+1e-8)return [];
    const ponto=pontoSaida(movente,destino,reator,alcance);
    return ponto?[{reator:reator.id,ponto:{x:ponto.x,y:ponto.y},t:ponto.t,opcoes:opcoes.map(o=>o.id)}]:[];
  }).sort((a,b)=>a.t-b.t);
}
function abrirProximaReacao(s){
  const mov=s.movimentoPendente;
  while(mov?.ameacas.length){
    const proxima=mov.ameacas.shift(),reator=s.atores.find(a=>a.id===proxima.reator);
    const opcoes=(reator?.ficha.opcoes??[]).filter(o=>proxima.opcoes.includes(o.id)&&o.gatilho==='sair_alcance'&&reator.reacao>0);
    if(!reator||reator.pv<=0||!opcoes.length)continue;
    s.reacaoPendente={id:crypto.randomUUID(),gatilho:'sair_alcance',reator:reator.id,alvo:mov.ator,
      opcoes:opcoes.map(o=>o.id),ponto:proxima.ponto,terminaEm:Date.now()+20000};
    return reator;
  }
  if(mov){
    const a=s.atores.find(x=>x.id===mov.ator),d=distancia(mov.origem,mov.destino);
    a.x=mov.destino.x;a.y=mov.destino.y;a.metros=Math.max(0,a.metros-d);delete s.movimentoPendente;
  }
  delete s.reacaoPendente;return null;
}
const dadosExtrasValidos=xs=>Array.isArray(xs)&&xs.length<=4&&xs.every(x=>/^\d{1,2}d(?:4|6|8|10|12|20)$/.test(x));
export function registrar(s,t) { s.historico.unshift(t); s.historico.length=Math.min(s.historico.length,45); }
function ativar(a){
  a.acao=1;a.bonus=1;a.reacao=1;a.metros=a.ficha.deslocamentosM.andar;a.desengajado=false;
  a.efeitosAtivos=(a.efeitosAtivos??[]).filter(e=>--e.turnos>0);
}
export async function aplicar(s,c,u,rolar) {
  // The caller commits this copy only after every validation and die succeeds.
  s=structuredClone(s);
  for(const p of s.atores)atualizarMagias(p.ficha);
  const abencoado=p=>s.atores.some(x=>x.pv>0&&x.bencao?.alvos.includes(p.id));
  const dadoBencao=async p=>abencoado(p)?await rolar('1d4'):0;
  const ajusteDados=async()=>{
    const xs=c.dadosAjuste??[];exigir(dadosExtrasValidos(xs),'Dados extras inválidos.');
    let total=0;for(const formula of xs)total+=await rolar(formula);return total;
  };
  exigir(c.rev===s.rev,'O encontro mudou. Confira o turno e tente novamente.');
  const a=s.atores.find(x=>x.id===c.ator);
  const gm=u.role==='GM';
  if(['exemplo','adicionar','vincular','iniciar','encerrar','descanso','remover'].includes(c.tipo)) exigir(gm,'Somente o mestre.');
  else {
    exigir(a && (gm || (a.ficha.tipo==='pj' && a.dono===u.id)),'Você não controla esse personagem.');
    if(gm && a.ficha.tipo==='pj') exigir(c.confirmado,'Confirme a ação em nome do jogador.');
  }
  let msg='';
  switch(c.tipo) {
    case 'exemplo': {
      exigir(gm && s.fase==='preparo' && s.atores.length===0,'Carregue o exemplo em um encontro vazio.');
      const [f,g]=c.fichas;
      for(const [sheet,name] of [[f,f.nome],[g,'Soldado I'],[g,'Soldado II']]){
        const p=adicionar(s,sheet,name);
        if(c.ensaio){p.token='sim-'+p.id;if(p.ficha.tipo==='pj')p.dono='teste';}
      }
      msg='Nikki e os dois soldados entraram no encontro.';break;
    }
    case 'adicionar':
      exigir(s.fase==='preparo','Encerre o encontro para mudar os participantes.');
      adicionar(s,c.ficha,c.nome||c.ficha.nome); msg='Ficha adicionada.'; break;
    case 'remover':
      exigir(s.fase==='preparo' && a,'Remova participantes na preparação.');
      s.atores=s.atores.filter(x=>x!==a);msg=a.nome+' saiu da lista.';break;
    case 'vincular':
      exigir(a && (!c.token || !s.atores.some(x=>x!==a && x.token===c.token)),'Esse token já está vinculado.');
      exigir(!c.dono || a.ficha.tipo==='pj','NPC é controlado pelo mestre.');
      a.token=c.token||null;a.dono=c.dono||null;msg='Vínculo atualizado para '+a.nome+'.';break;
    case 'iniciar':
      exigir(s.fase==='preparo' && s.atores.length>=2 && s.atores.every(x=>x.pv>0),'Inclua pelo menos dois participantes conscientes.');
      s.fase='iniciativa';s.atores.forEach(x=>x.init=null);msg='Rolem iniciativa.';break;
    case 'iniciativa':
      exigir(s.fase==='iniciativa' && a.init===null,'Iniciativa já resolvida.');
      a.init=(await rolar('1d20'))+mod(a.ficha.atributos.des);msg=a.nome+' • iniciativa '+a.init;
      if(s.atores.every(x=>x.init!==null)){s.ordem=[...s.atores].sort((x,y)=>y.init-x.init||y.ficha.atributos.des-x.ficha.atributos.des).map(x=>x.id);s.vez=0;s.rodada=1;s.fase='turnos';s.atores.forEach(ativar);}
      break;
    case 'ajustar': {
      exigir(gm && a && inteiro(c.valor,-9999,9999),'Ajuste reservado ao mestre.');
      if(c.campo==='pv')a.pv=Math.min(a.ficha.pvMaximos,Math.max(0,a.pv+c.valor));
      else {const r=a.ficha.recursos.find(r=>r.id===c.campo);exigir(r,'Recurso desconhecido.');a.rec[r.id]=Math.min(r.maximo,Math.max(0,a.rec[r.id]+c.valor));}
      if(a.pv===0)delete a.bencao;
      msg='Ajuste do mestre em '+a.nome;break;
    }
    case 'teste': {
      const bonus=c.grupo==='pericias'?bonusPericia(a.ficha,c.chave):a.ficha.salvaguardas?.[c.chave];
      exigir(Number.isInteger(bonus)&&inteiro(c.ajuste??0,-20,20),'Teste inválido.');
      let dado=await rolar('1d20');
      if(c.modo==='vantagem')dado=Math.max(dado,await rolar('1d20'));
      if(c.modo==='desvantagem')dado=Math.min(dado,await rolar('1d20'));
      msg=a.nome+' • '+c.chave+': '+(dado+bonus+(c.ajuste??0)+await ajusteDados()+(c.grupo==='salvaguardas'?await dadoBencao(a):0));break;
    }
    case 'resolverReacao': {
      const p=s.reacaoPendente,mov=s.movimentoPendente;
      exigir(s.fase==='turnos'&&p&&mov&&p.reator===a?.id,'Esta reação não está mais disponível.');
      exigir(p.alvo===mov.ator,'O alvo da reação mudou.');
      if(!c.opcao){
        const seguinte=abrirProximaReacao(s);
        msg=a.nome+' não usou a reação.'+(seguinte?' '+seguinte.nome+' pode reagir.':' O deslocamento continuou.');
        break;
      }
      const o=a.ficha.opcoes.find(o=>o.id===c.opcao&&p.opcoes.includes(o.id)&&o.gatilho==='sair_alcance');
      exigir(o&&a.reacao>0,'Reação indisponível.');
      for(const custo of o.custo??[]){
        const bag=custo.tipo==='recurso'?a.rec:a,key=custo.tipo==='recurso'?custo.id:custo.tipo;
        exigir(bag[key]>=custo.quantidade,'Saldo insuficiente para reagir.');bag[key]-=custo.quantidade;
      }
      const alcance=a.ficha.alcanceCorpoACorpoM??1.5;
      const ataque=(o.automacao?.tipo==='ataque'?o:a.ficha.opcoes.filter(x=>x.automacao?.tipo==='ataque'&&x.automacao.alcanceM<=alcance+1e-8&&x.categoria!=='magia')
        .sort((x,y)=>y.automacao.bonus-x.automacao.bonus)[0]);
      exigir(ataque,'Nenhum ataque corpo a corpo configurado para esta reação.');
      const rule=ataque.automacao,alvo=s.atores.find(x=>x.id===p.alvo),ajuste=c.ajuste??0;
      exigir(alvo&&inteiro(ajuste,-20,20),'Ajuste ou alvo inválido.');
      let face=await rolar('1d20');
      if(c.modo==='vantagem')face=Math.max(face,await rolar('1d20'));
      if(c.modo==='desvantagem')face=Math.min(face,await rolar('1d20'));
      const total=face+rule.bonus+ajuste+await ajusteDados()+await dadoBencao(a);
      const acertou=face!==1&&(face===20||total>=alvo.ficha.caBase);
      msg=a.nome+' • '+o.nome+' com '+ataque.nome+' • '+total+(acertou?' acertou':' errou');
      if(acertou){
        let formula=rule.dano;if(face===20)formula=formula.replace(/^\d+/,n=>String(+n+1));
        let dano=await rolar(formula);
        if(alvo.ficha.imunidades?.includes(rule.elemento))dano=0;
        if(alvo.ficha.resistencias?.includes(rule.elemento))dano=Math.floor(dano/2);
        if(alvo.ficha.vulnerabilidades?.includes(rule.elemento))dano*=2;
        alvo.pv=Math.max(0,alvo.pv-dano);const percorrida=distancia(mov.origem,p.ponto);
        alvo.x=p.ponto.x;alvo.y=p.ponto.y;alvo.metros=Math.max(0,alvo.metros-percorrida);
        msg+=' e causou '+dano+'. O movimento parou em '+percorrida.toFixed(2)+' m.';
        delete s.movimentoPendente;delete s.reacaoPendente;
      }else{
        const seguinte=abrirProximaReacao(s);msg+=seguinte?' • '+seguinte.nome+' pode reagir.':' • o deslocamento continuou.';
      }
      break;
    }
    case 'reagir': {
      const o=a.ficha.opcoes.find(o=>o.id===c.opcao && o.custo?.some(v=>v.tipo==='reacao'));
      exigir(s.fase==='turnos'&&a.pv>0&&o,'Reação indisponível.');
      for(const v of o.custo){
        const bag=v.tipo==='recurso'?a.rec:a,key=v.tipo==='recurso'?v.id:v.tipo;
        exigir(bag[key]>=v.quantidade,'Saldo insuficiente para reagir.');bag[key]-=v.quantidade;
      }
      msg=a.nome+' • '+o.nome+' (gatilho e efeito conferidos pela mesa)';break;
    }
    case 'encerrar':
      for(const p of s.atores)delete p.bencao;
      delete s.reacaoPendente;delete s.movimentoPendente;
      s.fase='preparo';s.ordem=[];s.rodada=0;msg='Combate encerrado.';break;
    case 'descanso':
      exigir(s.fase==='preparo' && ['curto','longo'].includes(c.periodo),'Escolha um descanso fora do combate.');
      for(const p of s.atores.filter(x=>x.ficha.tipo==='pj')){
        for(const r of p.ficha.recursos) if(r.recuperacao?.some(v=>v.evento==='descanso_'+c.periodo && v.modo==='completar'))p.rec[r.id]=r.maximo;
        p.efeitosAtivos=[];delete p.bencao;
        if(c.periodo==='longo')p.pv=p.ficha.pvMaximos;
      } msg='Descanso '+c.periodo+' dos jogadores.';break;
    default: {
      exigir(!s.reacaoPendente,'Resolva a reação pendente antes de continuar.');
      exigir(s.fase==='turnos' && atual(s)?.id===a.id,'Aguarde o turno desse personagem.');
      if(c.tipo==='passar') {
        s.vez=(s.vez+1)%s.ordem.length;if(!s.vez)s.rodada++;ativar(atual(s));const iniciado=atual(s);if(iniciado.bencao&&--iniciado.bencao.turnos<=0)delete iniciado.bencao;msg=a.nome+' encerrou o turno.';break;
      }
      exigir(a.pv>0,'Personagem a 0 PV.');
      if(c.tipo==='mover'){
        exigir(Number.isFinite(c.x)&&Number.isFinite(c.y),'Destino inválido.');
        const d=distancia(a,c);exigir(d<=a.metros+1e-8,'Deslocamento insuficiente.');
        const ameacas=a.desengajado?[]:oportunidades(s,a,c);
        if(ameacas.length){
          s.movimentoPendente={ator:a.id,origem:{x:a.x,y:a.y},destino:{x:c.x,y:c.y},ameacas};
          const reator=abrirProximaReacao(s);msg=a.nome+' iniciou um deslocamento de '+d.toFixed(2)+' m e provocou '+reator.nome+'.';
        }else{a.x=c.x;a.y=c.y;a.metros=Math.max(0,a.metros-d);msg=a.nome+' moveu '+d.toFixed(2)+' m.';}
        break;
      }
      exigir(c.tipo==='usar','Comando desconhecido.');
      const o=a.ficha.opcoes.find(x=>x.id===c.opcao);exigir(o,'Opção desconhecida.');
      const rule=o.automacao;
      exigir(rule || (gm && c.assistido),'Opção assistida. O mestre precisa confirmar a resolução.');
      for(const custo of o.custo??[]){
        const bag=custo.tipo==='recurso'?a.rec:a;const key=custo.tipo==='recurso'?custo.id:custo.tipo;
        exigir(bag[key]>=custo.quantidade,'Saldo insuficiente para '+o.nome);bag[key]-=custo.quantidade;
      }
      msg=a.nome+' • '+o.nome;
      if(o.concentracao)delete a.bencao;
      if(!rule){msg+=' (resolução pelo mestre)';break;}
      if(rule.tipo==='efeito_conjuracao'){
        a.efeitosAtivos=(a.efeitosAtivos??[]).filter(e=>e.id!==o.id);
        a.efeitosAtivos.push({id:o.id,nome:o.nome,turnos:rule.turnos,origem:rule.origem,bonusCD:rule.bonusCD,vantagemAtaque:rule.vantagemAtaque===true});
        break;
      }
      const efeitos=(a.efeitosAtivos??[]).filter(e=>e.origem===o.origem);
      if(rule.tipo==='disparada'){a.metros+=a.ficha.deslocamentosM.andar;break;}
      if(rule.tipo==='desengajar'){a.desengajado=true;break;}
      const selecao=multi(o);let escolhidos;
      if(selecao){
        exigir(Array.isArray(c.alvos)&&c.alvos.length>=selecao.min&&c.alvos.length<=selecao.max,'Quantidade de alvos inválida.');
        exigir(selecao.repetirAlvo||new Set(c.alvos).size===c.alvos.length,'Escolha criaturas diferentes.');
        escolhidos=c.alvos.map(id=>s.atores.find(x=>x.id===id));
        exigir(escolhidos.every(p=>p&&distancia(a,p)<=rule.alcanceM+1e-8),'Alvo ausente ou fora do alcance.');
        if(rule.tipo==='bencao'){
          a.bencao={alvos:[...c.alvos],turnos:10};msg+=' • '+escolhidos.map(p=>p.nome).join(', ');break;
        }
      }
      const alvo=escolhidos?.[0]??s.atores.find(x=>x.id===c.alvo);
      const centro=rule.raioM?c.ponto:alvo;
      exigir(centro && Number.isFinite(centro.x)&&Number.isFinite(centro.y)&&distancia(a,centro)<=rule.alcanceM+1e-8,'Alvo ou centro fora do alcance.');
      const afetados=escolhidos??(rule.raioM?s.atores.filter(x=>distancia(x,centro)<=rule.raioM+1e-8):[alvo]);
      const ajuste=c.ajuste??0;exigir(inteiro(ajuste,-20,20),'Ajuste inválido.');
      const vantagem=c.modo==='vantagem'||(rule.tipo==='ataque'&&efeitos.some(e=>e.vantagemAtaque));
      const desvantagem=c.modo==='desvantagem';
      const d20=async()=>{
        const n=await rolar('1d20');if(vantagem===desvantagem)return n;
        const b=await rolar('1d20');return vantagem?Math.max(n,b):Math.min(n,b);
      };
      const danoComum=rule.tipo==='salva'?await rolar(rule.dano):null;
      for(const p of afetados){
      let formula=rule.dano;
      if(rule.tipo==='ataque'){
        const face=await d20();const total=face+rule.bonus+ajuste+await ajusteDados()+await dadoBencao(a);
        msg+=' • d20 '+face+(a.ficha.tipo==='pj'?' (total '+total+')':'');
        if(face===1 || (face!==20 && total<p.ficha.caBase)){msg+=' • errou '+p.nome;continue;}
        if(face===20){formula=formula.replace(/^\d+/,n=>String(+n+1));msg+=' • crítico';}
      }
      const dano=danoComum??await rolar(formula);
        let valor=dano;
        if(rule.tipo==='salva'){
          const bonus=p.ficha.salvaguardas?.[rule.atributo]??mod(p.ficha.atributos[rule.atributo]);
          const cd=rule.cd+Math.max(0,...efeitos.map(e=>e.bonusCD));
          if((await d20())+bonus+ajuste+await dadoBencao(p)>=cd) valor=rule.metade?Math.floor(valor/2):0;
        }
        if(p.ficha.imunidades?.includes(rule.elemento))valor=0;
        if(p.ficha.resistencias?.includes(rule.elemento)) valor=Math.floor(valor/2);
        if(p.ficha.vulnerabilidades?.includes(rule.elemento))valor*=2;
        p.pv=Math.max(0,p.pv-valor);
        if(p.bencao&&valor>0&&(p.pv===0||(await rolar('1d20'))+(p.ficha.salvaguardas?.con??mod(p.ficha.atributos.con))+await dadoBencao(p)<Math.max(10,Math.floor(valor/2))))delete p.bencao;
        msg+=' • '+p.nome+' sofreu '+valor;
      }
    }
  }
  registrar(s,(gm && a?.ficha.tipo==='pj' && c.confirmado?'Mestre por '+a.nome+' — ':'')+msg);s.rev++;return s;
}
export function publico(s){
  const v=structuredClone(s);
  for(const a of v.atores)if(a.ficha.tipo==='npc'){
    delete a.bencao;
    a.ficha={tipo:'npc',nome:a.nome,opcoes:[]};delete a.pv;delete a.rec;
  }
  return v;
}
export function dadoLocal(f) {
  const [,n,l,b]=/^(\d+)d(\d+)([+-]\d+)?$/.exec(f);
  let t=Number(b||0);for(let i=0;i<Number(n);i++)t+=1+Math.floor(Math.random()*Number(l));return t;
}

