import test from 'node:test';import assert from 'node:assert/strict';import {AtividadesMesa} from './site/activity-feed.mjs';
const acao=(id,atorId=id)=>({id,atorId,titulo:'Skill '+id,opcaoPublica:{nome:'Skill '+id}});

test('histórico inclui somente execuções e elimina canceladas inclusive atualizações atrasadas',()=>{
 const f=new AtividadesMesa();f.acao(acao('previa'));assert.equal(f.vista().length,0);
 f.acao({...acao('previa'),rolagem:true});assert.equal(f.vista().length,1);
 f.concluir('previa','Cancelada');assert.equal(f.lista.has('previa'),false);assert.equal(f.vista().length,0);
 f.dado({atividadeId:'previa',pedido:'atrasado',tipo:'resultado',resultado:{total:8}});f.acao(acao('previa'));assert.equal(f.vista().length,0);
 f.acao(acao('sem-dado'));f.concluir('sem-dado');assert.equal(f.vista()[0].id,'sem-dado');
 f.acao(acao('pausada'),{propria:true});f.fecharVisual();assert.ok(!f.vista().some(a=>a.id==='pausada'));f.recolherBarra();assert.equal(f.atual('eu').id,'pausada');
});
test('atividades simultâneas não se substituem; própria tem prioridade e modo anterior é restaurado',()=>{
 const f=new AtividadesMesa();f.acao(acao('a'));f.acao(acao('b'));assert.equal(f.atual('eu'),null);f.selecionar('b',true);
 f.acao(acao('minha'),{propria:true});assert.equal(f.atual('eu').id,'minha');f.acao(acao('c'));assert.equal(f.atual('eu').id,'minha');
 f.modo='barra';f.pausada=true;f.selecionar('b',true);assert.equal(f.atual('eu').id,'b');assert.ok(f.lista.has('minha'));
 f.concluir('minha');assert.equal(f.modo,'painel');assert.equal(f.atual('eu'),null);
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


test('tela limpa ao cancelar, fechar histórico ou recolher, sem apagar atividade própria pausada',()=>{
 const f=new AtividadesMesa({modo:'painel'});f.acao(acao('antiga'));f.concluir('antiga');assert.equal(f.atual('eu'),null);
 f.selecionar('antiga',true);assert.equal(f.atual('eu').id,'antiga');f.fecharVisual();assert.equal(f.modo,'barra');assert.equal(f.atual('eu'),null);
 f.recolherBarra();assert.equal(f.modo,'painel');assert.equal(f.atual('eu'),null);f.acao(acao('outra'));assert.equal(f.atual('eu'),null);
 f.acao(acao('minha'),{propria:true});f.dado({atividadeId:'minha',pedido:'p',tipo:'resultado',destino:'eu',resultado:{total:9}});f.concluir('minha','Cancelada');assert.equal(f.atual('eu'),null);assert.equal(f.obrigatoria('eu'),false);
 f.acao(acao('pausada'),{propria:true});f.fecharVisual();assert.ok(f.lista.get('pausada').ativa);f.selecionar('pausada',true);assert.equal(f.atual('eu').id,'pausada');
});
