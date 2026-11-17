import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tipoCriatura,facesDanoBase,fonteFacesMinimas,controladorAtor,metamagiaDuplicada,ofertaDestruidorDeHordas,usadoNesteTurno,novo,adicionar,aplicar,atual,publico,validar,atualizarMagias,caAtual,pvMaximosAtuais,deslocamentoMaximo,capacidadeCargaAtual,bonusIniciativa,bonusPericia,bonusTesteFerramenta,modoPericiaEquipamento,restricoesAtivas,temCondicao,dentroDaArea,pesoInventario,opcoesDisponiveis,ordenarOpcoesRodape,slotsOcupadosItem,ataquesEquipados,proficienteComArma,dadoLocal,planoCustoOpcao,usoGratuitoDisponivel,saldoMoedasPc,precoCompraPc,precoVendaPc,lojasAtivas,recomprasDaLoja,trocaDoAtor,circulosConjuracao,derivarOpcaoCirculo,LIMITE_ALCANCE_M} from './site/engine.mjs';
import {TIPOS_DANO,aplicarRelatorioDano,defesasDanoDoAtor,infoTipoDano,normalizarTipoDano,resolverDano} from './site/damage.mjs';
import {oportunidades} from './site/engine.mjs';
import {itensSaque} from './site/engine.mjs';
import {lerPastaFichas} from './site/importar-pasta-fichas.mjs';
import {quantidadeMoedaValida} from './site/engine.mjs';
import {sincronizarCopiasNpc,chaveFichaNpc,chaveBloqueioNpc} from './site/npc-duplicates.mjs';
import {visibilidadeRolagem} from './site/roll-visibility.mjs';
import {compactarMarcas,marcasPublicasValidas,remetentePodePublicarPrevia} from './site/action-preview.mjs';
import {catalogoCentral,compactarFicha,compactarEstado,resolverCatalogoLoja} from './site/catalog.mjs';
import {fichaEditavel,habilidadeRacial,livroHabilidades,nomePassiva,nomeRaca} from './site/ficha-view.mjs';
import {METROS_POR_CELULA,pixelsPorMetro,configurarEscalaCena,migrarEscalaCena} from './site/scene-scale.mjs';
const fichaFonte=async name=>JSON.parse(await readFile(new URL('./site/fichas/'+name+'.json',import.meta.url),'utf8'));
const ficha=async name=>validar(await fichaFonte(name));
const nikki=await ficha('nikki'),soldado=await ficha('soldado');
const catalogoVictor=resolverCatalogoLoja(JSON.parse(await readFile(new URL('./site/catalogo-victor.json',import.meta.url),'utf8')));
const conteudoConfigurado=JSON.parse(await readFile(new URL('./site/conteudo-configurado.json',import.meta.url),'utf8'));
const mapaNivel3=JSON.parse(await readFile(new URL('./docs/mapeamento-nivel-3/catalogo-nivel-3.json',import.meta.url),'utf8'));
const modulosNivel3=JSON.parse(await readFile(new URL('./docs/mapeamento-nivel-3/modulos-nivel-3.json',import.meta.url),'utf8'));
const habilidadesClasseRaca=await readFile(new URL('./docs/mapeamento-nivel-3/HABILIDADES-CLASSE-E-RACA.md',import.meta.url),'utf8');
const idsJogadores=['dragoberto','draven-thorne','hannah-montana','loteria','nikki','skimi','zurich'];
const fichasJogadores=await Promise.all(idsJogadores.map(ficha));
const gm={id:'m',role:'GM'},player={id:'p',role:'PLAYER'};

test('escala de cena: 1,5 m por célula, posições livres e diagonais euclidianas',()=>{
  assert.equal(METROS_POR_CELULA,1.5);
  for(const dpi of [70,100,150,300]){
    const ppm=pixelsPorMetro(dpi);
    assert.equal(9*ppm/dpi,6,'9 m ocupa seis células');
    assert.equal(18*ppm/dpi,12,'18 m ocupa doze células');
    assert.equal(2*3*ppm/dpi,4,'Despedaçar tem quatro células de diâmetro');
    assert.equal(4.5*ppm/dpi,3,'cone de 4,5 m tem três células de comprimento');
    assert.ok(Math.abs(Math.hypot(dpi,dpi)/ppm-1.5*Math.SQRT2)<1e-12);
    assert.ok(Math.abs((123.456/ppm)*ppm-123.456)<1e-10,'ida e volta preserva frações de pixel');
  }
  for(const dpi of [0,-1,NaN,Infinity])assert.throws(()=>pixelsPorMetro(dpi));
});

test('escala de cena: régua nativa configurada uma vez em metros e euclidiana',async()=>{
  let escala={parsed:{multiplier:1,unit:'m'}},medicao='CHEBYSHEV';const chamadas=[];
  const grid={getScale:async()=>escala,getMeasurement:async()=>medicao,
    setScale:async valor=>{chamadas.push(valor);escala={parsed:{multiplier:1.5,unit:'m'}};},
    setMeasurement:async valor=>{chamadas.push(valor);medicao=valor;}};
  await configurarEscalaCena(grid);await configurarEscalaCena(grid);
  assert.deepEqual(chamadas,['1.5m','EUCLIDEAN']);
});

test('escala de cena: migração preserva ancoragem no mapa, raios, recursos e compactação',()=>{
  const s=novo(),a=adicionar(s,nikki);a.x=6;a.y=-2;a.metros=7.25;
  s.zonas=[{centro:{x:4,y:8},geometria:{forma:'circulo',raioM:3}},
    {centro:{x:6,y:2},geometria:{forma:'cone',origem:{x:1,y:2},comprimentoM:4.5}}];
  s.pecas=[{posicao:{x:3,y:4},tamanhoM:1.5}];
  const rec=structuredClone(a.rec),rev=s.rev;
  assert.equal(migrarEscalaCena(s),true);assert.equal(s.rev,rev+1);
  assert.deepEqual({x:a.x*pixelsPorMetro(150),y:a.y*pixelsPorMetro(150)},{x:6*150,y:-2*150});
  assert.equal(s.zonas[0].centro.x*pixelsPorMetro(150),4*150);
  assert.equal(s.zonas[0].geometria.raioM,3);
  assert.deepEqual(s.zonas[1].geometria.origem,{x:1.5,y:3});
  assert.equal(s.zonas[1].geometria.comprimentoM,4.5);
  assert.deepEqual(s.pecas[0],{posicao:{x:4.5,y:6},tamanhoM:1.5});
  assert.equal(a.metros,7.25);assert.deepEqual(a.rec,rec);
  const reaberto=JSON.parse(JSON.stringify(compactarEstado(s)));
  const antes=structuredClone(reaberto);
  assert.equal(migrarEscalaCena(reaberto),false);assert.deepEqual(reaberto,antes);
});

test('escala de cena: trajetória antiga pede nova seleção e preserva reação de outro gatilho',()=>{
  for(const gatilho of ['sair_alcance','ser_atingido']){
    const s=novo();s.movimentoPendente={ator:'a',origem:{x:0,y:0},destino:{x:5,y:0}};
    s.reacaoPendente={gatilho};migrarEscalaCena(s);
    assert.equal(s.movimentoPendente,undefined);
    assert.equal(Boolean(s.reacaoPendente),gatilho!=='sair_alcance');
  }
});

test('prévia pública aceita mestre ou dono e limita as marcas a linhas e áreas seguras',()=>{
  const ator={id:'a',dono:'p',ficha:{tipo:'pj'}},linha={type:'LINE',startPosition:{x:0,y:0},endPosition:{x:100,y:50},style:{strokeColor:'#e5c079',strokeWidth:4}};
  const curva={type:'CURVE',position:{x:10,y:20},points:[{x:0,y:0},{x:30,y:0},{x:0,y:30}],style:{strokeColor:'#79cfb1',strokeWidth:3,fillColor:'#79cfb1',fillOpacity:.1,closed:true}};
  const marcas=compactarMarcas([linha,curva,{type:'IMAGE'}]);
  assert.equal(marcas.length,2);assert.equal(marcasPublicasValidas(marcas),true);
  assert.equal(remetentePodePublicarPrevia({id:'m',role:'GM'},ator),true);
  assert.equal(remetentePodePublicarPrevia({id:'p',role:'PLAYER'},ator),true);
  assert.equal(remetentePodePublicarPrevia({id:'intruso',role:'PLAYER'},ator),false);
  assert.equal(marcasPublicasValidas([{...marcas[0],largura:99}]),false);
});
test('catálogo central resolve referências compartilhadas e as fichas não duplicam definições',async()=>{
 const catalogo=catalogoCentral(),refs=new Set(catalogo.habilidades.map(x=>x.id)),itens=new Set(catalogo.itens.map(x=>x.id)),desengajar=[];
 for(const id of idsJogadores){const fonte=await fichaFonte(id);assert.equal(fonte.versaoFormato,2);assert.equal(fonte.opcoes,undefined);assert.equal(fonte.passivas,undefined);for(const c of fonte.concessoes){assert.ok(c.ref?refs.has(c.ref):c.definicaoLocal,id+' possui concessão quebrada');if(c.ref==='habilidade.desengajar-acao')desengajar.push(id);}for(const i of fonte.inventario.itens)assert.ok(i.ref?itens.has(i.ref):i.definicaoLocal,id+' possui item quebrado');}
 assert.equal(desengajar.length,7,'a ação compartilhada deve ter uma única definição para os sete jogadores');
});
test('livro separa habilidades raciais, ordena ativas antes das passivas e preserva nomes úteis',()=>{
 const esperadas={
  dragoberto:['Ataque de Sopro','Herança dracônica'],
  'draven-thorne':['Queimadura de Fogo','Defesas e sentidos'],
  'hannah-montana':['Passos Largos','Arte Druídica','Elfo Silvestre'],
  loteria:['Pico de Adrenalina','Visão no Escuro'],
  nikki:['Repreensão Diabólica','Raio de Fogo','Taumaturgia','Sentidos e defesas'],
  skimi:['Inspiração Heroica','Humano'],
  zurich:['Passos Largos','Arte Druídica','Elfo Silvestre']
 };
 for(const f of fichasJogadores){
  const a=adicionar(novo(),f),raciais=[...f.opcoes,...f.passivas].filter(x=>habilidadeRacial(f,x));
  assert.ok(raciais.some(x=>x.categoria!=='passiva'&&!/^Passiva/i.test(x.nome)),f.nome+' sem habilidade racial ativa');
  assert.ok(raciais.some(x=>f.passivas.includes(x)),f.nome+' sem passiva racial');
  for(const trecho of esperadas[f.id])assert.ok(raciais.some(x=>x.nome.toLocaleLowerCase('pt-BR').includes(trecho.toLocaleLowerCase('pt-BR'))),f.nome+' não classificou '+trecho+' como racial');
  const html=fichaEditavel(a,true,'habilidades','raca'),classe=html.indexOf('data-livro-aba="classe"'),comum=html.indexOf('data-livro-aba="comum"'),raca=html.indexOf('data-livro-aba="raca"'),reacoes=html.indexOf('data-livro-aba="reacoes"');
  assert.ok(classe<comum&&comum<raca&&raca<reacoes,f.nome+' com ordem incorreta das páginas');
  assert.ok(html.includes('>'+nomeRaca(f)+'</button>'),f.nome+' sem nome da raça na aba');
  assert.ok(html.indexOf('Habilidades raciais ativas')<html.indexOf('Passivas raciais'),f.nome+' não lista ativas primeiro');
 }
 const n=fichasJogadores.find(x=>x.id==='nikki'),a=adicionar(novo(),n),comum=livroHabilidades(a,'comum',true),classe=livroHabilidades(a,'classe',true);
 const raio=n.opcoes.find(x=>x.nome.includes('Raio de Fogo')),repreensao=n.opcoes.find(x=>x.nome.includes('Repreensão Diabólica'));
 assert.ok(!comum.includes('data-habilidade-id="'+raio.id+'"'), 'Raio de Fogo infernal ainda aparece em Comum');
 assert.ok(!classe.includes('data-habilidade-id="'+repreensao.id+'"'), 'Repreensão Diabólica ainda aparece em Classe');
 assert.equal(nomePassiva({nome:'Passiva | Herança dracônica'}),'Herança dracônica');
 assert.equal(nomePassiva({nome:'Passivas | Sentidos e defesas'}),'Sentidos e defesas');
});
test('mapa do nível 3 referencia módulos planejados e não exige módulos para interpretação',()=>{
 const ids=new Set(Object.keys(modulosNivel3.modulos));
 assert.deepEqual(ids,new Set(Object.keys(mapaNivel3.modulosPlanejados)));
 assert.equal(mapaNivel3.itens.length,320);
 for(const item of mapaNivel3.itens){
  const necessarios=item.modulos_necessarios??[];
  if(['PORTAVEL','INTERPRETACAO'].includes(item.status_portabilidade))assert.deepEqual(necessarios,[],item.nome+' não deve depender de módulo novo');
  if(item.status_portabilidade==='NOVO_MODULO')assert.ok(necessarios.length>0,item.nome+' precisa indicar ao menos um módulo');
  for(const id of necessarios)assert.ok(ids.has(id),item.nome+' referencia módulo inexistente '+id);
 }
 const contagem=Object.fromEntries([...ids].map(id=>[id,0]));
 for(const item of mapaNivel3.itens)for(const id of item.modulos_necessarios??[])contagem[id]++;
 assert.deepEqual(contagem,mapaNivel3.resumo.porModulo);
});
test('mapeamento completo separa raça, classe e registra módulos parciais ou ausentes',()=>{
 assert.equal(mapaNivel3.versao,'0.8.13');
 assert.deepEqual(mapaNivel3.resumo.porOrigemSistema,{classe:124,comum:16,magia:141,raca:31,talento:8});
 assert.deepEqual(modulosNivel3.porEstado,{PARCIAL:10,AUSENTE:6});
 assert.equal(mapaNivel3.itens.filter(x=>x.origem_sistema==='classe').length,124);
 assert.equal(mapaNivel3.itens.filter(x=>x.origem_sistema==='raca').length,31);
 assert.ok(mapaNivel3.itens.filter(x=>x.categoria==='traço_espécie').every(x=>x.origem_sistema==='raca'));
 assert.ok(mapaNivel3.itens.filter(x=>['habilidade_classe','habilidade_subclasse','invocação','metamagia','maestria_arma'].includes(x.categoria)).every(x=>x.origem_sistema==='classe'));
 for(const modulo of Object.values(modulosNivel3.modulos)){assert.ok(['PARCIAL','AUSENTE'].includes(modulo.estado));assert.ok(modulo.entregue);assert.ok(modulo.falta);}
 for(const item of mapaNivel3.itens.filter(x=>['classe','raca'].includes(x.origem_sistema)))assert.ok(habilidadesClasseRaca.includes('| '+item.nome+' |'),item.nome+' ausente da relação de classe/raça');
});
test('persistência compacta conserva o estado mutável sem salvar definições do catálogo',()=>{
 const s=novo(),a=adicionar(s,nikki),item=a.ficha.inventario.itens[0],passiva=a.ficha.passivas[0];item.quantidade=2;passiva.ativa=false;a.rec.feiticaria=1;
 const salvo=compactarEstado(s),fonte=salvo.atores[0].ficha;assert.equal(fonte.versaoFormato,2);assert.equal(fonte.opcoes,undefined);assert.equal(fonte.passivas,undefined);assert.ok(fonte.concessoes.every(c=>c.ref||c.definicaoLocal));assert.ok(fonte.inventario.itens.every(i=>i.ref||i.definicaoLocal));
 const reaberta=validar(fonte);assert.equal(reaberta.inventario.itens.find(i=>i.id===item.id).quantidade,2);assert.equal(reaberta.passivas.find(p=>p.id===passiva.id).ativa,false);assert.equal(salvo.atores[0].rec.feiticaria,1);assert.equal(compactarFicha(reaberta).versaoFormato,2);
});
test('Nikki possui um Passo Nebuloso gratuito por descanso longo',async()=>{
 let s=novo(),a=adicionar(s,nikki),o=a.ficha.opcoes.find(x=>x.catalogoRef==='magia.passo-nebuloso');assert.ok(o);assert.equal(o.somenteUsoGratuito,true);assert.equal(a.rec['passo-nebuloso-gratis'],1);
 s=await aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,x:5,y:0,confirmado:true},gm,dadoLocal);a=s.atores[0];assert.equal(a.x,5);assert.equal(a.rec['passo-nebuloso-gratis'],0);
 await assert.rejects(aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,x:7,y:0,confirmado:true},gm,dadoLocal),/Custo da habilidade inválido|Saldo insuficiente/);
 s=await aplicar(s,{tipo:'descanso',periodo:'longo',rev:s.rev,confirmado:true},gm,dadoLocal);assert.equal(s.atores[0].rec['passo-nebuloso-gratis'],1);
});
function mesa(){
  let s=novo();
  const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I'),c=adicionar(s,soldado,'Soldado II');
  const go=async(tipo,extra={},u=gm,dados=[])=>{
    const rolarUma=async formula=>{
      assert.ok(dados.length,'faltou um dado no teste');
      if(!/d20/.test(formula))return {total:dados.shift(),natural:null,formula,resumo:formula};
      const m=/(\d+)d20(?:(kh|kl)1)?/.exec(formula),faces=Array.from({length:Number(m[1])},()=>{assert.ok(dados.length,'faltou um d20');return dados.shift();});
      const natural=m[2]==='kh'?Math.max(...faces):m[2]==='kl'?Math.min(...faces):faces[0];let total=natural;
      for(const termo of formula.replace(m[0],'').match(/[+-](?:\d+d\d+|\d+)/g)??[]){const sinal=termo[0]==='-'?-1:1;total+=sinal*(termo.includes('d')?(assert.ok(dados.length,'faltou dado extra'),dados.shift()):Number(termo.slice(1)));}
      return {total,natural,formula,resumo:formula+' = '+total};
    };
    const rolar=async formula=>Array.isArray(formula)?{resultados:await Promise.all(formula.map(rolarUma))}:rolarUma(formula);
    s=await aplicar(s,{rev:s.rev,tipo,...extra},u,rolar);return s;
  };
  const iniciar=async()=>{
    await go('vincular',{ator:a.id,dono:'p',token:'n'});
    await go('iniciar');
    await go('iniciativa',{ator:a.id},player,[18]);
    await go('iniciativa',{ator:b.id},gm,[12]);await go('iniciativa',{ator:c.id},gm,[8]);
  };
  return {a,b,c,go,iniciar,get s(){return s;}};
}
test('importa números das fichas originais e separa as instâncias dos soldados',()=>{
 const m=mesa();assert.equal(m.a.pv,20);assert.equal(m.a.rec.feiticaria,3);assert.equal(m.b.pv,24);assert.equal(m.b.ficha.caBase,10);assert.equal(caAtual(m.b),16);assert.notEqual(m.b.id,m.c.id);assert.equal(nikki.preparacao.preparadas.length,6);
 assert.equal(publico(m.s).atores[1].ficha.caBase,undefined);
});
test('mestre rola iniciativas selecionadas em um único lote',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I'),c=adicionar(s,soldado,'Soldado II');
 s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>{throw Error('não deveria rolar ao iniciar');});
 let chamadas=0,metaRecebida;
 s=await aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[a.id,b.id,c.id]},gm,async(formulas,meta)=>{
   chamadas++;metaRecebida=meta;assert.deepEqual(formulas,['1d20+2','1d20+1','1d20+1']);
   return {resultados:[{total:12,natural:10,formula:formulas[0],resumo:'10 + 2 = 12'},{total:18,natural:17,formula:formulas[1],resumo:'17 + 1 = 18'},{total:7,natural:6,formula:formulas[2],resumo:'6 + 1 = 7'}]};
 });
 assert.equal(chamadas,1);assert.equal(metaRecebida.tipo,'iniciativa_lote');assert.deepEqual(metaRecebida.instancias.map(x=>x.titulo),['Nikki Lauda','Soldado I','Soldado II']);
 assert.deepEqual(s.atores.map(x=>x.init),[12,18,7]);assert.equal(s.fase,'turnos');assert.deepEqual(s.ordem,[b.id,a.id,c.id]);assert.match(s.historico[0],/Nikki Lauda 12.*Soldado I 18.*Soldado II 7/);
});
test('lote parcial mantém a iniciativa aberta e só resolve as fichas escolhidas',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I'),c=adicionar(s,soldado,'Soldado II');
 s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>0);
 s=await aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[a.id,c.id]},gm,async formulas=>({resultados:formulas.map((formula,i)=>({total:[15,9][i],natural:[13,8][i],formula,resumo:String([15,9][i])}))}));
 assert.equal(s.fase,'iniciativa');assert.equal(s.atores.find(x=>x.id===a.id).init,15);assert.equal(s.atores.find(x=>x.id===b.id).init,null);assert.equal(s.atores.find(x=>x.id===c.id).init,9);
 s=await aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[b.id]},gm,async formulas=>({resultados:[{total:11,natural:10,formula:formulas[0],resumo:'11'}]}));
 assert.equal(s.fase,'turnos');assert.deepEqual(s.ordem,[a.id,b.id,c.id]);
});
test('jogador não pode executar o lote de iniciativa do mestre',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado);s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>0);
 await assert.rejects(aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[a.id,b.id]},player,()=>0),/Somente o mestre/);
});
test('controle do mestre exclui ficha somente durante a preparação',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I');
 await assert.rejects(aplicar(s,{tipo:'remover',rev:s.rev,ator:a.id},player,()=>0),/Somente o mestre/);
 s=await aplicar(s,{tipo:'remover',rev:s.rev,ator:b.id},gm,()=>0);assert.deepEqual(s.atores.map(x=>x.id),[a.id]);
 const c=adicionar(s,soldado,'Soldado II');s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>0);
 await assert.rejects(aplicar(s,{tipo:'remover',rev:s.rev,ator:c.id},gm,()=>0),/preparação/i);
});
test('as sete fichas salvas usam referências e resolvem pelas regras atuais',async()=>{
 for(const f of fichasJogadores){
   const fonte=await fichaFonte(f.id);assert.equal(fonte.versaoFormato,2);assert.ok(fonte.concessoes.length);assert.equal(fonte.opcoes,undefined);assert.equal(fonte.passivas,undefined);
   assert.ok(f.opcoes.every(o=>(o.automacao?.alcanceM??0)<=LIMITE_ALCANCE_M),f.nome+' excede o alcance do sistema');
   assert.ok(f.inventario.itens.every(i=>Number.isFinite(i.pesoKg)&&i.pesoKg>=0),f.nome+' possui item sem peso');
   const ocupados=new Map();
   for(const item of f.inventario.itens.filter(i=>i.equipado))for(const slot of slotsOcupadosItem(item)){assert.ok(!ocupados.has(slot),f.nome+' possui conflito em '+slot);ocupados.set(slot,item.id);}
 }
});
test('auditoria de nível 3 preserva progressão, perícias e recursos sem custos falsos da conversão',()=>{
 const porId=id=>fichasJogadores.find(f=>f.id===id);
 for(const f of fichasJogadores){assert.equal(f.classes.reduce((n,c)=>n+c.nivel,0),3,f.nome);assert.equal(f.proficiencia,2,f.nome);assert.ok(f.classes[0].subclasse,f.nome+' sem subclasse');}
 assert.equal(porId('loteria').pvMaximos,21);assert.equal(porId('loteria').pericias.Medicina,3);assert.equal(porId('loteria').opcoes.find(o=>o.id==='metabolismo-incomum-acao').automacao.cura,'1d6+3');
 assert.equal(porId('hannah-montana').pericias.Persuasão,7);assert.equal(porId('hannah-montana').pericias.Investigação,4);assert.equal(porId('zurich').pericias.Percepção,6);assert.equal(porId('dragoberto').pericias.Sobrevivência,4);assert.equal(porId('draven-thorne').pericias.Intimidação,1);assert.equal(porId('skimi').pericias.Prestidigitação,4);
 const draven=porId('draven-thorne');assert.ok(draven.opcoes.filter(o=>o.id!=='surto-de-acao-acao').every(o=>!o.custo?.some(c=>c.id==='surto-de-acao')));
 const hannah=porId('hannah-montana');assert.ok(hannah.opcoes.every(o=>!o.custo?.some(c=>c.id==='magia-fascinante')));
 assert.ok(porId('skimi').opcoes.filter(o=>o.id!=='astucia-magica-acao').every(o=>!o.custo?.some(c=>c.id==='astucia-magica')));
 // "Gastar Dado de Vida" (#25) é a única opção legítima que consome o recurso.
 for(const f of fichasJogadores)assert.ok(f.opcoes.every(o=>o.id==='gastar-dado-de-vida'||!o.custo?.some(c=>c.id==='dados-de-vida')),f.nome+' ainda gasta Dado de Vida em uma ação comum');
 const dragoberto=porId('dragoberto'),sopros=dragoberto.opcoes.filter(o=>o.id.startsWith('ataque-de-sopro-'));assert.deepEqual(sopros.map(o=>o.automacao.area.forma).sort(),['cone','linha']);assert.ok(sopros.every(o=>o.automacao.dano==='1d10'&&o.automacao.metade&&o.automacao.cd===11));
 assert.deepEqual(dragoberto.opcoes.filter(o=>o.grupoExclusivo==='presa-do-cacador'&&o.ativa!==false).map(o=>o.id),['habilitado-destruidor-de-hordas-18']);
 assert.deepEqual(porId('zurich').opcoes.filter(o=>o.grupoExclusivo==='presa-do-cacador'&&o.ativa!==false).map(o=>o.id),['assassino-de-colossos-18']);
});
test('Pau pra Toda Obra melhora iniciativa e as defesas do Monge dependem de estar sem armadura',()=>{
 const s=novo(),h=adicionar(s,fichasJogadores.find(f=>f.id==='hannah-montana')),l=adicionar(s,fichasJogadores.find(f=>f.id==='loteria'));
 assert.equal(bonusIniciativa(h),3);assert.equal(caAtual(l),14);assert.equal(deslocamentoMaximo(l),12);
 l.ficha.inventario.itens.push({id:'couro-teste',nome:'Armadura de Couro',tipo:'equipamento',quantidade:1,pesoKg:5,slotEquipamento:'vestes',equipado:true,equipadoSlot:'vestes',categoriaArmadura:'leve',classeArmadura:{tipo:'base',valor:11,classe:'leve',atributo:'des'}});
 assert.equal(caAtual(l),14);assert.equal(deslocamentoMaximo(l),9);
});
test('usos gratuitos pertencem à habilidade, são exclusivos na aba e precedem o custo normal',async()=>{
 const porId=id=>fichasJogadores.find(f=>f.id===id),hannah=porId('hannah-montana'),zurich=porId('zurich'),dragoberto=porId('dragoberto'),n=porId('nikki');
 const configuradas=[
  [hannah,'1-passos-largos-elfo-31','passos-largos-da-linhagem'],
  [zurich,'1-marca-do-predador-sempre-concentracao-27','marca-do-predador'],
  [zurich,'1-palavra-curativa-iniciado-31','palavra-curativa-do-talento'],
  [zurich,'1-passos-largos-elfo-32','passos-largos-da-linhagem'],
  [dragoberto,'1-marca-do-predador-25','marca-do-predador'],
  [n,'af0ac3c8-7d39-5ef0-97e9-25839f116262','repreensao']
 ];
 for(const [f,id,recurso] of configuradas){const o=f.opcoes.find(x=>x.id===id);assert.equal(o.usoGratuito.recursoId,recurso);assert.ok(o.custo.some(c=>c.id==='espaco-1'),'o custo normal deve continuar disponível em '+id);}
 let s=novo(),a=adicionar(s,hannah),o=a.ficha.opcoes.find(x=>x.id==='1-passos-largos-elfo-31');
 assert.equal(usoGratuitoDisponivel(a,o),true);assert.equal(planoCustoOpcao(a,o).gratuito,true);assert.equal(planoCustoOpcao(a,o,'normal').gratuito,false);
 s=await aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:a.id,confirmado:true,modoCusto:'automatico'},gm,async()=>1);
 a=s.atores[0];assert.equal(a.rec['passos-largos-da-linhagem'],0);assert.equal(a.rec['espaco-1'],4);assert.equal(usoGratuitoDisponivel(a,o),false);
 s=await aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:a.id,confirmado:true,modoCusto:'automatico'},gm,async()=>1);
 a=s.atores[0];assert.equal(a.rec['espaco-1'],3);
 await assert.rejects(aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:a.id,confirmado:true,modoCusto:'gratuito'},gm,async()=>1),/Saldo insuficiente/);
 assert.equal(s.atores[0].rec['espaco-1'],3,'a aba gratuita não pode cair silenciosamente no custo normal');
});
test('rolagens públicas preservam edição do dono e GM e resumem iniciativa e salvaguardas para observadores',()=>{
 const ajuste={tipo:'ajuste',pedido:'r1',destino:'p',formula:'1d20+4',meta:{tipo:'ataque',titulo:'Ataque'}},resultado={...ajuste,tipo:'resultado',resultado:{total:17},status:'Acerto'};
 assert.equal(visibilidadeRolagem(ajuste,{id:'m',role:'GM'}).pedido.podeEditar,true);
 assert.equal(visibilidadeRolagem(ajuste,{id:'p',role:'PLAYER'}).pedido.podeEditar,true);
 assert.equal(visibilidadeRolagem(ajuste,{id:'q',role:'PLAYER'}).pedido.podeEditar,false);
 const salva={...ajuste,meta:{tipo:'salvaguarda',titulo:'Salvaguarda de DES'}};
 assert.equal(visibilidadeRolagem(salva,{id:'q',role:'PLAYER'}).tipo,'ignorar');
 assert.equal(visibilidadeRolagem({...salva,tipo:'resultado',resultado:{total:15},status:'Sucesso'},{id:'q',role:'PLAYER'}).tipo,'anuncio');
 assert.equal(visibilidadeRolagem({...resultado,meta:{tipo:'iniciativa'}},{id:'q',role:'PLAYER'}).tipo,'anuncio');
 assert.equal(visibilidadeRolagem({tipo:'fechar',pedido:'r1'},{id:'q',role:'PLAYER'}).tipo,'fechar');
});
test('salvaguardas automáticas são encaminhadas ao dono da ficha e continuam disponíveis ao GM',async()=>{
 let s=novo();const atacante=adicionar(s,soldado,'Soldado'),alvo=adicionar(s,nikki);alvo.dono='p';alvo.concentracaoAtiva={id:'concentracao',nome:'Concentração'};
 const ataque=atacante.ficha.opcoes.find(o=>o.automacao?.tipo==='ataque'),metas=[];
 await aplicar(s,{tipo:'usar',rev:s.rev,ator:atacante.id,opcao:ataque.id,alvo:alvo.id},gm,async(formula,meta)=>{
   metas.push(meta);
   if(meta.tipo==='ataque')return {total:18,natural:16,formula,resumo:'16 + 2 = 18'};
   if(meta.tipo==='dano')return {total:4,natural:null,formula,resumo:'4'};
   return {total:12,natural:10,formula,resumo:'10 + 2 = 12'};
 });
 const salva=metas.find(x=>x.tipo==='salvaguarda');assert.equal(salva.destinoId,'p');assert.equal(salva.roladorNome,'Nikki Lauda');assert.match(salva.titulo,/Concentração/);
});
test('autorização de vínculo, comando do jogador e ação excepcional do mestre',async()=>{
 const m=mesa();await m.iniciar();
 await assert.rejects(m.go('vincular',{ator:m.b.id,dono:'p'},player));
 await assert.rejects(m.go('passar',{ator:m.b.id},player));
 await assert.rejects(m.go('passar',{ator:m.a.id}),/Confirme/);
 await m.go('passar',{ator:m.a.id,confirmado:true});assert.equal(atual(m.s).id,m.b.id);assert.match(m.s.historico[0],/Mestre por Nikki/);
});
test('Nikki ataca, o soldado responde e o próximo soldado permanece independente',async()=>{
 const m=mesa();await m.iniciar();
 const fogo=nikki.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);m.s.atores[0].x=-3; // à distância, sem inimigo colado (#8)
 await m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,[15,7]);
 assert.equal(m.s.atores[1].pv,17);assert.equal(m.s.atores[2].pv,24);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player),/Saldo/);
 await m.go('passar',{ator:m.a.id},player);m.s.atores[0].x=0;
 await m.go('usar',{ator:m.b.id,opcao:soldado.opcoes.find(o=>o.automacao?.tipo==='ataque').id,alvo:m.a.id},gm,[12,5]);
 assert.equal(m.s.atores[0].pv,15);
});
test('salva por alvo e um dano compartilhado, círculo gasto, resistência e crítico',async()=>{
 const m=mesa();await m.iniciar();const sh=nikki.opcoes.find(o=>o.automacao?.raioM);
 await m.go('usar',{ator:m.a.id,opcao:sh.id,ponto:{x:1,y:0}},player,[12,19,1,18]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[14,12,18]);assert.equal(m.s.atores[0].rec['espaco-2'],1);
 const second=mesa();await second.iniciar();let formulas=[];
 const hit=nikki.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);second.s.atores[0].x=-3;
 await aplicar(second.s,{tipo:'usar',rev:second.s.rev,ator:second.a.id,opcao:hit.id,alvo:second.b.id},player,async f=>{formulas.push(f);return formulas.length===1?20:7;});assert.deepEqual(formulas,['1d20+5','2d10']);
});
test('salva de alvo acontece antes do dano, aplica efeito na falha e consome a penalidade futura',async()=>{
 const m=mesa();await m.iniciar();const talho=m.a.ficha.opcoes.find(o=>o.nome.includes('Talho Mental'));
 assert.equal(talho.automacao.tipo,'salva');assert.equal(talho.automacao.atributo,'int');
 await m.go('usar',{ator:m.a.id,opcao:talho.id,alvo:m.b.id},player,[10,4]);
 assert.equal(m.s.atores[1].pv,20);assert.equal(m.s.atores[1].efeitosAtivos[0].penalidadeProximaSalva,'1d4');assert.equal(m.s.atores[0].acao,0);
 await m.go('teste',{ator:m.b.id,grupo:'salvaguardas',chave:'con'},gm,[10,3]);
 assert.match(m.s.historico[0],/11/);assert.equal(m.s.atores[1].efeitosAtivos.length,0);
});
test('sucesso que anula o efeito cancela a rolagem de dano',async()=>{
 const m=mesa();await m.iniciar();const talho=m.a.ficha.opcoes.find(o=>o.nome.includes('Talho Mental'));let chamadas=0;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:talho.id,alvo:m.b.id},player,async(formula,meta)=>{chamadas++;assert.equal(meta.tipo,'salvaguarda');return {total:18,natural:18,formula,resumo:'18'};});
 assert.equal(chamadas,1);assert.equal(next.atores[1].pv,24);assert.equal(next.atores[1].efeitosAtivos?.length??0,0);
});
test('salva com metade rola depois do teste no alvo direto; área rola dano antes e envia cada teste ao controlador',async()=>{
 const m=mesa();await m.iniciar();const sussurros=m.a.ficha.opcoes.find(o=>o.nome.includes('Sussurros Dissonantes')),ordem=[];
 const alvo=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:sussurros.id,alvo:m.b.id},player,async(formula,meta)=>{ordem.push(meta.tipo);return meta.tipo==='salvaguarda'?{total:18,natural:18,formula,resumo:'18'}:{total:8,natural:null,formula,resumo:'8'};});
 assert.deepEqual(ordem,['salvaguarda','dano']);assert.equal(alvo.atores[1].pv,20);
 const area=mesa();await area.iniciar();const desp=area.a.ficha.opcoes.find(o=>o.automacao?.raioM&&!o.automacao.origemArea),chamadas=[];
 await aplicar(area.s,{tipo:'usar',rev:area.s.rev,ator:area.a.id,opcao:desp.id,ponto:{x:1,y:0}},player,async(formula,meta)=>{chamadas.push(meta);return {total:meta.tipo==='dano'?12:20,natural:meta.tipo==='salvaguarda'?16:null,formula,resumo:'teste'};});
 assert.equal(chamadas[0].tipo,'dano');assert.deepEqual(chamadas.filter(x=>x.tipo==='salvaguarda').map(x=>x.destinoId),['p','GM','GM']);
});
test('mover 3,4 custa cinco metros e não se pode exceder o saldo',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[1].x=20;m.s.atores[2].x=22;await m.go('mover',{ator:m.a.id,x:3,y:4},player);assert.equal(m.s.atores[0].metros,4);
 await assert.rejects(m.go('mover',{ator:m.a.id,x:7,y:8},player),/insuficiente/);
});
test('Imobilizar (antigo Agarrar), Derrubar e Empurrar são habilidades distintas; Empurrar desloca só na falha',async()=>{
 const nomes=mesa().a.ficha.opcoes.map(o=>o.nome);assert.ok(nomes.includes('Imobilizar | ação'));assert.ok(nomes.includes('Derrubar | ação'));assert.ok(nomes.includes('Empurrar | ação'));assert.ok(!nomes.some(n=>n.includes('Agarrar ou empurrar')));
 const antiga=structuredClone(nikki),base='be7ecce8-1c0b-5ee4-a39b-09dc4c33f0fe';antiga.opcoes=antiga.opcoes.filter(o=>!o.id.startsWith(base));antiga.opcoes.push({id:base,nome:'Agarrar ou empurrar | ação',categoria:'acao',descricao:'Opção antiga combinada.',custo:[{tipo:'acao',quantidade:1}]});const migrada=validar(antiga);assert.deepEqual(migrada.opcoes.filter(o=>o.id.startsWith(base)).map(o=>o.nome),['Imobilizar | ação','Derrubar | ação','Empurrar | ação']);
 const falha=mesa();await falha.iniciar();const empurrar=falha.a.ficha.opcoes.find(o=>o.nome==='Empurrar | ação');
 await falha.go('usar',{ator:falha.a.id,opcao:empurrar.id,alvo:falha.b.id},player,[5]);assert.equal(falha.s.atores[1].x,2.5);assert.equal(falha.s.atores[1].y,0);assert.match(falha.s.historico[0],/empurrado 1.5 m/);
 const sucesso=mesa();await sucesso.iniciar();const outra=sucesso.a.ficha.opcoes.find(o=>o.nome==='Empurrar | ação');await sucesso.go('usar',{ator:sucesso.a.id,opcao:outra.id,alvo:sucesso.b.id},player,[10]);assert.equal(sucesso.s.atores[1].x,1);
});
test('deslocamento forçado de área usa o centro da magia como origem do vetor',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'onda-area',nome:'Onda de teste',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributos:['for','des'],cd:20,alcanceM:18,raioM:3,excluirConjurador:true,deslocamentoForcado:{distanciaM:1.5,direcao:'afastar'}}});
 await m.iniciar();m.s.atores[1].x=2;m.s.atores[1].y=0;m.s.atores[2].x=1;m.s.atores[2].y=1;
 await m.go('usar',{ator:m.a.id,opcao:'onda-area',ponto:{x:1,y:0}},player,[1,1]);
 assert.equal(m.s.atores[1].x,3.5);assert.equal(m.s.atores[1].y,0);assert.equal(m.s.atores[2].x,1);assert.equal(m.s.atores[2].y,2.5);
});
test('falha de dados, revisão obsoleta e alvo fora do alcance preservam saldos',async()=>{
 const m=mesa();await m.iniciar();const o=nikki.opcoes.find(o=>o.automacao?.raioM);
 const antes=structuredClone(m.s);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,ponto:{x:50,y:0}},player),/alcance/);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,ponto:{x:0,y:0}},player));
 await assert.rejects(m.go('passar',{ator:m.a.id,rev:-1},player),/mudou/);assert.deepEqual(m.s,antes);
});
test('reação fora do turno consome uso gratuito só uma vez; descanso recupera',async()=>{
 const m=mesa();await m.iniciar();await m.go('passar',{ator:m.a.id},player);
 const opt=nikki.opcoes.find(o=>o.nome.includes('| Repreensão Diabólica'));
 await m.go('reagir',{ator:m.a.id,opcao:opt.id},player);assert.equal(m.s.atores[0].rec.repreensao,0);
 await assert.rejects(m.go('reagir',{ator:m.a.id,opcao:opt.id},player));await m.go('encerrar');await m.go('descanso',{periodo:'longo'});assert.equal(m.s.atores[0].rec.repreensao,1);
});
test('vínculo duplicado ou JSON inválido são rejeitados; nível dez e campos extensíveis sobrevivem',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,token:'x'});await assert.rejects(m.go('vincular',{ator:m.b.id,token:'x'}));
 const f=structuredClone(nikki);f.classes=[{id:'feiticeiro',nivel:6},{id:'bardo',nivel:4}];f.concentracao={origem:'efeito'};assert.deepEqual(validar(f).concentracao,f.concentracao);f.classes[1].nivel++;assert.throws(()=>validar(f));
});
test('Feitiçaria Inata custa uma ação bônus, conserva a ação e modifica a CD da classe',async()=>{
 const m=mesa();await m.iniciar();
 await m.go('usar',{ator:m.a.id,opcao:'feiticaria-inata'},player);
 assert.equal(m.s.atores[0].bonus,0);assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec.inata,1);
 const sh=nikki.opcoes.find(o=>o.automacao?.raioM);
 await m.go('usar',{ator:m.a.id,opcao:sh.id,ponto:{x:1,y:0}},player,[10,20,9,20]);
 // Soldado I rola 9+4 = 13, insuficiente contra CD 14.
 assert.equal(m.s.atores[1].pv,14);
});
test('ataque declarativo usa escala de nível total e proficiência',()=>{
 const f=structuredClone(nikki);f.classes[0].nivel=10;
 f.opcoes.push({id:'teste',nome:'Ataque escalonado',categoria:'magia',selecao:{tipo:'alvos',max:1,alcanceM:36},etapas:[{tipo:'ataque_contra_ca',atributo:'car',somarProficiencia:true},{tipo:'dano',quando:'acerto',parcelas:[{tipo:'fogo',dados:'1d10',escalaPorNivelTotal:[{nivel:5,dados:'2d10'}]}]}]});
 const opcao=validar(f).opcoes.find(o=>o.id==='teste');
 assert.equal(opcao.automacao.dano,'2d10');assert.equal(opcao.automacao.alcanceM,18);assert.equal(opcao.selecao.alcanceM,18);
});
test('alcances acima de 18 m são limitados sem reduzir o raio da área',()=>{
 const f=structuredClone(nikki);
 f.opcoes.push({id:'area-longa',nome:'Área longa',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributo:'des',cd:13,alcanceM:45,raioM:6,dano:'2d6'},descricao:'Ação · 45 m · esfera de 6 m.'});
 const o=validar(f).opcoes.find(x=>x.id==='area-longa');
 assert.equal(o.automacao.alcanceM,18);assert.equal(o.automacao.raioM,6);assert.match(o.descricao,/18 m/);
});


test('Mísseis Mágicos migram, repetem alvos e gastam um espaço por conjuração',async()=>{
 const m=mesa();await m.iniciar();
 const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);
 await m.go('usar',{ator:m.a.id,opcao:o.id,alvos:[m.b.id,m.b.id,m.c.id]},player,[3,4,5]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[20,17,19]);assert.equal(m.s.atores[0].rec['espaco-1'],3);
});
test('Mísseis Mágicos enviam todas as setas em uma rolagem conjunta identificada',async()=>{
 const m=mesa();await m.iniciar();const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);let chamada;
 const proximo=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:o.id,alvos:[m.b.id,m.b.id,m.c.id]},player,async(formulas,meta)=>{chamada={formulas,meta};return {resultados:[4,5,6]};});
 assert.deepEqual(chamada.formulas,['1d4+1','1d4+1','1d4+1']);assert.equal(chamada.meta.tipo,'dano-lote');
 assert.deepEqual(chamada.meta.instancias.map(x=>x.alvo),['Soldado I','Soldado I','Soldado II']);assert.deepEqual(proximo.atores.map(a=>a.pv),[20,15,18]);
});
test('alvos incompletos, duplicados proibidos ou ausentes não gastam recursos',async()=>{
 const m=mesa();await m.iniciar();
 const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvos:[m.b.id]},player),/Quantidade/);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvos:[m.b.id,m.b.id,'inexistente']},player),/ausente/);
 assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec['espaco-1'],4);
});
test('Bênção permite menos alvos, recusa repetição e aplica dado nas salvas',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'bencao-teste',nome:'Bênção',categoria:'magia',circuloBase:1,custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'espaco-1',quantidade:1}]});
 m.a.ficha.preparacao.semprePreparadas.push('bencao-teste');
 await m.iniciar();
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'bencao-teste',alvos:[m.a.id,m.a.id]},player),/diferentes/);
 await m.go('usar',{ator:m.a.id,opcao:'bencao-teste',alvos:[m.a.id]},player);
 assert.deepEqual(m.s.atores[0].bencao.alvos,[m.a.id]);
 await m.go('teste',{ator:m.a.id,grupo:'salvaguardas',chave:'con'},player,[10,3]);
 assert.match(m.s.historico[0],/17/);
});
test('Bênção fora de combate expira pelo relógio e renova a duração corretamente',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'bencao-tempo',nome:'Bênção',categoria:'magia',circuloBase:1,custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'espaco-1',quantidade:1}]});m.a.ficha.preparacao.semprePreparadas.push('bencao-tempo');
 await m.go('vincular',{ator:m.a.id,dono:'p'});await m.go('usar',{ator:m.a.id,opcao:'bencao-tempo',alvos:[m.a.id]},player,[12]);
 assert.equal(m.s.atores[0].bencao.segundosRestantes,60);
 await m.go('avancarTempo',{passo:'30seg'});assert.equal(m.s.atores[0].bencao.segundosRestantes,30);
 await m.go('avancarTempo',{passo:'30seg'});assert.equal(m.s.atores[0].bencao,undefined);
 await m.go('usar',{ator:m.a.id,opcao:'bencao-tempo',alvos:[m.a.id]},player,[12]);
 await m.go('avancarTempo',{passo:'1t'});assert.equal(m.s.atores[0].bencao.segundosRestantes,54);
 await m.go('avancarTempo',{passo:'1min'});assert.equal(m.s.atores[0].bencao,undefined);
});
test('rajada com testes de ataque resolve cada projétil e suporta alvos repetidos',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'rajada',nome:'Rajada',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],selecao:{tipo:'alvos',min:3,max:3,repetirAlvo:true},automacao:{tipo:'ataque',bonus:5,dano:'1d6',elemento:'fogo',alcanceM:18}});
 await m.iniciar();m.s.atores[0].x=-3;
 await m.go('usar',{ator:m.a.id,opcao:'rajada',alvos:[m.b.id,m.c.id,m.b.id]},player,[12,1,18,3,4]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[20,17,24]);
});
test('círculo superior requer quatro dardos e gasta o recurso correto',async()=>{
 const m=mesa();await m.iniciar();
 const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe),derivada=derivarOpcaoCirculo(m.s.atores[0],o,2);
 assert.equal(derivada.selecao.max,4);assert.equal(m.s.atores[0].ficha.opcoes.some(x=>x.varianteDe===o.id),false);
 await m.go('usar',{ator:m.a.id,opcao:o.id,circuloUsado:2,alvos:[m.b.id,m.b.id,m.b.id,m.b.id]},player,[2,2,2,2]);
 assert.equal(m.s.atores[0].rec['espaco-1'],4);assert.equal(m.s.atores[0].rec['espaco-2'],1);
});
test('M04 deriva círculo, custo e escala da mesma magia sem alterar a definição',async()=>{
 const m=mesa();await m.iniciar();const a=m.s.atores[0],o=a.ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);
 assert.deepEqual(circulosConjuracao(a,o),[1,2]);
 const base=derivarOpcaoCirculo(a,o,1),superior=derivarOpcaoCirculo(a,o,2);
 assert.equal(base.selecao.max,3);assert.equal(superior.selecao.max,4);assert.equal(o.selecao.max,3);
 assert.equal(planoCustoOpcao(a,base).custos.find(c=>c.tipo==='recurso').id,'espaco-1');
 assert.equal(planoCustoOpcao(a,superior).custos.find(c=>c.tipo==='recurso').id,'espaco-2');
 const antes={acao:a.acao,e1:a.rec['espaco-1'],e2:a.rec['espaco-2']};
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,circuloUsado:3,alvos:[m.b.id,m.b.id,m.b.id,m.b.id,m.b.id]},player),/Círculo de conjuração indisponível/);
 assert.deepEqual({acao:a.acao,e1:a.rec['espaco-1'],e2:a.rec['espaco-2']},antes);
});
test('ataque aceita dado extra e modificador antes da rolagem',async()=>{
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);m.s.atores[0].x=-3;
 await m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id,dadosAjuste:['1d4'],ajuste:0},player,[10,2,7]);
 assert.equal(m.s.atores[1].pv,17);assert.match(m.s.historico[0],/total 17/);
});
test('ataque de oportunidade pausa e interrompe o movimento no ponto do acerto',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[2].x=8;
 await m.go('mover',{ator:m.a.id,x:4,y:0},player);
 assert.equal(m.s.atores[0].x,0);assert.equal(m.s.reacaoPendente.alvo,m.a.id);assert.equal(m.s.reacaoPendente.reator,m.b.id);
 const opcao=m.b.ficha.opcoes.find(o=>o.gatilho==='sair_alcance');
 await m.go('resolverReacao',{ator:m.b.id,opcao:opcao.id,modo:'normal',ajuste:0,dadosAjuste:[]},gm,[15,5]);
 assert.equal(m.s.reacaoPendente.gatilho,'sofrer_dano');await m.go('resolverReacao',{ator:m.a.id,opcao:null},player);
 assert.equal(m.s.atores[0].pv,15);assert.equal(m.s.atores[0].x,2.5);assert.equal(m.s.atores[0].metros,6.5);assert.equal(m.s.atores[1].reacao,0);assert.equal(m.s.reacaoPendente,undefined);
 await m.go('mover',{ator:m.a.id,x:4,y:0},player);assert.equal(m.s.atores[0].x,4);
});
test('recusar oportunidade continua o movimento e perícia ausente usa o atributo',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[2].x=8;
 await m.go('mover',{ator:m.a.id,x:4,y:0},player);
 await m.go('resolverReacao',{ator:m.b.id,opcao:null},gm);
 assert.equal(m.s.atores[0].x,4);assert.equal(m.s.atores[0].metros,5);
 await m.go('passar',{ator:m.a.id},player);await m.go('teste',{ator:m.b.id,grupo:'pericias',chave:'Acrobacia'},gm,[10]);
 assert.match(m.s.historico[0],/11/);
});
test('oportunidades detecta cruzamento completo começando fora do alcance e enfileira todos os inimigos',async()=>{
 const m=mesa();m.s.fase='turnos';m.s.ordem=[m.a.id,m.b.id,m.c.id];m.s.vez=0;m.a.dono='p';m.a.x=-3;m.a.metros=12;m.b.x=0;m.c.x=4;
 const ameaças=oportunidades(m.s,m.a,{x:7,y:0});assert.deepEqual(ameaças.map(x=>x.reator),[m.b.id,m.c.id]);assert.ok(ameaças[0].t<ameaças[1].t);
 await m.go('mover',{ator:m.a.id,x:7,y:0},player);
 assert.equal(m.s.reacaoPendente.reator,m.b.id);await m.go('resolverReacao',{ator:m.b.id,opcao:null},gm);
 assert.equal(m.s.reacaoPendente.reator,m.c.id);await m.go('resolverReacao',{ator:m.c.id,opcao:null},gm);
 assert.equal(m.s.atores.find(x=>x.id===m.a.id).x,7);assert.equal(m.s.reacaoPendente,undefined);
});
test('perícias e salvaguardas podem ser roladas antes e fora do próprio turno',async()=>{
 const m=mesa();await m.go('teste',{ator:m.b.id,grupo:'pericias',chave:'Acrobacia'},gm,[10]);assert.match(m.s.historico[0],/11/);
 await m.iniciar();await m.go('teste',{ator:m.b.id,grupo:'salvaguardas',chave:'con'},gm,[10]);assert.match(m.s.historico[0],/14/);
 assert.equal(m.s.atores[1].acao,1);assert.equal(m.s.atores[1].bonus,1);assert.equal(m.s.atores[1].reacao,1);
});
test('mestre retira e recoloca uma ficha sem perder o vínculo',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p',token:'n'});await m.go('vincular',{ator:m.b.id,token:'b'});await m.go('alternarCombate',{ator:m.b.id});assert.equal(m.s.atores[1].emCombate,false);
 await m.go('iniciar');await m.go('iniciativa',{ator:m.a.id},player,[18]);await m.go('iniciativa',{ator:m.c.id},gm,[8]);
 assert.deepEqual(m.s.ordem,[m.a.id,m.c.id]);await m.go('alternarCombate',{ator:m.b.id},gm,[19,12]);
 assert.equal(m.s.atores[1].emCombate,true);assert.ok(m.s.ordem.includes(m.b.id));assert.equal(m.s.atores[1].token,'b');
});
test('painel de contexto altera valor atual e máximo de PV e recursos',async()=>{
 const m=mesa();await m.go('definirRecurso',{ator:m.a.id,campo:'pv',atual:23,maximo:25});assert.equal(m.s.atores[0].pv,23);assert.equal(m.s.atores[0].ficha.pvMaximos,25);
 await m.go('definirRecurso',{ator:m.a.id,campo:'feiticaria',atual:4,maximo:5});assert.equal(m.s.atores[0].rec.feiticaria,4);assert.equal(m.s.atores[0].ficha.recursos.find(r=>r.id==='feiticaria').maximo,5);
});
test('saque valida alvo e alcance antes do custo e transfere equipamento e PO atomicamente',async()=>{
 const m=mesa();await m.iniciar();
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'saquear',alvo:m.b.id},player),/derrotado/);
 assert.equal(m.s.atores[0].acao,1);
 m.s.atores[1].pv=0;m.s.atores[1].x=3;
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'saquear',alvo:m.b.id},player),/1,5/);
 assert.equal(m.s.atores[0].acao,1);
 m.s.atores[1].x=1;
 m.s.atores[1].ficha.inventario.itens.push({id:'ouro-saque',nome:'Moedas',tipo:'moeda',moeda:'po',valorMoedaPc:100,pesoKg:0,quantidade:20.5,empilhavel:false});
 await m.go('usar',{ator:m.a.id,opcao:'saquear',alvo:m.b.id},player);
 let a=m.s.atores[0],b=m.s.atores[1],saqueId=a.saqueAberto.id;
 assert.equal(a.acao,0);assert.ok(itensSaque(m.s,a)[0].equipado);
 assert.ok(publico(m.s).atores[0].saqueAberto.itens.length);
 const equipado=b.ficha.inventario.itens.find(i=>i.equipado),selecao=[{itemId:equipado.id,quantidade:1},{itemId:'ouro-saque',quantidade:10.25}];
 a.ficha.inventario.capacidadeCargaKg=pesoInventario(a);
 const antes=structuredClone(m.s);
 await assert.rejects(m.go('confirmarSaque',{ator:a.id,saqueId,itens:selecao},player),/capacidade/);
 assert.deepEqual(m.s,antes);
 a.ficha.inventario.capacidadeCargaKg=500;
 const saldo=saldoMoedasPc(a);
 await m.go('confirmarSaque',{ator:a.id,saqueId,itens:selecao},player);
 a=m.s.atores[0];b=m.s.atores[1];
 assert.equal(a.acao,0);assert.equal(a.saqueAberto,undefined);
 assert.equal(saldoMoedasPc(a),saldo+1025);
 assert.equal(b.ficha.inventario.itens.find(i=>i.id==='ouro-saque').quantidade,10.25);
 assert.ok(!b.ficha.inventario.itens.some(i=>i.id===equipado.id));
 const reaberta=validar(compactarFicha(b.ficha));
 assert.ok(!reaberta.inventario.itens.some(i=>i.id===equipado.id),'reabrir ficha não recria o equipamento saqueado');
 assert.ok(a.ficha.inventario.itens.some(i=>i.nome===equipado.nome&&!i.equipado));
 await assert.rejects(m.go('confirmarSaque',{ator:a.id,saqueId,itens:selecao},player),/novamente/);
});
test('saque revalida sessão, disponibilidade e alvo ao confirmar e cancelar não devolve ação',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[1].pv=0;
 await m.go('usar',{ator:m.a.id,opcao:'saquear',alvo:m.b.id},player);
 const a=m.s.atores[0],b=m.s.atores[1],saqueId=a.saqueAberto.id,item=b.ficha.inventario.itens[0];
 await assert.rejects(m.go('confirmarSaque',{ator:a.id,saqueId:'invalido',itens:[{itemId:item.id,quantidade:1}]},player),/novamente/);
 await assert.rejects(m.go('confirmarSaque',{ator:a.id,saqueId,itens:[{itemId:item.id,quantidade:999}]},player),/Quantidade/);
 b.pv=1;
 await assert.rejects(m.go('confirmarSaque',{ator:a.id,saqueId,itens:[{itemId:item.id,quantidade:1}]},player),/derrotado/);
 b.pv=0;b.x=20;
 await assert.rejects(m.go('confirmarSaque',{ator:a.id,saqueId,itens:[{itemId:item.id,quantidade:1}]},player),/1,5/);
 await m.go('cancelarSaque',{ator:a.id},player);
 assert.equal(m.s.atores[0].saqueAberto,undefined);
 assert.equal(m.s.atores[0].acao,0);
 assert.equal(m.s.atores[1].ficha.inventario.itens[0].id,item.id);
});
test('mestre avança a duração de efeitos e conserva condições sem prazo',async()=>{
 const m=mesa();
 m.s.atores[0].efeitosAtivos=[
   {id:'a',nome:'Orientação',duracao:{restante:10,expira:'inicio_alvo'}},
   {id:'b',nome:'Caído',condicao:'caido'}
 ];
 await assert.rejects(m.go('avancarTempo',{passo:'5t'},player),/Somente o mestre/);
 await m.go('avancarTempo',{passo:'30seg'});
 assert.equal(m.s.atores[0].efeitosAtivos[0].duracao.restante,5);
 await m.go('avancarTempo',{passo:'5t'});
 assert.deepEqual(m.s.atores[0].efeitosAtivos.map(e=>e.id),['b']);
 assert.equal(m.s.tempoForaCombateSeg,60);
});
test('reforço que passou da vez age logo depois e recupera a posição na rodada seguinte',async()=>{
 const m=mesa();
 await m.go('vincular',{ator:m.a.id,dono:'p',token:'n'});
 await m.go('alternarCombate',{ator:m.b.id});
 await m.go('iniciar',{pvp:true});
 assert.equal(m.s.pvp,true);
 await m.go('iniciativa',{ator:m.a.id},player,[16]);
 await m.go('iniciativa',{ator:m.c.id},gm,[8]);
 await m.go('passar',{ator:m.a.id},player);
 await m.go('alternarCombate',{ator:m.b.id},gm,[20,19]);
 assert.equal(atual(m.s).id,m.c.id);
 assert.equal(m.s.ordem[m.s.vez+1],m.b.id);
 await m.go('passar',{ator:m.c.id});
 await m.go('passar',{ator:m.b.id});
 assert.equal(m.s.rodada,2);
 assert.equal(atual(m.s).id,m.b.id);
 await m.go('encerrar');
 assert.equal(m.s.pvp,false);
});
test('PvP habilita ameaças de oportunidade entre jogadores no mesmo lado',()=>{
 const m=mesa();
 m.b.ficha.tipo='pj';
 m.b.ficha.lado=m.a.ficha.lado;
 m.c.emCombate=false;
 assert.equal(oportunidades(m.s,m.a,{x:4,y:0}).length,0);
 m.s.pvp=true;
 assert.deepEqual(oportunidades(m.s,m.a,{x:4,y:0}).map(x=>x.reator),[m.b.id]);
});

test('dono salva sua ficha sem alterar identidade, tipo ou vínculo',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p',token:'nikki-token'});
 const editada=structuredClone(m.a.ficha);editada.id='tentativa-de-troca';editada.tipo='npc';editada.nome='Nikki Editada';editada.atributos.car=18;editada.pvMaximos=22;editada.recursos.find(r=>r.id==='feiticaria').maximo=4;
 await m.go('atualizarFicha',{ator:m.a.id,ficha:editada,pv:19,rec:{...m.a.rec,feiticaria:4}},player);
 const a=m.s.atores[0];assert.equal(a.ficha.id,'nikki');assert.equal(a.ficha.tipo,'pj');assert.equal(a.nome,'Nikki Editada');assert.equal(a.ficha.atributos.car,18);assert.equal(a.pv,19);assert.equal(a.rec.feiticaria,4);assert.equal(a.token,'nikki-token');assert.equal(a.dono,'p');
});

test('jogador não edita NPC e mestre edita qualquer ficha com confirmação para PJ',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});const npc=structuredClone(m.b.ficha);npc.caBase=18;
 await assert.rejects(m.go('atualizarFicha',{ator:m.b.id,ficha:npc,pv:m.b.pv,rec:{}},player),/não controla/);
 await m.go('atualizarFicha',{ator:m.b.id,ficha:npc,pv:m.b.pv,rec:{}},gm);assert.equal(m.s.atores[1].ficha.caBase,18);
 const pj=structuredClone(m.a.ficha);pj.caBase=17;await assert.rejects(m.go('atualizarFicha',{ator:m.a.id,ficha:pj,pv:m.a.pv,rec:m.a.rec},gm),/Confirme/);
 await m.go('atualizarFicha',{ator:m.a.id,ficha:pj,pv:m.a.pv,rec:m.a.rec,confirmado:true},gm);assert.equal(m.s.atores[0].ficha.caBase,17);
});

test('salvamento inválido é atômico e não corrompe a ficha carregada',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});const antes=structuredClone(m.s),ruim=structuredClone(m.a.ficha);ruim.atributos.for=99;
 await assert.rejects(m.go('atualizarFicha',{ator:m.a.id,ficha:ruim,pv:20,rec:m.a.rec},player),/atributos/);assert.deepEqual(m.s,antes);
});

test('Armadura Arcana: CA 12 sem armadura (#9), aplica +2 fora de combate e termina no descanso longo',async()=>{
 const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana'));
 assert.equal(m.a.ficha.caBase,12);assert.equal(o.automacao.tipo,'efeito');assert.equal(caAtual(m.a),12);
 await m.go('vincular',{ator:m.a.id,dono:'p'});const espacos=m.a.rec['espaco-1'];
 await m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.a.id},player);
 assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec['espaco-1'],espacos-1);assert.equal(caAtual(m.s.atores[0]),15);
 assert.equal(m.s.atores[0].efeitosAtivos[0].modificadores.ca,3);assert.equal(m.s.atores[0].efeitosAtivos[0].removeEm,'descanso_longo');
 await m.go('descanso',{periodo:'curto'});assert.equal(caAtual(m.s.atores[0]),15);
 await m.go('descanso',{periodo:'longo'});assert.equal(caAtual(m.s.atores[0]),12);assert.equal(m.s.atores[0].efeitosAtivos.length,0);
});

test('Armadura Arcana rejeita alvo com armadura sem gastar o espaço',async()=>{
 const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana')),antes=structuredClone(m.s);
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 const estado=structuredClone(m.s);await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.b.id},player),/usando armadura/);assert.deepEqual(m.s,estado);assert.notDeepEqual(m.s,antes);
});
test('Armadura Arcana aceita veste comum, mas escudo e armaduras leve, média ou pesada bloqueiam',async()=>{
 const preparar=(categoria,nome='Veste de viagem')=>{const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana'));m.b.ficha.inventario.itens=m.b.ficha.inventario.itens.map(i=>({...i,equipado:false,equipadoSlot:undefined}));m.b.ficha.inventario.itens.push({id:'proteção-teste',nome,descricao:'',tipo:'equipamento',quantidade:1,pesoKg:1,slotEquipamento:categoria==='escudo'?'mao_fraca':'vestes',equipado:true,equipadoSlot:categoria==='escudo'?'mao_fraca':'vestes',categoriaArmadura:categoria,classeArmadura:{tipo:categoria==='escudo'?'bonus':'base',valor:categoria==='veste'?10:12,classe:categoria}});return {m,o};};
 const comum=preparar('veste');await comum.m.go('vincular',{ator:comum.m.a.id,dono:'p'});await comum.m.go('usar',{ator:comum.m.a.id,opcao:comum.o.id,alvo:comum.m.b.id},player);assert.equal(comum.m.s.atores[1].efeitosAtivos.at(-1).nome,'Armadura Arcana');
 for(const categoria of ['leve','media','pesada','escudo']){const {m,o}=preparar(categoria,categoria==='escudo'?'Escudo':'Armadura '+categoria);await m.go('vincular',{ator:m.a.id,dono:'p'});await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.b.id},player),/usando armadura/);}
});

test('ações e magias ficam liberadas fora de combate sem consumir a economia de turno',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});
 const adaga=m.a.ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),misseis=m.a.ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe),espacos=m.a.rec['espaco-1'];
 m.s.atores[0].acao=0;m.s.atores[0].bonus=0;m.s.atores[0].reacao=0;
 await m.go('usar',{ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,[15,3]);
 assert.equal(m.s.atores[0].acao,0);assert.equal(m.s.atores[0].bonus,0);assert.equal(m.s.atores[0].reacao,0);assert.equal(m.s.atores[1].pv,21);
 await m.go('usar',{ator:m.a.id,opcao:misseis.id,alvos:[m.b.id,m.b.id,m.c.id]},player,[2,2,2]);
 assert.equal(m.s.atores[0].acao,0);assert.equal(m.s.atores[0].rec['espaco-1'],espacos-1);
});

test('encerrar restaura a barra e permite usar outra habilidade fora de combate',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});await m.iniciar();
 const adaga=m.a.ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);
 await m.go('usar',{ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,[15,3]);
 assert.equal(m.s.atores[0].acao,0);
 await m.go('encerrar');
 assert.equal(m.s.fase,'preparo');assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].bonus,1);assert.equal(m.s.atores[0].reacao,1);
 await m.go('usar',{ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,[15,3]);
 assert.equal(m.s.atores[0].acao,1);
});

test('efeitos genéricos somam PV máximo e deslocamento e condições restringem o turno',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'vigor-movel',nome:'Vigor e mobilidade',categoria:'magia',foraCombate:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:1.5,efeito:{nome:'Vigor e mobilidade',tipo:'buff',modificadores:{pvMaximos:5,deslocamentoM:3},removeEm:'descanso_longo',aumentaPVAtual:true}}});
 await m.go('vincular',{ator:m.a.id,dono:'p'});await m.go('usar',{ator:m.a.id,opcao:'vigor-movel',alvo:m.a.id},player);
 assert.equal(m.s.atores[0].pv,25);assert.equal(pvMaximosAtuais(m.s.atores[0]),25);assert.equal(deslocamentoMaximo(m.s.atores[0]),12);
 m.s.atores[0].efeitosAtivos.push({id:'congelado',nome:'Congelado',tipo:'condicao',restricoes:{imovel:true,semReacao:true}});
 await m.iniciar();assert.equal(m.s.atores[0].metros,0);assert.equal(m.s.atores[0].reacao,0);
});

test('rolagem composta envia um comando ao Dice+ e pré-configura o dano crítico',async()=>{
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),chamadas=[];m.s.atores[0].x=-3;
 const rolar=async(formula,meta)=>{chamadas.push({formula,meta});return chamadas.length===1?{total:27,natural:20,formula,resumo:'20+7=27'}:{total:14,natural:null,formula,resumo:'14'};};
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id,modo:'vantagem',ajuste:2,dadosAjuste:['1d4']},player,rolar);
 assert.equal(chamadas.length,2);assert.equal(chamadas[0].formula,'2d20kh1+7+1d4');assert.equal(chamadas[0].meta.cd,16);
 assert.equal(chamadas[1].formula,'2d10');assert.equal(chamadas[1].meta.critico,true);assert.equal(s.atores[1].pv,10);assert.equal(s.atores[0].acao,0);
});

test('ataque que falha também confirma o custo da ação',async()=>{
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),chamadas=[];m.s.atores[0].x=-3;
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,async(formula,meta)=>{chamadas.push({formula,meta});return {total:9,natural:4,formula,resumo:'4+5=9'};});
 assert.equal(chamadas.length,1);assert.equal(s.atores[0].acao,0);assert.equal(s.atores[1].pv,24);assert.match(s.historico[0],/errou/);
});

test('armas arremessáveis recebem ações próprias e desvantagem após o alcance normal',async()=>{
 const m=mesa(),variantes=opcoesDisponiveis(m.a).filter(o=>o.geradaPorItem&&o.automacao.arremesso);
 assert.equal(variantes.length,3);assert.deepEqual(variantes.map(o=>o.automacao.alcanceNormalM),[6,6,6]);assert.ok(variantes.every(o=>o.automacao.alcanceM===18));
 await m.iniciar();m.s.atores[1].x=10;const adaga=variantes[0],formulas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,async f=>{formulas.push(f);return {total:9,natural:4,formula:f,resumo:'4+5=9'};});
 assert.equal(formulas[0],'2d20kl1+4');assert.equal(s.atores[0].acao,0);assert.match(s.historico[0],/errou/);
});

test('nova concentração encerra a anterior e remove seus efeitos de todos os alvos',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push(
  {id:'concentracao-a',nome:'Concentração A',categoria:'magia',concentracao:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Imobilizado A',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:10,expira:'inicio_origem'}}}},
  {id:'concentracao-b',nome:'Concentração B',categoria:'magia',concentracao:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Imobilizado B',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:10,expira:'inicio_origem'}}}}
 );
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'concentracao-a',alvo:m.b.id},player);const primeira=m.s.atores[0].concentracaoAtiva.id;
 assert.ok(temCondicao(m.s.atores[1],'imobilizado'));assert.equal(m.s.atores[1].efeitosAtivos[0].concentracaoId,primeira);
 await m.go('usar',{ator:m.a.id,opcao:'concentracao-b',alvo:m.c.id},player);
 assert.notEqual(m.s.atores[0].concentracaoAtiva.id,primeira);assert.equal(m.s.atores[1].efeitosAtivos.length,0);assert.ok(temCondicao(m.s.atores[2],'imobilizado'));
 await m.go('encerrarConcentracao',{ator:m.a.id},player);assert.equal(m.s.atores[0].concentracaoAtiva,undefined);assert.equal(m.s.atores[2].efeitosAtivos.length,0);
});

test('dano pede salvaguarda de concentração e remove efeito vinculado na falha',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'concentracao-dano',nome:'Concentração de teste',categoria:'magia',concentracao:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Alvo preso',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:10,expira:'inicio_origem'}}}});
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'concentracao-dano',alvo:m.b.id},player);await m.iniciar();await m.go('passar',{ator:m.a.id},player);await m.go('passar',{ator:m.b.id},gm);
 m.s.atores[2].x=1;const ataque=m.c.ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');await m.go('usar',{ator:m.c.id,opcao:ataque.id,alvo:m.a.id},gm,[15,5,4]);
 assert.equal(m.s.atores[0].concentracaoAtiva,undefined);assert.equal(m.s.atores[1].efeitosAtivos.length,0);assert.match(m.s.historico[1],/perdeu a concentração/);
});

test('duração expira no evento configurado e condições alimentam restrições genéricas',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'efeito-curto',nome:'Efeito curto',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Imobilizado',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:1,expira:'fim_origem'}}}});
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'efeito-curto',alvo:m.b.id},player);assert.deepEqual(restricoesAtivas(m.s.atores[1]).desvantagemSalvas,['des']);
 await m.iniciar();assert.ok(temCondicao(m.s.atores[1],'imobilizado'));await m.go('passar',{ator:m.a.id},player);assert.equal(m.s.atores[1].efeitosAtivos.length,0);
});

test('salvaguarda falha automaticamente quando a condição determina',async()=>{
 const m=mesa();m.b.efeitosAtivos=[{id:'atordoado',nome:'Atordoado',tipo:'condicao',condicao:'atordoado'}];let rolou=false;
 const s=await aplicar(m.s,{tipo:'teste',rev:m.s.rev,ator:m.b.id,grupo:'salvaguardas',chave:'for'},gm,async()=>{rolou=true;return 20;});
 assert.equal(rolou,false);assert.match(s.historico[0],/falha automática/);
});

test('condições alteram vantagem de ataques e crítico corpo a corpo',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[1].x=10;m.s.atores[1].efeitosAtivos=[{id:'paralisado',nome:'Paralisado',tipo:'condicao',condicao:'paralisado'}];
 const fogo=m.s.atores[0].ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),formulas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,async(formula,meta)=>{formulas.push({formula,meta});return formulas.length===1?{total:19,natural:14,formula,resumo:'19'}:{total:8,natural:null,formula,resumo:'8'};});
 assert.equal(formulas[0].formula,'2d20kh1+5');assert.equal(formulas[1].formula,'1d10');assert.equal(s.atores[1].pv,16);
 const corpo=mesa();await corpo.iniciar();corpo.s.atores[1].efeitosAtivos=[{id:'paralisado',nome:'Paralisado',tipo:'condicao',condicao:'paralisado'}];
 const adaga=corpo.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),usadas=[];
 await aplicar(corpo.s,{tipo:'usar',rev:corpo.s.rev,ator:corpo.a.id,opcao:adaga.id,alvo:corpo.b.id},player,async(formula,meta)=>{usadas.push({formula,meta});return usadas.length===1?{total:19,natural:15,formula,resumo:'19'}:{total:6,natural:null,formula,resumo:'6'};});
 assert.equal(usadas[0].formula,'2d20kh1+4');assert.equal(usadas[1].formula,'2d4+2');assert.equal(usadas[1].meta.critico,true);
});

test('cura respeita PV máximo e remove o estado inconsciente',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'cura-teste',nome:'Cura de teste',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'cura',alcanceM:18,formula:'1d8+3'}});await m.go('vincular',{ator:m.a.id,dono:'p'});
 m.s.atores[1].pv=0;m.s.atores[1].estadoVida='inconsciente';m.s.atores[1].salvaguardasMorte={sucessos:1,falhas:2};
 await m.go('usar',{ator:m.a.id,opcao:'cura-teste',alvo:m.b.id},player,[9]);assert.equal(m.s.atores[1].pv,9);assert.equal(m.s.atores[1].estadoVida,'consciente');assert.deepEqual(m.s.atores[1].salvaguardasMorte,{sucessos:0,falhas:0});
 m.s.atores[1].pv=22;await m.go('usar',{ator:m.a.id,opcao:'cura-teste',alvo:m.b.id},player,[9]);assert.equal(m.s.atores[1].pv,24);
});

test('PV temporários conservam o maior valor e absorvem dano antes dos PV',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'temp-oito',nome:'PV temporários 8',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'pv_temporario',alcanceM:18,valor:8}},{id:'temp-cinco',nome:'PV temporários 5',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'pv_temporario',alcanceM:18,valor:5}});await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'temp-oito',alvo:m.b.id},player);await m.go('usar',{ator:m.a.id,opcao:'temp-cinco',alvo:m.b.id},player);assert.equal(m.s.atores[1].pvTemporarios,8);
 await m.go('ajustar',{ator:m.b.id,campo:'pv',valor:-10});assert.equal(m.s.atores[1].pvTemporarios,0);assert.equal(m.s.atores[1].pv,22);
});

test('redução a 0 PV, salvaguarda contra a morte e 20 natural recuperando 1 PV',async()=>{
 const m=mesa();await m.iniciar();await m.go('ajustar',{ator:m.a.id,campo:'pv',valor:-20,confirmado:true});assert.equal(m.s.atores[0].pv,0);assert.equal(m.s.atores[0].estadoVida,'inconsciente');
 await m.go('passar',{ator:m.a.id},player);
 await m.go('passar',{ator:m.b.id});
 await m.go('passar',{ator:m.c.id},gm,[20]);
 assert.equal(m.s.atores[0].pv,1);assert.equal(m.s.atores[0].estadoVida,'consciente');assert.equal(m.s.atores[0].acao,1);assert.match(m.s.historico[0],/20 natural/);
});

test('1T fora de combate encaminha a salvaguarda ao dono e estabiliza no terceiro sucesso',async()=>{
 const m=mesa();
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('ajustar',{ator:m.a.id,campo:'pv',valor:-20,confirmado:true});
 await m.go('avancarTempo',{passo:'30seg'});
 for(let sucesso=1;sucesso<=3;sucesso++){
   const antes=m.s;
   const depois=await aplicar(antes,{tipo:'avancarTempo',passo:'1t',rev:antes.rev},gm,async(formula,meta)=>{
     assert.equal(formula,'1d20');
     assert.equal(meta.destinoId,'p');
     assert.equal(meta.cd,10);
     return {total:10,natural:10};
   });
   await m.go('avancarTempo',{passo:'1t'},gm,[10]);
   assert.deepEqual(m.s.atores[0].salvaguardasMorte,depois.atores[0].salvaguardasMorte);
   assert.equal(m.s.atores[0].salvaguardasMorte.sucessos,sucesso===3?0:sucesso);
 }
 assert.equal(m.s.atores[0].estadoVida,'estavel');
 await m.go('avancarTempo',{passo:'1t'});
});

test('Ajudar gasta a ação em combate e só estabiliza se Medicina passar',async()=>{
 const m=mesa();const aliado=adicionar(m.s,nikki,'Aliado');
 aliado.emCombate=false;
 await m.iniciar();
 Object.assign(m.s.atores.find(a=>a.id===aliado.id),{x:1,y:0,pv:0,estadoVida:'inconsciente',salvaguardasMorte:{sucessos:0,falhas:2}});
 await m.go('usar',{ator:m.a.id,opcao:'ajudar-estabilizar',alvo:aliado.id},player,[2]);
 assert.equal(m.s.atores[0].acao,0);
 assert.equal(m.s.atores.find(a=>a.id===aliado.id).estadoVida,'inconsciente');
 await m.go('encerrar');
 await m.go('usar',{ator:m.a.id,opcao:'ajudar-estabilizar',alvo:aliado.id},player,[19]);
 const alvo=m.s.atores.find(a=>a.id===aliado.id);
 assert.equal(alvo.pv,0);assert.equal(alvo.estadoVida,'estavel');
 assert.deepEqual(alvo.salvaguardasMorte,{sucessos:0,falhas:0});
});

test('0 PV marca duas falhas com 1 natural e dano igual aos PV máximos mata',async()=>{
 const m=mesa();
 await m.go('ajustar',{ator:m.a.id,campo:'pv',valor:-20,confirmado:true});
 await m.go('avancarTempo',{passo:'1t'},gm,[1]);
 assert.equal(m.s.atores[0].salvaguardasMorte.falhas,2);
 await m.go('ajustar',{ator:m.a.id,campo:'pv',valor:-20,confirmado:true});
 assert.equal(m.s.atores[0].estadoVida,'morto');
 await m.go('descanso',{periodo:'longo'});
 assert.equal(m.s.atores[0].estadoVida,'morto');
});

test('dano massivo mata e estabilizar encerra salvaguardas contra a morte',async()=>{
 const m=mesa();await m.go('ajustar',{ator:m.b.id,campo:'pv',valor:-50});assert.equal(m.s.atores[1].estadoVida,'morto');
 const outro=mesa();outro.a.ficha.opcoes.push({id:'estabilizar',nome:'Estabilizar',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'estabilizar',alcanceM:1.5}});await outro.go('vincular',{ator:outro.a.id,dono:'p'});outro.s.atores[1].pv=0;outro.s.atores[1].estadoVida='inconsciente';outro.s.atores[1].salvaguardasMorte={sucessos:1,falhas:2};
 await outro.go('usar',{ator:outro.a.id,opcao:'estabilizar',alvo:outro.b.id},player);assert.equal(outro.s.atores[1].estadoVida,'estavel');assert.deepEqual(outro.s.atores[1].salvaguardasMorte,{sucessos:0,falhas:0});
});

test('estado inconsciente concede vantagem e ataques corpo a corpo causam duas falhas',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[1].pv=0;m.s.atores[1].estadoVida='inconsciente';m.s.atores[1].salvaguardasMorte={sucessos:0,falhas:0};
 const adaga=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),formulas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,async(formula,meta)=>{formulas.push({formula,meta});return formulas.length===1?{total:19,natural:15,formula,resumo:'19'}:{total:4,natural:null,formula,resumo:'4'};});
 assert.equal(formulas[0].formula,'2d20kh1+4');assert.equal(formulas[1].formula,'2d4+2');assert.equal(s.atores[1].salvaguardasMorte.falhas,2);
});
test('aprimoramento após acerto entra no ajuste de dano e só então gasta o recurso',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'superioridade',nome:'Dados de Superioridade',maximo:4,saldoInicial:4});m.a.rec.superioridade=4;
 m.a.ficha.opcoes.push({id:'ataque-ameacador',nome:'Ataque Ameaçador',categoria:'acao',descricao:'Após acertar, some 1d8 e force salva de SAB.',gatilho:'apos_acerto',umaVezPorTurno:true,custo:[{tipo:'recurso',id:'superioridade',quantidade:1}],aprimoramento:{dano:'1d8',elemento:'perfurante',requisitos:{tagsAtaque:['arma']},salva:{atributo:'sab',cd:13,efeitoFalha:{nome:'Amedrontado',condicao:'amedrontado',turnos:1,expira:'fim_origem'}}}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),chamadas=[];
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{
   chamadas.push({formula,meta});if(meta.tipo==='ataque')return {total:17,natural:15,formula,resumo:'15 + 2 = 17'};
   if(meta.tipo==='dano'){assert.equal(meta.adicionais[0].id,'ataque-ameacador');return {total:11,natural:null,formula,resumo:'dano',resultados:[{total:6,resumo:'1d8 = 6'},{total:5,resumo:'1d8 = 5'}],recursosAtivos:['ataque-ameacador'],rerrolagensUsadas:[]};}
   return {total:9,natural:7,formula,resumo:'7 + 2 = 9'};
 });
 assert.equal(next.atores[0].rec.superioridade,3);assert.equal(next.atores[1].pv,13);assert.equal(next.atores[1].efeitosAtivos.at(-1).condicao,'amedrontado');assert.equal(next.atores[0].usosTurno['ataque-ameacador'],true);
 assert.deepEqual(chamadas.map(x=>x.meta.tipo),['ataque','dano','salvaguarda']);
});
test('ignorar aprimoramento preserva o recurso e crítico prepara seu dado adicional',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'superioridade',nome:'Dados de Superioridade',maximo:4,saldoInicial:4});m.a.rec.superioridade=4;
 m.a.ficha.opcoes.push({id:'manobra',nome:'Manobra',categoria:'acao',gatilho:'apos_acerto',custo:[{tipo:'recurso',id:'superioridade',quantidade:1}],aprimoramento:{dano:'1d8',elemento:'perfurante'}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{
   if(meta.tipo==='ataque')return {total:20,natural:20,formula,resumo:'20'};
   assert.equal(meta.adicionais[0].formula,'2d8');return {total:7,natural:null,formula,resumo:'2d8 = 7',recursosAtivos:[],rerrolagensUsadas:[]};
 });
 assert.equal(next.atores[0].rec.superioridade,4);assert.equal(next.atores[1].pv,17);
});
test('recurso de rerrolagem é oferecido no resultado e cobrado quando usado',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'sorte',nome:'Sorte',maximo:2,saldoInicial:2});m.a.rec.sorte=2;
 m.a.ficha.opcoes.push({id:'rerrolar-dano',nome:'Sorte no Dano',categoria:'acao',descricao:'Rerrole o dano.',gatilho:'apos_rolagem_dano',custo:[{tipo:'recurso',id:'sorte',quantidade:1}],rerrolagem:{tipo:'dano',modo:'todos'}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{
   if(meta.tipo==='ataque')return {total:17,natural:15,formula,resumo:'17'};
   assert.equal(meta.rerrolagens[0].id,'rerrolar-dano');return {total:8,natural:null,formula,resumo:'1d8 = 8',recursosAtivos:[],rerrolagensUsadas:['rerrolar-dano']};
 });
 assert.equal(next.atores[0].rec.sorte,1);assert.equal(next.atores[1].pv,16);
});
test('segundo golpe exige ataque anterior e respeita limite de uma vez por turno',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'segunda-arma',nome:'Segunda arma',categoria:'acao',custo:[{tipo:'bonus',quantidade:1}],requisitosUso:{aposAtaque:true,tagsAtaqueAnterior:['arma'],umaVezPorTurno:'segunda-arma'},automacao:{tipo:'ataque',bonus:4,dano:'1d4',elemento:'perfurante',alcanceM:1.5}});
 await m.iniciar();await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'segunda-arma',alvo:m.b.id},player),/depois de realizar/);
 const principal=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);await m.go('usar',{ator:m.a.id,opcao:principal.id,alvo:m.b.id},player,[15,5]);
 await m.go('usar',{ator:m.a.id,opcao:'segunda-arma',alvo:m.b.id},player,[15,3]);assert.equal(m.s.atores[0].bonus,0);assert.equal(m.s.atores[1].pv,16);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'segunda-arma',alvo:m.b.id},player),/já foi usada|Saldo insuficiente/);
});
test('sequência resolve armas diferentes contra dois alvos pagando uma única ação',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'duas-armas',nome:'Cimitarra + Espada',categoria:'acao',custo:[{tipo:'acao',quantidade:1}],selecao:{tipo:'alvos',min:2,max:2,repetirAlvo:true},automacao:{tipo:'ataque',bonus:5,dano:'1d6+3',elemento:'cortante',alcanceM:1.5,ataques:[{bonus:5,dano:'1d6+3',elemento:'cortante',alcanceM:1.5,tags:['arma']},{bonus:5,dano:'1d6',elemento:'perfurante',alcanceM:1.5,tags:['arma']}]}});
 m.c.x=1.4;
 await m.iniciar();await m.go('usar',{ator:m.a.id,opcao:'duas-armas',alvos:[m.b.id,m.c.id]},player,[15,14,9,4]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[20,15,20]);assert.equal(m.s.atores[0].acao,0);assert.equal(m.s.atores[0].eventosTurno.ataques.length,2);assert.equal(m.s.atores[0].eventosTurno.acertos.length,2);
});
test('segundo alvo condicionado precisa ser diferente e próximo do primeiro',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'horda',nome:'Destruidor de Hordas',categoria:'acao',requisitosUso:{aposAtaque:true,tagsAtaqueAnterior:['arma'],umaVezPorTurno:'horda',alvoDiferenteDoAnterior:true,distanciaDoAlvoAnteriorM:1.5},automacao:{tipo:'ataque',bonus:4,dano:'1d6',elemento:'perfurante',alcanceM:18}});
 await m.iniciar();const principal=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);await m.go('usar',{ator:m.a.id,opcao:principal.id,alvo:m.b.id},player,[15,5]);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'horda',alvo:m.b.id},player),/diferente/);m.s.atores[2].x=1;m.s.atores[2].y=1; // mesma arma (adaga, corpo a corpo): o segundo alvo precisa estar ao alcance (#32)
 await m.go('usar',{ator:m.a.id,opcao:'horda',alvo:m.c.id},player,[15,4]);assert.equal(m.s.atores[2].pv,20);
});
test('reação genérica ao sofrer dano pausa a mesa, usa o controlador correto e retoma depois',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'repreensao-teste',nome:'Repreensão Diabólica',categoria:'magia',gatilho:'sofrer_dano',descricao:'Quando sofrer dano de uma criatura visível, reaja com fogo infernal.',custo:[{tipo:'reacao',quantidade:1},{tipo:'recurso',id:'espaco-1',quantidade:1}],automacao:{tipo:'salva',atributo:'des',cd:13,dano:'2d10',metade:true,elemento:'fogo',alcanceM:18}});
 await m.iniciar();await m.go('passar',{ator:m.a.id},player);const ataque=m.s.atores[1].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');
 await m.go('usar',{ator:m.b.id,opcao:ataque.id,alvo:m.a.id},gm,[15,5]);assert.equal(m.s.atores[0].pv,15);assert.equal(m.s.reacaoPendente.gatilho,'sofrer_dano');assert.equal(m.s.reacaoPendente.reator,m.a.id);assert.equal(m.s.reacaoPendente.alvo,m.b.id);
 await assert.rejects(m.go('passar',{ator:m.b.id},gm),/reação pendente/);
 await m.go('resolverReacao',{ator:m.a.id,opcao:'repreensao-teste'},player,[10,8]);assert.equal(m.s.atores[1].pv,16);assert.equal(m.s.atores[0].reacao,0);assert.equal(m.s.atores[0].rec['espaco-1'],3);assert.equal(m.s.reacaoPendente,undefined);
});
test('fila de reações apresenta em ordem todos os alvos que sofreram dano',async()=>{
 const m=mesa(),reacao={id:'resposta-dano',nome:'Resposta ao dano',categoria:'acao',gatilho:'sofrer_dano',custo:[{tipo:'reacao',quantidade:1}],automacao:{tipo:'ataque',bonus:4,dano:'1d6',elemento:'perfurante',alcanceM:18}};m.b.ficha.opcoes.push(reacao);m.c.ficha.opcoes.push(structuredClone(reacao));
 await m.iniciar();const area=m.a.ficha.opcoes.find(o=>o.automacao?.raioM);await m.go('usar',{ator:m.a.id,opcao:area.id,ponto:{x:1,y:0}},player,[12,12,12,6]);
 const primeiro=m.s.reacaoPendente.reator;assert.equal(m.s.filaReacoes.length,1);await m.go('resolverReacao',{ator:primeiro,opcao:null},gm);assert.notEqual(m.s.reacaoPendente.reator,primeiro);assert.equal(m.s.filaReacoes.length,0);
 await m.go('resolverReacao',{ator:m.s.reacaoPendente.reator,opcao:null},gm);assert.equal(m.s.reacaoPendente,undefined);
});
test('reação preventiva interrompe o ataque entre o acerto e o dano',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'defletir-teste',nome:'Defletir Ataques',categoria:'acao',gatilho:'ser_atingido',custo:[{tipo:'reacao',quantidade:1}],automacao:{tipo:'reduzir_dano',formula:'1d10+3'}});
 await m.iniciar();await m.go('passar',{ator:m.a.id},player);const ataque=m.s.atores[1].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');
 await m.go('usar',{ator:m.b.id,opcao:ataque.id,alvo:m.a.id},gm,[15]);assert.equal(m.s.atores[0].pv,20);assert.equal(m.s.atores[1].acao,0);assert.equal(m.s.reacaoPendente.gatilho,'ser_atingido');assert.equal(m.s.resolucaoPendente.tipo,'dano_ataque');
 await m.go('resolverReacao',{ator:m.a.id,opcao:'defletir-teste'},player,[4,5]);assert.equal(m.s.atores[0].pv,19);assert.equal(m.s.atores[0].reacao,0);assert.equal(m.s.reacaoPendente,undefined);assert.equal(m.s.resolucaoPendente,undefined);
});
test('rerrolagem de d20 aparece no resultado e cobra o recurso somente quando usada',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'sorte-d20',nome:'Ponto de Sorte',maximo:1,saldoInicial:1});m.a.rec['sorte-d20']=1;m.a.ficha.opcoes.push({id:'sorte-d20-opcao',nome:'Ponto de Sorte',categoria:'acao',gatilho:'apos_rolagem_d20',custo:[{tipo:'recurso',id:'sorte-d20',quantidade:1}],rerrolagem:{tipo:'d20',modo:'todos'}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');let chamada=0;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{chamada++;if(chamada===1){assert.equal(meta.rerrolagens[0].id,'sorte-d20-opcao');return {total:19,natural:15,formula,resumo:'15 + 4 = 19',rerrolagensUsadas:['sorte-d20-opcao']};}return {total:5,natural:null,formula,resumo:'5'};});
 assert.equal(next.atores[0].rec['sorte-d20'],0);assert.equal(next.atores[1].pv,19);
});
test('dado concedido acompanha o alvo, entra no ajuste de d20 e some quando escolhido',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'inspiracao',nome:'Inspiração de Bardo',maximo:1,saldoInicial:1});m.a.rec.inspiracao=1;m.a.ficha.opcoes.push({id:'inspirar-teste',nome:'Inspiração de Bardo',categoria:'acao',custo:[{tipo:'bonus',quantidade:1},{tipo:'recurso',id:'inspiracao',quantidade:1}],automacao:{tipo:'conceder_dado',alcanceM:18,modificador:{nome:'Inspirado',formula:'1d6',tipos:['ataque','salvaguarda','teste'],removeAoUsar:true,removeEm:'descanso_longo'}}});
 await m.go('usar',{ator:m.a.id,opcao:'inspirar-teste',alvo:m.b.id,confirmado:true},gm);assert.equal(m.s.atores[0].rec.inspiracao,0);assert.equal(m.s.atores[1].efeitosAtivos[0].modificadorRolagem.formula,'1d6');
 await m.iniciar();await m.go('passar',{ator:m.a.id},player);const ataque=m.s.atores[1].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');let chamada=0,id=m.s.atores[1].efeitosAtivos[0].id;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.b.id,opcao:ataque.id,alvo:m.c.id},gm,async(formula,meta)=>{chamada++;if(chamada===1){assert.equal(meta.adicionais[0].formula,'1d6');assert.equal(meta.combinarAdicionais,true);return {total:19,natural:14,formula,resumo:'14 + 4 + 1 = 19',recursosAtivos:[id]};}return {total:5,natural:null,formula,resumo:'5'};});
 assert.equal(next.atores[1].efeitosAtivos.some(e=>e.id===id),false);assert.equal(next.atores[2].pv,19);
});
test('marca persistente adiciona dano automaticamente nos ataques válidos da origem',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'marca-teste',nome:'Marca do Predador',categoria:'magia',concentracao:true,custo:[{tipo:'bonus',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Marcado pelo Predador',tipo:'debuff',descricao:'Ataques com arma da origem causam 1d6 adicional.',danoAoSerAtingido:{formula:'1d6',elemento:'perfurante',tagsAtaque:['arma']}}}});
 await m.iniciar();await m.go('usar',{ator:m.a.id,opcao:'marca-teste',alvo:m.b.id},player);const marca=m.s.atores[1].efeitosAtivos[0];assert.equal(marca.danoAoSerAtingido.origemAtorId,m.a.id);assert.ok(m.s.atores[0].concentracaoAtiva);
 const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');let chamada=0;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{chamada++;if(chamada===1)return {total:19,natural:15,formula,resumo:'19'};assert.equal(meta.adicionais[0].automatico,true);assert.equal(meta.adicionais[0].formula,'1d6');return {total:8,natural:null,formula,resumo:'5 + 3',recursosAtivos:[marca.id],resultados:[{total:5,resumo:'5'},{total:3,resumo:'3'}]};});
 assert.equal(next.atores[1].pv,16);assert.equal(next.atores[1].efeitosAtivos.some(e=>e.id===marca.id),true);
});
test('áreas de quadrado, cone e linha usam a geometria declarada',async()=>{
 assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2,y:0.5},{area:{forma:'cone',comprimentoM:3,larguraM:3}}),true);assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2,y:2},{area:{forma:'cone',comprimentoM:3,larguraM:3}}),false);
 assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2.5,y:.6},{area:{forma:'linha',comprimentoM:3,larguraM:1.5}}),true);assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2.5,y:1},{area:{forma:'linha',comprimentoM:3,larguraM:1.5}}),false);
 const m=mesa();m.a.ficha.opcoes.push({id:'quadrado-teste',nome:'Área quadrada',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributo:'des',cd:13,dano:'2d6',metade:true,elemento:'fogo',alcanceM:18,area:{forma:'quadrado',tamanhoM:2}}});
 await m.iniciar();await m.go('usar',{ator:m.a.id,opcao:'quadrado-teste',ponto:{x:1.5,y:0}},player,[6,10,15]);assert.deepEqual(m.s.atores.map(x=>x.pv),[20,18,21]);
});
test('Sopro de Dragão concede cones ancorados, exclui o usuário e conserva a CD da origem',async()=>{
 const m=mesa(),inata=m.a.ficha.opcoes.find(o=>o.automacao?.tipo==='efeito_conjuracao'),sopro=m.a.ficha.opcoes.find(o=>/Sopro de Dragão/.test(o.nome));
 assert.equal(sopro.automacao.tipo,'efeito');assert.equal(sopro.concentracao,true);
 await m.go('usar',{ator:m.a.id,opcao:inata.id,confirmado:true},gm);
 await m.go('usar',{ator:m.a.id,opcao:sopro.id,alvo:m.b.id,confirmado:true},gm);
 const beneficiario=m.s.atores[1],cones=opcoesDisponiveis(beneficiario).filter(o=>o.concedidaPorEfeito);
 assert.equal(cones.length,5);assert.deepEqual(new Set(cones.map(o=>o.automacao.elemento)),new Set(['acido','raio','frio','fogo','veneno']));
 assert.ok(cones.every(o=>o.automacao.area.forma==='cone'&&o.automacao.origemArea==='conjurador'&&o.automacao.excluirConjurador&&o.automacao.cd===14));
 m.s.atores[0].x=-3;m.s.atores[1].x=0;m.s.atores[2].x=3;m.s.atores.forEach(a=>a.y=0);
 const fogo=cones.find(o=>o.automacao.elemento==='fogo'),pvBeneficiario=beneficiario.pv,pvAlvo=m.s.atores[2].pv;
 await m.go('usar',{ator:beneficiario.id,opcao:fogo.id,ponto:{x:4.5,y:0}},gm,[12,5]);
 assert.equal(m.s.atores[1].pv,pvBeneficiario,'o personagem na origem do cone não pode atingir a si mesmo');
 assert.equal(m.s.atores[2].pv,pvAlvo-12);assert.match(m.s.historico[0],/Sopro de Dragão/);
 await m.go('encerrarConcentracao',{ator:m.a.id,confirmado:true},gm);
 assert.equal(opcoesDisponiveis(m.s.atores[1]).some(o=>o.concedidaPorEfeito),false);
});
test('as sete fichas de jogadores carregam juntas com recursos e automações próprias',async()=>{
 for(const f of fichasJogadores)validar(f);
 let s=novo();s=await aplicar(s,{tipo:'grupoTeste',rev:s.rev,fichas:fichasJogadores,ensaio:true},gm,async()=>1);
 assert.equal(s.atores.length,7);assert.deepEqual(new Set(s.atores.map(a=>a.ficha.id)),new Set(idsJogadores));
 assert.ok(s.atores.every(a=>a.dono==='teste'&&a.token==='sim-'+a.id));
 assert.ok(s.atores.every(a=>a.ficha.inventario.itens.every(i=>i.tipo==='moeda'?i.pesoKg===0:i.pesoKg>0)),'PO não pesam e os demais itens mantêm peso');
 const porId=id=>s.atores.find(a=>a.ficha.id===id).ficha;
 assert.equal(porId('draven-thorne').opcoes.find(o=>o.id==='surto-de-acao-acao').automacao.tipo,'economia');
 assert.equal(porId('loteria').opcoes.find(o=>/Defletir Ataques/i.test(o.nome)).gatilho,'ser_atingido');
 assert.equal(porId('hannah-montana').opcoes.find(o=>o.id==='inspiracao-bardo-acao').automacao.tipo,'conceder_dado');
 assert.equal(porId('skimi').opcoes.find(o=>o.id==='ponto-sorte-rerrolagem').gatilho,'apos_rolagem_d20');
});
test('pasta de fichas lê JSONs em subpastas, ignora imagens e identifica o arquivo inválido',async()=>{
 const arquivo=(caminho,conteudo)=>({name:caminho.split('/').at(-1),webkitRelativePath:caminho,text:async()=>conteudo});
 const grupo=await lerPastaFichas([
   arquivo('Minha guarda/tokens/soldado.png','imagem'),
   arquivo('Minha guarda/tropa/soldado.json','\uFEFF'+JSON.stringify(await fichaFonte('soldado'))),
   arquivo('Minha guarda/nikki.json',JSON.stringify(await fichaFonte('nikki')))
 ]);
 assert.equal(grupo.nome,'Minha guarda');assert.deepEqual(grupo.fichas.map(f=>f.nome),[nikki.nome,soldado.nome]);
 await assert.rejects(lerPastaFichas([arquivo('Erro/correta.json',JSON.stringify(await fichaFonte('nikki'))),arquivo('Erro/ruim.json','{')]),/Erro\/ruim\.json/);
 await assert.rejects(lerPastaFichas([arquivo('Erro/ruim.json','{"nome":"incompleta"}')]),/Erro\/ruim\.json/);
 await assert.rejects(lerPastaFichas([arquivo('Vazia/token.png','imagem')]),/não contém fichas JSON/);
 await assert.rejects(lerPastaFichas(Array.from({length:51},(_,i)=>arquivo('Muitos/'+i+'.json','{}'))),/até 50 fichas/);
});
test('grupo importado persiste como modelo privado e permite adicionar unidades e cópias completas',async()=>{
 let s=novo();adicionar(s,nikki);const originais=s.atores.length;
 s=await aplicar(s,{tipo:'salvarGrupoFichas',rev:s.rev,nome:'Minha guarda',fichas:[await fichaFonte('soldado'),await fichaFonte('nikki')]},gm,dadoLocal);
 assert.equal(s.atores.length,originais,'salvar a pasta só disponibiliza o grupo');
 const grupo=s.gruposFichas[0];assert.equal(grupo.nome,'Minha guarda');
 assert.ok(grupo.fichas.every(f=>f.versaoFormato===2&&!f.opcoes));
 assert.equal(publico(s).gruposFichas,undefined,'modelos do mestre não são enviados aos jogadores');
 s=JSON.parse(JSON.stringify(compactarEstado(s)));
 for(const ator of s.atores)ator.ficha=validar(ator.ficha);
 s=await aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,grupoId:grupo.id,indice:0},gm,dadoLocal);
 assert.equal(s.atores.length,originais+1);assert.equal(s.atores.at(-1).nome,soldado.nome);
 s.atores.at(-1).pv=1;
 s=await aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,grupoId:grupo.id},gm,dadoLocal);
 assert.equal(s.atores.length,originais+3);assert.equal(s.atores.at(-2).pv,soldado.pvMaximos);
 assert.equal(new Set(s.atores.map(a=>a.id)).size,s.atores.length);
 assert.ok(s.atores.slice(originais).every(a=>!a.token&&!a.dono));
 await assert.rejects(aplicar(s,{tipo:'salvarGrupoFichas',rev:s.rev,nome:'Proibido',fichas:[nikki]},player,dadoLocal),/Somente o mestre/);
 await assert.rejects(aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,grupoId:grupo.id},player,dadoLocal),/Somente o mestre/);
 const antes=structuredClone(s);
 await assert.rejects(aplicar(s,{tipo:'salvarGrupoFichas',rev:s.rev,nome:'Inválido',fichas:[nikki,{nome:'incompleta'}]},gm,dadoLocal));
 await assert.rejects(aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,grupoId:grupo.id,indice:-1},gm,dadoLocal),/Ficha indisponível/);
 assert.deepEqual(s,antes);
});
test('grupos fixos acrescentam fichas independentes sem alterar participantes ou criar vínculos',async()=>{
 const grupos=JSON.parse(await readFile(new URL('./site/grupos-fichas.json',import.meta.url))).grupos;
 assert.deepEqual(grupos.map(g=>g.id),['aventureiros','soldados-do-reino']);
 assert.equal(grupos[0].fichas.length,7);
 const reino=await Promise.all(grupos[1].fichas.map(f=>fichaFonte(f.id)));
 let s=novo();const existente=adicionar(s,nikki);existente.pv=7;existente.dono='p';existente.token='token-existente';
 const antes=structuredClone(existente);
 s=await aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,fichas:reino},gm,dadoLocal);
 assert.equal(s.atores.length,5);assert.deepEqual(s.atores[0],antes);
 assert.ok(s.atores.slice(1).every(a=>a.token===null&&a.dono===null&&a.ficha.tipo==='npc'));
 assert.deepEqual(s.atores.slice(1).map(caAtual),[16,17,12,14]);
 assert.ok(opcoesDisponiveis(s.atores[2]).some(o=>o.geradaPorItem&&o.automacao.bonus===5));
 assert.ok(opcoesDisponiveis(s.atores[4]).some(o=>o.geradaPorItem&&o.automacao.bonus===5));
 s=await aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,fichas:[reino[0]]},gm,dadoLocal);
 assert.notEqual(s.atores[1].id,s.atores[5].id);
 s.atores[1].pv=1;assert.equal(s.atores[5].pv,24);
 const snapshot=structuredClone(s);
 await assert.rejects(aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,fichas:[reino[0],{nome:'inválida'}]},gm,dadoLocal));
 assert.deepEqual(s,snapshot);
 await assert.rejects(aplicar(s,{tipo:'adicionarGrupo',rev:s.rev,fichas:reino},player,dadoLocal),/Somente o mestre/);
 for(const a of s.atores)assert.doesNotThrow(()=>validar(compactarFicha(a.ficha)));
});
test('tokens duplicados de NPC recebem ficha própria de forma idempotente',()=>{
 const s=novo(),a=adicionar(s,soldado);a.token='original';a.pv=3;
 const original={id:'original',type:'IMAGE',layer:'CHARACTER',position:{x:0,y:0},metadata:{}};
 const aplicarMarcadores=alteracoes=>alteracoes.forEach(p=>{
  const t=tokens.find(i=>i.id===p.tokenId);
  if(p.marcador)t.metadata[chaveFichaNpc]=p.marcador;else delete t.metadata[chaveFichaNpc];
 });
 const tokens=[original];
 const inicial=sincronizarCopiasNpc(s,tokens,100);assert.equal(inicial.novos.length,0);aplicarMarcadores(inicial.alteracoes);
 const copia={...structuredClone(original),id:'copia',position:{x:250,y:100}};tokens.push(copia);
 const r=sincronizarCopiasNpc(s,tokens,100);assert.equal(r.novos.length,1);aplicarMarcadores(r.alteracoes);
 const b=s.atores.find(x=>x.token==='copia');
 assert.notEqual(a.id,b.id);assert.equal(b.nome,a.nome+' (2)');assert.equal(b.pv,b.ficha.pvMaximos);assert.equal(b.dono,null);
 assert.equal(b.x,2.5);assert.equal(b.y,1);assert.equal(b.emCombate,true);
 b.ficha.inventario.itens.pop();assert.notEqual(a.ficha.inventario.itens.length,b.ficha.inventario.itens.length);
 b.pv=1;assert.equal(a.pv,3);
 assert.equal(sincronizarCopiasNpc(s,tokens,100).novos.length,0);
 const neta={...structuredClone(copia),id:'neta'};tokens.push(neta);
 assert.equal(sincronizarCopiasNpc(s,tokens,100).novos.length,1);
 assert.equal(s.atores.find(x=>x.token==='neta').nome,a.nome+' (3)');
});
test('duplicação preserva PCs e mantém novos NPCs fora da iniciativa durante o combate',()=>{
 const s=novo(),npc=adicionar(s,soldado),pj=adicionar(s,nikki);
 npc.token='npc';pj.token='pj';s.fase='turnos';s.ordem=[npc.id,pj.id];s.vez=0;s.rodada=1;
 const tokens=[
  {id:'novo-npc',type:'IMAGE',layer:'CHARACTER',position:{x:100,y:200},locked:true,metadata:{[chaveFichaNpc]:{atorId:npc.id,tokenId:'npc'},[chaveBloqueioNpc]:false}},
  {id:'novo-pj',type:'IMAGE',layer:'CHARACTER',position:{x:0,y:0},metadata:{[chaveFichaNpc]:{atorId:pj.id,tokenId:'pj'}}}
 ];
 const r=sincronizarCopiasNpc(s,tokens,100);
 assert.equal(r.novos.length,1);
 const b=s.atores.find(a=>a.token==='novo-npc');
 assert.equal(b.emCombate,false);assert.equal(b.init,null);assert.deepEqual(s.ordem,[npc.id,pj.id]);
 assert.equal(r.alteracoes.find(p=>p.tokenId==='novo-npc').liberar,false);
 assert.ok(!s.atores.some(a=>a.token==='novo-pj'));
});
test('economia genérica automatiza Surto de Ação, Recuperar Fôlego e recursos',async()=>{
 let s=novo(),d=adicionar(s,fichasJogadores.find(f=>f.id==='draven-thorne')),g=adicionar(s,soldado,'Alvo');
 const rolar=async formula=>({total:/d20/.test(formula)?20:/d10/.test(formula)?8:5,natural:/d20/.test(formula)?20:null,formula,resumo:'teste'});
 const go=async(tipo,extra={},u=gm)=>s=await aplicar(s,{tipo,rev:s.rev,...extra},u,rolar);
 await go('vincular',{ator:d.id,dono:'p'});await go('iniciar');await go('iniciativa',{ator:d.id},player);await go('iniciativa',{ator:g.id});
 await go('usar',{ator:d.id,opcao:'surto-de-acao-acao'},player);assert.equal(s.atores[0].acao,2);assert.equal(s.atores[0].rec['surto-de-acao'],0);
 await go('ajustar',{ator:d.id,campo:'pv',valor:-10,confirmado:true});await go('usar',{ator:d.id,opcao:'recuperar-folego-acao'},player);
 assert.equal(s.atores[0].pv,s.atores[0].ficha.pvMaximos-2);assert.equal(s.atores[0].bonus,0);assert.equal(s.atores[0].rec['recuperar-folego'],1);
 const monge=fichasJogadores.find(f=>f.id==='loteria'),metabolismo=monge.opcoes.find(o=>o.id==='metabolismo-incomum-acao');
 assert.deepEqual(metabolismo.automacao.recuperarRecursos,['pontos-de-foco']);assert.equal(monge.opcoes.find(o=>o.id==='pico-adrenalina').automacao.disparada,true);
});
test('Astúcia Mágica recupera somente um espaço e apenas fora de combate',async()=>{
 let s=novo(),b=adicionar(s,fichasJogadores.find(f=>f.id==='skimi'));b.rec['espaco-2']=0;
 s=await aplicar(s,{tipo:'usar',rev:s.rev,ator:b.id,opcao:'astucia-magica-acao',confirmado:true},gm,async()=>1);
 assert.equal(s.atores[0].rec['espaco-2'],1);assert.equal(s.atores[0].rec['astucia-magica'],0);
 s=novo();b=adicionar(s,fichasJogadores.find(f=>f.id==='skimi'));s.fase='turnos';s.ordem=[b.id];s.vez=0;
 await assert.rejects(aplicar(s,{tipo:'usar',rev:s.rev,ator:b.id,opcao:'astucia-magica-acao',confirmado:true},gm,async()=>1),/fora de combate/);
});
test('Queimadura de Fogo entra após o acerto e Atacante Selvagem modifica somente o primeiro dano do turno',async()=>{
 let s=novo(),d=adicionar(s,fichasJogadores.find(f=>f.id==='draven-thorne')),g=adicionar(s,soldado,'Alvo'),gmLocal={id:'m',role:'GM'},jogador={id:'p',role:'PLAYER'};
 const comando=async(tipo,extra={},u=gmLocal,rolar=async()=>1)=>s=await aplicar(s,{tipo,rev:s.rev,...extra},u,rolar);
 await comando('vincular',{ator:d.id,dono:'p'});await comando('iniciar');
 await comando('iniciativa',{ator:d.id},jogador,async f=>({total:20,natural:17,formula:f,resumo:'20'}));
 await comando('iniciativa',{ator:g.id},gmLocal,async f=>({total:5,natural:4,formula:f,resumo:'5'}));
 const ataque=ataquesEquipados(s.atores[0])[0];let etapa=0;
 await comando('usar',{ator:d.id,opcao:ataque.id,alvo:g.id},jogador,async(formula,meta)=>{
   etapa++;if(etapa===1)return {total:20,natural:15,formula,resumo:'15 + 5 = 20'};
   assert.equal(meta.modificadorDano.id,'atacante-selvagem');assert.equal(meta.modificadorDano.tipo,'rolar_duas_escolher_maior');
   assert.ok(meta.adicionais.some(x=>x.id==='queimadura-de-fogo-apos-acerto'));
   return {total:15,natural:null,formula,resumo:'10 + 5',recursosAtivos:['queimadura-de-fogo-apos-acerto'],resultados:[{total:10,resumo:'10'},{total:5,resumo:'5'}]};
 });
 assert.equal(s.atores[1].pv,9);assert.equal(s.atores[0].rec['queimadura-de-fogo'],1);assert.equal(s.atores[0].usosTurno['atacante-selvagem'],true);
 s.atores[0].acao=1;etapa=0;
 await comando('usar',{ator:d.id,opcao:ataque.id,alvo:g.id},jogador,async(formula,meta)=>{etapa++;if(etapa===1)return {total:20,natural:15,formula,resumo:'20'};assert.equal(meta.modificadorDano,null);return {total:3,formula,resumo:'3',recursosAtivos:[]};});
 assert.equal(s.atores[1].pv,6);
 const local=dadoLocal('2d6+3',{modificadorDano:{id:'atacante-selvagem',nome:'Atacante Selvagem',tipo:'rolar_duas_escolher_maior'}});
 assert.equal(local.alternativasDano.length,2);assert.equal(local.total,Math.max(...local.alternativasDano.map(x=>x.total)));
});

test('inventário legado separa armas, prioriza o melhor acerto e ocupa uma mão por adaga',()=>{
 const f=validar(nikki),moedas=f.inventario.itens.find(i=>i.tipo==='moeda');
 const adagas=f.inventario.itens.filter(i=>i.nome==='Adaga'),lanca=f.inventario.itens.find(i=>i.nome==='Lança');
 assert.ok(f.inventario.capacidadeCargaKg>0);assert.equal(moedas.quantidade,28);assert.equal(moedas.tipo,'moeda');
 assert.equal(adagas.length,2);assert.deepEqual(adagas.map(i=>i.equipadoSlot).sort(),['mao_forte','mao_fraca']);assert.equal(lanca.equipado,false);
 assert.ok(f.inventario.itens.every(i=>i.tipo==='moeda'?i.pesoKg===0:i.pesoKg>0),'migração mantém PO sem peso e peso dos demais itens');
 const a={ficha:f},pesoAntes=pesoInventario(a);
 moedas.quantidade=999999;
 assert.equal(pesoInventario(a),pesoAntes,'a quantidade de PO não altera a carga');
});
test('PO com duas casas decimais reabrem após compras sem falha de precisão binária',()=>{
 for(const quantidade of [9604.3,0.29,19.99,999999.99]){
  assert.equal(quantidadeMoedaValida(quantidade),true);
 }
 for(const quantidade of [0.001,1.999,NaN,Infinity])assert.equal(quantidadeMoedaValida(quantidade),false);
 const f=structuredClone(nikki);
 const moedas=f.inventario.itens.find(i=>i.tipo==='moeda');
 moedas.quantidade=9604.3;
 const a={ficha:f},salva=compactarFicha(f),reaberta=validar(salva);
 assert.equal(reaberta.inventario.itens.find(i=>i.id===moedas.id).quantidade,9604.3);
 assert.equal(saldoMoedasPc({ficha:reaberta}),960430);
 assert.equal(pesoInventario({ficha:reaberta}),pesoInventario(a));
 for(const quantidade of [0.29,19.99,9604.3]){
  moedas.quantidade=quantidade;assert.doesNotThrow(()=>validar(compactarFicha(f)));
 }
 moedas.quantidade=1.999;assert.throws(()=>validar(compactarFicha(f)),/Quantidade ou peso/);
});
test('descontos de 1 a 30 por cento nas duas lojas conservam valores inteiros em cobre e saldos válidos',()=>{
 for(const loja of catalogoCentral().lojas){
  for(const item of resolverCatalogoLoja(loja).itens){
   for(let desconto=1;desconto<=30;desconto++){
    const preco=precoCompraPc(item,desconto),saldo=(100000000-preco)/100;
    assert.ok(Number.isSafeInteger(preco)&&preco>0,item.nome);
    assert.ok(quantidadeMoedaValida(saldo),item.nome+' desconto '+desconto);
   }
  }
 }
 const item={preco:{valor:0.9,moeda:'po'}};
 assert.equal(precoVendaPc(item),63,'70% de 90 cobres são exatamente 63 cobres');
});
test('escudo do soldado ocupa a mão fraca e altera a CA ao ser guardado',async()=>{
 const m=mesa(),escudo=m.b.ficha.inventario.itens.find(i=>i.nome==='Escudo');
 assert.ok(escudo?.equipado&&escudo.equipadoSlot==='mao_fraca');assert.equal(caAtual(m.b),16);
 await m.go('inventario',{ator:m.b.id,operacao:'desequipar',itemId:escudo.id});
 assert.equal(caAtual(m.s.atores[1]),14);
});
test('equipar troca o slot e aplica modificadores dinâmicos de CA, PV e deslocamento',async()=>{
 const m=mesa();m.a.dono='p';const pesoAntes=pesoInventario(m.a);m.a.ficha.inventario.itens.push(
  {id:'capa-teste',nome:'Capa de teste',descricao:'',tipo:'equipamento',quantidade:1,pesoKg:1,slotEquipamento:'capa',equipado:false,modificadores:{ca:1,pvMaximos:3,deslocamentoM:1.5}},
  {id:'capa-antiga',nome:'Capa antiga',descricao:'',tipo:'equipamento',quantidade:1,pesoKg:2,slotEquipamento:'capa',equipado:true,equipadoSlot:'capa',modificadores:{ca:2}}
 );
 assert.equal(caAtual(m.a),14);await m.go('inventario',{ator:m.a.id,operacao:'equipar',itemId:'capa-teste'},player);
 const a=m.s.atores[0];assert.equal(caAtual(a),13);assert.equal(pvMaximosAtuais(a),23);assert.equal(deslocamentoMaximo(a),10.5);assert.equal(a.ficha.inventario.itens.find(i=>i.id==='capa-antiga').equipado,false);assert.equal(pesoInventario(a),pesoAntes+3);
});
test('trocar equipamento ou usar consumível em combate exige o turno e gasta uma ação',async()=>{
 const m=mesa();m.a.ficha.inventario.itens.push({id:'pocao-teste',nome:'Poção',descricao:'',tipo:'consumivel',quantidade:2,pesoKg:.5});
 m.b.ficha.inventario.itens.push({id:'elmo-teste',nome:'Elmo',descricao:'',tipo:'equipamento',quantidade:1,pesoKg:1,slotEquipamento:'cabeca',equipado:false});
 await m.iniciar();
 await assert.rejects(m.go('inventario',{ator:m.b.id,operacao:'equipar',itemId:'elmo-teste'},gm),/turno/);
 await m.go('inventario',{ator:m.a.id,operacao:'usar',itemId:'pocao-teste'},player);const a=m.s.atores[0];assert.equal(a.acao,0);assert.equal(a.ficha.inventario.itens.find(i=>i.id==='pocao-teste').quantidade,1);
 await assert.rejects(m.go('inventario',{ator:m.a.id,operacao:'usar',itemId:'pocao-teste'},player),/ação disponível/);
});
test('equipamento controla dinamicamente os ataques exibidos',async()=>{
 const m=mesa();m.a.dono='p';const item=m.a.ficha.inventario.itens.find(i=>i.nome==='Adaga'&&i.equipadoSlot==='mao_forte'),ataque=opcoesDisponiveis(m.a).find(o=>o.origemItem===item.id&&!o.automacao.arremesso);
 assert.ok(item.equipado&&ataque&&opcoesDisponiveis(m.a).some(o=>o.id===ataque.id));
 await m.go('inventario',{ator:m.a.id,operacao:'desequipar',itemId:item.id},player);
 assert.equal(opcoesDisponiveis(m.s.atores[0]).some(o=>o.id===ataque.id),false);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player),/Opção desconhecida|equipamento adequado/);
});
test('migração de encontro antigo religa ataques às armas e oculta a lança guardada',()=>{
 const m=mesa(),f=m.a.ficha;
 for(const o of f.opcoes)delete o.requerItemEquipado;
 for(const i of f.inventario.itens)delete i.acoes;
 atualizarMagias(f);
 const visiveis=opcoesDisponiveis(m.a).map(o=>o.nome);
 assert.ok(visiveis.some(n=>n.startsWith('Adaga +4')));
 assert.equal(visiveis.filter(n=>n.startsWith('Adaga')).length,6);
 assert.equal(visiveis.some(n=>n.startsWith('Lança +2')),false);
});
test('HUD lógica oferece apenas magias preparadas, sempre preparadas e truques',()=>{
 const m=mesa(),p=m.a.ficha.preparacao,magias=m.a.ficha.opcoes.filter(o=>o.categoria==='magia'&&!o.varianteDe);
 const preparada=magias.find(o=>p.preparadas.includes(o.id));
 const sempre=magias.find(o=>p.semprePreparadas.includes(o.id));
 const truque=magias.find(o=>(o.circuloBase??0)===0);
 assert.ok(preparada&&sempre&&truque);
 p.preparadas=p.preparadas.filter(id=>id!==preparada.id);
 const disponiveis=opcoesDisponiveis(m.a).map(o=>o.id);
 assert.equal(disponiveis.includes(preparada.id),false);
 assert.equal(disponiveis.includes(sempre.id),true);
 assert.equal(disponiveis.includes(truque.id),true);
});
test('arma de duas mãos ocupa as duas mãos e guarda as armas anteriores',async()=>{
 const m=mesa();m.a.dono='p';m.a.ficha.inventario.itens.push({id:'espada-grande-teste',nome:'Espada grande',descricao:'Arma de duas mãos.',tipo:'equipamento',quantidade:1,pesoKg:3,slotEquipamento:'mao_forte',duasMaos:true,equipado:false});
 await m.go('inventario',{ator:m.a.id,operacao:'equipar',itemId:'espada-grande-teste',slot:'mao_forte'},player);
 const itens=m.s.atores[0].ficha.inventario.itens,espada=itens.find(i=>i.id==='espada-grande-teste');
 assert.equal(espada.equipadoSlot,'mao_forte');assert.deepEqual(slotsOcupadosItem(espada),['mao_forte','mao_fraca']);assert.equal(itens.filter(i=>i.nome==='Adaga').some(i=>i.equipado),false);
 await m.go('inventario',{ator:m.a.id,operacao:'desequipar',itemId:espada.id},player);assert.equal(m.s.atores[0].ficha.inventario.itens.find(i=>i.id===espada.id).equipado,false);
});
test('Livro de Habilidades prepara magias, alterna passivas e trava em combate',async()=>{
 const m=mesa();m.a.dono='p';const p=m.a.ficha.preparacao,id=p.preparadas[0],passiva=m.a.ficha.passivas[0];
 await m.go('livro',{ator:m.a.id,operacao:'despreparar',habilidadeId:id},player);assert.equal(m.s.atores[0].ficha.preparacao.preparadas.includes(id),false);
 await m.go('livro',{ator:m.a.id,operacao:'preparar',habilidadeId:id},player);assert.equal(m.s.atores[0].ficha.preparacao.preparadas.includes(id),true);
 await m.go('livro',{ator:m.a.id,operacao:'desativar',habilidadeId:passiva.id},player);assert.equal(m.s.atores[0].ficha.passivas[0].ativa,false);
 await m.iniciar();await assert.rejects(m.go('livro',{ator:m.a.id,operacao:'ativar',habilidadeId:passiva.id},player),/somente fora de combate/);
});
test('catálogo do Victor registra todas as armas, proteções, acessórios e suprimentos',()=>{
 assert.equal(catalogoVictor.itens.length,24);assert.equal(new Set(catalogoVictor.itens.map(i=>i.id)).size,24);
 const armas=catalogoVictor.itens.filter(i=>i.categoria==='arma'),placas=catalogoVictor.itens.find(i=>i.id==='victor-armadura-placas'),escudo=catalogoVictor.itens.find(i=>i.id==='victor-escudo'),veste=catalogoVictor.itens.find(i=>i.id==='victor-veste-simples');
 assert.equal(armas.length,9);assert.ok(armas.every(i=>i.modelosAcoes?.length));assert.equal(placas.preco.valor,1500);assert.equal(placas.classeArmadura.valor,18);assert.equal(escudo.slotEquipamento,'mao_fraca');assert.equal(escudo.classeArmadura.valor,2);assert.equal(veste.categoriaArmadura,'veste');
});
test('todos os itens possuem preço e a Ferraria de Victor respeita desconto de 1% a 30%',async()=>{
 const catalogo=catalogoCentral();assert.ok(catalogo.itens.every(i=>i.definicao.preco?.valor>0&&['pc','pp','pe','po','pl'].includes(i.definicao.preco.moeda)));
 const adaga=catalogoVictor.itens.find(i=>i.catalogoRef==='item.adaga');assert.equal(precoCompraPc(adaga,10),180);assert.equal(precoCompraPc(adaga,30),140);assert.equal(precoVendaPc(adaga),140);
 let s=novo(),a=adicionar(s,nikki);a.dono='p';
 s=await aplicar(s,{tipo:'configurarLoja',lojaId:'loja.ferraria-victor',ativa:true,descontoPct:10,rev:s.rev},gm,dadoLocal);assert.equal(lojasAtivas(s).length,1);
 await assert.rejects(aplicar(s,{tipo:'configurarLoja',lojaId:'loja.ferraria-victor',ativa:true,descontoPct:31,rev:s.rev},gm,dadoLocal),/entre 1% e 30%/);
});
test('Victor é a primeira loja e a La Arte oferece os 23 incomuns e 20 raros por referência central',()=>{
 const c=catalogoCentral(),[victor,laArte]=c.lojas;assert.equal(victor.id,'loja.ferraria-victor');assert.equal(laArte.id,'loja.la-arte');
 const loja=resolverCatalogoLoja(laArte);assert.equal(loja.itens.length,43);assert.equal(loja.itens.filter(i=>i.raridade==='incomum').length,23);assert.equal(loja.itens.filter(i=>i.raridade==='raro').length,20);
 assert.ok(loja.itens.every(i=>i.catalogoRef&&i.preco?.valor>0));assert.equal(loja.itens.find(i=>i.nome==='Luvas do Dragão Ascendente +2').preco.valor,1400);
});
test('auditoria integral das lojas cobre 67 referências portáveis com preço, peso e quantidade válidos',async()=>{
 const lojas=catalogoCentral().lojas.map(resolverCatalogoLoja),itens=lojas.flatMap(loja=>loja.itens);
 assert.deepEqual(lojas.map(loja=>[loja.id,loja.itens.length]),[['loja.ferraria-victor',24],['loja.la-arte',43]]);assert.equal(itens.length,67);
 assert.equal(new Set(itens.map(i=>i.catalogoRef)).size,67);
 for(const item of itens){assert.ok(item.catalogoRef,item.nome);assert.ok(item.preco?.valor>0,item.nome+' sem preço');assert.ok(Number.isFinite(item.pesoKg)&&item.pesoKg>=0,item.nome+' sem peso');assert.ok(item.tipo,item.nome+' sem tipo');}
 let s=novo(),a=adicionar(s,nikki);a.ficha.inventario.capacidadeCargaKg=9999;
 for(const item of itens)s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:item.catalogoRef,quantidade:1,rev:s.rev},gm,dadoLocal);
 const refs=new Set(s.atores[0].ficha.inventario.itens.map(i=>i.catalogoRef));for(const item of itens)assert.ok(refs.has(item.catalogoRef),'não foi portado: '+item.nome);
 const reaberta=validar(compactarEstado(s).atores[0].ficha),refsReabertas=new Set(reaberta.inventario.itens.map(i=>i.catalogoRef));for(const item of itens)assert.ok(refsReabertas.has(item.catalogoRef),'não persistiu: '+item.nome);
});
test('todas as dezoito armas mágicas recalculam ataques e as raras oferecem seu dano elemental',()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte')),armas=loja.itens.filter(i=>i.categoria==='arma');assert.equal(armas.length,18);
 for(const item of armas){
  const s=novo(),a=adicionar(s,fichasJogadores.find(f=>f.id==='draven-thorne'));for(const i of a.ficha.inventario.itens)i.equipado=false;
  const copia=structuredClone(item);copia.id='auditoria-'+item.id;copia.quantidade=1;copia.equipado=true;copia.equipadoSlot=copia.slotEquipamento;a.ficha.inventario.itens.push(copia);
  const ataques=ataquesEquipados(a).filter(o=>o.origemItem===copia.id);assert.equal(ataques.length,copia.modelosAcoes.length,item.nome);
  assert.ok(ataques.every(o=>o.automacao.bonus>=Number(copia.bonusMagico)),item.nome+' não aplicou bônus mágico');
  if(copia.bonusMagico===1)assert.ok(ataques.every(o=>/[+-]\d+$/.test(o.automacao.dano)&&Number(o.automacao.dano.match(/[+-](\d+)$/)?.[1])>=1),item.nome+' não somou dano');
  if(copia.bonusMagico===2){assert.equal(copia.bonusDano,0,item.nome);assert.deepEqual(copia.danoExtraAoAcertar&&Object.keys(copia.danoExtraAoAcertar).sort(),['critico','elemento','formula']);assert.equal(copia.danoExtraAoAcertar.formula,'1d4');}
  assert.ok(ataques.every(o=>o.automacao.alcanceM<=18),item.nome+' excedeu o teto');
 }
});
test('armaduras e escudos das duas lojas entregam exatamente a CA declarada',()=>{
 const itens=catalogoCentral().lojas.map(resolverCatalogoLoja).flatMap(l=>l.itens).filter(i=>i.classeArmadura);
 assert.equal(itens.length,20);
 for(const item of itens){
  const s=novo(),treinada=structuredClone(nikki);treinada.proficienciasEquipamento.armaduras=['leve','media','pesada','escudo'];const a=adicionar(s,treinada);for(const i of a.ficha.inventario.itens)i.equipado=false;
  const copia=structuredClone(item);copia.id='ca-'+item.id;copia.quantidade=1;copia.equipado=true;copia.equipadoSlot=copia.slotEquipamento;a.ficha.inventario.itens.push(copia);
  const ca=copia.classeArmadura,modDes=2,esperada=ca.tipo==='bonus'?a.ficha.caBase+ca.valor:ca.valor+(ca.atributo==='des'?Math.min(modDes,ca.limiteAtributo??99):0);
  assert.equal(caAtual(a),esperada,item.nome);
 }
});
test('acessórios estruturados da La Arte alteram iniciativa, Furtividade, CA e dano desarmado',()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte'));
 const equipar=(a,nome,slot)=>{const item=structuredClone(loja.itens.find(i=>i.nome===nome));item.id='efeito-'+item.id;item.quantidade=1;item.equipado=true;item.equipadoSlot=slot??item.slotEquipamento;a.ficha.inventario.itens.push(item);return item;};
 let s=novo(),a=adicionar(s,nikki),base=bonusIniciativa(a);equipar(a,'Colar do Vigia','colar');assert.equal(bonusIniciativa(a),base+1);
 s=novo();a=adicionar(s,nikki);base=bonusPericia(a,'Furtividade');equipar(a,'Couro do Passo Macio','vestes');assert.equal(bonusPericia(a,'Furtividade'),base+1);
 s=novo();a=adicionar(s,fichasJogadores.find(f=>f.id==='loteria'));base=caAtual(a);const luvas=equipar(a,'Luvas do Dragão Ascendente +2','acessorio_1');assert.equal(caAtual(a),base+1);assert.deepEqual(luvas.danoExtraDesarmado,{formula:'1d4',elemento:'fogo',critico:false});
 const armadura=structuredClone(catalogoVictor.itens.find(i=>i.nome==='Couro batido'));armadura.id='armadura-auditoria';armadura.equipado=true;armadura.equipadoSlot='vestes';armadura.quantidade=1;a.ficha.inventario.itens.push(armadura);const caComLuvas=caAtual(a);luvas.equipado=false;assert.equal(caComLuvas,caAtual(a),'a CA condicional das luvas desaparece com armadura');
});
test('cada arma rara aplica automaticamente sua parcela 1d4 com tipo de dano próprio',async()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte')),armas=loja.itens.filter(i=>i.categoria==='arma'&&i.raridade==='raro');assert.equal(armas.length,9);
 for(const itemLoja of armas){
  let {s,a,b}=await duelo('draven-thorne',undefined,{distancia:itemLoja.tipoArma==='arco_longo'?6:1.5});for(const i of a.ficha.inventario.itens)i.equipado=false;
  const item=structuredClone(itemLoja);item.id='rara-'+item.id;item.quantidade=1;item.equipado=true;item.equipadoSlot=item.slotEquipamento;a.ficha.inventario.itens.push(item);
  const ataque=ataquesEquipados(a).find(o=>o.origemItem===item.id&&!o.automacao.arremesso),pv=b.pv;let confirmou=false;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,alvo:b.id},player,async(formula,meta)=>{
   if(meta.tipo==='ataque')return {total:18,natural:14,formula,resumo:'18'};
   if(meta.tipo==='dano'){const extra=meta.adicionais.find(x=>x.id==='extra-'+item.id);assert.ok(extra,item.nome);assert.equal(extra.formula,'1d4');assert.equal(extra.elemento,item.danoExtraAoAcertar.elemento);confirmou=true;return {total:8,formula,resumo:'5 + 3',resultados:[{total:5,resumo:'base 5'},{total:3,resumo:'extra 3'}],recursosAtivos:[extra.id],rerrolagensUsadas:[]};}
   throw Error('rolagem inesperada '+meta.tipo);
  });
  assert.equal(confirmou,true,item.nome);assert.equal(s.atores.find(x=>x.id===b.id).pv,pv-8,item.nome);
 }
});
test('Luvas do Dragão somam fogo a cada golpe desarmado e respeitam resistência separada',async()=>{
 let {s,a,b}=await duelo('loteria');const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte')),luvas=structuredClone(loja.itens.find(i=>i.nome==='Luvas do Dragão Ascendente +2'));
 luvas.id='luvas-dragao-teste';luvas.quantidade=1;luvas.equipado=true;luvas.equipadoSlot='acessorio_1';a.ficha.inventario.itens.push(luvas);b.ficha.resistencias=['fogo'];const pv=b.pv,ataque=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao'));
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,alvo:b.id},player,async(formula,meta)=>{
  if(meta.tipo==='ataque')return {total:18,natural:13,formula,resumo:'18'};
  const extra=meta.adicionais.find(x=>x.id==='extra-desarmado-'+luvas.id);assert.ok(extra);return {total:10,formula,resumo:'6 + 4',resultados:[{total:6,resumo:'contundente 6'},{total:4,resumo:'fogo 4'}],recursosAtivos:[extra.id],rerrolagensUsadas:[]};
 });
 assert.equal(s.atores.find(x=>x.id===b.id).pv,pv-8,'6 contundente + 2 fogo após resistência');
});
test('auditoria classifica os doze itens especiais da La Arte como automatizados',()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte'));
 const automatizados=['Veste dos Bolsos de Oficina','Veste do Último Fôlego','Colar do Fôlego das Docas','Capa do Mensageiro','Veste do Passo Nebuloso','Veste da Trama Serena','Couro da Sombra Curta','Anel da Segunda Chance','Colar do Socorrista','Botas Escapistas +2','Anel da Mão Firme','Botas do Passo Livre +1'];
 for(const nome of automatizados){const item=loja.itens.find(i=>i.nome===nome);assert.ok(item,nome);assert.ok(item.opcoesConcedidas?.length||item.modificadores?.capacidadeCargaKg||item.ignoraTerrenoDificilNaoMagico,nome+' deveria estar automatizado');}
});
test('itens respeitam capacidade, penalidade de Furtividade e bloqueio de negociação',async()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte')),s=novo(),a=adicionar(s,nikki),equipar=(nome,slot)=>{const i=structuredClone(loja.itens.find(x=>x.nome===nome));i.id='audit-'+i.id;i.quantidade=1;i.equipado=true;i.equipadoSlot=slot??i.slotEquipamento;a.ficha.inventario.itens.push(i);return i;};
 const baseCarga=capacidadeCargaAtual(a);equipar('Veste dos Bolsos de Oficina','vestes');assert.equal(capacidadeCargaAtual(a),baseCarga+14);
 for(const i of a.ficha.inventario.itens)if(i.equipadoSlot==='vestes')i.equipado=false;equipar('Armadura de placas +1','vestes');assert.equal(modoPericiaEquipamento(a,'Furtividade'),'desvantagem');
 let formula;a.dono='p';await aplicar(s,{tipo:'teste',ator:a.id,grupo:'pericias',chave:'Furtividade',modo:'normal',rev:s.rev},player,async(f)=>{formula=f;return {total:10,natural:10,formula:f};});assert.match(formula,/2d20kl1/);
 const b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));b.dono='p2';const bloqueado=a.ficha.inventario.itens.find(i=>!i.equipado&&i.tipo!=='moeda');bloqueado.negociavel=false;
 let estado=await aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},player,dadoLocal),t=trocaDoAtor(estado,a.id);estado=await aplicar(estado,{tipo:'responderTroca',ator:b.id,trocaId:t.id,aceitar:true,rev:estado.rev},{id:'p2',role:'PLAYER'},dadoLocal);t=trocaDoAtor(estado,a.id);
 await assert.rejects(aplicar(estado,{tipo:'oferecerTroca',ator:a.id,trocaId:t.id,itemId:bloqueado.id,quantidade:1,rev:estado.rev},player,dadoLocal),/indisponível/);
});
test('Veste dos Bolsos de Oficina equipa e reabre nas sete fichas sem corromper carga ou inventário',async()=>{
 for(const ficha of fichasJogadores){
  let s=novo();const a=adicionar(s,ficha);
  const base=capacidadeCargaAtual(a);
  s=await aplicar(s,{tipo:'gmAdicionarItem',rev:s.rev,ator:a.id,itemRef:'item.la-arte.veste-bolsos-oficina',quantidade:1,confirmado:true},gm,dadoLocal);
  const veste=s.atores[0].ficha.inventario.itens.find(i=>i.catalogoRef==='item.la-arte.veste-bolsos-oficina');
  s=await aplicar(s,{tipo:'inventario',rev:s.rev,ator:a.id,itemId:veste.id,operacao:'equipar',confirmado:true},gm,dadoLocal);
  const antes=JSON.stringify(compactarEstado(s));
  const reaberta=JSON.parse(antes);reaberta.atores[0].ficha=validar(reaberta.atores[0].ficha);
  assert.equal(capacidadeCargaAtual(reaberta.atores[0]),base+14,ficha.nome);
  assert.equal(JSON.stringify(compactarEstado(reaberta)),antes,'estado preservado para '+ficha.nome);
 }
});
test('concessões de equipamento acompanham o item, consomem usos e não duplicam a ficha salva',async()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte'));
 const preparar=nome=>{const s=novo(),a=adicionar(s,nikki),item=structuredClone(loja.itens.find(i=>i.nome===nome));a.dono='p';for(const i of a.ficha.inventario.itens)if(i.equipado&&i.equipadoSlot===item.slotEquipamento)i.equipado=false;Object.assign(item,{id:'portatil-'+item.id,quantidade:1,equipado:true,equipadoSlot:item.slotEquipamento});a.ficha.inventario.itens.push(item);const op=opcoesDisponiveis(a).find(o=>o.origemItem===item.id);return {s,a,item,op};};
 let m=preparar('Capa do Mensageiro'),antes=m.a.metros;m.s=await aplicar(m.s,{tipo:'usar',ator:m.a.id,opcao:m.op.id,rev:m.s.rev},player,dadoLocal);assert.equal(m.s.atores[0].metros,antes+deslocamentoMaximo(m.s.atores[0])+3);assert.equal(m.s.atores[0].rec[m.op.custo.find(c=>c.tipo==='recurso').id],0);
 m=preparar('Veste do Passo Nebuloso');m.s=await aplicar(m.s,{tipo:'usar',ator:m.a.id,opcao:m.op.id,x:7,y:0,rev:m.s.rev},player,dadoLocal);assert.equal(m.s.atores[0].x,7);
 m=preparar('Couro da Sombra Curta');m.s=await aplicar(m.s,{tipo:'usar',ator:m.a.id,opcao:m.op.id,alvo:m.a.id,rev:m.s.rev},player,dadoLocal);assert.equal(temCondicao(m.s.atores[0],'invisivel'),true);
 m=preparar('Botas Escapistas +2');antes=m.a.metros;m.s=await aplicar(m.s,{tipo:'usar',ator:m.a.id,opcao:m.op.id,rev:m.s.rev},player,dadoLocal);assert.equal(m.s.atores[0].desengajado,true);assert.equal(m.s.atores[0].metros,antes+deslocamentoMaximo(m.s.atores[0]));
 const compacta=compactarFicha(m.s.atores[0].ficha);assert.equal(compacta.concessoes.some(c=>String(c.id).startsWith('item-')),false);assert.equal(compacta.recursos.some(r=>r.concedidoPorItem),false);
});
test('Colar do Socorrista cura somente alvo vivo a 0 PV e Fôlego das Docas aplica seu buff',async()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte')),montar=nome=>{const s=novo(),a=adicionar(s,nikki),b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));a.dono='p';b.x=1;b.y=0;const item=structuredClone(loja.itens.find(i=>i.nome===nome));for(const i of a.ficha.inventario.itens)if(i.equipado&&i.equipadoSlot===item.slotEquipamento)i.equipado=false;Object.assign(item,{id:'uso-'+item.id,quantidade:1,equipado:true,equipadoSlot:item.slotEquipamento});a.ficha.inventario.itens.push(item);const op=opcoesDisponiveis(a).find(o=>o.origemItem===item.id);return {s,a,b,op};};
 let m=montar('Colar do Socorrista');await assert.rejects(aplicar(m.s,{tipo:'usar',ator:m.a.id,opcao:m.op.id,alvo:m.b.id,rev:m.s.rev},player,async()=>10),/0 PV/);m.b.pv=0;m.b.estadoVida='inconsciente';m.s=await aplicar(m.s,{tipo:'usar',ator:m.a.id,opcao:m.op.id,alvo:m.b.id,rev:m.s.rev},player,async()=>10);assert.equal(m.s.atores[1].pv,10);assert.equal(m.s.atores[1].estadoVida,'consciente');
 m=montar('Colar do Fôlego das Docas');m.s=await aplicar(m.s,{tipo:'usar',ator:m.a.id,opcao:m.op.id,alvo:m.a.id,rev:m.s.rev},player,dadoLocal);assert.ok(m.s.atores[0].efeitosAtivos.some(e=>e.nome==='Respiração Aquática'));
});
test('Veste do Último Fôlego interrompe o dano, reduz uma vez e recupera no descanso longo',async()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte'));
 let s=novo(),defensor=adicionar(s,nikki),atacante=adicionar(s,soldado,'Soldado');defensor.dono='p';defensor.x=0;defensor.y=0;atacante.x=1.5;atacante.y=0;
 const veste=structuredClone(loja.itens.find(i=>i.nome==='Veste do Último Fôlego'));for(const i of defensor.ficha.inventario.itens)if(i.equipadoSlot==='vestes')i.equipado=false;Object.assign(veste,{id:'veste-ultimo-teste',quantidade:1,equipado:true,equipadoSlot:'vestes'});defensor.ficha.inventario.itens.push(veste);
 s.fase='turnos';s.rodada=1;s.ordem=[atacante.id,defensor.id];s.vez=0;for(const p of s.atores){p.acao=1;p.bonus=1;p.reacao=1;p.metros=9;p.init=10;}
 const ataque=opcoesDisponiveis(atacante).find(o=>o.automacao?.tipo==='ataque'&&o.automacao.alcanceM<=1.5),pv=defensor.pv;
 s=await aplicar(s,{tipo:'usar',ator:atacante.id,opcao:ataque.id,alvo:defensor.id,rev:s.rev},gm,async(f,meta)=>{assert.equal(meta.tipo,'ataque');return {total:20,natural:16,formula:f};});
 assert.equal(s.atores[0].pv,pv);assert.equal(s.reacaoPendente?.gatilho,'ser_atingido');const op=s.atores[0].ficha.opcoes.find(o=>o.origemItem===veste.id);
 s=await aplicar(s,{tipo:'resolverReacao',ator:defensor.id,opcao:op.id,rev:s.rev},player,async(f,meta)=>meta.tipo==='reducao'?{total:4,formula:f}:{total:7,formula:f});
 defensor=s.atores[0];assert.equal(defensor.pv,pv-3);assert.equal(defensor.reacao,0);const recursoId=op.custo.find(c=>c.tipo==='recurso').id;assert.equal(defensor.rec[recursoId],0);
 s=await aplicar(s,{tipo:'encerrar',rev:s.rev},gm,dadoLocal);s=await aplicar(s,{tipo:'descanso',periodo:'longo',rev:s.rev,confirmado:true},gm,dadoLocal);assert.equal(s.atores[0].rec[recursoId],1);
});
test('rerrolagens dos itens respeitam o tipo, a CD, a concentração e seguem o equipamento',async()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte'));
 const equipar=(a,nome,slot)=>{const item=structuredClone(loja.itens.find(i=>i.nome===nome));for(const i of a.ficha.inventario.itens)if(i.equipadoSlot===(slot??item.slotEquipamento))i.equipado=false;Object.assign(item,{id:'rerrol-'+item.id,quantidade:1,equipado:true,equipadoSlot:slot??item.slotEquipamento});a.ficha.inventario.itens.push(item);opcoesDisponiveis(a);return item;};
 let s=novo(),a=adicionar(s,nikki);a.dono='p';const anel=equipar(a,'Anel da Segunda Chance','acessorio_1'),opAnel=opcoesDisponiveis(a).find(o=>o.origemItem===anel.id);let metaTeste;
 s=await aplicar(s,{tipo:'teste',ator:a.id,grupo:'salvaguardas',chave:'des',modo:'normal',rev:s.rev},player,async(f,meta)=>{metaTeste=meta;return {total:10,natural:8,formula:f,rerrolagensUsadas:[]};});assert.equal(metaTeste.rerrolagens.some(r=>r.id===opAnel.id),false,'sem CD não existe falha confirmada');
 const veste=equipar(s.atores[0],'Veste da Trama Serena','vestes'),opVeste=opcoesDisponiveis(s.atores[0]).find(o=>o.origemItem===veste.id);assert.ok(opVeste);const antes=s.atores[0].rec[opVeste.custo.find(c=>c.tipo==='recurso').id];
 s.atores[0].concentracaoAtiva={id:'concentracao-teste',nome:'Concentração de teste'};const inimigo=adicionar(s,soldado,'Soldado');s.atores[0].x=0;s.atores[0].y=0;inimigo.x=1.5;inimigo.y=0;s.fase='turnos';s.rodada=1;s.ordem=[inimigo.id,s.atores[0].id];s.vez=0;for(const p of s.atores){p.acao=1;p.bonus=1;p.reacao=1;p.metros=9;p.init=10;}
 const ataque=opcoesDisponiveis(inimigo).find(o=>o.automacao?.tipo==='ataque'&&o.automacao.alcanceM<=1.5);let viuConcentracao=false;
 s=await aplicar(s,{tipo:'usar',ator:inimigo.id,opcao:ataque.id,alvo:s.atores[0].id,rev:s.rev},gm,async(f,meta)=>{if(meta.tipo==='ataque')return {total:20,natural:16,formula:f};if(meta.tipo==='dano')return {total:6,formula:f};if(meta.concentracao){viuConcentracao=true;assert.ok(meta.rerrolagens.some(r=>r.id===opVeste.id));return {total:15,natural:13,formula:f,rerrolagensUsadas:[opVeste.id]};}throw Error('rolagem inesperada');});
 assert.equal(viuConcentracao,true);assert.equal(s.atores[0].rec[opVeste.custo.find(c=>c.tipo==='recurso').id],antes-1);
 for(const i of s.atores[0].ficha.inventario.itens)if(i.id===veste.id)i.equipado=false;assert.equal(opcoesDisponiveis(s.atores[0]).some(o=>o.origemItem===veste.id),false);
});
test('Anel da Mão Firme aplica +1 ao teste de abrir fechaduras e Botas do Passo Livre ignoram terreno difícil',async()=>{
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte')),equipar=(a,nome,slot)=>{const item=structuredClone(loja.itens.find(i=>i.nome===nome));Object.assign(item,{id:'modulo-'+item.id,quantidade:1,equipado:true,equipadoSlot:slot??item.slotEquipamento});a.ficha.inventario.itens.push(item);opcoesDisponiveis(a);return item;};
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado');a.dono='p';const anel=equipar(a,'Anel da Mão Firme','acessorio_1'),abrir=opcoesDisponiveis(a).find(o=>o.origemItem===anel.id);assert.equal(bonusTesteFerramenta(a,abrir.automacao),3);
 let formula;s=await aplicar(s,{tipo:'usar',ator:a.id,opcao:abrir.id,rev:s.rev},player,async(f,meta)=>{formula=f;assert.equal(meta.cd,15);return {total:16,natural:13,formula:f};});assert.equal(formula,'1d20+3');assert.match(s.historico[0],/sucesso.*CD 15/);
 a=s.atores[0];b=s.atores[1];b.x=20;const botas=equipar(a,'Botas do Passo Livre +1','botas');s.fase='turnos';s.ordem=[a.id,b.id];s.vez=0;s.rodada=1;a.acao=1;a.bonus=1;a.reacao=1;a.metros=9;
 s=await aplicar(s,{tipo:'mover',ator:a.id,x:4,y:0,terrenoDificilM:4,rev:s.rev},player,dadoLocal);assert.equal(s.atores[0].metros,5,'as botas removem o custo extra não mágico');
 a=s.atores[0];a.x=0;a.y=0;a.metros=9;a.ficha.inventario.itens.find(i=>i.id===botas.id).equipado=false;s=await aplicar(s,{tipo:'mover',ator:a.id,x:4,y:0,terrenoDificilM:4,rev:s.rev},player,dadoLocal);assert.equal(s.atores[0].metros,1,'sem as botas o trecho custa o dobro');
});
test('treinamento de armadura controla escudo, conjuração e d20 de FOR ou DES',async()=>{
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado');a.dono='p';const escudo=structuredClone(catalogoVictor.itens.find(i=>i.catalogoRef==='item.escudo')),placas=structuredClone(catalogoVictor.itens.find(i=>i.catalogoRef==='item.armadura-de-placas'));
 Object.assign(escudo,{id:'sem-treino-escudo',equipado:true,equipadoSlot:'mao_fraca',quantidade:1});Object.assign(placas,{id:'sem-treino-placas',equipado:true,equipadoSlot:'vestes',quantidade:1});a.ficha.inventario.itens.push(escudo,placas);assert.equal(caAtual(a),18,'escudo sem treinamento não concede CA');assert.equal(modoPericiaEquipamento(a,'Furtividade'),'desvantagem');
 let formula;s=await aplicar(s,{tipo:'teste',ator:a.id,grupo:'salvaguardas',chave:'des',modo:'normal',rev:s.rev},player,async(f)=>{formula=f;return {total:8,natural:6,formula:f};});assert.match(formula,/2d20kl1/);
 a=s.atores[0];const magia=opcoesDisponiveis(a).find(o=>o.categoria==='magia'&&(o.circuloBase??0)===0);await assert.rejects(aplicar(s,{tipo:'usar',ator:a.id,opcao:magia.id,alvo:b.id,rev:s.rev},player,dadoLocal),/armadura sem treinamento/);
});
test('item mágico comprado na La Arte conserva referência, preço e efeitos após compactar e reabrir',async()=>{
 let s=novo(),a=adicionar(s,nikki);a.dono='p';a.ficha.inventario.itens.find(i=>i.tipo==='moeda').quantidade=2000;
 s=await aplicar(s,{tipo:'configurarLoja',lojaId:'loja.la-arte',ativa:true,descontoPct:10,rev:s.rev},gm,dadoLocal);
 const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(x=>x.id==='loja.la-arte')),adaga=loja.itens.find(i=>i.nome==='Adaga da Brasa +2');
 s=await aplicar(s,{tipo:'comprar',ator:a.id,lojaId:'loja.la-arte',itemRef:adaga.catalogoRef,quantidade:1,rev:s.rev},player,dadoLocal);
 const comprada=s.atores[0].ficha.inventario.itens.find(i=>i.nome==='Adaga da Brasa +2');assert.equal(comprada.bonusMagico,2);assert.deepEqual(comprada.danoExtraAoAcertar,{formula:'1d4',elemento:'fogo',critico:false});
 const salva=compactarEstado(s),instancia=salva.atores[0].ficha.inventario.itens.find(i=>i.id===comprada.id);assert.equal(instancia.ref,adaga.catalogoRef);assert.equal(instancia.definicaoLocal,undefined);
 const reaberta=validar(salva.atores[0].ficha),item=reaberta.inventario.itens.find(i=>i.id===comprada.id);assert.equal(item.preco.valor,1170);assert.equal(item.danoExtraAoAcertar.elemento,'fogo');
});
test('compra, venda e recompra de Victor preservam dinheiro, peso e lista pessoal',async()=>{
 let s=novo(),a=adicionar(s,nikki);a.dono='p';const saldoInicial=saldoMoedasPc(a),idsAntes=new Set(a.ficha.inventario.itens.map(i=>i.id));
 s=await aplicar(s,{tipo:'configurarLoja',lojaId:'loja.ferraria-victor',ativa:true,descontoPct:10,rev:s.rev},gm,dadoLocal);a=s.atores[0];
 s=await aplicar(s,{tipo:'comprar',ator:a.id,lojaId:'loja.ferraria-victor',itemRef:'item.adaga',quantidade:1,rev:s.rev},player,dadoLocal);a=s.atores[0];
 const comprada=a.ficha.inventario.itens.find(i=>i.catalogoRef==='item.adaga'&&!idsAntes.has(i.id));assert.ok(comprada);assert.equal(saldoMoedasPc(a),saldoInicial-180);
 s=await aplicar(s,{tipo:'vender',ator:a.id,lojaId:'loja.ferraria-victor',itemId:comprada.id,quantidade:1,rev:s.rev},player,dadoLocal);a=s.atores[0];
 const recompra=recomprasDaLoja(s,'loja.ferraria-victor',a.id)[0];assert.equal(recompra.precoPc,140);assert.equal(saldoMoedasPc(a),saldoInicial-40);assert.equal(a.ficha.inventario.itens.some(i=>i.id===comprada.id),false);
 s=await aplicar(s,{tipo:'recomprar',ator:a.id,lojaId:'loja.ferraria-victor',recompraId:recompra.id,rev:s.rev},player,dadoLocal);a=s.atores[0];
 assert.equal(saldoMoedasPc(a),saldoInicial-180);assert.equal(recomprasDaLoja(s,'loja.ferraria-victor',a.id).length,0);assert.ok(a.ficha.inventario.itens.some(i=>i.catalogoRef==='item.adaga'));
});
test('loja bloqueia combate, saldo insuficiente, item equipado e excesso de carga sem alterar o estado',async()=>{
 let s=novo(),a=adicionar(s,nikki);a.dono='p';s=await aplicar(s,{tipo:'configurarLoja',lojaId:'loja.ferraria-victor',ativa:true,descontoPct:1,rev:s.rev},gm,dadoLocal);a=s.atores[0];
 const equipada=a.ficha.inventario.itens.find(i=>i.equipado&&i.tipo!=='moeda');await assert.rejects(aplicar(s,{tipo:'vender',ator:a.id,lojaId:'loja.ferraria-victor',itemId:equipada.id,rev:s.rev},player,dadoLocal),/não pode ser vendido/);
 const antes=structuredClone(s);a.ficha.inventario.capacidadeCargaKg=pesoInventario(a);await assert.rejects(aplicar(s,{tipo:'comprar',ator:a.id,lojaId:'loja.ferraria-victor',itemRef:'item.adaga',rev:s.rev},player,dadoLocal),/capacidade de carga/);assert.equal(s.rev,antes.rev);
 s=antes;a=s.atores[0];const moeda=a.ficha.inventario.itens.find(i=>i.tipo==='moeda');moeda.quantidade=.01;await assert.rejects(aplicar(s,{tipo:'comprar',ator:a.id,lojaId:'loja.ferraria-victor',itemRef:'item.adaga',rev:s.rev},player,dadoLocal),/PO insuficientes/);
 const b=adicionar(s,soldado,'Soldado');s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,dadoLocal);await assert.rejects(aplicar(s,{tipo:'comprar',ator:a.id,lojaId:'loja.ferraria-victor',itemRef:'item.adaga',rev:s.rev},player,dadoLocal),/loja está fechada/);assert.ok(b);
});
test('mestre adiciona item do catálogo e PO diretamente à ficha',async()=>{
 let s=novo(),a=adicionar(s,nikki),saldoAntes=saldoMoedasPc(a),adagasAntes=a.ficha.inventario.itens.filter(i=>i.catalogoRef==='item.adaga').reduce((n,i)=>n+i.quantidade,0);
 s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.adaga',quantidade:3,rev:s.rev},gm,dadoLocal);a=s.atores[0];
 assert.equal(a.ficha.inventario.itens.filter(i=>i.catalogoRef==='item.adaga').reduce((n,i)=>n+i.quantidade,0),adagasAntes+3);
 assert.ok(a.ficha.inventario.itens.find(i=>i.catalogoRef==='item.adaga'&&!i.equipado&&i.quantidade===3));
 s=await aplicar(s,{tipo:'gmAdicionarPo',ator:a.id,quantidade:125,rev:s.rev},gm,dadoLocal);assert.equal(saldoMoedasPc(s.atores[0]),saldoAntes+12500);
 await assert.rejects(aplicar(s,{tipo:'gmAdicionarPo',ator:a.id,quantidade:1,rev:s.rev},player,dadoLocal),/Somente o mestre/);
 await assert.rejects(aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.moedas-de-ouro',quantidade:1,rev:s.rev},gm,dadoLocal),/use Adicionar PO/);
});
test('excluir item é exclusivo do mestre, exige duas confirmações e remove a pilha inteira',async()=>{
 let s=novo();const a=adicionar(s,nikki);a.dono='p';
 s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.adaga',quantidade:3,rev:s.rev},gm,dadoLocal);
 const item=s.atores[0].ficha.inventario.itens.find(i=>i.catalogoRef==='item.adaga'&&!i.equipado&&i.quantidade===3);
 const comando={tipo:'gmExcluirItem',ator:a.id,itemId:item.id,rev:s.rev,confirmado:true,confirmacaoFinal:true},antes=structuredClone(s);
 await assert.rejects(aplicar(s,comando,player,dadoLocal),/Somente o mestre/);
 await assert.rejects(aplicar(s,{...comando,confirmado:false},gm,dadoLocal),/duas etapas/);
 await assert.rejects(aplicar(s,{...comando,confirmacaoFinal:false},gm,dadoLocal),/duas etapas/);
 await assert.rejects(aplicar(s,{...comando,itemId:'inexistente'},gm,dadoLocal),/Item não encontrado/);
 assert.deepEqual(s,antes);
 s=await aplicar(s,comando,gm,dadoLocal);
 assert.equal(s.atores[0].ficha.inventario.itens.some(i=>i.id===item.id),false);
 assert.deepEqual(s.atores[0].ficha.inventario.itens.map(i=>i.id),antes.atores[0].ficha.inventario.itens.filter(i=>i.id!==item.id).map(i=>i.id));
 assert.equal(s.atores[0].acao,antes.atores[0].acao);
 assert.match(s.historico[0],/Mestre excluiu 3× Adaga/);
 await assert.rejects(aplicar(s,comando,gm,dadoLocal),/O encontro mudou/);
 const reaberto=reabrirMesa(s);
 assert.equal(reaberto.atores[0].ficha.inventario.itens.some(i=>i.id===item.id),false);
});
test('excluir equipamento recalcula CA e remove ações e recursos concedidos sem gastar ação',async()=>{
 let s=novo();const a=adicionar(s,fichasJogadores.find(f=>f.id==='draven-thorne'));
 for(const ref of ['item.escudo','item.la-arte.botas-escapistas-mais-2']){
   s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:ref,quantidade:1,rev:s.rev},gm,dadoLocal);
   const item=s.atores[0].ficha.inventario.itens.find(i=>i.catalogoRef===ref);
   s=await aplicar(s,{tipo:'inventario',ator:a.id,operacao:'equipar',itemId:item.id,rev:s.rev,confirmado:true},gm,dadoLocal);
 }
 const escudo=s.atores[0].ficha.inventario.itens.find(i=>i.catalogoRef==='item.escudo');
 const botas=s.atores[0].ficha.inventario.itens.find(i=>i.catalogoRef==='item.la-arte.botas-escapistas-mais-2');
 const caComEscudo=caAtual(s.atores[0]);
 assert.ok(s.atores[0].ficha.recursos.some(r=>r.concedidoPorItem===botas.id));
 s.fase='turnos';s.rodada=1;s.ordem=[a.id];s.vez=0;s.atores[0].acao=0;
 for(const item of [escudo,botas])s=await aplicar(s,{tipo:'gmExcluirItem',ator:a.id,itemId:item.id,rev:s.rev,confirmado:true,confirmacaoFinal:true},gm,dadoLocal);
 assert.equal(caAtual(s.atores[0]),caComEscudo-2);
 assert.equal(s.atores[0].ficha.opcoes.some(o=>o.concedidaPorItem===botas.id),false);
 assert.equal(s.atores[0].ficha.recursos.some(r=>r.concedidoPorItem===botas.id),false);
 assert.equal(Object.keys(s.atores[0].rec).some(id=>id.startsWith('item-'+botas.id+'-')),false);
 assert.equal(s.atores[0].acao,0);
});
test('excluir item oferecido ou PO reinicia as confirmações de uma troca pendente',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado);
 const item=a.ficha.inventario.itens.find(i=>!i.equipado&&i.tipo!=='moeda'),moeda=a.ficha.inventario.itens.find(i=>i.tipo==='moeda');
 const id='troca-exclusao';
 const criarTroca=(itens,poPc)=>({id,status:'final',solicitante:a.id,destinatario:b.id,ofertas:{[a.id]:{itens,poPc},[b.id]:{itens:[],poPc:0}},confirmacaoItens:{[a.id]:true,[b.id]:true},confirmacaoFinal:{[a.id]:true,[b.id]:false}});
 s.comercio.trocas=[criarTroca([{itemId:item.id,quantidade:1}],0)];
 s=await aplicar(s,{tipo:'gmExcluirItem',ator:a.id,itemId:item.id,rev:s.rev,confirmado:true,confirmacaoFinal:true},gm,dadoLocal);
 let troca=trocaDoAtor(s,a.id);
 assert.equal(troca.status,'ofertas');assert.deepEqual(troca.ofertas[a.id].itens,[]);
 assert.ok(Object.values(troca.confirmacaoItens).every(x=>x===false));
 assert.ok(Object.values(troca.confirmacaoFinal).every(x=>x===false));
 s.comercio.trocas=[criarTroca([],saldoMoedasPc(s.atores[0]))];
 s=await aplicar(s,{tipo:'gmExcluirItem',ator:a.id,itemId:moeda.id,rev:s.rev,confirmado:true,confirmacaoFinal:true},gm,dadoLocal);
 troca=trocaDoAtor(s,a.id);
 assert.equal(saldoMoedasPc(s.atores[0]),0);assert.equal(troca.ofertas[a.id].poPc,0);assert.equal(troca.status,'ofertas');
});
test('troca entre jogadores exige aceite, duas confirmações e transfere itens e PO atomicamente',async()=>{
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));a.dono='p1';b.dono='p2';a.ficha.inventario.capacidadeCargaKg=999;b.ficha.inventario.capacidadeCargaKg=999;
 s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.adaga',quantidade:3,rev:s.rev},gm,dadoLocal);a=s.atores[0];b=s.atores[1];
 s=await aplicar(s,{tipo:'gmAdicionarItem',ator:b.id,itemRef:'item.escudo',quantidade:1,rev:s.rev},gm,dadoLocal);a=s.atores[0];b=s.atores[1];
 const adaga=a.ficha.inventario.itens.find(i=>i.catalogoRef==='item.adaga'&&!i.equipado&&i.quantidade===3),escudo=b.ficha.inventario.itens.find(i=>i.catalogoRef==='item.escudo'&&!i.equipado),saldoA=saldoMoedasPc(a),saldoB=saldoMoedasPc(b),p1={id:'p1',role:'PLAYER'},p2={id:'p2',role:'PLAYER'};
 s=await aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},p1,dadoLocal);let t=trocaDoAtor(s,a.id);assert.equal(t.status,'solicitada');
 s=await aplicar(s,{tipo:'responderTroca',ator:b.id,trocaId:t.id,aceitar:true,rev:s.rev},p2,dadoLocal);t=trocaDoAtor(s,a.id);assert.equal(t.status,'ofertas');
 s=await aplicar(s,{tipo:'oferecerTroca',ator:a.id,trocaId:t.id,itemId:adaga.id,quantidade:2,rev:s.rev},p1,dadoLocal);
 s=await aplicar(s,{tipo:'definirPoTroca',ator:a.id,trocaId:t.id,quantidadePc:100,rev:s.rev},p1,dadoLocal);
 s=await aplicar(s,{tipo:'oferecerTroca',ator:b.id,trocaId:t.id,itemId:escudo.id,quantidade:1,rev:s.rev},p2,dadoLocal);
 s=await aplicar(s,{tipo:'definirPoTroca',ator:b.id,trocaId:t.id,quantidadePc:50,rev:s.rev},p2,dadoLocal);
 s=await aplicar(s,{tipo:'confirmarItensTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);assert.equal(trocaDoAtor(s,a.id).status,'ofertas');
 s=await aplicar(s,{tipo:'confirmarItensTroca',ator:b.id,trocaId:t.id,rev:s.rev},p2,dadoLocal);assert.equal(trocaDoAtor(s,a.id).status,'final');
 s=await aplicar(s,{tipo:'confirmarTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);assert.ok(trocaDoAtor(s,a.id));
 s=await aplicar(s,{tipo:'confirmarTroca',ator:b.id,trocaId:t.id,rev:s.rev},p2,dadoLocal);a=s.atores[0];b=s.atores[1];assert.equal(trocaDoAtor(s,a.id),undefined);
 assert.equal(a.ficha.inventario.itens.find(i=>i.id===adaga.id).quantidade,1);assert.ok(a.ficha.inventario.itens.some(i=>i.catalogoRef==='item.escudo'&&!i.equipado));
 assert.equal(b.ficha.inventario.itens.filter(i=>i.catalogoRef==='item.adaga').reduce((n,i)=>n+i.quantidade,0)>=2,true);assert.equal(b.ficha.inventario.itens.some(i=>i.id===escudo.id),false);
 assert.equal(saldoMoedasPc(a),saldoA-50);assert.equal(saldoMoedasPc(b),saldoB+50);
});
test('troca unilateral permite dar item ou PO sem exigir contrapartida',async()=>{
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));a.dono='p1';b.dono='p2';a.ficha.inventario.capacidadeCargaKg=999;b.ficha.inventario.capacidadeCargaKg=999;
 const p1={id:'p1',role:'PLAYER'},p2={id:'p2',role:'PLAYER'};s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.adaga',quantidade:1,rev:s.rev},gm,dadoLocal);a=s.atores[0];b=s.atores[1];
 const presente=a.ficha.inventario.itens.find(i=>i.catalogoRef==='item.adaga'&&!i.equipado&&i.quantidade===1),saldoA=saldoMoedasPc(a),saldoB=saldoMoedasPc(b);
 s=await aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},p1,dadoLocal);let t=trocaDoAtor(s,a.id);s=await aplicar(s,{tipo:'responderTroca',ator:b.id,trocaId:t.id,aceitar:true,rev:s.rev},p2,dadoLocal);t=trocaDoAtor(s,a.id);
 s=await aplicar(s,{tipo:'oferecerTroca',ator:a.id,trocaId:t.id,itemId:presente.id,quantidade:1,rev:s.rev},p1,dadoLocal);
 s=await aplicar(s,{tipo:'definirPoTroca',ator:a.id,trocaId:t.id,quantidadePc:200,rev:s.rev},p1,dadoLocal);
 s=await aplicar(s,{tipo:'confirmarItensTroca',ator:b.id,trocaId:t.id,rev:s.rev},p2,dadoLocal);assert.equal(trocaDoAtor(s,a.id).status,'ofertas');
 s=await aplicar(s,{tipo:'confirmarItensTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);assert.equal(trocaDoAtor(s,a.id).status,'final');
 s=await aplicar(s,{tipo:'confirmarTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);s=await aplicar(s,{tipo:'confirmarTroca',ator:b.id,trocaId:t.id,rev:s.rev},p2,dadoLocal);a=s.atores[0];b=s.atores[1];
 assert.equal(a.ficha.inventario.itens.some(i=>i.id===presente.id),false);assert.ok(b.ficha.inventario.itens.some(i=>i.catalogoRef==='item.adaga'&&!i.equipado));assert.equal(saldoMoedasPc(a),saldoA-200);assert.equal(saldoMoedasPc(b),saldoB+200);
});
test('troca completamente vazia continua bloqueada',async()=>{
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));a.dono='p1';b.dono='p2';const p1={id:'p1',role:'PLAYER'},p2={id:'p2',role:'PLAYER'};
 s=await aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},p1,dadoLocal);let t=trocaDoAtor(s,a.id);s=await aplicar(s,{tipo:'responderTroca',ator:b.id,trocaId:t.id,aceitar:true,rev:s.rev},p2,dadoLocal);t=trocaDoAtor(s,a.id);
 s=await aplicar(s,{tipo:'confirmarItensTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);await assert.rejects(aplicar(s,{tipo:'confirmarItensTroca',ator:b.id,trocaId:t.id,rev:s.rev},p2,dadoLocal),/ao menos um item ou PO no total/);
});
test('alterar uma oferta reinicia confirmações e itens equipados não podem ser negociados',async()=>{
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));a.dono='p1';b.dono='p2';const p1={id:'p1',role:'PLAYER'},p2={id:'p2',role:'PLAYER'};
 s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.adaga',quantidade:2,rev:s.rev},gm,dadoLocal);a=s.atores[0];b=s.atores[1];const item=a.ficha.inventario.itens.find(i=>i.catalogoRef==='item.adaga'&&!i.equipado&&i.quantidade===2),equipado=a.ficha.inventario.itens.find(i=>i.equipado&&i.tipo!=='moeda');
 s=await aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},p1,dadoLocal);let t=trocaDoAtor(s,a.id);s=await aplicar(s,{tipo:'responderTroca',ator:b.id,trocaId:t.id,aceitar:true,rev:s.rev},p2,dadoLocal);t=trocaDoAtor(s,a.id);
 await assert.rejects(aplicar(s,{tipo:'oferecerTroca',ator:a.id,trocaId:t.id,itemId:equipado.id,quantidade:1,rev:s.rev},p1,dadoLocal),/indisponível/);
 s=await aplicar(s,{tipo:'oferecerTroca',ator:a.id,trocaId:t.id,itemId:item.id,quantidade:1,rev:s.rev},p1,dadoLocal);s=await aplicar(s,{tipo:'definirPoTroca',ator:b.id,trocaId:t.id,quantidadePc:100,rev:s.rev},p2,dadoLocal);
 s=await aplicar(s,{tipo:'confirmarItensTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);assert.equal(trocaDoAtor(s,a.id).confirmacaoItens[a.id],true);
 s=await aplicar(s,{tipo:'oferecerTroca',ator:a.id,trocaId:t.id,itemId:item.id,quantidade:2,rev:s.rev},p1,dadoLocal);t=trocaDoAtor(s,a.id);assert.equal(t.confirmacaoItens[a.id],false);assert.equal(t.confirmacaoItens[b.id],false);
});
test('iniciar combate cancela trocas pendentes e bloqueia novas negociações',async()=>{
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));a.dono='p1';b.dono='p2';const p1={id:'p1',role:'PLAYER'};
 s=await aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},p1,dadoLocal);assert.ok(trocaDoAtor(s,a.id));s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,dadoLocal);assert.equal(s.comercio.trocas.length,0);assert.match(s.historico[0],/troca.*cancelada/i);
 await assert.rejects(aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},p1,dadoLocal),/Escolha outro personagem|troca/);
});
test('troca acima da carga falha sem transferir itens ou dinheiro',async()=>{
 let s=novo(),a=adicionar(s,nikki),b=adicionar(s,fichasJogadores.find(x=>x.id==='skimi'));a.dono='p1';b.dono='p2';a.ficha.inventario.capacidadeCargaKg=999;b.ficha.inventario.capacidadeCargaKg=pesoInventario(b);const p1={id:'p1',role:'PLAYER'},p2={id:'p2',role:'PLAYER'};
 s=await aplicar(s,{tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.armadura-de-placas',quantidade:1,rev:s.rev},gm,dadoLocal);a=s.atores[0];b=s.atores[1];const pesada=a.ficha.inventario.itens.find(i=>i.catalogoRef==='item.armadura-de-placas'),saldoAntes=saldoMoedasPc(b);
 s=await aplicar(s,{tipo:'solicitarTroca',ator:a.id,destino:b.id,rev:s.rev},p1,dadoLocal);let t=trocaDoAtor(s,a.id);s=await aplicar(s,{tipo:'responderTroca',ator:b.id,trocaId:t.id,aceitar:true,rev:s.rev},p2,dadoLocal);t=trocaDoAtor(s,a.id);
 s=await aplicar(s,{tipo:'oferecerTroca',ator:a.id,trocaId:t.id,itemId:pesada.id,quantidade:1,rev:s.rev},p1,dadoLocal);s=await aplicar(s,{tipo:'definirPoTroca',ator:b.id,trocaId:t.id,quantidadePc:100,rev:s.rev},p2,dadoLocal);s=await aplicar(s,{tipo:'confirmarItensTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);s=await aplicar(s,{tipo:'confirmarItensTroca',ator:b.id,trocaId:t.id,rev:s.rev},p2,dadoLocal);s=await aplicar(s,{tipo:'confirmarTroca',ator:a.id,trocaId:t.id,rev:s.rev},p1,dadoLocal);
 await assert.rejects(aplicar(s,{tipo:'confirmarTroca',ator:b.id,trocaId:t.id,rev:s.rev},p2,dadoLocal),/capacidade de carga/);assert.ok(s.atores[0].ficha.inventario.itens.some(i=>i.id===pesada.id));assert.equal(saldoMoedasPc(s.atores[1]),saldoAntes);assert.ok(trocaDoAtor(s,a.id));
});
test('ataques de arma são derivados somente dos itens equipados e desarmados continuam livres',()=>{
 const f=fichasJogadores.find(x=>x.id==='draven-thorne'),s=novo(),d=adicionar(s,f),nomes=opcoesDisponiveis(d).map(o=>o.nome);
 const armas=ataquesEquipados(d);assert.deepEqual(armas.map(o=>o.dadosEquipamento.tipoArma),['espada_grande']);
 assert.equal(armas[0].automacao.bonus,5);assert.equal(armas[0].automacao.dano,'2d6+3');assert.equal(armas[0].automacao.elemento,'cortante');assert.equal(armas[0].dadosEquipamento.proficiente,true);assert.equal(armas[0].dadosEquipamento.maestria,true);
 assert.equal(nomes.some(n=>/Azagaia|Mangual/.test(n)),false);assert.equal(nomes.some(n=>/Golpe desarmado/i.test(n)),true);
});
test('rodapé começa pelas armas equipadas e mantém cada arremesso logo depois',()=>{
 const m=mesa(),ordenadas=ordenarOpcoesRodape(m.a),armas=ordenadas.slice(0,4),itens=new Map(m.a.ficha.inventario.itens.map(i=>[i.id,i]));
 assert.ok(armas.every(o=>o.geradaPorItem));assert.deepEqual(armas.map(o=>itens.get(o.origemItem).equipadoSlot),['mao_forte','mao_forte','mao_fraca','mao_fraca']);assert.deepEqual(armas.map(o=>Boolean(o.automacao.arremesso)),[false,true,false,true]);
 const s=novo(),zurichAtor=adicionar(s,fichasJogadores.find(x=>x.id==='zurich')),primeiras=ordenarOpcoesRodape(zurichAtor).filter(o=>o.geradaPorItem).slice(0,3),itensZurich=new Map(zurichAtor.ficha.inventario.itens.map(i=>[i.id,i]));
 assert.deepEqual(primeiras.map(o=>itensZurich.get(o.origemItem).equipadoSlot),['mao_forte','mao_fraca','arma_distancia'],'a mão fraca permite ataque normal; o extra Ágil permanece no compositor');
});
test('o mesmo item recalcula acerto, dano e proficiência para o novo portador',()=>{
 const s=novo(),d=adicionar(s,fichasJogadores.find(x=>x.id==='draven-thorne')),n=adicionar(s,nikki),espada=structuredClone(d.ficha.inventario.itens.find(i=>i.tipoArma==='espada_grande'));
 for(const i of n.ficha.inventario.itens)if(i.equipado&&['mao_forte','mao_fraca'].includes(i.equipadoSlot)){i.equipado=false;delete i.equipadoSlot;}
 espada.id='espada-transferida';espada.equipado=true;espada.equipadoSlot='mao_forte';n.ficha.inventario.itens.push(espada);
 const original=ataquesEquipados(d)[0],transferida=ataquesEquipados(n).find(o=>o.origemItem===espada.id);
 assert.equal(original.automacao.bonus,5);assert.equal(original.automacao.dano,'2d6+3');assert.equal(transferida.automacao.bonus,0);assert.equal(transferida.automacao.dano,'2d6');assert.equal(transferida.dadosEquipamento.proficiente,false);assert.equal(proficienteComArma(n.ficha,espada),false);
});
test('acuidade, distância, arremesso, duas mãos e Artes Marciais usam os dados do item',()=>{
 const s=novo(),n=adicionar(s,nikki),z=adicionar(s,fichasJogadores.find(x=>x.id==='zurich')),l=adicionar(s,fichasJogadores.find(x=>x.id==='loteria'));
 const adaga=ataquesEquipados(n).find(o=>o.automacao.arremesso),arco=ataquesEquipados(z).find(o=>o.dadosEquipamento.tipoArma==='arco_longo'),lanca=ataquesEquipados(l).find(o=>o.dadosEquipamento.tipoArma==='lanca'&&!o.automacao.arremesso);
 assert.equal(adaga.dadosEquipamento.atributo,'des');assert.equal(adaga.automacao.bonus,4);assert.equal(adaga.automacao.elemento,'perfurante');
 assert.equal(arco.dadosEquipamento.atributo,'des');assert.equal(arco.automacao.bonus,7);assert.equal(arco.automacao.alcanceM,18);
 assert.equal(lanca.dadosEquipamento.atributo,'des');assert.equal(lanca.automacao.dano,'1d8+3');
});
test('todo ataque ou habilidade respeita o teto sistêmico de dezoito metros',()=>{
 for(const ficha of [...fichasJogadores,soldado]){const s=novo(),a=adicionar(s,ficha);for(const o of opcoesDisponiveis(a)){if(Number.isFinite(o.automacao?.alcanceM))assert.ok(o.automacao.alcanceM<=LIMITE_ALCANCE_M,o.nome);if(Number.isFinite(o.selecao?.alcanceM))assert.ok(o.selecao.alcanceM<=LIMITE_ALCANCE_M,o.nome);}}
});
test('armadura pesada usa classificação, escudo independente e requisito de força',()=>{
 const s=novo(),n=adicionar(s,nikki),placas=structuredClone(catalogoVictor.itens.find(i=>i.id==='victor-armadura-placas')),escudo=structuredClone(catalogoVictor.itens.find(i=>i.id==='victor-escudo'));
 for(const i of n.ficha.inventario.itens)i.equipado=false;Object.assign(placas,{id:'placas-teste',quantidade:1,equipado:true,equipadoSlot:'vestes'});Object.assign(escudo,{id:'escudo-teste',quantidade:1,equipado:true,equipadoSlot:'mao_fraca'});n.ficha.inventario.itens.push(placas,escudo);
 assert.equal(caAtual(n),18,'Nikki não recebe o bônus do escudo sem treinamento');assert.equal(deslocamentoMaximo(n),6);assert.equal(placas.categoriaArmadura,'pesada');assert.equal(escudo.categoriaArmadura,'escudo');
});
test('Conteúdo configurado cobre os itens das sete fichas, soldados e Forja do Victor',()=>{
 const normal=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),nomes=new Set(conteudoConfigurado.itens.map(i=>normal(i.nome)));
 for(const f of [...fichasJogadores,soldado])for(const item of f.equipamentos??f.inventario?.itens??[])assert.ok(nomes.has(normal(item.nome??item.name)),'faltou '+(item.nome??item.name));
 for(const item of catalogoVictor.itens)assert.ok(nomes.has(normal(item.nome)),'faltou '+item.nome);
 assert.equal(conteudoConfigurado.sistemaEquipamentos.alcanceMaximoM,18);assert.equal(conteudoConfigurado.sistemaEquipamentos.status,'Configurado');
});

test('catálogo de dano cobre os treze tipos oficiais com cor e aliases',()=>{
 assert.equal(Object.keys(TIPOS_DANO).length,13);assert.equal(normalizarTipoDano('Fire'),'fogo');assert.equal(normalizarTipoDano('Força'),'forca');assert.equal(normalizarTipoDano('Lightning'),'raio');
 for(const id of Object.keys(TIPOS_DANO)){const info=infoTipoDano(id);assert.match(info.cor,/^#[0-9A-F]{6}$/i);assert.ok(info.nome&&info.simbolo&&info.modelo);}
});
test('resolvedor aplica redução, resistência e vulnerabilidade na ordem oficial',()=>{
 const rel=resolverDano({parcelas:[{valor:28,tipo:'fogo'}],defesas:[{id:'r',nome:'Resistência',operacao:'resistencia',filtro:{tipos:['fogo']}},{id:'v',nome:'Vulnerabilidade',operacao:'vulnerabilidade',filtro:{tipos:['fogo']}}],ajustes:[{id:'red',nome:'Aura',operacao:'reducao_fixa',valor:5}],alvo:{id:'a',nome:'Alvo',pv:50,pvTemporarios:0}});
 assert.equal(rel.parcelas[0].final,22);assert.equal(rel.danoRecebido,22);assert.deepEqual(rel.parcelas[0].passos.map(x=>x.operacao),['reducao_fixa','resistencia','vulnerabilidade']);
});
test('resistências não acumulam e dano misto preserva tipos e tags',()=>{
 const rel=resolverDano({parcelas:[{valor:9,tipo:'cortante',tags:['lamina','arma']},{valor:6,tipo:'fogo',tags:['elemental']}],defesas:[{id:'l1',nome:'Lâminas',operacao:'resistencia',filtro:{tagsAlguma:['lamina']}},{id:'l2',nome:'Cortante',operacao:'resistencia',filtro:{tipos:['cortante']}},{id:'f',nome:'Fogo',operacao:'resistencia',filtro:{tipos:['fogo']}}],alvo:{id:'a',nome:'Alvo',pv:20,pvTemporarios:2}});
 assert.deepEqual(rel.parcelas.map(x=>x.final),[4,3]);assert.equal(rel.danoRecebido,7);assert.equal(rel.absorvidoPorPvTemporario,2);assert.equal(rel.pvPerdido,5);assert.equal(rel.pvDepois,15);
});
test('imunidade, limiar e excesso produzem relatório aplicável idêntico ao PV',()=>{
 const imune=resolverDano({parcelas:[{valor:20,tipo:'veneno'}],defesas:[{id:'i',nome:'Imune',operacao:'imunidade',filtro:{tipos:['veneno']}}],alvo:{id:'a',nome:'Alvo',pv:3,pvTemporarios:0}});assert.equal(imune.pvPerdido,0);
 const baixo=resolverDano({parcelas:[{valor:9,tipo:'contundente'}],defesas:[{id:'l',nome:'Limiar 10',operacao:'limiar',valor:10}],alvo:{id:'a',nome:'Alvo',pv:3,pvTemporarios:0}});assert.equal(baixo.danoRecebido,0);
 const alto=resolverDano({parcelas:[{valor:12,tipo:'contundente'}],defesas:[{id:'l',nome:'Limiar 10',operacao:'limiar',valor:10}],alvo:{id:'a',nome:'Alvo',pv:3,pvTemporarios:0}}),ator={pv:3,pvTemporarios:0,estadoVida:'consciente',salvaguardasMorte:{sucessos:0,falhas:0},ficha:{pvMaximos:10}};aplicarRelatorioDano(ator,alto,{pvMaximos:10});assert.equal(alto.excesso,9);assert.equal(ator.pv,0);assert.equal(ator.estadoVida,'inconsciente');
});
test('defesas podem vir da ficha, passiva, item equipado e buff',()=>{
 const ator={id:'a',ficha:{id:'f',resistencias:['fogo'],passivas:[{id:'p',ativa:true,defesasDano:[{id:'psi',nome:'Mente',operacao:'resistencia',filtro:{tipos:['psiquico']}}]}],inventario:{itens:[{id:'capa',equipado:true,defesasDano:[{id:'frio',nome:'Capa',operacao:'resistencia',filtro:{tipos:['frio']}}]}]}},efeitosAtivos:[{id:'buff',defesasDano:[{id:'raio',nome:'Proteção',operacao:'imunidade',filtro:{tipos:['raio']}}]}]};
 assert.deepEqual(new Set(defesasDanoDoAtor(ator).map(x=>x.id)),new Set(['resistencia-fogo-0','psi','frio','raio']));
});

// ===== Revisão de regras (PR correcoes-revisao-regras) =====
// Rolador que imita a sala: calcula relatoriosDano como o bridge e anexa em cada resultado.
const {relatoriosDaRolagem}=await import('./site/damage.mjs');
const fichaRev=async n=>validar(JSON.parse(await readFile(new URL('./site/fichas/'+n+'.json',import.meta.url),'utf8')));
function roladorSala({d20=15,dano=6,salva=null}={}){
  const formulas=[];
  const rolar=async(formula,meta={})=>{
    const um=f=>{formulas.push({f,meta});if(/d20/.test(f)){const nat=meta.tipo==='salvaguarda'&&salva!==null?salva:d20;return {total:nat+4,natural:nat,formula:f};}return {total:dano,natural:null,formula:f};};
    const r=Array.isArray(formula)?{resultados:formula.map(um)}:um(formula);
    const rel=relatoriosDaRolagem(r,{...meta,adicionais:(meta.adicionais??[]).filter(x=>x.automatico)});
    if(rel.length){r.relatoriosDano=rel;if(r.resultados)r.resultados=r.resultados.map((x,i)=>({...x,relatorioDano:rel[i]}));}
    r.recursosAtivos=(meta.adicionais??[]).filter(x=>x.automatico).map(x=>x.id);
    return r;
  };
  return {rolar,formulas};
}
async function duelo(fichaA,fichaB='soldado',{distancia=1.5}={}){
  let s=novo();const a=adicionar(s,await fichaRev(fichaA)),b=adicionar(s,await fichaRev(fichaB));
  a.dono='p';a.x=0;a.y=0;b.x=distancia;b.y=0;s.fase='turnos';s.rodada=1;s.vez=0;s.ordem=[a.id,b.id];
  for(const x of s.atores){x.init=10;x.acao=1;x.bonus=1;x.reacao=1;x.metros=9;}
  return {s,a,b};
}
const opRev=(a,trecho)=>opcoesDisponiveis(a).find(o=>o.nome.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().includes(trecho));

test('Draven só pode gastar um Dado de Superioridade por ataque',async()=>{
  const {s,a,b}=await duelo('draven-thorne');
  const comando={rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'espada grande').id,alvo:b.id};
  const rolar=quantidade=>async(formula,meta)=>{
    if(meta.tipo==='ataque')return {total:22,natural:17};
    if(meta.tipo==='salvaguarda')return {total:20,natural:18};
    const manobras=meta.adicionais.filter(x=>x.grupoExclusivo==='manobra-mestre-da-batalha');
    assert.equal(manobras.length,3);
    return {total:8,resultados:[{total:4},{total:4}],recursosAtivos:manobras.slice(0,quantidade).map(x=>x.id)};
  };
  await assert.rejects(aplicar(s,comando,player,rolar(3)),/uma manobra por ataque/);
  assert.equal(a.rec['dados-de-superioridade'],4);
  const resultado=await aplicar(s,comando,player,rolar(1));
  assert.equal(resultado.atores[0].rec['dados-de-superioridade'],3);
});

test('#35 vários acertos no mesmo alvo somam o dano (Mísseis Mágicos e Torrente de Golpes)',async()=>{
  for(const [ficha,trecho,n] of [['nikki','misseis magicos',3],['loteria','torrente',2]]){
    let {s,a,b}=await duelo(ficha);const pv=b.pv;
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,trecho).id,alvos:Array(n).fill(b.id)},player,roladorSala({d20:16,dano:6}).rolar);
    assert.equal(s.atores[1].pv,pv-6*n,trecho);
  }
});

test('#25 descanso longo recupera o que é de descanso curto; Dados de Vida e Recuperar Fôlego seguem 2024',async()=>{
  let s=novo();const sk=adicionar(s,await fichaRev('skimi')),dr=adicionar(s,await fichaRev('draven-thorne')),lo=adicionar(s,await fichaRev('loteria'));
  sk.rec['espaco-2']=0;dr.rec['dados-de-superioridade']=0;dr.rec['surto-de-acao']=0;dr.rec['recuperar-folego']=0;lo.rec['pontos-de-foco']=0;
  for(const a of [sk,dr,lo])a.rec['dados-de-vida']=0;
  s=await aplicar(s,{rev:s.rev,tipo:'descanso',periodo:'curto'},gm,()=>0);
  let [a,b,c]=s.atores;
  assert.equal(a.rec['espaco-2'],2);assert.equal(b.rec['recuperar-folego'],1,'curto devolve 1 uso');assert.equal(a.rec['dados-de-vida'],0,'Dados de Vida não voltam no curto');
  s=await aplicar(s,{rev:s.rev,tipo:'descanso',periodo:'longo'},gm,()=>0);[a,b,c]=s.atores;
  assert.equal(a.rec['espaco-2'],2);assert.equal(b.rec['dados-de-superioridade'],4);assert.equal(b.rec['surto-de-acao'],1);assert.equal(b.rec['recuperar-folego'],2);assert.equal(c.rec['pontos-de-foco'],3);
  assert.equal(a.rec['dados-de-vida'],3,'Dados de Vida voltam no longo');
});
test('#25 gastar Dado de Vida fora de combate cura dado + CON',async()=>{
  let s=novo();const a=adicionar(s,await fichaRev('draven-thorne'));a.dono='p';a.pv=10;
  const o=opRev(a,'gastar dado de vida');assert.equal(o.automacao.cura,'1d10+2');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:o.id},player,async()=>7);
  assert.equal(s.atores[0].pv,17);assert.equal(s.atores[0].rec['dados-de-vida'],2);
});

test('#26 teste de perícia recebe Orientação e Ponto de Sorte do personagem',async()=>{
  let s=novo();const z=adicionar(s,await fichaRev('zurich')),k=adicionar(s,await fichaRev('skimi'));
  z.dono='p';k.dono='p';z.x=0;k.x=1.5;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:z.id,opcao:opRev(z,'orientacao').id,alvo:k.id},player,async()=>10);
  let meta=null;
  await aplicar(s,{rev:s.rev,tipo:'teste',ator:k.id,grupo:'pericias',chave:'Enganação'},player,async(f,m={})=>{meta=m;return {total:12,natural:8,formula:f};});
  assert.ok(meta.adicionais.some(x=>x.nome==='Orientação'),'Orientação aparece no teste de perícia');
  assert.ok(meta.rerrolagens.some(x=>/Sorte/.test(x.nome)),'Ponto de Sorte aparece no teste de perícia');
});

test('#3 crítico dobra todos os dados de dano (Espada Grande 2d6+3 vira 4d6+3)',async()=>{
  let {s,a,b}=await duelo('draven-thorne');const r=roladorSala({d20:20,dano:8});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'espada grande').id,alvo:b.id},player,r.rolar);
  assert.ok(r.formulas.some(x=>x.meta.tipo==='dano'&&/^4d6\+3/.test(x.f)),'fórmula do crítico: '+r.formulas.map(x=>x.f).join(' | '));
});

test('#22 Ataque de Sopro não atinge o próprio Dragoberto e o arco soma Arquearia',async()=>{
  for(const forma of ['cone','linha']){
    let {s,a,b}=await duelo('dragoberto');const pv=a.pv;
    const o=opcoesDisponiveis(a).find(x=>x.automacao?.area?.forma===forma);
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:o.id,ponto:{x:2.5,y:0}},player,roladorSala({salva:2,dano:8}).rolar);
    assert.equal(s.atores[0].pv,pv,forma+' não fere quem sopra');assert.ok(s.atores[1].pv<b.pv,forma+' fere o alvo');
  }
  const {a}=await duelo('dragoberto');assert.equal(opRev(a,'arco longo').automacao.bonus,7);
});

test('#7 CD de Agarrar/Derrubar/Empurrar vem da ficha (Monge pode usar DES)',async()=>{
  const esperado={skimi:9,'hannah-montana':9,nikki:10,dragoberto:10,zurich:11,'draven-thorne':13,loteria:13};
  for(const [n,cd] of Object.entries(esperado)){const {a}=await duelo(n);for(const t of ['imobilizar','derrubar','empurrar'])assert.equal(opRev(a,t).automacao.cd,cd,n+' '+t);}
});

test('#19/#20 ataque extra Leve exige ataque antes; com Ágil não gasta Ação Bônus',async()=>{
  // Hannah: adaga da mão fraca só depois de atacar com arma Leve
  let {s,a,b}=await duelo('hannah-montana');
  const extra=opcoesDisponiveis(a).find(o=>o.requisitosUso?.aposAtaque&&!o.automacao.arremesso);
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:extra.id,alvo:b.id},player,roladorSala().rolar),/depois de realizar um ataque/);
  // Zurich: Cimitarra (Ágil) + Espada Curta + Marca do Predador no mesmo turno
  ({s,a,b}=await duelo('zurich'));
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'marca do predador').id,alvo:b.id},player,roladorSala().rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(s.atores[0],'cimitarra').id,alvo:b.id},player,roladorSala().rolar);
  const curta=opRev(s.atores[0],'espada curta');assert.deepEqual(curta.custo,[]);assert.match(curta.nome,/Ágil/);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:curta.id,alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[0].bonus,0,'só a Marca gastou a Ação Bônus');assert.equal(s.atores[0].acao,0);
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:curta.id,alvo:b.id},player,roladorSala().rolar),/já foi usada neste turno/);
});
test('M04 compõe o ataque Ágil de Zurich na mesma Ação Atacar',async()=>{
  let {s,a,b}=await duelo('zurich');
  const cimitarra=opRev(a,'cimitarra'),modos=cimitarra.composicao?.modos??[];
  assert.equal(cimitarra.composicao?.tipo,'sequencia');assert.equal(modos.length,2);
  assert.equal(modos[0].ordem,1);assert.equal(modos[1].ordem,2);assert.equal(modos[1].requerModoAnterior,modos[0].id);
  assert.ok(!ordenarOpcoesRodape(a).some(o=>o.id===modos[1].origemOpcaoId),'o ataque Ágil fica dentro do compositor');
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,composicao:[{modoId:modos[1].id,alvoId:b.id}]},player,roladorSala().rolar),/ordem|etapa anterior/);
  assert.equal(s.atores[0].acao,1,'plano inválido não gasta a ação');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,composicao:[{modoId:modos[0].id,alvoId:b.id},{modoId:modos[1].id,alvoId:b.id}]},player,roladorSala().rolar);
  assert.equal(s.atores[0].acao,0);assert.equal(s.atores[0].bonus,1,'Ágil conserva a Ação Bônus');
  assert.equal(s.atores[0].eventosTurno.ataques.length,2);assert.equal(s.atores[0].usosTurno['maestria-agil'],true);
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:modos[1].origemOpcaoId,alvo:b.id},player,roladorSala().rolar),/já foi usada neste turno|Saldo insuficiente/);
});
test('#65 ataques compostos aplicam Marca do Predador em cada acerto e enviam os modificadores ao ajuste',async()=>{
 let {s,a,b}=await duelo('zurich');
 b.efeitosAtivos=[{id:'marca-composta',nome:'Marca do Predador',tipo:'debuff',origemAtorId:a.id,danoAoSerAtingido:{origemAtorId:a.id,formula:'1d6',elemento:'energetico',tagsAtaque:['arma']}}];
 const ataque=opRev(a,'cimitarra'),modos=ataque.composicao.modos;let fase=0;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,composicao:[{modoId:modos[0].id,alvoId:b.id},{modoId:modos[1].id,alvoId:b.id}]},player,async(formula,meta)=>{
  if(meta.tipo==='ataque')return {total:22,natural:17,formula};
  fase++;assert.ok(meta.adicionais.some(x=>x.id==='marca-composta'&&x.automatico),'cada acerto composto deve ofertar o dano persistente');
  assert.equal(meta.alvo,'Soldado da guarda');
  return {total:10,formula,resultados:[{total:6},{total:4}],recursosAtivos:meta.adicionais.filter(x=>x.automatico).map(x=>x.id)};
 });
 assert.equal(fase,2);assert.equal(s.atores[1].pv,b.pv-20,'os dois ataques aplicam o dano-base e a marca');
});
test('#65 ataques compostos respeitam dano garantido no erro e efeitos de maestria no acerto',async()=>{
 let {s,a,b}=await duelo('zurich');const op={id:'ataque-duplo-teste',nome:'Ataque duplo',categoria:'acao',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'ataque',bonus:5,dano:'1d6',elemento:'cortante',alcanceM:1.5},composicao:{tipo:'sequencia',quantidadeMinima:2,quantidadeMaxima:2,modoPadrao:'primeiro',modos:[{id:'primeiro',nome:'Primeiro',tipo:'ataque',ordem:1,automacao:{tipo:'ataque',bonus:5,dano:'1d6',elemento:'cortante',alcanceM:1.5,danoAoErrar:2}},{id:'segundo',nome:'Segundo',tipo:'ataque',ordem:2,automacao:{tipo:'ataque',bonus:5,dano:'1d6',elemento:'cortante',alcanceM:1.5,efeitoAcerto:{nome:'Lentidão de teste',tipo:'debuff'}}}]}};a.ficha.opcoes.push(op);let d20=0;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:op.id,composicao:[{modoId:'primeiro',alvoId:b.id},{modoId:'segundo',alvoId:b.id}]},player,async(formula,meta)=>{
  if(meta.tipo==='ataque')return {total:[8,20][d20],natural:[3,15][d20++],formula};
  return {total:4,formula,resultados:[{total:4}],recursosAtivos:(meta.adicionais??[]).filter(x=>x.automatico).map(x=>x.id)};
 });
 const alvo=s.atores.find(x=>x.id===b.id);assert.equal(alvo.pv,b.pv-6,'2 de dano garantido no erro e 4 no segundo acerto');assert.ok(alvo.efeitosAtivos.some(e=>e.nome==='Lentidão de teste'));
});
test('#65 vantagem e desvantagem são calculadas por instância composta como no ataque simples',async()=>{
 for(const [condicao,prefixo] of [['caido','2d20kh1'],['amedrontado','2d20kl1']]){
  let {s,a,b}=await duelo('zurich');const afetado=condicao==='amedrontado'?a:b;afetado.efeitosAtivos=[{id:'estado-'+condicao,nome:condicao,condicao}];const o=opRev(a,'cimitarra'),modo=o.composicao.modos[0];let comando;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:o.id,composicao:[{modoId:modo.id,alvoId:b.id}]},player,async(formula,meta)=>{if(meta.tipo==='ataque'){comando=formula;return {total:20,natural:16,formula};}return {total:1,formula};});
  assert.ok(comando.startsWith(prefixo),condicao+' na sequência');
 }
});
test('#34 Loteria tem Golpe Desarmado com a Ação e o soco bônus exige ataque antes',async()=>{
  let {s,a,b}=await duelo('loteria');
  const bonus=opcoesDisponiveis(a).find(o=>/^Soco \+/.test(o.nome)),acao=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao'));
  assert.ok(acao,'existe o soco com a Ação');
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:bonus.id,alvo:b.id},player,roladorSala().rolar),/depois de realizar um ataque/);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:acao.id,alvo:b.id},player,roladorSala().rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:bonus.id,alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[0].acao,0);assert.equal(s.atores[0].bonus,0);
});

test('#16 #23 #33 durações: Zombaria vale no ataque do alvo, Caído dura até levantar, Ameaçador até o próximo turno',async()=>{
  // Zombaria: Hannah → soldado; no turno do soldado o ataque sai com Desvantagem e o efeito é consumido
  let {s,a,b}=await duelo('hannah-montana');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'zombaria').id,alvo:b.id},player,roladorSala({salva:2}).rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.ok(s.atores[1].efeitosAtivos.some(e=>e.nome==='Zombado'),'Zombado ainda vale no turno do soldado');
  const r=roladorSala({d20:15});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:b.id,opcao:opcoesDisponiveis(s.atores[1]).find(o=>o.automacao?.tipo==='ataque').id,alvo:a.id},gm,r.rolar);
  assert.match(r.formulas.find(x=>x.meta.tipo==='ataque').f,/^2d20kl1/);assert.ok(!s.atores[1].efeitosAtivos.some(e=>e.nome==='Zombado'),'consumido no ataque');
  // Caído: continua no turno do alvo; levantar custa metade do deslocamento
  ({s,a,b}=await duelo('draven-thorne'));
  b.efeitosAtivos=[{id:'x',nome:'Caído',tipo:'condicao',condicao:'caido',origemAtorId:a.id,duracao:{restante:1,expira:'fim_origem'}}];
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.ok(s.atores[1].efeitosAtivos.some(e=>e.condicao==='caido'),'Caído continua no turno do alvo');
  const metros=s.atores[1].metros;
  s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:b.id,x:1,y:0},gm,()=>0); // fica no alcance do Draven (sem oportunidade)
  assert.ok(!s.atores[1].efeitosAtivos.some(e=>e.condicao==='caido'));assert.equal(s.atores[1].metros,metros-metros/2-0.5);
  // Ataque Ameaçador dura 2 fins de turno do Draven
  assert.deepEqual((({turnos,expira})=>({turnos,expira}))(opRev(a,'ataque ameacador').aprimoramento.salva.efeitoFalha),{turnos:2,expira:'fim_origem'});
});

test('#14 #15 #17 #27 magias: concentração pelo nome, Enfeitiçar sem concentração, Emaranhar contém, Sussurros e Familiar da Skimi',async()=>{
  const nikki=await fichaRev('nikki'),zurich=await fichaRev('zurich'),skimi=await fichaRev('skimi');
  const op=(f,trecho)=>f.opcoes.find(o=>o.nome.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().includes(trecho));
  assert.equal(op(nikki,'sopro de dragao').concentracao,true,'#15 nome diz concentração');
  assert.equal(op(skimi,'enfeiticar pessoa').concentracao,undefined,'#14 Enfeitiçar Pessoa não é concentração');
  const atorSkimi={ficha:skimi},enfeiticar=derivarOpcaoCirculo(atorSkimi,op(skimi,'enfeiticar pessoa'),2);
  assert.equal(enfeiticar.selecao.max,2,'espaço de 2º do Pacto: +1 alvo');
  const sussurros=op(skimi,'sussurros dissonantes');assert.ok(sussurros.custo.some(c=>c.tipo==='acao'));assert.equal(sussurros.automacao.dano,'3d6');assert.equal(derivarOpcaoCirculo(atorSkimi,sussurros,2).automacao.dano,'4d6');
  const familiar=op(skimi,'encontrar familiar');assert.deepEqual(familiar.custo,[]);assert.equal(familiar.requisitosUso.somenteForaCombate,true);
  const emaranhar=op(zurich,'emaranhar');assert.equal(emaranhar.automacao.efeitoFalha.condicao,'contido');assert.equal(emaranhar.concentracao,true);
  for(const id of idsJogadores)assert.ok((await fichaRev(id)).opcoes.filter(o=>/^Preparar\b/.test(o.nome)).every(o=>o.custo.some(c=>c.tipo==='acao')),'#27 Preparar usa a Ação');
  // validar de novo conserva a definição base e a projeção não escala duas vezes
  const revalidada=validar(structuredClone(skimi)),sussurrosRevalidado=op(revalidada,'sussurros dissonantes');
  assert.equal(sussurrosRevalidado.automacao.dano,'3d6');assert.equal(derivarOpcaoCirculo({ficha:revalidada},sussurrosRevalidado,2).automacao.dano,'4d6');
  // Contido: imóvel, Desvantagem nos ataques e salvas de DES, Vantagem contra
  let {s,a,b}=await duelo('zurich');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'emaranhar').id,alvo:b.id,x:b.x,y:b.y},player,roladorSala({salva:2}).rolar).catch(()=>s);
  b.efeitosAtivos=[{id:'c',nome:'Contido por Emaranhar',tipo:'condicao',condicao:'contido',origemAtorId:a.id}];
  const r=restricoesAtivas(b);assert.equal(r.imovel,true);assert.equal(r.desvantagemAtaques,true);assert.equal(r.vantagemAtaquesContra,true);assert.ok(temCondicao(b,'contido'));
});

test('#6 só um espaço de magia por turno; truques e o turno seguinte continuam liberados',async()=>{
  let {s,a,b}=await duelo('nikki');
  const m1=opcoesDisponiveis(a).find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:m1.id,alvos:[b.id,b.id,b.id]},player,roladorSala().rolar);
  s.atores[0].acao=1;
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:m1.id,circuloUsado:2,alvos:[b.id,b.id,b.id,b.id]},player,roladorSala().rolar),/um espaço de magia neste turno/);
  s.rodada=2;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:m1.id,circuloUsado:2,alvos:[b.id,b.id,b.id,b.id]},player,roladorSala().rolar);
  assert.equal(s.atores[0].espacoNoTurno,'2-'+atual(s).id);
});

test('#8 ataque à distância com inimigo a 1,5 m tem Desvantagem; corpo a corpo e inimigo incapacitado não',async()=>{
  let {s,a,b}=await duelo('zurich');const r=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,r.rolar);
  assert.match(r.formulas.find(x=>x.meta.tipo==='ataque').f,/^2d20kl1/);
  ({s,a,b}=await duelo('zurich',undefined,{distancia:6}));const r2=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,r2.rolar);
  assert.match(r2.formulas.find(x=>x.meta.tipo==='ataque').f,/^1d20/);
  ({s,a,b}=await duelo('zurich'));b.efeitosAtivos=[{id:'x',nome:'Atordoado',tipo:'condicao',condicao:'atordoado'}];const r3=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,r3.rolar);
  assert.doesNotMatch(r3.formulas.find(x=>x.meta.tipo==='ataque').f,/kl1/);
  ({s,a,b}=await duelo('zurich'));const r4=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'cimitarra').id,alvo:b.id},player,r4.rolar);
  assert.match(r4.formulas.find(x=>x.meta.tipo==='ataque').f,/^1d20/);
});

test('#10 jogador declara opção sem automação; #11 monstro a 0 PV é pulado na iniciativa',async()=>{
  let s,a,b,assistida;
  for(const id of idsJogadores){({s,a,b}=await duelo(id));assistida=a.ficha.opcoes.find(o=>!o.automacao&&!o.informativa&&!o.requisitosUso&&o.custo?.length===1&&o.custo[0].tipo==='bonus');if(assistida)break;}
  assert.ok(assistida,'alguma ficha tem opção de ação bônus sem automação');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:assistida.id,assistido:true},player,roladorSala().rolar);
  assert.equal(s.atores[0].bonus,0);assert.match(s.historico.at(-1)??s.historico[0],/declarado/);
  ({s,a,b}=await duelo('draven-thorne'));
  const c=adicionar(s,await fichaRev('soldado'),'Soldado II');c.x=6;c.init=5;s.ordem=[a.id,b.id,c.id];b.pv=0;
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.equal(atual(s).id,c.id,'pulou o soldado a 0 PV');
});

test('#14 #15 #16 #17 Toque Chocante, Fogo das Fadas, Invisibilidade, Orientação e Golpe Certeiro',async()=>{
  // Toque Chocante: o alvo atingido fica sem reação
  let {s,a,b}=await duelo('nikki');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'toque chocante').id,alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[1].reacao,0);assert.ok(s.atores[1].efeitosAtivos.some(e=>/Toque Chocante/.test(e.nome)));
  // Fogo das Fadas: Invisível não dá vantagem nem desvantagem contra
  b=s.atores[1];b.efeitosAtivos=[{id:'i',nome:'Invisível',condicao:'invisivel'},{id:'f',nome:'Iluminado',restricoes:{vantagemAtaquesContra:true,anulaInvisivel:true}}];
  const r=restricoesAtivas(b);assert.ok(!r.vantagemAtaques&&!r.desvantagemAtaquesContra&&r.vantagemAtaquesContra);
  assert.equal(opRev((await duelo('hannah-montana')).a,'fogo das fadas').automacao.efeitoFalha.restricoes.anulaInvisivel,true);
  // Invisibilidade termina ao atacar
  ({s,a,b}=await duelo('skimi',undefined,{distancia:6}));
  a.efeitosAtivos=[{id:'inv',nome:'Invisível',condicao:'invisivel',encerraAoAgir:true}];
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'rajada mistica').id,alvo:b.id},player,roladorSala().rolar).catch(async()=>aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'rajada mistica').id,alvos:[b.id]},player,roladorSala().rolar));
  assert.ok(!s.atores[0].efeitosAtivos.some(e=>e.condicao==='invisivel'));
  assert.equal(opRev((await duelo('skimi')).a,'invisibilidade').automacao.efeito.encerraAoAgir,true);
  // Orientação dura e Golpe Certeiro compõe arma e tipo de dano na Gaveta.
  assert.equal(opRev((await duelo('zurich')).a,'orientacao').automacao.modificador.removeAoUsar,false);
  ({s,a,b}=await duelo('dragoberto',undefined,{distancia:6}));const golpe=opRev(a,'golpe certeiro');
  assert.deepEqual(golpe.composicao.modos.map(x=>x.id),['arco-radiante','arco-perfurante','cimitarra-radiante','cimitarra-cortante']);
  let tipoDano='';const rolarArco=async(formula,meta)=>{if(meta.tipo==='ataque'){assert.equal(formula,'1d20+6');return {total:18,natural:12,formula};}tipoDano=meta.tipoDano;return {total:6,natural:null,formula};};
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:golpe.id,composicao:[{modoId:'arco-radiante',alvoId:b.id}]},player,rolarArco);
  assert.equal(tipoDano,'radiante');assert.equal(s.atores[0].acao,0);
  ({s,a,b}=await duelo('dragoberto'));tipoDano='';const rolarCimitarra=async(formula,meta)=>{if(meta.tipo==='ataque'){assert.equal(formula,'1d20+4');return {total:18,natural:14,formula};}tipoDano=meta.tipoDano;return {total:5,natural:null,formula};};
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'golpe certeiro').id,composicao:[{modoId:'cimitarra-cortante',alvoId:b.id}]},player,rolarCimitarra);
  assert.equal(tipoDano,'cortante');
});

test('#28 Lentidão, Garantido e Ancestralidade Feérica',async()=>{
  // Lentidão: arco longo do Zurich tira 3 m do alvo no turno dele
  let {s,a,b}=await duelo('zurich',undefined,{distancia:6});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,roladorSala().rolar);
  const desl=deslocamentoMaximo(s.atores[1]);assert.ok(s.atores[1].efeitosAtivos.some(e=>e.nome==='Lentidão'));
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.equal(s.atores[1].metros,desl);assert.equal(desl,deslocamentoMaximo({ficha:s.atores[1].ficha,efeitosAtivos:[]})-3);
  // Garantido: Espada Grande do Draven erra e ainda causa o modificador de FOR
  ({s,a,b}=await duelo('draven-thorne'));const pv=b.pv,espada=opRev(a,'espada grande');assert.ok(espada.automacao.danoAoErrar>0);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:espada.id,alvo:b.id},player,roladorSala({d20:2}).rolar);
  assert.equal(s.atores[1].pv,pv-espada.automacao.danoAoErrar);
  // Ancestralidade Feérica: Hannah tem Vantagem contra Enfeitiçar Pessoa
  ({s,a,b}=await duelo('skimi','hannah-montana'));
  assert.deepEqual(b.ficha.vantagemSalvasContra,['enfeiticado']);
  const r=roladorSala({salva:18});
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'enfeiticar pessoa').id,alvos:[b.id]},player,r.rolar).catch(e=>aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'enfeiticar pessoa').id,alvo:b.id},player,r.rolar));
  assert.match(r.formulas.find(x=>x.meta.tipo==='salvaguarda').f,/^2d20kh1/);
});

test('#31 Inspiração de Bardo só em outra criatura; #21 Torrente de Golpes é desarmada e contundente',async()=>{
  let {s,a,b}=await duelo('hannah-montana');
  const insp=opRev(a,'inspiracao de bardo');
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:insp.id,alvo:a.id},player,roladorSala().rolar),/não pode ser você/);
  const tor=opRev((await duelo('loteria')).a,'torrente');
  assert.ok(tor.automacao.ataques.every(r=>r.tags.includes('desarmado')&&r.elemento==='contundente'));
});

test('#27 #34 sobras escondidas, Defletir só C/C/P, Vigor Implacável e Metabolismo na iniciativa',async()=>{
  for(const id of idsJogadores){const {a}=await duelo(id);assert.ok(!opcoesDisponiveis(a).some(o=>/^(Perícia \||Nota de importação$|Concentração e turno$)/.test(o.nome)),id);}
  let {s,a,b}=await duelo('loteria');
  assert.deepEqual(opRev(a,'defletir').automacao.elementos,['contundente','cortante','perfurante']);
  // Vigor Implacável: cai a 1 PV uma vez
  a.pv=3;a.rec['vigor-implacavel']=1;s.vez=1;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:b.id,opcao:opcoesDisponiveis(b).find(o=>o.automacao?.tipo==='ataque').id,alvo:a.id},gm,roladorSala({dano:10}).rolar);
  if(s.reacaoPendente)s=await aplicar(s,{rev:s.rev,tipo:'resolverReacao',ator:a.id},player,roladorSala({dano:10}).rolar).catch(()=>s);
  assert.equal(s.atores[0].pv,1);assert.equal(s.atores[0].rec['vigor-implacavel'],0);
  // Metabolismo: só antes do primeiro turno terminar
  ({s,a,b}=await duelo('loteria'));a.jaAgiuNoCombate=true;
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'metabolismo').id},player,roladorSala().rolar),/Iniciativa/);
});

test('#18 Imobilizar Pessoa e Riso Histérico repetem a salvaguarda no fim do turno do alvo',async()=>{
  let {s,a,b}=await duelo('skimi');
  const imob=opRev(a,'imobilizar pessoa'),riso=opRev(a,'riso histerico');
  assert.equal(imob.automacao.efeitoFalha.salvaRepetida.atributo,'sab');assert.ok(riso.automacao.efeitoFalha.salvaRepetida);
  assert.ok(derivarOpcaoCirculo(a,riso,2).selecao?.max>=2,'Riso no 2º círculo: 2 alvos');
  b.efeitosAtivos=[{id:'x',nome:'Rindo no chão',tipo:'condicao',restricoes:{caido:true},duracao:{restante:10,expira:'inicio_alvo'},salvaRepetida:{atributo:'sab',cd:13}}];
  s.vez=1;s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:b.id},gm,roladorSala({d20:5}).rolar);
  assert.ok(s.atores[1].efeitosAtivos.some(e=>e.id==='x'),'falhou: continua');
  s.vez=1;s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:b.id},gm,roladorSala({d20:15}).rolar);
  assert.ok(!s.atores[1].efeitosAtivos.some(e=>e.id==='x'),'passou: termina');
});

test('#30 Fonte de Magia: pontos viram espaço (Ação Bônus) e espaço vira pontos (sem ação)',async()=>{
  let {s,a}=await duelo('nikki');
  a.rec['espaco-1']=0;const pontos=a.rec.feiticaria;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'fonte-criar-espaco-1'},player,roladorSala().rolar);
  assert.equal(s.atores[0].rec['espaco-1'],1);assert.equal(s.atores[0].rec.feiticaria,pontos-2);assert.equal(s.atores[0].bonus,0);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'fonte-espaco-em-pontos-1'},player,roladorSala().rolar);
  assert.equal(s.atores[0].rec['espaco-1'],0);assert.equal(s.atores[0].rec.feiticaria,pontos-1);
  // converter não conta como conjurar: ainda pode conjurar com espaço no mesmo turno
  assert.equal(s.atores[0].espacoNoTurno,undefined);
});

test('#29 Skimi (Humana) tem Inspiração Heroica como recurso e rerrolagem de d20; a Hannah não',async()=>{
  const skimi=await fichaRev('skimi'),hannah=await fichaRev('hannah-montana');
  assert.ok(skimi.recursos.some(r=>r.id==='inspiracao-heroica'&&r.maximo===1));
  assert.equal(skimi.opcoes.find(o=>o.id==='inspiracao-heroica-rerrolagem').gatilho,'apos_rolagem_d20');
  assert.ok(!hannah.recursos.some(r=>r.id==='inspiracao-heroica'));
  // Mente Desperta: ação bônus com marcadores no conjurador e no alvo
  let {s,a,b}=await duelo('skimi');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'mente-desperta-acao',alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[0].bonus,0);
});

test('#13 nomes do livro de 2024 e Talho Mental dura até o fim do próximo turno do conjurador',async()=>{
  const {a}=await duelo('nikki'),nomes=opcoesDisponiveis(a).map(o=>o.nome);
  for(const n of ['Correr | ação','Analisar | ação','Usar Objeto | ação','Esconder | ação','Imobilizar | ação'])assert.ok(nomes.includes(n),n);
  assert.ok(!nomes.some(n=>/^(Disparada|Estudar|Utilizar|Esconder-se|Agarrar) \|/.test(n)));
  assert.ok(a.ficha.pericias['Lidar com Animais']!==undefined&&a.ficha.pericias['Adestrar Animais']===undefined);
  assert.deepEqual((({turnos,expira})=>({turnos,expira}))(opRev(a,'talho mental').automacao.efeitoFalha),{turnos:2,expira:'fim_origem'});
});

test('#15 Explosão Elemental usa a Gaveta para o tipo de dano; #14 Riso repete a salvaguarda ao sofrer dano com Vantagem',async()=>{
  let {s,a,b}=await duelo('nikki',undefined,{distancia:6});const explosao=opRev(a,'explosao elemental');
  assert.deepEqual(explosao.composicao.modos.map(x=>x.id).sort(),['acido','fogo','frio','psiquico','raio','trovejante','veneno']);
  assert.equal(opcoesDisponiveis(a).filter(o=>/Explosão Elemental/.test(o.nome)).length,1,'as variantes ficam dentro da gaveta');
  let tipoDano='';s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:explosao.id,composicao:[{modoId:'acido',alvoId:b.id}]},player,async(formula,meta)=>{if(meta.tipo==='ataque')return {total:18,natural:13,formula};tipoDano=meta.tipoDano;return {total:5,natural:null,formula};});
  assert.equal(tipoDano,'acido');
  const normalizado=await duelo('nikki');assert.equal(opcoesDisponiveis(normalizado.a).filter(o=>/Explosão Elemental/.test(o.nome)).length,1,'não duplica ao normalizar');
  ({s,a,b}=await duelo('draven-thorne'));
  assert.equal(opRev((await duelo('skimi')).a,'riso histerico').automacao.efeitoFalha.salvaRepetida.aoSofrerDano,true);
  b.efeitosAtivos=[{id:'x',nome:'Rindo no chão',tipo:'condicao',restricoes:{caido:true},salvaRepetida:{atributo:'sab',cd:13,aoSofrerDano:true}}];
  const r=roladorSala({d20:15,salva:15});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'espada grande').id,alvo:b.id},player,r.rolar);
  assert.match(r.formulas.find(x=>x.meta.tipo==='salvaguarda').f,/^2d20kh1/);assert.ok(!s.atores[1].efeitosAtivos.some(e=>e.id==='x'));
});

test('#32 Saraivada de Espinhos, Golpe Constritor e Destruidor de Hordas',async()=>{
  // Saraivada: aparece no ajuste de dano após arma à distância e resolve a salva em área.
  let {s,a,b}=await duelo('zurich',undefined,{distancia:6});const sar=opRev(a,'saraivada');
  assert.equal(sar.gatilho,'apos_acerto');assert.equal(sar.aprimoramento.salvaArea.raioM,1.5);
  const pv=b.pv,bonus=a.bonus,espaco=a.rec['espaco-1'];let etapa=0;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,async(formula,meta)=>{
    etapa++;if(meta.tipo==='ataque')return {total:18,natural:13,formula,resumo:'18'};
    if(meta.tipo==='dano'){
      const extra=meta.adicionais.find(x=>x.id===sar.id);assert.ok(extra);
      assert.deepEqual(extra.previsualizacaoArea,{forma:'circulo',raioM:1.5,centroAtorId:b.id,centroNome:b.nome,alvos:[{id:b.id,nome:b.nome}]});
      return {total:11,natural:null,formula,resumo:'6 + 5',resultados:[{total:6,resumo:'1d8+3 = 6'},{total:5,resumo:'1d10 = 5'}],recursosAtivos:[sar.id],rerrolagensUsadas:[]};
    }
    if(meta.tipo==='salvaguarda')return {total:2,natural:2,formula,resumo:'2'};
    throw Error('rolagem inesperada '+meta.tipo);
  });
  assert.equal(s.atores[1].pv,pv-11);assert.equal(s.atores[0].bonus,bonus-1);assert.equal(s.atores[0].rec['espaco-1'],espaco-1);
  // Golpe Constritor: Contido e 1d6 no início do turno do alvo
  ({s,a,b}=await duelo('dragoberto'));const gc=opRev(a,'golpe constritor');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'cimitarra').id,alvo:b.id},player,roladorSala().rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:gc.id,alvo:b.id},player,roladorSala({salva:2}).rolar);
  assert.ok(temCondicao(s.atores[1],'contido'));const pv2=s.atores[1].pv;
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,roladorSala({dano:4}).rolar);
  assert.equal(s.atores[1].pv,pv2-4);
  // Destruidor de Hordas: usa a cimitarra (+5, 1d6+3) depois de atacar com a cimitarra
  ({s,a,b}=await duelo('dragoberto'));const c=adicionar(s,await fichaRev('soldado'),'Soldado II');c.x=1;c.y=1;s.ordem.push(c.id);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'cimitarra').id,alvo:b.id},player,roladorSala().rolar);
  const r=roladorSala();s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(s.atores[0],'destruidor').id,alvo:c.id},player,r.rolar);
  assert.equal(r.formulas.find(x=>x.meta.tipo==='ataque').f,'1d20'+opRev(a,'cimitarra').automacao.bonus.toLocaleString('en',{signDisplay:'always'}));
});

test('#32 Saraivada combina área, resistências e resultados diferentes por alvo',async()=>{
  let {s,a,b}=await duelo('zurich',undefined,{distancia:6});
  const c=adicionar(s,await fichaRev('soldado'),'Soldado adjacente');c.x=6;c.y=1;
  const d=adicionar(s,await fichaRev('soldado'),'Soldado protegido');d.x=6;d.y=-1;
  b.ficha.resistencias=['perfurante'];
  const sar=opRev(a,'saraivada'),pv=[b.pv,c.pv,d.pv],bonus=a.bonus,espaco=a.rec['espaco-1'];let salva=0;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,async(formula,meta)=>{
    if(meta.tipo==='ataque')return {total:18,natural:13,formula,resumo:'18'};
    if(meta.tipo==='dano'){
      const area=meta.adicionais.find(x=>x.id===sar.id).previsualizacaoArea;
      assert.equal(area.centroAtorId,b.id);assert.equal(area.raioM,1.5);
      assert.deepEqual(new Set(area.alvos.map(x=>x.id)),new Set([b.id,c.id,d.id]));
      return {total:14,natural:null,formula,resumo:'6 + 8',resultados:[{total:6,resumo:'1d8+3 = 6'},{total:8,resumo:'1d10 = 8'}],recursosAtivos:[sar.id],rerrolagensUsadas:[]};
    }
    if(meta.tipo==='salvaguarda'){
      const totais=[5,6,15],total=totais[salva++];return {total,natural:total,formula,resumo:String(total)};
    }
    throw Error('rolagem inesperada '+meta.tipo);
  });
  assert.equal(salva,3,'cada criatura na área precisa da própria salvaguarda');
  assert.equal(s.atores.find(x=>x.id===b.id).pv,pv[0]-7,'resistência a perfurante reduz a arma de 6 para 3 e a Saraivada de 8 para 4');
  assert.equal(s.atores.find(x=>x.id===c.id).pv,pv[1]-8,'falha sem resistência recebe todo o dano em área');
  assert.equal(s.atores.find(x=>x.id===d.id).pv,pv[2]-4,'sucesso recebe metade do dano em área');
  assert.equal(s.atores.find(x=>x.id===a.id).bonus,bonus-1);assert.equal(s.atores.find(x=>x.id===a.id).rec['espaco-1'],espaco-1);
});

test('as sete fichas concluem o ataque básico do turno com a arma atualmente equipada',async()=>{
 for(const id of idsJogadores){
  const {s,a,b}=await duelo(id);
  const ataque=ataquesEquipados(a).find(o=>o.custo?.some(c=>c.tipo==='acao'));
  assert.ok(ataque,id+' precisa oferecer um ataque de arma com a Ação');
  const pv=b.pv,resultado=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,alvo:b.id},player,roladorSala({d20:15,dano:5}).rolar);
  assert.equal(resultado.atores[0].acao,0,id+' deve gastar a Ação');
  assert.ok(resultado.atores[1].pv<pv,id+' deve resolver o dano no alvo');
  assert.match(resultado.historico.join('\n'),new RegExp(a.ficha.nome.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 }
});

test('#21 #34 Mão de Dolo e Mão de Cura na Torrente, Defletir redireciona e Valentão empurra',async()=>{
  let {s,a,b}=await duelo('loteria');
  // A Gaveta compõe exatamente duas instâncias: um soco e uma cura substituta.
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao')).id,alvo:b.id},player,roladorSala().rolar);
  s.atores[0].pv=5;const focoAntes=s.atores[0].rec['pontos-de-foco'],pvAlvo=s.atores[1].pv;
  const torrente=opRev(s.atores[0],'torrente');
  assert.equal(torrente.composicao.quantidadeMaxima,2);assert.equal(torrente.composicao.modos.find(x=>x.id==='mao-de-cura').limitePorUso,1);
  assert.ok(!opcoesDisponiveis(s.atores[0]).some(o=>o.id==='mao-de-cura-torrente'),'a cura antiga não pode aparecer como terceira ação');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:torrente.id,composicao:[{modoId:'soco-normal',alvoId:b.id},{modoId:'mao-de-cura',alvoId:a.id}]},player,roladorSala({dano:4}).rolar);
  assert.equal(s.atores[1].pv,pvAlvo-4,'a cura substitui o segundo soco');assert.equal(s.atores[0].pv,9);assert.equal(s.atores[0].rec['pontos-de-foco'],focoAntes-1);assert.equal(s.atores[0].bonus,0);
  const foco=s.atores[0].rec['pontos-de-foco'],pv=s.atores[1].pv;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'mao-de-dolo-torrente',alvo:b.id},player,roladorSala({dano:5}).rolar);
  assert.equal(s.atores[1].pv,pv-5);assert.equal(s.atores[0].rec['pontos-de-foco'],foco-1);
  ({s,a,b}=await duelo('loteria'));
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'torrente').id,composicao:[{modoId:'mao-de-cura',alvoId:a.id},{modoId:'mao-de-cura',alvoId:a.id}]},player,roladorSala().rolar),/limite de Mão de Cura/);
  // Valentão de Taverna: empurrão opcional depois do golpe desarmado
  ({s,a,b}=await duelo('loteria'));
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao')).id,alvo:b.id},player,roladorSala().rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'valentao-empurrar',alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[1].x,3);
  // Defletir: dados de redirecionamento lidos da ficha
  assert.deepEqual(opRev(a,'defletir').automacao.redirecionar,{recurso:'pontos-de-foco',cd:11,dano:'2d6+3'});
});

test('#30 Magia Potencializada aparece na rolagem de dano de magia (não na de arma) e cobra 1 ponto',async()=>{
  let {s,a,b}=await duelo('nikki',undefined,{distancia:6});
  const pot=a.ficha.opcoes.find(o=>/^Magia Potencializada/.test(o.nome));assert.equal(pot.gatilho,'apos_rolagem_dano');
  const pontos=a.rec.feiticaria,formulas=[];
  const rolar=async(f,meta={})=>{formulas.push(meta);if(/d20/.test(f))return {total:5,natural:3,formula:f};return {total:8,natural:null,formula:f,rerrolagensUsadas:meta.rerrolagens?.some(x=>x.id===pot.id)?[pot.id]:[]};};
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'despedacar').id,ponto:{x:b.x,y:b.y}},player,rolar);
  assert.ok(formulas.find(m=>m.tipo==='dano').rerrolagens.some(x=>x.id===pot.id));assert.equal(s.atores[0].rec.feiticaria,pontos-1);
  ({s,a,b}=await duelo('nikki'));const r=roladorSala();const meta=[];
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'adaga').id,alvo:b.id},player,async(f,m)=>{meta.push(m);return r.rolar(f,m);});
  assert.ok(!(meta.find(m=>m.tipo==='dano')?.rerrolagens??[]).some(x=>x.id===pot.id),'não vale para arma');
});

test('#12 reforço entra no meio do combate, PJ caído pode começar, descanso individual e mestre reordena empates',async()=>{
  let {s,a,b}=await duelo('draven-thorne');
  s=await aplicar(s,{rev:s.rev,tipo:'adicionar',ficha:await fichaRev('soldado'),nome:'Reforço'},gm,roladorSala({d20:15}).rolar);
  const reforco=s.atores.find(x=>x.nome==='Reforço');assert.ok(s.ordem.includes(reforco.id));assert.equal(atual(s).id,a.id,'a vez não muda');
  s=await aplicar(s,{rev:s.rev,tipo:'ordenarIniciativa',ordem:[...s.ordem].reverse()},gm,()=>0);
  assert.equal(atual(s).id,a.id);assert.equal(s.ordem.at(-1),a.id===s.ordem.at(-1)?a.id:s.ordem.at(-1));
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'ordenarIniciativa',ordem:[a.id]},gm,()=>0),/todos os participantes/);
  // PJ a 0 PV pode estar no início do combate
  let t=novo();const pj=adicionar(t,await fichaRev('nikki')),npc=adicionar(t,await fichaRev('soldado'));pj.pv=0;pj.estadoVida='inconsciente';
  t=await aplicar(t,{rev:t.rev,tipo:'iniciar'},gm,()=>0);assert.equal(t.fase,'iniciativa');
  // Descanso só para quem o mestre escolher
  let d=novo();const x=adicionar(d,await fichaRev('nikki')),y=adicionar(d,await fichaRev('skimi'));x.rec['espaco-1']=0;y.rec['espaco-2']=0;
  d=await aplicar(d,{rev:d.rev,tipo:'descanso',periodo:'longo',atores:[x.id]},gm,()=>0);
  assert.ok(d.atores[0].rec['espaco-1']>0);assert.equal(d.atores[1].rec['espaco-2'],0);
});

test('#5 concentração: magia pelo nome concentra e o dano pede CON com CD entre 10 e 30',async()=>{
  let {s,a,b}=await duelo('nikki',undefined,{distancia:6});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'acalmar emocoes').id,ponto:{x:b.x,y:b.y}},player,roladorSala({salva:2}).rolar);
  assert.ok(s.atores[0].concentracaoAtiva,'Acalmar Emoções concentra');
  for(const [dano,cd] of [[9,10],[40,20],[90,30]]){
    const t=structuredClone(s);t.vez=1;t.atores[1].x=1.5;t.atores[0].pv=200;t.atores[0].ficha.pvMaximos=200;const r=roladorSala({d20:15,dano});
    let u=await aplicar(t,{rev:t.rev,tipo:'usar',ator:b.id,opcao:opcoesDisponiveis(t.atores[1]).find(o=>o.automacao?.tipo==='ataque').id,alvo:a.id},gm,r.rolar);
    if(u.reacaoPendente)u=await aplicar(u,{rev:u.rev,tipo:'resolverReacao',ator:a.id},player,r.rolar).catch(()=>u);
    const salva=r.formulas.find(x=>x.meta.tipo==='salvaguarda'&&x.meta.atributo==='con');assert.ok(salva,'pediu CON com dano '+dano);assert.equal(salva.meta.cd,cd);
  }
});

test('#65 Assassino de Colossos: alvo ferido, uma vez por turno no ataque simples e no composto',async()=>{
 let {s,a,b}=await duelo('zurich');const colosso=opRev(a,'assassino de colossos');assert.ok(colosso,'Zurich mantém Assassino de Colossos ativo');
 const ofertas=[];const rolar=escolher=>async(formula,meta)=>{
  if(meta.tipo==='ataque')return {total:22,natural:17,formula};
  const extra=(meta.adicionais??[]).find(x=>x.id===colosso.id);ofertas.push(Boolean(extra));if(extra)assert.equal(extra.automatico,true,'o 1d8 é obrigatório quando o gatilho ocorre');
  return {total:9,formula,resultados:[{total:5},...(extra&&escolher?[{total:4}]:[])],recursosAtivos:(meta.adicionais??[]).filter(x=>x.automatico).map(x=>x.id)};
 };
 // PV completos: sem oferta.
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,rolar(true));
 assert.deepEqual(ofertas,[false],'alvo com PV completos não recebe o 1d8');
 // Composto: o primeiro acerto fere o alvo; o segundo já recebe a oferta.
 ({s,a,b}=await duelo('zurich'));ofertas.length=0;const cimitarra=opRev(a,'cimitarra'),modos=cimitarra.composicao.modos;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,composicao:[{modoId:modos[0].id,alvoId:b.id},{modoId:modos[1].id,alvoId:b.id}]},player,rolar(true));
 assert.deepEqual(ofertas,[false,true],'a segunda instância composta encontra o alvo já ferido');
 assert.equal(s.atores[1].pv,b.pv-14,'5 + (5 + 4 do Assassino de Colossos)');
 assert.ok(usadoNesteTurno(s,s.atores[0],colosso.id));
 // Simples no mesmo turno: limite já consumido.
 ofertas.length=0;s.atores[0].acao=1;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(s.atores[0],'arco longo').id,alvo:b.id},player,rolar(true));
 assert.deepEqual(ofertas,[false],'uma vez por turno');
});
test('#65 Assassino de Colossos volta a valer no ataque de oportunidade do turno inimigo',async()=>{
 let {s,a,b}=await duelo('zurich');const colosso=opRev(a,'assassino de colossos');b.pv-=3;
 const escolher=async(formula,meta)=>{
  if(meta.tipo==='ataque')return {total:22,natural:17,formula};
  if(meta.tipo==='salvaguarda')return {total:20,natural:16,formula};
  const extra=(meta.adicionais??[]).find(x=>x.id===colosso.id);
  return {total:extra?9:5,formula,resultados:[{total:5},...(extra?[{total:4}]:[])],recursosAtivos:(meta.adicionais??[]).filter(x=>x.automatico).map(x=>x.id)};
 };
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'cimitarra').id,composicao:[{modoId:opRev(a,'cimitarra').composicao.modos[0].id,alvoId:b.id}]},player,escolher);
 assert.ok(usadoNesteTurno(s,s.atores[0],colosso.id));s=reabrirMesa(s);assert.ok(usadoNesteTurno(s,s.atores[0],colosso.id),'o limite sobrevive à reabertura da mesa');const pv=s.atores[1].pv;
 s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,roladorSala().rolar);
 assert.equal(atual(s).id,b.id);assert.equal(usadoNesteTurno(s,s.atores[0],colosso.id),false,'o turno do inimigo é outro turno');
 s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:b.id,x:6,y:0},gm,roladorSala().rolar);
 assert.equal(s.reacaoPendente?.reator,a.id);const oportunidade=s.atores[0].ficha.opcoes.find(o=>o.gatilho==='sair_alcance');
 let ofertado=false;
 s=await aplicar(s,{rev:s.rev,tipo:'resolverReacao',ator:a.id,opcao:oportunidade.id,modo:'normal',ajuste:0,dadosAjuste:[]},player,async(f,m)=>{if(m.tipo==='dano')ofertado=(m.adicionais??[]).some(x=>x.id===colosso.id);return escolher(f,m);});
 assert.ok(ofertado,'a reação oferece o Assassino de Colossos');
 assert.equal(s.atores[1].pv,pv-9);assert.ok(usadoNesteTurno(s,s.atores[0],colosso.id));
 s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:b.id},gm,roladorSala().rolar);
 assert.equal(atual(s).id,a.id);assert.equal(usadoNesteTurno(s,s.atores[0],colosso.id),false,'o uso na reação não consome o próximo turno do Zurich');
});
test('#65 crítico no ataque de oportunidade dobra todos os dados',async()=>{
 let {s,a,b}=await duelo('draven-thorne');
 s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,roladorSala().rolar);
 s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:b.id,x:6,y:0},gm,roladorSala().rolar);
 const oportunidade=s.atores[0].ficha.opcoes.find(o=>o.gatilho==='sair_alcance'),formulas=[];
 s=await aplicar(s,{rev:s.rev,tipo:'resolverReacao',ator:a.id,opcao:oportunidade.id,modo:'normal',ajuste:0,dadosAjuste:[]},player,async(f,m)=>{formulas.push([m.tipo,f]);if(m.tipo==='ataque')return {total:25,natural:20,formula:f};return {total:10,formula:f,resultados:[{total:10}],recursosAtivos:[]};});
 assert.ok(formulas.some(([t,f])=>t==='dano'&&/^4d6/.test(f)),'Espada Grande 2d6 vira 4d6 no crítico: '+JSON.stringify(formulas));
});

test('#65 limites por turno reiniciam em um novo combate com os mesmos participantes',async()=>{
 let {s,a,b}=await duelo('zurich');
 const colosso=opRev(a,'assassino de colossos');
 a.usosPorTurno={marca:'r1:'+a.id,ids:{[colosso.id]:true}};
 assert.equal(usadoNesteTurno(s,a,colosso.id),true);
 s=await aplicar(s,{rev:s.rev,tipo:'encerrar'},gm,dadoLocal);
 s=await aplicar(s,{rev:s.rev,tipo:'iniciar'},gm,dadoLocal);
 s=await aplicar(s,{rev:s.rev,tipo:'iniciativas',atores:[a.id,b.id]},gm,roladorSala({d20:15}).rolar);
 assert.equal(atual(s).id,a.id);
 assert.equal(usadoNesteTurno(s,s.atores[0],colosso.id),false);
});

test('#65 encontros anteriores à 0.8.26 preservam o aprimoramento já gasto no turno atual',async()=>{
 const {s,a}=await duelo('zurich');
 const colosso=opRev(a,'assassino de colossos');
 a.usosTurno[colosso.id]=true;
 delete a.usosPorTurno;
 const reaberto=reabrirMesa(s);
 assert.equal(usadoNesteTurno(reaberto,reaberto.atores[0],colosso.id),true);
 reaberto.vez=1;
 assert.equal(usadoNesteTurno(reaberto,reaberto.atores[0],colosso.id),false);
});

const reabrirMesa=s=>{const r=JSON.parse(JSON.stringify(compactarEstado(s)));for(const ator of r.atores)ator.ficha=validar(ator.ficha);return r;};
const dragobertoCercado=async()=>{
 const {s,a,b}=await duelo('dragoberto');const extra=async(nome,x,y)=>{const p=adicionar(s,await fichaRev('soldado'),nome);p.x=x;p.y=y;s.ordem.push(p.id);for(const k of ['acao','bonus','reacao'])p[k]=1;return p;};
 const c=await extra('Soldado II',1,1),longe=await extra('Soldado III',-1,0),foraAlcance=await extra('Soldado IV',3,0);
 return {s,a,b,c,longe,foraAlcance};
};
test('#65 Destruidor de Hordas avulso: mesma arma, alvo novo a 1,5 m, alcance e uma vez por turno',async()=>{
 let {s,a,b,c,longe,foraAlcance}=await dragobertoCercado();const cimitarra=opRev(a,'cimitarra'),hb=()=>opRev(s.atores[0],'destruidor');
 assert.equal(cimitarra.composicao?.opcional,true,'a arma ganha a etapa opcional na Gaveta');
 assert.equal(ofertaDestruidorDeHordas(s,a),null,'sem ataque anterior não há oferta');
 // O ataque inicial pode errar.
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,alvo:b.id},player,roladorSala({d20:1}).rolar);
 assert.equal(s.atores[0].eventosTurno.ataques.length,1);assert.equal(s.atores[0].eventosTurno.acertos.length,0);
 const oferta=ofertaDestruidorDeHordas(s,s.atores[0]);
 assert.equal(oferta.centroAtorId,b.id);assert.equal(oferta.raioM,1.5);assert.deepEqual(oferta.alvos.map(x=>x.id),[c.id],'só o soldado ao lado do alvo e ao alcance da cimitarra');
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:hb().id,alvo:b.id},player,roladorSala().rolar),/diferente do alvo anterior/);
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:hb().id,alvo:longe.id},player,roladorSala().rolar),/longe demais/);
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:hb().id,alvo:foraAlcance.id},player,roladorSala().rolar),/alcance/);
 const r=roladorSala();s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:hb().id,alvo:c.id},player,r.rolar);
 assert.equal(r.formulas.find(x=>x.meta.tipo==='ataque').f,'1d20'+cimitarra.automacao.bonus.toLocaleString('en',{signDisplay:'always'}),'usa a mesma arma');
 assert.equal(s.atores[0].acao,0);assert.equal(s.atores[0].bonus,1,'sem custo adicional de ação');
 assert.equal(ofertaDestruidorDeHordas(s,s.atores[0]),null,'limite consumido');
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:hb().id,alvo:c.id},player,roladorSala().rolar),/já foi usada neste turno|diferente/);
});
test('#65 Destruidor de Hordas não ataca criatura já atacada no turno',async()=>{
 let {s,a,b,c}=await dragobertoCercado();const cimitarra=opRev(a,'cimitarra');s.atores[0].acao=2;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,alvo:c.id},player,roladorSala().rolar);
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,alvo:b.id},player,roladorSala().rolar);
 assert.deepEqual(ofertaDestruidorDeHordas(s,s.atores[0]).alvos,[]);
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(s.atores[0],'destruidor').id,alvo:c.id},player,roladorSala().rolar),/ainda não atacou/);
});
test('#65 Destruidor de Hordas pela Gaveta compartilha o limite com o botão avulso',async()=>{
 let {s,a,b,c,longe}=await dragobertoCercado();const cimitarra=opRev(a,'cimitarra'),modos=cimitarra.composicao.modos,hbModo=modos.find(m=>m.destruidorDeHordas);
 assert.ok(hbModo);assert.equal(hbModo.umaVezPorTurno,opRev(a,'destruidor').requisitosUso.umaVezPorTurno);
 for(const [composicao,erro] of [
  [[{modoId:hbModo.id,alvoId:c.id}],/ataque com a arma|anterior/],
  [[{modoId:modos[0].id,alvoId:b.id},{modoId:hbModo.id,alvoId:b.id}],/diferente do alvo anterior/],
  [[{modoId:modos[0].id,alvoId:b.id},{modoId:hbModo.id,alvoId:longe.id}],/até 1.5 m/]
 ]){await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,composicao},player,roladorSala().rolar),erro);assert.equal(s.atores[0].acao,1,'plano inválido não gasta a ação');}
 const pvB=b.pv,pvC=c.pv;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,composicao:[{modoId:modos[0].id,alvoId:b.id},{modoId:hbModo.id,alvoId:c.id}]},player,roladorSala({dano:5}).rolar);
 assert.equal(s.atores[0].acao,0);assert.equal(s.atores[0].bonus,1);assert.equal(s.atores[0].eventosTurno.ataques.length,2);
 assert.ok(s.atores.find(x=>x.id===b.id).pv<pvB&&s.atores.find(x=>x.id===c.id).pv<pvC,'cada instância atinge o próprio alvo');
 assert.equal(s.atores[0].usosTurno[hbModo.umaVezPorTurno],true);
 s.atores[0].acao=1;s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,alvo:b.id},player,roladorSala().rolar);
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(s.atores[0],'destruidor').id,alvo:longe.id},player,roladorSala().rolar),/já foi usada neste turno/);
 // Ao reabrir a mesa, a composição volta a ser derivada e o limite do turno persiste.
 s=reabrirMesa(s);const reaberto=s.atores[0];
 assert.ok(opRev(reaberto,'cimitarra').composicao.modos.some(m=>m.destruidorDeHordas),'a etapa reaparece ao reabrir');
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(reaberto,'destruidor').id,alvo:longe.id},player,roladorSala().rolar),/já foi usada neste turno/);
});
test('#65 Zurich com Destruidor de Hordas ativo compõe Ágil e o ataque extra na mesma Ação',async()=>{
 let {s,a,b}=await duelo('zurich');const hb=a.ficha.opcoes.find(o=>/destruidor de hordas/i.test(o.nome));hb.ativa=true;a.ficha.opcoes.find(o=>/assassino de colossos/i.test(o.nome)).ativa=false;
 const c=adicionar(s,await fichaRev('soldado'),'Soldado II');c.x=1;c.y=1;s.ordem.push(c.id);
 const cimitarra=opRev(a,'cimitarra'),modos=cimitarra.composicao.modos;assert.equal(cimitarra.composicao.quantidadeMaxima,3);assert.equal(cimitarra.composicao.opcional,undefined);
 const agil=modos.find(m=>m.umaVezPorTurno==='maestria-agil'),hbModo=modos.find(m=>m.destruidorDeHordas),r=roladorSala();
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:cimitarra.id,composicao:[{modoId:modos[0].id,alvoId:b.id},{modoId:agil.id,alvoId:b.id},{modoId:hbModo.id,alvoId:c.id}]},player,r.rolar);
 const ataques=r.formulas.filter(x=>x.meta.tipo==='ataque');assert.equal(ataques.length,3);
 assert.equal(ataques[2].f,ataques[1].f,'o Destruidor usa a arma da instância anterior (Espada Curta)');
 assert.equal(s.atores[0].acao,0);assert.equal(s.atores[0].bonus,1);
});

test('#57 Ataque de Desarme guarda a arma no inventário e sorteia 60/40 entre duas armas diferentes',async()=>{
 const rolar=(sorteio=null)=>async(formula,meta)=>{
  if(meta.tipo==='ataque')return {total:22,natural:17,formula};
  if(meta.tipo==='salvaguarda')return {total:3,natural:2,formula};
  if(meta.tipo==='sorteio'){assert.equal(formula,'1d10');return {total:sorteio,formula};}
  const desarme=meta.adicionais.find(x=>/desarme/i.test(x.nome));
  return {total:10,formula,resultados:[{total:6},{total:4}],recursosAtivos:[desarme.id]};
 };
 let {s,a,b}=await duelo('draven-thorne');const espada=opRev(a,'espada grande');
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:espada.id,alvo:b.id},player,rolar());
 let alvo=s.atores[1],lanca=alvo.ficha.inventario.itens.find(i=>/lan[cç]a/i.test(i.nome));
 assert.equal(lanca.equipado,false);assert.equal(lanca.equipadoSlot,undefined);assert.ok(alvo.ficha.inventario.itens.includes(lanca),'a arma continua no inventário');
 assert.equal(s.atores[0].rec['dados-de-superioridade'],3);
 assert.ok(!opcoesDisponiveis(alvo).some(o=>/lan[cç]a/i.test(o.nome)&&o.automacao?.tipo==='ataque'&&!o.automacao.arremesso&&o.origemItem===lanca.id),'sem a arma empunhada o ataque some');
 // Duas armas diferentes: 1–6 cai a principal, 7–10 a da mão fraca.
 for(const [sorteio,cai] of [[6,'mao_forte'],[7,'mao_fraca']]){
  ({s,a,b}=await duelo('draven-thorne'));const itens=b.ficha.inventario.itens,escudo=itens.find(i=>/escudo/i.test(i.nome)),curta=itens.find(i=>/espada curta/i.test(i.nome));
  escudo.equipado=false;delete escudo.equipadoSlot;curta.equipado=true;curta.equipadoSlot='mao_fraca';
  const porSlot={mao_forte:itens.find(i=>i.equipadoSlot==='mao_forte').id,mao_fraca:curta.id};
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'espada grande').id,alvo:b.id},player,rolar(sorteio));
  const depois=s.atores[1].ficha.inventario.itens;
  assert.equal(depois.find(i=>i.id===porSlot[cai]).equipado,false,'sorteio '+sorteio+' derruba '+cai);
  assert.equal(depois.find(i=>i.id===porSlot[cai==='mao_forte'?'mao_fraca':'mao_forte']).equipado,true);
 }
});
test('#57 manobra na composição: uma por instância, custo cobrado só no acerto e sem gasto quando erra',async()=>{
 let {s,a,b}=await duelo('draven-thorne');const base=opRev(a,'espada grande').automacao;
 const op={id:'ataque-composto-draven',nome:'Ataque composto',categoria:'acao',custo:[{tipo:'acao',quantidade:1}],automacao:structuredClone(base),composicao:{tipo:'sequencia',quantidadeMinima:2,quantidadeMaxima:2,modoPadrao:'um',modos:[{id:'um',nome:'Primeiro',tipo:'ataque',ordem:1,automacao:structuredClone(base)},{id:'dois',nome:'Segundo',tipo:'ataque',ordem:2,automacao:structuredClone(base)}]}};
 a.ficha.opcoes.push(op);let d20=0;const comando={rev:s.rev,tipo:'usar',ator:a.id,opcao:op.id,composicao:[{modoId:'um',alvoId:b.id},{modoId:'dois',alvoId:b.id}]};
 const rolar=quantidade=>async(formula,meta)=>{
  if(meta.tipo==='ataque')return [{total:22,natural:17},{total:3,natural:2}][d20++%2];
  if(meta.tipo==='salvaguarda')return {total:20,natural:18};
  const manobras=meta.adicionais.filter(x=>x.grupoExclusivo==='manobra-mestre-da-batalha');assert.equal(manobras.length,3);
  return {total:8,resultados:[{total:4},...manobras.slice(0,quantidade).map(()=>({total:4}))],recursosAtivos:manobras.slice(0,quantidade).map(x=>x.id)};
 };
 await assert.rejects(aplicar(s,comando,player,rolar(2)),/uma manobra por ataque/);
 assert.equal(a.rec['dados-de-superioridade'],4);d20=0;
 s=await aplicar(s,comando,player,rolar(1));
 assert.equal(s.atores[0].rec['dados-de-superioridade'],3,'o segundo ataque errou e não abriu manobra');
});

test('#59 Loteria prepara Mão de Dolo na Gaveta da Torrente e no golpe da Ação, com limite e Foco compartilhados',async()=>{
 let {s,a,b}=await duelo('loteria');const golpe=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao'));
 const dolo=a.ficha.opcoes.find(o=>o.nome==='Mão de Dolo');let pedidos=[];
 const rolar=({acerta=[true,true],aceitar=true}={})=>{let n=0;return async(formula,meta)=>{
  if(meta.tipo==='ataque')return acerta[n++]?{total:22,natural:17,formula}:{total:3,natural:2,formula};
  pedidos.push(meta.adicionais?.find(x=>x.id===dolo.id)??null);
  const usar=(meta.adicionais??[]).filter(x=>x.automatico||(aceitar&&x.preSelecionado));
  return {total:4+usar.length*5,formula,resultados:[{total:4},...usar.map(()=>({total:5}))],recursosAtivos:usar.map(x=>x.id)};
 };};
 // Fora da Torrente: o golpe da Ação oferece Mão de Dolo no ajuste de dano.
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:golpe.id,alvo:b.id},player,rolar({aceitar:false}));
 assert.ok(pedidos[0],'Mão de Dolo aparece depois do acerto');assert.equal(pedidos[0].preSelecionado,undefined,'sem preparo não vem marcada');
 // Torrente com preparo: o primeiro golpe erra (sem gasto), o segundo é o preparado e acerta.
 pedidos=[];const torrente=opRev(s.atores[0],'torrente'),modo=torrente.composicao.modos.find(m=>m.id==='soco-mao-de-dolo');
 assert.ok(modo);assert.deepEqual(modo.preparar,[dolo.id]);const foco=s.atores[0].rec['pontos-de-foco'],pv=s.atores[1].pv;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:torrente.id,composicao:[{modoId:'soco-normal',alvoId:b.id},{modoId:'soco-mao-de-dolo',alvoId:b.id}]},player,rolar({acerta:[false,true]}));
 assert.equal(pedidos.length,1);assert.equal(pedidos[0].preSelecionado,true);
 assert.equal(s.atores[0].rec['pontos-de-foco'],foco-2,'1 Foco da Torrente + 1 da Mão de Dolo aplicada');assert.equal(s.atores[1].pv,pv-9);
 assert.ok(usadoNesteTurno(s,s.atores[0],dolo.id));
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'mao-de-dolo-torrente',alvo:b.id},player,roladorSala().rolar),/já foi usada neste turno/,'o botão avulso compartilha o limite');
 // Preparada mas o golpe erra: nada é cobrado.
 ({s,a,b}=await duelo('loteria'));s.atores[0].bonus=1;const focoErro=s.atores[0].rec['pontos-de-foco'];
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:golpe.id,alvo:b.id},player,rolar({acerta:[false]}));
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(s.atores[0],'torrente').id,composicao:[{modoId:'soco-mao-de-dolo',alvoId:b.id},{modoId:'soco-normal',alvoId:b.id}]},player,rolar({acerta:[false,false]}));
 assert.equal(s.atores[0].rec['pontos-de-foco'],focoErro-1,'só o custo da Torrente');assert.equal(usadoNesteTurno(s,s.atores[0],dolo.id),false);
});

test('#60 Magia Potencializada rerrola até 3 dados escolhidos por 1 ponto e usa os novos resultados',async()=>{
 const {aplicarRerrolagemParcial,dadosRerrolaveis}=await import('./site/engine.mjs');
 let {s,a,b}=await duelo('nikki',undefined,{distancia:6});const pot=a.ficha.opcoes.find(o=>/^Magia Potencializada/.test(o.nome));
 assert.deepEqual({modo:pot.rerrolagem.modo,limite:pot.rerrolagem.limiteDados},{modo:'dados',limite:3});
 // Despedaçar 3d8: os três dados baixos são rerrolados, o resto da fórmula é preservado.
 const rolagem={total:3+2+1+0,formula:'3d8',resumo:'3d8 = 6',grupos:[{diceType:'d8',dice:[{value:3,kept:true},{value:2,kept:true},{value:1,kept:true}],total:6}]};
 assert.equal(dadosRerrolaveis(rolagem).length,3);
 assert.throws(()=>aplicarRerrolagemParcial(rolagem,[0,1,2,0].map((indice,i)=>({grupo:0,indice:i%3,valor:8})),3),/1 a 3 dados|inválido/);
 assert.throws(()=>aplicarRerrolagemParcial(rolagem,[{grupo:0,indice:0,valor:9}],3),/inválido/,'d8 não rola 9');
 const nova=aplicarRerrolagemParcial(rolagem,[{grupo:0,indice:1,valor:7},{grupo:0,indice:2,valor:8}],3);
 assert.equal(nova.total,18);assert.deepEqual(nova.grupos[0].dice.map(d=>d.value),[3,7,8]);assert.equal(nova.dadosRerrolados.length,2);
 // d20 e dados descartados não entram; várias instâncias somam a diferença na instância certa.
 const lote={total:15,grupos:[{diceType:'d20',dice:[{value:12,kept:true}]},{diceType:'d6',dice:[{value:1,kept:true},{value:6,kept:false}]},{diceType:'d4',dice:[{value:1,kept:true}]}],mapaGrupos:[0,0,1],resultados:[{total:13},{total:2}]};
 assert.deepEqual(dadosRerrolaveis(lote).map(x=>x.grupo+':'+x.indice),['1:0','2:0']);
 const loteNovo=aplicarRerrolagemParcial(lote,[{grupo:2,indice:0,valor:4}],3);assert.equal(loteNovo.total,18);assert.equal(loteNovo.resultados[1].total,5);assert.equal(loteNovo.resultados[0].total,13);
 // No motor: a rerrolagem aparece só em dano de magia, com o limite de dados, e cobra 1 ponto uma vez.
 const pontos=a.rec.feiticaria;let meta=null;
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'despedacar').id,ponto:{x:b.x,y:b.y}},player,async(f,m={})=>{if(/d20/.test(f))return {total:5,natural:3,formula:f};meta=m;return {...nova,rerrolagensUsadas:[pot.id]};});
 assert.equal(meta.rerrolagens.find(x=>x.id===pot.id).limiteDados,3);assert.equal(s.atores[0].rec.feiticaria,pontos-1);
});

test('#60 Magia Duplicada na Gaveta: +1 círculo efetivo, mesmo espaço, alvo extra e 1 Ponto de Feitiçaria',async()=>{
 let {s,a,b}=await duelo('nikki',undefined,{distancia:6});const c=adicionar(s,await fichaRev('soldado'),'Soldado II');c.x=6;c.y=1;s.ordem.push(c.id);
 const dup=a.ficha.opcoes.find(o=>/^Magia Duplicada/.test(o.nome));assert.equal(dup.metamagiaAoConjurar,'duplicada');
 assert.ok(!ordenarOpcoesRodape(a).some(x=>x.opcao?.id===dup.id||x.id===dup.id),'sai do rodapé');
 // Nenhuma magia atual da Nikki ganha alvo ao subir de círculo: a opção não aparece para elas.
 for(const o of opcoesDisponiveis(a).filter(o=>o.categoria==='magia'))assert.equal(metamagiaDuplicada(a,o),null,o.nome);
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'despedacar').id,ponto:{x:b.x,y:b.y},magiaDuplicada:true},player,roladorSala().rolar),/Magia Duplicada exige/);
 // Magia elegível (Imobilizar Pessoa, +1 alvo por círculo) conjurada no espaço de 2º.
 const imobilizar={id:'teste-imobilizar',nome:'2º | Imobilizar Pessoa · salva de SAB',categoria:'magia',circuloBase:2,concentracao:true,custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'espaco-2',quantidade:1}],automacao:{tipo:'salva',atributo:'sab',cd:13,alcanceM:18,efeitoFalha:{nome:'Paralisado',condicao:'paralisado',turnos:10}}};
 a.ficha.opcoes.push(imobilizar);if(a.ficha.preparacao)a.ficha.preparacao.semprePreparadas.push(imobilizar.id);
 assert.ok(metamagiaDuplicada(a,imobilizar));
 const normal=derivarOpcaoCirculo(a,imobilizar,2),dupla=derivarOpcaoCirculo(a,imobilizar,2,{magiaDuplicada:true});
 assert.equal(normal.selecao?.max??1,1);assert.equal(dupla.selecao.max,2);assert.equal(dupla.circuloUsado,2);assert.equal(dupla.circuloEfetivo,3);
 assert.ok(dupla.custo.some(x=>x.id==='espaco-2')&&!dupla.custo.some(x=>x.id==='espaco-3'),'preserva o espaço escolhido');
 assert.deepEqual(planoCustoOpcao(a,dupla).custos.filter(x=>x.tipo==='recurso').map(x=>x.id).sort(),['espaco-2','feiticaria']);
 const pontos=a.rec.feiticaria,espacos=a.rec['espaco-2'];
 s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:imobilizar.id,circuloUsado:2,magiaDuplicada:true,alvos:[b.id,c.id]},player,roladorSala({salva:1}).rolar);
 assert.equal(s.atores[0].rec.feiticaria,pontos-1);assert.equal(s.atores[0].rec['espaco-2'],espacos-1);
 assert.ok([b.id,c.id].every(id=>temCondicao(s.atores.find(x=>x.id===id),'paralisado')),'os dois alvos são afetados');
 // Sem pontos, a composição é recusada antes de gastar o espaço.
 ({s,a,b}=await duelo('nikki',undefined,{distancia:6}));a.ficha.opcoes.push(structuredClone(imobilizar));if(a.ficha.preparacao)a.ficha.preparacao.semprePreparadas.push(imobilizar.id);a.rec.feiticaria=0;
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:imobilizar.id,circuloUsado:2,magiaDuplicada:true,alvos:[b.id]},player,roladorSala().rolar),/Magia Duplicada exige|Saldo insuficiente/);
 assert.equal(a.rec['espaco-2'],s.atores[0].rec['espaco-2']);
});

test('#56 #62 Presa do Caçador: escolha aberta ao fim do descanso, confirmada pelo dono e preservada ao reabrir',async()=>{
 let s=novo();const drago=adicionar(s,await fichaRev('dragoberto')),zurich=adicionar(s,await fichaRev('zurich'));drago.dono='p';zurich.dono=undefined;
 const nomeAtivo=a=>[...a.ficha.opcoes].filter(o=>o.grupoExclusivo==='presa-do-cacador'&&o.ativa!==false).map(o=>o.nome);
 assert.match(nomeAtivo(drago).join(),/Destruidor/);assert.match(nomeAtivo(zurich).join(),/Assassino/);
 // Fora do descanso, o jogador não troca pelo livro.
 const colossoDrago=drago.ficha.opcoes.find(o=>/assassino de colossos/i.test(o.nome));
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'livro',ator:drago.id,operacao:'ativar',habilidadeId:colossoDrago.id},player,dadoLocal),/fim de um descanso/);
 s=await aplicar(s,{rev:s.rev,tipo:'descanso',periodo:'curto'},gm,dadoLocal);
 const [pd]=s.atores[0].escolhasDescanso,[pz]=s.atores[1].escolhasDescanso;
 assert.equal(pd.nome,'Presa do Caçador');assert.equal(pd.opcoes.length,2);assert.match(s.historico[0],/Escolhas pendentes/);
 // Outro jogador não escolhe; o dono troca para Assassino de Colossos.
 await assert.rejects(aplicar(s,{rev:s.rev,tipo:'escolherAposDescanso',ator:drago.id,escolhaId:pd.id,opcaoId:colossoDrago.id},{id:'outro',role:'PLAYER'},dadoLocal),/não controla/);
 s=await aplicar(s,{rev:s.rev,tipo:'escolherAposDescanso',ator:drago.id,escolhaId:pd.id,opcaoId:colossoDrago.id},player,dadoLocal);
 assert.match(nomeAtivo(s.atores[0]).join(),/Assassino/);assert.equal(s.atores[0].escolhasDescanso,undefined);
 assert.ok(opRev(s.atores[0],'assassino de colossos')&&!opRev(s.atores[0],'destruidor'),'só a opção escolhida fica disponível');
 // Zurich sem dono: o mestre confirma e pode manter a atual.
 s=await aplicar(s,{rev:s.rev,tipo:'escolherAposDescanso',ator:zurich.id,escolhaId:pz.id,opcaoId:null,confirmado:true},gm,dadoLocal);
 assert.match(nomeAtivo(s.atores[1]).join(),/Assassino/);assert.match(s.historico[0],/mantida/);
 // A escolha persiste ao compactar e reabrir; uma pendência não resolvida some ao iniciar combate mantendo a atual.
 const reaberta=JSON.parse(JSON.stringify(compactarEstado(s)));for(const a of reaberta.atores)a.ficha=validar(a.ficha);
 assert.match(nomeAtivo(reaberta.atores[0]).join(),/Assassino/);
 s=await aplicar(reaberta,{rev:reaberta.rev,tipo:'descanso',periodo:'longo'},gm,dadoLocal);assert.ok(s.atores[0].escolhasDescanso.length);
 const reaberta2=JSON.parse(JSON.stringify(compactarEstado(s)));for(const a of reaberta2.atores)a.ficha=validar(a.ficha);assert.ok(reaberta2.atores[0].escolhasDescanso.length,'a pendência sobrevive à reabertura');
});

// ===== M05 — zonas persistentes (issue #44) e trajetória com zonas (M08, issue #47) =====
import {trechoNaZona,primeiroContato,terrenoDificilDasZonas,entradasNaTrajetoria,pontoNaZona} from './site/zonas.mjs';
import {normalizarZonas,encerrarConcentracao as encerrarConcM05} from './site/engine.mjs';
const zonaQuadrada=(x,y,lado=6,extra={})=>({id:'z-'+x+'-'+y,nome:'Teste',centro:{x,y},geometria:{forma:'quadrado',tamanhoM:lado},terrenoDificil:true,afetaConjurador:false,origemAtorId:'dono',...extra});
async function cenaEmaranhar({distancia=9}={}){
  let s=novo();const z=adicionar(s,await fichaRev('zurich')),alvo=adicionar(s,await fichaRev('soldado'),'Soldado I'),fora=adicionar(s,await fichaRev('soldado'),'Soldado II');
  z.dono='p';z.x=0;z.y=0;alvo.x=distancia;alvo.y=0;fora.x=distancia;fora.y=8;
  s.fase='turnos';s.rodada=1;s.vez=0;s.ordem=[z.id,alvo.id,fora.id];
  for(const x of s.atores){x.init=10;x.acao=1;x.bonus=1;x.reacao=1;x.metros=9;}
  const emaranhar=opRev(z,'emaranhar');
  return {s,z,alvo,fora,emaranhar};
}
const conjurar=async(m,{salva=2,ponto}={})=>aplicar(m.s,{rev:m.s.rev,tipo:'usar',ator:m.z.id,opcao:m.emaranhar.id,ponto:ponto??{x:m.alvo.x,y:m.alvo.y}},player,roladorSala({salva}).rolar);

test('M05 geometria: trecho contínuo, travessia completa, primeiro contato e zonas sobrepostas',()=>{
  const q=zonaQuadrada(5,0,4);
  assert.deepEqual(trechoNaZona(q,{x:0,y:0},{x:10,y:0}).map(t=>+t.toFixed(3)),[0.3,0.7],'começa e termina fora, mas atravessa');
  assert.equal(trechoNaZona(q,{x:0,y:5},{x:10,y:5}),null,'passa ao lado');
  const circ={id:'c',centro:{x:5,y:0},geometria:{forma:'circulo',raioM:1},afetaConjurador:true};
  assert.deepEqual(trechoNaZona(circ,{x:0,y:0},{x:10,y:0}).map(t=>+t.toFixed(3)),[0.4,0.6],'círculo de 1 m de raio');
  const contato=primeiroContato([circ,q],{x:0,y:0},{x:10,y:0},{id:'outro'});assert.equal(contato.zona.id,q.id);assert.equal(+contato.ponto.x.toFixed(3),3);
  assert.equal(primeiroContato([q],{x:0,y:0},{x:10,y:0},{id:'dono'}),null,'a zona não é hostil para quem conjurou');
  assert.equal(+terrenoDificilDasZonas([q,zonaQuadrada(6,0,4,{id:'z2'})],{x:0,y:0},{x:10,y:0},{id:'outro'}).toFixed(3),5,'sobreposição de 3..8 conta uma vez');
  assert.deepEqual(entradasNaTrajetoria([q],{x:5,y:0},{x:10,y:0},{id:'outro'}),[],'quem já estava dentro não "entra"');
  assert.ok(pontoNaZona(q,{x:7,y:2})&&!pontoNaZona(q,{x:7.1,y:0}));
});

test('M05 Emaranhar: conjuração cria uma zona pública, prende quem falha e poupa o conjurador',async()=>{
  const m=await cenaEmaranhar();
  const s=await conjurar(m);
  assert.equal(s.zonas.length,1);const z=s.zonas[0];
  assert.deepEqual({nome:z.nome,forma:z.geometria.forma,lado:z.geometria.tamanhoM,centro:z.centro,origem:z.origemAtorId,turnos:z.duracao.restante,terreno:z.terrenoDificil},
    {nome:'Emaranhar',forma:'quadrado',lado:6,centro:{x:9,y:0},origem:m.z.id,turnos:10,terreno:true});
  assert.equal(z.concentracaoId,s.atores[0].concentracaoAtiva.id,'zona vinculada à concentração');
  assert.ok(temCondicao(s.atores[1],'contido'),'alvo na área falhou e ficou Contido');
  assert.ok(!temCondicao(s.atores[2],'contido'),'quem estava fora da área não é afetado');
  assert.ok(publico(s).zonas.some(x=>x.id===z.id),'a zona vai para a visão pública de todos');
  // Conjurador dentro da própria área não faz salvaguarda
  const m2=await cenaEmaranhar({distancia:3});m2.z.x=3;m2.z.y=1;const r=roladorSala({salva:2});
  const s2=await aplicar(m2.s,{rev:m2.s.rev,tipo:'usar',ator:m2.z.id,opcao:m2.emaranhar.id,ponto:{x:3,y:0}},player,r.rolar);
  assert.ok(!temCondicao(s2.atores[0],'contido'));assert.equal(r.formulas.filter(x=>x.meta.tipo==='salvaguarda').length,1);
});

test('M05 Emaranhar: atravessar a área custa o trecho em dobro e não pede nova salvaguarda; prévia vermelha só para quem é afetado',async()=>{
  const m=await cenaEmaranhar();let s=await conjurar(m);
  // Soldado II atravessa a área de fora a fora (entra em y=3 e sai em y=-3)
  s.vez=2;const sold=s.atores[2];sold.x=9;sold.y=5;sold.metros=30;
  const r=roladorSala();
  s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:sold.id,x:9,y:-5},gm,r.rolar);
  assert.equal(s.atores[2].y,-5);assert.equal(+s.atores[2].metros.toFixed(3),30-10-6,'10 m andados + 6 m extras dentro da área');
  assert.ok(!r.formulas.some(x=>x.meta.tipo==='salvaguarda'),'Emaranhar não pede salvaguarda ao entrar');
  assert.ok(!temCondicao(s.atores[2],'contido'));
  const contato=primeiroContato(s.zonas,{x:9,y:5},{x:9,y:-5},s.atores[2]);assert.equal(+contato.ponto.y.toFixed(3),3,'vermelho a partir de y=3');
  assert.equal(primeiroContato(s.zonas,{x:0,y:0},{x:12,y:0},s.atores[0]),null,'para Zurich a área não é hostil');
  // Zurich anda dentro da própria área sem custo extra
  s.vez=0;s.atores[0].metros=9;s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:m.z.id,x:7,y:0},player,r.rolar);assert.equal(s.atores[0].metros,2);
});

test('M05 Emaranhar: soltar-se usa a Ação e Atletismo contra a CD; fim da concentração limpa área e Contido',async()=>{
  const m=await cenaEmaranhar();let s=await conjurar(m);
  s.vez=1;const preso=s.atores[1],soltar=opcoesDisponiveis(preso).find(o=>o.automacao?.tipo==='escapar');
  assert.ok(soltar,'a condição concede a opção de se soltar');assert.equal(preso.metros,9);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:preso.id,opcao:soltar.id},gm,roladorSala({d20:2}).rolar);
  assert.ok(temCondicao(s.atores[1],'contido'),'falhou no teste');assert.equal(s.atores[1].acao,0);
  s.atores[1].acao=1;const r=roladorSala({d20:15});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:preso.id,opcao:soltar.id},gm,r.rolar);
  assert.equal(r.formulas[0].meta.cd,12);assert.ok(!temCondicao(s.atores[1],'contido'),'se soltou');assert.equal(s.zonas.length,1,'a área continua');
  // Encerrar a concentração (nova magia de concentração) remove a área e quem ainda estiver Contido
  const m2=await cenaEmaranhar();let t=await conjurar(m2);assert.ok(temCondicao(t.atores[1],'contido'));
  const zurich=t.atores[0];encerrarConcM05(t,zurich,'teste');
  assert.equal(t.zonas.length,0);assert.ok(!temCondicao(t.atores[1],'contido'));
});

test('M05 Emaranhar: expira em 10 rodadas no combate e no avanço de tempo do mestre',async()=>{
  const m=await cenaEmaranhar();let s=await conjurar(m);
  for(let rodada=0;rodada<10;rodada++)for(const ator of [...s.ordem]){const atualId=atual(s).id;s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:atualId,confirmado:true},gm,roladorSala({salva:2}).rolar);}
  assert.equal(s.zonas.length,0,'terminou no início do 11º turno de Zurich');assert.ok(!s.atores[0].concentracaoAtiva);assert.ok(!temCondicao(s.atores[1],'contido'));
  // Fora de combate: o avanço de tempo do mestre conta a duração da área
  const m2=await cenaEmaranhar();let t=await conjurar(m2);
  t=await aplicar(t,{rev:t.rev,tipo:'encerrar'},gm,()=>0);assert.equal(t.zonas.length,1,'a área continua depois do combate');
  const passos=t.zonas[0].duracao.restante;
  for(let i=0;i<passos-1;i++)t=await aplicar(t,{rev:t.rev,tipo:'avancarTempo',passo:'1t'},gm,()=>0);
  assert.equal(t.zonas.length,1);t=await aplicar(t,{rev:t.rev,tipo:'avancarTempo',passo:'1t'},gm,()=>0);
  assert.equal(t.zonas.length,0,'expirou pelo relógio do mestre');assert.ok(!t.atores[0].concentracaoAtiva);
});

test('M05 várias zonas, gatilhos genéricos de entrada e restauração idempotente após reabrir a cena',async()=>{
  const m=await cenaEmaranhar();let s=await conjurar(m);
  // segunda zona genérica com gatilho de entrada (salvaguarda + dano), para validar o contrato do módulo
  s.zonas.push({id:'fogo',nome:'Chamas',origemAtorId:'npc',centro:{x:0,y:-10},geometria:{forma:'circulo',raioM:2},cd:13,afetaConjurador:true,gatilhos:[{evento:'entrada',salva:{atributo:'des'},dano:'2d6',elemento:'fogo',umaVezPorTurno:true}]});
  s.vez=2;const sold=s.atores[2];sold.x=0;sold.y=-5;sold.metros=30;const pv=sold.pv;const r=roladorSala({salva:2,dano:7});
  s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:sold.id,x:0,y:-15},gm,r.rolar);
  assert.ok(r.formulas.some(x=>x.meta.tipo==='salvaguarda'&&x.meta.cd===13));assert.equal(s.atores[2].pv,pv-7,'entrar na zona de chamas causa dano');
  // restauração: JSON (como o localStorage), duplicada e com zona órfã
  const salvo=JSON.parse(JSON.stringify(compactarEstado(s)));salvo.zonas.push(structuredClone(salvo.zonas[0]),{id:'orfa',centro:{x:0,y:0},geometria:{forma:'circulo',raioM:1},concentracaoId:'acabou'});
  normalizarZonas(salvo);normalizarZonas(salvo);
  assert.deepEqual(salvo.zonas.map(z=>z.id).sort(),[s.zonas[0].id,'fogo'].sort(),'uma representação por zona, sem órfãs');
});

// ===== Pendências das sete fichas (0.8.28) =====
import {facesMaximas,tamanhoAte,modoPericiaEquipamento as modoPericiaM01} from './site/engine.mjs';

test('#57 Ataque Prostrador só derruba Grande ou menor (M10)',async()=>{
  for(const [tamanho,cai] of [[undefined,true],['Grande',true],['Enorme',false]]){
    let {s,a,b}=await duelo('draven-thorne');if(tamanho)b.ficha.tamanho=tamanho;
    const prostrador=a.ficha.opcoes.find(o=>/Ataque Prostrador/.test(o.nome));
    const rolar=async(f,meta={})=>{if(meta.tipo==='ataque')return {total:20,natural:15,formula:f};if(meta.tipo==='salvaguarda')return {total:1,natural:1,formula:f};
      const r={total:4,natural:null,formula:f,recursosAtivos:(meta.adicionais??[]).filter(x=>x.id===prostrador.id||x.automatico).map(x=>x.id)};if(Array.isArray(f))r.resultados=f.map(()=>({total:4}));return r;};
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'espada grande').id,alvo:b.id},player,rolar);
    assert.equal(temCondicao(s.atores[1],'caido'),cai,String(tamanho));
  }
  assert.ok(tamanhoAte({ficha:{}},'grande'),'sem tamanho na ficha = Médio');
});

test('#60 Explosão Elemental: cada 8 rola mais um d8, até 3 dados extras (M13)',async()=>{
  assert.equal(facesMaximas({grupos:[{diceType:'d8',dice:[{value:8},{value:3},{value:8,kept:false}]}]},8),1);
  let {s,a,b}=await duelo('nikki',undefined,{distancia:6});const explosao=opRev(a,'explosao elemental (fogo)');
  assert.deepEqual(explosao.automacao.dadosExplosivos,{lados:8,limite:3});
  const pedidos=[];let n=0;
  const rolar=async(f,meta={})=>{pedidos.push({f,meta});if(meta.tipo==='ataque')return {total:20,natural:15,formula:f};
    n++;return n===1?{total:8,faces:[8],formula:f}:{total:8*Number(f[0]),faces:Array(Number(f[0])).fill(8),formula:f};};
  b.pv=200;b.ficha.pvMaximos=200;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:explosao.id,alvo:b.id},player,rolar);
  const extras=pedidos.filter(x=>/explosivo/.test(x.meta.titulo??''));
  assert.deepEqual(extras.map(x=>x.f),['1d8','1d8','1d8'],'para no limite de 3 dados');assert.equal(s.atores[1].pv,200-8-24);
  // sem 8, nenhum dado extra
  ({s,a,b}=await duelo('nikki',undefined,{distancia:6}));const p2=[];
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:explosao.id,alvo:b.id},player,async(f,meta={})=>{p2.push(meta);return meta.tipo==='ataque'?{total:20,natural:15,formula:f}:{total:5,faces:[5],formula:f};});
  assert.ok(!p2.some(m=>/explosivo/.test(m.titulo??'')));
});

test('#60 #61 Taumaturgia dá Vantagem em Intimidação por 1 minuto; Queda Suave registra e gasta reação e espaço',async()=>{
  for(const nome of ['nikki','skimi']){
    let {s,a}=await duelo(nome);const t=opRev(a,'taumaturgia');assert.ok(t?.automacao,nome);
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:t.id,alvo:a.id},player,roladorSala().rolar);
    assert.equal(modoPericiaM01(s.atores[0],'Intimidação'),'vantagem',nome);assert.equal(modoPericiaM01(s.atores[0],'Enganação'),'normal');
    const r=roladorSala();s=await aplicar(s,{rev:s.rev,tipo:'teste',ator:a.id,grupo:'pericias',chave:'Intimidação',modo:'normal'},player,r.rolar);
    assert.match(r.formulas[0].f,/^2d20kh1/);
    s=await aplicar(s,{rev:s.rev,tipo:'encerrar'},gm,()=>0);
    for(let i=0;i<10;i++)s=await aplicar(s,{rev:s.rev,tipo:'avancarTempo',passo:'1t'},gm,()=>0);
    assert.equal(modoPericiaM01(s.atores[0],'Intimidação'),'normal','expirou em 1 minuto');
  }
  let {s,a}=await duelo('nikki');s.vez=1;const queda=a.ficha.opcoes.find(o=>/Queda Suave/.test(o.nome)),espacos=a.rec['espaco-1'];
  s=await aplicar(s,{rev:s.rev,tipo:'reagir',ator:a.id,opcao:queda.id},player,roladorSala().rolar);
  assert.equal(s.atores[0].reacao,0);assert.equal(s.atores[0].rec['espaco-1'],espacos-1);assert.match(s.historico.join(' '),/Queda Suave/);
});

// ===== M06 — entidades vinculadas e peças visuais (issue #45) =====
test('M06 Encontrar Familiar: entidade com ficha própria, controlada por quem invocou, e reforço em combate',async()=>{
  let {s,a,b}=await duelo('skimi');s.fase='preparo';s.ordem=[];
  const enc=opRev(a,'encontrar familiar');assert.equal(enc.automacao.tipo,'invocar');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:enc.id,ponto:{x:-1,y:-1}},player,roladorSala().rolar);
  const fam=s.atores.find(x=>x.invocacao);assert.ok(fam,'familiar criado');
  assert.deepEqual({dono:fam.dono,origem:fam.invocacao.origemAtorId,tamanho:fam.ficha.tamanho,pv:fam.pv,ca:caAtual(fam),imagem:fam.invocacao.imagem},
    {dono:'p',origem:a.id,tamanho:'miudo',pv:1,ca:11,imagem:'assets/tokens/invocacao-padrao.png'});
  assert.equal(fam.ficha.lado,'pj','fica do lado de quem invocou');
  // o jogador que invocou controla o familiar; outro jogador não
  s.fase='turnos';s.ordem=[a.id,b.id,fam.id];s.vez=2;s.rodada=1;fam.metros=9;fam.acao=1;
  s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:fam.id,x:-1,y:-2},player,roladorSala().rolar);assert.equal(s.atores.find(x=>x.id===fam.id).y,-2);
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'mover',ator:fam.id,x:-1,y:-3},{id:'outro',role:'PLAYER'},()=>0),/não controla/);
  // conjurar de novo substitui o anterior (uma representação por conjurador)
  s.fase='preparo';s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:enc.id,ponto:{x:2,y:2}},player,roladorSala().rolar);
  assert.equal(s.atores.filter(x=>x.invocacao).length,1);
  // Dispensar e 0 PV encerram a entidade
  const novo=s.atores.find(x=>x.invocacao);s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:novo.id,opcao:'dispensar-invocacao'},player,roladorSala().rolar);
  assert.equal(s.atores.filter(x=>x.invocacao).length,0);
});

test('M06 Mãos Mágicas: em combate rola iniciativa como reforço e some após 1 minuto ou a 0 PV',async()=>{
  let {s,a,b}=await duelo('nikki');const maos=opRev(a,'maos magicas');assert.equal(maos.automacao.turnos,10);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:maos.id,ponto:{x:3,y:0}},player,roladorSala({d20:12}).rolar);
  const mao=s.atores.find(x=>x.invocacao);assert.ok(Number.isFinite(mao.init),'iniciativa de reforço');assert.ok(s.ordem.includes(mao.id));assert.equal(atual(s).id,a.id,'a vez não muda');
  let passes=0;while(s.atores.some(x=>x.invocacao)&&passes<40){s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:atual(s).id,confirmado:true},gm,roladorSala().rolar);passes++;}
  assert.equal(s.rodada,11,'some no início do 11º turno de Nikki (1 minuto)');
  assert.equal(s.atores.filter(x=>x.invocacao).length,0,'expirou');assert.ok(!s.ordem.includes(mao.id));
  ({s,a,b}=await duelo('nikki'));s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:maos.id,ponto:{x:3,y:0}},player,roladorSala().rolar);
  s.atores.find(x=>x.invocacao).pv=0;s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,roladorSala().rolar);
  assert.equal(s.atores.filter(x=>x.invocacao).length,0,'a 0 PV some');
});

test('M06 Ilusão Menor: peça visual estática pública, sem ficha nem iniciativa, removida ao expirar',async()=>{
  let {s,a}=await duelo('hannah-montana');const ilusao=opRev(a,'ilusao menor');assert.equal(ilusao.automacao.tipo,'peca');
  const atores=s.atores.length;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ilusao.id,ponto:{x:2,y:2}},player,roladorSala().rolar);
  assert.equal(s.atores.length,atores,'não cria ator');assert.equal(s.pecas.length,1);assert.deepEqual(publico(s).pecas[0].posicao,{x:2,y:2});
  s.atores[0].acao=1;await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ilusao.id,ponto:{x:20,y:0}},player,roladorSala().rolar),/alcance/);
  s=await aplicar(s,{rev:s.rev,tipo:'encerrar'},gm,()=>0);
  for(let i=0;i<9;i++)s=await aplicar(s,{rev:s.rev,tipo:'avancarTempo',passo:'1t'},gm,()=>0);
  assert.equal(s.pecas.length,1);s=await aplicar(s,{rev:s.rev,tipo:'avancarTempo',passo:'1t'},gm,()=>0);assert.equal(s.pecas.length,0,'1 minuto');
});

test('#59 Gaveta do Golpe Desarmado avulso prepara Mão de Dolo (gasta Foco só se acertar)',async()=>{
  for(const acerta of [true,false]){
    let {s,a,b}=await duelo('loteria');const golpe=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao'));
    const modo=golpe.composicao?.modos.find(m=>m.id==='golpe-mao-de-dolo');assert.ok(modo,'modo preparado na Gaveta');
    const dolo=a.ficha.opcoes.find(o=>o.nome==='Mão de Dolo'),foco=a.rec['pontos-de-foco'],pv=b.pv,vistos=[];
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:golpe.id,composicao:[{modoId:'golpe-mao-de-dolo',alvoId:b.id}]},player,async(formula,meta)=>{
      if(meta.tipo==='ataque')return acerta?{total:22,natural:17,formula}:{total:3,natural:2,formula};
      const usar=(meta.adicionais??[]).filter(x=>x.automatico||x.preSelecionado);vistos.push(...usar);
      return {total:4+usar.length*5,formula,resultados:[{total:4},...usar.map(()=>({total:5}))],recursosAtivos:usar.map(x=>x.id)};});
    if(acerta){assert.ok(vistos.some(x=>x.id===dolo.id&&x.preSelecionado));assert.equal(s.atores[0].rec['pontos-de-foco'],foco-1);assert.equal(s.atores[1].pv,pv-9);}
    else{assert.equal(s.atores[0].rec['pontos-de-foco'],foco,'errou: nada cobrado');}
  }
});

// ===== Critérios de conclusão das sete fichas (#56–#62) =====
import {normalizarZonas as normalizarZonasCrit} from './site/engine.mjs';

test('critério das sete fichas: turno padrão (mover, atacar com a arma e passar) sem erro',async()=>{
  for(const id of idsJogadores){
    let {s,a,b}=await duelo(id,undefined,{distancia:3});
    s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:a.id,x:1.5,y:0},player,roladorSala().rolar);
    const arma=opcoesDisponiveis(s.atores[0]).find(o=>o.geradaPorItem&&o.automacao?.tipo==='ataque'&&o.custo?.some(c=>c.tipo==='acao')&&!o.automacao.arremesso);
    assert.ok(arma,id+' tem ataque com arma');
    const pv=s.atores[1].pv;
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:arma.id,alvo:b.id},player,roladorSala({d20:15}).rolar);
    assert.ok(s.atores[1].pv<pv,id+' causou dano');assert.equal(s.atores[0].acao,0,id+' gastou a Ação');
    s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,roladorSala().rolar);
    assert.equal(atual(s).id,b.id,id+' passou o turno');
  }
});

test('critério das sete fichas: opções de interpretação registram o uso e cobram o custo',async()=>{
  const cobertas={};
  for(const id of idsJogadores){
    const base=await duelo(id);
    const interpretativas=opcoesDisponiveis(base.a).filter(o=>!o.automacao&&!o.gatilho&&!o.informativa&&!o.requisitosUso&&o.categoria!=='passiva');
    for(const o of interpretativas){
      let {s,a}=await duelo(id);if(o.foraCombate||o.requisitosUso?.somenteForaCombate){s.fase='preparo';}
      const reacao=o.custo?.some(c=>c.tipo==='reacao'),antes=structuredClone(s.atores[0]);if(reacao)s.vez=1;
      s=await aplicar(s,{rev:s.rev,tipo:reacao?'reagir':'usar',ator:a.id,opcao:o.id,assistido:true},player,roladorSala().rolar);
      const depois=s.atores[0];
      for(const c of o.custo??[]){
        if(s.fase==='preparo'&&c.tipo!=='recurso')continue;
        const k=c.tipo==='recurso'?c.id:c.tipo,ant=c.tipo==='recurso'?antes.rec[k]:antes[k],dep=c.tipo==='recurso'?depois.rec[k]:depois[k];
        assert.equal(dep,ant-c.quantidade,id+' · '+o.nome+' cobra '+k);
      }
      assert.ok(s.historico.some(h=>h.includes(o.nome)),id+' · '+o.nome+' registrado no histórico');
      (cobertas[id]??=[]).push(o.nome);
    }
  }
  assert.ok(Object.keys(cobertas).length>=5);
});

test('critério das sete fichas: salvar, compactar e reabrir não perde estado nem duplica definições',async()=>{
  let s=novo();const atores=[];
  for(const id of idsJogadores){const a=adicionar(s,await fichaRev(id));a.dono='p';atores.push(a);}
  // estado com uso de recursos, efeito, zona e invocação
  atores[6].rec['espaco-1']=0;atores[0].pv-=3;atores[4].efeitosAtivos=[{id:'teste',nome:'Taumaturgia',tipo:'buff',vantagemPericias:['Intimidação'],duracao:{turnos:10,restante:7,expira:'inicio_origem'},origemAtorId:atores[4].id}];
  const skimi=atores[5];s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:skimi.id,opcao:opRev(skimi,'encontrar familiar').id,ponto:{x:skimi.x+1,y:0}},player,roladorSala().rolar);
  const salvo=JSON.parse(JSON.stringify(compactarEstado(s)));
  const reaberto=salvo;for(const a of reaberto.atores){a.ficha=validar(a.ficha);atualizarMagias(a.ficha);}normalizarZonasCrit(reaberto);
  const reaberto2=JSON.parse(JSON.stringify(compactarEstado(reaberto)));for(const a of reaberto2.atores){a.ficha=validar(a.ficha);atualizarMagias(a.ficha);}
  for(const [i,a] of s.atores.entries()){
    for(const r of [reaberto,reaberto2]){
      const b=r.atores[i];
      const j=x=>JSON.parse(JSON.stringify(x??null));
      assert.deepEqual(j({pv:b.pv,rec:b.rec,ef:b.efeitosAtivos,dono:b.dono,inv:b.invocacao,lado:b.ficha.lado}),j({pv:a.pv,rec:a.rec,ef:a.efeitosAtivos,dono:a.dono,inv:a.invocacao,lado:a.ficha.lado}),a.nome);
      const ids=opcoesDisponiveis(b).map(o=>o.id);assert.equal(new Set(ids).size,ids.length,a.nome+' sem opções duplicadas');
      assert.deepEqual(ids,opcoesDisponiveis(a).map(o=>o.id),a.nome+' mesmas opções após reabrir');
    }
  }
});

test('fuzz: salvaguarda de entidade invocada vai para o jogador que a controla',async()=>{
  let {s,a,b}=await duelo('nikki');const maos=opRev(a,'maos magicas');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:maos.id,ponto:{x:3,y:0}},player,roladorSala().rolar);
  const mao=s.atores.find(x=>x.invocacao);assert.equal(controladorAtor(mao),'p');assert.equal(controladorAtor(s.atores.find(x=>x.ficha.tipo==='npc'&&!x.invocacao)),'GM');
  // um efeito de salvaguarda contra a mão pede a rolagem ao dono
  s.vez=s.ordem.indexOf(b.id);const metas=[];
  b.ficha.opcoes.push({id:'grito',nome:'Grito',categoria:'acao',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributo:'sab',cd:12,alcanceM:18,dano:'1d4',elemento:'trovejante'}});
  const sb=s.atores.find(x=>x.id===b.id);sb.ficha=validar(b.ficha);sb.acao=1;
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:b.id,opcao:'grito',alvo:mao.id},gm,async(f,m={})=>{metas.push(m);return /d20/.test(f)?{total:5,natural:5,formula:f}:{total:1,formula:f};});
  assert.equal(metas.find(m=>m.tipo==='salvaguarda').destinoId,'p');
});

test('áreas do livro: Despedaçar tem 3 m de raio e 6 m de diâmetro',async()=>{
  for(const [dx,dentro] of [[0,true],[1.4,true],[1.6,true],[2.9,true],[3,true],[3.1,false]]){
    let {s,a,b}=await duelo('nikki',undefined,{distancia:6});b.x=6+dx;b.y=0;const pv=b.pv;
    const desp=opRev(a,'despedacar');s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:desp.id,ponto:{x:6,y:0}},player,roladorSala({salva:2,dano:8}).rolar);
    assert.equal(s.atores[1].pv<pv,dentro,'alvo a '+dx+' m do centro');
  }
});

test('áreas do livro: Braços de Hadar tem 3 m ao redor e Acalmar Emoções tem 6 m de raio',async()=>{
  for(const [dx,dentro] of [[1.5,true],[2.9,true],[3.2,false]]){
    let {s,a,b}=await duelo('nikki',undefined,{distancia:dx});const pv=b.pv;
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'bracos de hadar').id},player,roladorSala({salva:2,dano:6}).rolar);
    assert.equal(s.atores[1].pv<pv,dentro,'Braços de Hadar a '+dx+' m');
  }
  for(const [dx,dentro] of [[2.9,true],[3.1,true],[6,true],[6.1,false]]){
    let {s,a,b}=await duelo('nikki',undefined,{distancia:9});b.x=9+dx;const pv=b.pv;
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'acalmar emocoes').id,ponto:{x:9,y:0}},player,roladorSala({salva:2}).rolar);
    assert.equal((s.atores[1].efeitosAtivos??[]).some(e=>/Emoções/.test(e.nome)),dentro,'Acalmar Emoções a '+dx+' m do centro');
  }
});
import {resolverInstanciaItem as itemDeMissao} from './site/catalog.mjs';

const rolarItemMissao=({face=15,base=4,reducao=0}={})=>async(formula,meta={})=>{
  if(meta.tipo==='ataque')return {total:face+10,natural:face,formula};
  if(meta.tipo==='reducao')return {total:reducao,formula};
  const extras=(meta.adicionais??[]).filter(e=>e.automatico),resultados=[{total:base,formula},...extras.map(e=>({total:Number(e.formula),formula:e.formula}))];
  return {total:resultados.reduce((n,r)=>n+r.total,0),resultados,recursosAtivos:extras.map(e=>e.id)};
};
function equiparAdagaMissao(a){
  for(const i of a.ficha.inventario.itens)if(i.tipoArma)i.equipado=false;
  const item=itemDeMissao({id:'adaga-missao',ref:'item.adaga-do-ultimo-rito',equipado:true,equipadoSlot:'mao_forte'});
  a.ficha.inventario.itens.push(item);return item;
}

test('itens de missão: preços em cobre e revenda a 70%',()=>{
  const adaga=itemDeMissao({id:'a',ref:'item.adaga-do-ultimo-rito'}),colar=itemDeMissao({id:'c',ref:'item.colar-da-ultima-palavra'});
  assert.equal(precoVendaPc(adaga),24500);assert.equal(precoVendaPc(colar),130000);
  assert.equal(adaga.pesoKg,0.5);assert.equal(colar.pesoKg,0.1);
});

test('Adaga do Último Rito: +1 necrótico em acerto, arremesso e crítico; sem extra no erro',async()=>{
  for(const [arremesso,face,base,esperado] of [[false,15,4,5],[true,15,4,5],[false,20,8,9],[true,20,8,9],[false,1,4,0]]){
    const {s,a,b}=await duelo('nikki',undefined,{distancia:arremesso?6:1.5});equiparAdagaMissao(a);
    const ataque=ataquesEquipados(a).find(o=>o.origemItem==='adaga-missao'&&Boolean(o.automacao.arremesso)===arremesso);
    const pv=b.pv,metas=[];
    const proximo=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,alvo:b.id},player,async(f,m)=>{metas.push(m);return rolarItemMissao({face,base})(f,m);});
    assert.equal(pv-proximo.atores[1].pv,esperado);
    assert.equal(proximo.atores[0].acao,0);
    if(face!==1){const extra=metas.find(m=>m.tipo==='dano').adicionais.find(e=>e.nome==='Adaga do Último Rito');assert.equal(extra.formula,'1');assert.equal(extra.elemento,'necrotico');assert.equal(extra.automatico,true);}
  }
});

test('Adaga do Último Rito: defesas necróticas afetam apenas a parcela necrótica',async()=>{
  for(const [campo,esperado] of [['resistencias',4],['imunidades',4],['vulnerabilidades',6]]){
    const {s,a,b}=await duelo('nikki');equiparAdagaMissao(a);b.ficha[campo]=['necrotico'];
    const ataque=ataquesEquipados(a).find(o=>o.origemItem==='adaga-missao'&&!o.automacao.arremesso),pv=b.pv;
    const proximo=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,alvo:b.id},player,rolarItemMissao());
    assert.equal(pv-proximo.atores[1].pv,esperado,campo);
  }
});

test('Adaga do Último Rito: reação preventiva conserva a parcela fixa e a redução',async()=>{
  for(const reducao of [0,2]){
    const {s,a,b}=await duelo('nikki','loteria');equiparAdagaMissao(a);
    const ataque=ataquesEquipados(a).find(o=>o.origemItem==='adaga-missao'&&!o.automacao.arremesso),pv=b.pv;
    let proximo=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,alvo:b.id},player,rolarItemMissao());
    assert.equal(proximo.reacaoPendente?.gatilho,'ser_atingido');
    const opcao=reducao?proximo.reacaoPendente.opcoes.find(id=>proximo.atores[1].ficha.opcoes.find(o=>o.id===id)?.automacao?.tipo==='reduzir_dano'):null;
    proximo=await aplicar(proximo,{rev:proximo.rev,tipo:'resolverReacao',ator:b.id,opcao,confirmado:true},gm,rolarItemMissao({reducao}));
    assert.equal(pv-proximo.atores[1].pv,5-reducao);
  }
});

test('Colar da Última Palavra: equipado, sem espaço de magia; descanso não recupera e amanhecer é do GM',async()=>{
  let s=novo();const a=adicionar(s,await fichaRev('nikki'));a.dono='p';
  const go=async(tipo,args={},user=gm)=>{s=await aplicar(s,{rev:s.rev,tipo,ator:a.id,confirmado:true,...args},user,dadoLocal);};
  await go('gmAdicionarItem',{itemRef:'item.colar-da-ultima-palavra',quantidade:1});
  let ator=s.atores[0],item=ator.ficha.inventario.itens.find(i=>i.catalogoRef==='item.colar-da-ultima-palavra');
  assert.ok(!opcoesDisponiveis(ator).some(o=>o.concedidaPorItem===item.id));
  await go('inventario',{operacao:'equipar',itemId:item.id});
  let opcao=opcoesDisponiveis(s.atores[0]).find(o=>o.concedidaPorItem===item.id),recurso=opcao.custo.find(c=>c.tipo==='recurso').id;
  const magiaAntes=s.atores[0].rec['espaco-2'];
  await go('usar',{opcao:opcao.id,assistido:true},player);
  assert.equal(s.atores[0].rec[recurso],0);assert.equal(s.atores[0].rec['espaco-2'],magiaAntes);
  await assert.rejects(go('usar',{opcao:opcao.id,assistido:true},player));
  await go('descanso',{periodo:'longo'});assert.equal(s.atores[0].rec[recurso],0);
  await go('inventario',{operacao:'desequipar',itemId:item.id});
  await go('inventario',{operacao:'equipar',itemId:item.id});assert.equal(s.atores[0].rec[recurso],0);
  const reaberto=JSON.parse(JSON.stringify(compactarEstado(s)));
  for(const x of reaberto.atores)x.ficha=validar(x.ficha);s=reaberto;
  assert.equal(opcoesDisponiveis(s.atores[0]).find(o=>o.id===opcao.id)?.nome,opcao.nome);
  assert.equal(s.atores[0].rec[recurso],0);
  await assert.rejects(go('amanhecer',{},player),/mestre/);
  await go('amanhecer');assert.equal(s.atores[0].rec[recurso],1);
  assert.ok(s.historico[0].includes('amanhecer'));
});

test('Colar da Última Palavra: transferir o item preserva o uso gasto após compactar',async()=>{
  let s=novo();const a=adicionar(s,await fichaRev('nikki')),b=adicionar(s,await fichaRev('soldado'));
  s=await aplicar(s,{rev:s.rev,tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.colar-da-ultima-palavra',quantidade:1},gm,dadoLocal);
  let item=s.atores[0].ficha.inventario.itens.find(i=>i.catalogoRef==='item.colar-da-ultima-palavra');item.equipado=true;item.equipadoSlot='colar';
  const opcao=opcoesDisponiveis(s.atores[0]).find(o=>o.concedidaPorItem===item.id);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opcao.id,assistido:true,confirmado:true},gm,dadoLocal);
  item=s.atores[0].ficha.inventario.itens.find(i=>i.id===item.id);assert.equal(item.saldosRecursos['ultima-palavra'],0);
  s.atores[0].ficha.inventario.itens=s.atores[0].ficha.inventario.itens.filter(i=>i.id!==item.id);s.atores[1].ficha.inventario.itens.push(item);
  s=JSON.parse(JSON.stringify(compactarEstado(s)));for(const x of s.atores)x.ficha=validar(x.ficha);
  const novoDono=s.atores[1],op=opcoesDisponiveis(novoDono).find(o=>o.concedidaPorItem===item.id);
  assert.equal(novoDono.rec[op.custo.find(c=>c.tipo==='recurso').id],0);
  s=await aplicar(s,{rev:s.rev,tipo:'amanhecer'},gm,dadoLocal);assert.equal(s.atores[1].rec[op.custo.find(c=>c.tipo==='recurso').id],1);
});


test('Adaga do Último Rito: Ágil atribui o bônus somente à arma da etapa',async()=>{
  const {s,a,b}=await duelo('zurich');
  const principal=a.ficha.inventario.itens.find(i=>i.equipadoSlot==='mao_forte');
  for(const item of a.ficha.inventario.itens)if(item.equipadoSlot==='mao_fraca')item.equipado=false;
  a.ficha.inventario.itens.push(itemDeMissao({id:'adaga-secundaria',ref:'item.adaga-do-ultimo-rito',equipado:true,equipadoSlot:'mao_fraca'}));
  const ataque=opcoesDisponiveis(a).find(o=>o.origemItem===principal.id&&o.composicao);
  assert.ok(ataque);
  const modos=ataque.composicao.modos,metas=[];
  const proximo=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:ataque.id,composicao:[{modoId:modos[0].id,alvoId:b.id},{modoId:modos[1].id,alvoId:b.id}]},player,async(f,m)=>{metas.push(m);return rolarItemMissao()(f,m);});
  const danos=metas.filter(m=>m.tipo==='dano');
  assert.equal(danos.length,2);
  assert.equal(danos[0].adicionais.some(e=>e.nome==='Adaga do Último Rito'),false);
  assert.equal(danos[1].adicionais.some(e=>e.nome==='Adaga do Último Rito'),true);
  assert.equal(b.pv-proximo.atores[1].pv,9);
});


test('recursos de itens: NPC duplicado recebe usos iniciais em uma instância independente',async()=>{
  let s=novo();const a=adicionar(s,await fichaRev('soldado'));a.token='original';
  s=await aplicar(s,{rev:s.rev,tipo:'gmAdicionarItem',ator:a.id,itemRef:'item.colar-da-ultima-palavra',quantidade:1},gm,dadoLocal);
  const origem=s.atores[0],item=origem.ficha.inventario.itens.find(i=>i.catalogoRef==='item.colar-da-ultima-palavra');
  origem.rec['item-'+item.id+'-ultima-palavra']=0;opcoesDisponiveis(origem);
  const marcador={atorId:a.id,tokenId:'original'};
  const tokens=['original','copia'].map(id=>({id,type:'IMAGE',layer:'CHARACTER',position:{x:0,y:0},metadata:{[chaveFichaNpc]:marcador}}));
  sincronizarCopiasNpc(s,tokens,pixelsPorMetro(100));
  assert.equal(s.atores[0].rec['item-'+item.id+'-ultima-palavra'],0);
  assert.equal(s.atores[1].rec['item-'+item.id+'-ultima-palavra'],1);
});

test('Combate com Armas Grandes: 1 e 2 nos dados da espada grande contam como 3; outras armas não mudam',async()=>{
  assert.deepEqual(facesDanoBase({grupos:[{diceType:'d6',dice:[{value:1},{value:5},{value:2,kept:false}]},{diceType:'d20',dice:[{value:1}]}]}),[1,5]);
  let {s,a,b}=await duelo('draven-thorne');b.pv=200;b.ficha.pvMaximos=200;b.ficha.resistencias=[];
  const espada=opcoesDisponiveis(a).find(o=>o.automacao?.tipo==='ataque'&&/espada grande/i.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao'));
  assert.ok(espada,'Draven ataca com a espada grande');
  const rolar=faces=>async(f,meta={})=>meta.tipo==='ataque'?{total:20,natural:15,formula:f}:{total:faces.reduce((n,v)=>n+v,0)+3,faces,formula:f};
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:espada.id,alvo:b.id},player,rolar([1,2]));
  assert.equal(s.atores[1].pv,200-(3+3+3),'1 e 2 viram 3: 3+3+3');
  assert.ok(s.historico.some(h=>/Combate com Armas Grandes \+3/.test(h)),'histórico mostra o ajuste');
  // sem 1 ou 2, nada muda
  ({s,a,b}=await duelo('draven-thorne'));b.pv=200;b.ficha.pvMaximos=200;b.ficha.resistencias=[];
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:espada.id,alvo:b.id},player,rolar([4,6]));
  assert.equal(s.atores[1].pv,200-13);
  // quem não tem o estilo não recebe o ajuste
  for(const id of idsJogadores.filter(x=>x!=='draven-thorne')){
    ({s,a,b}=await duelo(id));
    const arma=opcoesDisponiveis(a).find(o=>o.automacao?.tipo==='ataque'&&o.custo?.some(c=>c.tipo==='acao'));
    if(arma)assert.equal(fonteFacesMinimas(a,arma,arma.automacao),null,id);
  }
});

test('#59 Soco bônus das Artes Marciais também prepara Mão de Dolo na Gaveta',async()=>{
  let {s,a,b}=await duelo('loteria');b.pv=200;b.ficha.pvMaximos=200;
  const bonus=opcoesDisponiveis(a).find(o=>/^Soco \+/.test(o.nome)&&o.custo?.some(c=>c.tipo==='bonus'));
  assert.ok(bonus?.composicao?.modos.some(m=>m.id==='golpe-mao-de-dolo'),'soco bônus tem o modo Golpe + Mão de Dolo');
  const golpe=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao'));
  const dolo=a.ficha.opcoes.find(o=>o.nome==='Mão de Dolo'),vistos=[];
  const rolar=async(formula,meta)=>{
    if(meta.tipo==='ataque')return {total:22,natural:17,formula};
    const usar=(meta.adicionais??[]).filter(x=>x.automatico||x.preSelecionado);vistos.push(...usar);
    return {total:4+usar.length*5,formula,resultados:[{total:4},...usar.map(()=>({total:5}))],recursosAtivos:usar.map(x=>x.id)};};
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:golpe.id,composicao:[{modoId:'golpe-normal',alvoId:b.id}]},player,rolar);
  const foco=s.atores[0].rec['pontos-de-foco'],pv=s.atores[1].pv;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:bonus.id,composicao:[{modoId:'golpe-mao-de-dolo',alvoId:b.id}]},player,rolar);
  assert.ok(vistos.some(x=>x.id===dolo.id&&x.preSelecionado),'Mão de Dolo chega marcada no dano');
  assert.equal(s.atores[0].bonus,0,'gastou a ação bônus');
  assert.equal(s.atores[0].rec['pontos-de-foco'],foco-1,'1 Foco da Mão de Dolo');assert.equal(s.atores[1].pv,pv-9);
});

test('#61 Disfarçar-se e Mente Desperta: marcadores com duração e encerramento conjunto',async()=>{
  let {s,a,b}=await duelo('skimi');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'1-disfarcar-se-29',alvo:a.id},player,roladorSala().rolar);
  let disf=s.atores[0].efeitosAtivos.find(e=>e.nome==='Disfarçado');
  assert.ok(disf?.marcador&&disf.duracao.restante===600,'Disfarçado por 1 hora (600 rodadas)');assert.equal(s.atores[0].rec['espaco-1']??null,null);
  const encerrarDisf=opcoesDisponiveis(s.atores[0]).find(o=>o.automacao?.tipo==='encerrar_efeito'&&/Disfar/.test(o.nome));assert.ok(encerrarDisf);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:encerrarDisf.id,alvo:a.id},player,roladorSala().rolar);
  assert.ok(!s.atores[0].efeitosAtivos.some(e=>e.nome==='Disfarçado'),'encerrado pelo jogador');
  // Mente Desperta: os dois recebem o marcador; um novo vínculo substitui o anterior; encerrar remove dos dois
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'mente-desperta-acao',alvo:b.id},player,roladorSala().rolar);
  const md=x=>(x.efeitosAtivos??[]).filter(e=>e.nome==='Mente Desperta');
  assert.equal(md(s.atores[0]).length,1);assert.equal(md(s.atores[1]).length,1);assert.equal(md(s.atores[1])[0].duracao.restante,30,'3 minutos');
  const c=adicionar(s,await fichaRev('soldado'),'Soldado II');c.x=3;c.y=0;s.ordem.push(c.id);s.atores[0].bonus=1;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'mente-desperta-acao',alvo:c.id},player,roladorSala().rolar);
  assert.equal(md(s.atores[1]).length,0,'vínculo anterior removido');assert.equal(md(s.atores[2]).length,1);assert.equal(md(s.atores[0]).length,1);
  const encerrar=opcoesDisponiveis(s.atores[0]).find(o=>o.automacao?.tipo==='encerrar_efeito'&&/Mente/.test(o.nome));
  assert.ok(encerrar&&!opcoesDisponiveis(s.atores[2]).some(o=>o.automacao?.tipo==='encerrar_efeito'),'só o conjurador encerra');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:encerrar.id,alvo:a.id},player,roladorSala().rolar);
  assert.equal(md(s.atores[0]).length+md(s.atores[2]).length,0,'os dois marcadores saem juntos');
});

test('#61 Força Fantasmagórica: token público, salvaguarda única, dano gratuito 1x por turno e Estudar encerra tudo',async()=>{
  let {s,a,b}=await duelo('skimi',undefined,{distancia:6});b.pv=200;b.ficha.pvMaximos=200;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'2-forca-fantasmagorica-22',alvo:b.id,ilusaoCausaDano:true},player,roladorSala({salva:2}).rolar);
  const alvo=()=>s.atores[1],skimi=()=>s.atores[0];
  assert.equal(s.pecas.length,1,'token público da ilusão');assert.deepEqual(s.pecas[0].posicao,{x:6,y:0});
  const marcador=alvo().efeitosAtivos.find(e=>e.nome==='Força Fantasmagórica');assert.ok(marcador?.ilusaoId===s.pecas[0].id);
  const estudar=opcoesDisponiveis(alvo()).find(o=>/^Estudar/.test(o.nome));assert.ok(estudar,'alvo ganha Estudar');
  const dano=opcoesDisponiveis(skimi()).find(o=>o.automacao?.tipo==='dano_ilusao');assert.ok(dano&&!dano.custo.length,'dano gratuito concedido no turno da conjuração');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:dano.id,alvo:a.id},player,roladorSala({dano:9}).rolar);
  assert.equal(alvo().pv,191,'2d8 psíquico');
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:dano.id,alvo:a.id},player,roladorSala({dano:9}).rolar),/já foi usada neste turno/);
  // a salvaguarda não se repete no turno do alvo
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,roladorSala().rolar);
  assert.ok(alvo().efeitosAtivos.some(e=>e.nome==='Força Fantasmagórica'),'sem nova salvaguarda');
  // longe da ilusão: dano negado
  alvo().x=12;s.vez=0;skimi().usosTurno={};
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:dano.id,alvo:a.id},player,roladorSala().rolar),/até 1,5 m/);
  alvo().x=6;s.vez=1;
  // Estudar com sucesso remove marcador, token e o dano do conjurador
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:b.id,opcao:estudar.id},gm,roladorSala({d20:15}).rolar);
  assert.ok(!alvo().efeitosAtivos.some(e=>e.nome==='Força Fantasmagórica'));assert.equal(s.pecas.length,0);
  assert.ok(!opcoesDisponiveis(skimi()).some(o=>o.automacao?.tipo==='dano_ilusao'));assert.equal(skimi().concentracaoAtiva,undefined);
  // sem marcar "Ilusão causa dano", nada de dano gratuito
  ({s,a,b}=await duelo('skimi',undefined,{distancia:6}));
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'2-forca-fantasmagorica-22',alvo:b.id},player,roladorSala({salva:2}).rolar);
  assert.ok(!opcoesDisponiveis(s.atores[0]).some(o=>o.automacao?.tipo==='dano_ilusao'));
});

test('#49 M10 tipo de criatura: Imobilizar Pessoa só em humanoides',async()=>{
  let {s,a,b}=await duelo('skimi',undefined,{distancia:6});
  b.ficha.tipoCriatura='fera';
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'2-imobilizar-pessoa-24',alvo:b.id},player,roladorSala({salva:2}).rolar),/humanoide/);
  b.ficha.tipoCriatura='humanoide';
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:'2-imobilizar-pessoa-24',alvo:b.id},player,roladorSala({salva:2}).rolar);
  assert.ok(temCondicao(s.atores[1],'paralisado'));
  assert.equal(tipoCriatura({ficha:{}}),'humanoide');
});


const refLuvaBoxeador='item.la-arte.luva-boxeador-das-ruas-mais-1';
const luvaBoxeador=(extra={})=>itemDeMissao({id:'luva-boxeador',ref:refLuvaBoxeador,equipado:true,equipadoSlot:'acessorio_1',...extra});

test('Luva de Boxeador das Ruas +1: catálogo incomum, preço alto e bônus condicionado à armadura',async()=>{
  const loja=resolverCatalogoLoja(catalogoCentral().lojas.find(l=>l.id==='loja.la-arte')),item=loja.itens.find(i=>i.catalogoRef===refLuvaBoxeador);
  assert.equal(item.nome,'Luva de Boxeador das Ruas +1');assert.equal(item.raridade,'incomum');assert.equal(item.preco.valor,600);assert.equal(item.pesoKg,0.25);
  for(const classe of ['nenhuma','veste','leve','media','pesada','escudo']){
    const {a}=await duelo('loteria');
    const antes=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/i.test(o.nome));
    a.ficha.inventario.itens.push(luvaBoxeador());
    if(classe!=='nenhuma')a.ficha.inventario.itens.push({id:'protecao-boxe',nome:classe==='escudo'?'Escudo':'Veste de teste',tipo:'equipamento',quantidade:1,pesoKg:1,slotEquipamento:classe==='escudo'?'mao_fraca':'vestes',equipado:true,equipadoSlot:classe==='escudo'?'mao_fraca':'vestes',categoriaArmadura:classe});
    const depois=opcoesDisponiveis(a).find(o=>o.id===antes.id),bonus=['nenhuma','veste'].includes(classe)?1:0;
    assert.equal(depois.automacao.bonus,antes.automacao.bonus+bonus,classe);
    assert.equal(depois.automacao.dano,bonus?'1d6+4':'1d6+3',classe);
  }
});

test('Luva de Boxeador: sete fichas, valores dinâmicos sem acumular e armas/magias preservadas',async()=>{
  for(const id of idsJogadores){
    const {a}=await duelo(id);
    a.ficha.inventario.itens=a.ficha.inventario.itens.filter(i=>!i.categoriaArmadura&&!i.classeArmadura);
    const anteriores=opcoesDisponiveis(a),antes=anteriores.find(o=>/Golpe Desarmado/i.test(o.nome));assert.ok(antes,id);
    const luva=luvaBoxeador();a.ficha.inventario.itens.push(luva);
    const original=structuredClone(a.ficha.opcoes);
    for(let n=0;n<3;n++){
      const ops=opcoesDisponiveis(a),golpe=ops.find(o=>o.id===antes.id);
      assert.equal(golpe.automacao.bonus,antes.automacao.bonus+1,id);
      const f=await import('./site/engine.mjs');
      assert.equal(f.avaliarFormula(golpe.automacao.dano,()=>3).total,f.avaliarFormula(antes.automacao.dano,()=>3).total+1,id);
      for(const o of anteriores.filter(o=>o.geradaPorItem||o.categoria==='magia'))assert.deepEqual(ops.find(x=>x.id===o.id)?.automacao,o.automacao,id+' '+o.nome);
    }
    assert.deepEqual(a.ficha.opcoes,original,'a definição salva continua com seus valores base');
    const salvo=JSON.parse(JSON.stringify(compactarEstado({atores:[a]}))).atores[0];salvo.ficha=validar(salvo.ficha);
    assert.equal(opcoesDisponiveis(salvo).find(o=>o.id===antes.id).automacao.bonus,antes.automacao.bonus+1);
    luva.equipado=false;assert.deepEqual(opcoesDisponiveis(a).find(o=>o.id===antes.id).automacao,antes.automacao,id);
  }
});

test('Luva de Boxeador: soco, Torrente e Mão de Dolo recebem o bônus de golpe, cura preservada',async()=>{
  const {avaliarFormula}=await import('./site/engine.mjs');
  for(const critico of [false,true]){
    let {s,a,b}=await duelo('loteria');b.pv=200;b.ficha.pvMaximos=200;
    a.ficha.inventario.itens.push(luvaBoxeador());a.pv=10;
    const torrente=opcoesDisponiveis(a).find(o=>/^Torrente/.test(o.nome)),metas=[];
    assert.equal(torrente.automacao.bonus,6);assert.equal(torrente.automacao.dano,'1d6+4');assert.ok(torrente.nome.includes('+6'));
    for(const modo of torrente.composicao.modos){
      if(modo.tipo==='ataque'){assert.equal(modo.automacao.bonus,6);assert.equal(modo.automacao.dano,'1d6+4');}
      else assert.equal(modo.automacao.formula,'1d6+1');
    }
    const rolar=async(f,m)=>{metas.push({f,m});return avaliarFormula(f,l=>l===20?(critico?20:15):3);};
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:torrente.id,composicao:[{modoId:'soco-normal',alvoId:b.id},{modoId:'mao-de-cura',alvoId:a.id}]},player,rolar);
    assert.equal(s.atores[1].pv,200-(critico?10:7));assert.equal(s.atores[0].pv,14);
    assert.equal(s.atores[0].rec['pontos-de-foco'],a.rec['pontos-de-foco']-1);
    assert.equal(metas.find(x=>x.m.tipo==='ataque').f,'1d20+6');
    assert.equal(metas.find(x=>x.m.tipo==='dano').f,critico?'2d6+4':'1d6+4');
  }
});

test('Luva de Boxeador: ataques de oportunidade desarmados também usam os bônus',async()=>{
  const {avaliarFormula}=await import('./site/engine.mjs');let {s,a,b}=await duelo('loteria');
  a.ficha.inventario.itens.push(luvaBoxeador());
  const soco=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/i.test(o.nome)),metas=[];s.vez=1;
  s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:b.id,x:4,y:0},gm,dadoLocal);
  assert.equal(s.reacaoPendente?.reator,a.id);
  const reacao=s.reacaoPendente.opcoes[0];
  s=await aplicar(s,{rev:s.rev,tipo:'resolverReacao',ator:a.id,opcao:reacao,ataqueId:soco.id},player,async(f,m)=>{metas.push({f,m});return avaliarFormula(f,l=>l===20?15:3);});
  assert.equal(metas.find(x=>x.m.tipo==='ataque').f,'1d20+6');assert.equal(metas.find(x=>x.m.tipo==='dano').f,'1d6+4');assert.equal(s.atores[0].reacao,0);
});


test('Luvas do Dragão Ascendente +2: acerto e CA sem armadura; fogo preservado mesmo com armadura',async()=>{
  const {avaliarFormula}=await import('./site/engine.mjs');
  for(const escudo of [false,true]){
    let {s,a,b}=await duelo('loteria');b.pv=200;b.ficha.pvMaximos=200;
    const socoAntes=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/i.test(o.nome)),caAntes=caAtual(a),luva=itemDeMissao({id:'dragao-teste',ref:'item.la-arte.luvas-dragao-ascendente-mais-2',equipado:true,equipadoSlot:'acessorio_1'});
    assert.equal(luva.preco.valor,1400);a.ficha.inventario.itens.push(luva);
    if(escudo)a.ficha.inventario.itens.push(itemDeMissao({id:'escudo-dragao',ref:'item.escudo',equipado:true,equipadoSlot:'mao_fraca'}));
    const depois=opcoesDisponiveis(a).find(o=>o.id===socoAntes.id);
    assert.equal(depois.automacao.bonus,socoAntes.automacao.bonus+(escudo?0:1));assert.equal(depois.automacao.dano,socoAntes.automacao.dano);
    const caComLuva=caAtual(a);luva.equipado=false;const caSemLuva=caAtual(a);luva.equipado=true;
    assert.equal(caComLuva-caSemLuva,escudo?0:1);if(!escudo)assert.equal(caComLuva,caAntes+1);
    const metas=[];
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:depois.id,composicao:[{modoId:'golpe-normal',alvoId:b.id}]},player,async(f,m)=>{
      metas.push(m);const base=avaliarFormula(f,l=>l===20?15:3),extras=(m.adicionais??[]).filter(x=>x.automatico),resultados=[base,...extras.map(e=>avaliarFormula(e.formula,()=>3))];
      return {...base,total:resultados.reduce((n,r)=>n+r.total,0),resultados,recursosAtivos:extras.map(e=>e.id)};
    });
    const fogo=metas.find(m=>m.tipo==='dano').adicionais.find(e=>e.nome==='Luvas do Dragão Ascendente +2');
    assert.equal(fogo.formula,'1d4');assert.equal(fogo.elemento,'fogo');assert.equal(fogo.automatico,true);
    assert.equal(s.atores[1].pv,191);
  }
});

test('revisão 0.8.35: faces mínimas entram no total exibido uma única vez e preservam os adicionais',async()=>{
  const {ajustarFacesMinimasRolagem}=await import('./site/engine.mjs');
  const fonte={nome:'Combate com Armas Grandes',facesMinimasDano:{minimo:3}};
  const r={total:11,grupos:[{diceType:'d6',dice:[{value:1},{value:2}]},{diceType:'d8',dice:[{value:5}]}],mapaGrupos:[0,1],resultados:[{total:6},{total:5}]};
  assert.equal(ajustarFacesMinimasRolagem(r,fonte),3);assert.equal(r.total,14);assert.equal(r.resultados[0].total,9);assert.equal(r.resultados[1].total,5);
  assert.match(r.resultados[0].resumo,/= 9$/);
  ajustarFacesMinimasRolagem(r,fonte);assert.equal(r.total,14);assert.equal(r.resultados[0].total,9);
  const um={total:9,faces:[1,5]},dois={total:10,faces:[3,4]};
  ajustarFacesMinimasRolagem(um,fonte);ajustarFacesMinimasRolagem(dois,fonte);
  assert.equal(um.total,11);assert.equal(dois.total,10,'Atacante Selvagem compara os resultados já ajustados');
});


test('revisão 0.8.35: reação preventiva mantém Combate com Armas Grandes no resultado',async()=>{
  let {s,a,b}=await duelo('draven-thorne','loteria');b.pv=200;b.ficha.pvMaximos=200;
  const arma=opcoesDisponiveis(a).find(o=>/espada grande/i.test(o.nome)&&o.automacao?.tipo==='ataque');
  const rolar=async(f,m)=>m.tipo==='ataque'?{total:25,natural:15,formula:f}:{total:6,faces:[1,2],formula:f};
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:arma.id,alvo:b.id},player,rolar);
  assert.equal(s.reacaoPendente?.gatilho,'ser_atingido');
  s=await aplicar(s,{rev:s.rev,tipo:'resolverReacao',ator:b.id,opcao:null,confirmado:true},gm,rolar);
  assert.equal(s.atores[1].pv,191);
});
