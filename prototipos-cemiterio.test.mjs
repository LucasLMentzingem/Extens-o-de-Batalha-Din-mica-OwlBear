import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {novo,adicionar,validar,avaliarFormula,caAtual,pvMaximosAtuais,deslocamentoMaximo,curarAtor,opcoesDisponiveis,restricoesAtivas,encerrarConcentracao,publico} from './site/engine.mjs';
import {aplicar} from './test-helpers/acao-confirmada.mjs';
import {compactarEstado} from './site/catalog.mjs';
import {defesasDanoDoAtor,resolverDano} from './site/damage.mjs';
const gm={id:'m',role:'GM'},fonte=n=>JSON.parse(fs.readFileSync(new URL('./conteudo/aventura-no-cemiterio/'+n+'.json',import.meta.url)));
const fixo=(f,m={})=>Array.isArray(f)?{resultados:f.map(x=>avaliarFormula(x,l=>l===20?12:4))}:avaliarFormula(f,l=>l===20?12:4);
const comando=(s,t,extra={},rolar=fixo,u=gm)=>aplicar(s,{tipo:t,rev:s.rev,confirmado:true,...extra},u,rolar);
const usar=(s,a,opcao,extra={},rolar=fixo)=>comando(s,'usar',{ator:a.id,opcao,...extra},rolar);
function mesa(n='drow-necromante-6',alvo='irineu-ladino-3'){
  const s=novo(),a=adicionar(s,validar(fonte(n))),p=adicionar(s,validar(fonte(alvo)));a.x=p.x=0;a.y=0;p.y=1;return {s,a,p};
}
function turnos(s,a,p){s.fase='turnos';s.rodada=1;s.vez=0;s.ordem=[a.id,p.id];a.init=20;p.init=10;}
const ator=(s,a)=>s.atores.find(x=>x.id===a.id);
test('os dois personagens têm todas as opções com automação e marca explícita de protótipo',()=>{
  for(const n of ['drow-necromante-6','padre-quevedo']){
    const f=validar(fonte(n));for(const o of f.opcoes){assert.ok(o.automacao,o.id);assert.equal(o.prototipo,true,o.id);assert.notEqual(o.resolucaoAssistida,true,o.id);}
  }
});
test('Animar Mortos transforma imediatamente NPC a PV negativo, cobra uma vez e preserva original/loot/token',async()=>{
  const {s,a,p}=mesa();p.pv=-3;p.estadoVida='morto';p.token='corpo';const ids=p.ficha.inventario.itens.map(i=>i.id);
  let n=await usar(s,a,'animar-mortos',{alvo:p.id});assert.equal(ator(n,a).rec['espaco-3'],2);assert.ok(!ator(n,a).conjuracaoLonga);assert.ok(!ator(n,a).concentracaoAtiva);
  const z=ator(n,p);assert.equal(z.ficha.id,'cemiterio-zumbi-reanimado');assert.equal(z.pv,15);assert.equal(z.token,'corpo');assert.deepEqual(z.ficha.inventario.itens.map(i=>i.id),ids);assert.equal(z.sobreposicaoFicha.estadoOriginal.pv,-3);assert.equal(s.atores[1].pv,-3);
  n=await comando(n,'avancarTempo',{passo:'1min'});assert.equal(ator(n,a).rec['espaco-3'],2);
});

test('Animar Mortos gera Zumbigoblin no mesmo comando e conserva a sobreposição após recarga',async()=>{
  const {s,a,p}=mesa('drow-necromante-6','goblin-1');p.pv=0;p.estadoVida='morto';
  let n=await usar(s,a,'animar-mortos',{alvo:p.id});assert.equal(ator(n,p).ficha.id,'cemiterio-zumbigoblin');n=JSON.parse(JSON.stringify(compactarEstado(n)));for(const x of n.atores)x.ficha=validar(x.ficha);
  assert.equal(ator(n,p).ficha.id,'cemiterio-zumbigoblin');assert.equal(ator(n,a).rec['espaco-3'],2);assert.ok(!JSON.stringify(publico(n)).includes('fichaOriginal'));
});

test('alvos vivos, feras, PJs inconscientes, cadáver grande e espaço vazio são rejeitados sem mutação',async()=>{
  for(const modo of ['vivo','fera','pj','grande','espaco','longe']){
    const {s,a,p}=mesa();p.pv=0;p.estadoVida='morto';
    if(modo==='vivo')p.pv=1;if(modo==='fera')p.ficha.tipoCriatura='fera';if(modo==='pj'){p.ficha.tipo='pj';p.estadoVida='inconsciente';}if(modo==='grande')p.ficha.tamanho='grande';if(modo==='espaco')a.rec['espaco-3']=0;if(modo==='longe')p.x=4;
    const antes=JSON.stringify(s);await assert.rejects(()=>usar(s,a,'animar-mortos',{alvo:p.id}));assert.equal(JSON.stringify(s),antes);
  }
});
test('Animar Mortos imediato preserva outra concentração e não cria conjuração pendente',async()=>{
  const {s,a,p}=mesa();p.pv=0;p.estadoVida='morto';a.concentracaoAtiva={id:'outra',opcao:'outra',nome:'Outra magia'};a.efeitosAtivos=[{id:'outra',nome:'Outra magia',concentracaoId:'outra'}];
  const n=await usar(s,a,'animar-mortos',{alvo:p.id});assert.equal(ator(n,a).concentracaoAtiva.id,'outra');assert.ok(ator(n,a).efeitosAtivos.some(e=>e.id==='outra'));assert.ok(!ator(n,a).conjuracaoLonga);assert.ok(ator(n,p).sobreposicaoFicha);
});

test('Animar Mortos em combate transforma no próprio uso e consome somente uma ação e um espaço',async()=>{
  const {s,a,p}=mesa('drow-necromante-6','goblin-1');p.pv=0;p.estadoVida='morto';turnos(s,a,p);
  const n=await usar(s,a,'animar-mortos',{alvo:p.id});assert.equal(ator(n,a).acao,0);assert.equal(ator(n,a).bonus,1);assert.equal(ator(n,a).reacao,1);assert.equal(ator(n,a).rec['espaco-3'],2);assert.ok(ator(n,p).sobreposicaoFicha);assert.equal(ator(n,p).acao,0);assert.equal(n.vez,0);assert.equal(n.rodada,1);
  const antes=JSON.stringify(n);await assert.rejects(()=>usar(n,a,'animar-mortos',{alvo:p.id}));assert.equal(JSON.stringify(n),antes);
});

test('conjuração antiga de Animar Mortos é descartada sem custo extra e permite uso imediato',async()=>{
  const {s,a,p}=mesa();p.pv=0;p.estadoVida='morto';const o=structuredClone(a.ficha.opcoes.find(o=>o.id==='animar-mortos'));o.automacao.tempoSegundos=60;
  a.conjuracaoLonga={opcao:o,comando:{alvo:p.id},concentracaoId:'legado',restanteSegundos:30};a.concentracaoAtiva={id:'legado',opcao:o.id,nome:o.nome};a.efeitosAtivos=[{id:'legado',nome:'Conjurando Animar Mortos',conjuracaoLonga:true,concentracaoId:'legado'}];
  const n=await usar(s,a,'animar-mortos',{alvo:p.id});assert.ok(ator(n,p).sobreposicaoFicha);assert.equal(ator(n,a).rec['espaco-3'],2);assert.ok(!ator(n,a).conjuracaoLonga);assert.ok(!ator(n,a).concentracaoAtiva);assert.ok(!ator(n,a).efeitosAtivos.length);
});

test('Raio de Gelo reduz movimento e expira no início do próximo turno da origem',async()=>{
  const {s,a,p}=mesa();turnos(s,a,p);let n=await usar(s,a,'raio-de-gelo',{alvo:p.id});assert.equal(deslocamentoMaximo(ator(n,p)),6);
  n=await comando(n,'passar',{ator:a.id});assert.equal(deslocamentoMaximo(ator(n,p)),6);n=await comando(n,'passar',{ator:p.id});assert.equal(deslocamentoMaximo(ator(n,p)),9);
});
test('Toque Arrepiante bloqueia cura até o fim do próximo turno; PV temporários não contam como cura',async()=>{
  const {s,a,p}=mesa();p.ficha.pvMaximos=100;p.pv=100;turnos(s,a,p);let n=await usar(s,a,'toque-arrepiante',{alvo:p.id});assert.equal(curarAtor(ator(n,p),50),0);
  n=await comando(n,'passar',{ator:a.id});assert.equal(curarAtor(ator(n,p),50),0);n=await comando(n,'passar',{ator:p.id});assert.equal(curarAtor(ator(n,p),50),0);
  n=await comando(n,'passar',{ator:a.id});assert.ok(curarAtor(ator(n,p),50)>0);
});
test('Raio de Doença não perde o veneno já no fim do turno de conjuração',async()=>{
  const {s,a,p}=mesa();p.ficha.pvMaximos=p.pv=100;turnos(s,a,p);let n=await usar(s,a,'raio-de-doenca',{alvo:p.id});assert.ok(restricoesAtivas(ator(n,p)).desvantagemAtaques);
  n=await comando(n,'passar',{ator:a.id});assert.ok(restricoesAtivas(ator(n,p)).desvantagemAtaques);
});
test('Escudo Arcano é oferecido antes do dano, pode desfazer o acerto e não aplica debuff bloqueado',async()=>{
  const {s,a,p}=mesa('drow-necromante-6','drow-necromante-6');p.nome='Outro drow';turnos(s,a,p);
  const rolar=(f,m)=>m.tipo==='ataque'?{natural:10,total:16}:fixo(f,m);
  let n=await usar(s,a,'raio-de-doenca',{alvo:p.id},rolar);assert.equal(ator(n,p).pv,38);assert.ok(n.reacaoPendente);assert.ok(!ator(n,p).efeitosAtivos?.some(e=>e.condicao==='envenenado'));
  n=await comando(n,'resolverReacao',{ator:p.id,opcao:'escudo-arcano'});assert.equal(caAtual(ator(n,p)),17);assert.equal(ator(n,p).pv,38);assert.equal(ator(n,p).rec['espaco-1'],3);assert.equal(ator(n,p).reacao,0);assert.ok(!n.reacaoPendente);
  n=await comando(n,'passar',{ator:a.id});assert.equal(caAtual(ator(n,p)),12);
});
test('Escudo Arcano não cancela crítico; recusar reação aplica dano e efeito do acerto',async()=>{
  for(const critico of [true,false]){
    const {s,a,p}=mesa('drow-necromante-6','drow-necromante-6');p.nome='Outro';turnos(s,a,p);
    let n=await usar(s,a,'raio-de-doenca',{alvo:p.id},(f,m)=>m.tipo==='ataque'?{natural:critico?20:12,total:critico?27:19}:fixo(f,m));
    n=await comando(n,'resolverReacao',{ator:p.id,opcao:critico?'escudo-arcano':null});assert.ok(ator(n,p).pv<38);assert.ok(ator(n,p).efeitosAtivos.some(e=>e.condicao==='envenenado'));
  }
});
test('Mísseis Mágicos oferecem Escudo Arcano e bloqueiam todas as setas daquele alvo, preservando os demais',async()=>{
  const {s,a,p}=mesa('drow-necromante-6','drow-necromante-6');p.nome='Protegido';const q=adicionar(s,validar(fonte('irineu-ladino-3')));q.x=0;q.y=2;turnos(s,a,p);
  a.ficha.opcoes.push({id:'misseis-prova',nome:'Mísseis Mágicos',categoria:'magia',circuloBase:1,custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'espaco-1',quantidade:1}],selecao:{tipo:'alvos',min:3,max:3,repetirAlvo:true},automacao:{tipo:'projeteis',dano:'1d4+1',elemento:'energetico',alcanceM:18}});
  a.ficha.preparacao.semprePreparadas.push('misseis-prova');
  let n=await usar(s,a,'misseis-prova',{alvos:[p.id,p.id,q.id]});assert.ok(n.reacaoPendente);n=await comando(n,'resolverReacao',{ator:p.id,opcao:'escudo-arcano'});assert.equal(ator(n,p).pv,38);assert.equal(ator(n,q).pv,q.pv-5);
});
test('Enfraquecimento aplica FOR com desvantagem, subtrai um d8 por dano e repete CON',async()=>{
  const {s,a,p}=mesa('drow-necromante-6','padre-quevedo');turnos(s,a,p);
  let n=await usar(s,a,'raio-do-enfraquecimento',{alvo:p.id},(f,m)=>m.tipo==='salvaguarda'?{natural:1,total:1}:fixo(f,m));assert.ok(ator(n,p).efeitosAtivos.some(e=>e.reducaoDanoFormula));
  n=await comando(n,'passar',{ator:a.id});const formulas=[];
  n=await usar(n,p,'chama-sagrada',{alvo:a.id},(f,m)=>{formulas.push(String(f));return fixo(f,m);});assert.ok(formulas.some(f=>f==='2d8-1d8'));
  n=await comando(n,'passar',{ator:p.id},(f,m)=>m.tipo==='salvaguarda'?{natural:20,total:25}:fixo(f,m));assert.ok(!ator(n,p).efeitosAtivos.some(e=>e.reducaoDanoFormula));
});
test('Enfraquecimento no sucesso afeta só o próximo ataque e termina a concentração anterior',async()=>{
  const {s,a,p}=mesa();let n=await usar(s,a,'raio-do-enfraquecimento',{alvo:p.id},()=>({natural:20,total:25}));assert.ok(ator(n,p).efeitosAtivos.some(e=>e.restricoes?.consumirAoAtacar));
  n=await comando(n,'avancarTempo',{passo:'1t'});assert.ok(!ator(n,p).efeitosAtivos.length);
});
test('Toque Vampírico cura metade após resistência, concede repetição sem espaço e some sem concentração',async()=>{
  const {s,a,p}=mesa();a.pv=10;p.ficha.pvMaximos=p.pv=100;p.ficha.resistencias=['necrotico'];
  let n=await usar(s,a,'toque-vampirico',{alvo:p.id});assert.equal(ator(n,p).pv,94);assert.equal(ator(n,a).pv,13);assert.equal(ator(n,a).rec['espaco-3'],2);
  const repetir=opcoesDisponiveis(ator(n,a)).find(o=>o.nome==='Toque Vampírico · repetir');assert.ok(repetir);
  n=await usar(n,a,repetir.id,{alvo:p.id});assert.equal(ator(n,a).rec['espaco-3'],2);assert.equal(ator(n,a).pv,16);
  n=await comando(n,'encerrarConcentracao',{ator:a.id});assert.ok(!opcoesDisponiveis(ator(n,a)).some(o=>o.nome==='Toque Vampírico · repetir'));
});
test('vampírico não cura contra imunidade e considera dano absorvido por PV temporários',async()=>{
  for(const imune of [true,false]){const {s,a,p}=mesa();a.pv=10;p.pvTemporarios=50;if(imune)p.ficha.imunidades=['necrotico'];const n=await usar(s,a,'toque-vampirico',{alvo:p.id});assert.equal(ator(n,a).pv,imune?10:16);assert.equal(ator(n,p).pv,p.pv);}
});
test('Auxílio aplica máximos e atuais a vários alvos, escala, não acumula e expira em 8 horas',async()=>{
  const {s,a,p}=mesa('padre-quevedo');p.pv=1;let n=await usar(s,a,'auxilio',{alvos:[a.id,p.id],circuloUsado:3});assert.equal(pvMaximosAtuais(ator(n,p)),p.ficha.pvMaximos+10);assert.equal(ator(n,p).pv,11);
  n=await usar(n,a,'auxilio',{alvos:[p.id],circuloUsado:2});assert.equal(pvMaximosAtuais(ator(n,p)),p.ficha.pvMaximos+10);assert.equal(ator(n,p).pv,11);
  // O avanço do relógio usa passos de dez minutos.
  for(let i=0;i<48;i++)n=await comando(n,'avancarTempo',{passo:'10min'});assert.equal(pvMaximosAtuais(ator(n,p)),p.ficha.pvMaximos);assert.equal(ator(n,p).pv,1);
});
test('Restauração remove só a condição escolhida e não cobra quando ausente',async()=>{
  const {s,a,p}=mesa('padre-quevedo');p.efeitosAtivos=[{id:'p',nome:'Veneno',condicao:'envenenado'},{id:'c',nome:'Cego',condicao:'cego'}];
  let n=await usar(s,a,'restauracao',{alvo:p.id,parametros:{condicao:'envenenado'}});assert.deepEqual(ator(n,p).efeitosAtivos.map(e=>e.condicao),['cego']);const antes=JSON.stringify(n);await assert.rejects(()=>usar(n,a,'restauracao',{alvo:p.id,parametros:{condicao:'surdo'}}));assert.equal(JSON.stringify(n),antes);
});
test('Palavra em Massa cura seis criaturas e aplica Discípulo uma vez por alvo',async()=>{
  const {s,a,p}=mesa('padre-quevedo');a.pv=1;p.pv=1;const n=await usar(s,a,'palavra-massa',{alvos:[a.id,p.id]});assert.equal(ator(n,a).pv,18);assert.equal(ator(n,p).pv,18);assert.equal(ator(n,a).rec['espaco-3'],1);
});
test('Preservar distribui 25 PV por prioridade, respeita metade e não perde saldo em cura bloqueada',async()=>{
  const {s,a,p}=mesa('padre-quevedo');a.pv=1;p.pv=1;p.efeitosAtivos=[{id:'bloq',nome:'Bloqueio',bloqueiaCura:true}];
  const n=await usar(s,a,'preservar',{alvos:[p.id,a.id]});assert.equal(ator(n,p).pv,1);assert.equal(ator(n,a).pv,19);assert.equal(ator(n,a).rec['canalizar-divindade'],1);
});
test('Prece demora dez minutos e sua restrição de NPC não é removida pelo descanso global',async()=>{
  const {s,a,p}=mesa('padre-quevedo','padre-quevedo');p.nome='Outro padre';p.pv=1;p.rec['canalizar-divindade']=0;let n=await usar(s,a,'prece',{alvos:[p.id]});assert.equal(ator(n,a).rec['espaco-2'],3);assert.equal(ator(n,p).pv,1);
  n=await comando(n,'avancarTempo',{passo:'1min'});assert.equal(ator(n,p).pv,1);for(let i=0;i<9;i++)n=await comando(n,'avancarTempo',{passo:'1min'});
  assert.equal(ator(n,p).pv,13);assert.equal(ator(n,p).rec['canalizar-divindade'],1);assert.equal(ator(n,a).rec['espaco-2'],2);await assert.rejects(()=>usar(n,a,'prece',{alvos:[p.id]}));
  n=await comando(n,'descanso',{periodo:'longo',atores:[p.id]});assert.ok(ator(n,p).efeitosAtivos.some(e=>e.preceRecebida),'descanso global não altera NPC');
});
test('Revivificar recusa sem diamante ou confirmação; consome diamante e volta com 1 PV',async()=>{
  const {s,a,p}=mesa('padre-quevedo');p.pv=0;p.estadoVida='morto';const args={alvo:p.id,parametros:{morteRecente:'sim'}};await assert.rejects(()=>usar(s,a,'revivificar',args),/diamante/);
  a.ficha.inventario.itens.push({id:'diamante-prova',nome:'Diamante',quantidade:1,componenteMagico:'diamante',valorPo:300});await assert.rejects(()=>usar(s,a,'revivificar',{alvo:p.id}));
  const n=await usar(s,a,'revivificar',args);assert.equal(ator(n,p).pv,1);assert.equal(ator(n,p).estadoVida,'consciente');assert.ok(!ator(n,a).ficha.inventario.itens.some(i=>i.id==='diamante-prova'));assert.equal(ator(n,a).rec['espaco-3'],1);
});
test('Acalmar suprime sem apagar medo/encanto; fim da concentração restaura a condição',async()=>{
  const {s,a,p}=mesa('padre-quevedo');p.efeitosAtivos=[{id:'medo',nome:'Medo',condicao:'amedrontado'}];let n=await usar(s,a,'acalmar',{alvos:[p.id]},()=>({total:1,natural:1}));assert.ok(!restricoesAtivas(ator(n,p)).desvantagemAtaques);assert.ok(ator(n,p).efeitosAtivos.some(e=>e.id==='medo'));
  n=await comando(n,'encerrarConcentracao',{ator:a.id});assert.ok(restricoesAtivas(ator(n,p)).desvantagemAtaques);
});
test('Acalmar rejeita não humanoides e grupos fora da área sem custo',async()=>{
  const {s,a,p}=mesa('padre-quevedo');p.ficha.tipoCriatura='fera';await assert.rejects(()=>usar(s,a,'acalmar',{alvos:[p.id]}));p.ficha.tipoCriatura='humanoide';p.x=-9;const q=adicionar(s,validar(fonte('irineu-ladino-3')));q.x=9;q.y=0;await assert.rejects(()=>usar(s,a,'acalmar',{alvos:[p.id,q.id]}));
});
test('Santuário impede ataque por falha em SAB e termina quando protegido conjura',async()=>{
  const {s,a,p}=mesa('padre-quevedo','drow-necromante-6');let n=await usar(s,a,'santuario',{alvo:a.id});
  n=await usar(n,p,'raio-de-gelo',{alvo:a.id},(f,m)=>m.titulo?.startsWith('Santuário')?{total:1,natural:1}:fixo(f,m));assert.equal(ator(n,a).pv,38);
  n=await usar(n,a,'curar',{alvo:a.id});assert.ok(!ator(n,a).efeitosAtivos.some(e=>e.santuarioCD));
});
test('Proteção exige componente comum e não consome a água da missão',async()=>{
  const {s,a,p}=mesa('padre-quevedo');const original=a.ficha.inventario.itens.map(i=>i.id);await assert.rejects(()=>usar(s,a,'protecao',{alvo:p.id}));assert.deepEqual(a.ficha.inventario.itens.map(i=>i.id),original);
  a.ficha.inventario.itens.push({id:'agua-comum',nome:'Água Benta',quantidade:1});const n=await usar(s,a,'protecao',{alvo:p.id});assert.ok(ator(n,p).efeitosAtivos.some(e=>e.protecaoTipos));assert.ok(!ator(n,a).ficha.inventario.itens.some(i=>i.id==='agua-comum'));
});
test('Dissipar remove magias baixas, testa as maiores e preserva efeitos não mágicos',async()=>{
  const {s,a,p}=mesa('padre-quevedo');p.efeitosAtivos=[{id:'baixa',nome:'Magia baixa',magia:true,circuloMagia:2},{id:'alta',nome:'Magia alta',magia:true,circuloMagia:6},{id:'mundana',nome:'Veneno',condicao:'envenenado'}];
  const n=await usar(s,a,'dissipar',{alvo:p.id},()=>({total:1,natural:1}));assert.deepEqual(ator(n,p).efeitosAtivos.map(e=>e.id),['alta','mundana']);
});
test('Remover Maldição limpa marcadores sem transformar a adaga da missão',async()=>{
  const {s,a,p}=mesa('padre-quevedo','seu-furtado-zumbi-4');p.efeitosAtivos=[{id:'mal',nome:'Maldição',maldicao:true},{id:'outro',nome:'Outro'}];const antes=p.ficha.inventario.itens.find(i=>i.catalogoRef==='item.adaga-do-ultimo-rito');const n=await usar(s,a,'remover',{alvo:p.id});assert.deepEqual(ator(n,p).efeitosAtivos.map(e=>e.id),['outro']);assert.equal(ator(n,p).ficha.inventario.itens.find(i=>i.id===antes.id).catalogoRef,antes.catalogoRef);
});
test('Expulsar/Abrasar usa uma carga, causa dano antes da condição e encerra com dano posterior',async()=>{
  const {s,a,p}=mesa('padre-quevedo','zumbi-reanimado');p.ficha.pvMaximos=p.pv=100;let n=await usar(s,a,'expulsar',{alvos:[p.id]},()=>({total:1,natural:1}));assert.equal(ator(n,a).rec['canalizar-divindade'],1);assert.equal(ator(n,p).pv,98);assert.ok(restricoesAtivas(ator(n,p)).semAcoes);
  n=await usar(n,a,'chama-sagrada',{alvo:p.id},()=>({total:1,natural:1}));assert.ok(!ator(n,p).efeitosAtivos.some(e=>e.expulsao));
});
test('Centelha dano escolhe necrótico, aplica resistência e metade no sucesso',async()=>{
  const {s,a,p}=mesa('padre-quevedo');p.ficha.resistencias=['necrotico'];const n=await usar(s,a,'centelha-dano',{alvo:p.id,parametros:{elemento:'necrotico'}});assert.equal(ator(n,p).pv,p.pv-4);assert.equal(ator(n,a).rec['canalizar-divindade'],1);
});
test('Orientação oferece d4 somente à perícia selecionada, mantém concentração e expira',async()=>{
  const {s,a,p}=mesa('padre-quevedo');let n=await usar(s,a,'orientacao',{alvo:p.id,parametros:{pericia:'Furtividade'}});const vistos=[];
  for(const chave of ['Furtividade','Arcanismo'])n=await comando(n,'teste',{ator:p.id,grupo:'pericias',chave,modo:'normal'},(f,m)=>{vistos.push(m.adicionais?.length??0);return fixo(f,m);});assert.deepEqual(vistos,[1,0]);
  n=await comando(n,'avancarTempo',{passo:'1min'});assert.ok(!ator(n,p).efeitosAtivos.length);assert.ok(!ator(n,a).concentracaoAtiva);
});
test('Luz, Taumaturgia e Detectar registram efeitos com duração sem inventar dano',async()=>{
  const {s,a,p}=mesa('padre-quevedo');let n=await usar(s,a,'luz',{alvo:p.id});assert.equal(ator(n,p).efeitosAtivos[0].iluminacao.plenaM,6);n=await usar(n,a,'taumaturgia');assert.ok(ator(n,a).efeitosAtivos.some(e=>e.vantagemPericias));n=await usar(n,a,'detectar');assert.ok(ator(n,a).efeitosAtivos.some(e=>e.detectarMagia));assert.equal(ator(n,p).pv,p.pv);
});
test('Escudo pode usar o menor espaço superior disponível e atende dois alvos de Mísseis em sequência',async()=>{
  const {s,a,p}=mesa('drow-necromante-6','drow-necromante-6');p.nome='Segundo';p.rec['espaco-1']=0;
  const q=adicionar(s,validar(fonte('drow-necromante-6')));q.nome='Terceiro';q.x=0;q.y=2;turnos(s,a,p);
  a.ficha.opcoes.push({id:'misseis-prova',nome:'Mísseis Mágicos',categoria:'magia',circuloBase:1,custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'espaco-1',quantidade:1}],selecao:{tipo:'alvos',min:3,max:3,repetirAlvo:true},automacao:{tipo:'projeteis',dano:'1d4+1',elemento:'energetico',alcanceM:18}});a.ficha.preparacao.semprePreparadas.push('misseis-prova');
  let n=await usar(s,a,'misseis-prova',{alvos:[p.id,q.id,p.id]});assert.equal(n.reacaoPendente.reator,p.id);
  n=await comando(n,'resolverReacao',{ator:p.id,opcao:'escudo-arcano'});assert.equal(ator(n,p).rec['espaco-2'],2);assert.equal(n.reacaoPendente.reator,q.id);
  n=await comando(n,'resolverReacao',{ator:q.id,opcao:null});assert.equal(ator(n,p).pv,38);assert.equal(ator(n,q).pv,33);assert.ok(!n.reacaoPendente);
});
test('Toque Vampírico aguarda reação, sem cura antecipada quando Escudo impede o acerto',async()=>{
  const {s,a,p}=mesa('drow-necromante-6','drow-necromante-6');p.nome='Segundo';a.pv=10;turnos(s,a,p);
  let n=await usar(s,a,'toque-vampirico',{alvo:p.id},(f,m)=>m.tipo==='ataque'?{natural:10,total:16}:fixo(f,m));assert.equal(ator(n,a).pv,10);assert.equal(ator(n,p).pv,38);assert.ok(n.reacaoPendente);
  n=await comando(n,'resolverReacao',{ator:p.id,opcao:'escudo-arcano'});assert.equal(ator(n,a).pv,10);assert.equal(ator(n,p).pv,38);
});
test('Enfraquecimento aplica desvantagem a testes de Atletismo e salvaguardas de FOR',async()=>{
  const {s,a,p}=mesa();let n=await usar(s,a,'raio-do-enfraquecimento',{alvo:p.id},()=>({total:1,natural:1}));const formulas=[];
  for(const [grupo,chave] of [['pericias','Atletismo'],['salvaguardas','for']])n=await comando(n,'teste',{ator:p.id,grupo,chave,modo:'normal'},(f,m)=>{formulas.push(f);return fixo(f,m);});assert.ok(formulas.every(f=>f.startsWith('2d20kl1')));
});
test('Proteção aplica desvantagem ao ataque do morto-vivo e imunidade a novo medo/encanto',async()=>{
  const {s,a,p}=mesa('padre-quevedo','drow-necromante-6');p.ficha.tipoCriatura='morto-vivo';a.ficha.inventario.itens.push({id:'agua',nome:'Água Benta',quantidade:1});let n=await usar(s,a,'protecao',{alvo:a.id});const formulas=[];
  n=await usar(n,p,'raio-de-gelo',{alvo:a.id},(f,m)=>{if(m.tipo==='ataque')formulas.push(f);return fixo(f,m);});assert.ok(formulas[0].startsWith('2d20kl1'));
  ator(n,p).ficha.opcoes.push({id:'medo-prova',nome:'Medo de prova',categoria:'acao',custo:[],automacao:{tipo:'salva',atributo:'sab',cd:15,alcanceM:18,efeitoFalha:{nome:'Medo',condicao:'amedrontado',turnos:10}}});
  n=await usar(n,p,'medo-prova',{alvo:a.id},()=>({natural:1,total:1}));assert.ok(!ator(n,a).efeitosAtivos.some(e=>e.condicao==='amedrontado'));
});
test('Prece cancela se um beneficiário sair de alcance durante a conjuração, mesmo que retorne',async()=>{
  const {s,a,p}=mesa('padre-quevedo');let n=await usar(s,a,'prece',{alvos:[p.id]});ator(n,p).x=12;
  n=await comando(n,'teste',{ator:p.id,grupo:'pericias',chave:'Arcanismo'});assert.ok(!ator(n,a).conjuracaoLonga);ator(n,p).x=0;
  n=await comando(n,'avancarTempo',{passo:'10min'});assert.equal(ator(n,a).rec['espaco-2'],3);assert.ok(!ator(n,p).efeitosAtivos?.some(e=>e.preceRecebida));
});
test('Dissipar Bênção em um beneficiário preserva os outros e a concentração',async()=>{
  const {s,a,p}=mesa('padre-quevedo');const q=adicionar(s,validar(fonte('padre-quevedo')));q.nome='Outro';q.x=0;q.y=2;
  let n=await usar(s,a,'bencao',{alvos:[a.id,p.id]});n=await usar(n,q,'dissipar',{alvo:p.id});assert.deepEqual(ator(n,a).bencao.alvos,[a.id]);assert.ok(ator(n,a).concentracaoAtiva);
});
test('ficha central antiga migra as skills identificadas, preservando preparo e recursos da ficha',()=>{
  const f=fonte('drow-necromante-6');f.concessoes.find(c=>c.id==='animar-mortos').ajustes={resolucaoAssistida:true,automacao:{tipo:'efeito'}};const v=validar(f);assert.equal(v.opcoes.find(o=>o.id==='animar-mortos').automacao.tipo,'prototipo');assert.equal(v.opcoes.find(o=>o.id==='animar-mortos').automacao.modo,'animar');assert.deepEqual(v.preparacao,f.preparacao);assert.deepEqual(v.recursos,f.recursos);assert.ok(v.vantagemSalvasContra.includes('enfeiticado'));
});
test('todos os quatro zumbis recebem radiante dobrado e somente um quarto de necrótico no motor real',async()=>{
  for(const nome of ['goblin-zumbi','zumbi-reanimado','zumbi-padrao-3','seu-furtado-zumbi-4'])for(const [elemento,dano] of [['radiante',32],['necrotico',4],['perfurante',16]]){
    const {s,a,p}=mesa('padre-quevedo',nome);p.ficha.pvMaximos=p.pv=100;
    a.ficha.opcoes.push({id:'dano-prova',nome:'Dano da prova',categoria:'acao',custo:[],automacao:{tipo:'dano_direto',dano:'16',elemento,alcanceM:18}});
    const n=await usar(s,a,'dano-prova',{alvo:p.id},()=>({total:16}));assert.equal(ator(n,p).pv,100-dano,nome+' '+elemento);
  }
});
test('resistência alta não vira imunidade nem acumula outra resistência comum; parcelas mistas ficam separadas',()=>{
  const {p}=mesa('padre-quevedo','zumbi-reanimado');p.ficha.resistencias=['necrotico'];
  const d=defesasDanoDoAtor(p),r=resolverDano({parcelas:[{valor:15,tipo:'necrotico'},{valor:5,tipo:'radiante'},{valor:7,tipo:'perfurante'},{valor:20,tipo:'veneno'}],defesas:d,alvo:{pv:100}});
  assert.deepEqual(r.parcelas.map(x=>x.final),[3,10,7,0]);assert.equal(r.danoRecebido,20);
});
test('sobreposições novas de Zumbi e Zumbigoblin recebem as mesmas defesas autorais sem alterar o corpo original',async()=>{
  for(const corpo of ['goblin-1','irineu-ladino-3']){
    const {s,a,p}=mesa('drow-necromante-6',corpo);p.pv=0;p.estadoVida='morto';let n=await usar(s,a,'animar-mortos',{alvo:p.id});n=await comando(n,'avancarTempo',{passo:'1min'});
    const z=ator(n,p),d=defesasDanoDoAtor(z),r=resolverDano({parcelas:[{valor:8,tipo:'radiante'},{valor:8,tipo:'necrotico'}],defesas:d,alvo:{pv:100}});assert.deepEqual(r.parcelas.map(x=>x.final),[16,2]);assert.ok(!z.sobreposicaoFicha.fichaOriginal.concessoes.some(c=>c.ref==='habilidade.cemiterio.defesas-cadavericas'));
  }
});
test('zumbis já importados migram defesas uma vez e conservam PV, recursos e inventário',async()=>{
  const raw=fonte('seu-furtado-zumbi-4');raw.concessoes=raw.concessoes.filter(c=>c.ref!=='habilidade.cemiterio.defesas-cadavericas');const s=novo(),z=adicionar(s,validar(raw));z.pv=17;
  let n=await comando(s,'teste',{ator:z.id,grupo:'salvaguardas',chave:'con'});n=await comando(n,'teste',{ator:z.id,grupo:'salvaguardas',chave:'con'});
  const a=ator(n,z);assert.equal(a.ficha.passivas.filter(p=>p.catalogoRef==='habilidade.cemiterio.defesas-cadavericas').length,1);assert.equal(a.pv,17);assert.deepEqual(a.rec,z.rec);assert.deepEqual(a.ficha.inventario.itens.map(i=>i.id),z.ficha.inventario.itens.map(i=>i.id));
});
test('Auxílio devolve PV atuais ao expirar/dissipar, e descanso longo termina com o máximo correto',async()=>{
  for(const modo of ['tempo','dissipar','descanso']){
    const {s,a,p}=mesa('padre-quevedo');p.pv=1;let n=await usar(s,a,'auxilio',{alvos:[p.id]});assert.equal(ator(n,p).pv,6);
    if(modo==='tempo'){ator(n,p).efeitosAtivos.find(e=>e.auxilio).duracao.restante=1;n=await comando(n,'avancarTempo',{passo:'1t'});}
    if(modo==='dissipar')n=await usar(n,a,'dissipar',{alvo:p.id});
    if(modo==='descanso'){ator(n,p).ficha.descansoNpc=true;n=await comando(n,'descanso',{periodo:'longo',atores:[p.id]});}
    assert.equal(ator(n,p).pv,modo==='descanso'?6:1);assert.equal(pvMaximosAtuais(ator(n,p)),p.ficha.pvMaximos+(modo==='descanso'?5:0));
  }
});

test('descanso longo do PJ encerra Auxílio e restaura PV ao máximo sem o bônus',async()=>{
  const {s,a}=mesa('padre-quevedo'),p=adicionar(s,JSON.parse(fs.readFileSync(new URL('./site/fichas/nikki.json',import.meta.url))));p.x=0;p.y=1;p.pv=1;p.emCombate=false;
  let n=await usar(s,a,'auxilio',{alvos:[p.id]});assert.equal(ator(n,p).pv,6);
  n=await comando(n,'descanso',{periodo:'longo',atores:[p.id]});assert.equal(ator(n,p).pv,p.ficha.pvMaximos);assert.equal(pvMaximosAtuais(ator(n,p)),p.ficha.pvMaximos);assert.ok(!ator(n,p).efeitosAtivos.some(e=>e.auxilio));
});
