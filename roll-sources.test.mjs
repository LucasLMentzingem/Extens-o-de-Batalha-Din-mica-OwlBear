import test from 'node:test';import assert from 'node:assert/strict';
import {identificarParcelas,parcelasPorFonte,destinoDicePublico} from './site/roll-sources.mjs';
test('Marca e Saraivada conservam a fonte com seleção em ordem inversa',()=>{
 const marca={id:'marca',nome:'Marca',formula:'1d6',elemento:'energetico'},sar={id:'sar',nome:'Saraivada',formula:'1d10',elemento:'perfurante'};
 const r=identificarParcelas({total:19,resultados:[{total:8},{total:8},{total:3}]},'1d8+3',[sar,marca]);
 assert.deepEqual(parcelasPorFonte(r,[marca,sar]).map(x=>[x.fonteId,x.total]),[['base',8],['marca',3],['sar',8]]);
 assert.deepEqual(parcelasPorFonte(r,[sar,marca]).map(x=>x.total),[8,8,3]);
});
test('fonte ausente ou duplicada impede associação incorreta do dano',()=>{
 assert.throws(()=>identificarParcelas({resultados:[{total:8}]},'1d8',[{id:'marca'}]),/todas as fontes/);
 assert.throws(()=>parcelasPorFonte({resultados:[{fonteId:'base',total:8},{fonteId:'base',total:2}]}),/duplicada/);
 assert.throws(()=>parcelasPorFonte({resultados:[{fonteId:'base',total:8}]},[{id:'marca'}]),/ausente/);
});
test('resultados legados e audiência pública ou restrita',()=>{
 const r={resultados:[{total:8},{total:3}]};assert.deepEqual(parcelasPorFonte(r,[{id:'marca'}]),r.resultados);
 assert.equal(destinoDicePublico({role:'PLAYER'}),'everyone');assert.equal(destinoDicePublico({role:'GM'}),'dm');assert.equal(destinoDicePublico({role:'PLAYER',secreta:true}),'dm');
});
