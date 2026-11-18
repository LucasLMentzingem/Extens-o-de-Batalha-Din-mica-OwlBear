import test from 'node:test';import assert from 'node:assert/strict';import {AtividadesMesa} from './site/activity-feed.mjs';
const acao=(id)=>({id,atorId:id,titulo:id,rolagem:true});
test('gaveta fechada acompanha terceiros; própria tem prioridade apenas na ordem',()=>{
 const f=new AtividadesMesa();f.acao(acao('p2'));assert.equal(f.atual('gm').id,'p2');
 f.acao(acao('minha'),{propria:true});f.acao(acao('p3'));assert.equal(f.atual('gm').id,'minha');
 f.concluir('minha');assert.equal(f.atual('gm').id,'p3');assert.equal(f.modo,'painel');
});
test('fechar a gaveta atende pedidos em fila e volta à jogada atual',()=>{
 const f=new AtividadesMesa({modo:'barra'});f.acao(acao('origem'));
 for(const id of ['s1','s2'])f.dado({atividadeId:id,atividadeOrigemId:'origem',atorId:id,pedido:id,tipo:'ajuste',destino:'gm',meta:{tipo:'salvaguarda'}});
 f.selecionar('origem');f.fecharVisual();assert.equal(f.atual('gm').id,'s1');f.fecharDado('s1');assert.equal(f.atual('gm').id,'s2');f.fecharDado('s2');assert.equal(f.atual('gm').id,'origem');
 assert.equal(f.vista().length,3);assert.equal(f.lista.get('s1').atorId,'s1');
});
test('salvaguarda filha destrava a própria ação sem apagar a origem',()=>{
 const f=new AtividadesMesa();f.acao(acao('minha'),{propria:true});f.dado({atividadeId:'salva',atividadeOrigemId:'minha',atorId:'npc1',pedido:'salva',tipo:'ajuste',destino:'gm'});
 assert.equal(f.atual('gm').atorId,'npc1');f.fecharDado('salva');assert.equal(f.atual('gm').id,'minha');assert.equal(f.vista().length,2);
});
test('consulta manual recebe novidades sem perder o foco; voltar ao vivo seleciona andamento atual',()=>{
 const f=new AtividadesMesa({modo:'barra'});f.acao(acao('antiga'));f.concluir('antiga');f.selecionar('antiga');f.acao(acao('nova'));assert.equal(f.atual('eu').id,'antiga');f.fecharVisual();assert.equal(f.atual('eu').id,'nova');
});
test('limpeza limita rascunhos e IDs descartados sem apagar execução viva',()=>{
 let agora=0;const f=new AtividadesMesa({agora:()=>agora});f.acao(acao('viva'));
 for(let i=0;i<1000;i++){f.acao({id:'r'+i});f.concluir('r'+i,'Cancelada');}
 assert.ok(f.descartadas.size<=128);f.acao({id:'abandonado'});agora=16*60*1000;f.aparar();assert.ok(!f.lista.has('abandonado'));assert.ok(f.lista.has('viva'));
});
