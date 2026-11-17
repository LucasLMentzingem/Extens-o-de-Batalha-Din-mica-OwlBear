import test from 'node:test';import assert from 'node:assert/strict';import {AtividadesMesa} from './site/activity-feed.mjs';
const acao=(id,atorId=id)=>({id,atorId,titulo:'Skill '+id,opcaoPublica:{nome:'Skill '+id}});
test('atividades simultâneas não se substituem; própria tem prioridade e modo anterior é restaurado',()=>{
 const f=new AtividadesMesa();f.acao(acao('a'));f.acao(acao('b'));assert.equal(f.atual('eu').id,'a');f.selecionar('b',true);
 f.acao(acao('minha'),{propria:true});assert.equal(f.atual('eu').id,'minha');f.acao(acao('c'));assert.equal(f.atual('eu').id,'minha');
 f.modo='barra';f.pausada=true;f.selecionar('b',true);assert.equal(f.atual('eu').id,'b');assert.ok(f.lista.has('minha'));
 f.concluir('minha');assert.equal(f.modo,'painel');assert.equal(f.atual('eu').id,'a');
 const g=new AtividadesMesa();g.acao(acao('minha'),{propria:true});g.concluir('minha');assert.equal(g.modo,'barra');
});
test('histórico preserva resultados, rerrolagem substitui valor e fechar pedido não apaga ataque composto',()=>{
 const f=new AtividadesMesa();f.acao(acao('a'));
 for(const [pedido,total] of [['ataque',19],['dano',6]]){f.dado({atividadeId:'a',pedido,tipo:'resultado',resultado:{total}});f.fecharDado(pedido);}
 f.dado({atividadeId:'a',pedido:'dano',tipo:'resultado',resultado:{total:9}});f.fecharDado('dano');assert.equal(f.lista.get('a').rolagens.length,2);assert.equal(f.lista.get('a').rolagens[1].resultado.total,9);assert.equal(f.lista.get('a').ativa,true);
 f.concluir('a');assert.equal(f.lista.get('a').ativa,false);assert.equal(f.lista.get('a').rolagens[0].resultado.total,19);
});
test('pedido dirigido ao jogador tem prioridade; observação não toma o lugar de uma ação própria',()=>{
 const f=new AtividadesMesa();f.acao(acao('minha'),{propria:true});f.dado({atividadeId:'salva',pedido:'p',tipo:'ajuste',destino:'eu'});
 assert.equal(f.atual('eu').id,'salva');assert.equal(f.obrigatoria('eu'),true);assert.equal(f.atual('outro').id,'minha');
 f.fecharDado('p');assert.equal(f.atual('eu').id,'minha');
});
test('limite do histórico não remove atividades em andamento e recentes aparecem primeiro',()=>{
 const f=new AtividadesMesa({limite:30});f.acao(acao('ativa'));for(let i=0;i<100;i++){f.acao(acao('fim'+i));f.concluir('fim'+i);}
 assert.equal(f.lista.size,31);assert.equal(f.lista.get('ativa').ativa,true);assert.equal(f.vista()[0].id,'fim99');
});
