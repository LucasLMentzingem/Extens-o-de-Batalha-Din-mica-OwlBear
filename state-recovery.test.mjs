import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {novo,adicionar,publico,aplicar} from './site/engine.mjs';
import {compactarEstado} from './site/catalog.mjs';
import {recuperarEstado,excluirFichaIsolada} from './site/state-recovery.mjs';
async function fixture(){
 const s=novo();const f=JSON.parse(await readFile(new URL('./site/fichas/nikki.json',import.meta.url)));
 const a=adicionar(s,f),b=adicionar(s,f,'Ficha antiga');b.dono='jogador-antigo';
 const raw=compactarEstado(s);raw.atores[1].ficha.inventario.itens[0].quantidade=-1;
 return {raw,a,b};
}
test('ficha inválida de um jogador não bloqueia a mesa, preserva original e mantém ficha saudável',async()=>{
 const {raw,a,b}=await fixture(),antes=structuredClone(raw),{estado,novas}=recuperarEstado(raw);
 assert.deepEqual(raw,antes);assert.equal(estado.atores.length,1);assert.equal(estado.atores[0].id,a.id);
 assert.equal(novas.length,1);assert.equal(novas[0].atorId,b.id);assert.match(novas[0].erro,/Quantidade|peso/);
 assert.deepEqual(novas[0].original,raw.atores[1]);
 const salvo=compactarEstado(estado),reload=recuperarEstado(salvo);assert.equal(reload.novas.length,0);assert.deepEqual(reload.estado.quarentenaFichas,estado.quarentenaFichas);
 assert.equal(publico(estado).quarentenaFichas,undefined);
});
test('ficha com referência removida do catálogo fica recuperável, sem trocar por outra skill',async()=>{
 const {raw}=await fixture();raw.atores[1].ficha.concessoes[0].ref='habilidade.inexistente-antiga';
 const {estado}=recuperarEstado(raw);assert.match(estado.quarentenaFichas[0].erro,/catálogo/);assert.equal(estado.atores.length,1);
});
test('isolamento suspende combate inválido e remove resolução pendente',async()=>{
 const {raw}=await fixture();raw.fase='turnos';raw.ordem=raw.atores.map(x=>x.id);raw.reacaoPendente={id:'reacao'};
 const {estado}=recuperarEstado(raw);assert.equal(estado.fase,'preparo');assert.deepEqual(estado.ordem,[]);assert.equal(estado.reacaoPendente,undefined);
});
test('exclusão da ficha isolada requer mestre, revisão e duas confirmações e persiste',async()=>{
 const {raw}=await fixture(),{estado}=recuperarEstado(raw),id=estado.quarentenaFichas[0].id,opts={rev:estado.rev,confirmado:true,confirmacaoFinal:true};
 assert.throws(()=>excluirFichaIsolada(estado,id,{role:'PLAYER'},opts),/mestre/);
 assert.throws(()=>excluirFichaIsolada(estado,id,{role:'GM'},{...opts,confirmacaoFinal:false}),/duas/);
 assert.throws(()=>excluirFichaIsolada(estado,id,{role:'GM'},{...opts,rev:-1}),/mudou/);
 excluirFichaIsolada(estado,id,{role:'GM'},opts);assert.equal(recuperarEstado(compactarEstado(estado)).estado.quarentenaFichas.length,0);
});
test('ficha saudável continua excluível após isolar ficha inválida',async()=>{
 const {raw}=await fixture(),{estado}=recuperarEstado(raw);
 const next=await aplicar(estado,{tipo:'remover',ator:estado.atores[0].id,rev:estado.rev},{role:'GM'},()=>1);
 assert.equal(next.atores.length,0);assert.equal(next.quarentenaFichas.length,1);
});
