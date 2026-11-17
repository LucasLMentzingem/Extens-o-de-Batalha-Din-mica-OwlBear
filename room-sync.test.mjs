import test from 'node:test';
import assert from 'node:assert/strict';
import {consultarComReenvio,receptorDeEstado} from './site/room-sync.mjs';

test('entrada consulta novamente quando o controlador ainda não estava pronto',async()=>{
  let tentativas=0;
  await consultarComReenvio(()=>++tentativas<3?Promise.reject(Error('iniciando')):Promise.resolve(),{intervalo:5,limite:200});
  assert.equal(tentativas,3);
  await new Promise(r=>setTimeout(r,20));assert.equal(tentativas,3);
});
test('ausência do mestre termina a consulta e libera os timers',async()=>{
  let tentativas=0;
  await assert.rejects(consultarComReenvio(()=>{tentativas++;return new Promise(()=>{});},{intervalo:5,limite:25}),/mestre conectado/);
  const final=tentativas;await new Promise(r=>setTimeout(r,20));assert.equal(tentativas,final);
});
test('controlador respondeu com erro de carregamento: mostrar a causa em vez de timeout genérico',async()=>{
 const erro=Error('Falha ao carregar ficha antiga: referência inexistente');erro.controladorRespondeu=true;let chamadas=0;
 await assert.rejects(consultarComReenvio(()=>{chamadas++;throw erro;},{intervalo:5,limite:200}),/ficha antiga/);
 assert.equal(chamadas,1);
});
test('monta vistas intercaladas e fora de ordem sem misturar dados de fichas',()=>{
  const receber=receptorDeEstado(),a=JSON.stringify({rev:2,nome:'Bênção'}),b=JSON.stringify({rev:3,nome:'Curar'}),corte=9;
  assert.equal(receber({seq:'a',i:corte,final:true,parte:a.slice(corte)}),null);
  assert.equal(receber({seq:'b',i:0,parte:b.slice(0,corte)}),null);
  assert.deepEqual(receber({seq:'a',i:0,parte:a.slice(0,corte)}),{rev:2,nome:'Bênção'});
  assert.deepEqual(receber({seq:'b',i:corte,final:true,parte:b.slice(corte)}),{rev:3,nome:'Curar'});
});
test('fragmento faltante não entrega ficha parcial e uma retransmissão pode completar',()=>{
  const receber=receptorDeEstado(),texto=JSON.stringify({atores:[{nome:'Skimi'}]});
  assert.equal(receber({seq:'x',i:0,parte:texto.slice(0,4)}),null);
  assert.equal(receber({seq:'x',i:9,parte:texto.slice(9),final:true}),null);
  assert.deepEqual(receber({seq:'x',i:4,parte:texto.slice(4,9)}),{atores:[{nome:'Skimi'}]});
});
