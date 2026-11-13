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
  const textoPropriedades=x=>[x.descricao??x.description??'',...(Array.isArray(x.propriedades??x.properties)?(x.propriedades??x.properties):[x.propriedades??x.properties??''])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const arremessaveis=[];
  for(const e of f.equipamentos??[]){
    const texto=textoPropriedades(e);
    const faixa=/arremesso\s+(\d+(?:[,.]\d+)?)\s*\/\s*(\d+(?:[,.]\d+)?)\s*m/.exec(texto);
    if(faixa){
      const nome=(e.nome??e.name??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\d+\s*/,'').replace(/s\b/g,'');
      arremessaveis.push({nome,normal:Number(faixa[1].replace(',','.')),longo:Number(faixa[2].replace(',','.'))});
    }
  }
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
  // Cada uso corpo a corpo de uma arma arremessável recebe uma ação à distância separada.
  for(const o of [...(f.opcoes??[])]){
    if(o.varianteArremessoDe||o.nome?.toLowerCase().includes('duas mãos'))continue;
    const texto=textoPropriedades(o);
    const propria=/arremesso\s+(\d+(?:[,.]\d+)?)\s*\/\s*(\d+(?:[,.]\d+)?)\s*m/.exec(texto);
    const familia=arremessaveis.find(x=>x.nome&&texto.concat(' ',o.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()).includes(x.nome));
    const faixa=propria?{normal:Number(propria[1].replace(',','.')),longo:Number(propria[2].replace(',','.'))}:familia;
    if(!faixa||f.opcoes.some(x=>x.varianteArremessoDe===o.id))continue;
    let automacao=o.automacao?.tipo==='ataque'?structuredClone(o.automacao):null;
    if(!automacao){
      const ataque=/normal\s*\[1d20([+-]\d+)?\]/i.exec(o.descricao??''),dano=/dano\s*\[([^\]]+)\]/i.exec(o.descricao??'');
      if(!ataque||!dano)continue;
      automacao={tipo:'ataque',bonus:Number(ataque[1]||0),dano:dano[1],elemento:/perfurante/i.test(o.descricao??'')?'perfurante':undefined};
    }
    const v=structuredClone(o);v.id=o.id+'-arremesso';v.varianteArremessoDe=o.id;
    v.nome=o.nome.replace(/\s*\|/,' · arremesso |').replace(/\s*—\s*AÇÃO/i,' · arremesso — AÇÃO');
    if(v.nome===o.nome)v.nome+=' · arremesso';
    v.descricao='Arremesso '+faixa.normal+'/'+faixa.longo+' m. Além de '+faixa.normal+' m, o ataque tem desvantagem.\n'+o.descricao;
    v.automacao={...automacao,alcanceM:faixa.longo,alcanceNormalM:faixa.normal,arremesso:true};
    f.opcoes.push(v);
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
  const a={id:crypto.randomUUID(),nome,ficha,token:null,dono:null,emCombate:true,pv:f.pvMaximos,rec:Object.fromEntries(f.recursos.map(r=>[r.id,r.saldoInicial])),x:s.atores.length,y:0,init:null,acao:1,bonus:1,reacao:1,metros:f.deslocamentosM.andar};
  s.atores.push(a); return a;
}
export const atual = s=>s.atores.find(a=>a.id===s.ordem[s.vez]);
export const ativos = s=>s.atores.filter(a=>a.emCombate!==false);
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
    if(reator.emCombate===false||movente.emCombate===false||reator===movente||lado(reator)===lado(movente)||reator.pv<=0||reator.reacao<=0||!opcoes.length)return [];
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
function iniciarTurnos(s){
  const participantes=ativos(s);if(!participantes.length||participantes.some(x=>x.init===null))return false;
  s.ordem=[...participantes].sort((x,y)=>y.init-x.init||y.ficha.atributos.des-x.ficha.atributos.des).map(x=>x.id);
  s.vez=0;s.rodada=1;s.fase='turnos';participantes.forEach(ativar);return true;
}
export async function aplicar(s,c,u,rolar) {
  // The caller commits this copy only after every validation and die succeeds.
  s=structuredClone(s);
  for(const p of s.atores)atualizarMagias(p.ficha);
  const abencoado=p=>s.atores.some(x=>x.pv>0&&x.bencao?.alvos.includes(p.id));
  const soma=(n)=>n>0?'+'+n:n<0?String(n):'';
  const formulaD20=(bonus=0,p=null)=>{
    const xs=c.dadosAjuste??[];exigir(dadosExtrasValidos(xs),'Dados extras inválidos.');
    const modo=c.modo==='vantagem'?'2d20kh1':c.modo==='desvantagem'?'2d20kl1':'1d20';
    return modo+soma(bonus+(c.ajuste??0))+(abencoado(p)?'+1d4':'')+xs.map(x=>'+'+x).join('');
  };
  const resultado=async(formula,meta={})=>{
    const r=await rolar(formula,meta);return typeof r==='number'?{total:r,natural:/d20/.test(formula)?r:null,formula,resumo:String(r)}:r;
  };
  const resultadoLote=async(formulas,meta={})=>{
    const r=await rolar(formulas,meta),lista=Array.isArray(r)?r:r?.resultados;
    exigir(Array.isArray(lista)&&lista.length===formulas.length,'A rolagem conjunta não retornou todos os resultados.');
    return lista.map((x,i)=>typeof x==='number'?{total:x,natural:null,formula:formulas[i],resumo:String(x)}:x);
  };
  const rolarD20=(bonus,p,meta)=>resultado(formulaD20(bonus,p),meta);
  exigir(c.rev===s.rev,'O encontro mudou. Confira o turno e tente novamente.');
  const a=s.atores.find(x=>x.id===c.ator);
  const gm=u.role==='GM';
  if(['exemplo','adicionar','vincular','iniciar','encerrar','descanso','remover','alternarCombate','definirRecurso'].includes(c.tipo)) exigir(gm,'Somente o mestre.');
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
    case 'alternarCombate': {
      exigir(a,'Ficha não encontrada.');
      const entrando=a.emCombate===false;
      if(entrando){
        a.emCombate=true;
        if(s.fase==='turnos'){
          const atualId=atual(s)?.id;a.init=(await resultado('1d20'+soma(mod(a.ficha.atributos.des)),{tipo:'iniciativa',titulo:'Iniciativa · '+a.nome})).total;s.ordem.push(a.id);
          s.ordem.sort((x,y)=>{const p=s.atores.find(a=>a.id===x),q=s.atores.find(a=>a.id===y);return q.init-p.init||q.ficha.atributos.des-p.ficha.atributos.des;});
          s.vez=Math.max(0,s.ordem.indexOf(atualId));ativar(a);
        }else a.init=null;
        msg=a.nome+' entrou no combate.';
      }else{
        exigir(!s.reacaoPendente&&ativos(s).length>1,'Resolva a reação pendente e mantenha ao menos um participante.');
        const atualId=atual(s)?.id,eraAtual=atualId===a.id,indice=s.vez;a.emCombate=false;a.init=null;s.ordem=s.ordem.filter(id=>id!==a.id);
        if(s.fase==='turnos'&&s.ordem.length){
          s.vez=eraAtual?Math.min(indice,s.ordem.length-1):Math.max(0,s.ordem.indexOf(atualId));
          if(eraAtual)ativar(atual(s));
        }else if(s.fase==='iniciativa')iniciarTurnos(s);
        msg=a.nome+' saiu do combate.';
      }
      break;
    }
    case 'definirRecurso': {
      exigir(a&&inteiro(c.atual,0,9999)&&inteiro(c.maximo,1,9999)&&c.atual<=c.maximo,'Valores de recurso inválidos.');
      if(c.campo==='pv'){a.ficha.pvMaximos=c.maximo;a.pv=c.atual;if(!a.pv)delete a.bencao;}
      else{const r=a.ficha.recursos.find(r=>r.id===c.campo);exigir(r,'Recurso desconhecido.');r.maximo=c.maximo;a.rec[r.id]=c.atual;}
      msg='Recurso atualizado em '+a.nome+'.';break;
    }
    case 'vincular':
      exigir(a && (!c.token || !s.atores.some(x=>x!==a && x.token===c.token)),'Esse token já está vinculado.');
      exigir(!c.dono || a.ficha.tipo==='pj','NPC é controlado pelo mestre.');
      a.token=c.token||null;a.dono=c.dono||null;msg='Vínculo atualizado para '+a.nome+'.';break;
    case 'iniciar':
      exigir(s.fase==='preparo' && ativos(s).length>=2 && ativos(s).every(x=>x.pv>0),'Inclua pelo menos dois participantes conscientes no combate.');
      s.fase='iniciativa';s.atores.forEach(x=>x.init=null);msg='Rolem iniciativa.';break;
    case 'iniciativa':
      exigir(s.fase==='iniciativa' && a.emCombate!==false && a.init===null,'Iniciativa já resolvida ou ficha fora do combate.');
      a.init=(await resultado('1d20'+soma(mod(a.ficha.atributos.des)),{tipo:'iniciativa',titulo:'Iniciativa · '+a.nome})).total;msg=a.nome+' • iniciativa '+a.init;
      iniciarTurnos(s);
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
      const r=await rolarD20(bonus,c.grupo==='salvaguardas'?a:null,{tipo:c.grupo==='salvaguardas'?'salvaguarda':'teste',titulo:(c.grupo==='pericias'?'Perícia · ':'Salvaguarda · ')+c.chave});
      msg=a.nome+' • '+c.chave+': '+r.total;break;
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
      const rr=await rolarD20(rule.bonus,a,{tipo:'ataque',titulo:o.nome+' · '+ataque.nome,alvo:alvo.nome,cd:alvo.ficha.caBase});
      const face=rr.natural,total=rr.total;
      const acertou=face!==1&&(face===20||total>=alvo.ficha.caBase);
      msg=a.nome+' • '+o.nome+' com '+ataque.nome+' • '+total+(acertou?' acertou':' errou');
      if(acertou){
        let formula=rule.dano;if(face===20)formula=formula.replace(/^\d+/,n=>String(+n+1));
        let dano=(await resultado(formula,{tipo:'dano',titulo:'Dano · '+ataque.nome,critico:face===20,alvo:alvo.nome})).total;
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
      const desvantagem=c.modo==='desvantagem'||(rule.tipo==='ataque'&&rule.alcanceNormalM!=null&&afetados.some(p=>distancia(a,p)>rule.alcanceNormalM+1e-8));
      const modoOriginal=c.modo;c.modo=vantagem===desvantagem?'normal':vantagem?'vantagem':'desvantagem';
      const aplicarDano=async(p,dano)=>{
        let valor=dano;
        if(p.ficha.imunidades?.includes(rule.elemento))valor=0;
        if(p.ficha.resistencias?.includes(rule.elemento))valor=Math.floor(valor/2);
        if(p.ficha.vulnerabilidades?.includes(rule.elemento))valor*=2;
        p.pv=Math.max(0,p.pv-valor);
        if(p.bencao&&valor>0){const cdCon=Math.max(10,Math.floor(valor/2));if(p.pv===0||(await rolarD20(p.ficha.salvaguardas?.con??mod(p.ficha.atributos.con),p,{tipo:'salvaguarda',titulo:'Concentração · '+p.nome,cd:cdCon})).total<cdCon)delete p.bencao;}
        return valor;
      };
      if(rule.tipo==='projeteis'){
        const formulas=afetados.map(()=>rule.dano),instancias=afetados.map((p,i)=>({titulo:'Seta '+(i+1),alvo:p.nome})),nome=o.nome.replace(/^\d+º\s*\|\s*/,'').replace(/\s*·\s*(?:acerto automático|classe).*$/i,'');
        const danos=await resultadoLote(formulas,{tipo:'dano-lote',titulo:'Danos · '+nome,instancias});
        for(let i=0;i<afetados.length;i++)msg+=' • '+afetados[i].nome+' sofreu '+await aplicarDano(afetados[i],danos[i].total);
        c.modo=modoOriginal;break;
      }
      if(rule.tipo==='ataque'&&selecao?.repetirAlvo&&afetados.length>1){
        const acertos=[],nome=o.nome.replace(/^\d+º\s*\|\s*/,'').replace(/\s*·\s*classe.*$/i,'');
        for(let i=0;i<afetados.length;i++){
          const p=afetados[i],rr=await rolarD20(rule.bonus,a,{tipo:'ataque',titulo:'Ataque '+(i+1)+' · '+o.nome,alvo:p.nome,cd:p.ficha.caBase}),face=rr.natural,total=rr.total;
          msg+=' • d20 '+face+(a.ficha.tipo==='pj'?' (total '+total+')':'');
          if(face===1||(face!==20&&total<p.ficha.caBase)){msg+=' • errou '+p.nome;continue;}
          const formula=face===20?rule.dano.replace(/^\d+/,n=>String(+n+1)):rule.dano;
          if(face===20)msg+=' • crítico';acertos.push({p,formula,indice:i});
        }
        if(acertos.length){
          const danos=await resultadoLote(acertos.map(x=>x.formula),{tipo:'dano-lote',titulo:'Danos · '+nome,instancias:acertos.map(x=>({titulo:'Seta '+(x.indice+1),alvo:x.p.nome,critico:x.formula!==rule.dano}))});
          for(let i=0;i<acertos.length;i++)msg+=' • '+acertos[i].p.nome+' sofreu '+await aplicarDano(acertos[i].p,danos[i].total);
        }
        c.modo=modoOriginal;break;
      }
      const danoComum=rule.tipo==='salva'?(await resultado(rule.dano,{tipo:'dano',titulo:'Dano · '+o.nome})).total:null;
      for(const p of afetados){
      let formula=rule.dano;
      if(rule.tipo==='ataque'){
        const rr=await rolarD20(rule.bonus,a,{tipo:'ataque',titulo:'Ataque · '+o.nome,alvo:p.nome,cd:p.ficha.caBase});const face=rr.natural,total=rr.total;
        msg+=' • d20 '+face+(a.ficha.tipo==='pj'?' (total '+total+')':'');
        if(face===1 || (face!==20 && total<p.ficha.caBase)){msg+=' • errou '+p.nome;continue;}
        if(face===20){formula=formula.replace(/^\d+/,n=>String(+n+1));msg+=' • crítico';}
      }
      const dano=danoComum??(await resultado(formula,{tipo:'dano',titulo:'Dano · '+o.nome,critico:formula!==rule.dano,alvo:p.nome})).total;
        let valor=dano;
        if(rule.tipo==='salva'){
          const bonus=p.ficha.salvaguardas?.[rule.atributo]??mod(p.ficha.atributos[rule.atributo]);
          const cd=rule.cd+Math.max(0,...efeitos.map(e=>e.bonusCD));
          const rr=await rolarD20(bonus,p,{tipo:'salvaguarda',titulo:'Salvaguarda de '+rule.atributo.toUpperCase()+' · '+p.nome,cd});
          if(rr.total>=cd) valor=rule.metade?Math.floor(valor/2):0;
        }
        valor=await aplicarDano(p,valor);
        msg+=' • '+p.nome+' sofreu '+valor;
      }
      c.modo=modoOriginal;
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
export function avaliarFormula(formula,sortear=l=>1+Math.floor(Math.random()*l)){
  const partes=String(formula).replace(/\s+/g,'').match(/[+-]?[^+-]+/g)??[];let total=0,natural=null;const grupos=[];
  for(const parte of partes){const sinal=parte[0]==='-'?-1:1,corpo=parte.replace(/^[+-]/,'');const m=/^(\d*)d(\d+)(?:(kh|kl)(\d+))?$/.exec(corpo);
    if(!m){exigir(/^\d+$/.test(corpo),'Fórmula local inválida.');total+=sinal*Number(corpo);continue;}
    const quantidade=Number(m[1]||1),lados=Number(m[2]),valores=Array.from({length:quantidade},()=>sortear(lados));let mantidos=[...valores];
    if(m[3])mantidos=[...valores].sort((a,b)=>m[3]==='kh'?b-a:a-b).slice(0,Number(m[4]));
    const subtotal=mantidos.reduce((n,x)=>n+x,0);total+=sinal*subtotal;grupos.push({diceType:'d'+lados,dice:valores.map(v=>({value:v,kept:mantidos.includes(v)})),total:subtotal,isNegative:sinal<0});
    if(lados===20&&natural===null)natural=mantidos[0];
  }
  return {total,natural,formula,resumo:formula+' = '+total,grupos};
}
export function dadoLocal(f) {
  if(Array.isArray(f))return {resultados:f.map(x=>avaliarFormula(x))};
  return avaliarFormula(f).total;
}

