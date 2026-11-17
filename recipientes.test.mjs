import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {novo,adicionar,aplicar,itensSaque,pesoInventario,publico,opcoesDisponiveis,ordenarOpcoesRodape} from './site/engine.mjs';
import {compactarEstado,resolverInstanciaItem} from './site/catalog.mjs';
import {pontosInteracaoRecipiente,pontoNoRecipiente} from './site/loot-geometry.mjs';
const gm={id:'gm',role:'GM'},player={id:'p',role:'PLAYER'};
async function mesa(){let s=novo();const a=adicionar(s,JSON.parse(await readFile(new URL('./site/fichas/nikki.json',import.meta.url))));a.dono='p';a.x=0;a.y=0;
 const run=async(tipo,extra={},u=gm,dado=()=>1)=>{s=await aplicar(s,{tipo,ator:a.id,rev:s.rev,confirmado:true,...extra},u,dado);return s;};
 await run('criarRecipiente',{tipoRecipiente:'caixa',tokenId:'bau',capacidadeSlots:2,posicaoM:{x:1,y:0}});
 return {get s(){return s;},get a(){return s.atores[0];},get r(){return s.recipientes[0];},run};}
test('baú: autorização, tranca revalidada, capacidade e persistência',async()=>{
 const m=await mesa();await assert.rejects(()=>m.run('criarRecipiente',{tipoRecipiente:'caixa'},player),/mestre/);
 await assert.rejects(()=>m.run('criarRecipiente',{tipoRecipiente:'caixa',tokenId:'bau'}),/já possui/);
 await m.run('abrirSaqueRecipiente',{recipienteId:m.r.id},player);const id=m.a.saqueAberto.id;
 await m.run('configurarRecipiente',{recipienteId:m.r.id,nome:'Cofre',capacidadeSlots:2,trancado:true});
 const antes=JSON.stringify(m.s);await assert.rejects(()=>m.run('confirmarSaque',{saqueId:id,itens:[]},player),/trancado/);assert.equal(JSON.stringify(m.s),antes);
 await assert.rejects(()=>m.run('abrirSaqueRecipiente',{recipienteId:m.r.id},player),/trancado/);
 assert.equal(compactarEstado(m.s).recipientes[0].trancado,true);
});
test('Saquear seleciona baú e chão pela mesma habilidade, valida antes de cobrar e não duplica ação',async()=>{
 const m=await mesa();m.s.fase='turnos';m.s.ordem=[m.a.id];m.s.vez=0;m.a.acao=1;
 await m.run('recipienteAdicionarPo',{recipienteId:m.r.id,quantidade:5});
 await m.run('configurarRecipiente',{recipienteId:m.r.id,nome:'Baú',capacidadeSlots:2,trancado:true});
 await assert.rejects(()=>m.run('usar',{opcao:'saquear',recipienteId:m.r.id},player),/trancado/);assert.equal(m.a.acao,1);
 await m.run('configurarRecipiente',{recipienteId:m.r.id,nome:'Baú',capacidadeSlots:2,trancado:false});
 await m.run('usar',{opcao:'saquear',recipienteId:m.r.id},player);assert.equal(m.a.acao,0);assert.equal(m.a.saqueAberto.origem.tipo,'caixa');
 await m.run('confirmarSaque',{saqueId:m.a.saqueAberto.id,itens:[{itemId:m.r.itens[0].id,quantidade:5}]},player);assert.equal(m.a.acao,0);
 m.s.fase='preparo';const i=m.a.ficha.inventario.itens.find(i=>i.tipo!=='moeda');await m.run('soltarItem',{itemId:i.id,quantidade:1},player);
 const chao=m.s.recipientes.find(r=>r.tipo==='chao');await m.run('usar',{opcao:'saquear',recipienteId:chao.id},player);assert.equal(m.a.saqueAberto.origem.tipo,'chao');
 await m.run('confirmarSaque',{saqueId:m.a.saqueAberto.id,itens:[{itemId:chao.itens[0].id,quantidade:1}]},player);assert.ok(!m.s.recipientes.some(r=>r.id===chao.id));
});
test('hitbox de loot é círculo de um metro e baú acompanha dimensões, offset e rotação da prop',()=>{
 const r={tipo:'chao',posicaoM:{x:0,y:0}};
 for(const px of [50,100,200]){
   const pontos=pontosInteracaoRecipiente(r,px);assert.equal(pontos.length,48);assert.ok(pontos.every(p=>Math.abs(Math.hypot(p.x,p.y)-px/2)<1e-6));
   assert.ok(pontoNoRecipiente({x:px*.49,y:0},r,px));assert.ok(!pontoNoRecipiente({x:px*.4,y:px*.4},r,px));
 }
 const caixa={tipo:'caixa',posicaoM:{x:0,y:0}},imagem={image:{width:1500,height:1000},grid:{dpi:1500,offset:{x:750,y:500}},scale:{x:1,y:1},position:{x:0,y:0},rotation:90};
 const p=pontosInteracaoRecipiente(caixa,100,imagem,150);assert.deepEqual(p,[{x:-75,y:-50},{x:75,y:-50},{x:75,y:50},{x:-75,y:50}]);assert.ok(pontoNoRecipiente({x:49,y:74},caixa,100,imagem));assert.ok(!pontoNoRecipiente({x:60,y:0},caixa,100,imagem));
});
test('baú: depósito parcial calcula só a quantidade restante e mantém identidades distintas',async()=>{
 const m=await mesa();m.a.ficha.inventario.itens.push({id:'pilha',nome:'Pedras',tipo:'etc',quantidade:10,pesoKg:1});
 m.a.ficha.inventario.capacidadeCargaKg=pesoInventario(m.a)-4;
 await m.run('abrirSaqueRecipiente',{recipienteId:m.r.id},player);
 await m.run('confirmarSaque',{saqueId:m.a.saqueAberto.id,itens:[],depositos:[{itemId:'pilha',quantidade:5}]},player);
 assert.equal(m.a.ficha.inventario.itens.find(i=>i.id==='pilha').quantidade,5);assert.equal(m.r.itens[0].quantidade,5);assert.notEqual(m.r.itens[0].id,'pilha');
 await m.run('soltarItem',{itemId:'pilha',quantidade:2},player);const chao=m.s.recipientes.find(r=>r.tipo==='chao');assert.notEqual(chao.itens[0].id,'pilha');
 assert.equal(chao.itens[0].quantidade,2);assert.equal(m.a.ficha.inventario.itens.find(i=>i.id==='pilha').quantidade,3);
});
test('saque simultâneo atualiza sessão pública e rejeita item já removido sem mutar estado',async()=>{
 const m=await mesa();await m.run('recipienteAdicionarPo',{recipienteId:m.r.id,quantidade:10});
 await m.run('abrirSaqueRecipiente',{recipienteId:m.r.id},player);m.r.itens[0].quantidade=3;
 assert.equal(itensSaque(m.s,m.a)[0].quantidade,3);assert.equal(publico(m.s).atores[0].saqueAberto.itens[0].quantidade,3);
 const antes=JSON.stringify(m.s);await assert.rejects(()=>m.run('confirmarSaque',{saqueId:m.a.saqueAberto.id,itens:[{itemId:m.r.itens[0].id,quantidade:10}]},player),/Quantidade/);assert.equal(JSON.stringify(m.s),antes);
 await m.run('confirmarSaque',{saqueId:m.a.saqueAberto.id,itens:[{itemId:m.r.itens[0].id,quantidade:3}]},player);assert.equal(m.r.itens.length,0);
});
test('arremesso acerta ou erra e cria exatamente uma arma física no chão',async()=>{
 for(const face of [1,20]){const m=await mesa(),b=adicionar(m.s,JSON.parse(await readFile(new URL('./site/fichas/soldado.json',import.meta.url))));b.x=3;b.y=0;
 const o=opcoesDisponiveis(m.a).find(o=>o.geradaPorItem&&o.automacao?.arremesso),arma=m.a.ficha.inventario.itens.find(i=>i.id===o.origemItem);
 await m.run('usar',{opcao:o.id,alvo:b.id},gm,()=>face);const chao=m.s.recipientes.filter(r=>r.tipo==='chao');assert.equal(chao.length,1);assert.equal(chao[0].itens[0].id,arma.id);assert.ok(!m.a.ficha.inventario.itens.some(i=>i.id===arma.id));assert.equal(chao[0].posicaoM.x,3);
 }
});
test('arremesso em composição também retira arma equipada e cria loot em acerto ou erro',async()=>{
 for(const face of [1,20]){
  const m=await mesa(),b=adicionar(m.s,JSON.parse(await readFile(new URL('./site/fichas/soldado.json',import.meta.url))));b.x=1;b.y=0;
  const o=opcoesDisponiveis(m.a).find(o=>o.automacao?.arremesso),item=m.a.ficha.inventario.itens.find(i=>i.id===o.origemItem);
  m.a.ficha.opcoes.push({id:'sequencia-fisica',nome:'Sequência física',categoria:'acao',custo:[],automacao:structuredClone(o.automacao),origemItem:item.id,composicao:{quantidadeMinima:1,quantidadeMaxima:1,modoPadrao:'arremessar',modos:[{id:'arremessar',nome:'Arremessar',tipo:'ataque',origemItem:item.id,origemOpcaoId:o.id,automacao:structuredClone(o.automacao)}]}});
  await m.run('usar',{opcao:'sequencia-fisica',composicao:[{modoId:'arremessar',alvoId:b.id}]},gm,()=>face);
  assert.ok(!m.a.ficha.inventario.itens.some(i=>i.id===item.id));const loot=m.s.recipientes.filter(r=>r.tipo==='chao');assert.equal(loot.length,1);assert.equal(loot[0].itens[0].id,item.id);assert.equal(loot[0].posicaoM.x,1);
 }
});
test('filtro Comum prioriza armas e ações solicitadas, preservando a ordem dos demais',async()=>{
 const m=await mesa();const opcoes=['Restante B','Empurrar','Ajudar','Derrubar','Restante A','Esconder-se','Correr','Desengajar','Saquear'].map((nome,i)=>({id:'teste-'+i,nome,custo:[],categoria:'acao',automacao:{tipo:'especial'}}));
 const arma=opcoesDisponiveis(m.a).find(o=>o.geradaPorItem&&o.automacao?.tipo==='ataque');
 const ordenadas=ordenarOpcoesRodape(m.a,[...opcoes,arma],{comum:true});assert.equal(ordenadas[0].id,arma.id);assert.deepEqual(ordenadas.slice(1).map(o=>o.nome),['Saquear','Desengajar','Correr','Ajudar','Esconder-se','Empurrar','Derrubar','Restante B','Restante A']);
});
test('Ágil conserva a alternativa corpo a corpo e oferece arremesso sem substituir o modo anterior',async()=>{
 const s=novo(),a=adicionar(s,JSON.parse(await readFile(new URL('./site/fichas/zurich.json',import.meta.url))));
 const principal=a.ficha.inventario.itens.find(i=>i.equipadoSlot==='mao_forte');for(const i of a.ficha.inventario.itens)if(i.equipadoSlot==='mao_fraca')i.equipado=false;
 a.ficha.inventario.itens.push(resolverInstanciaItem({id:'adaga-extra',ref:'item.adaga-do-ultimo-rito',equipado:true,equipadoSlot:'mao_fraca'}));
 const o=opcoesDisponiveis(a).find(o=>o.origemItem===principal.id&&o.composicao);assert.ok(o);
 const extras=o.composicao.modos.slice(1);assert.equal(extras[0].automacao.arremesso,false);assert.ok(extras.some(m=>m.automacao.arremesso));assert.ok(extras.every(m=>m.origemItem==='adaga-extra'));assert.equal(o.composicao.quantidadeMaxima,2);
});

test('mão fraca: ataque normal arremessado usa ação sem pré-requisito em combate e fora dele',async()=>{
 for(const combate of [false,true]){
  const m=await mesa();const alvo=adicionar(m.s,JSON.parse(await readFile(new URL('./site/fichas/soldado.json',import.meta.url))));alvo.x=1;alvo.y=0;
  const o=opcoesDisponiveis(m.a).find(o=>o.geradaPorItem&&o.id.endsWith('-acao')&&o.automacao.arremesso);assert.ok(o);assert.equal(o.requisitosUso,undefined);
  if(combate){m.s.fase='turnos';m.s.ordem=[m.a.id,alvo.id];m.s.vez=0;m.a.acao=1;}
  await m.run('usar',{opcao:o.id,alvo:alvo.id},player);assert.ok(m.s.recipientes.some(r=>r.tipo==='chao'&&r.itens.some(i=>i.id===o.origemItem)));
  if(combate)assert.equal(m.a.acao,0);
 }
});
test('depósito contextual mantém sessão e equipar retira apenas uma unidade da pilha',async()=>{
 const m=await mesa(),item=m.a.ficha.inventario.itens.find(i=>i.tipo==='equipamento'&&!i.equipado);assert.ok(item);
 item.quantidade=2;item.empilhavel=true;
 await m.run('abrirSaqueRecipiente',{recipienteId:m.r.id},player);const saqueId=m.a.saqueAberto.id;
 await m.run('confirmarSaque',{saqueId,itens:[],depositos:[{itemId:item.id,quantidade:2}],depositarSomente:true},player);
 assert.equal(m.a.saqueAberto.id,saqueId);assert.equal(m.r.itens[0].quantidade,2);
 // Mesmo fora de combate, equipar deve manter o item anterior na mochila.
 const loot=m.r.itens[0];loot.slotEquipamento='mao_forte';loot.duasMaos=false;
 await m.run('confirmarSaque',{saqueId,itens:[{itemId:loot.id,quantidade:1}],equiparItemId:loot.id,equiparSlot:'mao_fraca'},player);
 assert.equal(m.r.itens[0].quantidade,1);assert.equal(m.a.ficha.inventario.itens.filter(i=>i.equipado&&i.equipadoSlot==='mao_fraca').length,1);
});
