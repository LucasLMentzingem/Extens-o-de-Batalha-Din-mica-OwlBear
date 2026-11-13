export const atributos = ['for','des','con','int','sab','car'];
export const LIMITE_ALCANCE_M = 18;
export const slotsEquipamento = Object.freeze(['cabeca','capa','vestes','botas','mao_forte','mao_fraca','arma_distancia','colar','acessorio_1','acessorio_2']);
export const periciasPadrao = {
  'Acrobacia':'des','Adestrar Animais':'sab','Arcanismo':'int','Atletismo':'for',
  'Atuação':'car','Enganação':'car','Furtividade':'des','História':'int',
  'Intimidação':'car','Intuição':'sab','Investigação':'int','Medicina':'sab',
  'Natureza':'int','Percepção':'sab','Persuasão':'car','Prestidigitação':'des',
  'Religião':'int','Sobrevivência':'sab'
};
export const condicoesCombate = Object.freeze({
  agarrado:{nome:'Agarrado',restricoes:{imovel:true}},
  amedrontado:{nome:'Amedrontado',restricoes:{desvantagemAtaques:true}},
  atordoado:{nome:'Atordoado',restricoes:{semAcoes:true,semBonus:true,semReacao:true,imovel:true,vantagemAtaquesContra:true,falhaSalvas:['for','des']}},
  caido:{nome:'Caído',restricoes:{caido:true}},
  cego:{nome:'Cego',restricoes:{desvantagemAtaques:true,vantagemAtaquesContra:true}},
  enfeiticado:{nome:'Enfeitiçado',restricoes:{naoAtacarOrigem:true}},
  envenenado:{nome:'Envenenado',restricoes:{desvantagemAtaques:true}},
  incapacitado:{nome:'Incapacitado',restricoes:{semAcoes:true,semBonus:true,semReacao:true}},
  inconsciente:{nome:'Inconsciente',restricoes:{semAcoes:true,semBonus:true,semReacao:true,imovel:true,caido:true,vantagemAtaquesContra:true,criticoCorpoACorpo:true,falhaSalvas:['for','des']}},
  imobilizado:{nome:'Imobilizado',restricoes:{imovel:true,desvantagemAtaques:true,vantagemAtaquesContra:true,desvantagemSalvas:['des']}},
  invisivel:{nome:'Invisível',restricoes:{vantagemAtaques:true,desvantagemAtaquesContra:true}},
  paralisado:{nome:'Paralisado',restricoes:{semAcoes:true,semBonus:true,semReacao:true,imovel:true,vantagemAtaquesContra:true,criticoCorpoACorpo:true,falhaSalvas:['for','des']}},
  surdo:{nome:'Surdo',restricoes:{}}
});
const expiraValido=new Set(['inicio_alvo','fim_alvo','inicio_origem','fim_origem']);
const formulaDanoValida=f=>typeof f==='string'&&(/^(?:[1-9]|[1-9][0-9])d(?:4|6|8|10|12)(?:[+-]\d{1,2})?$/.test(f)||/^\d{1,3}$/.test(f));
export function exigir(ok, msg) { if (!ok) throw new Error(msg); }
const inteiro = (n,min,max) => Number.isInteger(n) && n >= min && n <= max;
const idOK = id => typeof id === 'string' && /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(id) && !Object.hasOwn(Object.prototype,id);
const nomeOK = nome => typeof nome === 'string' && nome.trim().length > 0;
const slug=s=>String(s??'item').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'item';
function lista(xs, label) {
  exigir(Array.isArray(xs) && xs.every(x => x && idOK(x.id)) && new Set(xs.map(x=>x.id)).size===xs.length, label+' contém IDs inválidos ou repetidos.');
}
export function atualizarMagias(f){
  const textoPropriedades=x=>[x.descricao??x.description??'',...(Array.isArray(x.propriedades??x.properties)?(x.propriedades??x.properties):[x.propriedades??x.properties??''])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const arremessaveis=[];
  for(const o of [...(f.opcoes??[])]){
    const nome=String(o.nome??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(!nome.includes('agarrar ou empurrar'))continue;
    const derrubarId=o.id+'-derrubar',empurrarId=o.id+'-empurrar',custo=structuredClone(o.custo??[{tipo:'acao',quantidade:1}]);
    o.nome='Agarrar | ação';o.descricao='Tente agarrar uma criatura a até 1,5 m usando uma mão livre. A resolução completa da condição Agarrado permanece assistida pelo mestre.';delete o.automacao;
    if(!f.opcoes.some(x=>x.id===derrubarId))f.opcoes.push({id:derrubarId,nome:'Derrubar | ação',categoria:o.categoria??'acao',descricao:'Tente derrubar uma criatura a até 1,5 m. A resolução completa da condição Caído permanece assistida pelo mestre.',custo:structuredClone(custo)});
    if(!f.opcoes.some(x=>x.id===empurrarId))f.opcoes.push({id:empurrarId,nome:'Empurrar | ação',categoria:o.categoria??'acao',descricao:'Escolha uma criatura a até 1,5 m. Ela usa a melhor salvaguarda entre FOR e DES contra CD 10. Em uma falha, é empurrada 1,5 m diretamente para longe de você.',custo:structuredClone(custo),automacao:{tipo:'salva',atributos:['for','des'],cd:10,alcanceM:1.5,deslocamentoForcado:{distanciaM:1.5,direcao:'afastar'}}});
  }
  for(const e of f.equipamentos??[]){
    const texto=textoPropriedades(e);
    const faixa=/arremesso\s+(\d+(?:[,.]\d+)?)\s*\/\s*(\d+(?:[,.]\d+)?)\s*m/.exec(texto);
    if(faixa){
      const nome=(e.nome??e.name??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\d+\s*/,'').replace(/s\b/g,'');
      arremessaveis.push({nome,normal:Number(faixa[1].replace(',','.')),longo:Number(faixa[2].replace(',','.'))});
    }
  }
  for(const o of f.opcoes??[]){
    const nomeCompleto=String(o.nome??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),nome=nomeCompleto.split('|').pop().split('·')[0].trim();
    if(typeof o.nome==='string'&&o.custo?.some(c=>c.tipo==='reacao')&&o.nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes('ataque de oportunidade'))o.gatilho='sair_alcance';
    const descricao=String(o.descricao??''),hit=/Normal\s*\[1d20([+-]\d+)?\]/i.exec(descricao),dano=/Dano(?:\s+\w+)?\s*(?:\[([^\]]+)\]|(?:contundente\s+)?(\d+))/i.exec(descricao);
    if(!o.automacao&&nomeCompleto.startsWith('golpe desarmado')&&hit&&dano)o.automacao={tipo:'ataque',bonus:Number(hit[1]||0),dano:dano[1]??dano[2],elemento:'contundente',alcanceM:1.5,tags:['desarmado']};
    if(!o.automacao&&nomeCompleto.startsWith('esquivar'))o.automacao={tipo:'economia',esquivar:true};
    if(!o.automacao&&nomeCompleto.startsWith('agarrar'))o.automacao={tipo:'salva',atributos:['for','des'],cd:10,alcanceM:1.5,efeitoFalha:{nome:'Agarrado',condicao:'agarrado',turnos:10}};
    if(!o.automacao&&nomeCompleto.startsWith('derrubar'))o.automacao={tipo:'salva',atributos:['for','des'],cd:10,alcanceM:1.5,efeitoFalha:{nome:'Caído',condicao:'caido',turnos:1,expira:'fim_origem'}};
    if(!o.automacao&&nomeCompleto.startsWith('segunda adaga')&&hit&&dano){o.requisitosUso={aposAtaque:true,tagsAtaqueAnterior:['arma'],umaVezPorTurno:o.id};o.automacao={tipo:'ataque',bonus:Number(hit[1]||0),dano:dano[1]??dano[2],elemento:'perfurante',alcanceM:1.5,tags:['arma']};}
    if(nomeCompleto.includes('mao de dolo')){o.gatilho='apos_acerto';o.umaVezPorTurno=true;o.aprimoramento={dano:'1d6+1',elemento:'necrotico',requisitos:{tagsAtaque:['desarmado']}};delete o.automacao;}
    if(nomeCompleto.includes('mao de cura'))o.automacao={tipo:'cura',formula:'1d6+1',alcanceM:1.5};
    if(o.categoria!=='magia'||typeof o.nome!=='string')continue;
    if(nome==='armadura arcana'){
      o.foraCombate=true;o.automacao={tipo:'efeito',alcanceM:1.5,efeito:{nome:'Armadura Arcana',tipo:'buff',descricao:'A CA do alvo passa a ser no mínimo 13 + DES enquanto ele estiver sem armadura.',removeEm:'descanso_longo',caMinima:13,requisitos:{semArmadura:true},modificadores:{}}};
      if(f.id==='nikki'&&f.caBase===15)f.caBase=13;if(f.id==='nikki'&&f.armaduraEquipada===undefined)f.armaduraEquipada=false;
    }
    if(o.automacao)continue;
    const circulo=o.circuloBase??1;
    if(nome==='misseis magicos'){
      o.automacao={tipo:'projeteis',alcanceM:LIMITE_ALCANCE_M,dano:'1d4+1',elemento:'energetico'};
      o.selecao={tipo:'alvos',min:2+circulo,max:2+circulo,repetirAlvo:true};
    }
    if(nome==='bencao'){
      o.concentracao=true;
      o.automacao={tipo:'bencao',alcanceM:9};
      o.selecao={tipo:'alvos',min:1,max:2+circulo,repetirAlvo:false};
    }
    if(nome==='talho mental')o.automacao={tipo:'salva',atributo:'int',cd:13,dano:'1d6',alcanceM:18,elemento:'psiquico',efeitoFalha:{nome:'Mente Talhada',turnos:2,penalidadeProximaSalva:'1d4'}};
    if(nome==='sussurros dissonantes')o.automacao={tipo:'salva',atributo:'sab',cd:13,dano:'3d6',alcanceM:18,metade:true,elemento:'psiquico',efeitoFalha:{nome:'Fuga Dissonante',turnos:1,consomeReacao:true}};
    if(nome==='bracos de hadar')o.automacao={tipo:'salva',atributo:'for',cd:13,dano:'2d6',alcanceM:0,raioM:3,origemArea:'conjurador',excluirConjurador:true,metade:true,elemento:'necrotico',efeitoFalha:{nome:'Sem reações',turnos:1,consomeReacao:true}};
    if(nome==='acalmar emocoes')o.automacao={tipo:'salva',atributo:'car',cd:13,alcanceM:18,raioM:6,efeitoFalha:{nome:'Emoções acalmadas',turnos:10}};
    if(nome.includes('escudo da fe')){o.concentracao=true;o.automacao={tipo:'efeito',alcanceM:18,efeito:{nome:'Escudo da Fé',tipo:'buff',descricao:'+2 na Classe de Armadura.',modificadores:{ca:2},duracao:{turnos:100,expira:'inicio_origem'}}};}
    if(nome.includes('passos largos'))o.automacao={tipo:'efeito',alcanceM:1.5,efeito:{nome:'Passos Largos',tipo:'buff',descricao:'+3 m de deslocamento.',modificadores:{deslocamentoM:3},removeEm:'descanso_longo'}};
    if(nome.includes('acudir os moribundos'))o.automacao={tipo:'estabilizar',alcanceM:4.5};
    if(nome.includes('orientacao')){o.concentracao=true;o.automacao={tipo:'conceder_dado',alcanceM:1.5,modificador:{nome:'Orientação',formula:'1d4',tipos:['teste'],removeAoUsar:true}};}
    if(nome.includes('repreensao diabolica')){o.gatilho='sofrer_dano';o.automacao={tipo:'salva',atributo:'des',cd:13,dano:'2d10',metade:true,elemento:'fogo',alcanceM:18};}
    if(nome.includes('toque chocante'))o.automacao={tipo:'ataque',bonus:5,dano:'1d8',elemento:'raio',alcanceM:1.5};
    if(nome.includes('explosao elemental'))o.automacao={tipo:'ataque',bonus:5,dano:'1d8',elemento:'elemental',alcanceM:18};
    if(nome.includes('protecao contra laminas')){o.concentracao=true;o.automacao={tipo:'efeito',alcanceM:0,efeito:{nome:'Proteção contra Lâminas',tipo:'buff',descricao:'Ataques contra o alvo subtraem 1d4 da jogada de ataque.',restricoes:{penalidadeAtaquesContra:'1d4'},duracao:{turnos:10,expira:'inicio_origem'}}};}
    if(nome.includes('invisibilidade')){o.concentracao=true;o.automacao={tipo:'efeito',alcanceM:1.5,efeito:{nome:'Invisível',tipo:'condicao',condicao:'invisivel',descricao:'Invisível até atacar, causar dano ou conjurar.',duracao:{turnos:100,expira:'inicio_origem'}}};}
    if(nome.includes('amizade')){o.concentracao=true;o.automacao={tipo:'salva',atributo:'sab',cd:13,alcanceM:3,efeitoFalha:{nome:'Enfeitiçado',condicao:'enfeiticado',turnos:10}};}
    if(nome.includes('sugestao')){o.concentracao=true;o.automacao={tipo:'salva',atributo:'sab',cd:13,alcanceM:9,efeitoFalha:{nome:'Sob Sugestão',condicao:'enfeiticado',turnos:100}};}
    if(nome.includes('enfeiticar pessoa'))o.automacao={tipo:'salva',atributo:'sab',cd:13,alcanceM:9,efeitoFalha:{nome:'Enfeitiçado',condicao:'enfeiticado',turnos:100}};
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
function slotLegado(nome){
  const t=String(nome).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(/arco|besta/.test(t))return 'arma_distancia';
  if(/adaga|espada|cimitarra|lanca|machado|martelo|clava|cajado|rapieira|tridente/.test(t))return 'mao_forte';
  if(/armadura|couro|malha|placa|robe|veste/.test(t))return 'vestes';
  if(/escudo/.test(t))return 'mao_fraca';if(/bota/.test(t))return 'botas';if(/capa/.test(t))return 'capa';if(/colar|amuleto/.test(t))return 'colar';if(/elmo|capacete|chapeu|coroa/.test(t))return 'cabeca';if(/anel|luva/.test(t))return 'acessorio_1';return null;
}
export function inventarioNormalizado(f){
  if(f.inventario?.itens)return f.inventario;
  const usados=new Set(),ocupados=new Set(),itens=(f.equipamentos??[]).map((e,i)=>{
    const nome=e.nome??e.name??('Item '+(i+1)),moeda=/moedas?.*?(\d+)\s*po/i.exec(nome),quantidade=/^(\d+)\s+/.exec(nome);
    let id=idOK(e.id)?e.id:slug(nome);while(usados.has(id))id=slug(id+'-'+(i+1));usados.add(id);
    const slot=slotLegado(nome),tipo=moeda?'moeda':slot?'equipamento':'etc';
    const equipado=Boolean(e.inUse&&slot&&!ocupados.has(slot));if(equipado)ocupados.add(slot);
    return {id,nome,descricao:e.descricao??e.description??'',tipo,quantidade:moeda?Number(moeda[1]):Number(quantidade?.[1]??1),empilhavel:Boolean(moeda||quantidade),pesoKg:Number(e.pesoKg??0),slotEquipamento:slot,equipado,equipadoSlot:equipado?slot:undefined,modificadores:structuredClone(e.modificadores??{}),acoes:Array.isArray(e.acoes)?[...e.acoes]:undefined};
  });
  // Fichas antigas do Forge nem sempre marcavam a arma em uso. Para que a
  // migração não deixe o personagem desarmado, o primeiro equipamento de
  // cada slot vazio entra equipado. Os demais permanecem no inventário.
  for(const item of itens){
    if(item.tipo!=='equipamento'||item.equipado)continue;
    let slot=item.slotEquipamento;
    if(ocupados.has(slot)&&slot==='mao_forte'&&!ocupados.has('mao_fraca')&&/adaga|cimitarra|espada curta|clava leve|machadinha/i.test(item.nome)){slot='mao_fraca';item.slotEquipamento='mao_fraca';}
    if(ocupados.has(slot))continue;item.equipado=true;item.equipadoSlot=slot;ocupados.add(slot);
  }
  return {capacidadeCargaKg:Math.max(1,Number(f.atributos?.for??10)*7.5),itens};
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
  f.passivas=(f.passivas??[]).map((p,i)=>typeof p==='string'?{id:'passiva-'+(i+1),nome:p,descricao:p,ativa:true}:{...p,id:idOK(p.id)?p.id:'passiva-'+(i+1),nome:p.nome??('Passiva '+(i+1)),ativa:p.ativa!==false});
  if(!f.preparacao){
    const conhecidas=f.opcoes.filter(o=>o.categoria==='magia'&&(o.circuloBase??0)>0&&!o.varianteDe).map(o=>o.id);
    f.preparacao={vagas:0,preparadas:[],semprePreparadas:conhecidas};
  }
  lista(f.recursos,'Recursos'); lista(f.opcoes,'Opções');
  for(const r of f.recursos) exigir(nomeOK(r.nome)&&inteiro(r.maximo,0,9999)&&inteiro(r.saldoInicial,0,r.maximo),'Saldo inválido em '+r.id);
  for(const o of f.opcoes) {
    exigir(nomeOK(o.nome),'Opção sem nome.');
    for(const c of o.custo??[]) exigir(['acao','bonus','reacao','recurso'].includes(c.tipo) && inteiro(c.quantidade,1,999) && (c.tipo!=='recurso'||f.recursos.some(r=>r.id===c.id)), 'Custo inválido em '+o.id);
    if(o.gatilho==='apos_acerto'){
      const p=o.aprimoramento;
      exigir(p&&formulaDanoValida(p.dano),'Aprimoramento após acerto inválido em '+o.id);
      if(p.salva)exigir(atributos.includes(p.salva.atributo)&&inteiro(p.salva.cd,1,40),'Salvaguarda do aprimoramento inválida em '+o.id);
    }
    if(o.gatilho==='apos_rolagem_dano')exigir(o.rerrolagem?.tipo==='dano'&&['todos','dados_com_resultado'].includes(o.rerrolagem.modo),'Rerrolagem de dano inválida em '+o.id);
    if(o.gatilho==='apos_rolagem_d20')exigir(o.rerrolagem?.tipo==='d20'&&o.rerrolagem.modo==='todos','Rerrolagem de d20 inválida em '+o.id);
    if(o.gatilho==='sofrer_dano')exigir(o.custo?.some(c=>c.tipo==='reacao')&&o.automacao&&['ataque','salva'].includes(o.automacao.tipo),'Reação ao sofrer dano inválida em '+o.id);
    if(o.gatilho==='ser_atingido')exigir(o.custo?.some(c=>c.tipo==='reacao')&&o.automacao?.tipo==='reduzir_dano','Reação preventiva inválida em '+o.id);
    if(o.requisitosUso){
      const r=o.requisitosUso;
      exigir(['aposAtaque','aposAcerto','alvoDiferenteDoAnterior'].every(k=>r[k]===undefined||typeof r[k]==='boolean'),'Requisito de uso inválido em '+o.id);
      exigir(r.tagsAtaqueAnterior===undefined||Array.isArray(r.tagsAtaqueAnterior)&&r.tagsAtaqueAnterior.every(nomeOK),'Tags de requisito inválidas em '+o.id);
      exigir(r.distanciaDoAlvoAnteriorM===undefined||Number.isFinite(r.distanciaDoAlvoAnteriorM)&&r.distanciaDoAlvoAnteriorM>=0,'Distância de requisito inválida em '+o.id);
      exigir(r.umaVezPorTurno===undefined||idOK(r.umaVezPorTurno),'Limite por turno inválido em '+o.id);
    }
    const a=o.automacao;
    if(!a) continue;
    exigir(['ataque','salva','cura','pv_temporario','estabilizar','disparada','desengajar','economia','efeito','efeito_conjuracao','projeteis','bencao','reduzir_dano','conceder_dado'].includes(a.tipo), 'Automação desconhecida em '+o.id);
    if(a.tipo==='economia'){
      exigir(['acao','bonus','reacao'].every(k=>a.adicionar?.[k]===undefined||inteiro(a.adicionar[k],0,5)),'Economia adicional inválida em '+o.id);
      exigir(['disparada','desengajar','esquivar'].every(k=>a[k]===undefined||typeof a[k]==='boolean'),'Estado de economia inválido em '+o.id);
      exigir(a.pvTemporarios===undefined||inteiro(a.pvTemporarios,1,9999),'PV temporário de economia inválido em '+o.id);
      exigir(a.cura===undefined||formulaDanoValida(a.cura),'Cura de economia inválida em '+o.id);
      exigir(a.recuperarRecursos===undefined||Array.isArray(a.recuperarRecursos)&&a.recuperarRecursos.every(id=>f.recursos.some(r=>r.id===id)),'Recuperação de recurso inválida em '+o.id);
    }
    if(a.tipo==='reduzir_dano')exigir(formulaDanoValida(a.formula),'Redução de dano inválida em '+o.id);
    if(a.tipo==='conceder_dado')exigir(Number.isFinite(a.alcanceM)&&a.alcanceM>=0&&formulaDanoValida(a.modificador?.formula)&&Array.isArray(a.modificador.tipos)&&a.modificador.tipos.length&&a.modificador.tipos.every(x=>['ataque','salvaguarda','teste'].includes(x)),'Dado concedido inválido em '+o.id);
    if(multi(o)||['projeteis','bencao'].includes(a.tipo)){
      const r=o.selecao;
      exigir(r?.tipo==='alvos'&&inteiro(r.max,1,64)&&inteiro(r.min,1,r.max)&&typeof r.repetirAlvo==='boolean'&&Number.isFinite(a.alcanceM)&&a.alcanceM>=0,'Seleção de alvos inválida em '+o.id);
      if(a.tipo==='projeteis')exigir(/^\d{1,2}d(?:4|6|8|10|12)(?:[+-]\d{1,2})?$/.test(a.dano),'Dano por projétil inválido.');
    }
    if(a.tipo==='efeito_conjuracao')exigir(inteiro(a.turnos,1,100)&&idOK(a.origem)&&inteiro(a.bonusCD,0,10),'Duração, origem ou bônus de CD inválido.');
    if(['cura','pv_temporario'].includes(a.tipo)){
      const formulaValida=typeof a.formula==='string'&&/^\d{1,2}d(?:4|6|8|10|12)(?:[+-]\d{1,2})?$/.test(a.formula);
      exigir(Number.isFinite(a.alcanceM)&&a.alcanceM>=0&&(formulaValida||inteiro(a.valor,1,9999)),'Cura/PV temporário inválido em '+o.id);
      exigir(a.multiplicador===undefined||Number.isFinite(a.multiplicador)&&a.multiplicador>0&&a.multiplicador<=20,'Multiplicador inválido em '+o.id);
    }
    if(a.tipo==='estabilizar')exigir(Number.isFinite(a.alcanceM)&&a.alcanceM>=0,'Alcance de estabilização inválido em '+o.id);
    if(a.tipo==='efeito'){
      const e=a.efeito,m=e?.modificadores??{};
      exigir(Number.isFinite(a.alcanceM)&&a.alcanceM>=0&&e&&nomeOK(e.nome)&&['buff','debuff','condicao'].includes(e.tipo),'Efeito ou alcance inválido em '+o.id);
      exigir(['ca','pvMaximos','deslocamentoM'].every(k=>m[k]===undefined||Number.isFinite(m[k])),'Modificador de efeito inválido em '+o.id);
      exigir(e.removeEm===undefined||['descanso_curto','descanso_longo'].includes(e.removeEm),'Recuperação do efeito inválida em '+o.id);
      exigir(e.condicao===undefined||Object.hasOwn(condicoesCombate,e.condicao),'Condição desconhecida em '+o.id);
      if(e.danoAoSerAtingido!==undefined)exigir(formulaDanoValida(e.danoAoSerAtingido.formula)&&(e.danoAoSerAtingido.tagsAtaque===undefined||Array.isArray(e.danoAoSerAtingido.tagsAtaque)&&e.danoAoSerAtingido.tagsAtaque.every(nomeOK)),'Dano persistente inválido em '+o.id);
      if(e.duracao!==undefined)exigir(inteiro(e.duracao.turnos,1,100)&&expiraValido.has(e.duracao.expira),'Duração de efeito inválida em '+o.id);
    }
    if(['ataque','salva'].includes(a.tipo)) {
      const danoValido=formulaDanoValida(a.dano);
      exigir(Number.isFinite(a.alcanceM)&&a.alcanceM>=0 && (a.tipo==='salva'?!a.dano||danoValido:danoValido),'Dano ou alcance inválido em '+o.id);
      const atributosSalva=a.atributos??[a.atributo];
      exigir(a.tipo==='ataque'?inteiro(a.bonus,-20,40):Array.isArray(atributosSalva)&&atributosSalva.length>=1&&atributosSalva.every(k=>atributos.includes(k))&&inteiro(a.cd,1,40),'Ataque/CD inválido em '+o.id);
      if(a.raioM!==undefined) exigir(a.tipo==='salva'&&Number.isFinite(a.raioM)&&a.raioM>0,'Área inválida.');
      if(a.area!==undefined){const z=a.area;exigir(a.tipo==='salva'&&['circulo','quadrado','cone','linha'].includes(z.forma),'Forma de área inválida em '+o.id);if(z.forma==='circulo')exigir(Number.isFinite(z.raioM)&&z.raioM>0,'Raio inválido em '+o.id);if(z.forma==='quadrado')exigir(Number.isFinite(z.tamanhoM)&&z.tamanhoM>0,'Quadrado inválido em '+o.id);if(['cone','linha'].includes(z.forma))exigir(Number.isFinite(z.comprimentoM)&&z.comprimentoM>0&&(z.larguraM===undefined||Number.isFinite(z.larguraM)&&z.larguraM>0),'Área direcional inválida em '+o.id);}
      if(a.efeitoFalha!==undefined){
        exigir(nomeOK(a.efeitoFalha.nome)&&inteiro(a.efeitoFalha.turnos,1,100),'Efeito de falha inválido em '+o.id);
        exigir(a.efeitoFalha.condicao===undefined||Object.hasOwn(condicoesCombate,a.efeitoFalha.condicao),'Condição de falha desconhecida em '+o.id);
        if(a.efeitoFalha.expira!==undefined)exigir(expiraValido.has(a.efeitoFalha.expira),'Expiração de falha inválida em '+o.id);
      }
      if(a.deslocamentoForcado!==undefined)exigir(Number.isFinite(a.deslocamentoForcado.distanciaM)&&a.deslocamentoForcado.distanciaM>0&&a.deslocamentoForcado.direcao==='afastar','Deslocamento forçado inválido em '+o.id);
      if(a.tipo==='ataque'&&a.ataques!==undefined)exigir(Array.isArray(a.ataques)&&a.ataques.length>=2&&o.selecao?.min===a.ataques.length&&o.selecao?.max===a.ataques.length&&a.ataques.every(x=>inteiro(x.bonus,-20,40)&&formulaDanoValida(x.dano)&&Number.isFinite(x.alcanceM??a.alcanceM)),'Sequência de ataques inválida em '+o.id);
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
  out.inventario=structuredClone(inventarioNormalizado(out));
  exigir(Number.isFinite(out.inventario.capacidadeCargaKg)&&out.inventario.capacidadeCargaKg>0,'Capacidade de carga inválida.');
  lista(out.inventario.itens,'Inventário');
  for(const item of out.inventario.itens){
    exigir(nomeOK(item.nome)&&['equipamento','consumivel','etc','moeda'].includes(item.tipo),'Item inválido em '+item.id);
    exigir(inteiro(item.quantidade,1,999999)&&Number.isFinite(item.pesoKg)&&item.pesoKg>=0,'Quantidade ou peso inválido em '+item.id);
    if(item.tipo==='equipamento')exigir(slotsEquipamento.includes(item.slotEquipamento)||item.slotEquipamento==='acessorio','Slot de equipamento inválido em '+item.id);
    if(item.equipado)exigir(slotsEquipamento.includes(item.equipadoSlot),'Slot equipado inválido em '+item.id);
    if(item.acoes!==undefined)exigir(Array.isArray(item.acoes)&&item.acoes.every(id=>out.opcoes.some(o=>o.id===id)),'Ação de item inválida em '+item.id);
  }
  exigir(new Set(out.inventario.itens.filter(i=>i.equipado).map(i=>i.equipadoSlot)).size===out.inventario.itens.filter(i=>i.equipado).length,'Dois equipamentos ocupam o mesmo slot.');
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
  // Vincula ataques de arma aos equipamentos correspondentes. O campo pode
  // ser informado explicitamente no JSON; a inferência existe para migrar as
  // sete fichas atuais sem exigir edição manual.
  const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\d+\s+/,'').replace(/s\b/g,'');
  const armas=out.inventario.itens.filter(i=>['mao_forte','mao_fraca','arma_distancia'].includes(i.slotEquipamento));
  for(const o of out.opcoes){
    if(o.requerItemEquipado||o.categoria==='magia'||o.automacao?.tipo!=='ataque')continue;
    const nome=normal(o.nome),item=armas.find(i=>{const n=normal(i.nome);return n.length>2&&(nome.includes(n)||n.includes(nome.split(/[|\u00b7—]/)[0].trim()));});
    if(item){o.requerItemEquipado=item.id;item.acoes=[...new Set([...(item.acoes??[]),o.id])];}
  }
  // Regra da campanha: nenhuma seleção de ataque, magia, item ou habilidade
  // começa além de 18 m. O raio da área permanece inalterado.
  for(const o of out.opcoes){
    const alcancesOriginais=[o.automacao?.alcanceM,o.selecao?.alcanceM].filter(Number.isFinite);
    const maiorOriginal=Math.max(0,...alcancesOriginais);
    if(Number.isFinite(o.automacao?.alcanceM))o.automacao.alcanceM=Math.min(LIMITE_ALCANCE_M,o.automacao.alcanceM);
    if(Number.isFinite(o.automacao?.alcanceNormalM))o.automacao.alcanceNormalM=Math.min(LIMITE_ALCANCE_M,o.automacao.alcanceNormalM,o.automacao.alcanceM??LIMITE_ALCANCE_M);
    if(Number.isFinite(o.selecao?.alcanceM))o.selecao.alcanceM=Math.min(LIMITE_ALCANCE_M,o.selecao.alcanceM);
    if(maiorOriginal>LIMITE_ALCANCE_M&&typeof o.descricao==='string'){
      const numero=String(maiorOriginal).replace('.', '[,.]');
      o.descricao=o.descricao.replace(new RegExp('\\b'+numero+'\\s*m\\b','gi'),LIMITE_ALCANCE_M+' m');
    }
  }
  return out;
}
export const novo = () => ({rev:0,fase:'preparo',rodada:0,vez:0,atores:[],ordem:[],historico:[],filaReacoes:[]});
export function adicionar(s,f,nome=f.nome) {
  const ficha=validar(f);
  const a={id:crypto.randomUUID(),nome,ficha,token:null,dono:null,emCombate:true,pv:f.pvMaximos,pvTemporarios:0,estadoVida:'consciente',salvaguardasMorte:{sucessos:0,falhas:0},rec:Object.fromEntries(f.recursos.map(r=>[r.id,r.saldoInicial])),usosTurno:{},eventosTurno:{ataques:[],acertos:[]},x:s.atores.length,y:0,init:null,acao:1,bonus:1,reacao:1,metros:f.deslocamentosM.andar};
  s.atores.push(a); return a;
}
export const atual = s=>s.atores.find(a=>a.id===s.ordem[s.vez]);
export const ativos = s=>s.atores.filter(a=>a.emCombate!==false);
export const mod = n=>Math.floor((n-10)/2);
export const bonusEfeito=(a,campo)=>(a?.efeitosAtivos??[]).reduce((n,e)=>n+(Number(e.modificadores?.[campo])||0),0);
export const itensEquipados=a=>(a?.ficha?.inventario?.itens??[]).filter(i=>i.equipado);
export function opcaoPreparada(f,o){
  if(o?.categoria!=='magia'||(o.circuloBase??0)===0)return true;
  const p=f.preparacao;if(!p)return true;const id=o.varianteDe??o.id;
  return p.preparadas.includes(id)||p.semprePreparadas.includes(id);
}
export function opcaoDisponivel(a,o){
  if(!o||o.ativa===false||!opcaoPreparada(a.ficha,o))return false;
  if(o.requerItemEquipado&&!itensEquipados(a).some(i=>i.id===o.requerItemEquipado))return false;
  if(o.origemItem&&!itensEquipados(a).some(i=>i.id===o.origemItem))return false;
  return true;
}
export const opcoesDisponiveis=a=>(a?.ficha?.opcoes??[]).filter(o=>opcaoDisponivel(a,o));
export const bonusEquipamento=(a,campo)=>itensEquipados(a).reduce((n,i)=>n+(Number(i.modificadores?.[campo])||0),0);
export const bonusPassiva=(a,campo)=>(a?.ficha?.passivas??[]).filter(p=>p.ativa!==false).reduce((n,p)=>n+(Number(p.modificadores?.[campo])||0),0);
export const caAtual=a=>{
  let base=a?.ficha?.caBase??0,bonus=0;
  for(const i of itensEquipados(a)){const ca=i.classeArmadura;if(ca?.tipo==='base')base=Math.max(base,Number(ca.valor)||0);if(ca?.tipo==='bonus')bonus+=Number(ca.valor)||0;}
  return base+bonus+bonusEquipamento(a,'ca')+bonusPassiva(a,'ca')+bonusEfeito(a,'ca');
};
export const pvMaximosAtuais=a=>(a?.ficha?.pvMaximos??0)+bonusEquipamento(a,'pvMaximos')+bonusPassiva(a,'pvMaximos')+bonusEfeito(a,'pvMaximos');
export const deslocamentoMaximo=a=>Math.max(0,(a?.ficha?.deslocamentosM?.andar??0)+bonusEquipamento(a,'deslocamentoM')+bonusPassiva(a,'deslocamentoM')+bonusEfeito(a,'deslocamentoM'));
export const pesoInventario=a=>(a?.ficha?.inventario?.itens??[]).reduce((n,i)=>n+(Number(i.pesoKg)||0)*Math.max(1,Number(i.quantidade)||1),0);
export const bonusPericia=(f,nome)=>Number.isInteger(f.pericias?.[nome])?f.pericias[nome]:mod(f.atributos[periciasPadrao[nome]]);
export function curarAtor(a,valor){
  const antes=a.pv,quantidade=Math.max(0,Math.floor(Number(valor)||0));
  if(!quantidade||a.estadoVida==='morto')return 0;
  a.pv=Math.min(pvMaximosAtuais(a),a.pv+quantidade);
  if(a.pv>0){a.estadoVida='consciente';a.salvaguardasMorte={sucessos:0,falhas:0};}
  return a.pv-antes;
}
export function concederPVTemporarios(a,valor){
  const quantidade=Math.max(0,Math.floor(Number(valor)||0)),antes=a.pvTemporarios??0;
  a.pvTemporarios=Math.max(antes,quantidade);return a.pvTemporarios-antes;
}
function receberDanoBruto(a,valor,{critico=false}={}){
  const dano=Math.max(0,Math.floor(Number(valor)||0)),temporarios=Math.min(a.pvTemporarios??0,dano),restante=dano-temporarios,pvAntes=a.pv;
  a.pvTemporarios=Math.max(0,(a.pvTemporarios??0)-temporarios);a.pv=Math.max(0,a.pv-restante);
  const reducaoPV=pvAntes-a.pv;
  if(a.pv===0&&dano>0){
    if(a.estadoVida==='inconsciente'||a.estadoVida==='estavel'){
      a.estadoVida='inconsciente';a.salvaguardasMorte=a.salvaguardasMorte??{sucessos:0,falhas:0};a.salvaguardasMorte.falhas=Math.min(3,a.salvaguardasMorte.falhas+(critico?2:1));if(a.salvaguardasMorte.falhas>=3)a.estadoVida='morto';
    }else{
      const excesso=Math.max(0,restante-pvAntes);a.estadoVida=excesso>=pvMaximosAtuais(a)?'morto':'inconsciente';a.salvaguardasMorte={sucessos:0,falhas:0};
    }
  }
  return {dano,temporarios,reducaoPV};
}
const unirRestricoes=(base,extra)=>{
  const out={...base};
  for(const [chave,valor] of Object.entries(extra??{})){
    if(Array.isArray(valor))out[chave]=[...new Set([...(out[chave]??[]),...valor])];
    else if(typeof valor==='boolean')out[chave]=Boolean(out[chave]||valor);
    else out[chave]=valor;
  }
  return out;
};
export function restricoesAtivas(a){
  const estado=['inconsciente','estavel'].includes(a?.estadoVida)?condicoesCombate.inconsciente.restricoes:{};
  return (a?.efeitosAtivos??[]).reduce((out,e)=>unirRestricoes(out,unirRestricoes(e.condicao?condicoesCombate[e.condicao]?.restricoes:null,e.restricoes)),estado);
}
export const temCondicao=(a,id)=>(a?.efeitosAtivos??[]).some(e=>e.condicao===id);
const tagsAtaque=(o,rule)=>{
  const tags=new Set(rule.tags??[]),texto=(o.nome+' '+(o.descricao??'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(o.categoria!=='magia')tags.add('arma');if(/soco|desarmad/.test(texto)){tags.delete('arma');tags.add('desarmado');}
  tags.add(rule.alcanceM<=1.5?'corpo_a_corpo':'distancia');return [...tags];
};
const custoDisponivel=(a,c)=>(c.tipo==='recurso'?a.rec?.[c.id]:a?.[c.tipo])>=c.quantidade;
function opcoesDepoisDoAcerto(a,o,alvo){
  const tags=tagsAtaque(o,o.automacao),usos=a.usosTurno??{};
  const manuais=opcoesDisponiveis(a).filter(g=>g.gatilho==='apos_acerto'&&g.aprimoramento&&(g.custo??[]).every(c=>custoDisponivel(a,c))&&(!g.umaVezPorTurno||!usos[g.id])).filter(g=>{
    const r=g.aprimoramento.requisitos??{};return (!r.tagsAtaque?.length||r.tagsAtaque.every(t=>tags.includes(t)))&&(!r.alvoFerido||alvo.pv<pvMaximosAtuais(alvo));
  });
  const persistentes=(alvo.efeitosAtivos??[]).filter(e=>e.danoAoSerAtingido?.origemAtorId===a.id).filter(e=>!e.danoAoSerAtingido.tagsAtaque?.length||e.danoAoSerAtingido.tagsAtaque.every(t=>tags.includes(t))).map(e=>({id:e.id,nome:e.nome,descricao:e.descricao,custo:[],automatico:true,aprimoramento:{dano:e.danoAoSerAtingido.formula,elemento:e.danoAoSerAtingido.elemento,critico:e.danoAoSerAtingido.critico!==false}}));
  return [...manuais,...persistentes];
}
function opcoesRerrolagemDano(a){return opcoesDisponiveis(a).filter(o=>o.gatilho==='apos_rolagem_dano'&&o.rerrolagem?.tipo==='dano'&&(o.custo??[]).every(c=>custoDisponivel(a,c)));}
function opcoesRerrolagemD20(a){return opcoesDisponiveis(a).filter(o=>o.gatilho==='apos_rolagem_d20'&&o.rerrolagem?.tipo==='d20'&&(o.custo??[]).every(c=>custoDisponivel(a,c)));}
const formulaCritica=f=>f.replace(/^(\d+)d/,(_,n)=>(Number(n)+1)+'d');
function validarRequisitosUso(s,a,o,alvo){
  const r=o.requisitosUso;if(!r)return;
  const ataques=a.eventosTurno?.ataques??[],acertos=a.eventosTurno?.acertos??[],anterior=[...(r.aposAcerto?acertos:ataques)].at(-1);
  if(r.aposAtaque)exigir(ataques.length>0,'Use esta habilidade somente depois de realizar um ataque neste turno.');
  if(r.aposAcerto)exigir(acertos.length>0,'Use esta habilidade somente depois de acertar um ataque neste turno.');
  if(r.tagsAtaqueAnterior?.length)exigir(anterior&&r.tagsAtaqueAnterior.every(t=>anterior.tags?.includes(t)),'O ataque anterior não cumpre os requisitos desta habilidade.');
  if(r.umaVezPorTurno)exigir(!a.usosTurno?.[r.umaVezPorTurno],'Esta habilidade já foi usada neste turno.');
  if(r.alvoDiferenteDoAnterior)exigir(anterior&&alvo&&anterior.alvo!==alvo.id,'Escolha uma criatura diferente do alvo anterior.');
  if(r.distanciaDoAlvoAnteriorM!==undefined){const antigo=s.atores.find(x=>x.id===anterior?.alvo);exigir(antigo&&alvo&&distancia(antigo,alvo)<=r.distanciaDoAlvoAnteriorM+1e-8,'O novo alvo está longe demais do alvo anterior.');}
  if(r.umaVezPorTurno)a.usosTurno[r.umaVezPorTurno]=true;
}
const usaArmadura=a=>typeof a.ficha.armaduraEquipada==='boolean'?a.ficha.armaduraEquipada:(a.ficha.equipamentos??[]).some(e=>e.inUse&&/(armadura|couro|malha|placas|escudo)/i.test((e.nome??e.name??'')+' '+(e.descricao??e.description??'')));
const distancia=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function dentroDaArea(origem,ponto,alvo,regra){
  const area=regra?.area??(regra?.raioM?{forma:'circulo',raioM:regra.raioM}:null);if(!area)return false;
  if(area.forma==='circulo')return distancia(ponto,alvo)<=area.raioM+1e-8;
  if(area.forma==='quadrado'){const metade=area.tamanhoM/2;return Math.abs(alvo.x-ponto.x)<=metade+1e-8&&Math.abs(alvo.y-ponto.y)<=metade+1e-8;}
  const dx=ponto.x-origem.x,dy=ponto.y-origem.y,norma=Math.hypot(dx,dy);if(norma<=1e-8)return false;
  const ux=dx/norma,uy=dy/norma,ax=alvo.x-origem.x,ay=alvo.y-origem.y,frente=ax*ux+ay*uy,lado=Math.abs(ax*-uy+ay*ux),comprimento=area.comprimentoM;
  if(frente<0||frente>comprimento+1e-8)return false;
  if(area.forma==='linha')return lado<=(area.larguraM??1.5)/2+1e-8;
  if(area.forma==='cone'){const larguraFinal=area.larguraM??comprimento;return lado<=larguraFinal/2*(frente/comprimento)+1e-8;}
  return false;
}
export function destinoDeslocamento(origem,alvo,distanciaM){
  const dx=alvo.x-origem.x,dy=alvo.y-origem.y,tamanho=Math.hypot(dx,dy);
  if(!Number.isFinite(distanciaM)||distanciaM<=0||tamanho<=1e-8)return null;
  return {x:alvo.x+dx/tamanho*distanciaM,y:alvo.y+dy/tamanho*distanciaM};
}
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
    const opcoes=opcoesDisponiveis(reator).filter(o=>o.gatilho==='sair_alcance'&&o.custo?.some(c=>c.tipo==='reacao'));
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
function custosDisponiveis(a,o){return (o.custo??[]).every(c=>(c.tipo==='recurso'?a.rec?.[c.id]:a[c.tipo])>=c.quantidade);}
function abrirProximaReacaoEvento(s){
  if(s.reacaoPendente)return s.atores.find(a=>a.id===s.reacaoPendente.reator)??null;
  while(s.filaReacoes?.length){
    const evento=s.filaReacoes.shift(),reator=s.atores.find(a=>a.id===evento.reator),alvo=s.atores.find(a=>a.id===evento.alvo);
    const opcoes=(reator?.ficha.opcoes??[]).filter(o=>evento.opcoes.includes(o.id)&&o.gatilho===evento.gatilho&&custosDisponiveis(reator,o));
    if(!reator||!alvo||reator.pv<=0||reator.reacao<=0||!opcoes.length)continue;
    s.reacaoPendente={id:crypto.randomUUID(),gatilho:evento.gatilho,reator:reator.id,alvo:alvo.id,opcoes:opcoes.map(o=>o.id),
      descricao:evento.descricao,contexto:evento.contexto,terminaEm:Date.now()+20000};
    return reator;
  }
  delete s.reacaoPendente;return null;
}
function enfileirarReacaoAoSofrerDano(s,reator,origem,valor,elemento){
  if(s.fase!=='turnos'||!reator||!origem||reator===origem||valor<=0||reator.pv<=0||reator.reacao<=0)return;
  const opcoes=opcoesDisponiveis(reator).filter(o=>o.gatilho==='sofrer_dano'&&o.custo?.some(c=>c.tipo==='reacao')&&custosDisponiveis(reator,o));
  if(!opcoes.length)return;
  s.filaReacoes??=[];s.filaReacoes.push({gatilho:'sofrer_dano',reator:reator.id,alvo:origem.id,opcoes:opcoes.map(o=>o.id),
    descricao:reator.nome+' sofreu '+valor+(elemento?' de dano '+elemento:' de dano')+' de '+origem.nome+'.',contexto:{dano:valor,elemento}});
  abrirProximaReacaoEvento(s);
}
function abrirReacaoPreventiva(s,reator,origem,resolucao){
  if(s.fase!=='turnos'||s.reacaoPendente||!reator||!origem||reator===origem||reator.pv<=0||reator.reacao<=0)return false;
  const opcoes=opcoesDisponiveis(reator).filter(o=>o.gatilho==='ser_atingido'&&o.custo?.some(c=>c.tipo==='reacao')&&custosDisponiveis(reator,o));
  if(!opcoes.length)return false;
  s.resolucaoPendente={...resolucao,tipo:'dano_ataque',origem:origem.id,alvo:reator.id};
  s.reacaoPendente={id:crypto.randomUUID(),gatilho:'ser_atingido',reator:reator.id,alvo:origem.id,opcoes:opcoes.map(o=>o.id),
    descricao:reator.nome+' foi atingido por '+origem.nome+'. O dano aguarda esta reação.',terminaEm:Date.now()+20000};
  return true;
}
const dadosExtrasValidos=xs=>Array.isArray(xs)&&xs.length<=4&&xs.every(x=>/^\d{1,2}d(?:4|6|8|10|12|20)$/.test(x));
export function registrar(s,t) { s.historico.unshift(t); s.historico.length=Math.min(s.historico.length,45); }
export function encerrarConcentracao(s,a,motivo=''){
  const id=a?.concentracaoAtiva?.id;if(!id)return false;
  for(const alvo of s.atores)alvo.efeitosAtivos=(alvo.efeitosAtivos??[]).filter(e=>e.concentracaoId!==id);
  if(a.bencao?.concentracaoId===id||a.bencao)delete a.bencao;
  const nome=a.concentracaoAtiva.nome;delete a.concentracaoAtiva;
  if(motivo)registrar(s,a.nome+' perdeu a concentração em '+nome+' • '+motivo);
  return true;
}
function iniciarConcentracao(s,a,o){
  encerrarConcentracao(s,a);
  const id=crypto.randomUUID();a.concentracaoAtiva={id,opcao:o.id,nome:o.nome,desdeRodada:s.rodada};return id;
}
function processarDuracoes(s,ator,evento){
  for(const alvo of s.atores){
    const mantidos=[];
    for(const efeito of alvo.efeitosAtivos??[]){
      const legado=efeito.duracao===undefined&&Number.isInteger(efeito.turnos);
      const duracao=efeito.duracao??(legado?{restante:efeito.turnos,expira:'inicio_alvo'}:null);
      if(!duracao){mantidos.push(efeito);continue;}
      const expira=duracao.expira??'inicio_alvo',momento=expira.startsWith('inicio')?'inicio_turno':'fim_turno';
      const referencia=expira.endsWith('origem')?efeito.origemAtorId:alvo.id;
      if(momento!==evento||referencia!==ator.id){mantidos.push(efeito);continue;}
      const restante=(duracao.restante??duracao.turnos??efeito.turnos)-1;
      if(restante>0){efeito.duracao={...duracao,restante};efeito.turnos=restante;mantidos.push(efeito);}
    }
    alvo.efeitosAtivos=mantidos;
  }
}
function restaurarEconomia(a){
  const r=restricoesAtivas(a);
  const consciente=a.pv>0&&a.estadoVida!=='morto';
  a.acao=!consciente||r.semAcoes?0:1;a.bonus=!consciente||r.semAcoes||r.semBonus?0:1;a.reacao=!consciente||r.semReacao?0:1;
  a.metros=!consciente||r.imovel?0:deslocamentoMaximo(a);a.desengajado=false;a.pv=Math.min(a.pv,pvMaximosAtuais(a));a.usosTurno={};a.eventosTurno={ataques:[],acertos:[]};
}
function iniciarTurno(s,a){
  processarDuracoes(s,a,'inicio_turno');restaurarEconomia(a);
  if(restricoesAtivas(a).semAcoes)encerrarConcentracao(s,a,'incapacitado');
}
function iniciarTurnos(s){
  const participantes=ativos(s);if(!participantes.length||participantes.some(x=>x.init===null))return false;
  s.ordem=[...participantes].sort((x,y)=>y.init-x.init||y.ficha.atributos.des-x.ficha.atributos.des).map(x=>x.id);
  s.vez=0;s.rodada=1;s.fase='turnos';participantes.forEach(restaurarEconomia);iniciarTurno(s,atual(s));return true;
}
export async function aplicar(s,c,u,rolar) {
  // The caller commits this copy only after every validation and die succeeds.
  s=structuredClone(s);
  s.filaReacoes??=[];
  for(const p of s.atores){
    atualizarMagias(p.ficha);p.ficha.inventario=p.ficha.inventario??structuredClone(inventarioNormalizado(p.ficha));p.usosTurno=p.usosTurno??{};p.eventosTurno=p.eventosTurno??{ataques:[],acertos:[]};p.pvTemporarios=Number.isInteger(p.pvTemporarios)?p.pvTemporarios:0;p.estadoVida=p.estadoVida??(p.pv>0?'consciente':'inconsciente');p.salvaguardasMorte=p.salvaguardasMorte??{sucessos:0,falhas:0};
  }
  const abencoado=p=>s.atores.some(x=>x.pv>0&&x.bencao?.alvos.includes(p.id));
  const soma=(n)=>n>0?'+'+n:n<0?String(n):'';
  const formulaD20=(bonus=0,p=null,penalidade=null,modoForcado=c.modo)=>{
    const xs=c.dadosAjuste??[];exigir(dadosExtrasValidos(xs),'Dados extras inválidos.');
    const modo=modoForcado==='vantagem'?'2d20kh1':modoForcado==='desvantagem'?'2d20kl1':'1d20';
    return modo+soma(bonus+(c.ajuste??0))+(abencoado(p)?'+1d4':'')+(penalidade?'-'+penalidade:'')+xs.map(x=>'+'+x).join('');
  };
  const resultado=async(formula,meta={})=>{
    const r=await rolar(formula,meta);return typeof r==='number'?{total:r,natural:/d20/.test(formula)?r:null,formula,resumo:String(r)}:r;
  };
  const resultadoLote=async(formulas,meta={})=>{
    const r=await rolar(formulas,meta),lista=Array.isArray(r)?r:r?.resultados;
    exigir(Array.isArray(lista)&&lista.length===formulas.length,'A rolagem conjunta não retornou todos os resultados.');
    return lista.map((x,i)=>typeof x==='number'?{total:x,natural:null,formula:formulas[i],resumo:String(x)}:x);
  };
  const rolarD20=async(bonus,p,meta)=>{
    const efeito=meta.tipo==='salvaguarda'?p?.efeitosAtivos?.find(e=>e.penalidadeProximaSalva):null;
    const restricoes=meta.tipo==='salvaguarda'?restricoesAtivas(p):{},atributo=meta.atributo;
    const vantagem=c.modo==='vantagem'||(atributo&&restricoes.vantagemSalvas?.includes(atributo)),desvantagem=c.modo==='desvantagem'||(atributo&&restricoes.desvantagemSalvas?.includes(atributo));
    const modo=vantagem===desvantagem?'normal':vantagem?'vantagem':'desvantagem';
    const modificadores=(p?.efeitosAtivos??[]).filter(e=>e.modificadorRolagem?.tipos?.includes(meta.tipo)),metaAdicionais=modificadores.map(e=>({id:e.id,nome:e.nome,formula:e.modificadorRolagem.formula,descricao:e.descricao??e.nome}));
    const rerrolagens=opcoesRerrolagemD20(p),metaRerrolagens=rerrolagens.map(g=>({id:g.id,nome:g.nome,modo:'todos',custo:g.custo??[],descricao:g.descricao??''}));
    const r=await resultado(formulaD20(bonus,p,efeito?.penalidadeProximaSalva??meta.penalidade,modo),{...meta,adicionais:metaAdicionais,rotuloAdicionais:'Dados disponíveis para esta rolagem',combinarAdicionais:true,rerrolagens:metaRerrolagens});
    const ativos=Array.isArray(r.recursosAtivos)?r.recursosAtivos:[];exigir(ativos.every(id=>modificadores.some(e=>e.id===id)),'Modificador de d20 inválido.');
    if(ativos.length)p.efeitosAtivos=p.efeitosAtivos.filter(e=>!ativos.includes(e.id)||e.modificadorRolagem?.removeAoUsar===false);
    const usados=Array.isArray(r.rerrolagensUsadas)?r.rerrolagensUsadas:[];exigir(usados.every(id=>rerrolagens.some(g=>g.id===id)),'Rerrolagem de d20 inválida.');
    for(const id of usados){const g=rerrolagens.find(x=>x.id===id);for(const custo of g.custo??[]){const bag=custo.tipo==='recurso'?p.rec:p,key=custo.tipo==='recurso'?custo.id:custo.tipo;exigir(bag[key]>=custo.quantidade,'Saldo insuficiente para '+g.nome);bag[key]-=custo.quantidade;}}
    if(efeito)p.efeitosAtivos=p.efeitosAtivos.filter(e=>e!==efeito);
    return r;
  };
  const ajustarDano=(p,dano,elemento)=>{let valor=Math.max(0,Math.floor(dano));if(p.ficha.imunidades?.includes(elemento))valor=0;if(p.ficha.resistencias?.includes(elemento))valor=Math.floor(valor/2);if(p.ficha.vulnerabilidades?.includes(elemento))valor*=2;return valor;};
  const aplicarDanoNoAtor=async(p,dano,elemento,{critico=false,ajustado=false,origem=null}={})=>{
    const valor=ajustado?Math.max(0,Math.floor(dano)):ajustarDano(p,dano,elemento);
    receberDanoBruto(p,valor,{critico});
    if(p.concentracaoAtiva&&valor>0){
      const cdCon=Math.max(10,Math.floor(valor/2)),bonus=p.ficha.salvaguardas?.con??mod(p.ficha.atributos.con);
      const falhaAutomatica=p.pv===0||restricoesAtivas(p).falhaSalvas?.includes('con');
      const total=falhaAutomatica?0:(await rolarD20(bonus,p,{tipo:'salvaguarda',atributo:'con',titulo:'Concentração · '+p.nome,cd:cdCon})).total;
      if(total<cdCon)encerrarConcentracao(s,p,p.pv===0?'reduzido a 0 PV':'falhou na salvaguarda CD '+cdCon);
    }
    enfileirarReacaoAoSofrerDano(s,p,origem,valor,elemento);
    return valor;
  };
  exigir(c.rev===s.rev,'O encontro mudou. Confira o turno e tente novamente.');
  const a=s.atores.find(x=>x.id===c.ator);
  const gm=u.role==='GM';
  if(['exemplo','grupoTeste','adicionar','vincular','iniciar','encerrar','descanso','remover','alternarCombate','definirRecurso'].includes(c.tipo)) exigir(gm,'Somente o mestre.');
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
    case 'grupoTeste': {
      exigir(gm && s.fase==='preparo' && s.atores.length===0,'Carregue o grupo em um encontro vazio.');
      exigir(Array.isArray(c.fichas)&&c.fichas.length===7,'O grupo de teste precisa das sete fichas.');
      for(const ficha of c.fichas){const p=adicionar(s,ficha,ficha.nome);if(c.ensaio){p.token='sim-'+p.id;p.dono='teste';}}
      msg='As sete fichas de jogadores entraram no encontro.';break;
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
          s.vez=Math.max(0,s.ordem.indexOf(atualId));restaurarEconomia(a);
        }else a.init=null;
        msg=a.nome+' entrou no combate.';
      }else{
        exigir(!s.reacaoPendente&&ativos(s).length>1,'Resolva a reação pendente e mantenha ao menos um participante.');
        const atualId=atual(s)?.id,eraAtual=atualId===a.id,indice=s.vez;a.emCombate=false;a.init=null;s.ordem=s.ordem.filter(id=>id!==a.id);
        if(s.fase==='turnos'&&s.ordem.length){
          s.vez=eraAtual?Math.min(indice,s.ordem.length-1):Math.max(0,s.ordem.indexOf(atualId));
          if(eraAtual)iniciarTurno(s,atual(s));
        }else if(s.fase==='iniciativa')iniciarTurnos(s);
        msg=a.nome+' saiu do combate.';
      }
      break;
    }
    case 'definirRecurso': {
      exigir(a&&inteiro(c.atual,0,9999)&&inteiro(c.maximo,1,9999),'Valores de recurso inválidos.');
      if(c.campo==='pv'){a.ficha.pvMaximos=c.maximo;exigir(c.atual<=pvMaximosAtuais(a),'PV atual acima do máximo com bônus.');a.pv=c.atual;if(a.pv>0){a.estadoVida='consciente';a.salvaguardasMorte={sucessos:0,falhas:0};}else{a.estadoVida='inconsciente';encerrarConcentracao(s,a,'reduzido a 0 PV');}}
      else{const r=a.ficha.recursos.find(r=>r.id===c.campo);exigir(r&&c.atual<=c.maximo,'Recurso desconhecido ou saldo acima do máximo.');r.maximo=c.maximo;a.rec[r.id]=c.atual;}
      msg='Recurso atualizado em '+a.nome+'.';break;
    }
    case 'atualizarFicha': {
      exigir(a&&c.ficha&&typeof c.ficha==='object','Ficha ausente.');
      // Identidade técnica e tipo pertencem ao ator carregado. Eles não podem ser
      // usados pelo editor para trocar propriedade ou elevar um PJ a NPC do mestre.
      const candidata=structuredClone(c.ficha);
      candidata.id=a.ficha.id;candidata.tipo=a.ficha.tipo;
      const ficha=validar(candidata);
      const maximoComBonus=pvMaximosAtuais({...a,ficha}),pv=c.pv===undefined?Math.min(a.pv,maximoComBonus):c.pv;
      exigir(inteiro(pv,0,maximoComBonus),'PV atual inválido.');
      const rec={};
      for(const r of ficha.recursos){
        const valor=c.rec?.[r.id]??a.rec?.[r.id]??r.saldoInicial;
        exigir(inteiro(valor,0,r.maximo),'Saldo inválido em '+r.nome+'.');rec[r.id]=valor;
      }
      a.ficha=ficha;a.nome=ficha.nome;a.pv=pv;a.rec=rec;
      a.metros=Math.min(a.metros,deslocamentoMaximo(a));
      if(a.pv>0){a.estadoVida='consciente';a.salvaguardasMorte={sucessos:0,falhas:0};}else{a.estadoVida='inconsciente';encerrarConcentracao(s,a,'reduzido a 0 PV');}
      msg='Ficha de '+a.nome+' salva.';break;
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
      if(c.campo==='pv'){if(c.valor>=0)curarAtor(a,c.valor);else receberDanoBruto(a,-c.valor);}
      else {const r=a.ficha.recursos.find(r=>r.id===c.campo);exigir(r,'Recurso desconhecido.');a.rec[r.id]=Math.min(r.maximo,Math.max(0,a.rec[r.id]+c.valor));}
      if(a.pv===0)encerrarConcentracao(s,a,'reduzido a 0 PV');
      msg='Ajuste do mestre em '+a.nome;break;
    }
    case 'salvaguardaMorte': {
      exigir(s.fase==='turnos'&&atual(s)?.id===a?.id&&a.pv===0&&a.estadoVida!=='morto'&&a.estadoVida!=='estavel','Salvaguarda contra a morte indisponível.');
      const r=await resultado(formulaD20(0,a),{tipo:'salvaguarda',atributo:'morte',titulo:'Salvaguarda contra a morte · '+a.nome});
      const face=r.natural??r.total;
      if(face===20){curarAtor(a,1);msg=a.nome+' tirou 20 natural e recuperou 1 PV.';}
      else if(face===1){a.salvaguardasMorte.falhas=Math.min(3,a.salvaguardasMorte.falhas+2);msg=a.nome+' sofreu duas falhas contra a morte.';}
      else if(r.total>=10){a.salvaguardasMorte.sucessos=Math.min(3,a.salvaguardasMorte.sucessos+1);msg=a.nome+' obteve um sucesso contra a morte.';}
      else{a.salvaguardasMorte.falhas=Math.min(3,a.salvaguardasMorte.falhas+1);msg=a.nome+' sofreu uma falha contra a morte.';}
      if(a.salvaguardasMorte.sucessos>=3){a.estadoVida='estavel';msg+=' Ficou estável.';}
      if(a.salvaguardasMorte.falhas>=3){a.estadoVida='morto';msg+=' Morreu.';}
      break;
    }
    case 'teste': {
      const bonus=c.grupo==='pericias'?bonusPericia(a.ficha,c.chave):(a.ficha.salvaguardas?.[c.chave]??mod(a.ficha.atributos[c.chave]));
      exigir(Number.isInteger(bonus)&&inteiro(c.ajuste??0,-20,20),'Teste inválido.');
      const falhaAutomatica=c.grupo==='salvaguardas'&&restricoesAtivas(a).falhaSalvas?.includes(c.chave);
      const r=falhaAutomatica?{total:0,natural:null}:await rolarD20(bonus,c.grupo==='salvaguardas'?a:null,{tipo:c.grupo==='salvaguardas'?'salvaguarda':'teste',atributo:c.chave,titulo:(c.grupo==='pericias'?'Perícia · ':'Salvaguarda · ')+c.chave});
      msg=a.nome+' • '+c.chave+': '+(falhaAutomatica?'falha automática':r.total);break;
    }
    case 'encerrarConcentracao':
      exigir(a?.concentracaoAtiva,'Este personagem não está se concentrando.');
      msg=a.nome+' encerrou a concentração em '+a.concentracaoAtiva.nome+'.';encerrarConcentracao(s,a);break;
    case 'livro': {
      exigir(a&&s.fase==='preparo','Prepare magias e altere passivas somente fora de combate.');
      exigir(['preparar','despreparar','ativar','desativar'].includes(c.operacao),'Operação do Livro de Habilidades inválida.');
      const o=a.ficha.opcoes.find(x=>x.id===c.habilidadeId),passiva=a.ficha.passivas?.find(x=>x.id===c.habilidadeId);
      exigir(o||passiva,'Habilidade não encontrada.');
      if(c.operacao==='preparar'||c.operacao==='despreparar'){
        exigir(o?.categoria==='magia'&&(o.circuloBase??0)>0&&!o.varianteDe,'Somente uma magia base pode ser preparada.');
        const p=a.ficha.preparacao,id=o.id;
        exigir(!p.semprePreparadas.includes(id),'Esta magia está sempre preparada.');
        if(c.operacao==='preparar'){
          exigir(!p.preparadas.includes(id),'Esta magia já está preparada.');
          exigir(p.preparadas.length<p.vagas,'Todos os espaços de preparação estão ocupados.');p.preparadas.push(id);
        }else{exigir(p.preparadas.includes(id),'Esta magia não está preparada.');p.preparadas=p.preparadas.filter(x=>x!==id);}
        msg=a.nome+' '+(c.operacao==='preparar'?'preparou ':'despreparou ')+o.nome+'.';
      }else{
        const habilidade=o??passiva;habilidade.ativa=c.operacao==='ativar';
        msg=a.nome+' '+(habilidade.ativa?'ativou ':'desativou ')+habilidade.nome+'.';
      }
      break;
    }
    case 'inventario': {
      exigir(a&&['equipar','desequipar','usar'].includes(c.operacao),'Operação de inventário inválida.');
      const item=a.ficha.inventario?.itens.find(i=>i.id===c.itemId);exigir(item,'Item não encontrado.');
      const emTurno=s.fase==='turnos';
      exigir(!emTurno||atual(s)?.id===a.id,'Equipamentos e itens só podem ser alterados no turno do personagem.');
      if(emTurno){exigir(a.acao>=1,'É preciso ter uma ação disponível.');a.acao--;}
      if(c.operacao==='equipar'){
        exigir(item.tipo==='equipamento'&&!item.equipado,'Este item não pode ser equipado agora.');
        let slot=c.slot??item.slotEquipamento;
        if(slot==='acessorio')slot=!a.ficha.inventario.itens.some(i=>i.equipado&&i.equipadoSlot==='acessorio_1')?'acessorio_1':'acessorio_2';
        exigir(slotsEquipamento.includes(slot)&&(slot===item.slotEquipamento||item.slotEquipamento==='acessorio'),'Slot incompatível com o item.');
        const anterior=a.ficha.inventario.itens.find(i=>i.equipado&&i.equipadoSlot===slot);
        if(anterior){anterior.equipado=false;delete anterior.equipadoSlot;}
        item.equipado=true;item.equipadoSlot=slot;msg=a.nome+' equipou '+item.nome+(anterior?' e guardou '+anterior.nome:'')+'.';
      }else if(c.operacao==='desequipar'){
        exigir(item.tipo==='equipamento'&&item.equipado,'Este item não está equipado.');item.equipado=false;delete item.equipadoSlot;msg=a.nome+' desequipou '+item.nome+'.';
      }else{
        exigir(item.tipo==='consumivel'&&item.quantidade>0,'Este item não é um consumível disponível.');item.quantidade--;if(item.quantidade===0)a.ficha.inventario.itens=a.ficha.inventario.itens.filter(i=>i!==item);msg=a.nome+' usou '+item.nome+' (efeito assistido pelo mestre).';
      }
      a.pv=Math.min(a.pv,pvMaximosAtuais(a));a.metros=Math.min(a.metros,deslocamentoMaximo(a));break;
    }
    case 'resolverReacao': {
      const p=s.reacaoPendente;
      exigir(s.fase==='turnos'&&p&&p.reator===a?.id,'Esta reação não está mais disponível.');
      if(p.gatilho==='ser_atingido'){
        const pend=s.resolucaoPendente,origem=s.atores.find(x=>x.id===pend?.origem),alvo=s.atores.find(x=>x.id===pend?.alvo);
        exigir(pend?.tipo==='dano_ataque'&&origem&&alvo&&alvo===a,'O ataque pendente não está mais disponível.');
        let reducao=0,nomeReacao='nenhuma reação';
        if(c.opcao){
          const o=a.ficha.opcoes.find(o=>o.id===c.opcao&&p.opcoes.includes(o.id)&&o.gatilho==='ser_atingido');
          exigir(o?.automacao?.tipo==='reduzir_dano'&&custosDisponiveis(a,o),'Reação preventiva indisponível.');
          for(const custo of o.custo??[]){const bag=custo.tipo==='recurso'?a.rec:a,key=custo.tipo==='recurso'?custo.id:custo.tipo;bag[key]-=custo.quantidade;}
          reducao=(await resultado(o.automacao.formula,{tipo:'reducao',titulo:'Redução · '+o.nome,alvo:a.nome})).total;nomeReacao=o.nome;
        }
        const controlador=origem.ficha.tipo==='pj'&&origem.dono?origem.dono:'GM';
        const bruto=(await resultado(pend.formula,{tipo:'dano',titulo:'Dano · '+pend.nome,critico:pend.critico,alvo:alvo.nome,destinoId:controlador,roladorNome:origem.nome})).total;
        const restante=Math.max(0,bruto-reducao),dano=await aplicarDanoNoAtor(alvo,restante,pend.elemento,{critico:pend.critico,origem});
        msg=alvo.nome+' respondeu com '+nomeReacao+' • dano '+bruto+' − redução '+reducao+' = '+dano;
        delete s.resolucaoPendente;delete s.reacaoPendente;abrirProximaReacaoEvento(s);break;
      }
      if(p.gatilho!=='sair_alcance'){
        const alvo=s.atores.find(x=>x.id===p.alvo);
        exigir(alvo,'O alvo da reação não está mais disponível.');
        if(!c.opcao){delete s.reacaoPendente;const seguinte=abrirProximaReacaoEvento(s);msg=a.nome+' não usou a reação.'+(seguinte?' '+seguinte.nome+' pode reagir.':'');break;}
        const o=a.ficha.opcoes.find(o=>o.id===c.opcao&&p.opcoes.includes(o.id)&&o.gatilho===p.gatilho),rule=o?.automacao;
        exigir(o&&rule&&a.reacao>0&&custosDisponiveis(a,o),'Reação indisponível.');
        exigir(distancia(a,alvo)<=Math.min(LIMITE_ALCANCE_M,rule.alcanceM)+1e-8,'O alvo saiu do alcance da reação.');
        for(const custo of o.custo??[]){const bag=custo.tipo==='recurso'?a.rec:a,key=custo.tipo==='recurso'?custo.id:custo.tipo;bag[key]-=custo.quantidade;}
        if(rule.tipo==='ataque'){
          const defesa=caAtual(alvo),rr=await rolarD20(rule.bonus,a,{tipo:'ataque',titulo:'Reação · '+o.nome,alvo:alvo.nome,cd:defesa,penalidade:restricoesAtivas(alvo).penalidadeAtaquesContra}),face=rr.natural;
          const acertou=face!==1&&(face===20||rr.total>=defesa);msg=a.nome+' reagiu com '+o.nome+' • '+(acertou?'acertou':'errou')+' '+alvo.nome;
          if(acertou){const critico=face===20,formula=critico?formulaCritica(rule.dano):rule.dano,bruto=(await resultado(formula,{tipo:'dano',titulo:'Dano · '+o.nome,critico,alvo:alvo.nome})).total;
            msg+=' e causou '+await aplicarDanoNoAtor(alvo,bruto,rule.elemento,{critico,origem:a});}
        }else{
          const escolhas=rule.atributos??[rule.atributo],atributo=escolhas.reduce((melhor,k)=>{const bonus=alvo.ficha.salvaguardas?.[k]??mod(alvo.ficha.atributos[k]);return !melhor||bonus>melhor.bonus?{k,bonus}:melhor;},null);
          const controlador=alvo.ficha.tipo==='pj'&&alvo.dono?alvo.dono:'GM',falhaAutomatica=restricoesAtivas(alvo).falhaSalvas?.includes(atributo.k);
          const rr=falhaAutomatica?{total:0}:await rolarD20(atributo.bonus,alvo,{tipo:'salvaguarda',atributo:atributo.k,titulo:'Reação · '+o.nome+' · '+alvo.nome,alvo:alvo.nome,cd:rule.cd,destinoId:controlador,roladorNome:alvo.nome});
          const sucesso=!falhaAutomatica&&rr.total>=rule.cd;msg=a.nome+' reagiu com '+o.nome+' • '+alvo.nome+(sucesso?' passou':' falhou')+' na salvaguarda';
          if(rule.dano&&(!sucesso||rule.metade)){const total=(await resultado(rule.dano,{tipo:'dano',titulo:'Dano · '+o.nome,alvo:alvo.nome})).total,bruto=sucesso?Math.floor(total/2):total;
            msg+=' e sofreu '+await aplicarDanoNoAtor(alvo,bruto,rule.elemento,{origem:a});}
          if(!sucesso&&rule.efeitoFalha){const e={id:o.id,nome:rule.efeitoFalha.nome,tipo:'condicao',condicao:rule.efeitoFalha.condicao,duracao:{restante:rule.efeitoFalha.turnos??1,expira:rule.efeitoFalha.expira??'inicio_alvo'},origemAtorId:a.id};alvo.efeitosAtivos=(alvo.efeitosAtivos??[]).filter(x=>x.id!==o.id);alvo.efeitosAtivos.push(e);}
        }
        delete s.reacaoPendente;const seguinte=abrirProximaReacaoEvento(s);if(seguinte)msg+=' • '+seguinte.nome+' pode reagir.';break;
      }
      const mov=s.movimentoPendente;
      exigir(mov,'O deslocamento que provocou a reação não existe mais.');
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
      const ataque=(o.automacao?.tipo==='ataque'?o:opcoesDisponiveis(a).filter(x=>x.automacao?.tipo==='ataque'&&x.automacao.alcanceM<=alcance+1e-8&&x.categoria!=='magia')
        .sort((x,y)=>y.automacao.bonus-x.automacao.bonus)[0]);
      exigir(ataque,'Nenhum ataque corpo a corpo configurado para esta reação.');
      const rule=ataque.automacao,alvo=s.atores.find(x=>x.id===p.alvo),ajuste=c.ajuste??0;
      exigir(alvo&&inteiro(ajuste,-20,20),'Ajuste ou alvo inválido.');
      const ra=restricoesAtivas(a),rt=restricoesAtivas(alvo),modoOriginal=c.modo;
      const vantagem=c.modo==='vantagem'||ra.vantagemAtaques||rt.vantagemAtaquesContra||(rt.caido&&distancia(a,alvo)<=1.5+1e-8);
      const desvantagem=c.modo==='desvantagem'||ra.desvantagemAtaques||rt.desvantagemAtaquesContra||(rt.caido&&distancia(a,alvo)>1.5+1e-8);
      c.modo=vantagem===desvantagem?'normal':vantagem?'vantagem':'desvantagem';
      const defesa=caAtual(alvo),rr=await rolarD20(rule.bonus,a,{tipo:'ataque',titulo:o.nome+' · '+ataque.nome,alvo:alvo.nome,cd:defesa,penalidade:restricoesAtivas(alvo).penalidadeAtaquesContra});
      const face=rr.natural,total=rr.total;
      const acertou=face!==1&&(face===20||total>=defesa);
      msg=a.nome+' • '+o.nome+' com '+ataque.nome+' • '+total+(acertou?' acertou':' errou');
      if(acertou){
        const critico=face===20||(rt.criticoCorpoACorpo&&distancia(a,alvo)<=1.5+1e-8);let formula=rule.dano;if(critico)formula=formula.replace(/^\d+/,n=>String(+n+1));
        const bruto=(await resultado(formula,{tipo:'dano',titulo:'Dano · '+ataque.nome,critico,alvo:alvo.nome})).total,dano=await aplicarDanoNoAtor(alvo,bruto,rule.elemento,{critico,origem:a});
        const percorrida=distancia(mov.origem,p.ponto);
        alvo.x=p.ponto.x;alvo.y=p.ponto.y;alvo.metros=Math.max(0,alvo.metros-percorrida);
        msg+=' e causou '+dano+'. O movimento parou em '+percorrida.toFixed(2)+' m.';
        delete s.movimentoPendente;delete s.reacaoPendente;abrirProximaReacaoEvento(s);
      }else{
        const seguinte=abrirProximaReacao(s);msg+=seguinte?' • '+seguinte.nome+' pode reagir.':' • o deslocamento continuou.';
      }
      c.modo=modoOriginal;
      break;
    }
    case 'reagir': {
      const o=opcoesDisponiveis(a).find(o=>o.id===c.opcao && o.custo?.some(v=>v.tipo==='reacao'));
      exigir(s.fase==='turnos'&&a.pv>0&&o,'Reação indisponível.');
      for(const v of o.custo){
        const bag=v.tipo==='recurso'?a.rec:a,key=v.tipo==='recurso'?v.id:v.tipo;
        exigir(bag[key]>=v.quantidade,'Saldo insuficiente para reagir.');bag[key]-=v.quantidade;
      }
      msg=a.nome+' • '+o.nome+' (gatilho e efeito conferidos pela mesa)';break;
    }
    case 'encerrar':
      delete s.reacaoPendente;delete s.movimentoPendente;delete s.resolucaoPendente;s.filaReacoes=[];
      s.fase='preparo';s.ordem=[];s.rodada=0;s.vez=0;s.atores.forEach(restaurarEconomia);msg='Combate encerrado.';break;
    case 'descanso':
      exigir(s.fase==='preparo' && ['curto','longo'].includes(c.periodo),'Escolha um descanso fora do combate.');
      for(const p of s.atores.filter(x=>x.ficha.tipo==='pj')){
        for(const r of p.ficha.recursos) if(r.recuperacao?.some(v=>v.evento==='descanso_'+c.periodo && v.modo==='completar'))p.rec[r.id]=r.maximo;
        p.efeitosAtivos=(p.efeitosAtivos??[]).filter(e=>c.periodo==='curto'&&e.removeEm!=='descanso_curto');
        if(c.periodo==='longo'||!p.efeitosAtivos.some(e=>e.concentracaoId===p.concentracaoAtiva?.id))encerrarConcentracao(s,p,'descanso '+c.periodo);
        if(c.periodo==='longo'){p.pv=pvMaximosAtuais(p);p.pvTemporarios=0;p.estadoVida='consciente';p.salvaguardasMorte={sucessos:0,falhas:0};}else p.pv=Math.min(p.pv,pvMaximosAtuais(p));
      } msg='Descanso '+c.periodo+' dos jogadores.';break;
    default: {
      exigir(!s.reacaoPendente,'Resolva a reação pendente antes de continuar.');
      const opcaoDeclarada=c.tipo==='usar'?a.ficha.opcoes.find(x=>x.id===c.opcao):null;
      const foraCombate=c.tipo==='usar'&&s.fase==='preparo';
      exigir(foraCombate||(s.fase==='turnos' && atual(s)?.id===a.id),'Aguarde o turno desse personagem.');
      if(c.tipo==='passar') {
        processarDuracoes(s,a,'fim_turno');s.vez=(s.vez+1)%s.ordem.length;if(!s.vez)s.rodada++;const iniciado=atual(s);iniciarTurno(s,iniciado);msg=a.nome+' encerrou o turno.';break;
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
      const o=opcaoDeclarada;exigir(o,'Opção desconhecida.');exigir(opcaoDisponivel(a,o),'Esta habilidade exige preparo, ativação ou equipamento adequado.');
      const rule=o.automacao;
      exigir(rule || (gm && c.assistido),'Opção assistida. O mestre precisa confirmar a resolução.');
      for(const custo of o.custo??[]){
        if(foraCombate&&custo.tipo!=='recurso')continue;
        const bag=custo.tipo==='recurso'?a.rec:a;const key=custo.tipo==='recurso'?custo.id:custo.tipo;
        exigir(bag[key]>=custo.quantidade,'Saldo insuficiente para '+o.nome);bag[key]-=custo.quantidade;
      }
      msg=a.nome+' • '+o.nome;
      const concentracaoId=o.concentracao?iniciarConcentracao(s,a,o):null;
      if(!rule){msg+=' (resolução pelo mestre)';break;}
      if(rule.tipo==='efeito_conjuracao'){
        a.efeitosAtivos=(a.efeitosAtivos??[]).filter(e=>e.id!==o.id);
        a.efeitosAtivos.push({id:o.id,nome:o.nome,turnos:rule.turnos,duracao:{restante:rule.turnos,expira:'inicio_alvo'},origem:rule.origem,origemAtorId:a.id,concentracaoId:concentracaoId??undefined,bonusCD:rule.bonusCD,vantagemAtaque:rule.vantagemAtaque===true});
        break;
      }
      const efeitos=(a.efeitosAtivos??[]).filter(e=>e.origem===o.origem);
      if(rule.tipo==='disparada'){a.metros+=deslocamentoMaximo(a);break;}
      if(rule.tipo==='desengajar'){a.desengajado=true;break;}
      if(rule.tipo==='economia'){
        for(const k of ['acao','bonus','reacao'])if(rule.adicionar?.[k])a[k]+=rule.adicionar[k];
        for(const id of rule.recuperarRecursos??[]){const r=a.ficha.recursos.find(x=>x.id===id);if(r)a.rec[id]=r.maximo;}
        if(rule.disparada)a.metros+=deslocamentoMaximo(a);
        if(rule.desengajar)a.desengajado=true;
        if(rule.esquivar){
          const id=o.id+'-'+a.id;
          a.efeitosAtivos=(a.efeitosAtivos??[]).filter(e=>e.id!==id);
          a.efeitosAtivos.push({id,nome:'Esquiva',tipo:'buff',descricao:'Ataques contra você têm desvantagem e suas salvaguardas de DES têm vantagem.',origemAtorId:a.id,duracao:{turnos:1,restante:1,expira:'inicio_origem'},restricoes:{desvantagemAtaquesContra:true,vantagemSalvas:['des']}});
        }
        if(rule.pvTemporarios)concederPVTemporarios(a,rule.pvTemporarios);
        if(rule.cura){const valor=(await resultado(rule.cura,{tipo:'cura',titulo:'Cura · '+o.nome})).total;curarAtor(a,valor);}
        break;
      }
      const selecao=multi(o);let escolhidos;
      if(selecao){
        exigir(Array.isArray(c.alvos)&&c.alvos.length>=selecao.min&&c.alvos.length<=selecao.max,'Quantidade de alvos inválida.');
        exigir(selecao.repetirAlvo||new Set(c.alvos).size===c.alvos.length,'Escolha criaturas diferentes.');
        escolhidos=c.alvos.map(id=>s.atores.find(x=>x.id===id));
        exigir(escolhidos.every(p=>p&&distancia(a,p)<=rule.alcanceM+1e-8),'Alvo ausente ou fora do alcance.');
        if(rule.tipo==='bencao'){
          a.bencao={alvos:[...c.alvos],turnos:10,concentracaoId};msg+=' • '+escolhidos.map(p=>p.nome).join(', ');break;
        }
      }
      const alvo=escolhidos?.[0]??s.atores.find(x=>x.id===c.alvo);
      const temArea=Boolean(rule.raioM||rule.area),centro=temArea?(rule.origemArea==='conjurador'?a:c.ponto):alvo;
      exigir(centro && Number.isFinite(centro.x)&&Number.isFinite(centro.y)&&distancia(a,centro)<=rule.alcanceM+1e-8,'Alvo ou centro fora do alcance.');
      const afetados=(escolhidos??(temArea?s.atores.filter(x=>dentroDaArea(a,centro,x,rule)):[alvo])).filter(x=>x&&(!rule.excluirConjurador||x!==a));
      validarRequisitosUso(s,a,o,afetados[0]);
      const deslocarForcado=p=>{
        const regra=rule.deslocamentoForcado;if(!regra)return false;
        const origemVetor=temArea?(['cone','linha'].includes(rule.area?.forma)?a:centro):a,destino=destinoDeslocamento(origemVetor,p,regra.distanciaM);
        if(!destino)return false;p.x=destino.x;p.y=destino.y;msg+=' • '+p.nome+' foi empurrado '+regra.distanciaM+' m';return true;
      };
      if(rule.tipo==='conceder_dado'){
        exigir(afetados.length===1,'Escolha uma criatura para receber o dado.');const p=afetados[0],def=structuredClone(rule.modificador),id=o.id+'-'+a.id;
        p.efeitosAtivos=(p.efeitosAtivos??[]).filter(e=>e.id!==id);p.efeitosAtivos.push({id,nome:def.nome??o.nome,tipo:'buff',descricao:def.descricao??o.descricao,origemAtorId:a.id,removeEm:def.removeEm,
          modificadorRolagem:{formula:def.formula,tipos:[...def.tipos],removeAoUsar:def.removeAoUsar!==false}});msg+=' • '+p.nome+' recebeu '+(def.nome??o.nome);break;
      }
      if(rule.tipo==='efeito'){
        exigir(afetados.length===1,'Escolha um alvo para o efeito.');const p=afetados[0],def=structuredClone(rule.efeito),id=o.id+'-'+a.id;
        exigir(!def.requisitos?.semArmadura||!usaArmadura(p),p.nome+' está usando armadura.');
        const maxAntes=pvMaximosAtuais(p);p.efeitosAtivos=(p.efeitosAtivos??[]).filter(e=>e.id!==o.id&&e.id!==id);
        def.id=id;def.origem=o.origem;def.origemAtorId=a.id;def.concentracaoId=concentracaoId??undefined;def.descricao=def.descricao??o.descricao;def.modificadores=def.modificadores??{};
        if(def.danoAoSerAtingido)def.danoAoSerAtingido={...def.danoAoSerAtingido,origemAtorId:a.id};
        if(def.duracao)def.duracao={...def.duracao,restante:def.duracao.turnos};
        if(Number.isFinite(def.caMinima))def.modificadores.ca=Math.max(0,def.caMinima+mod(p.ficha.atributos.des)-caAtual(p));
        p.efeitosAtivos.push(def);const maxDepois=pvMaximosAtuais(p);
        if(def.aumentaPVAtual&&maxDepois>maxAntes)p.pv+=maxDepois-maxAntes;p.pv=Math.min(p.pv,maxDepois);
        if(restricoesAtivas(p).semAcoes)encerrarConcentracao(s,p,'incapacitado');
        msg+=' • '+p.nome+' recebeu '+def.nome;break;
      }
      if(rule.tipo==='estabilizar'){
        exigir(afetados.length===1,'Escolha uma criatura para estabilizar.');const p=afetados[0];
        exigir(p.pv===0&&p.estadoVida==='inconsciente',p.nome+' não pode ser estabilizado agora.');
        p.estadoVida='estavel';p.salvaguardasMorte={sucessos:0,falhas:0};msg+=' • '+p.nome+' ficou estável';break;
      }
      if(rule.tipo==='cura'||rule.tipo==='pv_temporario'){
        const base=rule.formula?(await resultado(rule.formula,{tipo:rule.tipo==='cura'?'cura':'pv-temporario',titulo:(rule.tipo==='cura'?'Cura · ':'PV temporários · ')+o.nome})).total:rule.valor;
        const valor=Math.max(0,Math.floor(base*(rule.multiplicador??1)));
        for(const p of afetados){
          if(rule.tipo==='cura'){const aplicado=curarAtor(p,valor);msg+=' • '+p.nome+' recuperou '+aplicado+' PV';}
          else{const antes=p.pvTemporarios??0;concederPVTemporarios(p,valor);msg+=' • '+p.nome+' ficou com '+p.pvTemporarios+' PV temporários'+(p.pvTemporarios===antes&&valor<=antes?' (manteve o maior valor)':'');}
        }
        break;
      }
      const ajuste=c.ajuste??0;exigir(inteiro(ajuste,-20,20),'Ajuste inválido.');
      const restricoesAtacante=restricoesAtivas(a),restricoesAlvos=afetados.map(restricoesAtivas);
      if(rule.tipo==='ataque'&&restricoesAtacante.naoAtacarOrigem){
        const origens=(a.efeitosAtivos??[]).filter(e=>(e.condicao==='enfeiticado'||e.restricoes?.naoAtacarOrigem)&&e.origemAtorId).map(e=>e.origemAtorId);
        exigir(!afetados.some(p=>origens.includes(p.id)),'Enfeitiçado: não pode atacar a origem do efeito.');
      }
      const caidoPerto=rule.tipo==='ataque'&&afetados.some((p,i)=>restricoesAlvos[i].caido&&distancia(a,p)<=1.5+1e-8);
      const caidoLonge=rule.tipo==='ataque'&&afetados.some((p,i)=>restricoesAlvos[i].caido&&distancia(a,p)>1.5+1e-8);
      const vantagem=c.modo==='vantagem'||(rule.tipo==='ataque'&&efeitos.some(e=>e.vantagemAtaque))||(rule.tipo==='ataque'&&restricoesAtacante.vantagemAtaques)||(rule.tipo==='ataque'&&restricoesAlvos.some(r=>r.vantagemAtaquesContra))||caidoPerto;
      const desvantagem=c.modo==='desvantagem'||(rule.tipo==='ataque'&&restricoesAtacante.desvantagemAtaques)||(rule.tipo==='ataque'&&restricoesAlvos.some(r=>r.desvantagemAtaquesContra))||caidoLonge||(rule.tipo==='ataque'&&rule.alcanceNormalM!=null&&afetados.some(p=>distancia(a,p)>rule.alcanceNormalM+1e-8));
      const modoOriginal=c.modo;c.modo=vantagem===desvantagem?'normal':vantagem?'vantagem':'desvantagem';
      if(rule.tipo==='projeteis'){
        const formulas=afetados.map(()=>rule.dano),instancias=afetados.map((p,i)=>({titulo:'Seta '+(i+1),alvo:p.nome})),nome=o.nome.replace(/^\d+º\s*\|\s*/,'').replace(/\s*·\s*(?:acerto automático|classe).*$/i,'');
        const danos=await resultadoLote(formulas,{tipo:'dano-lote',titulo:'Danos · '+nome,instancias});
        for(let i=0;i<afetados.length;i++){msg+=' • '+afetados[i].nome+' sofreu '+await aplicarDanoNoAtor(afetados[i],danos[i].total,rule.elemento,{origem:a});deslocarForcado(afetados[i]);}
        c.modo=modoOriginal;break;
      }
      if(rule.tipo==='ataque'&&afetados.length>1){
        const acertos=[],nome=o.nome.replace(/^\d+º\s*\|\s*/,'').replace(/\s*·\s*classe.*$/i,'');
        for(let i=0;i<afetados.length;i++){
          const p=afetados[i],regraAtaque=rule.ataques?.[i]??rule,defesa=caAtual(p),rr=await rolarD20(regraAtaque.bonus,a,{tipo:'ataque',titulo:'Ataque '+(i+1)+' · '+o.nome,alvo:p.nome,cd:defesa,penalidade:restricoesAtivas(p).penalidadeAtaquesContra}),face=rr.natural,total=rr.total,evento={opcao:o.id,alvo:p.id,tags:tagsAtaque(o,regraAtaque),acertou:face!==1&&(face===20||total>=defesa)};a.eventosTurno.ataques.push(evento);
          msg+=' • d20 '+face+(a.ficha.tipo==='pj'?' (total '+total+')':'');
          if(face===1||(face!==20&&total<defesa)){msg+=' • errou '+p.nome;continue;}
          a.eventosTurno.acertos.push(evento);const critico=face===20||(restricoesAtivas(p).criticoCorpoACorpo&&distancia(a,p)<=1.5+1e-8),formula=critico?formulaCritica(regraAtaque.dano):regraAtaque.dano;
          if(critico)msg+=' • crítico';acertos.push({p,formula,indice:i,regraAtaque,critico});
        }
        if(acertos.length){
          const danos=await resultadoLote(acertos.map(x=>x.formula),{tipo:'dano-lote',titulo:'Danos · '+nome,instancias:acertos.map(x=>({titulo:'Ataque '+(x.indice+1),alvo:x.p.nome,critico:x.critico}))});
          for(let i=0;i<acertos.length;i++){msg+=' • '+acertos[i].p.nome+' sofreu '+await aplicarDanoNoAtor(acertos[i].p,danos[i].total,acertos[i].regraAtaque.elemento??rule.elemento,{critico:acertos[i].critico,origem:a});deslocarForcado(acertos[i].p);}
        }
        c.modo=modoOriginal;break;
      }
      if(rule.tipo==='salva'){
        const cd=rule.cd+Math.max(0,...efeitos.map(e=>e.bonusCD)),resultadosSalva=new Array(afetados.length),grupos=new Map();
        for(let i=0;i<afetados.length;i++){
          const p=afetados[i],controlador=p.ficha.tipo==='pj'&&p.dono?p.dono:'GM';
          if(!grupos.has(controlador))grupos.set(controlador,[]);grupos.get(controlador).push({p,i});
        }
        let danoBase=temArea&&rule.dano?(await resultado(rule.dano,{tipo:'dano',titulo:'Dano · '+o.nome})).total:null;
        await Promise.all([...grupos.entries()].map(async([controlador,itens])=>{for(const {p,i} of itens){
          const escolhas=rule.atributos??[rule.atributo],atributo=escolhas.reduce((melhor,k)=>{const bonus=p.ficha.salvaguardas?.[k]??mod(p.ficha.atributos[k]);return !melhor||bonus>melhor.bonus?{k,bonus}:melhor;},null);
          const falhaAutomatica=restricoesAtivas(p).falhaSalvas?.includes(atributo.k);
          const rr=falhaAutomatica?{total:0,natural:null}:await rolarD20(atributo.bonus,p,{tipo:'salvaguarda',atributo:atributo.k,titulo:'Salvaguarda de '+escolhas.map(k=>k.toUpperCase()).join(' ou ')+' · '+p.nome,alvo:p.nome,cd,destinoId:controlador,roladorNome:p.nome});
          resultadosSalva[i]={p,total:rr.total,sucesso:!falhaAutomatica&&rr.total>=cd,falhaAutomatica};
        }}));
        for(const r of resultadosSalva)msg+=' • '+r.p.nome+' '+(r.sucesso?'passou':'falhou')+' na salvaguarda ('+r.total+')';
        if(!temArea&&rule.dano&&(rule.metade||resultadosSalva.some(r=>!r.sucesso)))danoBase=(await resultado(rule.dano,{tipo:'dano',titulo:'Dano · '+o.nome})).total;
        for(const r of resultadosSalva){
          if(danoBase!==null){const bruto=r.sucesso?(rule.metade?Math.floor(danoBase/2):0):danoBase,valor=await aplicarDanoNoAtor(r.p,bruto,rule.elemento,{origem:a});msg+=' • '+r.p.nome+' sofreu '+valor;}
          if(!r.sucesso)deslocarForcado(r.p);
          if(!r.sucesso&&rule.efeitoFalha){
            const efeito={id:o.id,nome:rule.efeitoFalha.nome,tipo:'condicao',condicao:rule.efeitoFalha.condicao,restricoes:rule.efeitoFalha.restricoes,turnos:rule.efeitoFalha.turnos,duracao:{restante:rule.efeitoFalha.turnos,expira:rule.efeitoFalha.expira??'inicio_alvo'},origemAtorId:a.id,concentracaoId:concentracaoId??undefined,penalidadeProximaSalva:rule.efeitoFalha.penalidadeProximaSalva};
            r.p.efeitosAtivos=(r.p.efeitosAtivos??[]).filter(e=>e.id!==o.id);r.p.efeitosAtivos.push(efeito);
            if(rule.efeitoFalha.consomeReacao)r.p.reacao=0;msg+=' • efeito: '+efeito.nome;
            if(restricoesAtivas(r.p).semAcoes)encerrarConcentracao(s,r.p,'incapacitado');
          }
        }
        c.modo=modoOriginal;break;
      }
      for(const p of afetados){
      let formula=rule.dano;
      let critico=false;
      if(rule.tipo==='ataque'){
        const defesa=caAtual(p),rr=await rolarD20(rule.bonus,a,{tipo:'ataque',titulo:'Ataque · '+o.nome,alvo:p.nome,cd:defesa,penalidade:restricoesAtivas(p).penalidadeAtaquesContra});const face=rr.natural,total=rr.total;
        msg+=' • d20 '+face+(a.ficha.tipo==='pj'?' (total '+total+')':'');
        const acertou=face!==1&&(face===20||total>=defesa),evento={opcao:o.id,alvo:p.id,tags:tagsAtaque(o,rule),acertou};a.eventosTurno.ataques.push(evento);
        if(!acertou){msg+=' • errou '+p.nome;continue;}
        a.eventosTurno.acertos.push(evento);
        if(face===20||(restricoesAtivas(p).criticoCorpoACorpo&&distancia(a,p)<=1.5+1e-8)){critico=true;formula=formulaCritica(formula);msg+=' • crítico';}
      }
      if(rule.tipo==='ataque'&&abrirReacaoPreventiva(s,p,a,{formula,elemento:rule.elemento,critico,nome:o.nome})){msg+=' • aguardando reação de '+p.nome;continue;}
      const adicionais=rule.tipo==='ataque'?opcoesDepoisDoAcerto(a,o,p):[],rerrolagens=opcoesRerrolagemDano(a);
      const metaAdicionais=adicionais.map(g=>({id:g.id,nome:g.nome,formula:critico&&g.aprimoramento.critico!==false?formulaCritica(g.aprimoramento.dano):g.aprimoramento.dano,elemento:g.aprimoramento.elemento,custo:g.custo??[],automatico:g.automatico===true,descricao:g.descricao??''}));
      const metaRerrolagens=rerrolagens.map(g=>({id:g.id,nome:g.nome,modo:g.rerrolagem.modo,resultados:g.rerrolagem.resultados,custo:g.custo??[],descricao:g.descricao??''}));
      const rolagem=await resultado(formula,{tipo:'dano',titulo:'Dano · '+o.nome,critico,alvo:p.nome,adicionais:metaAdicionais,rerrolagens:metaRerrolagens});
      const idsAdicionais=Array.isArray(rolagem.recursosAtivos)?rolagem.recursosAtivos:[],idsRerrolagem=Array.isArray(rolagem.rerrolagensUsadas)?rolagem.rerrolagensUsadas:[];
      exigir(new Set(idsAdicionais).size===idsAdicionais.length&&idsAdicionais.every(id=>adicionais.some(g=>g.id===id)),'Aprimoramento de dano inválido.');
      exigir(adicionais.filter(g=>g.automatico).every(g=>idsAdicionais.includes(g.id)),'Dano persistente obrigatório ausente.');
      exigir(idsRerrolagem.every(id=>rerrolagens.some(g=>g.id===id)),'Rerrolagem de dano inválida.');
      const escolhidos=idsAdicionais.map(id=>adicionais.find(g=>g.id===id)),usadosRerrolagem=idsRerrolagem.map(id=>rerrolagens.find(g=>g.id===id));
      for(const g of [...escolhidos,...usadosRerrolagem])for(const custo of g.custo??[]){
        const bag=custo.tipo==='recurso'?a.rec:a,key=custo.tipo==='recurso'?custo.id:custo.tipo;exigir(bag[key]>=custo.quantidade,'Saldo insuficiente para '+g.nome);bag[key]-=custo.quantidade;
      }
      for(const g of escolhidos)if(g.umaVezPorTurno)a.usosTurno[g.id]=true;
      const parcelas=rolagem.resultados?.length?rolagem.resultados:[rolagem],base=parcelas[0],valores=[ajustarDano(p,base.total,rule.elemento),...escolhidos.map((g,i)=>ajustarDano(p,(parcelas[i+1]??{total:0}).total,g.aprimoramento.elemento))];
      await aplicarDanoNoAtor(p,valores.reduce((n,x)=>n+x,0),null,{critico,ajustado:true,origem:a});msg+=' • '+p.nome+' sofreu '+valores[0];
      for(let i=0;i<escolhidos.length;i++){
        const g=escolhidos[i];msg+=' + '+valores[i+1]+' de '+g.nome;
        const salva=g.aprimoramento.salva;
        if(salva){const bonus=p.ficha.salvaguardas?.[salva.atributo]??mod(p.ficha.atributos[salva.atributo]),rr=await rolarD20(bonus,p,{tipo:'salvaguarda',atributo:salva.atributo,titulo:'Salvaguarda · '+g.nome,alvo:p.nome,cd:salva.cd});
          if(rr.total<salva.cd&&salva.efeitoFalha){const e={id:g.id,nome:salva.efeitoFalha.nome,tipo:'condicao',condicao:salva.efeitoFalha.condicao,duracao:{restante:salva.efeitoFalha.turnos??1,expira:salva.efeitoFalha.expira??'fim_origem'},origemAtorId:a.id};p.efeitosAtivos=(p.efeitosAtivos??[]).filter(x=>x.id!==g.id);p.efeitosAtivos.push(e);msg+=' • '+p.nome+' falhou e recebeu '+e.nome;}else msg+=' • '+p.nome+' resistiu a '+g.nome;
        }
      }
        deslocarForcado(p);
      }
      c.modo=modoOriginal;
    }
  }
  registrar(s,(gm && a?.ficha.tipo==='pj' && c.confirmado?'Mestre por '+a.nome+' — ':'')+msg);s.rev++;return s;
}
export function publico(s){
  const v=structuredClone(s);
  delete v.filaReacoes;delete v.resolucaoPendente;
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

