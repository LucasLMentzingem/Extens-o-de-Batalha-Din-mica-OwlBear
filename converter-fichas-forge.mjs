import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const raiz=resolve('../../outputs/aventura DnD/Asset/Tokens/Players');
const destino=resolve('site/fichas');
const defs={
  'Dragoberto-Nv3':{id:'dragoberto',classe:'guardiao'},
  'Draven-Thorne-Nv3':{id:'draven-thorne',classe:'guerreiro'},
  'Hannah-Montana-Nv3':{id:'hannah-montana',classe:'bardo'},
  'Loteria-Nv3':{id:'loteria',classe:'monge'},
  'Nikki-Lauda-Nv3':{id:'nikki',classe:'feiticeiro'},
  'Skimi-Nv3':{id:'skimi',classe:'bruxo'},
  'Zurich-Nv3':{id:'zurich',classe:'guardiao'}
};
const chave=n=>'com.battle-system.forge/Z'+String(n).padStart(3,'0');
const semAcento=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const slug=s=>semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72)||'item';
const numero=s=>Number(String(s??'0').replace(',','.'));
const tipoDano=t=>({igneo:'fogo',eletrico:'raio',gelido:'gelo',trovejante:'trovejante',psiquico:'psiquico',necrotico:'necrotico',radiante:'radiante',acido:'acido',venenoso:'veneno',perfurante:'perfurante',cortante:'cortante',contundente:'contundente'}[semAcento(t).toLowerCase()]);
const recursoId=nome=>slug(nome.replace(/^Recurso\s*\|\s*/i,''));
function recursos(itens){return itens.filter(x=>/^Recurso\s*\|/i.test(x.name)).flatMap(x=>{const recuperacao=[],txt=semAcento(x.description).toLowerCase();if(txt.includes('descanso curto'))recuperacao.push({evento:'descanso_curto',modo:'completar'});if(txt.includes('descanso longo'))recuperacao.push({evento:'descanso_longo',modo:'completar'});
  const circulos=[...String(x.description??'').matchAll(/(\d+)º\s*círculo\s*:\s*(\d+)\s*\/\s*(\d+)/gi)];if(circulos.length)return circulos.map(m=>({id:'espaco-'+m[1],nome:'Espaços de '+m[1]+'º círculo',maximo:+m[3],saldoInicial:+m[2],recuperacao:structuredClone(recuperacao)}));
  const saldo=/(?:Saldo(?: inicial[^:]*)?|saldo inicial de descanso completo)\s*:\s*(\d+)\s*\/\s*(\d+)/i.exec(x.description??'');if(!saldo)return [];
  return [{id:recursoId(x.name),nome:x.name.replace(/^Recurso\s*\|\s*/i,''),maximo:+saldo[2],saldoInicial:+saldo[1],recuperacao}];});}
function custo(nome,descricao,recs,circulo){const txt=semAcento(nome+' '+descricao).toLowerCase(),out=[];if(txt.includes('reacao'))out.push({tipo:'reacao',quantidade:1});else if(txt.includes('acao bonus'))out.push({tipo:'bonus',quantidade:1});else if(txt.includes('acao')||circulo!==null)out.push({tipo:'acao',quantidade:1});
  for(const r of recs){if(r.id.startsWith('espaco-'))continue;const base=semAcento(r.nome).toLowerCase(),singular=base.replace(/s\b/g,''),alias=base.split(/\s+/).at(-1);if(txt.includes(base)||txt.includes(singular)||alias.length>3&&txt.includes(alias)){const m=new RegExp('(\\d+)\\s+(?:'+base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'|'+singular.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'|'+alias+')').exec(txt);out.push({tipo:'recurso',id:r.id,quantidade:m?+m[1]:1});}}
  if(circulo>0){const espacos=recs.filter(r=>r.id.startsWith('espaco-')).sort((a,b)=>Number(a.id.split('-')[1])-Number(b.id.split('-')[1])),espaco=espacos.find(r=>Number(r.id.split('-')[1])>=circulo)??espacos.at(-1);if(espaco&&!out.some(c=>c.id===espaco.id))out.push({tipo:'recurso',id:espaco.id,quantidade:1});}
  return out;}
function alcance(txt){if(/pessoal/i.test(txt))return 0;if(/toque/i.test(txt))return 1.5;const xs=[...txt.matchAll(/(\d+(?:[,.]\d+)?)\s*m\b/gi)].map(m=>numero(m[1]));return xs.length?Math.min(18,xs[0]):1.5;}
function automacaoAtaque(nome,desc){const hit=/Normal\s*\[1d20([+-]\d+)?\]/i.exec(desc),dmg=/Dano\s*\[((?:\d+)d(?:4|6|8|10|12)(?:[+-]\d+)?)\]/i.exec(desc);if(!hit||!dmg)return null;const danoTipo=/(perfurante|cortante|contundente|ígneo|elétrico|gélido|trovejante|psíquico|necrótico|radiante|ácido|venenoso)/i.exec(desc);
  return {tipo:'ataque',bonus:Number(hit[1]||0),dano:dmg[1],elemento:tipoDano(danoTipo?.[1]),alcanceM:/corpo a corpo|1,5\s*m/i.test(desc)?1.5:alcance(desc)};}
function automacaoMagia(nome,desc){const dano=/Dano\s*\[((?:\d+)d(?:4|6|8|10|12)(?:[+-]\d+)?)\]/i.exec(desc),salva=/(?:rola|salvaguarda de?)\s*(FOR|DES|CON|INT|SAB|CAR)[^\d]{0,15}CD\s*(\d+)/i.exec(semAcento(desc)),tipo=/(ígneo|elétrico|gélido|trovejante|psíquico|necrótico|radiante|ácido|venenoso|perfurante|cortante|contundente)/i.exec(desc),r=alcance(desc);if(!salva||!dano)return null;
  const a={tipo:'salva',atributo:salva[1].toLowerCase(),cd:+salva[2],dano:dano[1],elemento:tipoDano(tipo?.[1]),alcanceM:r,metade:/metade no sucesso/i.test(desc)};let m;
  if(m=/esfera de\s*(\d+(?:[,.]\d+)?)\s*m de raio/i.exec(desc))a.area={forma:'circulo',raioM:numero(m[1])};
  else if(m=/cone de\s*(\d+(?:[,.]\d+)?)\s*m/i.exec(desc))a.area={forma:'cone',comprimentoM:numero(m[1])};
  else if(m=/(?:cubo|quadrado) de\s*(\d+(?:[,.]\d+)?)\s*m/i.exec(desc))a.area={forma:'quadrado',tamanhoM:numero(m[1])};
  else if(m=/linha de\s*(\d+(?:[,.]\d+)?)\s*m(?:[^\d]+(\d+(?:[,.]\d+)?)\s*m)?/i.exec(desc))a.area={forma:'linha',comprimentoM:numero(m[1]),larguraM:m[2]?numero(m[2]):1.5};return a;}
function opcao(x,recs,i,categoriaForcada){const nome=x.name??x.nome,descricao=x.description??x.descricao??'',m=/^(Truque|([1-9])º)\s*\|/i.exec(nome),circulo=m?(m[1].toLowerCase()==='truque'?0:+m[2]):null,categoria=categoriaForcada??(circulo!==null?'magia':'acao'),o={id:slug(nome)+'-'+i,nome,categoria,descricao,custo:custo(nome,descricao,recs,circulo)};
  const auto=automacaoAtaque(nome,descricao)??(categoria==='magia'?automacaoMagia(nome,descricao):null);if(auto)o.automacao=auto;if(circulo!==null)o.circuloBase=circulo;if(/concentra[cç][aã]o/i.test(descricao))o.concentracao=true;return o;}
function pericias(texto){const out={};for(const parte of String(texto??'').split(';')){const m=/^\s*([^+-]+?)\s*([+-]\d+)\s*$/.exec(parte);if(m)out[m[1].trim()]=+m[2];}return out;}
function listaCampo(v){const t=String(v??'');return /nenhuma informada/i.test(t)?[]:t.split(/[;,]/).map(x=>tipoDano(x.trim())??x.trim().toLowerCase()).filter(Boolean);}
function enriquecer(f){const op=n=>f.opcoes.find(o=>semAcento(o.nome).toLowerCase().includes(semAcento(n).toLowerCase())),rec=n=>f.recursos.find(r=>semAcento(r.nome).toLowerCase().includes(semAcento(n).toLowerCase())),custoRecurso=(n,q=1)=>{const r=rec(n);return r?{tipo:'recurso',id:r.id,quantidade:q}:null;},adicionar=o=>{if(!f.opcoes.some(x=>x.id===o.id))f.opcoes.push(o);};
  for(const o of f.opcoes){const n=semAcento(o.nome).toLowerCase();if(n.startsWith('disparada'))o.automacao={tipo:'disparada'};if(n.startsWith('desengajar'))o.automacao={tipo:'desengajar'};if(n.startsWith('ataque de oportunidade')){o.gatilho='sair_alcance';o.custo=[{tipo:'reacao',quantidade:1}];delete o.automacao;}
    if(/curar ferimentos|palavra curativa/.test(n)){const m=/cura\s*\[((?:\d+)d(?:4|6|8|10|12)(?:[+-]\d+)?)\]/i.exec(o.descricao);if(m)o.automacao={tipo:'cura',formula:m[1],alcanceM:/palavra curativa/.test(n)?18:1.5};}
    if(n.includes('assassino de colossos')){o.gatilho='apos_acerto';o.umaVezPorTurno=true;o.automatico=true;o.custo=[];o.aprimoramento={dano:'1d8',requisitos:{tagsAtaque:['arma'],alvoFerido:true}};delete o.automacao;}
    if(n.includes('destruidor de hordas')){const arma=f.opcoes.filter(x=>x.automacao?.tipo==='ataque'&&x.categoria!=='magia').sort((a,b)=>b.automacao.bonus-a.automacao.bonus)[0];if(arma){o.custo=[];o.requisitosUso={aposAtaque:true,tagsAtaqueAnterior:['arma'],umaVezPorTurno:o.id,alvoDiferenteDoAnterior:true,distanciaDoAlvoAnteriorM:1.5};o.automacao={...structuredClone(arma.automacao),alcanceM:18};}}
    if(n.includes('marca do predador')){o.concentracao=true;o.custo=[{tipo:'bonus',quantidade:1},custoRecurso('Marca do Predador')].filter(Boolean);o.automacao={tipo:'efeito',alcanceM:18,efeito:{nome:'Marca do Predador',tipo:'debuff',descricao:'A origem causa 1d6 energético adicional ao acertar este alvo com arma.',danoAoSerAtingido:{formula:'1d6',elemento:'energetico',tagsAtaque:['arma']}}};}
    if(n.includes('fogo das fadas'))o.automacao={tipo:'salva',atributo:'des',cd:13,alcanceM:18,area:{forma:'quadrado',tamanhoM:6},efeitoFalha:{nome:'Iluminado por Fogo das Fadas',turnos:10,restricoes:{vantagemAtaquesContra:true}}};
    if(n.includes('zombaria perversa'))o.automacao={tipo:'salva',atributo:'sab',cd:13,dano:'1d6',elemento:'psiquico',alcanceM:18,efeitoFalha:{nome:'Zombado',turnos:1,restricoes:{desvantagemAtaques:true}}};
    if(n.includes('imobilizar pessoa'))o.automacao={tipo:'salva',atributo:'sab',cd:13,alcanceM:18,efeitoFalha:{nome:'Paralisado',condicao:'paralisado',turnos:10}};
    if(n.includes('riso histerico'))o.automacao={tipo:'salva',atributo:'sab',cd:13,alcanceM:9,efeitoFalha:{nome:'Rindo no chão',turnos:10,restricoes:{semAcoes:true,semBonus:true,caido:true}}};
    if(n.includes('emaranhar'))o.automacao={tipo:'salva',atributo:'for',cd:12,alcanceM:18,area:{forma:'quadrado',tamanhoM:6},efeitoFalha:{nome:'Imobilizado por Emaranhar',condicao:'imobilizado',turnos:10}};
    if(n.includes('defletir ataques')){o.gatilho='ser_atingido';o.custo=[{tipo:'reacao',quantidade:1}];o.automacao={tipo:'reduzir_dano',formula:'1d10+6'};}
    if(n.includes('torrente de golpes')&&o.automacao?.tipo==='ataque'){const a=structuredClone(o.automacao);o.selecao={tipo:'alvos',min:2,max:2,repetirAlvo:true};o.automacao={...a,ataques:[a,a]};}
  }
  if(f.id==='draven-thorne')for(const [id,nome,atributo,condicao] of [['prostrar','Ataque Prostrador','for','caido'],['ameacador','Ataque Ameaçador','sab','amedrontado'],['desarmar','Ataque de Desarme','for',null]])adicionar({id:'manobra-'+id,nome,categoria:'acao',descricao:'Ao acertar com arma, gaste um Dado de Superioridade e some 1d8 ao dano.',gatilho:'apos_acerto',custo:[custoRecurso('Dados de Superioridade')].filter(Boolean),aprimoramento:{dano:'1d8',requisitos:{tagsAtaque:['arma']},salva:{atributo,cd:13,efeitoFalha:{nome:condicao?nome:'Desarmado',...(condicao?{condicao}:{}),turnos:1,expira:'fim_origem'}}}});
  if(f.id==='draven-thorne'){
    adicionar({id:'recuperar-folego-acao',nome:'Recuperar Fôlego',categoria:'bonus',descricao:'Recupere 1d10+3 PV.',custo:[{tipo:'bonus',quantidade:1},custoRecurso('Recuperar Fôlego')].filter(Boolean),automacao:{tipo:'economia',cura:'1d10+3'}});
    adicionar({id:'surto-de-acao-acao',nome:'Surto de Ação',categoria:'acao',descricao:'Receba uma ação adicional neste turno.',custo:[custoRecurso('Surto de Ação')].filter(Boolean),automacao:{tipo:'economia',adicionar:{acao:1}}});
  }
  if(f.id==='hannah-montana'){adicionar({id:'inspiracao-bardo-acao',nome:'Inspiração de Bardo',categoria:'acao',descricao:'Concede 1d6 a uma criatura a até 18 m.',custo:[{tipo:'bonus',quantidade:1},custoRecurso('Inspiração de Bardo')].filter(Boolean),automacao:{tipo:'conceder_dado',alcanceM:18,modificador:{nome:'Inspiração de Bardo',formula:'1d6',tipos:['ataque','salvaguarda','teste'],removeAoUsar:true,removeEm:'descanso_longo'}}});const m=op('Manto de Inspiração');if(m){m.custo=[{tipo:'bonus',quantidade:1},custoRecurso('Inspiração de Bardo')].filter(Boolean);m.selecao={tipo:'alvos',min:1,max:3,repetirAlvo:false};m.automacao={tipo:'pv_temporario',formula:'1d6',multiplicador:2,alcanceM:18};}}
  if(f.id==='skimi'){adicionar({id:'ponto-sorte-rerrolagem',nome:'Ponto de Sorte',categoria:'acao',descricao:'Depois de ver um d20, pode rerrolá-lo.',gatilho:'apos_rolagem_d20',custo:[custoRecurso('Pontos de sorte')].filter(Boolean),rerrolagem:{tipo:'d20',modo:'todos'}});}
  if(f.id==='loteria'){
    const paciente=op('Defesa Paciente'),vento=op('Passo do Vento');
    if(paciente){paciente.custo=[{tipo:'bonus',quantidade:1}];paciente.automacao={tipo:'economia',desengajar:true};}
    if(vento){vento.custo=[{tipo:'bonus',quantidade:1}];vento.automacao={tipo:'economia',disparada:true};}
    adicionar({id:'defesa-paciente-foco',nome:'Defesa Paciente · Foco',categoria:'bonus',descricao:'Desengaje e assuma Esquiva até o início do próximo turno.',custo:[{tipo:'bonus',quantidade:1},custoRecurso('Pontos de Foco')].filter(Boolean),automacao:{tipo:'economia',desengajar:true,esquivar:true}});
    adicionar({id:'passo-do-vento-foco',nome:'Passo do Vento · Foco',categoria:'bonus',descricao:'Desengaje e faça Disparada.',custo:[{tipo:'bonus',quantidade:1},custoRecurso('Pontos de Foco')].filter(Boolean),automacao:{tipo:'economia',desengajar:true,disparada:true}});
    adicionar({id:'metabolismo-incomum-acao',nome:'Metabolismo Incomum',categoria:'acao',descricao:'Ao rolar iniciativa, recupere todo o Foco e 1d8+3 PV.',custo:[custoRecurso('Metabolismo Incomum')].filter(Boolean),automacao:{tipo:'economia',cura:'1d8+3',recuperarRecursos:['pontos-de-foco']}});
    const p=op('Pico de Adrenalina');if(p){p.custo=[{tipo:'bonus',quantidade:1},custoRecurso('Pico de Adrenalina')].filter(Boolean);p.automacao={tipo:'economia',disparada:true,pvTemporarios:2};}else adicionar({id:'pico-adrenalina',nome:'Pico de Adrenalina',categoria:'bonus',custo:[{tipo:'bonus',quantidade:1},custoRecurso('Pico de Adrenalina')].filter(Boolean),automacao:{tipo:'economia',disparada:true,pvTemporarios:2}});
  }
}
for(const [arquivo,def] of Object.entries(defs)){
  const fonte=JSON.parse(await readFile(resolve(raiz,arquivo+'.json'),'utf8')),m=fonte.metadata,acoes=m[chave(35)]??[],magias=m[chave(39)]??[],equip=m[chave(40)]??[],recs=recursos(acoes),vistos=new Set(),opcoes=[];
  for(const [categoria,itens] of [['acao',acoes],['magia',magias]])for(const x of itens){if(/^Recurso\s*\||^Combate\s*\||^Preparadas\s*\||^Sempre preparadas\s*\||^Passivas?\s*\|/i.test(x.name))continue;if(categoria==='acao'&&!/a[cç][aã]o|rea[cç][aã]o/i.test(x.name)&&!/Presa do Caçador|Assassino de Colossos|Destruidor de Hordas|Manobras|Manto de Inspiração|Defesa Paciente|Passo do Vento|Defletir Ataques|Mão de Dolo|Mão de Cura/i.test(x.name))continue;const base=semAcento(x.name).toLowerCase().replace(/^(truque|\d+º)\s*\|\s*/,'').split(' · ')[0];if(vistos.has(base))continue;vistos.add(base);opcoes.push(opcao(x,recs,opcoes.length,categoria));}
  const passivas=acoes.filter(x=>/^Passivas?\s*\|/i.test(x.name)).map(x=>({nome:x.name,descricao:x.description??''}));
  const ficha={$schema:'./ficha.schema.json',versaoFormato:1,id:def.id,nome:fonte.name,tipo:'pj',edicao:'2024',classes:[{id:def.classe,nivel:+m[chave(1)]}],especie:m[chave(4)],atributos:{for:+m[chave(17)],des:+m[chave(18)],con:+m[chave(19)],int:+m[chave(20)],sab:+m[chave(21)],car:+m[chave(22)]},salvaguardas:{for:+m[chave(23)],des:+m[chave(24)],con:+m[chave(25)],int:+m[chave(26)],sab:+m[chave(27)],car:+m[chave(28)]},pvMaximos:+m[chave(5)],caBase:+m[chave(7)],deslocamentosM:{andar:Number((+m[chave(8)]*.3).toFixed(1))},proficiencia:2,sentidos:m[chave(13)]??'',idiomas:m[chave(15)]??'',pericias:pericias(m[chave(14)]),resistencias:listaCampo(m[chave(31)]),imunidades:listaCampo(m[chave(30)]),vulnerabilidades:listaCampo(m[chave(32)]),recursos:recs,opcoes,equipamentos:equip,passivas,notas:[{titulo:'Fonte',descricao:'Convertida da ficha Forge '+arquivo+'.json.'}]};
  enriquecer(ficha);
  if(def.id==='nikki'){console.log('nikki preservada (ficha já configurada)',opcoes.length+' opções lidas');continue;}
  await writeFile(resolve(destino,def.id+'.json'),JSON.stringify(ficha,null,2)+'\n');console.log(def.id,opcoes.length+' opções',recs.length+' recursos');
}
