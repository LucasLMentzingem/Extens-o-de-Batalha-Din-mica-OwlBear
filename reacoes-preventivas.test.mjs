import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {novo,adicionar,validar,aplicar,opcoesDisponiveis,caAtual} from './site/engine.mjs';
import {catalogoCentral,resolverCatalogoLoja} from './site/catalog.mjs';

// Escudo Arcano e Veste do Último Fôlego como reação ao ser atingido, inclusive nos ataques da Gaveta de Composição.
const gm={id:'m',role:'GM'},jogador={id:'p',role:'PLAYER'},defensorJ={id:'q',role:'PLAYER'};
const ficha=async id=>validar(JSON.parse(await fs.readFile('site/fichas/'+id+'.json','utf8')));
const loja=catalogoCentral().lojas.map(resolverCatalogoLoja).find(l=>l.itens.some(i=>i.nome==='Veste do Último Fôlego'));
function vestir(df){
  const veste=structuredClone(loja.itens.find(i=>i.nome==='Veste do Último Fôlego'));
  for(const i of df.ficha.inventario.itens)if(i.equipadoSlot==='vestes')i.equipado=false;
  Object.assign(veste,{id:'veste-t',quantidade:1,equipado:true,equipadoSlot:'vestes'});df.ficha.inventario.itens.push(veste);
}
async function mesa(atacante,defensor,{veste=false}={}){
  let s=novo();const at=adicionar(s,await ficha(atacante)),df=adicionar(s,await ficha(defensor),'Alvo');
  at.dono='p';if(df.ficha.tipo==='pj')df.dono='q';at.x=0;at.y=0;df.x=1.5;df.y=0;if(veste)vestir(df);
  df.pv=200;df.ficha.pvMaximos=200;
  s.fase='turnos';s.rodada=1;s.ordem=[at.id,df.id];s.vez=0;for(const p of s.atores){p.acao=1;p.bonus=1;p.reacao=1;p.metros=9;p.init=10;}
  return {s,at,df};
}
// ataque: total fixo; dano: 7 por dado-base; redução da Veste: 4
const dados=(totalAtaque,log=[])=>async(f,meta={})=>{log.push(meta);
  if(meta.tipo==='ataque')return {total:totalAtaque,natural:Math.min(19,Math.max(2,totalAtaque-5)),formula:f};
  if(meta.tipo==='reducao')return {total:4,formula:f};
  return {total:7,formula:f,resultados:Array.isArray(f)?f.map(()=>({total:7})):undefined,recursosAtivos:(meta.adicionais??[]).filter(x=>x.automatico).map(x=>x.id)};};
const gaveta=(at,df,nome)=>{const o=opcoesDisponiveis(at).find(o=>o.composicao&&nome.test(o.nome));assert.ok(o,'opção com Gaveta: '+nome);return {o,composicao:Array.from({length:o.composicao.quantidadeMinima},()=>({modoId:o.composicao.modoPadrao,alvoId:df.id}))};};

test('Veste do Último Fôlego: ataque pela Gaveta pausa antes do dano e aplica a redução',async()=>{
  let {s,at,df}=await mesa('zurich','nikki',{veste:true});const {o,composicao}=gaveta(at,df,/Cimitarra/);
  s=await aplicar(s,{tipo:'usar',ator:at.id,opcao:o.id,composicao,rev:s.rev},jogador,dados(30));
  assert.equal(s.reacaoPendente?.gatilho,'ser_atingido');assert.equal(s.atores[1].pv,200,'dano ainda não aplicado');
  const veste=s.atores[1].ficha.opcoes.find(x=>x.origemItem==='veste-t');assert.ok(s.reacaoPendente.opcoes.includes(veste.id));
  const log=[];
  s=await aplicar(s,{tipo:'resolverReacao',ator:df.id,opcao:veste.id,rev:s.rev},defensorJ,dados(30,log));
  assert.equal(s.reacaoPendente,undefined);assert.equal(s.continuacaoComposicao,undefined);
  const dano=200-s.atores[1].pv;assert.ok(dano>0&&dano<=7+3,'dano aplicado depois da redução: '+dano);
  assert.equal(s.atores[1].reacao,0);assert.ok(s.historico.some(h=>/reduziu 4/.test(h)),'histórico mostra a redução');
  assert.ok(log.filter(m=>m.tipo==='dano').every(m=>m.destinoId==='p'),'dano do atacante é rolado por quem controla o atacante');
  assert.equal(s.atores[0].acao,0,'a ação foi cobrada uma única vez');
});

test('sem usar a reação, a Gaveta continua com o dano inteiro',async()=>{
  let {s,at,df}=await mesa('zurich','nikki',{veste:true});const {o,composicao}=gaveta(at,df,/Cimitarra/);
  s=await aplicar(s,{tipo:'usar',ator:at.id,opcao:o.id,composicao,rev:s.rev},jogador,dados(30));
  s=await aplicar(s,{tipo:'resolverReacao',ator:df.id,opcao:null,rev:s.rev},defensorJ,dados(30));
  assert.ok(s.atores[1].pv<200);assert.equal(s.atores[1].reacao,1,'reação não gasta');
});

test('Escudo Arcano do Mago do Reino: reação automática, +5 na CA e o acerto da Gaveta vira erro',async()=>{
  let {s,at,df}=await mesa('zurich','reino-mago-3');
  const escudo=df.ficha.opcoes.find(o=>/escudo arcano/i.test(o.nome));
  assert.equal(escudo.gatilho,'ser_atingido');assert.equal(escudo.automacao.tipo,'escudo_arcano');
  const ca=caAtual(df),espacos=df.rec['espaco-1'];const {o,composicao}=gaveta(at,df,/Cimitarra/);
  s=await aplicar(s,{tipo:'usar',ator:at.id,opcao:o.id,composicao,rev:s.rev},jogador,dados(ca+2));
  assert.ok(s.reacaoPendente?.opcoes.includes(escudo.id),'Escudo Arcano oferecido');
  s=await aplicar(s,{tipo:'resolverReacao',ator:df.id,opcao:escudo.id,rev:s.rev},gm,dados(ca+2));
  assert.equal(s.atores[1].pv,200,'o ataque errou');assert.equal(caAtual(s.atores[1]),ca+5);
  assert.equal(s.atores[1].rec['espaco-1'],espacos-1);assert.equal(s.atores[1].reacao,0);
  assert.ok(s.historico.some(h=>/Escudo Arcano fez/.test(h)));
});

test('Escudo Arcano não salva quando o ataque ainda supera a nova CA, nem contra crítico',async()=>{
  let {s,at,df}=await mesa('zurich','reino-mago-3');const escudo=df.ficha.opcoes.find(o=>/escudo arcano/i.test(o.nome)),ca=caAtual(df);
  const {o,composicao}=gaveta(at,df,/Cimitarra/);
  s=await aplicar(s,{tipo:'usar',ator:at.id,opcao:o.id,composicao,rev:s.rev},jogador,dados(ca+10));
  s=await aplicar(s,{tipo:'resolverReacao',ator:df.id,opcao:escudo.id,rev:s.rev},gm,dados(ca+10));
  assert.ok(s.atores[1].pv<200,'acertou mesmo com +5');
});

test('Escudo Arcano também vale no ataque simples',async()=>{
  let {s,at,df}=await mesa('skimi','reino-mago-3');const escudo=df.ficha.opcoes.find(o=>/escudo arcano/i.test(o.nome)),ca=caAtual(df);
  const adaga=opcoesDisponiveis(at).find(o=>o.automacao?.tipo==='ataque'&&/Adaga \+/.test(o.nome)&&!o.automacao.arremesso);
  s=await aplicar(s,{tipo:'usar',ator:at.id,opcao:adaga.id,alvo:df.id,rev:s.rev},jogador,dados(ca+1));
  assert.ok(s.reacaoPendente?.opcoes.includes(escudo.id));
  s=await aplicar(s,{tipo:'resolverReacao',ator:df.id,opcao:escudo.id,rev:s.rev},gm,dados(ca+1));
  assert.equal(s.atores[1].pv,200);
});

test('Gaveta de dois golpes: pausa em cada acerto e continua do golpe certo',async()=>{
  let {s,at,df}=await mesa('loteria','nikki',{veste:true});
  const torrente=opcoesDisponiveis(at).find(o=>/^Torrente de Golpes/.test(o.nome)&&o.composicao);assert.ok(torrente);
  at.eventosTurno={ataques:[{opcao:'x',alvo:df.id,tags:['arma'],acertou:true}],acertos:[]};
  const composicao=[{modoId:torrente.composicao.modoPadrao,alvoId:df.id},{modoId:torrente.composicao.modoPadrao,alvoId:df.id}];
  s=await aplicar(s,{tipo:'usar',ator:at.id,opcao:torrente.id,composicao,rev:s.rev},jogador,dados(30));
  assert.equal(s.reacaoPendente?.gatilho,'ser_atingido');assert.equal(s.atores[1].pv,200);
  s=await aplicar(s,{tipo:'resolverReacao',ator:df.id,opcao:null,rev:s.rev},defensorJ,dados(30));
  const depoisPrimeiro=s.atores[1].pv;assert.ok(depoisPrimeiro<200,'primeiro golpe causou dano');
  assert.equal(s.reacaoPendente?.gatilho,'ser_atingido','segundo golpe também pausa');
  const veste=s.atores[1].ficha.opcoes.find(x=>x.origemItem==='veste-t');
  s=await aplicar(s,{tipo:'resolverReacao',ator:df.id,opcao:veste.id,rev:s.rev},defensorJ,dados(30));
  assert.ok(s.atores[1].pv<depoisPrimeiro,'segundo golpe causou dano reduzido');assert.equal(s.reacaoPendente,undefined);
  assert.equal(s.atores[0].bonus,0,'Torrente cobrada uma vez');
});

test('jogador não consegue forjar uma continuação de Gaveta',async()=>{
  let {s,at,df}=await mesa('zurich','nikki');const {o,composicao}=gaveta(at,df,/Cimitarra/);
  await assert.rejects(aplicar(s,{tipo:'usar',ator:at.id,opcao:o.id,composicao,rev:s.rev,retomadaId:'falsa'},jogador,dados(30)),/pausada inválida/);
});
