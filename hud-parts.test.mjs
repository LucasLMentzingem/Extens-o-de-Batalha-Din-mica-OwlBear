import test from 'node:test';
import assert from 'node:assert/strict';
import {grupoHudValido,chaveParte,chaveEntrada,partesLeves,comandoDoAtorHudValido} from './site/hud-parts.mjs';
import {mensagemHudValida} from './site/hud-protocol.mjs';
const grupo={parte:'barra-grade',x:90,y:80,width:400,height:110,html:'<div>Grade</div>'};
test('quadro antigo não executa habilidade nem controle no personagem recém-selecionado',()=>{
  for(const tipo of ['usar','mover','ficha','passar','teste','interacaoRodape']){
    assert.equal(comandoDoAtorHudValido({parteHud:'barra-grade',tipo,atorHud:'A'},'B'),false);
    assert.equal(comandoDoAtorHudValido({parteHud:'barra-grade',tipo},'B'),false);
    assert.equal(comandoDoAtorHudValido({parteHud:'barra-grade',tipo,atorHud:'B'},'B'),true);
  }
});
test('proteção de troca conserva presença, dicas e seleção explícita no carrossel',()=>{
  for(const d of [{parteHud:'barra-grade',presenca:'barra-grade'},{parteHud:'barra-grade',pedir:true},{parteHud:'barra-grade',tipo:'dicaRodape',html:null},{parteHud:'mesa-turnos',tipo:'ator',id:'C',atorHud:'A'}])assert.equal(comandoDoAtorHudValido(d,'B'),true);
});
test('grupos ficam dentro do layout medido, com tolerância apenas de arredondamento',()=>{
  assert.equal(grupoHudValido(grupo,'barra',600,200),true);
  assert.equal(grupoHudValido({...grupo,x:202},'barra',600,200),true);
  for(const alteracao of [{x:203},{y:1000},{width:0},{height:-1},{x:NaN},{height:Infinity},{x:-2}])assert.equal(grupoHudValido({...grupo,...alteracao},'barra',600,200),false);
});
test('grupos desconhecidos e do outro renderer não criam popovers',()=>{
  for(const parte of ['inventada','constructor','toString','__proto__','mesa-turnos'])assert.equal(grupoHudValido({...grupo,parte},'barra',600,200),false);
  assert.equal(grupoHudValido(grupo,'ordem',600,200),false);
  assert.equal(grupoHudValido({...grupo,parte:'mesa-turnos'},'ordem',600,200),true);
  assert.equal(grupoHudValido(grupo,'desconhecida',600,200),false);
  assert.equal(grupoHudValido({...grupo,html:'x'.repeat(160001)},'barra',600,200),false);
});
test('canais isolam grupo, sala e conexão e não usam o canal do estado completo',()=>{
  const chaves=partesLeves.map(p=>chaveParte('ns','sala','c1',p));
  assert.equal(new Set(chaves).size,partesLeves.length);
  assert.notEqual(chaves[0],chaveParte('ns','sala','c2',partesLeves[0]));
  assert.notEqual(chaves[0],chaveParte('ns','outra','c1',partesLeves[0]));
  assert.ok(!chaves.includes(chaveEntrada('ns','sala','c1')));
});
test('mensagens de geometria exigem origem, revisão e limites finitos',()=>{
  const d={tipo:'partesHud',sessaoHud:'nova',origem:'barra',documentoHud:'doc',rev:3,partes:[grupo],largura:1120,altura:320};
  assert.equal(mensagemHudValida(d,'nova'),true);
  for(const alteracao of [{sessaoHud:'antiga'},{origem:'acao'},{documentoHud:null},{rev:3.5},{partes:{}},{partes:Array(15).fill(grupo)},{largura:1121},{largura:Infinity},{altura:0},{altura:4097}])assert.equal(mensagemHudValida({...d,...alteracao},'nova'),false);
});
test('interações e dicas parciais usam documento atual e comandos conhecidos',()=>{
  const base={sessaoHud:'nova',parteHud:'barra-ferramentas',documentoHud:'doc'};
  assert.equal(mensagemHudValida({...base,tipo:'interacaoRodape',comando:'filtro'},'nova'),true);
  assert.equal(mensagemHudValida({...base,tipo:'interacaoRodape',comando:'apagarTudo'},'nova'),false);
  assert.equal(mensagemHudValida({...base,tipo:'interacaoRodape',comando:'filtro',documentoHud:null},'nova'),false);
  for(const html of [null,'<section>Dica</section>'])assert.equal(mensagemHudValida({...base,tipo:'dicaRodape',html},'nova'),true);
  for(const html of [{},'x'.repeat(50001)])assert.equal(mensagemHudValida({...base,tipo:'dicaRodape',html},'nova'),false);
  assert.equal(mensagemHudValida({...base,tipo:'dicaRodape',html:null,sessaoHud:'antiga'},'nova'),false);
});
