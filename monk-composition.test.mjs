import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {novo,adicionar,aplicar,opcoesDisponiveis,planoCustoOpcao,validar,atualizarMagias} from './site/engine.mjs';
import {compactarFicha} from './site/catalog.mjs';
const player={id:'p',role:'PLAYER'};
async function mesa(){let s=novo();const a=adicionar(s,JSON.parse(await fs.readFile('site/fichas/loteria.json','utf8'))),b=adicionar(s,JSON.parse(await fs.readFile('site/fichas/soldado.json','utf8'))),c=adicionar(s,JSON.parse(await fs.readFile('site/fichas/soldado.json','utf8')));a.dono='p';s.fase='turnos';s.rodada=1;s.vez=0;s.ordem=[a.id,b.id,c.id];for(const p of [a,b,c]){p.acao=1;p.bonus=1;p.x=p===a?0:1;p.y=0;p.pv=200;p.ficha.pvMaximos=200;}return {s,a,b,c};}
const golpe=a=>opcoesDisponiveis(a).find(o=>o.composicao?.custosPorModo);
const torrente=a=>opcoesDisponiveis(a).find(o=>/^Torrente/.test(o.nome));
const rolar=async(formula,meta)=>({total:meta.tipo==='ataque'?22:4,natural:meta.tipo==='ataque'?17:undefined,formula,recursosAtivos:[]});
test('golpe unificado: uma opção, bônus por padrão, uma instância por recurso e dois alvos',async()=>{
 const {s,a,b,c}=await mesa(),g=golpe(a);assert.ok(g);assert.equal(opcoesDisponiveis(a).filter(o=>/^Soco \+/.test(o.nome)).length,0);assert.equal(g.composicao.modoPadrao,'soco-bonus');assert.deepEqual(planoCustoOpcao(a,g).custos,[{tipo:'bonus',quantidade:1}]);
 const next=await aplicar(s,{tipo:'usar',ator:a.id,opcao:g.id,rev:s.rev,composicao:[{modoId:'soco-bonus',alvoId:b.id},{modoId:'soco-acao',alvoId:c.id}]},player,rolar);
 assert.equal(next.atores[0].acao,0);assert.equal(next.atores[0].bonus,0);assert.equal(next.atores[1].pv,196);assert.equal(next.atores[2].pv,196);
 const antes=JSON.stringify(s);await assert.rejects(()=>aplicar(s,{tipo:'usar',ator:a.id,opcao:g.id,rev:s.rev,composicao:[{modoId:'soco-bonus',alvoId:b.id},{modoId:'soco-bonus',alvoId:b.id}]},player,rolar),/limite/);assert.equal(JSON.stringify(s),antes);
});
test('Torrente aceita terceiro soco com ação e não cobra bônus nem Foco extra por ele',async()=>{
 const {s,a,b,c}=await mesa(),t=torrente(a),foco=a.rec['pontos-de-foco'];assert.ok(t.composicao.modos.every(m=>!m.preparar?.length));
 const plano=[{modoId:'soco-normal',alvoId:b.id},{modoId:'soco-normal',alvoId:c.id},{modoId:'soco-extra-acao',alvoId:b.id}];
 assert.deepEqual(planoCustoOpcao(a,t,'automatico',plano).custos,[{tipo:'bonus',quantidade:1},{tipo:'recurso',id:'pontos-de-foco',quantidade:1},{tipo:'acao',quantidade:1}]);
 const next=await aplicar(s,{tipo:'usar',ator:a.id,opcao:t.id,rev:s.rev,composicao:plano},player,rolar);assert.equal(next.atores[0].acao,0);assert.equal(next.atores[0].bonus,0);assert.equal(next.atores[0].rec['pontos-de-foco'],foco-1);assert.equal(next.atores[0].eventosTurno.ataques.length,3);
 a.acao=0;let pedidos=0;await assert.rejects(()=>aplicar(s,{tipo:'usar',ator:a.id,opcao:t.id,rev:s.rev,composicao:plano},player,async()=>{pedidos++;return 4;}),/Saldo insuficiente/);assert.equal(pedidos,0);
 const comum=await aplicar(s,{tipo:'usar',ator:a.id,opcao:t.id,rev:s.rev,composicao:plano.slice(0,2)},player,rolar);assert.equal(comum.atores[0].eventosTurno.ataques.length,2);
});
test('cura só substitui os dois golpes da Torrente; terceiro exige ação',async()=>{
 const {s,a,b}=await mesa(),t=torrente(a);a.pv=10;
 const next=await aplicar(s,{tipo:'usar',ator:a.id,opcao:t.id,rev:s.rev,composicao:[{modoId:'mao-de-cura',alvoId:a.id},{modoId:'soco-normal',alvoId:b.id},{modoId:'soco-extra-acao',alvoId:b.id}]},player,rolar);assert.equal(next.atores[0].pv,14);assert.equal(next.atores[0].eventosTurno.ataques.length,2);
 await assert.rejects(()=>aplicar(s,{tipo:'usar',ator:a.id,opcao:t.id,rev:s.rev,composicao:[{modoId:'soco-normal',alvoId:b.id},{modoId:'soco-normal',alvoId:b.id},{modoId:'mao-de-cura',alvoId:a.id}]},player,rolar),/golpes iniciais/);
});
test('normalização repetida e reabertura não recriam botão Soco ou modos de Mão de Dolo',async()=>{
 const {a}=await mesa();let f=a.ficha;for(let i=0;i<3;i++){atualizarMagias(f);f=validar(compactarFicha(f));}
 const ator={...a,ficha:f};assert.equal(opcoesDisponiveis(ator).filter(o=>o.composicao?.custosPorModo).length,1);assert.ok(opcoesDisponiveis(ator).filter(o=>o.composicao).every(o=>!o.composicao.modos.some(m=>/dolo/i.test(m.nome))));
});
