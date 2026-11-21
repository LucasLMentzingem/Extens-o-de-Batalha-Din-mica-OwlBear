import test from 'node:test';
import assert from 'node:assert/strict';
import {CacheLayoutRodape} from './site/hud-layout-cache.mjs';
const config={atorId:'a',linhas:2,compacto:false,largura:900,alturaMax:700,rev:3,nomes:true,estadoLocal:{filtro:'Comum',recursoAtivo:null},contexto:'token-a'};
const grupo=(extra={})=>({...config,partes:[{parte:'barra-grade',html:'<button>Atacar</button>'}],...extra});
test('expandir restaura o layout válido sem perder o expandido ao guardar o compacto',()=>{
  const c=new CacheLayoutRodape(),expandido=grupo(),compacto=grupo({compacto:true,largura:92,partes:[{parte:'barra-identidade',html:'retrato'}]});
  c.guardar(expandido,700,'token-a');c.guardar(compacto,700,'token-a');
  assert.equal(c.obter(config),expandido);assert.equal(c.obter({...config,compacto:true,largura:92}),compacto);
});
test('revisão, personagem, viewport, linhas, filtros, nomes e contexto distintos não restauram HTML antigo',()=>{
  const c=new CacheLayoutRodape();c.guardar(grupo(),700,'token-a');
  for(const extra of [{rev:4},{atorId:'b'},{largura:880},{alturaMax:600},{linhas:3},{compacto:true},{nomes:false},{estadoLocal:{filtro:'Classe',recursoAtivo:null}},{estadoLocal:{filtro:'Comum',recursoAtivo:'bonus'}},{contexto:'token-b'}])assert.equal(c.obter({...config,...extra}),undefined,JSON.stringify(extra));
});
test('cache de revisões tem limite de entradas e troca de cena libera o conteúdo',()=>{
  const c=new CacheLayoutRodape(2);for(const rev of [1,2,3])c.guardar(grupo({rev}),700,'token-a');
  assert.equal(c.obter({...config,rev:1}),undefined);assert.ok(c.obter({...config,rev:2}));assert.equal(c.entradas.size,2);c.limpar();assert.equal(c.bytes,0);assert.equal(c.obter(config),undefined);
});
test('orçamento de memória remove os mais antigos e não retém uma grade excessiva',()=>{
  const c=new CacheLayoutRodape(16,1600);for(let rev=1;rev<12;rev++)c.guardar(grupo({rev}),700,'token-a');
  assert.ok(c.bytes<=1600);assert.equal(c.obter({...config,rev:1}),undefined);assert.ok(c.obter({...config,rev:11}));
  c.guardar(grupo({rev:12,partes:[{html:'x'.repeat(2000)}]}),700,'token-a');assert.equal(c.obter({...config,rev:12}),undefined);assert.ok(c.bytes<=1600);
});
