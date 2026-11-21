import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeRodape,caixaRodape,medidaRodapeValida,larguraLinhaRecursos} from './site/hud-dock-layout.mjs';
import {mensagemHudValida} from './site/hud-protocol.mjs';
test('grade mantém lado 50 e ordem por coluna ao trocar linhas, sem reservar a maior lista',()=>{
  assert.deepEqual(gradeRodape(16,1),{linhas:1,colunas:16,largura:845,altura:50});
  assert.deepEqual(gradeRodape(16,2),{linhas:2,colunas:8,largura:421,altura:103});
  assert.deepEqual(gradeRodape(16,4),{linhas:4,colunas:4,largura:209,altura:209});
  assert.equal(gradeRodape(6,2).largura,156);
});
test('filtro vazio e poucos itens não mantêm cinco linhas vazias',()=>{
  assert.deepEqual(gradeRodape(0,5),{linhas:1,colunas:0,largura:180,altura:50});
  assert.deepEqual(gradeRodape(1,5),{linhas:1,colunas:1,largura:50,altura:50});
});
test('piso horizontal inclui a linha inteira de recursos, sem limitar aos quatro primeiros',()=>{
  assert.equal(larguraLinhaRecursos(0),0);assert.equal(larguraLinhaRecursos(1),42);
  assert.equal(larguraLinhaRecursos(4),177);assert.equal(larguraLinhaRecursos(12),537);
  assert.equal(larguraLinhaRecursos(20),897);
  assert.equal(caixaRodape({larguraMaxima:1358,alturaMaxima:700,linhas:5,medida:{larguraIdeal:1284,altura:400}}).largura,1284);
});
test('janela converge ao conteúdo e respeita os limites de viewport/carta',()=>{
  const medida={larguraIdeal:710,altura:210};
  assert.deepEqual(caixaRodape({larguraMaxima:1120,alturaMaxima:700,linhas:2,medida}),{largura:710,altura:210});
  assert.deepEqual(caixaRodape({larguraMaxima:480,alturaMaxima:180,linhas:2,medida}),{largura:480,altura:180});
  assert.deepEqual(caixaRodape({larguraMaxima:240,alturaMaxima:350,linhas:2,medida}),{largura:240,altura:210});
});
const contexto={atorId:'a',linhas:2,rev:3},medida={tipo:'dimensoesBarra',parte:'barra',atorId:'a',linhas:2,rev:3,larguraIdeal:700,larguraMedida:900,altura:230,documentoHud:'barra-atual',sessaoHud:'sessao'};
test('medida atrasada não redimensiona outra ficha, outra preferência ou revisão',()=>{
  assert.ok(medidaRodapeValida(medida,contexto));
  for(const cambio of [{atorId:'b'},{linhas:3},{rev:2},{altura:Infinity},{larguraIdeal:NaN},{larguraMedida:-1}])assert.equal(medidaRodapeValida({...medida,...cambio},contexto),false);
});
test('protocolo não aceita dimensões sem documento, com números inválidos ou de sessão antiga',()=>{
  assert.ok(mensagemHudValida(medida,'sessao'));
  for(const cambio of [{documentoHud:null},{linhas:99},{altura:0},{larguraIdeal:9000},{rev:3.5},{sessaoHud:'antiga'},{parte:'acao'}])assert.equal(mensagemHudValida({...medida,...cambio},'sessao'),false);
});
