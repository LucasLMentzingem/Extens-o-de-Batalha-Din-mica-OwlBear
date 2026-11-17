import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {novo,adicionar,aplicar,itensSaque,pesoInventario,publico,opcoesDisponiveis} from './site/engine.mjs';
import {compactarEstado} from './site/catalog.mjs';
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
