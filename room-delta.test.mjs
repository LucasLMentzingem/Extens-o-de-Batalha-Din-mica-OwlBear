import test from 'node:test';import assert from 'node:assert/strict';import {deltaDeEstado,aplicarDeltaEstado} from './site/room-sync.mjs';
test('delta muda PV sem repetir ficha; inclui remoções e criação de atores',()=>{
 const a={rev:1,historico:[],atores:[{id:'a',pv:20,ficha:{descricao:'x'.repeat(10000)},efeito:'antigo'},{id:'remover',pv:2}]},b=structuredClone(a);b.rev=2;b.historico=['Ataque'];b.atores[0].pv=15;delete b.atores[0].efeito;b.atores.pop();b.atores.push({id:'novo',pv:8});
 const d=deltaDeEstado(a,b);assert.ok(JSON.stringify(d).length<500);assert.deepEqual(aplicarDeltaEstado(a,d),b);assert.equal(a.atores[0].pv,20);
});
test('delta com dependência de ator ausente é recusado',()=>{assert.throws(()=>aplicarDeltaEstado({atores:[]},{campos:[],atores:[{id:'ausente',campos:[]}],ordem:['ausente']}),/não encontrado/);});
