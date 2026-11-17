import test from 'node:test';
import assert from 'node:assert/strict';
import {visibilidadeRolagem} from './site/roll-visibility.mjs';
import {resumoAlvoDano,relatoriosDaRolagem} from './site/damage.mjs';
function evento(){
 const npc=resumoAlvoDano({id:'npc',nome:'Inimigo',pv:19,pvTemporarios:3,ficha:{tipo:'npc',pvMaximos:30}}),pj=resumoAlvoDano({id:'pj',nome:'Aliado',pv:21,ficha:{tipo:'pj',pvMaximos:25}});
 const meta={tipo:'dano',tipoDano:'contundente',alvosDano:[npc,pj],alvoDano:npc};const relatoriosDano=relatoriosDaRolagem({total:7},meta);
 return {tipo:'resultado',destino:'p',pedido:'r',meta,resultado:{total:7,relatoriosDano,resultados:[{total:7,relatorioDano:relatoriosDano[0]}]}};
}
test('dano de inimigos: dono da rolagem e espectadores não recebem saldos no histórico; GM recebe completos',()=>{
 const d=evento(),original=JSON.stringify(d);
 for(const id of ['p','espectador']){
  const r=visibilidadeRolagem(d,{id,role:'PLAYER'}).pedido;
  assert.equal(r.resultado.relatoriosDano[0].pvAntes,undefined);assert.equal(r.resultado.relatoriosDano[0].pvDepois,undefined);assert.equal(r.resultado.relatoriosDano[0].excesso,undefined);assert.equal(r.resultado.relatoriosDano[0].pvOculto,true);
  assert.equal(r.resultado.resultados[0].relatorioDano.pvAntes,undefined);assert.equal(r.meta.alvosDano[0].pv,undefined);assert.equal(r.meta.alvoDano.pvMaximos,undefined);
  assert.equal(r.resultado.relatoriosDano[0].danoRecebido,7);assert.equal(r.resultado.relatoriosDano[1].pvAntes,21);assert.equal(r.meta.alvosDano[1].pv,21);
 }
 assert.equal(visibilidadeRolagem(d,{id:'gm',role:'GM'}).pedido.resultado.relatoriosDano[0].pvAntes,19);assert.equal(JSON.stringify(d),original);
});
test('ajuste e erro também ocultam PV de NPC, inclusive sem informação de tipo antiga',()=>{
 const d=evento();delete d.meta.alvosDano[0].pvPublico;
 for(const tipo of ['ajuste','erro']){const r=visibilidadeRolagem({...d,tipo},{id:'p',role:'PLAYER'}).pedido;assert.equal(r.meta.alvosDano[0].pv,undefined);assert.equal(r.meta.alvosDano[0].pvTemporarios,undefined);}
});
